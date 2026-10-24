export const SAMPLE_MODES = ['loop', 'oneshot', 'hold', 'hold-oneshot', 'toggle-loop', 'toggle-oneshot'];
export const isSampleLoop = mode => ['loop', 'hold', 'toggle-loop'].includes(mode);
export const isSampleHold = mode => ['hold', 'hold-oneshot'].includes(mode);
export const isSampleToggle = mode => ['toggle-loop', 'toggle-oneshot'].includes(mode);

export function sampleConfig(input, duration) {
  if (!input || typeof input !== 'object') throw new Error('采样设置无效');
  const name = typeof input.name === 'string' ? input.name.trim().slice(0,100) : '';
  const mode = input.mode || 'oneshot', start = Number(input.start ?? 0), end = Number(input.end ?? duration), gain = Number(input.gain ?? 1);
  const bpm = input.bpm === '' || input.bpm == null ? null : Number(input.bpm);
  if (!name) throw new Error('采样名称不能为空');
  if (!SAMPLE_MODES.includes(mode)) throw new Error('采样模式无效');
  if (![start,end,gain].every(Number.isFinite) || start < 0 || end > duration + 0.000001 || end-start < 0.001 || gain < 0 || gain > 2) throw new Error('采样范围或音量无效');
  if (bpm !== null && (!Number.isFinite(bpm) || bpm < 30 || bpm > 300)) throw new Error('采样 BPM 应为 30–300');
  return { name,mode,start,end:Math.min(end,duration),gain,bpm,sync:!!input.sync,keyLock:!!input.keyLock };
}
const MAX_LAYERS = 4;
export function samplerSettings(input) {
  const value={...input};
  const display=Number(value.display??8),page=Number(value.page??0),pages=Math.ceil(16/display);
  if(!Number.isFinite(value.volume)||value.volume<0||value.volume>1||!Number.isFinite(value.beats)||value.beats<0.25||value.beats>32||!Number.isInteger(value.target)||value.target<0||value.target>3||![4,8,16].includes(display)||!Number.isInteger(page)||page<0||page>=pages)throw new Error('采样器设置无效');
  return {volume:value.volume,beats:value.beats,target:value.target,display,page,quantize:!!value.quantize};
}
function layerRuntime(config, buffer, file = null, context = null, output = null) {
  const level = context?.createGain?.();
  if (level) { try { level.gain.value = config.gain; level.connect(output); } catch(error) { level.disconnect();throw error; } }
  return { ...config, buffer, file, level, source:null, pitchNode:null, pitchSilence:null, pending:false, startedAt:0, rate:1 };
}
export class Sampler {
  constructor(engine) {
    this.engine = engine; this.context = engine.context;
    this.output = this.context.createGain(); this.output.gain.value = 0.65;
    this.output.connect(engine.master);
    this.settings = { volume:0.65,quantize:false,beats:1,target:0,display:8,page:0 };
    this.slots = Array.from({ length: 16 }, (_, index) => {
      const buffer=synthSample(this.context,index), level=this.context.createGain();level.connect(this.output);
      return { ...sampleConfig({name:['Kick','Clap','Hat','Chord'][index%4]},buffer.duration),buffer,level,file:null,source:null,pitchNode:null,pitchSilence:null,generation:0,pending:false,held:new Set(),startedAt:0,rate:1,layers:[null,null,null] };
    });
    this.onchange = () => {};
  }
  layer(index, layerIndex = 0) {
    const slot=this.slots[index],number=Number(layerIndex);
    if (!slot || !Number.isInteger(number) || number<0 || number>=MAX_LAYERS) return null;
    return number===0 ? slot : slot.layers[number-1];
  }
  layerCount(index) { const slot=this.slots[index]; return slot ? 1 + slot.layers.filter(Boolean).length : 0; }
  isActive(index) { return this.layers(index).some(layer => layer.source || layer.pending); }
  triggerMode(index) {
    const layers = this.layers(index);
    if (layers.some(layer => layer.mode === 'hold')) return 'hold';
    if (layers.some(layer => layer.mode === 'loop')) return 'loop';
    return 'oneshot';
  }
  defaultConfig(index) {
    const slot=this.slots[index];
    if (!slot) throw new Error('采样槽位无效');
    const buffer=synthSample(this.context,index);
    return sampleConfig({name:['Kick','Clap','Hat','Chord'][index%4]}, buffer.duration);
  }
  defaultBuffer(index) { return synthSample(this.context,index); }
  prepareSlot(index,record) {
    let slot;
    try {
      const buffer=record.buffer||(!record.file?this.defaultBuffer(index):null);
      if(!buffer||buffer.duration>30)throw new Error('采样音频无效');
      slot={...layerRuntime(sampleConfig(record.config,buffer.duration),buffer,record.file,this.context,this.output),generation:0,held:new Set(),layers:[null,null,null]};
      if(!Array.isArray(record.layers||[])||(record.layers||[]).length>3)throw new Error('采样层数量无效');
      for(const [layerIndex,entry] of (record.layers||[]).entries()) {
        if(!entry)continue;
        const audio=entry.buffer||(!entry.file?this.defaultBuffer(index):null);
        if(!audio||audio.duration>30)throw new Error('采样层音频无效');
        slot.layers[layerIndex]=layerRuntime(sampleConfig(entry.config,audio.duration),audio,entry.file,this.context,this.output);
      }
      return slot;
    } catch(error) { if(slot)this.disposeSlot(slot); throw error; }
  }
  prepareReplacement(pack) {
    const settings=samplerSettings(pack.settings),slots=[];
    if(!Array.isArray(pack.slots)||pack.slots.length!==16)throw new Error('采样包槽位数量无效');
    try { for(const [index,record] of pack.slots.entries())slots.push(this.prepareSlot(index,record)); }
    catch(error) { slots.forEach(slot=>this.disposeSlot(slot));throw error; }
    return {slots,settings};
  }
  disposeSlot(slot) {
    slot.generation++;slot.pending=false;slot.held.clear();
    for(const layer of [slot,...slot.layers].filter(Boolean)) {
      if(layer.source){layer.source.onended=null;try{layer.source.stop();}catch{}try{layer.source.disconnect();}catch{}layer.source=null;}
      this.disposeLayerPitch(layer);
      try{layer.level?.disconnect();}catch{}
    }
  }
  discardReplacement(prepared) { if(prepared.slots!==this.slots)prepared.slots.forEach(slot=>this.disposeSlot(slot)); }
  stageReplacement(prepared) {
    const previous={slots:this.slots,settings:this.settings};
    // All buffers, settings and nodes were prepared before entering IDB. Keep
    // the old voices alive until its commit event so an abort can restore the
    // exact previous runtime, including a currently playing sample.
    this.output.gain.setTargetAtTime(prepared.settings.volume,this.context.currentTime,.02);
    this.slots=prepared.slots;this.settings=prepared.settings;
    return {
      commit:()=>{previous.slots.forEach(slot=>this.disposeSlot(slot));this.onchange();},
      rollback:()=>{
        this.slots=previous.slots;this.settings=previous.settings;
        this.output.gain.setTargetAtTime(previous.settings.volume,this.context.currentTime,.02);
        this.discardReplacement(prepared);this.onchange();
      },
    };
  }
  defaultRecord(index) {
    return {file:null,config:this.defaultConfig(index),layers:this.record(index).layers};
  }
  loadLayer(index, buffer, name, file = null, config = null, layerIndex = 0) {
    const slot=this.slots[index],number=Number(layerIndex),settings=sampleConfig({...config,name:config?.name || name},buffer.duration);
    if (!slot || !Number.isInteger(number) || number<0 || number>=MAX_LAYERS) throw new Error('采样层无效');
    this.stop(index);
    if (number===0) Object.assign(slot,settings,{buffer,file});
    else {
      const previous=slot.layers[number-1];
      previous?.level?.disconnect();
      slot.layers[number-1]=layerRuntime(settings,buffer,file,this.context,this.output);
    }
    if (number===0) slot.level.gain.value=slot.gain; else slot.layers[number-1].level.gain.value=settings.gain;
    this.onchange();
  }
  load(index, buffer, name, file = null, config = null) { this.loadLayer(index,buffer,name,file,config,0); }
  clearLayer(index, layerIndex = 0) {
    const slot=this.slots[index],number=Number(layerIndex); if (!slot || !Number.isInteger(number) || number<0 || number>=MAX_LAYERS) return false;
    this.stop(index);
    if (number===0) this.loadLayer(index,synthSample(this.context,index),['Kick','Clap','Hat','Chord'][index%4],null,null,0);
    else { const layer=slot.layers[number-1]; if(layer?.level){layer.level.disconnect();} slot.layers[number-1]=null; this.onchange(); }
    return true;
  }
  reset(index, layerIndex = 0) { return this.clearLayer(index,layerIndex); }
  configureLayer(index, patch, layerIndex = 0) {
    const slot=this.slots[index],layer=this.layer(index,layerIndex); if (!slot || !layer) throw new Error('采样层不存在');
    const config=sampleConfig({...layer,...patch},layer.buffer.duration);
    this.stop(index); Object.assign(layer,config); layer.level?.gain.setTargetAtTime(layer.gain,this.context.currentTime,.01); if (layer===slot) slot.level.gain.value=slot.gain; this.onchange();
  }
  configure(index, patch) { this.configureLayer(index,patch,0); }
  layers(index) {
    const slot=this.slots[index]; return slot ? [slot,...slot.layers].filter(Boolean) : [];
  }
  configureGlobal(patch) {
    this.settings=samplerSettings({...this.settings,...patch});this.output.gain.setTargetAtTime(this.settings.volume,this.context.currentTime,.02);this.onchange();
  }
  record(index) {
    const slot=this.slots[index];
    return {file:slot.file,config:sampleConfig(slot,slot.buffer.duration),layers:slot.layers.map(layer=>layer?{file:layer.file,config:sampleConfig(layer,layer.buffer.duration)}:null)};
  }
  timing(slot) {
    const deck=this.engine.decks[this.settings.target],now=this.context.currentTime;
    let when=now,rate=1;
    if(slot.sync&&slot.bpm&&deck?.track)rate=Math.max(.5,Math.min(2,deck.musicalBpm/slot.bpm));
    if(this.settings.quantize&&deck?.playing) {
      const interval=this.settings.beats, position=deck.position, segments=deck.beatGrid.slice().sort((a,b)=>a.start-b.start);
      const current=deck.beatGridAt(position), currentIndex=Math.max(0,segments.findIndex(item=>item===current));
      let candidate=null;
      for(let index=currentIndex;index<segments.length;index++) {
        const grid=segments[index], beat=60/grid.bpm, start=Math.max(position,grid.start), phase=(start-grid.offset)/beat;
        const next=Math.ceil((phase-1e-7)/interval)*interval, timeline=grid.offset+next*beat;
        const boundary=segments[index+1]?.start ?? deck.buffer?.duration ?? Infinity;
        if(timeline >= start-1e-7 && timeline < boundary-1e-7) { candidate=timeline; break; }
        // A tempo change can occur before the next interval boundary. Rebase
        // the calculation on the following segment's own beat phase.
      }
      if(candidate===null) candidate=position;
      const effective=Number.isFinite(deck.effectiveRate)?deck.effectiveRate:deck.rate;
      if(effective>0) when+=Math.max(0,(candidate-position)/effective);
    }
    return {when,rate};
  }
  async trigger(index) {
    const slot=this.slots[index];if(!slot?.buffer)return;
    if(this.triggerMode(index)==='loop'&&this.isActive(index)){this.stop(index);return;}
    return this.start(index);
  }
  async press(index, key) {
    const slot=this.slots[index];if(!slot)return;
    if(this.triggerMode(index)!=='hold')return this.trigger(index);
    if(slot.held.has(key))return;
    const start=slot.held.size===0;slot.held.add(key);if(start)return this.start(index,true);
  }
  release(index,key) {
    const slot=this.slots[index];if(!slot||!slot.held.delete(key))return;
    if(!slot.held.size&&this.triggerMode(index)==='hold')this.stop(index);
  }
  releasePrefix(prefix) {this.slots.forEach((slot,i)=>{for(const key of [...slot.held])if(key.startsWith(prefix))this.release(i,key);});}
  async start(index, preserveHolds = false) {
    const slot=this.slots[index],held=preserveHolds?new Set(slot.held):new Set();this.stop(index);slot.held=held;
    const generation=slot.generation;
    if (this.layers(index).some(layer=>layer.keyLock)) {
      if (this.engine.pitchReady) await this.engine.pitchReady;
    }
    if (generation !== slot.generation) return;
    if (this.layers(index).some(layer=>layer.keyLock) && !this.engine.pitchAvailable) {
      slot.held.clear();
      throw new Error('当前浏览器不支持采样 Key Lock');
    }
    slot.pending=true;this.onchange();
    try{await this.context.resume();}catch(error){if(generation===slot.generation){slot.pending=false;slot.held.clear();this.onchange();}throw error;}
    if(generation!==slot.generation)return;
    const layers=this.layers(index), scheduled=this.timing(slot).when, started=[];
    try {
      for (const layer of layers) {
        const source=this.context.createBufferSource(), rate=this.timing(layer).rate;
        started.push({layer,source});
        source.buffer=layer.buffer;source.playbackRate.value=rate;
        if (layer.keyLock && this.engine.pitchAvailable) {
          const node = new AudioWorkletNode(this.context, 'mixdesk-pitch', { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2] });
          layer.pitchNode=node;
          const silence = this.context.createConstantSource();layer.pitchSilence=silence;silence.offset.value = 0; silence.connect(node); silence.start();
          node.parameters.get('playbackRate').value = rate; node.parameters.get('pitch').value = 1; node.parameters.get('pitchSemitones').value = 0;
          node.onprocessorerror = () => this.stop(index); source.connect(node).connect(layer.level || slot.level); layer.pitchNode=node; layer.pitchSilence=silence;
        } else source.connect(layer.level || slot.level);
        source.loop=layer.mode!=='oneshot';source.loopStart=layer.start;source.loopEnd=layer.end;
        Object.assign(layer,{source,pending:false,startedAt:scheduled,rate});
        if (layer===slot) slot.source=source;
        source.onended=()=>{source.disconnect();if(layer.source!==source)return;layer.source=null;this.drainLayerPitch(layer);if(!this.layers(index).some(item=>item.source)){slot.held.clear();this.onchange();}};
        source.start(scheduled,layer.start);if(!source.loop)source.stop(scheduled+(layer.end-layer.start)/rate);
      }
      slot.pending=false;this.onchange();
    } catch (error) {
      for (const {layer,source} of started) { source.onended=null; try { source.stop(); } catch {} source.disconnect(); if (layer.source===source) layer.source=null; this.disposeLayerPitch(layer); }
      slot.pending=false;slot.source=null;slot.held.clear();this.onchange();throw error;
    }
  }
  drainLayerPitch(layer) {
    if (!layer.pitchNode) return;
    const node=layer.pitchNode,silence=layer.pitchSilence;
    if (silence) {
      silence.onended=()=>{if(layer.pitchNode===node)this.disposeLayerPitch(layer);};
      try { silence.stop(this.context.currentTime + 0.25); } catch { this.disposeLayerPitch(layer); }
    } else this.disposeLayerPitch(layer);
  }
  disposeLayerPitch(layer) {
    if (layer.pitchSilence) { layer.pitchSilence.onended=null; try { layer.pitchSilence.stop(); } catch {} layer.pitchSilence.disconnect(); layer.pitchSilence=null; }
    if (layer.pitchNode) { layer.pitchNode.port.postMessage({type:'dispose'}); layer.pitchNode.disconnect(); layer.pitchNode.port.close(); layer.pitchNode=null; }
  }
  stop(index) {
    const slot=this.slots[index];if(!slot)return;slot.generation++;slot.pending=false;slot.held.clear();
    for (const layer of this.layers(index)) { layer.pending=false; if(layer.source){layer.source.onended=null;try{layer.source.stop();}catch{}layer.source.disconnect();layer.source=null;} this.disposeLayerPitch(layer); }
    this.onchange();
  }
  stopAll() {this.slots.forEach((_,i)=>this.stop(i));}
}

function synthSample(context, index) {
  const kind = index % 4, duration = [0.5, 0.3, 0.17, 1.2][kind];
  const buffer = context.createBuffer(1, Math.ceil(context.sampleRate * duration), context.sampleRate);
  const data = buffer.getChannelData(0); let seed = 579 + index;
  for (let i = 0; i < data.length; i++) {
    const t = i / context.sampleRate;
    seed = (1664525 * seed + 1013904223) >>> 0;
    const noise = seed / 4294967296 * 2 - 1;
    if (kind === 0) data[i] = Math.sin(2 * Math.PI * (45 * t + 5 * (1 - Math.exp(-t * 50)))) * Math.exp(-t * 12) * 0.65;
    if (kind === 1) data[i] = noise * Math.exp(-t * 22) * 0.35;
    if (kind === 2) data[i] = noise * Math.exp(-t * 40) * 0.2;
    if (kind === 3) data[i] = [220, 277.18, 329.63].reduce((sum, f) => sum + Math.sin(2 * Math.PI * f * (index > 3 ? 1.12246 : 1) * t), 0) * Math.min(1, t * 150) * Math.exp(-t * 4) * 0.12;
    data[i] *= Math.min(1, (duration - t) * 100);
  }
  return buffer;
}
