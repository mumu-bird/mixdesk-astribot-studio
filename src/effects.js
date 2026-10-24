// Independent Web Audio implementations. Names describe effect families,
// not equivalence to DJUCED's proprietary DSP or presets.
export const EFFECT_TYPES = {
  echo: 'Echo · 回声', delay: 'Delay · 延迟', reverb: 'Reverb · 混响',
  flanger: 'Flanger · 镶边', chorus: 'Chorus · 合唱', phaser: 'Phaser · 移相',
  wah: 'WahWah · 哇音', resonance: 'Resonance · 共振', tremolo: 'Tremolo · 颤音',
  gater: 'Gater · 门限', bitcrush: 'BitCrush · 位深', drive: 'Drive · 失真',
  paramEq: 'ParamEQ · 参数均衡', dynamics: 'Dynamics · 动态', loopRoll: 'LoopRoll · 循环滚奏', noise: 'Noise · 噪声', resonanceLP: 'Resonance LP · 共振低通', resonanceHP: 'Resonance HP · 共振高通',
};
export const FILTER_FX_TYPES = {
  off: 'OFF · 纯滤波', bitcrush: 'BitCrush · 位深', chorus: 'ChorusFlanger · 合唱/镶边', delay: 'Delay · 延迟', dynamics: 'Dynamics · 动态',
  echo: 'Echo · 回声', flanger: 'Flanger · 镶边', gater: 'Gater · 门限', loopRoll: 'LoopRoll · 循环滚奏',
  noise: 'Noise · 噪声', paramEq: 'ParamEQ · 参数均衡', phaser: 'Phaser · 移相', resonanceLP: 'Resonance LP · 共振低通', resonanceHP: 'Resonance HP · 共振高通',
  reverb: 'Reverb · 混响', wah: 'WahWah · 哇音',
};
const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const EFFECT_PARAM_DEFAULTS = Object.freeze({ amount: 0.35, beats: 0.5 });

// REA exposes a parameter/limit layer around every native effect.  The
// browser DSP below does not claim to reproduce those proprietary curves, but
// keeping the same bounded state makes presets, reset and controller mapping
// deterministic and serialisable.
const PARAM_LIMITS = [[0, 1], [0.125, 4]];
const defaultLimits = () => new Map(PARAM_LIMITS.map((range, index) => [index, [...range]]));
const validParam = index => Number.isInteger(Number(index)) && Number(index) >= 0;
const finite = value => typeof value === 'number' && Number.isFinite(value);
export function clampEffectBankWetness(value, min = 0, max = 1) {
  const lower = finite(Number(min)) ? clamp(Number(min), 0, 1) : 0;
  const upper = finite(Number(max)) ? clamp(Number(max), lower, 1) : 1;
  return clamp(finite(Number(value)) ? Number(value) : lower, lower, upper);
}
const impulses = new WeakMap();
function impulse(context) {
  if (impulses.has(context)) return impulses.get(context);
  const length = Math.floor(context.sampleRate * 1.8);
  const buffer = context.createBuffer(2, length, context.sampleRate);
  let seed = 89241;
  for (let channel = 0; channel < 2; channel++) {
    const data = buffer.getChannelData(channel);
    for (let i = 0; i < length; i++) {
      seed = (1664525 * seed + 1013904223) >>> 0;
      data[i] = (seed / 4294967296 * 2 - 1) * (1 - i / length) ** 3;
    }
  }
  impulses.set(context, buffer);
  return buffer;
}

export class EffectSlot {
  constructor(context, type = 'echo') {
    this.context = context;
    this.input = context.createGain();
    this.output = context.createGain();
    this.dry = context.createGain();
    this.wet = context.createGain();
    this.send = context.createGain();
    this.input.connect(this.dry).connect(this.output);
    this.input.connect(this.send);
    this.wet.connect(this.output);
    this.enabled = false; this.amount = EFFECT_PARAM_DEFAULTS.amount; this.beats = EFFECT_PARAM_DEFAULTS.beats; this.bpm = 120;
    this.paramLimits = defaultLimits();
    this.paramValues = new Map([[0, this.amount], [1, this.beats]]);
    this.wetScale = 1;
    this.disableTimer = null;
    this.nodes = []; this.oscillators = [];
    this.wet.gain.value = 0; this.send.gain.value = 0;
    this.setType(type);
  }

