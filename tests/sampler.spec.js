import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {taggedWav} from './fixtures/audio.js';
import {decodeMix} from '../src/midi.js';
async function ready(page){await page.goto('/');await expect(page.locator('[data-deck="0"] .track-title')).toHaveText('Night Drive');await expect(page.locator('#sampler-status')).toContainText('已就绪');}
const button=(page,i=0)=>page.getByRole('button',{name:'播放采样 '+(i+1),exact:true});
const mode=(page,value)=>page.locator('[data-sample="0"] .sample-mode').selectOption(value);
const active=page=>page.evaluate(()=>!!window.__mixdesk.engine.sampler.slots[0].source);
const rms=page=>page.evaluate(()=>{const a=window.__mixdesk.engine.analyser,v=new Float32Array(a.fftSize);a.getFloatTimeDomainData(v);return Math.sqrt(v.reduce((s,x)=>s+x*x,0)/v.length);});
async function importSample(page){await page.locator('#sample-file').setInputFiles({name:'Sampler tone.wav',mimeType:'audio/wav',buffer:taggedWav({duration:3})});await expect(page.locator('[data-sample="0"] strong')).toHaveText('Sampler tone');await expect(page.locator('#sampler-status')).toHaveText('采样已保存到本机');}
async function edit(page,values){await page.getByRole('button',{name:'编辑采样 1',exact:true}).click();for(const[k,v]of Object.entries(values))await page.locator('#sample-'+k).fill(String(v));await page.locator('#sample-save').click();await expect(page.locator('#sample-dialog')).not.toBeVisible();}
function packBytes(manifest,payload=[]) {const body=Buffer.from(JSON.stringify(manifest)),header=Buffer.alloc(12);header.write('MXPACK01');header.writeUInt32LE(body.length,8);return Buffer.concat([header,body,...payload]);}
async function exportPack(page) {const pending=page.waitForEvent('download');await page.locator('#sample-pack-export').click();return readFile(await (await pending).path());}

test('custom sample audio, trim, gain, mode and global options persist across reload',async({page})=>{
  await ready(page);await importSample(page);await edit(page,{name:'My loop',start:.25,end:1.25,gain:35,bpm:110});await mode(page,'loop');await expect(page.locator('#sampler-status')).toHaveText('采样已保存到本机');
  await page.locator('#sampler-quantize').check();await page.locator('#sampler-target').selectOption('2');await page.locator('#sampler-beats').selectOption('4');await expect(page.locator('#sampler-status')).toHaveText('采样设置已保存到本机');
  await page.reload();await expect(page.locator('#sampler-status')).toContainText('已就绪');await expect(page.locator('[data-sample="0"] strong')).toHaveText('My loop');await expect(page.locator('[data-sample="0"] .sample-mode')).toHaveValue('loop');
  const data=await page.evaluate(()=>{const s=window.__mixdesk.engine.sampler;return{record:s.record(0),settings:s.settings};});
  expect(data.record.config).toMatchObject({name:'My loop',start:.25,end:1.25,gain:.35,bpm:110,mode:'loop'});expect(data.settings).toMatchObject({quantize:true,target:2,beats:4});
  await button(page).click();await expect.poll(()=>rms(page)).toBeGreaterThan(.01);await page.waitForTimeout(1200);expect(await active(page)).toBe(true);await page.getByRole('button',{name:'停止采样 1',exact:true}).click();await expect.poll(()=>rms(page)).toBeLessThan(.0001);
});

test('sample trim selects the audible region and enforces one-shot duration',async({page})=>{
  await ready(page);
  await page.evaluate(()=>{const e=window.__mixdesk.engine,b=e.context.createBuffer(1,e.context.sampleRate*2,e.context.sampleRate),v=b.getChannelData(0);for(let i=0;i<v.length;i++){const t=i/b.sampleRate;v[i]=.2*Math.sin(2*Math.PI*(t<1?440:880)*t);}e.sampler.load(0,b,'Two tones');e.sampler.configure(0,{start:1,end:1.6,mode:'oneshot'});const a=e.context.createAnalyser();a.fftSize=4096;e.sampler.output.connect(a);window.sampleAnalyser=a;});
  await button(page).click();await page.waitForTimeout(120);
  const frequency=await page.evaluate(()=>{const a=window.sampleAnalyser,v=new Float32Array(a.frequencyBinCount);a.getFloatFrequencyData(v);let p=1;for(let i=2;i<v.length;i++)if(v[i]>v[p])p=i;return p*window.__mixdesk.engine.context.sampleRate/a.fftSize;});expect(frequency).toBeGreaterThan(865);expect(frequency).toBeLessThan(895);
  await expect.poll(()=>active(page),{timeout:2000}).toBe(false);
});

