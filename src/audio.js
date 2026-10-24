import { EffectRack, EffectBus, FilterFX, FILTER_FX_TYPES } from './effects.js';
import { Sampler } from './sampler.js';
import pitchWorkletUrl from './pitch-worklet.js?worker&url';
import { MonitorBus } from './monitor.js';
import { DeckPerformance, loopPosition } from './deck-performance.js';
import { StemMixer } from './stems.js';
export const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const TRANSPORT_FADE = 0.004;

export class Deck {
  constructor(engine, id) {
    this.engine = engine;
    this.id = id;
    this.syncTarget = id ^ 1;
    this.syncEnabled = false;
    this.crossAssignment = id % 2 ? 'right' : 'left';
    this.context = engine.context;
    this.buffer = null;
    this.reverseBuffer = null;
    this.track = null;
    this.source = null;
    this.voice = null;
    this.retiringVoices = new Set();
    this.scratchSource = null;
    this.scratchState = null;
    this.scratchGain = this.context.createGain();
    this.scratchGain.gain.value = 0;
    this.scratchVelocity = 0;
    this.scratchLastMoveAt = 0;
    this.playing = false;
    this.offset = 0;
    this.anchor = 0;
    this.rate = 1;
    this.reverse = false;
    this.tempoRange = 50;
    this.pitchBend = 0;
    this.pitchBendTimer = null;
    this.scratchMode = false;
    this.bpm = 120;
    this.cuePoint = 0;
    this.cuePreview = false;
    this.hotcues = Array(8).fill(null);
    this.hotcueMeta = Array.from({ length: 8 }, () => ({ name: '', color: '' }));
    this.loop = null;
    this.savedLoops = Array(8).fill(null);
    this.loopIn = null;
    this.performance = new DeckPerformance(this);
    this.gridOffset = 0;
    this.beatGrid = [];
    this.quantize = false;
    this.playGeneration = 0;
    this.loadVersion = 0;
    this.keyLock = false;
    this.keyShift = 0;
    this.pitchNode = null;
    this.pitchSilence = null;
    this.effectRackIndex = 0;
    this.effects = engine.effectRacks?.length ? new EffectBus(this.context, id, engine.effectRacks) : new EffectRack(this.context).channel(id);
    this._tempoBpm = null;
    this.autoGain = 1;
    this.stems = new StemMixer(this.context);
    this.low = this.context.createBiquadFilter();
    this.low.type = 'lowshelf'; this.low.frequency.value = 220;
    this.mid = this.context.createBiquadFilter();
    this.mid.type = 'peaking'; this.mid.frequency.value = 1000; this.mid.Q.value = 0.7;
    this.high = this.context.createBiquadFilter();
    this.high.type = 'highshelf'; this.high.frequency.value = 4500;
    this.filter = this.context.createBiquadFilter();
    this.filter.type = 'lowpass'; this.filter.frequency.value = 22000; this.filter.Q.value = 0.7;
    this.filterFxSlot = 0;
    this.eqKills = { high: false, mid: false, low: false };
    this.eqDb = { high: 0, mid: 0, low: 0 };
    this.filterFx = new FilterFX(this.context, engine.filterFxPresets?.[0] || 'off');
    this.trim = this.context.createGain(); this.trim.gain.value = 0.8;
    this.preGain = this.context.createGain(); this.preGain.gain.value = 1;
    this.pflTap = this.context.createGain(); this.pflTap.gain.value = 1;
    this.analyser = this.context.createAnalyser(); this.analyser.fftSize = 256;
    this.meterData = new Float32Array(256);
    this.crossGain = this.context.createGain();
    this.stems.output.connect(this.low).connect(this.mid).connect(this.high).connect(this.filter).connect(this.filterFx.input);
    this.filterFx.output.connect(this.effects.input);
    this.effects.output.connect(this.pflTap);
    this.effects.output.connect(this.preGain).connect(this.trim).connect(this.analyser).connect(this.crossGain).connect(engine.master);
    this.effectPosition = 'pre';
    this.faderStart = false;
    this._faderLevel = this.trim.gain.value;
    this._faderStartGeneration = 0;
  }

  load(track, buffer) {
    this.engine.onRateReset?.(this.id);
    this.pause();
    this.loadVersion++;
    this.track = track; this.buffer = buffer; this.reverseBuffer = null;
    this.scratchState = null;
    this.offset = 0; this.rate = 1; this.cuePoint = 0;
    this.bpm = track.bpm || 120;
    this.setAutoGain(track.autoGain ?? estimateAutoGain(buffer), false);
    this.hotcues = Array(8).fill(null); this.loop = null;
    this.gridOffset = track.annotations?.gridOffset ?? 0;
    this.beatGrid = normalizeBeatGrid(track.annotations?.beatGrid, this.bpm, this.gridOffset);
    this.cuePoint = clamp(track.annotations?.cuePoint || 0, 0, buffer.duration);
    const initialHotcues = track.annotations?.hotcues || track.autoHotcues;
    this.hotcues = Array.from({ length: 8 }, (_, i) => {
      const value = initialHotcues?.[i];
      return Number.isFinite(value) && value >= 0 && value < buffer.duration ? value : null;
    });
    this.hotcueMeta = Array.from({ length: 8 }, (_, i) => {
      const value = track.annotations?.hotcueMeta?.[i];
      return value && typeof value === 'object' ? { name: typeof value.name === 'string' ? value.name.slice(0, 40) : '', color: typeof value.color === 'string' ? value.color : '' } : { name: '', color: '' };
    });
    this.savedLoops = Array.from({ length: 8 }, (_, i) => {
      const loop = track.annotations?.savedLoops?.[i];
      return this.validLoop(loop) ? { start: loop.start, end: loop.end, beats: (loop.end - loop.start) * this.bpm / 60 } : null;
    });
    this.loopIn = null;
    this.performance.resetSlicerDomain();
    this.updateTempo();
  }

  get position() {
    if (!this.buffer) return 0;
    if (this.scratchState) return this.scratchState.position;
    const direction = this.reverse ? -1 : 1;
    let value = this.offset + (this.playing ? (this.context.currentTime - this.anchor) * this.effectiveRate * direction : 0);
    // A paused deck keeps its exact seek position even when a loop remains
    // armed.  Only the running transport should wrap at loop boundaries.
    if (this.playing && this.loop && this.loop.end > this.loop.start) {
      value = loopPosition(value, this.loop, this.reverse);
    }
    return clamp(value, 0, this.buffer.duration);
  }

  async play() {
    if (!this.buffer || this.playing || this.rate <= 0) return;
    if (this.scratchState) {
      this.offset = this.scratchState.position;
      this.scratchState = null;
      this.performance.endScratch();
      this.stopScratchGrain();
      this.scratchGain.gain.cancelScheduledValues(this.context.currentTime);
      this.scratchGain.gain.setTargetAtTime(0, this.context.currentTime, 0.004);
    }
    const generation = ++this.playGeneration;
    await this.context.resume();
    if (generation !== this.playGeneration || this.playing || !this.buffer) return;
    if (!this.reverse && this.offset >= this.buffer.duration - 0.01) this.offset = this.loop?.start || 0;
    if (this.reverse && this.offset <= 0) {
      // A reverse transport started at the physical beginning should enter
      // from the track end.  This mirrors the forward transport's end
      // restart and keeps REV useful immediately after loading a track.
      this.offset = this.loop?.end ?? this.buffer.duration;
    }
    this.startSource();
  }

  get signedEffectiveRate() { return (this.reverse ? -1 : 1) * this.effectiveRate; }

  getReverseBuffer() {
    if (!this.buffer) return null;
    if (this.reverseBuffer) return this.reverseBuffer;
    const reversed = this.context.createBuffer(this.buffer.numberOfChannels, this.buffer.length, this.buffer.sampleRate);
    for (let channel = 0; channel < this.buffer.numberOfChannels; channel++) {
      const source = this.buffer.getChannelData(channel), target = reversed.getChannelData(channel);
      for (let i = 0; i < source.length; i++) target[i] = source[source.length - 1 - i];
    }
    this.reverseBuffer = reversed;
    return reversed;
  }

