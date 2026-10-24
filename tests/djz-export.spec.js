import {test,expect} from '@playwright/test';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import {sevenZipCoders} from './fixtures/sevenzip.js';

const title='MIXDESK 互通验证 & "六模式"';
async function ready(page){await page.goto('/');await expect(page.locator('#sampler-status')).toContainText('已就绪');}
async function exportPack(page,name=title){
  await page.locator('#sample-djz-export').click();await page.locator('#sample-export-name').fill(name);
  const pending=page.waitForEvent('download');await page.locator('#sample-export-submit').click();
  const download=await pending;await expect(page.locator('#sample-export-status')).toContainText('已导出');return download.path();
}
function archiveFile(path,name){return execFileSync('bsdtar',['-xOf',path,name],{maxBuffer:35*1024**2});}

test('DJZ is readable by libarchive and preserves six modes, holes and real cropped stereo PCM',async({page})=>{
  await ready(page);
  const indices=[0,2,4,7,10,15],frequencies=[220,330,440,550,660,880];
  await page.evaluate(({indices,frequencies})=>{
    const s=window.__mixdesk.engine.sampler,b=s.decks[2],r=48000,modes=['loop','oneshot','hold','hold-oneshot','toggle-loop','toggle-oneshot'];
    for(let i=0;i<16;i++)b.reset(i);
    indices.forEach((idx,j)=>{const a=s.context.createBuffer(2,r*1.25,r);for(let c=0;c<2;c++)for(let i=0;i<a.length;i++)a.getChannelData(c)[i]=.4*Math.sin(2*Math.PI*(frequencies[j]+c*110)*i/r);b.load(idx,a,'同名 & "测试" <音频> 🎧',null,{mode:modes[j],gain:.5,start:.25,end:1,bpm:120});});
    b.configureGlobal({volume:.3,groupVolumes:[.1,.2,.3,.4],quantize:true,beats:4,defaultMode:'hold-oneshot'});
  },{indices,frequencies});
  await page.locator('#sampler-deck').selectOption('2');
  const path=await exportPack(page),bytes=await readFile(path);
  expect(bytes.subarray(0,6).toString('hex')).toBe('377abcaf271c');
  expect(sevenZipCoders(bytes)).toEqual(Array.from({length:7},()=>['040202']));
  const names=execFileSync('bsdtar',['-tf',path],{encoding:'utf8'}).trim().split('\n');
  expect(names.sort()).toEqual(['default.djs',...indices.map(i=>`sample-${Math.floor(i/4)+1}-${i%4+1}.wav`)].sort());
  const xml=archiveFile(path,'default.djs').toString('utf8');
  const info=await page.evaluate(xml=>{const doc=new DOMParser().parseFromString(xml,'application/xml'),root=doc.documentElement;return {error:!!doc.querySelector('parsererror'),root:root.tagName,title:root.getAttribute('title'),quant:root.getAttribute('quant'),enabled:root.getAttribute('quant-enabled'),mode:root.getAttribute('defaultSampleType'),bpm:root.getAttribute('bpm'),groups:[...root.children].map(g=>({idx:g.getAttribute('idx'),samples:[...g.children].map(n=>Object.fromEntries([...n.attributes].map(a=>[a.name,a.value])))}))};},xml);
  expect(info).toMatchObject({error:false,root:'pack',title,quant:'4',enabled:'1',mode:'3',bpm:'120'});
  const samples=info.groups.flatMap(g=>g.samples.map(s=>({...s,group:Number(g.idx)})));
  expect(samples.map(s=>s.group*4+Number(s.idx))).toEqual(indices);
  for(const [j,sample] of samples.entries()){
    expect(sample).toMatchObject({title:'同名 & "测试" <音频> 🎧',type:String(j),bpm:'120',length:'0.75'});
    const wav=archiveFile(path,sample.file);
    expect(wav.toString('ascii',0,4)).toBe('RIFF');expect(wav.readUInt16LE(20)).toBe(1);expect(wav.readUInt16LE(22)).toBe(2);expect(wav.readUInt32LE(24)).toBe(48000);expect(wav.readUInt16LE(34)).toBe(16);expect(wav.readUInt32LE(40)).toBe(36000*4);
    for(let i=0;i<36000;i+=101)for(let c=0;c<2;c++){const actual=wav.readInt16LE(44+(i*2+c)*2)/32768,expected=.2*Math.sin(2*Math.PI*(frequencies[j]+c*110)*(i+12000)/48000);expect(Math.abs(actual-expected)).toBeLessThan(.00004);}
  }
  await page.locator('#sample-export-close').click();await page.locator('#sampler-deck').selectOption('3');
  await page.locator('#sample-djs-file').setInputFiles({name:'Exported.djz',mimeType:'application/octet-stream',buffer:bytes});await expect(page.locator('#sampler-status')).toHaveText('采样已保存到本机');
  await page.reload();await expect(page.locator('#sampler-status')).toContainText('已就绪');
  const restored=await page.evaluate(()=>window.__mixdesk.engine.sampler.decks[3].slots.flatMap((s,i)=>s.buffer?[{i,mode:s.mode,duration:s.buffer.duration}]:[]));
  expect(restored.map(s=>s.i)).toEqual(indices);restored.forEach((s,j)=>{expect(s.mode).toBe(['loop','oneshot','hold','hold-oneshot','toggle-loop','toggle-oneshot'][j]);expect(s.duration).toBeCloseTo(.75,5);});
  await mkdir('research/evidence/djz',{recursive:true});await writeFile('research/evidence/djz/MIXDESK-interop-0.8.3.djz',bytes);await writeFile('research/evidence/djz/default-0.8.3.djs',xml);
});