  smooth(param, value) {
    const now = this.context.currentTime;
    param.cancelScheduledValues(now);
    param.setTargetAtTime(value, now, 0.015);
  }

  setType(type) {
    if (!EFFECT_TYPES[type]) throw new Error('Unknown effect');
    clearTimeout(this.disableTimer); this.disableTimer = null;
    this.send.disconnect();
    for (const oscillator of this.oscillators) { oscillator.stop(); oscillator.disconnect(); }
    for (const node of this.nodes) node.disconnect();
    this.nodes = []; this.oscillators = []; this.type = type;
    this.delay = null; this.lfo = null;
    const context = this.context;
    const own = node => { this.nodes.push(node); return node; };
    const lfo = (param, frequency, depth, waveform = 'sine') => {
      const oscillator = context.createOscillator(), gain = own(context.createGain());
      oscillator.type = waveform;
      oscillator.frequency.value = frequency; gain.gain.value = depth;
      oscillator.connect(gain).connect(param); oscillator.start();
      this.oscillators.push(oscillator); this.lfo = oscillator;
    };
    if (type === 'echo' || type === 'delay') {
      const delay = own(context.createDelay(4)), feedback = own(context.createGain()), lowpass = own(context.createBiquadFilter());
      delay.delayTime.value = this.beats * 60 / this.bpm;
      feedback.gain.value = type === 'delay' ? 0.56 : 0.38; lowpass.frequency.value = type === 'delay' ? 9000 : 5500;
      this.send.connect(delay).connect(this.wet);
      delay.connect(lowpass).connect(feedback).connect(delay);
      this.delay = delay;
    } else if (type === 'reverb') {
      const reverb = own(context.createConvolver()); reverb.buffer = impulse(context);
      this.send.connect(reverb).connect(this.wet);
    } else if (type === 'flanger') {
      const delay = own(context.createDelay(0.05)); delay.delayTime.value = 0.006;
      this.send.connect(delay).connect(this.wet);
      lfo(delay.delayTime, this.bpm / 60 / 4, 0.004);
    } else if (type === 'chorus') {
      const delay = own(context.createDelay(0.08)); delay.delayTime.value = 0.025;
      this.send.connect(delay).connect(this.wet);
      lfo(delay.delayTime, this.bpm / 60 / 2, 0.012);
    } else if (type === 'phaser') {
      let previous = this.send;
      for (const frequency of [300, 650, 1400, 3000]) {
        const filter = own(context.createBiquadFilter()); filter.type = 'allpass';
        filter.frequency.value = frequency; filter.Q.value = 0.7;
        previous.connect(filter); previous = filter;
        lfo(filter.frequency, this.bpm / 60 / 4, frequency * 0.65);
      }
      previous.connect(this.wet);
    } else if (type === 'tremolo') {
      const gain = own(context.createGain()); gain.gain.value = 0.5;
      this.send.connect(gain).connect(this.wet);
      lfo(gain.gain, this.bpm / 60 / this.beats, 0.5);
    } else if (type === 'wah') {
      const filter = own(context.createBiquadFilter()); filter.type = 'bandpass'; filter.frequency.value = 900; filter.Q.value = 3.5;
      this.send.connect(filter).connect(this.wet);
      lfo(filter.frequency, this.bpm / 60 / 2, 700);
    } else if (type === 'resonance') {
      const filter = own(context.createBiquadFilter()); filter.type = 'lowpass'; filter.frequency.value = 1200; filter.Q.value = 12;
      this.send.connect(filter).connect(this.wet);
      lfo(filter.frequency, this.bpm / 60 / 4, 900);
    } else if (type === 'resonanceLP' || type === 'resonanceHP') {
      const filter = own(context.createBiquadFilter()); filter.type = type === 'resonanceHP' ? 'highpass' : 'lowpass'; filter.frequency.value = type === 'resonanceHP' ? 800 : 1200; filter.Q.value = 12;
      this.send.connect(filter).connect(this.wet);
      lfo(filter.frequency, this.bpm / 60 / 4, type === 'resonanceHP' ? 650 : 900);
    } else if (type === 'gater') {
      const gain = own(context.createGain()); gain.gain.value = 0.5;
      this.send.connect(gain).connect(this.wet);
      lfo(gain.gain, this.bpm / 60 / this.beats, 0.5, 'square');
    } else if (type === 'bitcrush') {
      const shaper = own(context.createWaveShaper());
      const curve = new Float32Array(2048), steps = 16;
      for (let i = 0; i < curve.length; i++) {
        const value = i / (curve.length - 1) * 2 - 1;
        curve[i] = Math.round(value * steps) / steps;
      }
      shaper.curve = curve; shaper.oversample = 'none';
      this.send.connect(shaper).connect(this.wet);
    } else if (type === 'paramEq') {
      const filter = own(context.createBiquadFilter()); filter.type = 'peaking'; filter.frequency.value = 1100; filter.Q.value = 0.8; filter.gain.value = 7;
      this.send.connect(filter).connect(this.wet);
    } else if (type === 'dynamics') {
      const compressor = own(context.createDynamicsCompressor()); compressor.threshold.value = -18; compressor.knee.value = 10; compressor.ratio.value = 5; compressor.attack.value = 0.004; compressor.release.value = 0.12;
      this.send.connect(compressor).connect(this.wet);
    } else if (type === 'loopRoll') {
      const delay = own(context.createDelay(4)); delay.delayTime.value = this.beats * 60 / this.bpm;
      this.send.connect(delay).connect(this.wet); this.delay = delay;
    } else if (type === 'noise') {
      // The original Noise filter is a dedicated generator. Keep the input
      // path deterministic here and shape it as a bright, resonant texture.
      const filter = own(context.createBiquadFilter()); filter.type = 'bandpass'; filter.frequency.value = 4200; filter.Q.value = 0.8;
      this.send.connect(filter).connect(this.wet);
    } else {
      const shaper = own(context.createWaveShaper());
      const curve = new Float32Array(2048);
      for (let i = 0; i < curve.length; i++) curve[i] = Math.tanh((i / (curve.length - 1) * 2 - 1) * 4) * 0.6;
      shaper.curve = curve; shaper.oversample = '2x';
      this.send.connect(shaper).connect(this.wet);
    }
    this.update();
  }