  startSource() {
    if (!this.buffer || this.rate <= 0) return false;
    if (this.loop) this.offset = loopPosition(this.offset, this.loop, this.reverse);
    if (!this.loop && (this.reverse ? this.offset <= 0 : this.offset >= this.buffer.duration)) {
      this.playing = false;
      return false;
    }
    // The previous voice may still be draining after a natural track end.
    if (this.voice) this.stopSource();
    const source = this.context.createBufferSource();
    const sourceBuffer = this.reverse ? this.getReverseBuffer() : this.buffer;
    if (!sourceBuffer) return;
    source.buffer = sourceBuffer;
    source.playbackRate.value = this.effectiveRate;
    if (this.loop) {
      source.loop = true;
      source.loopStart = this.reverse ? sourceBuffer.duration - this.loop.end : this.loop.start;
      source.loopEnd = this.reverse ? sourceBuffer.duration - this.loop.start : this.loop.end;
    }
    const gain = this.context.createGain(), now = this.context.currentTime;
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(1, now + TRANSPORT_FADE);
    gain.connect(this.stems.input);
    const voice = { source, gain, startedAt: now, node: null, silence: null, closed: false };
    if (this.engine.pitchAvailable && (this.keyLock || this.keyShift !== 0)) {
      const node = new AudioWorkletNode(this.context, 'mixdesk-pitch', { numberOfInputs: 1, numberOfOutputs: 1, outputChannelCount: [2] });
      this.pitchNode = voice.node = node;
      // Keep zero input available after the source ends so the time-stretch
      // buffer can drain; disconnecting immediately would cut off the tail.
      const silence = this.context.createConstantSource(); silence.offset.value = 0;
      silence.connect(node); silence.start(); this.pitchSilence = voice.silence = silence;
      node.parameters.get('playbackRate').value = this.effectiveRate;
      node.parameters.get('pitch').value = this.keyLock ? 1 : this.effectiveRate;
      node.parameters.get('pitchSemitones').value = this.keyShift;
      node.onprocessorerror = () => { if (this.voice === voice) this.pause(); };
      source.connect(node).connect(gain);
    } else source.connect(gain);
    this.voice = voice;
    this.source = source;
    this.anchor = this.context.currentTime;
    this.playing = true;
    source.onended = () => {
      source.disconnect();
      if (this.voice !== voice) { this.releaseVoice(voice); return; }
      this.playing = false;
      this.offset = this.reverse ? 0 : this.buffer.duration;
      this.source = null;
      if (voice.silence) {
        voice.silence.onended = () => this.releaseVoice(voice);
        voice.silence.stop(this.context.currentTime + 0.25);
      } else this.releaseVoice(voice);
    };
    const sourceOffset = this.reverse ? sourceBuffer.duration - this.offset : this.offset;
    source.start(0, clamp(sourceOffset, 0, sourceBuffer.duration));
    return true;
  }

  stopScratchGrain() {
    if (!this.scratchSource) return;
    const source = this.scratchSource;
    this.scratchSource = null;
    source.onended = null;
    try { source.stop(); } catch {}
    source.disconnect();
  }

  startScratchGrain(rate = this.scratchVelocity) {
    if (!this.buffer || !this.scratchState) return;
    this.stopScratchGrain();
    rate = clamp(Number(rate) || 0, -4, 4);
    if (Math.abs(rate) < 0.01) return;
    const source = this.context.createBufferSource();
    source.connect(this.scratchGain).connect(this.stems.input);
    this.scratchSource = source;
    const position = clamp(this.scratchState.position, 0, Math.max(0, this.buffer.duration - 0.001));
    const distance = rate < 0 ? position : this.buffer.duration - position;
    const outputDuration = Math.min(0.11, Math.max(0.025, distance / Math.abs(rate)));
    const span = Math.min(distance, outputDuration * Math.abs(rate));
    const mediaDuration = span;
    if (rate < 0) {
      // AudioBufferSourceNode playbackRate is not portable for reverse audio.
      // Build a short reversed grain so the waveform and its direction remain
      // correct on browsers that reject negative playback rates.
      const frames = Math.max(1, Math.floor(span * this.buffer.sampleRate));
      const reversed = this.context.createBuffer(this.buffer.numberOfChannels, frames, this.buffer.sampleRate);
      const end = Math.min(this.buffer.length, Math.max(1, Math.floor(position * this.buffer.sampleRate)));
      for (let channel = 0; channel < this.buffer.numberOfChannels; channel++) {
        const sourceData = this.buffer.getChannelData(channel), targetData = reversed.getChannelData(channel);
        for (let i = 0; i < frames; i++) targetData[i] = sourceData[Math.max(0, end - 1 - i)];
      }
      source.buffer = reversed;
    } else {
      source.buffer = this.buffer;
    }
    source.playbackRate.value = Math.abs(rate);
    const now = this.context.currentTime;
    this.scratchGain.gain.cancelScheduledValues(now);
    this.scratchGain.gain.setValueAtTime(0, now);
    this.scratchGain.gain.linearRampToValueAtTime(1, now + Math.min(0.006, outputDuration / 3));
    this.scratchGain.gain.setValueAtTime(1, now + Math.max(outputDuration / 3, outputDuration - 0.012));
    this.scratchGain.gain.linearRampToValueAtTime(0, now + outputDuration);
    source.onended = () => { if (this.scratchSource === source) this.scratchSource = null; source.disconnect(); };
    source.start(0, rate < 0 ? 0 : position, mediaDuration);
  }

  /** Hold the virtual platter in place, then resume the prior transport on release. */
  scratchTouch(active) {
    if (!this.buffer) return false;
    if (active) {
      if (this.scratchState) return true;
      this.performance.beginScratch();
      this.scratchState = { position: this.position, wasPlaying: this.playing };
      this.scratchVelocity = 0;
      this.scratchLastMoveAt = this.context.currentTime;
      this.stopSource();
      this.playing = false;
      return true;
    }
    if (!this.scratchState) return false;
    const state = this.scratchState;
    this.stopScratchGrain();
    this.scratchState = null;
    this.scratchVelocity = 0;
    this.scratchGain.gain.cancelScheduledValues(this.context.currentTime);
    this.scratchGain.gain.setTargetAtTime(0, this.context.currentTime, 0.004);
    const timeline = this.performance.endScratch();
    this.offset = timeline ? this.performance.at(timeline) : state.position;
    this.offset = clamp(this.offset, 0, this.buffer.duration);
    if (timeline) this.loop = this.validLoop(timeline.loop) ? { ...timeline.loop } : null;
    this.anchor = this.context.currentTime;
    if (state.wasPlaying && (this.reverse ? this.offset > 0 : this.offset < this.buffer.duration)) this.startSource();
    return true;
  }

  /** Move the virtual platter by timeline seconds while touch is held. */
  scratchMove(seconds) {
    if (!this.buffer || !Number.isFinite(seconds)) return false;
    this.context.resume().catch(() => {});
    if (!this.scratchState) this.scratchTouch(true);
    const now = this.context.currentTime;
    const elapsed = Math.max(0.008, now - this.scratchLastMoveAt);
    this.scratchLastMoveAt = now;
    this.scratchState.position = clamp(this.scratchState.position + seconds, 0, Math.max(0, this.buffer.duration - 0.001));
    this.scratchVelocity = clamp(seconds / elapsed, -4, 4);
    this.startScratchGrain(this.scratchVelocity);
    return true;
  }

  stopSource() {
    this.playGeneration++;
    const voice = this.voice;
    this.voice = null; this.source = null;
    this.pitchNode = null; this.pitchSilence = null;
    if (voice) {
      // Fade after the DSP, keeping its pending output alive until the cut.
      // Each outgoing voice owns its nodes; a late ended event cannot dispose
      // the processor belonging to a newer seek or Hot Cue.
      const now = this.context.currentTime;
      voice.gain.gain.cancelAndHoldAtTime(now);
      voice.gain.gain.setValueAtTime(clamp((now - voice.startedAt) / TRANSPORT_FADE, 0, 1), now);
      voice.gain.gain.linearRampToValueAtTime(0, now + TRANSPORT_FADE);
      this.retiringVoices.add(voice);
      voice.source.onended = () => this.releaseVoice(voice);
      voice.source.stop(now + TRANSPORT_FADE);
      if (voice.silence) {
        voice.silence.onended = () => this.releaseVoice(voice);
        voice.silence.stop(now + TRANSPORT_FADE);
      }
    }
    this.playing = false;
    this.stopScratchGrain();
  }

