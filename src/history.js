// Count conservatively sampled signal reaching the master bus. This is a local
// policy, not a claim about DJUCED's private history threshold or physical sound.
export class PlaybackHistory {
  constructor(engine, catalog, onerror = () => {}) {
    this.engine = engine; this.catalog = catalog; this.onerror = onerror;
    this.states = new Map(); this.previousTime = engine.context.currentTime;
  }
  tick() {
    const now = this.engine.context.currentTime, elapsed = now - this.previousTime;
    this.previousTime = now;
    for (const deck of this.engine.decks) {
      let state = this.states.get(deck.id);
      if (!state || state.version !== deck.loadVersion) {
        state = { version: deck.loadVersion, seconds: 0, audible: false, done: false, pending: false, retryAt: 0 };
        this.states.set(deck.id, state);
      }
      const audible = !!deck.track && deck.playing && !deck.cuePreview && this.engine.context.state === 'running'
        && deck.meter() * deck.crossGain.gain.value * this.engine.master.gain.value > 0.0001;
      // Do not infer listening during unobserved long browser suspension.
      if (audible && state.audible && elapsed > 0 && elapsed <= 1.5) state.seconds += elapsed;
      state.audible = audible;
      if (state.seconds < 15 || state.done || state.pending || now < state.retryAt || !deck.track) continue;
      state.pending = true;
      this.catalog.recordPlay(deck.track.id, deck.id).then(() => { state.done = true; })
        .catch(() => { state.retryAt = now + 10; if (!state.failed) this.onerror(); state.failed = true; })
        .finally(() => { state.pending = false; });
    }
  }
}
