const explicit = id => typeof id === 'string' && id && !['default', 'communications'].includes(id);

// PFL is tapped after EQ/FX but before channel faders. No path returns to master
// or the recorder. A separate media element routes it to a second stereo device.
export class MonitorBus {
  constructor(engine) {
    this.engine = engine; this.context = engine.context;
    this.destination = this.context.createMediaStreamDestination();
    this.level = this.context.createGain(); this.level.gain.value = 0.6;
    this.cueMix = this.context.createGain(); this.masterMix = this.context.createGain();
    this.masterMix.gain.value = 0;
    this.cueMix.connect(this.level); engine.analyser.connect(this.masterMix).connect(this.level);
    this.analyser = this.context.createAnalyser(); this.analyser.fftSize = 512;
    this.safety = this.context.createGain(); this.safety.gain.value = 0;
    this.level.connect(this.safety).connect(this.analyser).connect(this.destination);
    this.gates = engine.decks.map(deck => {
      const gate = this.context.createGain(); gate.gain.value = 0;
      deck.pflTap.connect(gate).connect(this.cueMix); return gate;
    });
    this.selected = engine.decks.map(() => false); this.enabled = false;
    this.audio = new Audio(); this.audio.srcObject = this.destination.stream;
    this.previousSink = ''; this.masterId = ''; this.headphoneId = '';
    this.busy = false; this.generation = 0; this.operation = null; this.onchange = () => {};
  }
  get supported() { return !!(this.context.setSinkId && this.audio.setSinkId); }
  select(id, selected) {
    if (!this.gates[id]) return;
    this.selected[id] = !!selected;
    const gain = this.gates[id].gain;
    gain.cancelScheduledValues(this.context.currentTime);
    gain.setTargetAtTime(selected ? 1 : 0, this.context.currentTime, 0.01);
    this.onchange();
  }
  volume(value) { this.level.gain.setTargetAtTime(Math.max(0, Math.min(1, value)), this.context.currentTime, 0.01); }
  blend(value) {
    const x = Math.max(0, Math.min(1, value));
    this.cueMix.gain.setTargetAtTime(1 - x, this.context.currentTime, 0.01);
    this.masterMix.gain.setTargetAtTime(x, this.context.currentTime, 0.01);
  }
  mute() {
    this.enabled = false;
    this.safety.gain.cancelScheduledValues(this.context.currentTime);
    this.safety.gain.setValueAtTime(0, this.context.currentTime);
    this.audio.pause(); this.onchange();
  }
  async enable(masterId, headphoneId) {
    if (this.busy) throw new Error('正在切换音频设备，请稍候');
    if (!explicit(masterId) || !explicit(headphoneId) || masterId === headphoneId) throw new Error('请选择两个不同的实际输出设备');
    if (!this.supported) throw new Error('当前浏览器不支持独立输出，请使用新版 Chrome');
    const previous = this.enabled ? this.previousSink : (typeof this.context.sinkId === 'string' ? this.context.sinkId : '');
    const generation = ++this.generation;
    const check = () => { if (generation !== this.generation) throw new Error('输出切换已取消'); };
    this.busy = true; this.mute();
    const operation = (async () => {
      try {
        await this.context.resume(); check();
        await this.audio.setSinkId(headphoneId); check();
        await this.context.setSinkId(masterId); check();
        await this.audio.play(); check();
        this.previousSink = previous; this.masterId = masterId; this.headphoneId = headphoneId;
        this.enabled = true; this.safety.gain.setValueAtTime(1, this.context.currentTime);
      } catch (error) {
        this.mute(); this.masterId = ''; this.headphoneId = '';
        try { await this.context.setSinkId(previous); }
        catch { throw new Error(`${error.message}；主输出恢复失败，请重新选择输出设备`); }
        throw error;
      } finally { this.busy = false; this.onchange(); }
    })();
    this.operation = operation;
    return operation;
  }
  async disable() {
    ++this.generation;
    const wasEnabled = this.enabled;
    this.mute(); // Immediate mute also cancels in-flight device changes.
    if (this.busy) await this.operation?.catch(() => {});
    if (wasEnabled) {
      this.busy = true;
      try { await this.context.setSinkId(this.previousSink); }
      finally { this.busy = false; this.masterId = ''; this.headphoneId = ''; this.onchange(); }
    }
  }
}
