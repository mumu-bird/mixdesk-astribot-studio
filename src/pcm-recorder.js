import processorUrl from './pcm-worklet.js?worker&url';
import {createRecording,appendRecording,finishRecording,recordingData} from './recording-store.js';
import {wavHeader} from './wav.js';
const modules=new WeakMap();
export async function exportRecording(id) {
  const {session,parts}=await recordingData(id);
  if(!session.frames)throw new Error('还没有已保存的音频片段');
  return new Blob([wavHeader(session.frames,session.channels,session.sampleRate,session.bitDepth),...parts],{type:'audio/wav'});
}
export class PCMRecorder {
  constructor(engine,{onprogress=()=>{},onerror=()=>{},onstop=()=>{}}={}) {
    this.engine=engine;this.context=engine.context;this.onprogress=onprogress;this.onerror=onerror;this.onstop=onstop;
    this.state='inactive';this.chain=Promise.resolve();this.pendingBytes=0;this.session=null;this.node=null;this.failed=false;this.finalizing=false;
  }
  async start(bitDepth=24) {
    if(this.state!=='inactive')throw new Error('录音已启动');
    if(![16,24].includes(bitDepth))throw new Error('不支持的 PCM 位深');
    if(!this.context.audioWorklet)throw new Error('当前浏览器不支持原生 WAV 录音');
    this.state='starting';
    try {
      await this.context.resume();
      if(!modules.has(this.context))modules.set(this.context,this.context.audioWorklet.addModule(processorUrl).catch(error=>{modules.delete(this.context);throw error;}));
      await modules.get(this.context);
      const session={id:crypto.randomUUID(),createdAt:Date.now(),updatedAt:Date.now(),sampleRate:this.context.sampleRate,channels:2,bitDepth,frames:0,bytes:0,chunkCount:0,clipped:0,peak:0,status:'recording'};
      await createRecording(session);this.session=session;
      this.stopped=new Promise(resolve=>{this.resolveStop=resolve;});
      const maxFrames=Math.min(Math.floor(this.context.sampleRate*1800),Math.floor((1024**3-44)/(2*bitDepth/8)));
      this.node=new AudioWorkletNode(this.context,'mixdesk-pcm-recorder',{numberOfInputs:1,numberOfOutputs:1,outputChannelCount:[2],channelCount:2,channelCountMode:'explicit',processorOptions:{bitDepth,maxFrames}});
      this.node.port.onmessage=e=>this.message(e.data);
      this.node.onprocessorerror=()=>this.fail(new Error('录音处理器异常，已保留写入完成的片段'));
      this.engine.analyser.connect(this.node);this.node.connect(this.context.destination);
      this.state='recording';this.onprogress(this.session);
    } catch(error) {
      this.state='inactive';this.disconnect();
      if(this.session)await finishRecording(this.session.id,'error',error.message).catch(()=>{});
      throw error;
    }
  }
  message(data) {
    if(data?.type==='chunk') {
      if(this.failed)return;
      const size=data.bytes.byteLength;this.pendingBytes+=size;
      if(this.pendingBytes>8*1024*1024){this.pendingBytes-=size;this.fail(new Error('本机存储写入过慢，录音已停止并保留已写入片段'));return;}
      this.chain=this.chain.then(async()=>{
        try {if(this.failed)return;this.session=await appendRecording(this.session.id,data.index,data.bytes,data.frames,data.clipped,data.peak);this.onprogress(this.session);}
        finally {this.pendingBytes-=size;}
      }).catch(error=>{this.fail(new Error('录音缓存写入失败：'+(error.message||'存储空间不足')));});
    } else if(data?.type==='stopped')this.finalize(data.reason);
  }
  stop() {
    if(this.state==='inactive')return Promise.resolve(this.session);
    if(this.state==='recording') {
      this.state='stopping';this.node.port.postMessage({type:'stop'});
      // A suspended/failed render thread must not leave the UI stuck forever.
      this.timeout=setTimeout(()=>this.fail(new Error('录音停止超时，已保留写入完成的片段')),5000);
    }
    return this.stopped;
  }
  fail(error) {
    if(this.failed)return;this.failed=true;this.failure=error;this.onerror(error);
    this.node?.port.postMessage({type:'stop'});void this.finalize('error');
  }
  async finalize(reason) {
    if(this.finalizing)return;this.finalizing=true;this.state='stopping';clearTimeout(this.timeout);this.disconnect();
    await this.chain;
    try {this.session=await finishRecording(this.session.id,this.failed?'error':'complete',this.failure?.message||'');}
    catch(error){this.failed=true;this.failure=error;this.onerror(new Error('录音状态保存失败；已写入片段可在录音管理中恢复'));}
    this.state='inactive';this.resolveStop?.(this.session);this.onstop(this.session,{reason,failed:this.failed});
  }
  disconnect() {
    if(!this.node)return;
    try {this.engine.analyser.disconnect(this.node);}catch{}
    this.node.disconnect();this.node.port.onmessage=null;this.node.port.close();this.node=null;
  }
}
