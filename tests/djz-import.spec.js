import {test,expect} from '@playwright/test';
import {nativeArchive,packFiles,packXml,tarArchive} from './fixtures/djz.js';
import SevenZip from '7z-wasm';
import {parseArchiveListing,guardExtraction} from '../src/djz-archive.js';

let good;
test.beforeAll(()=>{good=nativeArchive(packFiles());});
async function ready(page){await page.goto('/');await expect(page.locator('#sampler-status')).toContainText('已就绪');}
async function load(page,bytes=good){await page.locator('#sample-djs-file').setInputFiles({name:'Independent.djz',mimeType:'application/octet-stream',buffer:bytes});}
async function saved(page){await expect(page.locator('#sampler-status')).toHaveText('采样已保存到本机');}
async function playing(page){
  await page.locator('[data-sample="0"] .sample-mode').selectOption('loop');await saved(page);
  await page.locator('[data-sample="0"] .sample-trigger').click();
  await page.evaluate(()=>{const s=window.__mixdesk.engine.sampler;window.oldSlot=s.slots[0];window.oldVoice=s.slots[0].source;});
}
async function unchanged(page){
  expect(await page.evaluate(async()=>{const s=window.__mixdesk.engine.sampler,{setting}=await import('/src/storage.js');return {same:s.slots[0]===window.oldSlot,voice:s.slots[0].source===window.oldVoice,active:s.isActive(0),stored:(await setting('sampler:v4:deck:0:slot:0')).config.name};})).toMatchObject({same:true,voice:true,active:true,stored:'Kick'});
  await expect.poll(()=>page.evaluate(()=>{const a=window.__mixdesk.engine.analyser,v=new Float32Array(a.fftSize);a.getFloatTimeDomainData(v);return Math.sqrt(v.reduce((sum,x)=>sum+x*x,0)/v.length);})).toBeGreaterThan(.002);
}

test('single independent DJZ imports six modes, holes, nested paths, PCM and settings into only the selected deck',async({page})=>{
  await ready(page);await page.locator('#sampler-deck').selectOption('2');await load(page);await saved(page);
  const read=()=>page.evaluate(()=>{const s=window.__mixdesk.engine.sampler,b=s.decks[2];return {settings:b.settings,slots:b.slots.flatMap((slot,i)=>slot.buffer?[{i,mode:slot.mode,bpm:slot.bpm,sync:slot.sync,duration:slot.buffer.duration,rate:slot.buffer.sampleRate,pcm:Array.from(slot.buffer.getChannelData(0).slice(100,300))}]:[]),others:[0,1,3].map(i=>s.decks[i].slots[0].name)};});
  const initial=await read();expect(initial.settings).toMatchObject({packBpm:137.5,beats:4,quantize:true,defaultMode:'hold-oneshot',page:0});expect(initial.others).toEqual(['Kick','Kick','Kick']);
  expect(initial.slots.map(s=>s.i)).toEqual([0,2,4,7,10,15]);expect(initial.slots.map(s=>s.mode)).toEqual(['loop','oneshot','hold','hold-oneshot','toggle-loop','toggle-oneshot']);
  initial.slots.forEach((s,j)=>{expect(s.bpm).toBe(137.5);expect(s.duration).toBeCloseTo(.75,4);expect(s.sync).toBe(j%2===0);});
  expect(Math.max(...initial.slots[0].pcm.map(Math.abs))).toBeGreaterThan(.15);
  initial.slots[0].pcm.forEach((v,i)=>expect(Math.abs(v+initial.slots[1].pcm[i])).toBeLessThan(.00001));
  await page.reload();await expect(page.locator('#sampler-status')).toContainText('已就绪');expect(await read()).toEqual(initial);
});

test('bad archives leave the current voice and saved records intact',async({page})=>{
  await ready(page);await playing(page);
  const crc=Buffer.from(good);crc[40]^=0xff;
  const cases=[
    [Buffer.from('not an archive'),'损坏'],[crc,'解压失败'],
    [nativeArchive({'tone.wav':packFiles()['left/tone.wav']}),'缺少 default.djs'],
    [nativeArchive({'default.djs':packXml,'left/tone.wav':packFiles()['left/tone.wav']}),'right/tone.wav'],
    [nativeArchive(packFiles('<pack><sampler></pack>')),'XML 无效'],
    [nativeArchive({...packFiles(),'left/tone.wav':Buffer.from('broken audio')}),'无法解码'],
    [nativeArchive(packFiles(),{duplicate:'default.djs'}),'重复文件路径'],
    [nativeArchive({...packFiles(),'DEFAULT.DJS':packXml}),'重复文件路径'],
    [nativeArchive({...packFiles(),'line\nbreak.txt':'x'}),'未声明的文件路径'],
    [nativeArchive(packFiles(),{link:'linked.djs',format:'pax'}),'链接'],
    [nativeArchive({...packFiles(),'oversized.wav':Buffer.alloc(30*1024**2+1)}),'30 MB'],
    [nativeArchive({...packFiles(),'default.djs':'x'.repeat(1024**2+1)}),'1 MB'],
    [tarArchive({'default.djs':packXml,'../outside.wav':'bad'}),'无效文件路径'],
    [tarArchive({'default.djs':packXml,'/outside.wav':'bad'}),'无效文件路径'],
    [tarArchive({'default.djs':packXml,...Object.fromEntries(Array.from({length:256},(_,i)=>['empty'+i,'']))}),'文件数量'],
  ];
  for(const [bytes,message] of cases){await load(page,bytes);await expect(page.locator('#sampler-status')).toContainText(message);await unchanged(page);await expect(page.locator('#sample-import-cancel')).toBeHidden();await expect(page.locator('#sample-djs-import')).toBeEnabled();}
  await page.reload();await expect(page.locator('#sampler-status')).toContainText('已就绪');await expect(page.locator('[data-sample="0"] strong')).toHaveText('Kick');
});

