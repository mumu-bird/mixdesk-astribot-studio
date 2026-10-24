import {test,expect} from '@playwright/test';
import {readFile} from 'node:fs/promises';
import {taggedWav} from './fixtures/audio.js';
async function ready(page){await page.goto('/');await expect(page.locator('#sampler-status')).toContainText('已就绪');}
async function saved(page){await expect(page.locator('#sampler-status')).toHaveText('采样已保存到本机');}
function packBytes(manifest,payload=[]){const body=Buffer.from(JSON.stringify(manifest)),header=Buffer.alloc(12);header.write('MXPACK01');header.writeUInt32LE(body.length,8);return Buffer.concat([header,body,...payload]);}
async function exportPack(page){const pending=page.waitForEvent('download');await page.locator('#sample-pack-export').click();return readFile(await (await pending).path());}

test('group pagination follows every group and each deck remembers its own settings',async({page})=>{
  await ready(page);
  const visible=()=>page.locator('.sample-slot:visible').evaluateAll(elements=>elements.map(el=>Number(el.dataset.sample)));
  await expect.poll(visible).toEqual([0,1,4,5,8,9,12,13]);
  await page.locator('#sampler-next').click();await expect.poll(visible).toEqual([2,3,6,7,10,11,14,15]);
  await page.locator('#sampler-display').selectOption('4');await expect.poll(visible).toEqual([1,5,9,13]);
  await page.locator('#sampler-deck').selectOption('2');await expect.poll(visible).toEqual([0,1,4,5,8,9,12,13]);
  await page.locator('#sampler-display').selectOption('16');await expect.poll(visible).toHaveLength(16);
  await page.locator('#sampler-deck').selectOption('0');await expect.poll(visible).toEqual([1,5,9,13]);
  for(let i=0;i<4;i++)await page.evaluate(()=>window.__mixdesk.onAction({action:'nextSamplerPage',deck:0}));
  await expect.poll(visible).toEqual([1,5,9,13]);
  await page.reload();await expect(page.locator('#sampler-status')).toContainText('已就绪');await expect.poll(visible).toEqual([1,5,9,13]);
  await page.locator('#sampler-deck').selectOption('2');await expect.poll(visible).toHaveLength(16);
});

test('three-page sampler layout follows DJUCED integer page visibility and persists',async({page})=>{
  await ready(page);
  const visible=()=>page.locator('.sample-slot:visible').evaluateAll(elements=>elements.map(el=>Number(el.dataset.sample)));
  await page.locator('#sampler-display').selectOption('3');
  await expect.poll(visible).toEqual([0,4,8,12]);
  await page.locator('#sampler-next').click();
  await expect.poll(visible).toEqual([1,5,9,13]);
  await page.locator('#sampler-next').click();
  await expect.poll(visible).toEqual([2,6,10,14]);
  await expect(page.locator('#sampler-page')).toHaveText('3 / 3');
  await expect(page.locator('#sampler-next')).toBeDisabled();
  await page.reload();
  await expect(page.locator('#sampler-status')).toContainText('已就绪');
  await expect.poll(visible).toEqual([2,6,10,14]);
});

test('four groups mix actual audio while selecting a sibling replaces only its group',async({page})=>{
  await ready(page);
  const result=await page.evaluate(async()=>{
    const {Sampler}=await import('/src/sampler.js'),r=48000,c=new OfflineAudioContext(1,r,r);c.resume=async()=>{};
    const s=new Sampler({context:c,master:c.destination,decks:[]}),frequencies=[330,440,660,880],gains=[1,.5,.25,.75];
    for(let g=0;g<4;g++){const b=c.createBuffer(1,r,r),v=b.getChannelData(0);for(let i=0;i<r;i++)v[i]=.1*Math.sin(2*Math.PI*frequencies[g]*i/r);s.load(g*4,b,'Group '+g,null,{mode:'loop'});}
    const discarded=c.createBuffer(1,r,r);for(let i=0;i<r;i++)discarded.getChannelData(0)[i]=.1*Math.sin(2*Math.PI*220*i/r);s.load(1,discarded,'Replaced',null,{mode:'loop'});
    s.configureGlobal({volume:1,groupVolumes:gains});await s.trigger(1);for(let g=0;g<4;g++)await s.trigger(g*4);
    const sources=s.slots.map(v=>!!v.source),audio=(await c.startRendering()).getChannelData(0);
    const amplitude=f=>{let re=0,im=0;for(let i=4800;i<43200;i++){re+=audio[i]*Math.cos(2*Math.PI*f*i/r);im+=audio[i]*Math.sin(2*Math.PI*f*i/r);}return 2*Math.hypot(re,im)/38400;};
    return {sources,tones:frequencies.map(amplitude),discarded:amplitude(220)};
  });
  expect(result.sources.flatMap((v,i)=>v?[i]:[])).toEqual([0,4,8,12]);expect(result.discarded).toBeLessThan(.0001);
  for(const [i,gain] of [1,.5,.25,.75].entries())expect(result.tones[i]).toBeCloseTo(.1*gain,3);
});