test('hold mode releases outside, on blur and on key-up, without restarting after a click',async({page})=>{
  await ready(page);await importSample(page);await mode(page,'hold');await expect(page.locator('#sampler-status')).toHaveText('采样已保存到本机');
  const pad=button(page);await pad.scrollIntoViewIfNeeded();const box=await pad.boundingBox();
  await page.mouse.move(box.x+15,box.y+15);await page.mouse.down();await expect.poll(()=>rms(page)).toBeGreaterThan(.01);await page.mouse.move(5,5);await page.mouse.up();await expect.poll(()=>active(page)).toBe(false);
  await pad.focus();await page.keyboard.down('Space');await expect.poll(()=>active(page)).toBe(true);await page.keyboard.up('Space');await expect.poll(()=>active(page)).toBe(false);
  await pad.focus();await page.keyboard.down('Enter');await expect.poll(()=>active(page)).toBe(true);await page.evaluate(()=>window.dispatchEvent(new Event('blur')));await expect.poll(()=>active(page)).toBe(false);await page.keyboard.up('Enter');await page.waitForTimeout(150);expect(await active(page)).toBe(false);
});

test('MIDI hold handles releases, overlapping holds and disconnect cleanup',async({page})=>{
  expect(decodeMix([0x96,0x10,0])).toEqual({action:'sampleRelease',deck:0,index:0});expect(decodeMix([0x87,0x13,64])).toEqual({action:'sampleRelease',deck:1,index:3});
  await ready(page);await page.locator('#sampler-deck').selectOption('2');await mode(page,'hold');await expect(page.locator('#sampler-status')).toHaveText('采样已保存到本机');
  const state=await page.evaluate(async()=>{const{engine:e,onAction,midi}=window.__mixdesk,s=e.sampler;await onAction({action:'sample',deck:0,index:0});await s.press(0,'key:Space');await onAction({action:'sampleRelease',deck:0,index:0});const overlapped=!!s.slots[0].source;s.release(0,'key:Space');const released=!s.slots[0].source;await onAction({action:'sample',deck:0,index:0});await midi.disconnect();return{overlapped,released,disconnected:!s.slots[0].source,holds:s.slots[0].held.size};});expect(state).toEqual({overlapped:true,released:true,disconnected:true,holds:0});
});

test('quantized sampler starts at a real beat boundary with speed matching and cancellation',async({page})=>{
  await ready(page);await importSample(page);
  const result=await page.evaluate(async()=>{
    const e=window.__mixdesk.engine,s=e.sampler,d=e.decks[0];await e.context.resume();d.setVolume(0);await new Promise(resolve=>setTimeout(resolve,150));d.seek(.1);await d.play();s.configure(0,{bpm:80,sync:true,mode:'loop'});s.configureGlobal({quantize:true,target:0,beats:1});
    await s.trigger(0);const slot=s.slots[0],scheduled=slot.startedAt,phase=(d.offset+(scheduled-d.anchor)*d.rate-d.gridOffset)/(60/d.bpm);return{delay:scheduled-e.context.currentTime,phase,rate:slot.rate};
  });expect(result.delay).toBeGreaterThan(.25);expect(result.phase).toBeCloseTo(Math.round(result.phase),2);expect(result.rate).toBe(1.5);
  expect(await rms(page)).toBeLessThan(.0001);await expect.poll(()=>rms(page),{timeout:1500,intervals:[50]}).toBeGreaterThan(.01);
  await page.evaluate(async()=>{const s=window.__mixdesk.engine.sampler;s.stopAll();await s.press(0,'loop-click');s.stopAll();});await page.waitForTimeout(700);expect(await active(page)).toBe(false);expect(await rms(page)).toBeLessThan(.0001);
});