  update(previous = this.enabled) {
    const now = this.context.currentTime;
    this.smooth(this.send.gain, this.enabled ? 1 : 0);
    clearTimeout(this.disableTimer); this.disableTimer = null;
    // Bank Wetness is a true dry/wet control. At zero the rack is
    // transparent, while at one the slot's own amount is unchanged.
    const wetAmount = this.amount * this.wetScale;
    this.smooth(this.dry.gain, this.enabled ? 1 - wetAmount : 1);
    if (this.enabled || !previous) {
      this.smooth(this.wet.gain, this.enabled ? wetAmount : 0);
      return;
    }
    // Stop feeding the processor immediately but let feedback and
    // convolution tails drain before muting the wet return.
    const tail = ['echo', 'delay'].includes(this.type) ? Math.min(3.9, this.beats * 60 / this.bpm * 5) : this.type === 'reverb' ? 1.8 : 0.15;
    this.wet.gain.cancelScheduledValues(now);
    this.wet.gain.setValueAtTime(wetAmount, now);
    this.wet.gain.setTargetAtTime(0, now + tail, 0.08);
  }
  setEnabled(enabled) { const previous = this.enabled; this.enabled = !!enabled; this.update(previous); }
  boundedParam(index, value) {
    if (!validParam(index) || !finite(Number(value))) return false;
    const [min, max] = this.paramLimits.get(Number(index)) || [-Infinity, Infinity];
    return clamp(Number(value), min, max);
  }
  setAmount(value) {
    const next = this.boundedParam(0, value);
    if (next === false) return false;
    this.amount = next; this.paramValues.set(0, next); this.update(); return next;
  }
  setWetScale(value) { this.wetScale = clampEffectBankWetness(value); this.update(); return this.wetScale; }
  getWetScale() { return this.wetScale; }
  setParam(index, value) {
    const key = Number(index), next = this.boundedParam(key, value);
    if (next === false) return false;
    if (key === 0) return this.setAmount(next);
    if (key === 1) return this.setTiming(this.bpm, next);
    this.paramValues.set(key, next);
    return next;
  }
  getParam(index) { return this.paramValues.get(Number(index)); }
  setParamLimits(index, min, max, value = this.getParam(index)) {
    const key = Number(index);
    if (!validParam(key) || !finite(Number(min)) || !finite(Number(max))) return false;
    const hard = PARAM_LIMITS[key] || [-Infinity, Infinity];
    const lower = Math.max(hard[0], Number(min)), upper = Math.min(hard[1], Number(max));
    if (upper < lower) return false;
    this.paramLimits.set(key, [lower, upper]);
    if (finite(Number(value))) this.setParam(key, value);
    return [lower, upper];
  }
  setTiming(bpm, beats = this.beats) {
    const next = this.boundedParam(1, beats);
    if (next === false || !finite(Number(bpm))) return false;
    this.bpm = clamp(Number(bpm), 15, 450); this.beats = next; this.paramValues.set(1, next);
    if (this.delay) this.smooth(this.delay.delayTime, Math.min(3.9, 60 / this.bpm * this.beats));
    for (const oscillator of this.oscillators) {
      const division = ['tremolo', 'gater'].includes(this.type) ? this.beats : 4;
      this.smooth(oscillator.frequency, this.bpm / 60 / division);
    }
    return this.beats;
  }
}