test('all six trigger modes distinguish loop, retrigger, toggle and release',async({page})=>{
  await ready(page);
  const result=await page.evaluate(async()=>{
    const s=window.__mixdesk.engine.sampler,{SAMPLE_MODES}=await import('/src/sampler.js'),out=[];
    for(const mode of SAMPLE_MODES){s.stopAll();s.configure(0,{mode});await s.press(0,'first');const first=s.slots[0].source,loop=first.loop;await s.press(0,'second');const second=s.slots[0].source;s.release(0,'first');const afterFirst=!!s.slots[0].source;s.release(0,'second');out.push({mode,loop,same:second===first,second:!!second,afterFirst,afterLast:!!s.slots[0].source});}s.stopAll();return out;
  });
  for(const r of result){expect(r.loop).toBe(['loop','hold','toggle-loop'].includes(r.mode));if(r.mode.startsWith('hold')){expect(r).toMatchObject({same:true,second:true,afterFirst:true,afterLast:false});}else if(r.mode.startsWith('toggle')){expect(r).toMatchObject({second:false,afterFirst:false,afterLast:false});}else expect(r).toMatchObject({same:false,second:true,afterFirst:true,afterLast:true});}
  await page.evaluate(async()=>{const s=window.__mixdesk.engine.sampler;s.configure(0,{mode:'hold-oneshot'});await s.press(0,'end');});
  await expect.poll(()=>page.evaluate(()=>window.__mixdesk.engine.sampler.isActive(0))).toBe(false);
});

test('quantized switching keeps the old tone until the boundary and cancelling a hold restores it',async({page})=>{
  await ready(page);
  await page.evaluate(async()=>{
    const e=window.__mixdesk.engine,s=e.sampler,r=e.context.sampleRate;
    [440,880].forEach((f,index)=>{const b=e.context.createBuffer(1,r*3,r),v=b.getChannelData(0);for(let i=0;i<v.length;i++)v[i]=.15*Math.sin(2*Math.PI*f*i/r);s.load(index,b,'Tone '+f,null,{mode:index?'hold':'loop'});});
    const a=e.context.createAnalyser();a.fftSize=8192;a.smoothingTimeConstant=0;s.output.connect(a);window.switchAnalyser=a;
    await s.trigger(0);s.bank.timing=()=>({when:e.context.currentTime+.6,rate:1});
  });
  const frequency=()=>page.evaluate(()=>{const a=window.switchAnalyser,v=new Float32Array(a.frequencyBinCount);a.getFloatFrequencyData(v);let peak=1;for(let i=2;i<v.length;i++)if(v[i]>v[peak])peak=i;return peak*window.__mixdesk.engine.context.sampleRate/a.fftSize;});
  await expect.poll(frequency).toBeGreaterThan(430);expect(await frequency()).toBeLessThan(450);
  await page.evaluate(()=>window.__mixdesk.engine.sampler.press(1,'hold'));
  await page.waitForTimeout(150);expect(await frequency()).toBeLessThan(450);
  await page.evaluate(()=>window.__mixdesk.engine.sampler.release(1,'hold'));
  await page.waitForTimeout(650);expect(await frequency()).toBeGreaterThan(430);expect(await frequency()).toBeLessThan(450);
  expect(await page.evaluate(()=>{const s=window.__mixdesk.engine.sampler;return [s.isActive(0),s.isActive(1)];})).toEqual([true,false]);
  await page.evaluate(()=>window.__mixdesk.engine.sampler.press(1,'switch'));await expect.poll(frequency,{timeout:2000}).toBeGreaterThan(865);expect(await frequency()).toBeLessThan(895);
  expect(await page.evaluate(()=>{const s=window.__mixdesk.engine.sampler;return [s.isActive(0),s.isActive(1)];})).toEqual([false,true]);
  await page.evaluate(()=>window.__mixdesk.engine.sampler.release(1,'switch'));
});

