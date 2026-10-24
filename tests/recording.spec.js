import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
async function ready(page){await page.goto('/');await expect(page.locator('[data-deck="0"] .track-title')).toHaveText('Night Drive');}
async function selectFormat(page,format){await page.locator('#record-settings').click();await page.locator('#record-format').selectOption(format);await page.locator('#record-close').click();}
async function finish(page){const pending=page.waitForEvent('download');await page.locator('#record').click();const file=await pending;return {file,bytes:await readFile(await file.path())};}
function wav(bytes,depth){expect(bytes.toString('ascii',0,4)).toBe('RIFF');expect(bytes.toString('ascii',8,12)).toBe('WAVE');expect(bytes.readUInt32LE(4)).toBe(bytes.length-8);expect(bytes.readUInt16LE(20)).toBe(1);expect(bytes.readUInt16LE(22)).toBe(2);expect(bytes.readUInt16LE(34)).toBe(depth);expect(bytes.readUInt32LE(40)).toBe(bytes.length-44);}

for(const depth of [16,24]) test('native '+depth+' bit WAV captures actual stereo PCM and persists for re-export',async({page})=>{
  await ready(page);await selectFormat(page,'wav'+depth);
  // Known distinct stereo channels, exercising packing, sign and channel order.
  await page.evaluate(async()=>{
    const e=window.__mixdesk.engine;await e.context.resume();
    const buffer=e.context.createBuffer(2,e.context.sampleRate*4,e.context.sampleRate);
    buffer.getChannelData(0).fill(.125);buffer.getChannelData(1).fill(-.25);
    const source=e.context.createBufferSource();source.buffer=buffer;source.loop=true;source.connect(e.analyser);source.start();window.testPCMSource=source;
  });
  await page.locator('#record').click();await expect(page.locator('#record')).toHaveClass(/recording/);
  await expect.poll(()=>page.evaluate(()=>window.__mixdesk.recording.recorder?.session?.frames||0)).toBeGreaterThan(20000);
  const {file,bytes}=await finish(page);expect(file.suggestedFilename()).toMatch(/\.wav$/);wav(bytes,depth);
  const sampleBytes=depth/8,frameBytes=sampleBytes*2,frames=(bytes.length-44)/frameBytes;
  expect(frames).toBeGreaterThan(20000);
  const offset=44+Math.floor(frames/2)*frameBytes;
  if(depth===16){expect(bytes.readInt16LE(offset)).toBe(4096);expect(bytes.readInt16LE(offset+2)).toBe(-8192);}
  else{expect(bytes.readIntLE(offset,3)).toBe(1048576);expect(bytes.readIntLE(offset+3,3)).toBe(-2097152);}
  await page.evaluate(()=>window.testPCMSource.stop());
  await page.reload();await page.locator('#record-settings').click();await expect(page.locator('#record-format')).toHaveValue('wav'+depth);await expect(page.locator('#recording-list article')).toHaveCount(1);await expect(page.locator('#recording-list')).toContainText('已完成');
  const pending=page.waitForEvent('download');await page.locator('[data-record-export]').click();const second=await pending;expect((await readFile(await second.path())).equals(bytes)).toBe(true);
  await page.locator('[data-record-delete]').click();await expect(page.locator('#recording-list article')).toHaveCount(0);
});