test('empty decks export four groups, quantize off and no invented audio',async({page})=>{
  await ready(page);await page.evaluate(()=>{const s=window.__mixdesk.engine.sampler;for(let i=0;i<16;i++)s.decks[0].reset(i);s.configureGlobal({quantize:false,beats:.5,defaultMode:'toggle-oneshot'});});
  const path=await exportPack(page,'Empty');
  expect(execFileSync('bsdtar',['-tf',path],{encoding:'utf8'}).trim()).toBe('default.djs');
  const xml=archiveFile(path,'default.djs').toString();expect(xml.match(/<sampler /g)).toHaveLength(4);expect(xml).not.toContain('<sample ');expect(xml).toContain('quant-enabled="0"');expect(xml).toContain('quant="0.5"');expect(xml).toContain('defaultSampleType="5"');
});

test('export reports clipping, preserves the source and rejects unsupported channels',async({page})=>{
  await ready(page);await page.evaluate(()=>{const s=window.__mixdesk.engine.sampler;for(let i=0;i<16;i++)s.bank.reset(i);const b=s.context.createBuffer(1,480,48000);b.getChannelData(0).fill(.75);s.load(0,b,'Loud',null,{gain:2});});
  const path=await exportPack(page,'Loud');await expect(page.locator('#sample-export-status')).toContainText('480 个超限采样值');
  const wav=archiveFile(path,'sample-1-1.wav');expect(wav.readInt16LE(44)).toBe(32767);
  expect(await page.evaluate(()=>window.__mixdesk.engine.sampler.slots[0].buffer.getChannelData(0)[0])).toBe(.75);
  await page.locator('#sample-export-close').click();
  await page.evaluate(()=>{const s=window.__mixdesk.engine.sampler,b=s.context.createBuffer(3,480,48000);s.load(0,b,'Three channels');});
  await page.locator('#sample-djz-export').click();await page.locator('#sample-export-submit').click();await expect(page.locator('#sample-export-status')).toContainText('单声道或双声道');await expect(page.locator('#sample-export-submit')).toBeEnabled();
});

test('export can cancel a loading compressor and recover for another download',async({page})=>{
  await ready(page);let blocked;const wait=new Promise(resolve=>blocked=resolve);let release;const gate=new Promise(resolve=>release=resolve);
  await page.route(/7zz.*\.wasm/,async route=>{blocked();await gate;try{await route.continue();}catch{}});
  await page.locator('#sample-djz-export').click();await page.locator('#sample-export-submit').click();await wait;
  await page.locator('#sample-export-cancel').click();await expect(page.locator('#sample-export-dialog')).not.toBeVisible();await expect(page.locator('#sampler-status')).toHaveText('已取消导出');
  release();await page.unroute(/7zz.*\.wasm/);await exportPack(page,'Retry');
});

test('export works on mobile with local assets only',async({page})=>{
  await page.setViewportSize({width:390,height:844});const errors=[],remote=[];page.on('pageerror',e=>errors.push(e.message));page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith('http://127.0.0.1:5173/'))remote.push(r.url());});
  await ready(page);await page.locator('#sample-djz-export').click();await expect(page.locator('#sample-export-name')).toBeVisible();await expect(page.locator('#sample-export-submit')).toBeInViewport();
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.locator('#sample-export-close').click();await exportPack(page,'Mobile');expect(errors).toEqual([]);expect(remote).toEqual([]);
});

test('DJS pack tempo survives reload and MXPACK, and can be changed for the exported DJZ',async({page})=>{
  await ready(page);
  const xml='<pack title="Tempo" bpm="137.5" quant="1"><sampler idx="0"/><sampler idx="1"/><sampler idx="2"/><sampler idx="3"/></pack>';
  await page.locator('#sample-djs-file').setInputFiles({name:'tempo.djs',mimeType:'application/xml',buffer:Buffer.from(xml)});await expect(page.locator('#sampler-status')).toHaveText('采样已保存到本机');
  await page.reload();await expect(page.locator('#sampler-status')).toContainText('已就绪');
  const packed=page.waitForEvent('download');await page.locator('#sample-pack-export').click();const backup=await readFile(await (await packed).path());
  await page.locator('#sample-djs-file').setInputFiles({name:'other.djs',mimeType:'application/xml',buffer:Buffer.from(xml.replace('137.5','110'))});await expect(page.locator('#sampler-status')).toHaveText('采样已保存到本机');
  await page.locator('#sample-pack-file').setInputFiles({name:'restore.mxpack',mimeType:'application/octet-stream',buffer:backup});await expect(page.locator('#sampler-status')).toHaveText('采样已保存到本机');
  await page.locator('#sample-djz-export').click();await expect(page.locator('#sample-export-bpm')).toHaveValue('137.5');
  await page.locator('#sample-export-bpm').fill('142.25');const pending=page.waitForEvent('download');await page.locator('#sample-export-submit').click();const path=await (await pending).path();
  expect(archiveFile(path,'default.djs').toString()).toContain('bpm="142.25"');
  const errors=await page.evaluate(async()=>{const {exportDjucedSamplePack}=await import('/src/sample-pack.js'),s=window.__mixdesk.engine.sampler,errors=[];for(const bpm of [NaN,Infinity,0,29.9,300.1])try{await exportDjucedSamplePack(s,{bpm});}catch(e){errors.push(e.message);}return errors;});expect(errors).toEqual(Array(5).fill('采样包 BPM 应为 30–300'));
});