test('failed and stale pending selections keep the previous voice and cannot start later',async({page})=>{
  await ready(page);
  const r=await page.evaluate(async()=>{
    const e=window.__mixdesk.engine,s=e.sampler,c=e.context;s.configure(0,{mode:'loop'});s.configure(1,{mode:'hold'});await s.trigger(0);const original=s.slots[0].source,resume=c.resume.bind(c);let resolveResume;c.resume=()=>new Promise(resolve=>resolveResume=resolve);
    const pending=s.press(1,'hold');s.release(1,'hold');resolveResume();await pending;c.resume=resume;
    const cancelled={original:s.slots[0].source===original,pending:s.slots[1].pending,source:!!s.slots[1].source};
    const create=c.createBufferSource.bind(c);let stopped=false,disconnected=false;
    c.createBufferSource=()=>{const source=create(),stop=source.stop.bind(source),disconnect=source.disconnect.bind(source);source.stop=()=>{stopped=true;try{stop();}catch{}};source.disconnect=()=>{disconnected=true;disconnect();};source.start=()=>{throw new Error('start failed');};return source;};let error;try{await s.trigger(1);}catch(e){error=e.message;}c.createBufferSource=create;
    const failure={error,stopped,disconnected,original:s.slots[0].source===original,pending:s.slots[1].pending,held:s.slots[1].held.size};await s.press(1,'retry');const retried=s.isActive(1)&&!s.isActive(0);s.release(1,'retry');return {cancelled,failure,retried};
  });
  expect(r.cancelled).toEqual({original:true,pending:false,source:false});expect(r.failure).toEqual({error:'start failed',stopped:true,disconnected:true,original:true,pending:false,held:0});expect(r.retried).toBe(true);
});

test('MIX pads and feedback address C and D sampler groups independently of the visible deck',async({page})=>{
  await ready(page);
  const r=await page.evaluate(async()=>{
    const {engine:e,onAction,midi}=window.__mixdesk,s=e.sampler,{decodeMix,feedbackMessages}=await import('/src/midi.js');s.decks[2].configure(4,{mode:'hold'});s.decks[3].configure(12,{mode:'loop'});
    await onAction(decodeMix([0x96,0x11,127]));await onAction(decodeMix([0x97,0x13,127]));
    const before=s.decks.map(d=>d.groups.map((_,i)=>d.groupActive(i))),lights=feedbackMessages(e.decks,s).filter(m=>(m[0]===0x96||m[0]===0x97)&&m[1]>=0x10&&m[1]<=0x13);
    await midi.disconnect();const released=!s.decks[2].groupActive(1),loopKept=s.decks[3].groupActive(3);await onAction(decodeMix([0x97,0x1b,127]));return {before,lights,released,loopKept,stopped:!s.decks[3].groupActive(3)};
  });
  expect(r.before).toEqual([[false,false,false,false],[false,false,false,false],[false,true,false,false],[false,false,false,true]]);
  expect(r.lights.filter(m=>m[2]===127)).toEqual([[0x96,0x11,127],[0x97,0x13,127]]);expect(r).toMatchObject({released:true,loopKept:true,stopped:true});
});