  releaseVoice(voice) {
    if (voice.closed) return;
    voice.closed = true;
    voice.source.onended = null;
    try { voice.source.stop(); } catch {}
    voice.source.disconnect(); voice.gain.disconnect();
    if (voice.silence) {
      voice.silence.onended = null;
      try { voice.silence.stop(); } catch {}
      voice.silence.disconnect();
    }
    if (voice.node) {
      voice.node.port.postMessage({ type: 'dispose' });
      voice.node.disconnect(); voice.node.onprocessorerror = null;
      voice.node.port.close();
    }
    this.retiringVoices.delete(voice);
    if (this.voice === voice) {
      this.voice = null; this.source = null;
      this.pitchNode = null; this.pitchSilence = null;
    }
  }

  disposeVoices() {
    if (this.voice) this.releaseVoice(this.voice);
    for (const voice of this.retiringVoices) this.releaseVoice(voice);
  }

  setPitch(keyLock, semitones = this.keyShift) {
    if (!this.engine.pitchAvailable || !Number.isFinite(Number(semitones))) return false;
    const nextLock = !!keyLock, nextShift = clamp(Math.round(Number(semitones)), -12, 12);
    if (this.keyLock === nextLock && this.keyShift === nextShift) return true;
    if (this.playing && this.pitchNode && (nextLock || nextShift !== 0)) {
      this.keyLock = nextLock; this.keyShift = nextShift;
      const now = this.context.currentTime;
      this.pitchNode.parameters.get('pitch').setValueAtTime(nextLock ? 1 : this.effectiveRate, now);
      this.pitchNode.parameters.get('pitchSemitones').setValueAtTime(nextShift, now);
      return true;
    }
    const playing = this.playing;
    this.offset = this.position;
    this.stopSource();
    this.keyLock = nextLock;
    this.keyShift = nextShift;
    if (playing) this.startSource();
    return true;
  }

  pause() {
    this.cuePreview = false;
    const position = this.position;
    this.scratchState = null;
    this.offset = position;
    this.pitchBend = 0;
    if (this.pitchBendTimer) { clearTimeout(this.pitchBendTimer); this.pitchBendTimer = null; }
    this.stopSource();
    this.performance.cancel();
    if (this.loop && (this.offset < this.loop.start || this.offset >= this.loop.end)) this.loop = null;
  }

  seek(seconds) {
    if (!this.buffer) return;
    this.cuePreview = false;
    this.scratchState = null;
    const wasPlaying = this.playing;
    this.stopSource();
    this.performance.cancel();
    this.offset = clamp(seconds, 0, Math.max(0, this.buffer.duration - 0.001));
    if (this.loop && (this.offset < this.loop.start || this.offset >= this.loop.end)) this.loop = null;
    this.performance.resetSlicerDomain();
    if (wasPlaying) this.startSource();
  }

  setRate(value) {
    this.engine.onRateManual?.(this.id);
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return this.rate;
    if (numeric <= 0) {
      // Capture the audible position while the old rate is still active. If
      // rate is zeroed first, pause() would only advance by the .001 safety
      // clamp and a moving deck would jump backwards when stopped at −100%.
      this.pause();
      this.syncEnabled = false;
      this.rate = 0;
      this.anchor = this.context.currentTime;
      this.updateTempo();
      return this.rate;
    }
    const result = this.applyRate(numeric, { manual: true });
    return result;
  }

  setTempoRange(percent) {
    const allowed = [6, 8, 10, 12, 16, 20, 25, 33, 50, 100];
    const value = Number(percent), range = allowed.includes(value) ? value : 50;
    this.tempoRange = range;
    const minimum = Math.max(0, 1 - range / 100), maximum = 1 + range / 100;
    if (this.rate < minimum || this.rate > maximum) this.applyRate(clamp(this.rate, minimum, maximum), { manual: true });
    return this.tempoRange;
  }

  applyRate(value, { manual = false, preserveBend = false } = {}) {
    if (!Number.isFinite(value)) return;
    if (manual) this.syncEnabled = false;
    const range = this.tempoRange / 100;
    const next = clamp(value, Math.max(0, 1 - range), 1 + range);
    if (Math.abs(next - this.rate) < 0.00001 && !this.pitchBend) {
      this.updateTempo();
      return this.rate;
    }
    this.performance.reanchor(this.signedEffectiveRate);
    this.offset = this.position;
    if (!preserveBend) {
      this.pitchBend = 0;
      if (this.pitchBendTimer) { clearTimeout(this.pitchBendTimer); this.pitchBendTimer = null; }
    }
    this.anchor = this.context.currentTime;
    this.rate = next;
    this.performance.reanchor(this.signedEffectiveRate);
    if (this.source) this.source.playbackRate.setValueAtTime(this.effectiveRate, this.context.currentTime);
    if (this.pitchNode) {
      this.pitchNode.parameters.get('playbackRate').setValueAtTime(this.effectiveRate, this.context.currentTime);
      this.pitchNode.parameters.get('pitch').setValueAtTime(this.keyLock ? 1 : this.effectiveRate, this.context.currentTime);
    }
    this.updateTempo();
    return this.rate;
  }

  get effectiveRate() { return this.rate <= 0 ? 0 : clamp(this.rate * (1 + this.pitchBend), 0.001, 2); }

  setReverse(enabled) {
    const next = !!enabled;
    if (next === this.reverse) return this.reverse;
    if (!this.buffer) { this.reverse = next; return this.reverse; }
    const wasPlaying = this.playing;
    this.offset = this.position;
    this.performance.reanchor(this.signedEffectiveRate);
    this.stopSource();
    this.reverse = next;
    this.anchor = this.context.currentTime;
    this.performance.reanchor(this.signedEffectiveRate);
    if (wasPlaying) this.startSource();
    this.updateTempo();
    return this.reverse;
  }

  pitchBendBy(relative) {
    if (!Number.isFinite(relative) || !this.buffer) return false;
    this.performance.reanchor(this.signedEffectiveRate);
    this.offset = this.position; this.anchor = this.context.currentTime;
    this.pitchBend = clamp(relative * 0.25, -0.25, 0.25);
    this.performance.reanchor(this.signedEffectiveRate);
    const now = this.context.currentTime;
    if (this.source) this.source.playbackRate.setTargetAtTime(this.effectiveRate, now, 0.004);
    if (this.pitchNode) {
      this.pitchNode.parameters.get('playbackRate').setTargetAtTime(this.effectiveRate, now, 0.004);
      this.pitchNode.parameters.get('pitch').setTargetAtTime(this.keyLock ? 1 : this.effectiveRate, now, 0.004);
    }
    this.updateTempo();
    if (this.pitchBendTimer) clearTimeout(this.pitchBendTimer);
    this.pitchBendTimer = setTimeout(() => {
      this.pitchBendTimer = null; if (!this.buffer) return;
      this.performance.reanchor(this.signedEffectiveRate);
      this.offset = this.position; this.anchor = this.context.currentTime; this.pitchBend = 0;
      this.performance.reanchor(this.signedEffectiveRate);
      if (this.source) this.source.playbackRate.setTargetAtTime(this.rate, this.context.currentTime, 0.025);
      if (this.pitchNode) {
        this.pitchNode.parameters.get('playbackRate').setTargetAtTime(this.rate, this.context.currentTime, 0.025);
        this.pitchNode.parameters.get('pitch').setTargetAtTime(this.keyLock ? 1 : this.rate, this.context.currentTime, 0.025);
      }
      this.updateTempo();
    }, 140);
    return true;
  }

  setScratchMode(enabled) { this.scratchMode = !!enabled; return this.scratchMode; }

  get musicalBpm() {
    return this.beatGridAt().bpm * this.effectiveRate;
  }

  updateTempo() {
    const bpm = this.musicalBpm;
    if (!Number.isFinite(bpm) || Math.abs(bpm - (this._tempoBpm ?? -Infinity)) < 0.001) return bpm;
    this._tempoBpm = bpm;
    this.effects.setTempo(bpm);
    this.filterFx.setTiming(bpm);
    return bpm;
  }

