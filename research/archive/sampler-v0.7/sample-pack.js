import { sampleConfig, samplerSettings } from './sampler.js';
import { encodeWav } from './wav.js';
const magic='MXPACK01',maxFile=30*1024**2,maxSlots=16,maxLayers=4,maxPack=maxSlots*maxLayers*maxFile+65548;

function boundedBpm(value) {
  const bpm=Number(value);
  return Number.isFinite(bpm)&&bpm>=30&&bpm<=300?bpm:null;
}

/**
 * Read DJUCED's shipped XML sample-pack description. Audio is deliberately
 * supplied by the caller as selected local files; a browser cannot and should
 * not follow paths embedded in the XML.
 */
export async function importDjucedSamplePack(files, engine) {
  const selected=Array.from(files||[]), descriptor=selected.find(file=>/\.djs$/i.test(file.name));
  if(!descriptor) throw new Error('请选择 DJUCED 的 .djs 采样包描述文件');
  const xml=await descriptor.text(), doc=new DOMParser().parseFromString(xml,'application/xml');
  if(doc.querySelector('parsererror')||doc.documentElement?.tagName!=='pack')throw new Error('DJUCED 采样包 XML 无效');
  const audioByName=new Map(selected.filter(file=>file!==descriptor).map(file=>[file.name.toLowerCase(),file]));
  const pack=doc.documentElement, samplers=Array.from(pack.children).filter(node=>node.tagName.toLowerCase()==='sampler');
  if(!samplers.length)throw new Error('DJUCED 采样包没有采样槽');
  const records=Array.from({length:maxSlots},(_,index)=>({file:null,config:engine.sampler.defaultConfig(index),layers:[]}));
  const missing=[];
  for(const sampler of samplers) {
    const bank=Number(sampler.getAttribute('idx'));
    if(!Number.isInteger(bank)||bank<0||bank>3)continue;
    const samples=Array.from(sampler.children).filter(node=>node.tagName.toLowerCase()==='sample');
    for(const sample of samples) {
      const cell=Number(sample.getAttribute('idx')),index=bank*4+cell;
      if(!Number.isInteger(cell)||cell<0||cell>3)continue;
      const filename=(sample.getAttribute('file')||'').trim(),audio=audioByName.get(filename.split(/[\\/]/).pop().toLowerCase());
      if(!filename||!audio){missing.push(filename||`采样 ${index+1}`);continue;}
      if(!Number.isInteger(audio.size)||audio.size<1||audio.size>maxFile)throw new Error(`采样音频请小于 30 MB：${audio.name}`);
      let buffer;
      try{buffer=await engine.decode(audio);}catch{throw new Error(`采样音频无法解码：${audio.name}`);}
      if(!Number.isFinite(buffer?.duration)||buffer.duration<=0||buffer.duration>30)throw new Error(`采样音频请控制在 30 秒内：${audio.name}`);
      const type=Number(sample.getAttribute('type'));
      const bpm=boundedBpm(sample.getAttribute('bpm')||pack.getAttribute('bpm'));
      const name=(sample.getAttribute('title')||filename.replace(/\.[^.]+$/,'')).trim();
      const config=sampleConfig({name:name||`Sample ${index+1}`,mode:type===0?'loop':'oneshot',start:0,end:buffer.duration,bpm,sync:type===0&&bpm!==null,keyLock:false},buffer.duration);
      records[index]={file:audio,buffer,config,layers:[]};
    }
  }
  if(missing.length)throw new Error(`未选择 DJUCED 采样音频：${[...new Set(missing)].slice(0,8).join('、')}`);
  const quant=Number(pack.getAttribute('quant')),beats=[.25,.5,1,2,4,8,16,32].includes(quant)?quant:1;
  return {slots:records,settings:{volume:.65,beats,target:0,display:8,page:0,quantize:/^(1|true|yes)$/i.test(pack.getAttribute('quant-enabled')||'')}};
}