test('WAV records real master mix and samples while PFL-only playback stays silent',async({page})=>{
  await ready(page);await selectFormat(page,'wav24');
  await page.evaluate(async()=>{const e=window.__mixdesk.engine;const d=e.decks[0];d.setVolume(0);e.monitor.select(0,true);await d.play();});
  await page.waitForTimeout(150);await page.locator('#record').click();await expect(page.locator('#record')).toHaveClass(/recording/);await page.waitForTimeout(650);
  const silent=await finish(page);wav(silent.bytes,24);
  let peak=0;for(let i=44;i<silent.bytes.length;i+=3)peak=Math.max(peak,Math.abs(silent.bytes.readIntLE(i,3)));expect(peak).toBeLessThan(20);
  await page.evaluate(()=>{const e=window.__mixdesk.engine;e.decks[0].setVolume(.8);});
  await page.locator('#record').click();await expect(page.locator('#record')).toHaveClass(/recording/);
  await page.getByRole('button',{name:'播放采样 1',exact:true}).click();await page.waitForTimeout(750);
  const mixed=await finish(page);wav(mixed.bytes,24);let sum=0;for(let i=44;i<mixed.bytes.length;i+=3)sum+=(mixed.bytes.readIntLE(i,3)/8388608)**2;expect(Math.sqrt(sum/((mixed.bytes.length-44)/3))).toBeGreaterThan(.005);
  await expect.poll(()=>page.evaluate(()=>window.__mixdesk.recording.recorder)).toBeNull();
});

test('native WAV can be encoded to a real MP3 download', async ({ page }) => {
  await ready(page); await selectFormat(page, 'wav16'); await page.getByRole('button', { name: '播放 A', exact: true }).click(); await page.locator('#record').click();
  await page.waitForTimeout(700); const pending = page.waitForEvent('download'); await page.locator('#record').click(); await pending;
  const mp3Download = page.waitForEvent('download'); await page.locator('#export-mp3').click(); const mp3 = await mp3Download; const bytes = await readFile(await mp3.path());
  expect(mp3.suggestedFilename()).toMatch(/\.mp3$/); expect(bytes.length).toBeGreaterThan(1000); expect(bytes[0]).toBe(0xff); expect((bytes[1] & 0xe0)).toBe(0xe0);
  const duration = await page.evaluate(async data => (await window.__mixdesk.engine.context.decodeAudioData(new Uint8Array(data).buffer)).duration, [...bytes]);
  expect(duration).toBeGreaterThan(.3);
});

test('interrupted WAV recording recovers committed chunks after a page reload',async({page})=>{
  await ready(page);await selectFormat(page,'wav16');await page.getByRole('button',{name:'播放 A',exact:true}).click();await page.locator('#record').click();
  await expect.poll(()=>page.evaluate(()=>window.__mixdesk.recording.recorder?.session?.chunkCount||0)).toBeGreaterThan(1);
  page.once('dialog',dialog=>dialog.accept());await page.reload();await page.locator('#record-settings').click();
  await expect(page.locator('#recording-list article')).toHaveCount(1);await expect(page.locator('#recording-list')).toContainText('未结束');
  const pending=page.waitForEvent('download');await page.locator('[data-record-export]').click();const bytes=await readFile(await(await pending).path());wav(bytes,16);expect(bytes.length).toBeGreaterThanOrEqual(44+32768*4);
});

test('processor clamps PCM, counts clipped samples, flushes partial chunks and enforces frame limit',async()=>{
  const source=await readFile('src/pcm-worklet.js','utf8');let Processor;
  const messages=[];
  class Base{constructor(){this.port={postMessage:data=>messages.push(data)};}}
  vm.runInNewContext(source,{AudioWorkletProcessor:Base,registerProcessor:(name,klass)=>{Processor=klass;},ArrayBuffer,DataView,Number,Math});
  const p=new Processor({processorOptions:{bitDepth:24,maxFrames:5}});
  expect(p.process([[Float32Array.from([2,-2,NaN,.5,0,1]),Float32Array.from([-.25,.25,.75,-.5,0,0])]],[[new Float32Array(6),new Float32Array(6)]])).toBe(false);
  const chunk=messages.find(m=>m.type==='chunk'),stop=messages.find(m=>m.type==='stopped'),bytes=Buffer.from(chunk.bytes);
  expect(chunk.frames).toBe(5);expect(chunk.clipped).toBe(2);expect(chunk.peak).toBe(2);expect(chunk.bytes.byteLength).toBe(30);expect(bytes.readIntLE(0,3)).toBe(8388607);expect(bytes.readIntLE(6,3)).toBe(-8388608);expect(bytes.readIntLE(12,3)).toBe(0);expect(stop).toMatchObject({reason:'limit',frames:5});
  p.port.onmessage({data:{type:'stop'}});expect(messages.filter(m=>m.type==='stopped')).toHaveLength(1);
});

