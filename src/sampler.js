export const SAMPLE_MODES = ['loop', 'oneshot', 'hold', 'hold-oneshot', 'toggle-loop', 'toggle-oneshot'];
export const isSampleLoop = mode => ['loop', 'hold', 'toggle-loop'].includes(mode);
export const isSampleHold = mode => ['hold', 'hold-oneshot'].includes(mode);
export const isSampleToggle = mode => ['toggle-loop', 'toggle-oneshot'].includes(mode);

// DJUCED stores a sampler page count (1–4), while the older MIXDESK format
// called the same setting `display` and used visible-cell counts 4/8/16. Keep
// those values for backwards compatibility and reserve display=3 for the
// native three-page layout. The native view intentionally leaves the fourth
// cell hidden when pageCount is three (the decompiled view code uses integer
// division for that case).
export function samplerPageCount(settings = {}) {
  return settings.display === 3 ? 3 : 16 / Number(settings.display || 8);
}

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
export function samplerSettings(input = {}) {
  const value = { volume:.65, beats:1, target:0, display:8, page:0, quantize:false, defaultMode:'loop', packBpm:null, groupVolumes:[1,1,1,1], ...input };
  if(value.packBpm!==null&&(!Number.isFinite(value.packBpm)||value.packBpm<30||value.packBpm>300))throw new Error('采样包 BPM 应为 30–300');
  const pages = samplerPageCount(value);
  if (!SAMPLE_MODES.includes(value.defaultMode) || !Number.isFinite(value.volume) || value.volume < 0 || value.volume > 1 || !Number.isFinite(value.beats) || value.beats < .25 || value.beats > 32 || !Number.isInteger(value.target) || value.target < 0 || value.target > 3 || ![3,4,8,16].includes(value.display) || !Number.isInteger(value.page) || value.page < 0 || value.page >= pages || !Array.isArray(value.groupVolumes) || value.groupVolumes.length !== 4 || value.groupVolumes.some(n => !Number.isFinite(n) || n < 0 || n > 1)) throw new Error('采样器设置无效');
  return { volume:value.volume, beats:value.beats, target:value.target, display:value.display, page:value.page, quantize:!!value.quantize, defaultMode:value.defaultMode, packBpm:value.packBpm, groupVolumes:[...value.groupVolumes] };
}
export function visibleSampleIndices(settings) {
  const pages = samplerPageCount(settings), page = settings.page;
  let cells;
  if (pages === 1) cells = [0, 1, 2, 3];
  else if (pages === 2) cells = [page * 2, page * 2 + 1];
  else if (pages === 3) cells = page < 3 ? [page] : [];
  else cells = [page];
  return Array.from({length:4}, (_,group) => cells.map(cell => group * 4 + cell)).flat();
}