export function exportSamplePack(sampler) {
  const parts=[];
  const entry=(record,layer)=>{
    // A layer loaded directly from an AudioBuffer still needs real audio in
    // an exported package. Never assume that every file-less buffer is one
    // of the built-in synth sounds.
    const audio=record.file||new File([encodeWav(layer.buffer)],`${record.config.name}.wav`,{type:'audio/wav'});
    if(audio.size>maxFile)throw new Error('采样文件请小于 30 MB');
    parts.push(audio);
    return {config:record.config,file:{name:audio.name,type:audio.type,size:audio.size}};
  };
  const slots=sampler.slots.map((slot,index)=>{
    const record=sampler.record(index),primary=entry(record,slot);
    return {...primary,layers:record.layers.map((layer,i)=>layer?entry(layer,slot.layers[i]):null)};
  });
  const manifest=new TextEncoder().encode(JSON.stringify({version:3,slots,settings:sampler.settings}));
  if(manifest.length>65536)throw new Error('采样包目录过大');
  const header=new Uint8Array(12);header.set(new TextEncoder().encode(magic));new DataView(header.buffer).setUint32(8,manifest.length,true);
  return new Blob([header,manifest,...parts],{type:'application/octet-stream'});
}

export async function importSamplePack(file,engine) {
  if(file.size<12||file.size>maxPack)throw new Error('采样包大小无效');
  const head=await file.slice(0,12).arrayBuffer();
  if(new TextDecoder().decode(head.slice(0,8))!==magic)throw new Error('不是 MIXDESK 采样包');
  const length=new DataView(head).getUint32(8,true);
  if(!length||length>65536||12+length>file.size)throw new Error('采样包目录无效');
  let doc;
  try{doc=JSON.parse(await file.slice(12,12+length).text());}catch{throw new Error('采样包目录无效');}
  if(![1,2,3].includes(doc?.version)||!Array.isArray(doc.slots)||![8,16].includes(doc.slots.length))throw new Error('采样包必须包含八个或十六个槽位');
  const settings=samplerSettings({...doc.settings,beats:Number(doc.settings?.beats),target:Number(doc.settings?.target)});
  let offset=12+length;
  const readEntry=async(entry,index)=>{
    if(!entry||typeof entry!=='object'||Array.isArray(entry))throw new Error('采样槽位或层无效');
    let audio=null,buffer=null;
    const builtinDuration=engine.sampler.defaultBuffer(index).duration;
    let duration=builtinDuration;
    if(entry.file!=null) {
      const meta=entry.file;
      if(typeof meta.name!=='string'||!meta.name.trim()||!Number.isInteger(meta.size)||meta.size<1||meta.size>maxFile||offset+meta.size>file.size)throw new Error('采样文件超出包范围');
      audio=new File([file.slice(offset,offset+meta.size)],meta.name.slice(0,200),{type:typeof meta.type==='string'?meta.type.slice(0,100):''});
      offset+=meta.size;
      try{buffer=await engine.decode(audio);}catch{throw new Error('采样包中的音频无法解码');}
      if(!Number.isFinite(buffer?.duration)||buffer.duration<=0||buffer.duration>30)throw new Error('采样必须不超过 30 秒');
      duration=buffer.duration;
    }
    let input=entry.config;
    // Older packages stored built-in sounds as configuration only. Their
    // synthesized frame counts can differ by one frame across sample rates.
    if(!audio&&Number(input?.end)>duration&&Number(input.end)<=duration+1/8000)input={...input,end:duration};
    return {file:audio,buffer,config:sampleConfig(input,duration)};
  };
  const result=[];
  for(const [index,slot] of doc.slots.entries()) {
    const primary=await readEntry(slot,index),layers=[];
    if(doc.version>=3&&slot.layers!=null) {
      if(!Array.isArray(slot.layers)||slot.layers.length>maxLayers-1)throw new Error('采样层数量无效');
      for(const layer of slot.layers)layers.push(layer===null?null:await readEntry(layer,index));
    }
    result.push({...primary,layers});
  }
  if(offset!==file.size)throw new Error('采样包含多余或损坏的数据');
  while(result.length<maxSlots) {
    const index=result.length;
    result.push({file:null,buffer:null,config:engine.sampler.defaultConfig(index),layers:[]});
  }
  return {slots:result,settings};
}