test('MIX sampler pads trigger the selected sample in each group and release the same held slot',async({page})=>{
  await ready(page);
  const result=await page.evaluate(async()=>{
    const {engine:e,onAction}=window.__mixdesk,s=e.sampler;
    s.decks[2].configure(4,{mode:'hold'}); s.decks[2].configure(6,{mode:'hold'});
    s.decks[2].groups[1].selected=2;
    await onAction({action:'sample',deck:0,index:1});
    const selected=s.decks[2].groups[1].held.get('midi:0:1');
    await onAction({action:'sampleRelease',deck:0,index:1});
    return {selected,active:s.decks[2].groupActive(1),held:s.decks[2].groups[1].held.size,slot6:s.decks[2].slots[6].held.size,slot4:s.decks[2].slots[4].held.size};
  });
  expect(result).toEqual({selected:6,active:false,held:0,slot6:0,slot4:0});
});

test('v4 packages preserve audio, empty cells and settings across all four decks and reload',async({page})=>{
  await ready(page);
  await page.evaluate(()=>{const s=window.__mixdesk.engine.sampler,r=s.context.sampleRate;for(let d=0;d<4;d++){const b=s.context.createBuffer(1,r,r),v=b.getChannelData(0);for(let i=0;i<r;i++)v[i]=.1*Math.sin(2*Math.PI*(300+d*300)*i/r);s.decks[d].load(d*4,b,'Deck '+d,null,{mode:'toggle-loop',gain:.25+d*.1});s.decks[d].reset(15);s.decks[d].configureGlobal({volume:.2+d*.1,display:d%2?4:8,groupVolumes:[.1,.2,.3,.4]});}});
  const bytes=await exportPack(page),doc=JSON.parse(bytes.toString('utf8',12,12+bytes.readUInt32LE(8)));expect(doc.version).toBe(4);expect(doc.decks).toHaveLength(4);
  await page.locator('#sample-pack-file').setInputFiles({name:'four.mxpack',buffer:bytes});await saved(page);await page.reload();await expect(page.locator('#sampler-status')).toContainText('已就绪');
  const r=await page.evaluate(()=>{const s=window.__mixdesk.engine.sampler;return s.decks.map((bank,d)=>{const slot=bank.slots[d*4],v=slot.buffer.getChannelData(0),r=slot.buffer.sampleRate;let error=0;for(let i=0;i<v.length;i+=37)error=Math.max(error,Math.abs(v[i]-.1*Math.sin(2*Math.PI*(300+d*300)*i/r)));return {name:slot.name,mode:slot.mode,file:slot.file.size,empty:!bank.slots[15].buffer,settings:bank.settings,error};});});
  r.forEach((v,d)=>{expect(v).toMatchObject({name:'Deck '+d,mode:'toggle-loop',empty:true});expect(v.file).toBeGreaterThan(44);expect(v.error).toBeLessThan(.0001);expect(v.settings.volume).toBeCloseTo(.2+d*.1);expect(v.settings.groupVolumes).toEqual([.1,.2,.3,.4]);});
});

test('v4 packages preserve the native three-page sampler setting and current page',async({page})=>{
  await ready(page);
  await page.locator('#sampler-display').selectOption('3');
  await page.locator('#sampler-next').click();
  await page.locator('#sampler-next').click();
  await expect(page.locator('#sampler-page')).toHaveText('3 / 3');
  const bytes=await exportPack(page);
  const length=bytes.readUInt32LE(8),doc=JSON.parse(bytes.toString('utf8',12,12+length));
  expect(doc.decks[0].settings).toMatchObject({display:3,page:2});
  await page.locator('#sampler-display').selectOption('16');
  await expect(page.locator('#sampler-status')).toHaveText('采样设置已保存到本机');
  await expect(page.locator('.sample-slot:visible')).toHaveCount(16);
  await page.locator('#sample-pack-file').setInputFiles({name:'three-pages.mxpack',buffer:bytes});
  await saved(page);
  await page.reload();
  await expect(page.locator('#sampler-status')).toContainText('已就绪');
  await expect(page.locator('#sampler-display')).toHaveValue('3');
  await expect(page.locator('#sampler-page')).toHaveText('3 / 3');
  expect(await page.locator('.sample-slot:visible').evaluateAll(elements=>elements.map(el=>Number(el.dataset.sample)))).toEqual([2,6,10,14]);
});