test('storage rejects out-of-order chunks atomically and keeps the last good export',async({page})=>{
  await ready(page);
  const result=await page.evaluate(async()=>{
    const store=await import('/src/recording-store.js');const {exportRecording}=await import('/src/pcm-recorder.js');const s={id:'ordering-test',createdAt:Date.now(),updatedAt:Date.now(),sampleRate:48000,channels:2,bitDepth:16,frames:0,bytes:0,chunkCount:0,clipped:0,peak:0,status:'recording'};
    await store.createRecording(s);await store.appendRecording(s.id,0,new ArrayBuffer(16),4,0,0);let error='';try{await store.appendRecording(s.id,2,new ArrayBuffer(16),4,0,0);}catch(e){error=e.message;}
    const blob=await exportRecording(s.id);const data=await store.recordingData(s.id);return{error,bytes:blob.size,frames:data.session.frames,count:data.session.chunkCount};
  });expect(result).toMatchObject({bytes:60,frames:4,count:1});expect(result.error).toContain('顺序异常');
});

test('processor failure stops capture and exposes already committed audio for recovery',async({page})=>{
  await ready(page);await selectFormat(page,'wav24');await page.getByRole('button',{name:'播放 A',exact:true}).click();await page.locator('#record').click();
  await expect.poll(()=>page.evaluate(()=>window.__mixdesk.recording.recorder?.session?.chunkCount||0)).toBeGreaterThan(1);
  await page.evaluate(()=>window.__mixdesk.recording.recorder.node.onprocessorerror());
  await expect(page.locator('#record')).not.toHaveClass(/recording/);await page.locator('#record-settings').click();await expect(page.locator('#recording-list')).toContainText('已停止');
  const pending=page.waitForEvent('download');await page.locator('[data-record-export]').click();const bytes=await readFile(await(await pending).path());wav(bytes,24);expect(bytes.length).toBeGreaterThan(10000);
});

test('recording settings fit a phone and lock format changes during capture',async({page})=>{
  await ready(page);await page.setViewportSize({width:390,height:844});expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await selectFormat(page,'wav16');await page.locator('#record').click();await expect(page.locator('#record')).toHaveClass(/recording/);await page.locator('#record-settings').click();await expect(page.locator('#record-format')).toBeDisabled();expect(await page.locator('#record-dialog').evaluate(d=>d.scrollWidth<=d.clientWidth)).toBe(true);
  await page.locator('#record-close').click();await finish(page);
});

test('storage failure stops recording and preserves previously committed chunks',async({page})=>{
  await ready(page);await selectFormat(page,'wav24');await page.getByRole('button',{name:'播放 A',exact:true}).click();await page.locator('#record').click();
  await expect.poll(()=>page.evaluate(()=>window.__mixdesk.recording.recorder?.session?.chunkCount||0)).toBeGreaterThan(1);
  await page.evaluate(()=>{
    window.recordStoreAdd=IDBObjectStore.prototype.add;
    IDBObjectStore.prototype.add=function(value,...rest){if(this.name==='chunks')throw new DOMException('Simulated storage quota','QuotaExceededError');return window.recordStoreAdd.call(this,value,...rest);};
  });
  await expect(page.locator('#record')).not.toHaveClass(/recording/);await page.evaluate(()=>{IDBObjectStore.prototype.add=window.recordStoreAdd;});
  await page.locator('#record-settings').click();await expect(page.locator('#recording-list')).toContainText('已停止');await expect(page.locator('#record-live-status')).toContainText('写入失败');
  const pending=page.waitForEvent('download');await page.locator('[data-record-export]').click();const bytes=await readFile(await(await pending).path());wav(bytes,24);expect(bytes.length).toBeGreaterThan(10000);
});