test('actual extraction cannot exceed the preflight size manifest',async()=>{
  let lines=[];const z=await SevenZip({print:line=>lines.push(line),printErr:()=>{},stdin:()=>null});
  z.FS.writeFile('/input.djz',good);expect(z.callMain(['l','-slt','-ba','-bsp0','/input.djz'])).toBe(0);
  const entries=parseArchiveListing(lines.join('\n'));entries.find(e=>e.name==='left/tone.wav').size=8;
  z.FS.mkdir('/unpacked');guardExtraction(z.FS,entries);lines=[];
  expect(()=>z.callMain(['x','-y','-bsp0','-o/unpacked','/input.djz'])).toThrow('实际解压内容超出目录声明');
  expect(z.FS.stat('/unpacked/left/tone.wav').size).toBeLessThanOrEqual(8);
});

test('encrypted data and encrypted headers fail without a password prompt',async({page})=>{
  await ready(page);await playing(page);
  for(const headers of [false,true]){
    const z=await SevenZip({print:()=>{},printErr:()=>{},stdin:()=>null});z.FS.mkdir('/input');z.FS.chdir('/input');z.FS.writeFile('default.djs',packXml);
    expect(z.callMain(['a','-t7z','-psecret',...(headers?['-mhe=on']:[]),'/encrypted.djz','default.djs'])).toBe(0);
    await load(page,Buffer.from(z.FS.readFile('/encrypted.djz')));await expect(page.locator('#sampler-status')).toContainText('加密');await unchanged(page);
  }
});

test('cancel during worker load keeps playback and permits another import',async({page})=>{
  await ready(page);await playing(page);let blocked,release;const wait=new Promise(r=>blocked=r),gate=new Promise(r=>release=r);
  await page.route(/7zz.*\.wasm/,async route=>{blocked();await gate;try{await route.continue();}catch{}});
  try{await load(page);await wait;await expect(page.locator('#sampler-deck')).toBeDisabled();await unchanged(page);await page.locator('#sample-import-cancel').click();await expect(page.locator('#sampler-status')).toHaveText('已取消导入');await unchanged(page);}
  finally{release();await page.unroute(/7zz.*\.wasm/);}
  await load(page);await saved(page);
});

test('cancel during audio decode discards the late result and restores controls',async({page})=>{
  await ready(page);await playing(page);
  await page.evaluate(()=>{const e=window.__mixdesk.engine,decode=e.decode.bind(e);window.restoreDecode=()=>e.decode=decode;e.decode=async file=>{window.decodePending=true;await new Promise(r=>window.releaseDecode=r);return decode(file);};});
  await load(page);await expect.poll(()=>page.evaluate(()=>!!window.decodePending)).toBe(true);
  await page.locator('#sample-import-cancel').click();await expect(page.locator('#sampler-status')).toHaveText('已取消导入');await unchanged(page);
  await page.evaluate(()=>{window.restoreDecode();window.releaseDecode();});await load(page);await saved(page);
});

test('target deck is captured before asynchronous decode',async({page})=>{
  await ready(page);await page.locator('#sampler-deck').selectOption('1');
  await page.evaluate(()=>{const e=window.__mixdesk.engine,decode=e.decode.bind(e);e.decode=async file=>{e.decode=decode;window.decodePending=true;await new Promise(r=>window.releaseDecode=r);return decode(file);};});
  await load(page);await expect.poll(()=>page.evaluate(()=>!!window.decodePending)).toBe(true);
  await page.evaluate(()=>{window.__mixdesk.engine.sampler.selectDeck(3);window.releaseDecode();});await saved(page);
  expect(await page.evaluate(()=>window.__mixdesk.engine.sampler.decks.map(b=>b.slots[0].name))).toEqual(['Kick','样本 0','Kick','Kick']);
});

test('IDB abort after staging restores the original playing voice and persisted samples',async({page})=>{
  await ready(page);await playing(page);
  await page.evaluate(()=>{
    const s=window.__mixdesk.engine.sampler,transaction=IDBDatabase.prototype.transaction;
    IDBDatabase.prototype.transaction=function(...args){const tx=transaction.apply(this,args);if(args[0]==='settings'&&args[1]==='readwrite')window.importTx=tx;return tx;};
    const stage=s.stageReplacement.bind(s);s.stageReplacement=p=>{window.cancelDisabled=document.querySelector('#sample-import-cancel').disabled;const result=stage(p);s.stageReplacement=stage;window.importTx.abort();return result;};
  });
  await load(page);await expect(page.locator('#sampler-status')).toContainText('保存失败');await unchanged(page);expect(await page.evaluate(()=>window.cancelDisabled)).toBe(true);
  await page.reload();await expect(page.locator('#sampler-status')).toContainText('已就绪');await expect(page.locator('[data-sample="0"] strong')).toHaveText('Kick');await load(page);await saved(page);
});

test('mobile import uses only local assets and requires one archive at a time',async({page})=>{
  await page.setViewportSize({width:390,height:844});const errors=[],remote=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith('http://127.0.0.1:5173/'))remote.push(r.url());});
  await ready(page);await page.locator('#sample-djs-file').setInputFiles([{name:'one.djz',buffer:good},{name:'two.djz',buffer:good}]);await expect(page.locator('#sampler-status')).toContainText('单独选择一个');
  await load(page);await saved(page);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(errors).toEqual([]);expect(remote).toEqual([]);
});