test('legacy v1 to v3 packages migrate every layer to a selectable sample without dropping audio',async({page})=>{
  await ready(page);const configs=await page.evaluate(()=>window.__mixdesk.engine.sampler.slots.map((_,i)=>window.__mixdesk.engine.sampler.defaultConfig(i)));
  for(const version of [1,2,3]){
    const count=version===1?8:16,doc={version,settings:{volume:.4,beats:4,target:1,display:8},slots:configs.slice(0,count).map((config,i)=>({config:{...config,name:'Old '+i,mode:'loop'},file:null,layers:version===3?[1,2,3].map(n=>({file:null,config:{...config,name:'Old '+i+' layer '+n}})):[]}))};
    await page.locator('#sample-pack-file').setInputFiles({name:'legacy.mxpack',buffer:packBytes(doc)});await saved(page);await page.reload();await expect(page.locator('#sampler-status')).toContainText('已就绪');
    const result=await page.evaluate(async()=>{const s=window.__mixdesk.engine.sampler,{setting}=await import('/src/storage.js');return {names:s.decks.flatMap(d=>d.slots.filter(v=>v.buffer).map(v=>v.name)),mode:s.slots[0].mode,backup:(await setting('sampler:v4:legacy-package')).size};});
    expect(result.names).toHaveLength(version===3?64:count);expect(result.names).toContain('Old '+(count-1));expect(result.mode).toBe('toggle-loop');expect(result.backup).toBeGreaterThan(12);if(version===3)expect(result.names).toContain('Old 15 layer 3');
  }
});

test('old IndexedDB migrates transactionally and preserves original records and audio',async({page})=>{
  await ready(page);
  await page.evaluate(async()=>{const {setting}=await import('/src/storage.js'),s=window.__mixdesk.engine.sampler,{encodeWav}=await import('/src/wav.js');const config={...s.defaultConfig(5),name:'Legacy primary',mode:'loop'},file=new File([encodeWav(s.defaultBuffer(5))],'original.wav',{type:'audio/wav'});await setting('sampler:slot:5',{config,file,layers:[{config:{...config,name:'Legacy alternative'},file},null,null]});await setting('sampler:global',{volume:.3,target:0,beats:2,display:8,page:1});await setting('sampler:v4:initialized',false);});
  await page.reload();await expect(page.locator('#sampler-status')).toContainText('已就绪');
  const r=await page.evaluate(async()=>{const s=window.__mixdesk.engine.sampler,{setting}=await import('/src/storage.js');return {names:s.decks[1].slots.slice(4,6).map(v=>v.name),mode:s.decks[1].slots[4].mode,sizes:s.decks[1].slots.slice(4,6).map(v=>v.file.size),original:(await setting('sampler:slot:5')).file.size,backup:(await setting('sampler:v4:legacy-backup')).slots[5].file.size};});
  expect(r.names).toEqual(['Legacy primary','Legacy alternative']);expect(r.mode).toBe('toggle-loop');expect(r.sizes).toEqual([r.original,r.original]);expect(r.backup).toBe(r.original);
});

test('DJS six modes, quantization fallback and empty cells apply to the selected deck only',async({page})=>{
  await ready(page);await page.locator('#sampler-deck').selectOption('3');
  const samples=Array.from({length:6},(_,i)=>'<sampler idx="'+Math.floor(i/4)+'"><sample idx="'+i%4+'" type="'+i+'" title="Type '+i+'" file="tone.wav"/></sampler>').join('');
  for(const [attribute,expected] of [['',true],[' quant-enabled="0"',false],[' quant-enabled="nonsense"',true],[' quant-enabled="-1"',false],[' quant-enabled="-2147483648"',false],[' quant-enabled="-2147483649"',true]]){
    await page.locator('#sample-djs-file').setInputFiles([{name:'modes.djs',buffer:Buffer.from('<pack bpm="128" quant="4"'+attribute+'>'+samples+'</pack>')},{name:'tone.wav',buffer:taggedWav({duration:1})}]);await saved(page);
    const r=await page.evaluate(()=>{const s=window.__mixdesk.engine.sampler;return {modes:s.slots.slice(0,6).map(v=>v.mode),quant:s.settings.quantize,empty:!s.slots[6].buffer,other:s.decks[0].slots[0].name};});expect(r.modes).toEqual(['loop','oneshot','hold','hold-oneshot','toggle-loop','toggle-oneshot']);expect(r).toMatchObject({quant:expected,empty:true,other:'Kick'});
  }
});