  setSyncEnabled(enabled) {
    const next = !!enabled;
    if (next === this.syncEnabled) return true;
    if (next && !this.engine.canSync(this.id, this.syncTarget)) return false;
    this.engine.onRateReset?.(this.id);
    this.syncEnabled = next;
    if (next) this.engine.updateSync();
    return true;
  }

  setSyncTarget(target) {
    target = Number(target);
    if (!Number.isInteger(target) || target < 0 || target >= this.engine.decks.length || target === this.id) return false;
    if (this.syncEnabled && !this.engine.canSync(this.id, target)) return false;
    this.engine.onRateReset?.(this.id);
    this.syncTarget = target;
    if (this.syncEnabled) this.engine.updateSync();
    return true;
  }

  snap(position, direction = 'round') {
    const grid = this.beatGridAt(position), beat = 60 / grid.bpm;
    return clamp(grid.offset + Math[direction]((position - grid.offset) / beat) * beat, 0, this.buffer?.duration || 0);
  }

  beatGridAt(position = this.position) {
    let selected = this.beatGrid[0] || { start: 0, offset: this.gridOffset, bpm: this.bpm };
    for (const segment of this.beatGrid) {
      if (segment.start > position) break;
      selected = segment;
    }
    return selected;
  }

  beatDurationAt(position = this.position) { return 60 / this.beatGridAt(position).bpm; }

