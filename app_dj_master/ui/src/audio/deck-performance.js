export const loopPosition = (position, loop, reverse = false) => {
  if (!loop || loop.end <= loop.start) return position;
  const length = loop.end - loop.start;
  const remainder = ((position - loop.start) % length + length) % length;
  // Keep the reverse transport strictly inside the audible loop.  At the
  // exact IN boundary the reverse source is about to read the sample just
  // before IN, which is represented by the last sub-sample before OUT in the
  // timeline.  A tiny epsilon also keeps UI/state assertions from exposing
  // the exclusive OUT boundary as a playable position.
  return reverse && remainder === 0 ? loop.end - 1e-7 : loop.start + remainder;
};
export const ROLL_BEATS = [1 / 16, 1 / 8, 1 / 4, 1 / 2, 1, 2, 4, 8];
export const JUMP_BEATS = [-16, -8, -4, -1, 1, 4, 8, 16];

// Shadow timelines use AudioContext time, never animation frames or wall time.
// A temporary pad can run over an existing loop without replacing its timeline.
export class DeckPerformance {
  constructor(deck) {
    this.deck = deck;
    this.slipEnabled = false;
    this.loopSlip = null;
    this.slipCue = null;
    this.scratchSlip = null;
    this.gesture = null;
    this.domainBeats = 8;
    this.sliceRepeat = 1;
    this.slicerMode = 'moving';
    this.slicerFixedDomain = null;
    this.serial = 0;
    this.onchange = () => {};
  }
  snapshot() {
    const d = this.deck;
    return { position: d.position, anchor: d.context.currentTime, rate: d.signedEffectiveRate, loop: d.loop ? { ...d.loop } : null };
  }
  at(timeline) {
    const duration = this.deck.buffer?.duration || 0;
    return Math.max(0, Math.min(duration, loopPosition(timeline.position + (this.deck.context.currentTime - timeline.anchor) * timeline.rate, timeline.loop, timeline.rate < 0)));
  }
  get backgroundPosition() {
    return this.slipCue ? this.at(this.slipCue.timeline) : this.loopSlip ? this.at(this.loopSlip) : this.gesture ? this.at(this.gesture.timeline) : this.scratchSlip ? this.at(this.scratchSlip) : this.deck.position;
  }
  reanchor(rate) {
    for (const timeline of [this.slipCue?.timeline, this.loopSlip, this.gesture?.timeline, this.scratchSlip]) {
      if (!timeline) continue;
      timeline.position = this.at(timeline); timeline.anchor = this.deck.context.currentTime; timeline.rate = rate;
    }
  }
  setSlip(enabled) {
    // Disabling Slip commits the audible loop; it does not jump unexpectedly.
    this.slipEnabled = !!enabled;
    if (!enabled) {
      // A Slip Hot Cue is a temporary transport override. If the user turns
      // Slip off while the pad is still held, return to the background clock
      // before dropping the Slip state; otherwise the late pointer/key-up
      // would leave the deck audibly parked at the cue.
      this.endSlipCue();
      this.loopSlip = null;
      this.scratchSlip = null;
    }
    this.onchange();
  }
  beginScratch() {
    if (this.slipEnabled && this.deck.playing) this.scratchSlip = this.snapshot();
    this.onchange();
  }
  rebaseScratch(position, loop) {
    if (!this.scratchSlip) return;
    // A pad released under the held platter can restore an outer timeline.
    // Continue that restored clock instead of reviving the earlier preview.
    this.scratchSlip = { position, anchor: this.deck.context.currentTime, rate: this.deck.signedEffectiveRate, loop: loop ? { ...loop } : null };
  }
  endScratch() {
    const timeline = this.scratchSlip;
    this.scratchSlip = null; this.onchange();
    return timeline;
  }
  beginSlipLoop() { if (this.slipEnabled && this.deck.playing && !this.loopSlip) this.loopSlip = this.snapshot(); }
  endSlipLoop() {
    if (!this.loopSlip) return false;
    const timeline = this.loopSlip, position = this.at(timeline); this.loopSlip = null;
    this.deck.replacePlayback(position, timeline.loop, this.deck.playing);
    this.onchange(); return true;
  }
  beginSlipCue(position, pad = null, source = pad) {
    const d = this.deck;
    if (!this.slipEnabled || !d.playing || !d.buffer || !Number.isFinite(position)) return false;
    if (position < 0 || position >= d.buffer.duration) return false;
    if (this.slipCue?.source === source) return true;
    // When a Slip loop or another temporary pad is active, its saved timeline
    // is the real background clock. A fresh snapshot would incorrectly make
    // the audible loop part of that clock and lose the outer Slip state.
    const previous = this.slipCue;
    const timeline = previous?.timeline || this.loopSlip || this.gesture?.timeline || this.snapshot();
    this.slipCue = {
      timeline: { ...timeline },
      position,
      pad, source,
      // The newest cue owns transport; older releases cannot end it. Keep
      // the original background clock when switching between held inputs.
      restoreLoop: previous ? previous.restoreLoop : d.loop ? { ...d.loop } : null,
    };
    d.replacePlayback(position, null, true);
    this.onchange();
    return true;
  }
  endSlipCue(source = null) {
    if (!this.slipCue) return false;
    if (source !== null && this.slipCue.source !== source) return false;
    const { timeline, restoreLoop } = this.slipCue;
    this.slipCue = null;
    const position = this.at(timeline);
    // A preview can reach a track edge while the background clock is still
    // running. Pause/seek/load cancel slipCue, so a surviving hold may safely
    // restore transport even if that preview source has naturally ended.
    this.deck.replacePlayback(position, restoreLoop, !this.deck.scratchState);
    this.onchange();
    return true;
  }
  cancel() {
    // Pause/seek/load cancels all holds. A late pointer/key release cannot restart.
    if (this.gesture) this.deck.loop = this.gesture.timeline.loop;
    if (this.loopSlip) this.deck.loop = this.loopSlip.loop;
    this.gesture = null; this.loopSlip = null; this.slipCue = null; this.scratchSlip = null;
    this.onchange();
  }
  setSlicerMode(mode) {
    mode = mode === 'fixed' ? 'fixed' : 'moving';
    this.slicerMode = mode;
    this.slicerFixedDomain = mode === 'fixed' ? this.computeSlicerDomain() : null;
    this.onchange();
    return mode;
  }
  resetSlicerDomain() {
    this.slicerFixedDomain = this.slicerMode === 'fixed' ? this.computeSlicerDomain() : null;
    this.onchange();
  }
  hold(kind, start, end, beats, pad) {
    const d = this.deck;
    if (!d.playing || !d.buffer || !Number.isFinite(start) || !Number.isFinite(end) || end - start < 1 / d.buffer.sampleRate || start < 0 || end > d.buffer.duration) return null;
    if (!this.gesture) this.gesture = { timeline: this.snapshot(), held: [], domain: this.slicerDomain() };
    const token = ++this.serial;
    this.gesture.held.push({ token, kind, pad, loop: { start, end, beats, temporary: true } });
    d.replacePlayback(start, this.gesture.held.at(-1).loop, true);
    this.onchange(); return token;
  }
  roll(beats, pad) {
    if (!ROLL_BEATS.includes(beats)) return null;
    const d = this.deck, position = this.gesture ? this.at(this.gesture.timeline) : d.position, grid = d.beatGridAt(position), beat = 60 / grid.bpm;
    // Small rolls snap to their subdivision, large rolls start on a beat.
    const step = beat * Math.min(1, beats);
    const start = Math.max(0, grid.offset + Math.floor((position - grid.offset) / step) * step);
    return this.hold('roll', start, Math.min(d.buffer?.duration || 0, start + beats * beat), beats, pad);
  }
  slicerDomain() {
    if (this.gesture) return this.gesture.domain;
    if (this.slicerMode === 'fixed' && this.slicerFixedDomain) return { ...this.slicerFixedDomain };
    return this.computeSlicerDomain();
  }
  computeSlicerDomain() {
    const d = this.deck, grid = d.beatGridAt(), length = this.domainBeats * 60 / grid.bpm;
    const start = Math.max(0, grid.offset + Math.floor((d.position - grid.offset) / length) * length);
    return { start, length };
  }
  slice(index) {
    if (!Number.isInteger(index) || index < 0 || index > 7) return null;
    const d = this.deck, domain = this.slicerDomain(), slice = domain.length / 8;
    const start = domain.start + index * slice;
    const length = Math.min(slice, this.sliceRepeat * d.beatDurationAt(start));
    return this.hold('slicer', start, Math.min(d.buffer?.duration || 0, start + length), length / d.beatDurationAt(start), index);
  }
  release(token) {
    if (!this.gesture) return false;
    const held = this.gesture.held, index = held.findIndex(item => item.token === token);
    if (index === -1) return false;
    const wasActive = index === held.length - 1;
    held.splice(index, 1);
    if (!held.length) return this.finish();
    if (wasActive) this.deck.replacePlayback(held.at(-1).loop.start, held.at(-1).loop, this.deck.playing);
    this.onchange(); return true;
  }
  finish() {
    if (!this.gesture) return false;
    const timeline = this.gesture.timeline, position = this.at(timeline);
    this.gesture = null;
    this.deck.replacePlayback(position, timeline.loop, this.deck.playing);
    this.onchange(); return true;
  }
  get active() { return this.gesture?.held.at(-1) || null; }
}