test('corrupt v4 package metadata never replaces active voices or durable data',async({page})=>{
  await ready(page);const bytes=await exportPack(page),length=bytes.readUInt32LE(8),valid=JSON.parse(bytes.toString('utf8',12,12+length)),payload=bytes.subarray(12+length);
  await page.evaluate(async()=>{const s=window.__mixdesk.engine.sampler;s.configure(0,{mode:'loop'});await s.trigger(0);window.originalVoice=s.slots[0].source;});
  for(const damage of [doc=>doc.decks.pop(),doc=>doc.decks[1].slots.pop(),doc=>doc.decks[3].settings.groupVolumes=[1,1,2,1],doc=>doc.decks[0].slots[0].config.end=900,doc=>doc.decks[0].slots[0].file.size=2**31,doc=>doc.decks[0].slots[0].config.mode='missing']){
    const doc=structuredClone(valid);damage(doc);await page.locator('#sample-pack-file').setInputFiles({name:'bad.mxpack',buffer:packBytes(doc,[payload])});await expect(page.locator('#sampler-status')).not.toHaveText('正在保存…');await expect(page.locator('#sampler-status')).not.toHaveText('采样已保存到本机');expect(await page.evaluate(()=>window.__mixdesk.engine.sampler.slots[0].source===window.originalVoice)).toBe(true);
  }
  await page.locator('#sample-pack-file').setInputFiles({name:'extra.mxpack',buffer:Buffer.concat([bytes,Buffer.from([1])])});await expect(page.locator('#sampler-status')).toContainText('多余');
  await page.reload();await expect(page.locator('#sampler-status')).toContainText('已就绪');await expect(page.locator('[data-sample="0"] strong')).toHaveText('Kick');
});

test('migration failure retains all legacy data and retries on the next load',async({page})=>{
  await ready(page);await page.evaluate(async()=>{const {setting}=await import('/src/storage.js'),s=window.__mixdesk.engine.sampler;await setting('sampler:slot:0',{file:null,config:{...s.defaultConfig(0),name:'Recover me'}});await setting('sampler:v4:initialized',false);});
  await page.addInitScript(()=>{if(sessionStorage.getItem('migration-retry'))return;const put=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(value,key){if(String(key).startsWith('sampler:v4:'))throw new DOMException('Migration quota','QuotaExceededError');return put.call(this,value,key);};});
  await page.reload();await expect(page.locator('#sampler-status')).toContainText('旧数据保留');
  expect(await page.evaluate(async()=>{const {setting}=await import('/src/storage.js');return {name:(await setting('sampler:slot:0')).config.name,initialized:await setting('sampler:v4:initialized')};})).toEqual({name:'Recover me',initialized:false});
  await page.evaluate(()=>sessionStorage.setItem('migration-retry','1'));await page.reload();await expect(page.locator('#sampler-status')).toContainText('已就绪');await expect(page.locator('[data-sample="0"] strong')).toHaveText('Recover me');
  expect(await page.evaluate(async()=>{const {setting}=await import('/src/storage.js');return await setting('sampler:v4:initialized');})).toBe(true);
});

test('rapid switching cancels stale resume calls, and Key Lock readiness respects release',async({page})=>{
  await ready(page);const r=await page.evaluate(async()=>{
    const e=window.__mixdesk.engine,s=e.sampler,c=e.context,resume=c.resume.bind(c),resolvers=[];s.configure(0,{mode:'loop'});await s.trigger(0);c.resume=()=>new Promise(resolve=>resolvers.push(resolve));
    const a=s.trigger(1),b=s.trigger(2);resolvers[1]();await b;resolvers[0]();await a;c.resume=resume;const winners=s.slots.slice(0,3).map((_,i)=>s.isActive(i));s.stopAll();
    await e.pitchReady;const old=e.pitchReady;let resolvePitch;e.pitchReady=new Promise(resolve=>resolvePitch=resolve);s.configure(0,{mode:'hold',keyLock:true});const pending=s.press(0,'held');s.release(0,'held');resolvePitch();await pending;e.pitchReady=old;return {winners,active:s.isActive(0),held:s.slots[0].held.size};
  });expect(r).toEqual({winners:[false,false,true],active:false,held:0});
});