  beatsBetween(start, end) {
    if (!this.buffer || !Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 0;
    let current = clamp(start, 0, this.buffer.duration), target = clamp(end, current, this.buffer.duration), beats = 0;
    while (current < target - 1e-9) {
      const segment = this.beatGridAt(current), next = this.beatGrid.find(item => item.start > current)?.start ?? target;
      const boundary = Math.min(target, next);
      beats += (boundary - current) / (60 / segment.bpm);
      current = boundary;
    }
    return beats;
  }

  // Convert a beat count to a timeline position while respecting variable
  // tempo segments. This keeps Beat Jump and quantized loop lengths musical
  // when a track changes tempo in the middle of the requested range.
  positionAfterBeats(position, beats) {
    if (!this.buffer || !Number.isFinite(position) || !Number.isFinite(beats)) return position;
    let current = clamp(position, 0, this.buffer.duration), remaining = Math.abs(beats), direction = beats < 0 ? -1 : 1;
    while (remaining > 1e-9) {
      // A backwards jump starting exactly at a segment boundary consumes the
      // beats from the segment on its left.
      const segment = direction > 0 ? this.beatGridAt(current) : this.beatGridAt(Math.max(0, current - 1e-7));
      const duration = 60 / segment.bpm;
      const next = direction > 0
        ? (this.beatGrid.find(item => item.start > current)?.start ?? this.buffer.duration)
        : (segment.start > 0 ? segment.start : 0);
      const availableSeconds = direction > 0 ? Math.max(0, next - current) : Math.max(0, current - next);
      const availableBeats = availableSeconds / duration;
      if (availableBeats >= remaining || availableSeconds < 1e-9) return clamp(current + direction * remaining * duration, 0, this.buffer.duration);
      current = next;
      remaining -= availableBeats;
      if (current <= 0 || current >= this.buffer.duration) return current;
    }
    return current;
  }

  timeForBeats(start, beats) { return Math.max(0, this.positionAfterBeats(start, beats) - start); }

  moveBeatGrid(offset) {
    const next = clamp(offset, 0, this.buffer?.duration || 0);
    const delta = next - this.gridOffset;
    this.gridOffset = next;
    this.beatGrid = normalizeBeatGrid(this.beatGrid, this.bpm, this.gridOffset).map(segment => ({ ...segment, offset: segment.offset + delta }));
    if (this.beatGrid.length) this.beatGrid[0] = { ...this.beatGrid[0], start: 0, offset: next };
    this.performance.resetSlicerDomain();
  }

  setBeatGridSegment(start, bpm) {
    if (!this.buffer || !Number.isFinite(start) || !Number.isFinite(bpm) || bpm < 30 || bpm > 300) return false;
    start = clamp(start, 0, this.buffer.duration);
    const prior = this.beatGridAt(start), beat = 60 / prior.bpm;
    const offset = prior.offset + Math.round((start - prior.offset) / beat) * beat;
    if (start < 0.04) {
      this.beatGrid = [{ start: 0, offset: this.gridOffset, bpm }, ...this.beatGrid.slice(1).map(segment => ({ ...segment }))];
    } else {
      // Replace only a segment at the same position; adding a new segment
      // must not discard later tempo changes already present in the grid.
      const same = this.beatGrid.findIndex(segment => Math.abs(segment.start - start) < 0.04);
      if (same > 0) this.beatGrid[same] = { ...this.beatGrid[same], start, offset, bpm };
      else this.beatGrid.push({ start, offset, bpm });
    }
    this.beatGrid.sort((a, b) => a.start - b.start);
    this.performance.resetSlicerDomain();
    return true;
  }

  removeBeatGridSegment(start = this.beatGridAt().start) {
    const index = this.beatGrid.findIndex(segment => segment.start === start);
    if (index <= 0) return false;
    this.beatGrid.splice(index, 1);
    this.performance.resetSlicerDomain();
    return true;
  }

  beatJump(beats) { this.seek(this.positionAfterBeats(this.position, beats)); }

  alignPhase(other) {
    if (!this.buffer || !other.buffer) return;
    const ownGrid = this.beatGridAt(), otherGrid = other.beatGridAt();
    const ownBeat = 60 / ownGrid.bpm, otherBeat = 60 / otherGrid.bpm;
    const phase = (((other.position - otherGrid.offset) / otherBeat) % 1 + 1) % 1;
    const beatIndex = Math.round((this.position - ownGrid.offset) / ownBeat - phase);
    this.seek(ownGrid.offset + (beatIndex + phase) * ownBeat);
  }

  setEQ(band, db) {
    if (!['high', 'mid', 'low'].includes(band)) return;
    this.eqDb[band] = clamp(Number(db), -24, 12);
    this[band].gain.setTargetAtTime(this.eqKills[band] ? -100 : this.eqDb[band], this.context.currentTime, 0.02);
  }

  setEQKill(band, enabled) {
    if (!['high', 'mid', 'low'].includes(band)) return false;
    this.eqKills[band] = !!enabled;
    this.setEQ(band, this.eqDb[band]);
    return this.eqKills[band];
  }

  setVolume(value) {
    const level = clamp(value, 0, 1);
    const previous = this._faderLevel;
    this._faderLevel = level;
    this.trim.gain.setTargetAtTime(level, this.context.currentTime, 0.01);
    if (this.faderStart && level < 0.001) {
      this._faderStartGeneration++;
      if (this.playing) this.pause();
    }
    if (this.faderStart && previous < 0.001 && level > 0.001 && !this.playing && this.buffer) {
      const generation = ++this._faderStartGeneration;
      this.play().then(() => {
        if (generation !== this._faderStartGeneration || this._faderLevel < 0.001) this.pause();
      }).catch(() => {});
    }
  }

  setEffectPosition(position) {
    position = position === 'post' ? 'post' : 'pre';
    if (position === this.effectPosition && this._effectRouteReady) return position;
    const unlink = (source, destination) => { try { source.disconnect(destination); } catch {} };
    unlink(this.filterFx.output, this.effects.input); unlink(this.filterFx.output, this.preGain);
    unlink(this.effects.output, this.pflTap); unlink(this.effects.output, this.preGain); unlink(this.preGain, this.pflTap);
    unlink(this.effects.output, this.crossGain); unlink(this.effects.output, this.engine.master);
    unlink(this.preGain, this.trim); unlink(this.trim, this.analyser);
    unlink(this.analyser, this.crossGain); unlink(this.crossGain, this.engine.master); unlink(this.crossGain, this.effects.input);
    if (position === 'post') {
      // Post-crossfader means the rack receives the already-faded channel
      // signal. This keeps effect tails audible after a crossfader move.
      this.filterFx.output.connect(this.preGain).connect(this.trim).connect(this.analyser).connect(this.crossGain).connect(this.effects.input);
      this.effects.output.connect(this.engine.master);
      // PFL stays independent from channel and crossfader gain. In this
      // routing mode the FX rack is downstream of both faders, so the tap is
      // taken immediately before the channel fader.
      this.preGain.connect(this.pflTap);
    } else {
      this.filterFx.output.connect(this.effects.input);
      this.effects.output.connect(this.preGain).connect(this.trim).connect(this.analyser).connect(this.crossGain).connect(this.engine.master);
      this.effects.output.connect(this.pflTap);
    }
    this.effectPosition = position; this._effectRouteReady = true;
    return position;
  }

  setEffectRack(index) {
    index = Number(index) === 1 ? 1 : 0;
    if (index === this.effectRackIndex && this.effects) return index;
    if (this.effects?.setActiveRack) {
      this.effects.setActiveRack(index);
      this.effectRackIndex = index;
      this.updateTempo();
      return this.effectRackIndex;
    }
    const previous = this.effects;
    if (previous) {
      try { previous.input.disconnect(previous.slots[0].input); } catch {}
      try { previous.output.disconnect(); } catch {}
    }
    this.effects = this.engine.effectRacks?.[index]?.channel(this.id) || previous;
    this.effectRackIndex = index;
    this._effectRouteReady = false;
    this.setEffectPosition(this.effectPosition);
    this.updateTempo();
    return this.effectRackIndex;
  }

  setFaderStart(enabled) { this.faderStart = !!enabled; return this.faderStart; }

  setAutoGain(value, persist = true) {
    const limits = this.engine?.autoGainLimits || { lower: 0.25, upper: 4 };
    const gain = clamp(Number(value) || 1, limits.lower, limits.upper);
    this.autoGain = gain;
    this.preGain.gain.setTargetAtTime(gain, this.context.currentTime, 0.02);
    if (persist && this.track) {
      this.track.autoGain = gain;
      this.track.autoGainEnabled = true;
    }
    return gain;
  }

  setFilter(value) {
    const x = clamp(value, -1, 1);
    this.filter.type = x <= 0 ? 'lowpass' : 'highpass';
    const hz = x <= 0 ? 22000 * Math.pow(0.006, -x) : 25 * Math.pow(300, x);
    this.filter.frequency.setTargetAtTime(hz, this.context.currentTime, 0.025);
    this.filterFx.setAmount(x);
  }

  setFilterFXSlot(index) {
    const value = Number(index);
    this.filterFxSlot = Number.isInteger(value) ? Math.max(0, Math.min(3, value)) : 0;
    const type = this.engine.filterFxPresets?.[this.filterFxSlot] || 'off';
    this.filterFx.setType(type);
    return this.filterFxSlot;
  }

  setFilterFXAmount(value) {
    return this.filterFx.setAmount(Number.isFinite(Number(value)) ? value : 0);
  }

  validLoop(loop) {
    return !!(this.buffer && loop && Number.isFinite(loop.start) && Number.isFinite(loop.end) && loop.start >= 0 && loop.end <= this.buffer.duration && loop.end - loop.start >= 1 / this.buffer.sampleRate);
  }

  replacePlayback(position, loop, playing = this.playing) {
    if (!this.buffer || !Number.isFinite(position)) return;
    this.stopSource();
    this.loop = this.validLoop(loop) ? { ...loop } : null;
    this.offset = clamp(position, 0, this.buffer.duration);
    if (this.scratchState) {
      this.scratchState.position = this.offset;
      this.performance.rebaseScratch(this.offset, this.loop);
      return;
    }
    if (playing) this.startSource();
  }

  setLoop(start, end, { jump = false, slip = true } = {}) {
    const loop = { start, end, beats: this.beatsBetween(start, end) };
    if (!this.validLoop(loop)) return false;
    this.performance.finish();
    if (slip && !this.loop) this.performance.beginSlipLoop();
    const position = this.position;
    const target = jump || position < start || position >= end ? (this.reverse && this.playing ? end : start) : position;
    this.replacePlayback(target, loop);
    return true;
  }

  clearLoop() {
    this.performance.finish();
    if (this.performance.endSlipLoop()) return;
    const position = this.position;
    this.offset = position; this.anchor = this.context.currentTime;
    this.loop = null;
    if (this.source) this.source.loop = false;
  }

  toggleLoop(beats = 4) {
    if (!this.buffer) return;
    if (this.loop) return this.clearLoop();
    const start = this.snap(this.position, 'floor');
    return this.setLoop(start, Math.min(this.buffer.duration, this.positionAfterBeats(start, beats)));
  }

  resizeLoop(beats) {
    if (!this.loop || this.loop.temporary || !Number.isFinite(beats) || beats <= 0) return false;
    return this.setLoop(this.loop.start, Math.min(this.buffer.duration, this.positionAfterBeats(this.loop.start, beats)));
  }

  saveLoop(index) {
    if (!Number.isInteger(index) || index < 0 || index >= 8 || !this.validLoop(this.loop) || this.loop.temporary) return false;
    const { start, end, beats } = this.loop;
    this.savedLoops[index] = { start, end, beats }; return true;
  }

  recallLoop(index) {
    const loop = this.savedLoops[index];
    return this.validLoop(loop) ? this.setLoop(loop.start, loop.end, { jump: true }) : false;
  }

  cue() {
    this.pause(); this.loop = null; this.seek(this.cuePoint);
  }

  async cuePress() {
    if (!this.buffer || this.cuePreview) return;
    if (this.playing) { this.cue(); return; }
    this.cue(); this.cuePreview = true;
    try { await this.play(); }
    catch (error) { this.cuePreview = false; throw error; }
  }

  cueRelease() {
    if (this.cuePreview) this.cue();
  }

  latchCue() {
    if (!this.cuePreview) return false;
    this.cuePreview = false; return true;
  }

  meter() {
    this.analyser.getFloatTimeDomainData(this.meterData);
    let sum = 0;
    for (const x of this.meterData) sum += x * x;
    return Math.sqrt(sum / this.meterData.length);
  }
}

export class AudioEngine {
  constructor() {
    this.context = new AudioContext({ latencyHint: 'interactive' });
    this.filterFxPresets = ['off', 'echo', 'reverb', 'flanger'];
    this.pitchAvailable = false;
    this.pitchReady = this.context.audioWorklet
      ? this.context.audioWorklet.addModule(pitchWorkletUrl).then(() => { this.pitchAvailable = true; return true; }).catch(() => false)
      : Promise.resolve(false);
    this.master = this.context.createGain(); this.master.gain.value = 0.75;
    this.headroom = this.context.createGain(); this.headroom.gain.value = 1;
    this.compressor = this.context.createDynamicsCompressor();
    this.compressor.threshold.value = -2; this.compressor.knee.value = 3;
    this.compressor.ratio.value = 16; this.compressor.attack.value = 0.003;
    this.compressor.release.value = 0.1;
    this.analyser = this.context.createAnalyser(); this.analyser.fftSize = 512;
    // Headroom is applied before the master limiter so configured attenuation
    // also reduces the limiter's input level.
    this.master.connect(this.headroom).connect(this.compressor).connect(this.analyser).connect(this.context.destination);
    this.recordDestination = this.context.createMediaStreamDestination();
    this.analyser.connect(this.recordDestination);
    this.effectRacks = [new EffectRack(this.context, 0), new EffectRack(this.context, 1)];
    this.decks = Array.from({ length: 4 }, (_, id) => new Deck(this, id));
    this.sampler = new Sampler(this);
    this.monitor = new MonitorBus(this);
    this.crossfaderCurve = 0.5;
    this.crossfaderHamster = false;
    this.headroomDb = 0;
    this.limiterEnabled = true;
    this.autoGainLimits = { lower: 0.1, upper: 4, lowerDb: -20, upperDb: 12 };
    this.setCrossfader(0);
    // SYNC follows the audio clock even when the page is hidden or the UI
    // animation is throttled. The loop is intentionally lightweight: it
    // only re-anchors a deck when its required rate actually changes.
    this.syncTimer = setInterval(() => this.updateSync(), 50);
    // Navigation must release the native audio graph, including suspended
    // worklets, oscillator sources and media-stream destinations. Keeping
    // that graph alive until garbage collection can stall repeated reloads.
    window.addEventListener('pagehide', event => { if (!event.persisted) void this.close(); }, { once: true });
  }

