// Record the post-master signal into uncompressed interleaved PCM, in the
// audio render thread. The output is silent: this branch must not double audio.
class PCMRecorderProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super(); const config=options.processorOptions || {};
    this.bitDepth=config.bitDepth === 24 ? 24 : 16;this.bytesPerSample=this.bitDepth/8;this.channels=2;
    this.maxFrames=config.maxFrames;this.chunkFrames=16384;this.index=0;this.frames=0;this.cursor=0;this.peak=0;this.clipped=0;this.done=false;
    this.allocate();this.port.onmessage=e=>{if(e.data?.type==='stop')this.finish('manual');};
  }
  allocate() { this.bytes=new ArrayBuffer(this.chunkFrames*this.channels*this.bytesPerSample);this.view=new DataView(this.bytes); }
  flush() {
    if(!this.cursor)return;
    const bytes=this.cursor===this.chunkFrames ? this.bytes : this.bytes.slice(0,this.cursor*this.channels*this.bytesPerSample);
    this.port.postMessage({type:'chunk',index:this.index++,bytes,frames:this.cursor,clipped:this.clipped,peak:this.peak},[bytes]);
    this.cursor=0;this.clipped=0;this.peak=0;this.allocate();
  }
  finish(reason) {if(this.done)return;this.flush();this.done=true;this.port.postMessage({type:'stopped',reason,frames:this.frames});}
  process(inputs,outputs) {
    for(const channel of outputs[0] || [])channel.fill(0);
    if(this.done)return false;
    const input=inputs[0],length=outputs[0]?.[0]?.length || input?.[0]?.length || 128;
    for(let frame=0;frame<length;frame++) {
      if(this.frames>=this.maxFrames){this.finish('limit');return false;}
      for(let ch=0;ch<2;ch++) {
        const raw=input?.[ch]?.[frame] ?? input?.[0]?.[frame] ?? 0;
        const sample=Number.isFinite(raw)?raw:0;this.peak=Math.max(this.peak,Math.abs(sample));if(Math.abs(sample)>1)this.clipped++;
        const v=Math.max(-1,Math.min(1,sample)),offset=(this.cursor*2+ch)*this.bytesPerSample;
        if(this.bitDepth===16)this.view.setInt16(offset,Math.round(v*(v<0?32768:32767)),true);
        else {const n=Math.round(v*(v<0?8388608:8388607));this.view.setUint8(offset,n&255);this.view.setUint8(offset+1,(n>>8)&255);this.view.setUint8(offset+2,(n>>16)&255);}
      }
      this.cursor++;this.frames++;if(this.cursor===this.chunkFrames)this.flush();
    }
    return true;
  }
}
registerProcessor('mixdesk-pcm-recorder',PCMRecorderProcessor);