test('a stopped group replays its selected sample and an empty cell stays silent after reload',async({page})=>{
  await ready(page);const r=await page.evaluate(async()=>{const s=window.__mixdesk.engine.sampler;await s.trigger(1);await s.playGroup(0);const stopped=!s.groupActive(0);await s.playGroup(0);return {stopped,selected:s.slots[1].source!==null,other:s.slots[0].source===null};});expect(r).toEqual({stopped:true,selected:true,other:true});
  await page.getByRole('button',{name:'编辑采样 1',exact:true}).click();await page.locator('#sample-reset').click();await saved(page);await expect(page.getByRole('button',{name:'播放采样 1',exact:true})).toBeDisabled();await page.reload();await expect(page.locator('#sampler-status')).toContainText('已就绪');expect(await page.evaluate(()=>window.__mixdesk.engine.sampler.slots[0].buffer)).toBeNull();
});

test('DJS missing type uses the observed zero type and ambiguous filenames are rejected',async({page})=>{
  await ready(page);await page.locator('#sample-djs-file').setInputFiles([{name:'default.djs',buffer:Buffer.from('<pack><sampler idx="0"><sample idx="0" file="tone.wav"/></sampler></pack>')},{name:'tone.wav',buffer:taggedWav({duration:1})}]);await saved(page);expect(await page.evaluate(()=>window.__mixdesk.engine.sampler.slots[0].mode)).toBe('loop');
  await page.locator('#sample-djs-file').setInputFiles([{name:'duplicate.djs',buffer:Buffer.from('<pack><sampler idx="0"><sample idx="0" file="tone.wav"/></sampler></pack>')},{name:'tone.wav',buffer:taggedWav({duration:1})},{name:'TONE.WAV',buffer:taggedWav({duration:2})}]);await expect(page.locator('#sampler-status')).toContainText('重复文件名');expect(await page.evaluate(()=>window.__mixdesk.engine.sampler.slots[0].buffer.duration)).toBe(1);
});

test('deck default type governs later file imports without overriding DJS cell types',async({page})=>{
  await ready(page);await page.locator('#sampler-deck').selectOption('2');
  await page.locator('#sample-djs-file').setInputFiles([{name:'default.djs',buffer:Buffer.from('<pack defaultSampleType="3"><sampler idx="0"><sample idx="0" type="4" file="tone.wav"/></sampler></pack>')},{name:'tone.wav',buffer:taggedWav({duration:1})}]);await saved(page);
  expect(await page.evaluate(()=>{const s=window.__mixdesk.engine.sampler;return {mode:s.slots[0].mode,default:s.settings.defaultMode,other:s.decks[0].settings.defaultMode};})).toEqual({mode:'toggle-loop',default:'hold-oneshot',other:'loop'});
  await page.getByRole('button',{name:'载入采样 2',exact:true}).click();await page.locator('#sample-file').setInputFiles({name:'New sample.wav',buffer:taggedWav({duration:1})});await saved(page);
  expect(await page.evaluate(()=>window.__mixdesk.engine.sampler.slots[1].mode)).toBe('hold-oneshot');
  await page.reload();await expect(page.locator('#sampler-status')).toContainText('已就绪');await page.locator('#sampler-deck').selectOption('2');await expect(page.locator('#sampler-default-mode')).toHaveValue('hold-oneshot');
  await page.locator('#sampler-default-mode').selectOption('toggle-oneshot');await expect(page.locator('#sampler-status')).toHaveText('采样设置已保存到本机');
  await page.getByRole('button',{name:'载入采样 5',exact:true}).click();await page.locator('#sample-file').setInputFiles({name:'Another.wav',buffer:taggedWav({duration:1})});await saved(page);
  expect(await page.evaluate(()=>window.__mixdesk.engine.sampler.slots[4].mode)).toBe('toggle-oneshot');
  const bytes=await exportPack(page),doc=JSON.parse(bytes.toString('utf8',12,12+bytes.readUInt32LE(8)));expect(doc.decks[2].settings.defaultMode).toBe('toggle-oneshot');
});
