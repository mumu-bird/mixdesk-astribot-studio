const STEMS = [
  { id: 'vocals', label: '人声', type: 'bandpass', low: 220, high: 4200 },
  { id: 'drums', label: '鼓组', type: 'bandpass', low: 70, high: 2600 },
  { id: 'bass', label: '低音', type: 'lowpass', low: 0, high: 220 },
  { id: 'music', label: '音乐', type: 'highpass', low: 2600, high: 0 },
];

const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

/**
 * Four controllable local frequency regions.
 *
 * This remains explicitly separate from source separation. The dry path is
 * used while all controls are at their defaults, so loading a track does not
 * alter its sound. Changing a control activates the local filter-bank path;
 * it does not claim to extract independent vocal, drum, bass and music
 * sources like a neural separation model would.
 */
export class StemMixer {
  constructor(context) {
    this.context = context;
    this.input = context.createGain();
    this.output = context.createGain();
    this.output.gain.value = 1;
    this.dry = context.createGain();
    this.processed = context.createGain();
    this.dry.gain.value = 1;
    this.processed.gain.value = 0;
    this.input.connect(this.dry).connect(this.output);
    this.processed.connect(this.output);
    this.channels = Object.fromEntries(STEMS.map(spec => {
      const filter = context.createBiquadFilter();
      filter.type = spec.type;
      filter.frequency.value = spec.type === 'lowpass' ? spec.high : spec.type === 'highpass' ? spec.low : Math.sqrt(spec.low * spec.high);
      filter.Q.value = spec.type === 'bandpass' ? 0.55 : 0.7;
      const gain = context.createGain(); gain.gain.value = 1;
      this.input.connect(filter).connect(gain).connect(this.processed);
      return [spec.id, { ...spec, filter, gain, level: 1, muted: false, solo: false }];
    }));
    this.refreshRouting();
  }

  ids() { return STEMS.map(stem => stem.id); }
  get(id) { return this.channels[id]; }

  update(id) {
    const channel = this.channels[id];
    if (!channel) return;
    const anySolo = Object.values(this.channels).some(stem => stem.solo);
    const audible = !channel.muted && (!anySolo || channel.solo);
    const now = this.context.currentTime;
    channel.gain.gain.cancelScheduledValues(now);
    channel.gain.gain.setTargetAtTime(audible ? channel.level : 0, now, 0.012);
    this.refreshRouting();
  }

  refreshRouting() {
    const active = Object.values(this.channels).some(channel => channel.muted || channel.solo || Math.abs(channel.level - 1) > 1e-6);
    const now = this.context.currentTime;
    for (const [node, value] of [[this.dry, active ? 0 : 1], [this.processed, active ? 1 : 0]]) {
      node.gain.cancelScheduledValues(now);
      node.gain.setTargetAtTime(value, now, 0.006);
    }
  }

  setLevel(id, value) {
    const channel = this.channels[id], level = Number(value); if (!channel || !Number.isFinite(level)) return false;
    channel.level = clamp(level, 0, 1.5); this.update(id); return true;
  }
  setMuted(id, muted) {
    const channel = this.channels[id]; if (!channel) return false;
    channel.muted = !!muted; this.update(id); return true;
  }
  setSolo(id, solo) {
    const channel = this.channels[id]; if (!channel) return false;
    channel.solo = !!solo; Object.keys(this.channels).forEach(key => this.update(key)); return true;
  }
  toggleMute(id) { const channel = this.channels[id]; return channel ? this.setMuted(id, !channel.muted) : false; }
  toggleSolo(id) { const channel = this.channels[id]; return channel ? this.setSolo(id, !channel.solo) : false; }

  snapshot() {
    return Object.fromEntries(this.ids().map(id => {
      const channel = this.channels[id];
      return [id, { level: channel.level, muted: channel.muted, solo: channel.solo }];
    }));
  }
  restore(snapshot) {
    if (!snapshot || typeof snapshot !== 'object') return;
    for (const id of this.ids()) {
      const value = snapshot[id]; if (!value || typeof value !== 'object') continue;
      if (Number.isFinite(Number(value.level))) this.channels[id].level = clamp(Number(value.level), 0, 1.5);
      this.channels[id].muted = !!value.muted; this.channels[id].solo = !!value.solo;
    }
    this.ids().forEach(id => this.update(id));
  }
}

export const STEM_DEFINITIONS = STEMS.map(({ id, label }) => ({ id, label }));