export class FilterFX {
  constructor(context, type = 'off') {
    this.context = context;
    this.input = context.createGain();
    this.output = context.createGain();
    this.slot = new EffectSlot(context, 'echo');
    this.input.connect(this.slot.input);
    this.slot.output.connect(this.output);
    this.amount = 0;
    this.type = 'off';
    this.setType(type);
  }
  setType(type) {
    if (!FILTER_FX_TYPES[type]) type = 'off';
    this.type = type;
    if (type !== 'off' && this.slot.type !== type) this.slot.setType(type);
    this.setAmount(this.amount);
    return this.type;
  }
  setAmount(value) {
    const numeric = Number(value);
    this.amount = Number.isFinite(numeric) ? clamp(numeric, -1, 1) : 0;
    const active = this.type !== 'off' && Math.abs(this.amount) > 0.001;
    this.slot.setAmount(Math.abs(this.amount));
    this.slot.setEnabled(active);
    return this.amount;
  }
  setTiming(bpm, beats = 0.5) { this.slot.setTiming(bpm, beats); }
}

const DEFAULT_RACKS = [
  ['echo', 'reverb', 'flanger'],
  ['delay', 'reverb', 'phaser'],
];

// A channel is the per-deck audio lane of a rack.  The rack's slot settings
// are shared, while each lane has its own Web Audio nodes so assigning a rack
// to two decks cannot mix their audio or leak one deck into another's PFL.
class EffectRackChannel {
  constructor(parent, id) {
    this.parent = parent;
    this.id = id;
    this.context = parent.context;
    this.input = this.context.createGain();
    this.output = this.context.createGain();
    this.slots = parent.slotStates.map(state => new EffectSlot(this.context, state.type));
    this.syncFromParent();
    this.slots[0].output.connect(this.slots[1].input);
    this.slots[1].output.connect(this.slots[2].input);
    this.input.connect(this.slots[0].input);
    this.slots[2].output.connect(this.output);
  }
  setType(index, type) { return this.parent.setSlotType(index, type); }
  setAmount(index, value) { return this.parent.setSlotAmount(index, value); }
  setEnabled(index, value) { return this.parent.setSlotEnabled(index, value); }
  setTiming(index, bpm, beats) { return this.parent.setSlotTiming(index, bpm, beats); }
  setWetness(value, min = 0, max = 1) { return this.parent.setWetness(value, min, max); }
  setEffectBankWetness(value, min = 0, max = 1) { return this.parent.setEffectBankWetness(value, min, max); }
  getWetness() { return this.parent.getWetness(); }
  getEffectBankWetness() { return this.parent.getEffectBankWetness(); }
  modifyEffectParam(index, param, value) { return this.parent.modifyEffectParam(index, param, value); }
  modifyEffectParamLimits(index, param, min, max, value) { return this.parent.modifyEffectParamLimits(index, param, min, max, value); }
  getEffectParam(index, param) { return this.parent.getEffectParam(index, param); }
  getEffectParamLimits(index, param) { return this.parent.getEffectParamLimits(index, param); }
  activateEffect(index, enabled) { return this.parent.activateEffect(index, enabled); }
  resetEffects() { return this.parent.resetEffects(); }
  resetEffectsToDefault() { return this.parent.resetEffectsToDefault(); }
  setTempo(bpm) { this.slots.forEach(slot => slot.setTiming(bpm)); }
  syncFromParent() {
    this.parent.slotStates.forEach((state, index) => {
      const slot = this.slots[index];
      if (slot.type !== state.type) slot.setType(state.type);
      slot.paramLimits = defaultLimits();
      slot.paramValues.clear();
      Object.entries(state.limits || {}).forEach(([key, range]) => slot.setParamLimits(key, ...range));
      slot.setAmount(state.amount);
      slot.setTiming(slot.bpm, state.beats);
      slot.setEnabled(state.enabled);
      slot.setWetScale(this.parent.wetness);
      if (state.params && typeof state.params === 'object') Object.entries(state.params).forEach(([key, value]) => slot.setParam(key, value));
    });
  }
  dispose() {
    try { this.input.disconnect(); } catch {}
    try { this.output.disconnect(); } catch {}
    this.slots.forEach(slot => { try { slot.input.disconnect(); slot.output.disconnect(); } catch {} });
  }
}