test('sampler Key Lock preserves pitch while synced playback changes speed',async({page})=>{
  await ready(page);
  await page.evaluate(async()=>{
    const e=window.__mixdesk.engine,s=e.sampler,d=e.decks[0],rate=e.context.sampleRate;
    const b=e.context.createBuffer(1,rate*5,rate),v=b.getChannelData(0);
    for(let i=0;i<v.length;i++)v[i]=.18*Math.sin(2*Math.PI*440*i/rate);
    s.load(0,b,'Key Lock tone');d.setRate(1.25);s.configure(0,{bpm:d.bpm,sync:true,keyLock:true,mode:'loop'});
    const a=e.context.createAnalyser();a.fftSize=8192;s.output.connect(a);window.samplePitchAnalyser=a;
    await s.trigger(0);
  });
  const frequency=()=>page.evaluate(()=>{const a=window.samplePitchAnalyser,v=new Float32Array(a.frequencyBinCount);a.getFloatFrequencyData(v);let p=1;for(let i=2;i<v.length;i++)if(v[i]>v[p])p=i;return p*window.__mixdesk.engine.context.sampleRate/a.fftSize;});
  await expect.poll(frequency,{timeout:7000}).toBeGreaterThan(430);expect(await frequency()).toBeLessThan(450);
  await page.evaluate(()=>window.__mixdesk.engine.sampler.stop(0));
});

test('active deck loop can be extracted into its assigned sampler bank',async({page})=>{
  await ready(page);
  await page.locator('[data-deck="0"] .loop-toggle').click();
  await page.locator('[data-deck="0"] .extract-slot').selectOption('2');
  await page.locator('[data-deck="0"] .extract-loop').click();
  await expect(page.locator('#sampler-status')).toHaveText('采样已保存到本机');
  await expect(page.locator('[data-sample="8"] strong')).toHaveText('A Loop');
  await expect.poll(()=>page.evaluate(()=>window.__mixdesk.engine.sampler.slots[8].mode)).toBe('loop');
});

test('release during pending audio resume prevents delayed held playback',async({page})=>{
  await ready(page);
  const state=await page.evaluate(async()=>{const e=window.__mixdesk.engine,s=e.sampler;s.configure(0,{mode:'hold'});const original=e.context.resume.bind(e.context);let resume;e.context.resume=()=>new Promise(r=>resume=r);const pending=s.press(0,'pointer:1');s.release(0,'pointer:1');resume();await pending;e.context.resume=original;return{source:!!s.slots[0].source,pending:s.slots[0].pending,held:s.slots[0].held.size};});expect(state).toEqual({source:false,pending:false,held:0});
});

test('sample packs round trip audio and edits atomically; damaged imports leave slots intact',async({page})=>{
  await ready(page);await importSample(page);await edit(page,{name:'Packed tone',start:.4,end:1.4,gain:75});await mode(page,'loop');await expect(page.locator('#sampler-status')).toHaveText('采样已保存到本机');
  const pending=page.waitForEvent('download');await page.locator('#sample-pack-export').click();const download=await pending,bytes=await readFile(await download.path());expect(bytes.toString('ascii',0,8)).toBe('MXPACK01');
  const manifest=JSON.parse(bytes.toString('utf8',12,12+bytes.readUInt32LE(8)));expect(manifest.decks[0].slots).toHaveLength(16);expect(manifest.decks[0].slots[0].config.name).toBe('Packed tone');
  await page.getByRole('button',{name:'编辑采样 1',exact:true}).click();await page.locator('#sample-reset').click();await expect(page.locator('[data-sample="0"] strong')).toHaveText('空样本');
  await page.locator('#sample-pack-file').setInputFiles({name:'roundtrip.mxpack',mimeType:'application/octet-stream',buffer:bytes});await expect(page.locator('[data-sample="0"] strong')).toHaveText('Packed tone');await expect(page.locator('#sampler-status')).toHaveText('采样已保存到本机');
  expect(await page.evaluate(async()=>{const s=window.__mixdesk.engine.sampler.slots[0];return{size:s.file.size,start:s.start,end:s.end,mode:s.mode};})).toMatchObject({size:taggedWav({duration:3}).length,start:.4,end:1.4,mode:'loop'});
  await page.locator('#sample-pack-file').setInputFiles({name:'broken.mxpack',mimeType:'application/octet-stream',buffer:bytes.subarray(0,bytes.length-100)});await expect(page.locator('#sampler-status')).toContainText('包范围');await expect(page.locator('[data-sample="0"] strong')).toHaveText('Packed tone');
  await page.reload();await expect(page.locator('#sampler-status')).toContainText('已就绪');await expect(page.locator('[data-sample="0"] strong')).toHaveText('Packed tone');await button(page).click();await expect.poll(()=>rms(page)).toBeGreaterThan(.01);
});