  close() {
    if (this.closing) return this.closing;
    clearInterval(this.syncTimer);
    this.decks.forEach(deck => { deck.pause(); deck.disposeVoices(); });
    this.sampler.stopAll();
    this.monitor.mute();
    this.monitor.audio.srcObject = null;
    for (const stream of [this.recordDestination.stream, this.monitor.destination.stream]) {
      stream.getTracks().forEach(track => track.stop());
    }
    this.closing = this.context.close().catch(() => {});
    return this.closing;
  }

  canSync(id, target) {
    id = Number(id); target = Number(target);
    if (!Number.isInteger(id) || !Number.isInteger(target) || id === target || !this.decks[target]) return false;
    const visited = new Set();
    let current = target;
    while (this.decks[current]) {
      // Check the proposed edge before looking at the current node's active
      // state. A disabled deck can still point back to `id`; enabling it
      // later must not turn an otherwise valid graph into a cycle.
      if (current === id) return false;
      if (!this.decks[current].syncEnabled) break;
      if (visited.has(current)) return false;
      visited.add(current);
      const next = this.decks[current].syncTarget;
      if (!Number.isInteger(next) || !this.decks[next] || next === current) return false;
      current = next;
    }
    return true;
  }

  updateSync() {
    // Resolve source chains from their current state. A second pass handles
    // a source that itself follows another deck without introducing a cycle.
    for (const deck of this.decks) deck.updateTempo();
    for (let pass = 0; pass < this.decks.length; pass++) {
      let changed = false;
      for (const deck of this.decks) {
        if (!deck.syncEnabled || !deck.buffer) continue;
        const source = this.decks[deck.syncTarget];
        if (!source?.buffer) continue;
        const sourceBpm = source.musicalBpm;
        const targetBpm = deck.beatGridAt(deck.position).bpm;
        if (!Number.isFinite(sourceBpm) || !Number.isFinite(targetBpm) || targetBpm <= 0) continue;
        const before = deck.rate;
        deck.applyRate(sourceBpm / targetBpm, { preserveBend: true });
        changed ||= Math.abs(before - deck.rate) > 0.00001;
      }
      if (!changed) break;
    }
    for (const deck of this.decks) deck.updateTempo();
  }

  setCrossfader(value) {
    let x = (clamp(value, -1, 1) + 1) / 2;
    if (this.crossfaderHamster) x = 1 - x;
    this.crossfader = value;
    const exponent = this.crossfaderCurve <= 0.25 ? 0.5 : this.crossfaderCurve >= 0.75 ? 2 : 1;
    for (const deck of this.decks) {
      const base = deck.crossAssignment === 'thru' ? 1 : deck.crossAssignment === 'left' ? Math.cos(x * Math.PI / 2) : Math.sin(x * Math.PI / 2);
      const gain = deck.crossAssignment === 'thru' ? 1 : base ** exponent;
      deck.crossGain.gain.setTargetAtTime(gain, this.context.currentTime, 0.01);
    }
  }

  setCrossfaderCurve(value) {
    this.crossfaderCurve = clamp(Number(value), 0, 1);
    this.setCrossfader(this.crossfader);
    return this.crossfaderCurve;
  }

  setCrossfaderHamster(enabled) {
    this.crossfaderHamster = !!enabled;
    this.setCrossfader(this.crossfader);
    return this.crossfaderHamster;
  }

  assignCrossfader(id, assignment) {
    if (!['left', 'right', 'thru'].includes(assignment)) return;
    this.decks[id].crossAssignment = assignment; this.setCrossfader(this.crossfader);
  }

  setMaster(value) {
    this.master.gain.setTargetAtTime(value, this.context.currentTime, 0.02);
  }

  setHeadroom(db) {
    this.headroomDb = clamp(Number(db), -18, 0);
    this.headroom.gain.setTargetAtTime(10 ** (this.headroomDb / 20), this.context.currentTime, 0.02);
    return this.headroomDb;
  }

  setLimiterEnabled(enabled) {
    this.limiterEnabled = !!enabled;
    this.compressor.threshold.setTargetAtTime(this.limiterEnabled ? -2 : 0, this.context.currentTime, 0.01);
    this.compressor.knee.setTargetAtTime(this.limiterEnabled ? 3 : 0, this.context.currentTime, 0.01);
    this.compressor.ratio.setTargetAtTime(this.limiterEnabled ? 16 : 1, this.context.currentTime, 0.01);
    return this.limiterEnabled;
  }

  setAutoGainLimits(lowerDb, upperDb) {
    const lower = clamp(Number(lowerDb), -40, 0), upper = clamp(Number(upperDb), 0, 24);
    if (lower > upper) return this.autoGainLimits;
    this.autoGainLimits = { lower: 10 ** (lower / 20), upper: 10 ** (upper / 20), lowerDb: lower, upperDb: upper };
    this.decks?.forEach(deck => deck.setAutoGain(deck.autoGain, false));
    return this.autoGainLimits;
  }

  setFilterFxPresets(presets) {
    if (!Array.isArray(presets)) return this.filterFxPresets;
    this.filterFxPresets = Array.from({ length: 4 }, (_, index) => FILTER_FX_TYPES[presets[index]] ? presets[index] : 'off');
    this.decks?.forEach(deck => deck.setFilterFXSlot(deck.filterFxSlot));
    return this.filterFxPresets;
  }