export class EffectRack {
  constructor(context, id = 0, types = DEFAULT_RACKS[id] || DEFAULT_RACKS[0]) {
    this.context = context;
    this.id = id;
    this.slotStates = types.map(type => ({ type, enabled: false, amount: EFFECT_PARAM_DEFAULTS.amount, beats: EFFECT_PARAM_DEFAULTS.beats, params: {}, limits: {} }));
    this.wetness = 1;
    this.defaultState = { types: types.slice(0, 3), wetness: 1 };
    this.channels = new Map();
    this.onchange = () => {};
    // Keep a default lane for direct/legacy users of EffectRack. Decks use
    // channel(id), which gives every assigned deck an isolated signal path.
    this.legacy = this.channel('legacy');
  }
  channel(id) {
    if (!this.channels.has(id)) this.channels.set(id, new EffectRackChannel(this, id));
    return this.channels.get(id);
  }
  get slots() { return this.legacy.slots; }
  get input() { return this.legacy.input; }
  get output() { return this.legacy.output; }
  setSlotType(index, type) {
    if (!this.slotStates[index] || !EFFECT_TYPES[type]) return false;
    this.slotStates[index].type = type;
    for (const channel of this.channels.values()) {
      const slot = channel.slots[index];
      if (slot.type !== type) slot.setType(type);
    }
    this.onchange();
    return true;
  }
  setSlotAmount(index, value) { return this.modifyEffectParam(index, 0, value); }
  setWetness(value, min = 0, max = 1) {
    this.wetness = clampEffectBankWetness(value, min, max);
    for (const channel of this.channels.values()) channel.slots.forEach(slot => slot.setWetScale(this.wetness));
    this.onchange();
    return this.wetness;
  }
  setEffectBankWetness(value, min = 0, max = 1) { return this.setWetness(value, min, max); }
  getEffectBankWetness() { return this.wetness; }
  getWetness() { return this.wetness; }
  modifyEffectParam(slotIndex, paramIndex, value) {
    const index = Number(slotIndex), state = this.slotStates[index], channel = this.legacy;
    if (!state || !channel?.slots[index]) return false;
    const slot = channel.slots[index], next = slot.setParam(paramIndex, value);
    if (next === false) return false;
    state.params[String(Number(paramIndex))] = next;
    if (Number(paramIndex) === 0) state.amount = next;
    if (Number(paramIndex) === 1) state.beats = next;
    for (const lane of this.channels.values()) if (lane !== channel) lane.slots[index].setParam(paramIndex, next);
    this.onchange();
    return next;
  }
  modifyEffectParamLimits(slotIndex, paramIndex, min, max, value) {
    const index = Number(slotIndex), key = Number(paramIndex), state = this.slotStates[index], slot = this.legacy.slots[index];
    if (!state || !slot) return false;
    const limits = slot.setParamLimits(key, min, max, value);
    if (limits === false) return false;
    state.limits[String(key)] = limits;
    const current = slot.getParam(key);
    for (const lane of this.channels.values()) {
      if (lane !== this.legacy) lane.slots[index].setParamLimits(key, ...limits, current);
    }
    if (current !== undefined) state.params[String(key)] = current;
    if (key === 0) state.amount = current;
    if (key === 1) state.beats = current;
    this.onchange();
    return limits;
  }
  getEffectParam(slotIndex, paramIndex) { return this.legacy.slots[Number(slotIndex)]?.getParam(paramIndex); }
  getEffectParamLimits(slotIndex, paramIndex) {
    const limits = this.legacy.slots[Number(slotIndex)]?.paramLimits.get(Number(paramIndex));
    return limits ? [...limits] : null;
  }
  activateEffect(slotIndex, enabled) { return this.setSlotEnabled(slotIndex, enabled); }
  resetEffects() {
    this.slotStates.forEach(state => {
      state.enabled = false; state.amount = EFFECT_PARAM_DEFAULTS.amount; state.beats = EFFECT_PARAM_DEFAULTS.beats; state.params = {}; state.limits = {};
    });
    for (const channel of this.channels.values()) channel.syncFromParent();
    this.setWetness(1);
    return this.snapshot();
  }
  resetEffectsToDefault() {
    this.defaultState.types.forEach((type, index) => this.setSlotType(index, type));
    this.resetEffects();
    return this.snapshot();
  }
  setSlotEnabled(index, value) {
    if (!this.slotStates[index]) return false;
    this.slotStates[index].enabled = !!value;
    for (const channel of this.channels.values()) channel.slots[index].setEnabled(!!value);
    this.onchange();
    return !!value;
  }
  setSlotTiming(index, bpm, beats = this.slotStates[index]?.beats) {
    if (!this.slotStates[index] || !finite(Number(bpm))) return false;
    const next = this.modifyEffectParam(index, 1, beats);
    if (next === false) return false;
    for (const channel of this.channels.values()) channel.slots[index].setTiming(bpm, next);
    return next;
  }
  setTempo(bpm) { for (const channel of this.channels.values()) channel.setTempo(bpm); }
  snapshot() {
    return { slots: this.slotStates.map(state => ({ ...state, params: { ...state.params }, limits: Object.fromEntries(Object.entries(state.limits).map(([key, range]) => [key, [...range]])) })), wetness: this.wetness };
  }
  restore(states) {
    const payload = Array.isArray(states) ? { slots: states } : states;
    if (!payload || !Array.isArray(payload.slots)) return false;
    // Old sessions stored an array and had no bank wetness or parameter limits.
    this.resetEffectsToDefault();
    if (finite(Number(payload.wetness))) this.setWetness(payload.wetness);
    payload.slots.slice(0, 3).forEach((state, index) => {
      if (!state || typeof state !== 'object') return;
      if (EFFECT_TYPES[state.type]) this.setSlotType(index, state.type);
      if (state.limits && typeof state.limits === 'object') Object.entries(state.limits).forEach(([param, range]) => {
        if (Array.isArray(range) && range.length === 2) this.modifyEffectParamLimits(index, param, ...range);
      });
      if (state.params && typeof state.params === 'object') Object.entries(state.params).forEach(([param, value]) => this.modifyEffectParam(index, param, value));
      // Named controls are authoritative in snapshots from older versions.
      if (finite(Number(state.amount))) this.setSlotAmount(index, state.amount);
      if (finite(Number(state.beats))) this.setSlotTiming(index, this.slots[index].bpm, state.beats);
      if (typeof state.enabled === 'boolean') this.setSlotEnabled(index, state.enabled);
    });
    return true;
  }
}