// Each deck has four monophonic groups. Each group selects one of four
// samples; different groups can sound together. Voices own their audio nodes
// so replacing a pending selection never destroys the voice still playing.
class SamplerDeck {
  constructor(owner, id) {
    this.owner=owner; this.engine=owner.engine; this.context=owner.context; this.id=id;this.tails=new Set();
    this.settings=samplerSettings({target:id<2?id:id-2});
    this.output=this.context.createGain(); this.output.gain.value=this.settings.volume; this.output.connect(owner.output);
    this.groups=Array.from({length:4},()=>{const level=this.context.createGain();level.connect(this.output);return {level,selected:0,active:null,pending:null,generation:0,timer:null,held:new Map()};});
    this.slots=Array.from({length:16},(_,i)=>this.prepareSlot(i,{config:this.defaultConfig(i)}));
  }
  changed(){this.owner.onchange();}
  defaultBuffer(index){return synthSample(this.context,index);}
  defaultConfig(index){const b=this.defaultBuffer(index);return sampleConfig({name:['Kick','Clap','Hat','Chord'][index%4]},b.duration);}
  prepareSlot(index,record){
    const buffer=record?.empty?null:record?.buffer||(!record?.file?this.defaultBuffer(index):null);
    if(!record?.empty&&(!buffer||!Number.isFinite(buffer.duration)||buffer.duration<=0||buffer.duration>30))throw new Error('采样音频无效');
    const config=buffer?sampleConfig(record.config,buffer.duration):{name:'空样本',mode:'oneshot',gain:1,start:0,end:0,bpm:null,sync:false,keyLock:false};
    return {...config,buffer,file:record?.file||null,source:null,pending:false,held:new Set(),startedAt:0,rate:1};
  }
  record(index){const s=this.slots[index];return s.buffer?{file:s.file,config:sampleConfig(s,s.buffer.duration)}:{empty:true};}
  defaultRecord(index){return {file:null,config:this.defaultConfig(index)};}
  group(index){return this.groups[Math.floor(index/4)];}
  isActive(index){const g=this.group(index);return !!g&&(g.active?.index===index||g.pending?.index===index);}
  groupActive(group){const g=this.groups[group];return !!(g?.active||g?.pending);}
  triggerMode(index){return this.slots[index]?.mode||'oneshot';}
  configureGlobal(patch){this.settings=samplerSettings({...this.settings,...patch});this.applyLevels();this.changed();}
  applyLevels(){this.output.gain.setTargetAtTime(this.settings.volume,this.context.currentTime,.02);this.groups.forEach((g,i)=>g.level.gain.setTargetAtTime(this.settings.groupVolumes[i],this.context.currentTime,.01));}
  configure(index,patch){const s=this.slots[index];if(!s?.buffer)throw new Error('请先载入样本');const config=sampleConfig({...s,...patch},s.buffer.duration);this.stop(index);Object.assign(s,config);this.changed();}
  load(index,buffer,name,file=null,config=null){
    if(!this.slots[index])throw new Error('采样槽位无效');
    const s=this.prepareSlot(index,{buffer,file,config:sampleConfig({mode:this.settings.defaultMode,...config,name:config?.name||name},buffer.duration)});
    this.stop(index);this.slots[index]=s;this.changed();
  }
  reset(index){this.stop(index);this.slots[index]=this.prepareSlot(index,{empty:true});this.changed();}
  timing(slot){
    const deck=this.engine.decks[this.settings.target],now=this.context.currentTime;let when=now,rate=1;
    if(slot.sync&&slot.bpm&&deck?.track)rate=Math.max(.5,Math.min(2,deck.musicalBpm/slot.bpm));
    if(this.settings.quantize&&deck?.playing){
      const position=deck.position,segments=deck.beatGrid.slice().sort((a,b)=>a.start-b.start),current=deck.beatGridAt(position),first=Math.max(0,segments.findIndex(item=>item===current));let candidate=null;
      for(let i=first;i<segments.length;i++){const grid=segments[i],beat=60/grid.bpm,start=Math.max(position,grid.start),next=Math.ceil(((start-grid.offset)/beat-1e-7)/this.settings.beats)*this.settings.beats,timeline=grid.offset+next*beat,boundary=segments[i+1]?.start??deck.buffer?.duration??Infinity;if(timeline>=start-1e-7&&timeline<boundary-1e-7){candidate=timeline;break;}}
      const effective=Number.isFinite(deck.effectiveRate)?deck.effectiveRate:deck.rate;if(effective>0)when+=Math.max(0,((candidate??position)-position)/effective);
    }
    return {when,rate};
  }
  disposeVoice(voice){
    if(!voice||voice.disposed)return;voice.disposed=true;this.tails.delete(voice);clearTimeout(voice.drain);voice.source.onended=null;try{voice.source.stop();}catch{}try{voice.source.disconnect();}catch{}
    if(voice.silence){try{voice.silence.stop();}catch{}voice.silence.disconnect();}
    if(voice.pitch){voice.pitch.port.postMessage({type:'dispose'});voice.pitch.disconnect();voice.pitch.port.close();}
    voice.gate.disconnect();
    const s=this.slots[voice.index];if(s?.source===voice.source){s.source=null;s.pending=false;}
  }
  settle(group){
    const p=group.pending;if(!p?.voice||p.when>this.context.currentTime+1e-6)return;
    clearTimeout(group.timer);group.timer=null;group.pending=null;
    const old=group.active;group.active=p.voice;group.selected=p.index%4;
    if(old){if(old.index!==p.index)this.slots[old.index].held.clear();this.disposeVoice(old);}
    this.slots[p.index].pending=false;this.changed();
  }
  cancelPending(group){
    this.settle(group);group.generation++;clearTimeout(group.timer);group.timer=null;
    const p=group.pending;group.pending=null;
    if(p){this.disposeVoice(p.voice);const s=this.slots[p.index];s.pending=false;s.held.clear();if(group.active?.index===p.index)s.source=group.active.source;}
    // Do not schedule an irreversible old-source.stop() before the boundary:
    // cancelling a held pending selection must leave the previous audio alive.
    if(group.active){const gate=group.active.gate.gain;gate.cancelScheduledValues(this.context.currentTime);gate.setValueAtTime(group.active.gain,this.context.currentTime);}
  }
  async trigger(index){
    const s=this.slots[index],g=this.group(index);if(!s?.buffer)return;this.settle(g);
    if(isSampleToggle(s.mode)&&this.isActive(index)){this.stop(index);return;}
    return this.start(index);
  }
  async press(index,key){const s=this.slots[index];if(!s?.buffer)return;if(!isSampleHold(s.mode))return this.trigger(index);if(s.held.has(key))return;const first=s.held.size===0;s.held.add(key);if(first)return this.start(index,true);}
  release(index,key){const s=this.slots[index];if(s?.held.delete(key)&&!s.held.size&&isSampleHold(s.mode))this.stop(index);}
  async pressGroup(group,key){
    const g=this.groups[group];
    if(!g||!Number.isInteger(group)||group<0||group>=this.groups.length)return;
    if (g.held.has(key)) return;
    const index=group*4+g.selected;
    if (!this.slots[index]?.buffer) return;
    g.held.set(key,index);
    try { return await this.press(index,key); }
    catch (error) { g.held.delete(key); throw error; }
  }
  releaseGroup(group,key){
    const g=this.groups[group]; if(!g)return;
    const index=g.held.get(key); if(index==null)return;
    g.held.delete(key); this.release(index,key);
  }
  releasePrefix(prefix){
    this.groups.forEach(g=>{for(const [key,index] of [...g.held])if(key.startsWith(prefix)){g.held.delete(key);this.release(index,key);}});
    this.slots.forEach((s,i)=>{for(const key of [...s.held])if(key.startsWith(prefix))this.release(i,key);});
  }
  async start(index,preserveHolds=false){
    const slot=this.slots[index],group=this.group(index);if(!slot?.buffer)return;
    const held=preserveHolds?new Set(slot.held):new Set();this.cancelPending(group);slot.held=held;
    const token=group.generation,pending={index,voice:null,when:Infinity};group.pending=pending;slot.pending=true;this.changed();
    let voice=null;
    try{
      if(slot.keyLock&&this.engine.pitchReady)await this.engine.pitchReady;
      if(token!==group.generation)return;
      if(slot.keyLock&&!this.engine.pitchAvailable)throw new Error('当前浏览器不支持采样 Key Lock');
      await this.context.resume();if(token!==group.generation)return;
      const {when,rate}=this.timing(slot),source=this.context.createBufferSource(),gate=this.context.createGain();
      voice={index,source,gate,gain:slot.gain,pitch:null,silence:null};
      gate.gain.value=slot.gain;gate.connect(group.level);source.buffer=slot.buffer;source.playbackRate.value=rate;
      if(slot.keyLock){
        voice.pitch=new AudioWorkletNode(this.context,'mixdesk-pitch',{numberOfInputs:1,numberOfOutputs:1,outputChannelCount:[2]});
        voice.silence=this.context.createConstantSource();voice.silence.offset.value=0;voice.silence.connect(voice.pitch);voice.silence.start();
        voice.pitch.parameters.get('playbackRate').value=rate;voice.pitch.parameters.get('pitch').value=1;voice.pitch.parameters.get('pitchSemitones').value=0;
        voice.pitch.onprocessorerror=()=>this.stopGroup(Math.floor(index/4));source.connect(voice.pitch).connect(gate);
      }else source.connect(gate);
      source.loop=isSampleLoop(slot.mode);source.loopStart=slot.start;source.loopEnd=slot.end;
      source.onended=()=>{
        this.settle(group);if(group.active===voice)group.active=null;if(group.pending?.voice===voice){group.pending=null;clearTimeout(group.timer);}
        if(slot.source===source){slot.source=null;slot.pending=false;slot.held.clear();}
        if(voice.pitch){this.tails.add(voice);voice.drain=setTimeout(()=>this.disposeVoice(voice),250);}else this.disposeVoice(voice);this.changed();
      };
      source.start(when,slot.start);if(!source.loop)source.stop(when+(slot.end-slot.start)/rate);
      Object.assign(slot,{source,pending:when>this.context.currentTime,startedAt:when,rate});Object.assign(pending,{voice,when});
      // Gain automation switches at audio time; the timer only retires nodes.
      if(group.active)group.active.gate.gain.setValueAtTime(0,when);
      const commit=()=>{if(group.pending!==pending)return;if(this.context.currentTime+1e-6<when){group.timer=setTimeout(commit,Math.max(4,(when-this.context.currentTime)*1000));return;}this.settle(group);};
      if(when<=this.context.currentTime)commit();else group.timer=setTimeout(commit,Math.max(4,(when-this.context.currentTime)*1000));
      this.changed();
    }catch(error){this.disposeVoice(voice);if(token===group.generation)this.cancelPending(group);this.changed();throw error;}
  }
  stop(index){for(const voice of this.tails)if(voice.index===index)this.disposeVoice(voice);const group=this.group(index);if(!group)return;for(const [key,heldIndex] of [...group.held])if(heldIndex===index)group.held.delete(key);this.settle(group);if(group.pending?.index===index)this.cancelPending(group);if(group.active?.index===index){this.disposeVoice(group.active);group.active=null;}this.slots[index].held.clear();this.slots[index].pending=false;this.changed();}
  stopGroup(index){for(const voice of this.tails)if(Math.floor(voice.index/4)===index)this.disposeVoice(voice);const g=this.groups[index];if(!g)return;this.cancelPending(g);this.disposeVoice(g.active);g.active=null;g.held.clear();this.slots.slice(index*4,index*4+4).forEach(s=>s.held.clear());this.changed();}
  playGroup(index){const g=this.groups[index];if(!g)return;if(this.groupActive(index)){this.stopGroup(index);return;}return this.start(index*4+g.selected);}
  stopAll(){this.groups.forEach((_,i)=>this.stopGroup(i));}
  prepareReplacement(pack){if(!Array.isArray(pack.slots)||pack.slots.length!==16)throw new Error('采样包槽位数量无效');return {slots:pack.slots.map((s,i)=>this.prepareSlot(i,s)),settings:samplerSettings(pack.settings)};}
  stageReplacement(prepared){
    // Preparation has already validated every record. Do not mutate the live
    // bank until IndexedDB commits: its pending audio callbacks can still run
    // while the transaction is open, and an abort must preserve those voices.
    let finished=false;
    return {commit:()=>{if(finished)return;finished=true;this.stopAll();this.slots=prepared.slots;this.settings=prepared.settings;this.groups.forEach(g=>g.selected=0);this.applyLevels();this.changed();},rollback:()=>{finished=true;}};
  }
}