  async decode(file) {
    return this.context.decodeAudioData(await file.arrayBuffer());
  }
}

export function peaksFor(buffer, count = 1400) {
  const data = buffer.getChannelData(0);
  const peaks = new Float32Array(count);
  const stride = data.length / count;
  for (let i = 0; i < count; i++) {
    const start = Math.floor(i * stride), end = Math.min(data.length, Math.floor((i + 1) * stride));
    let max = 0;
    for (let j = start; j < end; j += Math.max(1, Math.floor(stride / 100))) max = Math.max(max, Math.abs(data[j]));
    peaks[i] = max;
  }
  return peaks;
}

// DJUCED's WaveformReaderThread computes an FFT texture in addition to the
// amplitude outline. Keep a compact three-band version alongside peaks so the
// browser waveform exposes the same useful low/mid/high structure without
// retaining a full spectrogram for every track. The analysis is deterministic
// and bounded: 128-sample Hann windows and 24 DFT bins per display sample.
// The returned values are laid out [low, mid, high] for each display sample.
export function spectrumFor(buffer, count = 1400) {
  const result = new Float32Array(Math.max(0, count) * 3);
  if (!buffer || !count || !buffer.length) return result;
  const channels = Math.max(1, Math.min(2, buffer.numberOfChannels || 1));
  const data = Array.from({ length: channels }, (_, channel) => buffer.getChannelData(channel));
  const windowSize = 128;
  const half = windowSize / 2;
  const sampleRate = buffer.sampleRate || 44100;
  const stride = buffer.length / count;
  const cos = Array.from({ length: 25 }, (_, k) => Float32Array.from({ length: windowSize }, (_, n) => Math.cos(2 * Math.PI * k * n / windowSize)));
  const sin = Array.from({ length: 25 }, (_, k) => Float32Array.from({ length: windowSize }, (_, n) => Math.sin(2 * Math.PI * k * n / windowSize)));
  const window = Float32Array.from({ length: windowSize }, (_, n) => 0.5 - 0.5 * Math.cos(2 * Math.PI * n / (windowSize - 1)));
  const bands = [[1, 2], [3, 7], [8, 24]];
  // Use one shared ceiling so a quiet band stays visibly quiet relative to a
  // dominant band. Per-band normalization would erase the spectral contrast.
  let maximum = 1e-9;
  for (let i = 0; i < count; i++) {
    const center = Math.min(buffer.length - 1, Math.floor((i + 0.5) * stride));
    const start = Math.max(0, Math.min(buffer.length - windowSize, center - half));
    const real = new Float32Array(25), imag = new Float32Array(25);
    for (let n = 0; n < windowSize; n++) {
      const index = start + n;
      let value = 0;
      for (let channel = 0; channel < channels; channel++) value += data[channel][index] || 0;
      value = value / channels * window[n];
      for (let k = 1; k <= 24; k++) {
        real[k] += value * cos[k][n];
        imag[k] -= value * sin[k][n];
      }
    }
    for (let band = 0; band < bands.length; band++) {
      let energy = 0;
      for (let k = bands[band][0]; k <= bands[band][1]; k++) energy += Math.hypot(real[k], imag[k]);
      energy = Math.log1p(energy / windowSize * 32);
      result[i * 3 + band] = energy;
      maximum = Math.max(maximum, energy);
    }
  }
  for (let i = 0; i < count; i++) for (let band = 0; band < 3; band++) result[i * 3 + band] = Math.min(1, result[i * 3 + band] / maximum);
  return result;
}

// A local loudness estimate for Auto Gain. It uses a bounded RMS scan and a
// peak ceiling so quiet material is lifted without creating digital clipping.
// This is intentionally deterministic and conservative; it is not a claim
// of equivalence with DJUCED's proprietary analysis.
export function estimateAutoGain(buffer) {
  if (!buffer || !buffer.length) return 1;
  const channels = Math.max(1, buffer.numberOfChannels || 1);
  const samples = Math.min(buffer.length, Math.floor(buffer.sampleRate * 90));
  const stride = Math.max(1, Math.floor(samples / 120000));
  let sum = 0, peak = 0, count = 0;
  for (let i = 0; i < samples; i += stride) {
    let sample = 0;
    for (let channel = 0; channel < channels; channel++) sample += buffer.getChannelData(channel)[i] || 0;
    sample /= channels;
    sum += sample * sample; peak = Math.max(peak, Math.abs(sample)); count++;
  }
  if (!count || !Number.isFinite(sum) || sum < 1e-10) return 1;
  const rms = Math.sqrt(sum / count), target = 0.22;
  return clamp(Math.min(target / rms, peak > 1e-5 ? 0.9 / peak : 4), 0.25, 4);
}

// Suggest up to eight section markers on the beat grid. Strong local onsets
// are quantized to the nearest beat and kept several beats apart so the
// result is useful as a starting set of Hot Cues without filling every slot.
export function estimateAutoHotcues(buffer, bpm, gridOffset = 0) {
  if (!buffer || !Number.isFinite(bpm) || bpm < 30 || bpm > 300 || buffer.duration < 1) return [];
  const hop = Math.max(1, Math.floor(buffer.sampleRate / 200)), rate = buffer.sampleRate / hop;
  const n = Math.min(Math.floor(buffer.length / hop), Math.floor(rate * 180));
  if (n < 4) return [];
  const data = buffer.getChannelData(0), onset = new Float32Array(n);
  let previous = 0;
  for (let i = 0; i < n; i++) {
    let energy = 0, start = i * hop, end = Math.min(data.length, start + hop);
    for (let j = start; j < end; j++) energy += data[j] * data[j];
    const level = Math.sqrt(energy / Math.max(1, end - start));
    onset[i] = Math.max(0, level - previous); previous = previous * 0.7 + level * 0.3;
  }
  const beat = 60 / bpm, candidates = [];
  for (let i = 1; i < n - 1; i++) {
    if (onset[i] <= onset[i - 1] || onset[i] < onset[i + 1] || onset[i] < 0.0005) continue;
    const raw = i / rate;
    const quantized = Math.max(0, gridOffset + Math.round((raw - gridOffset) / beat) * beat);
    if (quantized >= buffer.duration - 0.01) continue;
    candidates.push({ position: quantized, score: onset[i] });
  }
  candidates.sort((a, b) => b.score - a.score);
  const selected = [];
  const first = clamp(gridOffset, 0, Math.max(0, buffer.duration - 0.01));
  if (first < buffer.duration) selected.push(first);
  for (const candidate of candidates) {
    if (selected.length >= 8) break;
    if (selected.every(position => Math.abs(position - candidate.position) >= beat * 4 - 1e-6)) selected.push(candidate.position);
  }
  return [...new Set(selected.map(value => Number(value.toFixed(6))))].sort((a, b) => a - b);
}

export function normalizeBeatGrid(value, bpm = 120, gridOffset = 0) {
  const segments = Array.isArray(value) ? value.filter(segment => segment && Number.isFinite(segment.start) && Number.isFinite(segment.offset) && Number.isFinite(segment.bpm) && segment.bpm >= 30 && segment.bpm <= 300).sort((a, b) => a.start - b.start).map(segment => ({ start: Math.max(0, segment.start), offset: segment.offset, bpm: segment.bpm })) : [];
  if (!segments.length) return [{ start: 0, offset: gridOffset, bpm }];
  segments[0] = { ...segments[0], start: 0, offset: gridOffset };
  return segments.filter((segment, index) => index === 0 || segment.start > segments[index - 1].start);
}

// An onset-envelope autocorrelation estimate, not a recovered DJUCED algorithm.
export function estimateBPM(buffer) {
  if (buffer.duration < 5) return { bpm: null, confidence: 0 };
  const data = buffer.getChannelData(0);
  const hop = Math.max(1, Math.floor(buffer.sampleRate / 200));
  const envelopeRate = buffer.sampleRate / hop;
  const n = Math.min(Math.floor(data.length / hop), Math.floor(envelopeRate * 90));
  const onset = new Float32Array(n);
  let prev = 0, total = 0;
  for (let i = 0; i < n; i++) {
    let energy = 0;
    for (let j = 0; j < hop; j++) energy += data[i * hop + j] ** 2;
    energy = Math.sqrt(energy / hop);
    onset[i] = Math.max(0, energy - prev);
    prev = energy * 0.65 + prev * 0.35;
    total += onset[i] ** 2;
  }
  if (total < 0.0001) return { bpm: null, confidence: 0 };
  let bestBpm = 120, bestScore = 0;
  for (let bpm = 70; bpm <= 180; bpm += 0.5) {
    const lag = envelopeRate * 60 / bpm;
    let score = 0;
    for (let i = Math.ceil(lag * 2); i < n; i++) {
      const at = i - lag, floor = Math.floor(at), fraction = at - floor;
      score += onset[i] * (onset[floor] * (1 - fraction) + onset[floor + 1] * fraction);
    }
    if (score > bestScore) { bestScore = score; bestBpm = bpm; }
  }
  const confidence = clamp(bestScore / total, 0, 1);
  return { bpm: confidence > 0.07 ? bestBpm : null, confidence };
}

// Pick the first strong transient as a useful initial beat-grid anchor. This
// is deliberately conservative: it supplies a starting point for manual
// correction and does not try to solve dynamic-tempo or downbeat detection.
export function estimateFirstBeat(buffer, bpm) {
  if (!buffer || !Number.isFinite(bpm) || bpm < 30 || bpm > 300) return { offset: 0, confidence: 0 };
  const hop = Math.max(1, Math.floor(buffer.sampleRate / 400));
  const rate = buffer.sampleRate / hop, n = Math.min(Math.floor(buffer.length / hop), Math.floor(rate * 12));
  if (n < 4) return { offset: 0, confidence: 0 };
  const data = buffer.getChannelData(0), onset = new Float32Array(n);
  let previous = 0, peak = 0;
  for (let i = 0; i < n; i++) {
    let energy = 0;
    const start = i * hop, end = Math.min(data.length, start + hop);
    for (let j = start; j < end; j++) energy += data[j] * data[j];
    const level = Math.sqrt(energy / Math.max(1, end - start));
    onset[i] = Math.max(0, level - previous); previous = previous * 0.75 + level * 0.25;
    peak = Math.max(peak, onset[i]);
  }
  if (peak < 0.0005) return { offset: 0, confidence: 0 };
  const threshold = peak * 0.42, minGap = Math.max(1, Math.floor(rate * 0.08));
  let candidate = -1;
  for (let i = 0; i < n; i++) {
    if (onset[i] < threshold || (i && onset[i] < onset[i - 1]) || (i + 1 < n && onset[i] < onset[i + 1])) continue;
    if (candidate < 0 || i - candidate >= minGap) { candidate = i; break; }
  }
  if (candidate < 0) return { offset: 0, confidence: 0 };
  const offset = Math.max(0, Math.min(buffer.duration, candidate / rate));
  return { offset, confidence: Math.min(1, onset[candidate] / Math.max(peak, 1e-9)) };
}

// Estimate a piecewise constant beat grid from short local autocorrelation
// windows. It is intentionally conservative: a segment is emitted only when
// its local BPM differs clearly from the previous stable estimate. The result
// is a useful grid seed for variable-tempo material and remains editable.
export function estimateDynamicBeatGrid(buffer, bpm, gridOffset = 0) {
  if (!buffer || !Number.isFinite(bpm) || bpm < 30 || bpm > 300 || buffer.duration < 10) {
    return { beatGrid: normalizeBeatGrid(null, bpm || 120, gridOffset), confidence: 0, segments: 1 };
  }
  const data = buffer.getChannelData(0), hop = Math.max(1, Math.floor(buffer.sampleRate / 200)), rate = buffer.sampleRate / hop;
  const n = Math.min(Math.floor(data.length / hop), Math.floor(rate * 180)), onset = new Float32Array(n);
  let previous = 0;
  for (let i = 0; i < n; i++) {
    let energy = 0; const start = i * hop, end = Math.min(data.length, start + hop);
    for (let j = start; j < end; j++) energy += data[j] * data[j];
    const level = Math.sqrt(energy / Math.max(1, end - start));
    onset[i] = Math.max(0, level - previous); previous = previous * 0.65 + level * 0.35;
  }
  const window = Math.max(1, Math.floor(rate * 8)), stride = Math.max(1, Math.floor(rate * 4));
  const estimates = [];
  for (let start = 0; start + window <= n; start += stride) {
    const end = start + window; let total = 0, bestScore = 0, bestBpm = bpm;
    for (let i = start; i < end; i++) total += onset[i] * onset[i];
    if (total < 1e-7) { estimates.push({ start: start / rate, bpm, confidence: 0 }); continue; }
    for (let candidate = 60; candidate <= 200; candidate += 1) {
      const lag = rate * 60 / candidate; let score = 0;
      for (let i = start + Math.ceil(lag * 1.5); i < end; i++) {
        const at = i - lag, floor = Math.floor(at), fraction = at - floor;
        if (floor < start || floor + 1 >= end) continue;
        score += onset[i] * (onset[floor] * (1 - fraction) + onset[floor + 1] * fraction);
      }
      if (score > bestScore) { bestScore = score; bestBpm = candidate; }
    }
    estimates.push({ start: start / rate, bpm: bestBpm, confidence: clamp(bestScore / total, 0, 1) });
  }
  if (!estimates.length) return { beatGrid: normalizeBeatGrid(null, bpm, gridOffset), confidence: 0, segments: 1 };
  const beatGrid = [{ start: 0, offset: gridOffset, bpm: estimates[0].confidence >= 0.05 ? estimates[0].bpm : bpm }];
  let confidenceTotal = estimates[0].confidence, confidenceCount = 1;
  for (let i = 1; i < estimates.length; i++) {
    const current = estimates[i], previousSegment = beatGrid.at(-1);
    confidenceTotal += current.confidence; confidenceCount++;
    if (current.confidence < 0.08 || Math.abs(current.bpm - previousSegment.bpm) < 3) continue;
    const oldBeat = 60 / previousSegment.bpm;
    // A short analysis window straddles a change. Put the new segment at its
    // centre rather than at the window's left edge, which otherwise makes a
    // tempo change appear several seconds too early.
    const transition = current.start + (window / rate) / 2;
    const offset = previousSegment.offset + Math.round((transition - previousSegment.offset) / oldBeat) * oldBeat;
    beatGrid.push({ start: transition, offset, bpm: current.bpm });
  }
  return { beatGrid: normalizeBeatGrid(beatGrid, bpm, gridOffset), confidence: confidenceTotal / confidenceCount, segments: beatGrid.length };
}

// A small, local key estimate for tracks without a tagged key. It measures
// pitch-class energy in the first few seconds and compares it with standard
// major/minor tonal profiles. This is intentionally a hint for library
// browsing; it is not a replacement for a full key-detection model.
export function estimateKey(buffer) {
  if (!buffer || buffer.duration < 2) return { key: null, confidence: 0 };
  const names = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const major = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
  const minor = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];
  const sourceRate = buffer.sampleRate, requestedRate = Math.min(sourceRate, 11025), step = Math.max(1, Math.round(sourceRate / requestedRate)), rate = sourceRate / step;
  const frame = 2048, frames = Math.min(24, Math.floor(buffer.length / (frame * step))), data = buffer.getChannelData(0);
  if (frames < 2) return { key: null, confidence: 0 };
  const chroma = new Float64Array(12), frequencies = [];
  for (let midi = 36; midi <= 84; midi++) frequencies.push({ midi, hz: 440 * 2 ** ((midi - 69) / 12), pc: ((midi % 12) + 12) % 12 });
  for (let block = 0; block < frames; block++) {
    const offset = block * frame * step;
    for (const tone of frequencies) {
      const omega = 2 * Math.PI * tone.hz / rate, coeff = 2 * Math.cos(omega);
      let s1 = 0, s2 = 0;
      for (let i = 0; i < frame; i++) {
        const sample = data[offset + i * step] || 0, s0 = sample + coeff * s1 - s2;
        s2 = s1; s1 = s0;
      }
      chroma[tone.pc] += Math.max(0, s1 * s1 + s2 * s2 - coeff * s1 * s2) / Math.max(1, tone.hz);
    }
  }
  const total = chroma.reduce((sum, value) => sum + value, 0);
  if (!total) return { key: null, confidence: 0 };
  const score = profile => { let best = -Infinity, root = 0; for (let r = 0; r < 12; r++) { let value = 0; for (let p = 0; p < 12; p++) value += (chroma[p] / total) * profile[(p - r + 12) % 12]; if (value > best) { best = value; root = r; } } return { best, root }; };
  const majorScore = score(major), minorScore = score(minor), selected = majorScore.best >= minorScore.best ? { ...majorScore, suffix: '' } : { ...minorScore, suffix: 'm' };
  const confidence = Math.max(0, Math.min(1, (selected.best - Math.min(majorScore.best, minorScore.best)) * 2.5));
  return { key: `${names[selected.root]}${selected.suffix}`, confidence };
}