test('sample pack runtime failure rolls back both IndexedDB and active audio',async({page})=>{
  await ready(page);await importSample(page);await edit(page,{name:'Rollback source'});await mode(page,'loop');await expect(page.locator('#sampler-status')).toHaveText('采样已保存到本机');
  const bytes=await exportPack(page);await button(page).click();
  await page.evaluate(()=>{window.previousSample=window.__mixdesk.engine.sampler.slots[0];window.previousVoice=window.previousSample.source;});
  await page.evaluate(()=>{const s=window.__mixdesk.engine.sampler;s.stageReplacement=()=>{throw new Error('runtime replacement failed');};});
  const length=bytes.readUInt32LE(8),manifest=JSON.parse(bytes.toString('utf8',12,12+length));manifest.decks[0].settings.display=16;manifest.decks[0].slots[0].config.name='Incoming tone';const rebuilt=packBytes(manifest,[bytes.subarray(12+length)]);
  await page.locator('#sample-pack-file').setInputFiles({name:'runtime-fail.mxpack',mimeType:'application/octet-stream',buffer:rebuilt});
  await expect(page.locator('#sampler-status')).toContainText('runtime replacement failed');await expect(page.locator('[data-sample="0"] strong')).toHaveText('Rollback source');
  const restored=await page.evaluate(async()=>{const s=window.__mixdesk.engine.sampler,{setting}=await import('/src/storage.js');return{slot:s.slots[0]===window.previousSample,voice:s.slots[0].source===window.previousVoice,name:(await setting('sampler:v4:deck:0:slot:0')).config.name,display:s.settings.display};});
  expect(restored).toEqual({slot:true,voice:true,name:'Rollback source',display:8});await expect.poll(()=>rms(page)).toBeGreaterThan(.005);
  await page.reload();await expect(page.locator('#sampler-status')).toContainText('已就绪');await expect(page.locator('[data-sample="0"] strong')).toHaveText('Rollback source');
});

test('a transaction aborted after sampler staging restores the playing runtime and all stored records',async({page})=>{
  await ready(page);await importSample(page);await mode(page,'loop');await expect(page.locator('#sampler-status')).toHaveText('采样已保存到本机');const bytes=await exportPack(page);
  await button(page).click();
  await page.evaluate(()=>{
    const s=window.__mixdesk.engine.sampler;window.previousSample=s.slots[0];window.previousVoice=s.slots[0].source;
    const transaction=IDBDatabase.prototype.transaction;IDBDatabase.prototype.transaction=function(...args){const tx=transaction.apply(this,args);if(args[0]==='settings'&&args[1]==='readwrite')window.sampleTransaction=tx;return tx;};
    const stage=s.stageReplacement.bind(s);s.stageReplacement=prepared=>{const lifecycle=stage(prepared);if(!window.sampleAborted){window.sampleAborted=true;window.sampleTransaction.abort();}return lifecycle;};
  });
  await page.locator('#sample-pack-file').setInputFiles({name:'aborted.mxpack',buffer:bytes});await expect(page.locator('#sampler-status')).toContainText('保存失败');
  expect(await page.evaluate(async()=>{const s=window.__mixdesk.engine.sampler,{setting}=await import('/src/storage.js');return{slot:s.slots[0]===window.previousSample,voice:s.slots[0].source===window.previousVoice,name:(await setting('sampler:v4:deck:0:slot:1')).config.name};})).toEqual({slot:true,voice:true,name:'Clap'});await expect.poll(()=>rms(page)).toBeGreaterThan(.005);
});

test('invalid trim and failed persistence leave the previous sample usable',async({page})=>{
  await ready(page);await page.getByRole('button',{name:'编辑采样 1',exact:true}).click();await page.locator('#sample-start').fill('.3');await page.locator('#sample-end').fill('.2');await page.locator('#sample-save').click();await expect(page.locator('#sample-edit-error')).toContainText('范围');
  await page.locator('#sample-start').fill('0');await page.locator('#sample-end').fill('.5');await page.locator('#sample-name').fill('Failed edit');
  await page.evaluate(()=>{window.settingsPut=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(value,key){if(this.name==='settings'&&String(key).startsWith('sampler:'))throw new DOMException('Quota','QuotaExceededError');return window.settingsPut.call(this,value,key);};});
  await page.locator('#sample-save').click();await expect(page.locator('#sample-edit-error')).not.toHaveText('');await expect(page.locator('[data-sample="0"] strong')).toHaveText('Kick');await page.evaluate(()=>{IDBObjectStore.prototype.put=window.settingsPut;});await page.locator('#sample-edit-close').click();
  await button(page).click();await expect.poll(()=>rms(page)).toBeGreaterThan(.002);
});