export class Sampler {
  constructor(engine){this.engine=engine;this.context=engine.context;this.output=this.context.createGain();this.output.connect(engine.master);this.activeDeck=0;this.onchange=()=>{};this.decks=Array.from({length:4},(_,id)=>new SamplerDeck(this,id));}
  get bank(){return this.decks[this.activeDeck];}
  get slots(){return this.bank.slots;}
  get settings(){return this.bank.settings;}
  selectDeck(id){if(!Number.isInteger(id)||id<0||id>3)throw new Error('采样台无效');this.activeDeck=id;this.onchange();}
  defaultBuffer(i){return this.bank.defaultBuffer(i);}
  defaultConfig(i){return this.bank.defaultConfig(i);}
  record(i,deck=this.activeDeck){return this.decks[deck].record(i);}
  defaultRecord(i){return this.bank.defaultRecord(i);}
  configure(i,patch,deck=this.activeDeck){return this.decks[deck].configure(i,patch);}
  configureGlobal(patch){return this.bank.configureGlobal(patch);}
  load(i,b,n,f=null,c=null,deck=this.activeDeck){return this.decks[deck].load(i,b,n,f,c);}
  reset(i){return this.bank.reset(i);}
  isActive(i){return this.bank.isActive(i);}
  triggerMode(i){return this.bank.triggerMode(i);}
  timing(s){return this.bank.timing(s);}
  trigger(i){return this.bank.trigger(i);}
  press(i,key,deck=this.activeDeck){return this.decks[deck].press(i,key);}
  release(i,key,deck=this.activeDeck){return this.decks[deck].release(i,key);}
  pressGroup(group,key,deck=this.activeDeck){return this.decks[deck].pressGroup(group,key);}
  releaseGroup(group,key,deck=this.activeDeck){return this.decks[deck].releaseGroup(group,key);}
  releasePrefix(prefix){this.decks.forEach(d=>d.releasePrefix(prefix));}
  stop(i){return this.bank.stop(i);}
  stopGroup(group,deck=this.activeDeck){return this.decks[deck].stopGroup(group);}
  groupActive(group,deck=this.activeDeck){return this.decks[deck].groupActive(group);}
  playGroup(group,deck=this.activeDeck){return this.decks[deck].playGroup(group);}
  stopAll(){this.decks.forEach(d=>d.stopAll());}
  prepareReplacement(pack){const deck=pack.deck??this.activeDeck;return {deck,...this.decks[deck].prepareReplacement(pack)};}
  discardReplacement(){}
  stageReplacement(p){return this.decks[p.deck].stageReplacement(p);}
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