export function createDemo(context, variant = 0) {
  const bpm = variant ? 124 : 120;
  const sampleRate = 22050, beat = 60 / bpm, duration = beat * 64;
  const buffer = context.createBuffer(2, Math.floor(duration * sampleRate), sampleRate);
  let seed = 123456 + variant;
  const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296 * 2 - 1; };
  const notes = variant ? [110, 130.81, 146.83, 130.81] : [65.41, 77.78, 87.31, 77.78];
  for (let i = 0; i < buffer.length; i++) {
    const t = i / sampleRate, index = Math.floor(t / beat), phase = t % beat;
    const eighth = t % (beat / 2);
    const kick = Math.sin(2 * Math.PI * (48 * phase + 9 * (1 - Math.exp(-phase * 35)))) * Math.exp(-phase * 17) * 0.48;
    const hat = random() * Math.exp(-eighth * 100) * (index % 2 ? 0.10 : 0.06);
    const clap = index % 2 ? random() * Math.exp(-phase * 38) * 0.12 : 0;
    const f = notes[Math.floor(index / 8) % notes.length];
    const bass = Math.sin(2 * Math.PI * f * t) * Math.min(1, phase * 90) * Math.exp(-phase * 5) * 0.2;
    const chord = (Math.sin(2 * Math.PI * f * 4 * t) + Math.sin(2 * Math.PI * f * 5 * t) + Math.sin(2 * Math.PI * f * 6 * t)) * 0.027 * (0.6 + 0.4 * Math.cos(t * Math.PI / (beat * 8)));
    const fade = Math.min(1, t * 80, (duration - t) * 80);
    buffer.getChannelData(0)[i] = (kick + hat + clap + bass + chord) * fade;
    buffer.getChannelData(1)[i] = (kick - hat * 0.7 + clap + bass + chord * 0.9) * fade;
  }
  return buffer;
}