export class EffectBus {
  constructor(context, id, racks) {
    this.context = context;
    this.id = id;
    this.racks = racks.map(rack => rack.channel(id));
    this.input = context.createGain();
    this.output = context.createGain();
    this.activeRack = 0;
    this.assignments = [true, false];
    this.reconnect();
  }
  get slots() { return this.racks[this.activeRack].slots; }
  get assignment() { return [...this.assignments]; }
  reconnect() {
    try { this.input.disconnect(); } catch {}
    for (const channel of this.racks) { try { channel.output.disconnect(); } catch {} }
    let previous = this.input;
    let connected = false;
    this.assignments.forEach((assigned, index) => {
      if (!assigned) return;
      previous.connect(this.racks[index].input);
      previous = this.racks[index].output;
      connected = true;
    });
    previous.connect(this.output);
  }
  setActiveRack(index) {
    this.activeRack = Number(index) === 1 ? 1 : 0;
    return this.activeRack;
  }
  setEffectBank(index) { return this.setActiveRack(index); }
  toggleAssignment(index = this.activeRack) {
    index = Number(index) === 1 ? 1 : 0;
    this.assignments[index] = !this.assignments[index];
    this.reconnect();
    return this.assignments[index];
  }
  toggleEffectBank(index = this.activeRack, enabled) {
    index = Number(index) === 1 ? 1 : 0;
    this.assignments[index] = typeof enabled === 'boolean' ? enabled : !this.assignments[index];
    this.reconnect();
    return this.assignments[index];
  }
  setAssignments(assignments) {
    if (Array.isArray(assignments)) this.assignments = [!!assignments[0], !!assignments[1]];
    this.reconnect();
    return this.assignment;
  }
  setType(index, type) { return this.racks[this.activeRack].setType(index, type); }
  setAmount(index, value) { return this.racks[this.activeRack].setAmount(index, value); }
  setEnabled(index, value) { return this.racks[this.activeRack].setEnabled(index, value); }
  setTiming(index, bpm, beats) { return this.racks[this.activeRack].setTiming(index, bpm, beats); }
  setWetness(value, min = 0, max = 1) { return this.racks[this.activeRack].setWetness(value, min, max); }
  setEffectBankWetness(value, min = 0, max = 1) { return this.racks[this.activeRack].setEffectBankWetness(value, min, max); }
  getWetness() { return this.racks[this.activeRack].getWetness(); }
  getEffectBankWetness() { return this.racks[this.activeRack].getEffectBankWetness(); }
  modifyEffectParam(index, param, value) { return this.racks[this.activeRack].modifyEffectParam(index, param, value); }
  modifyEffectParamLimits(index, param, min, max, value) { return this.racks[this.activeRack].modifyEffectParamLimits(index, param, min, max, value); }
  getEffectParam(index, param) { return this.racks[this.activeRack].getEffectParam(index, param); }
  getEffectParamLimits(index, param) { return this.racks[this.activeRack].getEffectParamLimits(index, param); }
  activateEffect(index, enabled) { return this.racks[this.activeRack].activateEffect(index, enabled); }
  resetEffects() { return this.racks[this.activeRack].resetEffects(); }
  resetEffectsToDefault() { return this.racks[this.activeRack].resetEffectsToDefault(); }
  setTempo(bpm) { this.racks.forEach(rack => rack.setTempo(bpm)); }
  snapshot() { return { activeRack: this.activeRack, assignments: this.assignment, racks: this.racks.map(rack => rack.parent.snapshot()) }; }
}

export { DEFAULT_RACKS };