test('sampler editor and controls fit a mobile viewport',async({page})=>{
  await ready(page);await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await page.getByRole('button',{name:'编辑采样 14',exact:true}).click();expect(await page.locator('#sample-dialog').evaluate(d=>d.scrollWidth<=d.clientWidth)).toBe(true);await expect(page.locator('#sample-save')).toBeVisible();
});

test('DJUCED XML sample packs import selected local WAV files and preserve loop metadata', async ({page})=>{
  await ready(page);
  const xml='<pack title="Test" bpm="128" quant="4" quant-enabled="1"><sampler idx="0"><sample idx="0" type="0" title="Imported loop" file="sounds/loop.wav" bpm="128"/></sampler><sampler idx="3"><sample idx="3" type="1" title="Imported shot" file="loop.wav"/></sampler></pack>';
  await page.locator('#sample-djs-file').setInputFiles([
    {name:'default.djs',mimeType:'application/xml',buffer:Buffer.from(xml)},
    {name:'loop.wav',mimeType:'audio/wav',buffer:taggedWav({duration:2})},
  ]);
  await expect(page.locator('#sampler-status')).toHaveText('采样已保存到本机');
  await expect(page.locator('[data-sample="0"] strong')).toHaveText('Imported loop');
  const state=()=>page.evaluate(()=>{const s=window.__mixdesk.engine.sampler;return {mode:s.slots[0].mode,bpm:s.slots[0].bpm,sync:s.slots[0].sync,start:s.slots[0].start,end:s.slots[0].end,duration:s.slots[0].buffer.duration,quantize:s.settings.quantize,beats:s.settings.beats,last:{name:s.slots[15].name,mode:s.slots[15].mode,bpm:s.slots[15].bpm,sync:s.slots[15].sync}};});
  const imported=await state();
  expect(imported).toEqual({mode:'loop',bpm:128,sync:true,start:0,end:2,duration:2,quantize:true,beats:4,last:{name:'Imported shot',mode:'oneshot',bpm:128,sync:false}});
  await button(page).click();await expect.poll(()=>rms(page)).toBeGreaterThan(.01);
  await page.waitForTimeout(2150);expect(await active(page)).toBe(true);
  await page.reload();await expect(page.locator('#sampler-status')).toContainText('已就绪');
  expect(await state()).toEqual(imported);
  await button(page).click();await expect.poll(()=>rms(page)).toBeGreaterThan(.01);
});

test('DJUCED pack failures preserve saved slots and active playback',async({page})=>{
  await ready(page);await importSample(page);await mode(page,'loop');
  await expect(page.locator('#sampler-status')).toHaveText('采样已保存到本机');
  await button(page).click();await expect.poll(()=>rms(page)).toBeGreaterThan(.01);
  const xml='<pack><sampler idx="0"><sample idx="0" type="1" title="New shot" file="good.wav"/><sample idx="1" type="0" title="New loop" file="bad.wav"/></sampler></pack>';
  const good={name:'good.wav',mimeType:'audio/wav',buffer:taggedWav({duration:1})};
  const cases=[
    {xml,files:[good],message:'未选择 DJUCED 采样音频：bad.wav'},
    {xml,files:[good,{name:'bad.wav',mimeType:'audio/wav',buffer:Buffer.from('broken WAV')}],message:'采样音频无法解码：bad.wav'},
    {xml,files:[good,{name:'bad.wav',mimeType:'audio/wav',buffer:taggedWav({duration:31})}],message:'采样音频请控制在 30 秒内：bad.wav'},
    {xml:'<pack><sampler></pack>',files:[],message:'DJUCED 采样包 XML 无效'},
  ];
  for(const entry of cases){
    await page.locator('#sample-djs-file').setInputFiles([{name:'default.djs',mimeType:'application/xml',buffer:Buffer.from(entry.xml)},...entry.files]);
    await expect(page.locator('#sampler-status')).toHaveText(entry.message);
    await expect(page.locator('[data-sample="0"] strong')).toHaveText('Sampler tone');
    expect(await active(page)).toBe(true);await expect.poll(()=>rms(page)).toBeGreaterThan(.01);
  }
  await page.reload();await expect(page.locator('#sampler-status')).toContainText('已就绪');
  await expect(page.locator('[data-sample="0"] strong')).toHaveText('Sampler tone');
  await expect(page.locator('[data-sample="0"] .sample-mode')).toHaveValue('loop');
});
