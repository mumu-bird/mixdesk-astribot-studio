import { sampleConfig, samplerSettings, SAMPLE_MODES, isSampleLoop } from './sampler.js';
import { encodeWav } from './wav.js';
import { createDjz, extractDjz, checkImportCancelled, abortable } from './djz.js';
import { archivePath, DJZ_LIMITS } from './djz-archive.js';
const magic='MXPACK01',maxFile=30*1024**2,maxSlots=16,maxLayers=4,maxPack=maxSlots*maxLayers*maxFile+65548;

function boundedBpm(value) {
  const bpm=Number(value);
  return Number.isFinite(bpm)&&bpm>=30&&bpm<=300?bpm:null;
}

const xmlAttribute = value => {
  const text = String(value);
  if (/[^\u0009\u000a\u000d\u0020-\ud7ff\ue000-\ufffd\u{10000}-\u{10ffff}]/u.test(text)) throw new Error('采样名称包含 XML 不支持的字符');
  return text.replace(/[&<>"\r\n\t]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\r':'&#13;','\n':'&#10;','\t':'&#9;'}[c]));
};
const xmlAttributes = values => Object.entries(values).map(([name,value]) => `${name}="${xmlAttribute(value)}"`).join(' ');

export function djucedPackBpm(sampler, deck=sampler.activeDeck) {
  const bank=sampler.decks[deck];
  if(!bank)throw new Error('采样台无效');
  if(bank.settings.packBpm!==null)return bank.settings.packBpm;
  const bpms=[...new Set(bank.slots.filter(slot=>slot.buffer&&slot.bpm!==null).map(slot=>slot.bpm))];
  if(bpms.length===1)return bpms[0];
  return boundedBpm(sampler.engine.decks[bank.settings.target]?.musicalBpm)??120;
}

/** Export one deck, as native DJUCED does. Trim and sample gain are baked into
 * PCM; performance-time routing, levels, tempo sync and Key Lock are not. */
export async function exportDjucedSamplePack(sampler, {deck=sampler.activeDeck, title=`MIXDESK ${'ABCD'[deck]}`, bpm=djucedPackBpm(sampler,deck), signal} = {}) {
  const bank=sampler.decks[deck];
  if(!bank)throw new Error('采样台无效');
  title=String(title).trim();
  if(!title||title.length>100)throw new Error('采样包名称应为 1–100 个字符');
  bpm=boundedBpm(bpm);if(bpm===null)throw new Error('采样包 BPM 应为 30–300');
  const settings=samplerSettings(bank.settings),slots=bank.slots.map(slot=>slot.buffer?{buffer:slot.buffer,config:sampleConfig(slot,slot.buffer.duration)}:null);
  const files=[],lines=['<?xml version="1.0" encoding="UTF-8"?>',`<pack ${xmlAttributes({title,bpm,quant:settings.beats,'quant-enabled':settings.quantize?1:0,defaultSampleType:SAMPLE_MODES.indexOf(settings.defaultMode)})}>`];
  let total=0,clippedSamples=0,sampleCount=0;
  for(let group=0;group<4;group++){
    lines.push(`  <sampler idx="${group}">`);
    for(let cell=0;cell<4;cell++){
      if(signal?.aborted)throw new DOMException('已取消导出','AbortError');
      const slot=slots[group*4+cell];if(!slot)continue;
      const {buffer,config}=slot,channels=buffer.numberOfChannels,rate=buffer.sampleRate;
      if(![1,2].includes(channels))throw new Error('DJUCED 导出仅支持单声道或双声道采样');
      const first=Math.round(config.start*rate),last=Math.min(buffer.length,Math.round(config.end*rate)),length=last-first;
      const byteLength=44+length*channels*2;
      if(length<1||byteLength>maxFile)throw new Error('导出后每个采样需小于 30 MB');
      total+=byteLength;if(total>256*1024**2)throw new Error('导出音频总大小需小于 256 MB');
      const data=Array.from({length:channels},(_,channel)=>{
        const source=buffer.getChannelData(channel),target=new Float32Array(length);
        for(let i=0;i<length;i++){
          const value=source[first+i]*config.gain;
          if(!Number.isFinite(value))throw new Error('采样音频包含无效数值');
          if(Math.abs(value)>1)clippedSamples++;
          target[i]=value;
        }
        return target;
      });
      const name=`sample-${group+1}-${cell+1}.wav`;
      const wav=encodeWav({numberOfChannels:channels,sampleRate:rate,length,getChannelData:channel=>data[channel]});
      files.push({name,bytes:await wav.arrayBuffer()});sampleCount++;
      lines.push(`    <sample ${xmlAttributes({idx:cell,title:config.name,file:name,type:SAMPLE_MODES.indexOf(config.mode),bpm:config.bpm??0,length:length/rate})}/>`);
    }
    lines.push('  </sampler>');
  }
  lines.push('</pack>');
  files.push({name:'default.djs',bytes:new TextEncoder().encode(lines.join('\n')+'\n').buffer});
  const blob=await createDjz(files,{signal});
  return {blob,clippedSamples,sampleCount};
}

/**
 * Read DJUCED's shipped XML sample-pack description. Audio is deliberately
 * supplied by the caller as selected local files; a browser cannot and should
 * not follow paths embedded in the XML.
 */
export async function importDjucedArchive(file, engine, {deck=engine.sampler.activeDeck, ...options} = {}) {
  const settings=samplerSettings(engine.sampler.decks[deck].settings);
  const entries=await extractDjz(file,options), audioByPath=new Map();
  for(const entry of entries)audioByPath.set(entry.name.toLowerCase(),new File([entry.bytes],entry.name.split('/').pop()));
  const descriptor=audioByPath.get('default.djs');
  return importDjucedSamplePack([descriptor],engine,{...options,deck,settings,audioByPath});
}

export async function importDjucedSamplePack(files, engine, {deck=engine.sampler.activeDeck, settings=engine.sampler.decks[deck].settings, signal, onProgress, audioByPath} = {}) {
  settings=samplerSettings(settings);checkImportCancelled(signal);
  const selected=Array.from(files||[]), descriptor=selected.find(file=>/\.djs$/i.test(file.name));
  if(!descriptor) throw new Error('请选择 DJUCED 的 .djs 采样包描述文件');
  if(selected.filter(file=>/\.djs$/i.test(file.name)).length!==1)throw new Error('请只选择一个 .djs 描述文件');
  if(descriptor.size>DJZ_LIMITS.descriptor)throw new Error('采样包描述文件需小于 1 MB');
  const xml=await abortable(descriptor.text(),signal), doc=new DOMParser().parseFromString(xml,'application/xml');
  if(doc.querySelector('parsererror')||doc.documentElement?.tagName!=='pack')throw new Error('DJUCED 采样包 XML 无效');
  const audioByName=new Map();
  for(const file of selected.filter(file=>file!==descriptor)){const name=file.name.toLowerCase();if(audioByName.has(name))throw new Error('所选音频包含重复文件名：'+file.name);audioByName.set(name,file);}
  const pack=doc.documentElement, samplers=Array.from(pack.children).filter(node=>node.tagName.toLowerCase()==='sampler');
  if(!samplers.length)throw new Error('DJUCED 采样包没有采样槽');
  const records=Array.from({length:maxSlots},()=>({empty:true}));
  const missing=[],seen=new Set();
  for(const sampler of samplers) {
    const bank=Number(sampler.getAttribute('idx'));
    if(!Number.isInteger(bank)||bank<0||bank>3)continue;
    const samples=Array.from(sampler.children).filter(node=>node.tagName.toLowerCase()==='sample');
    for(const sample of samples) {
      const cell=Number(sample.getAttribute('idx')),index=bank*4+cell;
      if(!Number.isInteger(cell)||cell<0||cell>3)continue;
      if(seen.has(index))throw new Error('采样包包含重复采样槽位');seen.add(index);
      const filename=(sample.getAttribute('file')||'').trim();
      const path=audioByPath&&filename?archivePath(filename.replace(/^(\.\/)+/,'')):null;
      const audio=audioByPath?audioByPath.get(path?.toLowerCase()):audioByName.get(filename.split(/[\\/]/).pop().toLowerCase());
      if(!filename||!audio){missing.push(filename||`采样 ${index+1}`);continue;}
      if(!Number.isInteger(audio.size)||audio.size<1||audio.size>maxFile)throw new Error(`采样音频请小于 30 MB：${audio.name}`);
      let buffer;
      checkImportCancelled(signal);onProgress?.(`正在校验音频 · 组 ${bank+1} / 样本 ${cell+1}…`);
      try{buffer=await abortable(engine.decode(audio),signal);}catch(error){if(error.name==='AbortError')throw error;throw new Error(`采样音频无法解码：${audio.name}`);}
      checkImportCancelled(signal);
      if(!Number.isFinite(buffer?.duration)||buffer.duration<=0||buffer.duration>30)throw new Error(`采样音频请控制在 30 秒内：${audio.name}`);
      const rawType=(sample.getAttribute('type')||'').trim(),numberType=Number(rawType);
      // REA getDJSSampleListFromXML uses QString::toInt without an ok flag.
      const type=/^[+-]?\d+$/.test(rawType)&&Number.isInteger(numberType)&&numberType>=-2147483648&&numberType<=2147483647?numberType:0;
      if(!Number.isInteger(type)||!SAMPLE_MODES[type])throw new Error('DJUCED 采样类型无效');
      const bpm=boundedBpm(sample.getAttribute('bpm')||pack.getAttribute('bpm'));
      const name=(sample.getAttribute('title')||filename.replace(/\.[^.]+$/,'')).trim();
      const config=sampleConfig({name:name||`Sample ${index+1}`,mode:SAMPLE_MODES[type],start:0,end:buffer.duration,bpm,sync:isSampleLoop(SAMPLE_MODES[type])&&bpm!==null,keyLock:false},buffer.duration);
      records[index]={file:audio,buffer,config,layers:[]};
    }
  }
  if(missing.length)throw new Error(`未选择 DJUCED 采样音频：${[...new Set(missing)].slice(0,8).join('、')}`);
  const quant=Number(pack.getAttribute('quant')),beats=[.25,.5,1,2,4,8,16,32].includes(quant)?quant:1;
  const rawEnabled=(pack.getAttribute('quant-enabled')||'').trim(),enabled=/^[+-]?\d+$/.test(rawEnabled)&&Number.isSafeInteger(Number(rawEnabled))&&Number(rawEnabled)>=-2147483648&&Number(rawEnabled)<=2147483647?Number(rawEnabled)>0:quant>0;
  const rawDefault=(pack.getAttribute('defaultSampleType')||'').trim(),defaultType=Number(rawDefault);
  const defaultMode=/^[+-]?\d+$/.test(rawDefault)&&SAMPLE_MODES[defaultType]?SAMPLE_MODES[defaultType]:settings.defaultMode;
  checkImportCancelled(signal);
  return {deck,slots:records,settings:samplerSettings({...settings,packBpm:boundedBpm(pack.getAttribute('bpm')),beats,page:0,quantize:enabled,defaultMode})};
}

export function migrateLegacySlots(slots,settings,engine){
  const decks=Array.from({length:4},(_,deck)=>({settings:samplerSettings({...settings,page:0}),slots:Array.from({length:16},()=>({empty:true}))}));
  slots.forEach((slot,index)=>{
    const entries=[slot,...(slot.layers||[])];
    entries.forEach((entry,cell)=>{if(!entry)return;
      const buffer=entry.buffer||(!entry.file?engine.sampler.defaultBuffer(index):null);
      const file=entry.file||(buffer?new File([encodeWav(buffer)],`${entry.config.name}.wav`,{type:'audio/wav'}):null);
      const config={...entry.config,mode:entry.config.mode==='loop'?'toggle-loop':entry.config.mode};
      decks[Math.floor(index/4)].slots[index%4*4+cell]={config,file,buffer};
    });
  });
  return {decks,migrated:true};
}

export function exportSamplePack(sampler){
  const parts=[];
  const decks=sampler.decks.map(bank=>({settings:bank.settings,slots:bank.slots.map((slot,index)=>{
    const record=bank.record(index);if(record.empty)return {empty:true};
    const audio=record.file||new File([encodeWav(slot.buffer)],`${record.config.name}.wav`,{type:'audio/wav'});
    if(audio.size>maxFile)throw new Error('采样文件请小于 30 MB');parts.push(audio);
    return {config:record.config,file:{name:audio.name,type:audio.type,size:audio.size}};
  })}));
  const manifest=new TextEncoder().encode(JSON.stringify({version:4,decks}));
  if(manifest.length>65536)throw new Error('采样包目录过大');
  const header=new Uint8Array(12);header.set(new TextEncoder().encode(magic));new DataView(header.buffer).setUint32(8,manifest.length,true);
  return new Blob([header,manifest,...parts],{type:'application/octet-stream'});
}

export async function importSamplePack(file,engine){
  if(file.size<12||file.size>maxPack)throw new Error('采样包大小无效');
  const head=await file.slice(0,12).arrayBuffer();
  if(new TextDecoder().decode(head.slice(0,8))!==magic)throw new Error('不是 MIXDESK 采样包');
  const length=new DataView(head).getUint32(8,true);
  if(!length||length>65536||12+length>file.size)throw new Error('采样包目录无效');
  let doc;try{doc=JSON.parse(await file.slice(12,12+length).text());}catch{throw new Error('采样包目录无效');}
  if(![1,2,3,4].includes(doc?.version))throw new Error('采样包版本无效');
  let offset=12+length;
  const readEntry=async(entry,index)=>{
    if(!entry||typeof entry!=='object'||Array.isArray(entry))throw new Error('采样槽位无效');
    if(doc.version===4&&entry.empty===true){if(entry.file||entry.config)throw new Error('空样本记录无效');return {empty:true};}
    let audio=null,buffer=null,duration=engine.sampler.defaultBuffer(index).duration;
    if(entry.file!=null){
      const meta=entry.file;
      if(typeof meta.name!=='string'||!meta.name.trim()||!Number.isInteger(meta.size)||meta.size<1||meta.size>maxFile||offset+meta.size>file.size)throw new Error('采样文件超出包范围');
      audio=new File([file.slice(offset,offset+meta.size)],meta.name.slice(0,200),{type:typeof meta.type==='string'?meta.type.slice(0,100):''});offset+=meta.size;
      try{buffer=await engine.decode(audio);}catch{throw new Error('采样包中的音频无法解码');}
      if(!Number.isFinite(buffer?.duration)||buffer.duration<=0||buffer.duration>30)throw new Error('采样必须不超过 30 秒');duration=buffer.duration;
    }
    let config=entry.config;if(!audio&&Number(config?.end)>duration&&Number(config.end)<=duration+1/8000)config={...config,end:duration};
    return {file:audio,buffer,config:sampleConfig(config,duration)};
  };
  let result;
  if(doc.version===4){
    if(!Array.isArray(doc.decks)||doc.decks.length!==4)throw new Error('采样包必须包含四台');
    const decks=[];
    for(const deck of doc.decks){
      if(!Array.isArray(deck?.slots)||deck.slots.length!==16)throw new Error('每台必须包含十六个样本');
      const settings=samplerSettings(deck.settings),slots=[];
      for(const [i,slot] of deck.slots.entries())slots.push(await readEntry(slot,i));decks.push({settings,slots});
    }result={decks};
  }else{
    if(!Array.isArray(doc.slots)||![8,16].includes(doc.slots.length))throw new Error('采样包必须包含八个或十六个槽位');
    const settings=samplerSettings({...doc.settings,beats:Number(doc.settings?.beats),target:Number(doc.settings?.target)}),slots=[];
    for(const [i,slot] of doc.slots.entries()){
      const primary=await readEntry(slot,i),layers=[];
      if(doc.version>=3&&slot.layers!=null){if(!Array.isArray(slot.layers)||slot.layers.length>3)throw new Error('采样层数量无效');for(const layer of slot.layers)layers.push(layer===null?null:await readEntry(layer,i));}
      slots.push({...primary,layers});
    }result=migrateLegacySlots(slots,settings,engine);
  }
  if(offset!==file.size)throw new Error('采样包含多余或损坏的数据');return result;
}
