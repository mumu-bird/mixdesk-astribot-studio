const DEFAULT_MIN_BPM = 60;
const DEFAULT_MAX_BPM = 180;
const ANALYSIS_HOP_SECONDS = 0.01;
const ANALYSIS_WINDOW_SECONDS = 0.05;

function correlationAtLag(onsets, lag, mean) {
  let cross = 0;
  let leftEnergy = 0;
  let rightEnergy = 0;
  for (let index = lag; index < onsets.length; index++) {
    const left = onsets[index] - mean;
    const right = onsets[index - lag] - mean;
    cross += left * right;
    leftEnergy += left * left;
    rightEnergy += right * right;
  }
  const denominator = Math.sqrt(leftEnergy * rightEnergy);
  return denominator > 1e-10 ? cross / denominator : 0;
}

/**
 * Estimate a quarter-note tempo from repeated positive energy attacks.
 * This is deliberately a suggestion for user confirmation, not a beat grid
 * guarantee; quiet, syncopated, or tempo-changing recordings can be ambiguous.
 */
export function estimateBpm(audioBuffer, { minBpm = DEFAULT_MIN_BPM, maxBpm = DEFAULT_MAX_BPM } = {}) {
  if (!audioBuffer || !Number.isFinite(audioBuffer.sampleRate) || audioBuffer.duration < 4) {
    return { bpm: null, confidence: 0, reason: 'too-short' };
  }

  const hop = Math.max(1, Math.round(audioBuffer.sampleRate * ANALYSIS_HOP_SECONDS));
  const window = Math.max(hop, Math.round(audioBuffer.sampleRate * ANALYSIS_WINDOW_SECONDS));
  const frameCount = Math.floor((audioBuffer.length - window) / hop) + 1;
  if (frameCount < 100) return { bpm: null, confidence: 0, reason: 'too-short' };

  const channels = Array.from({ length: audioBuffer.numberOfChannels }, (_, index) => audioBuffer.getChannelData(index));
  const energy = new Float32Array(frameCount);
  let windowEnergy = 0;
  for (const channel of channels) {
    for (let sample = 0; sample < window; sample++) windowEnergy += channel[sample] * channel[sample];
  }
  const energyDivisor = window * channels.length;
  for (let frame = 0; frame < frameCount; frame++) {
    energy[frame] = windowEnergy / energyDivisor;
    if (frame === frameCount - 1) break;
    const outgoing = frame * hop;
    const incoming = outgoing + window;
    for (const channel of channels) {
      for (let sample = 0; sample < hop; sample++) {
        windowEnergy -= channel[outgoing + sample] ** 2;
        windowEnergy += channel[incoming + sample] ** 2;
      }
    }
  }

  const onsets = new Float32Array(frameCount);
  let mean = 0;
  let meanSignalEnergy = 0;
  let strongestOnset = 0;
  for (let frame = 1; frame < frameCount; frame++) {
    const onset = Math.max(0, energy[frame] - energy[frame - 1]);
    onsets[frame] = onset;
    mean += onset;
    meanSignalEnergy += energy[frame];
    strongestOnset = Math.max(strongestOnset, onset);
  }
  mean /= frameCount;
  meanSignalEnergy /= frameCount;
  let onsetEnergy = 0;
  for (const onset of onsets) onsetEnergy += (onset - mean) ** 2;
  if (onsetEnergy < 1e-10 || strongestOnset < meanSignalEnergy * 0.05) {
    return { bpm: null, confidence: 0, reason: 'no-transients' };
  }

  const minLag = Math.max(1, Math.floor(audioBuffer.sampleRate * 60 / (maxBpm * hop)));
  const maxLag = Math.min(
    Math.ceil(audioBuffer.sampleRate * 60 / (minBpm * hop)),
    Math.floor(frameCount / 4),
  );
  let best = { lag: 0, bpm: 0, score: -1 };
  const scores = new Map();
  for (let lag = minLag; lag <= maxLag; lag++) {
    const score = correlationAtLag(onsets, lag, mean);
    scores.set(lag, score);
    const bpm = 60 * audioBuffer.sampleRate / (lag * hop);
    if (score > best.score + 0.002 || (Math.abs(score - best.score) <= 0.002 && bpm > best.bpm)) {
      best = { lag, bpm, score };
    }
  }

  if (best.score < 0.18) return { bpm: null, confidence: Math.max(0, best.score), reason: 'no-steady-pulse' };
  const previous = scores.get(best.lag - 1) ?? best.score;
  const next = scores.get(best.lag + 1) ?? best.score;
  const curvature = previous - 2 * best.score + next;
  const correction = Math.abs(curvature) > 1e-8
    ? Math.max(-0.5, Math.min(0.5, 0.5 * (previous - next) / curvature))
    : 0;
  const refinedLag = best.lag + correction;
  return {
    bpm: Math.round((60 * audioBuffer.sampleRate / (refinedLag * hop)) * 10) / 10,
    confidence: Math.max(0, Math.min(1, best.score)),
    reason: null,
  };
}

/** Conservative first strong onset anchor, ported from MIXDESK's audio grid analysis. */
export function estimateFirstBeat(audioBuffer, bpm) {
  if (!audioBuffer || !Number.isFinite(bpm) || bpm < 30 || bpm > 300) return { offset: 0, confidence: 0 };
  const hop = Math.max(1, Math.floor(audioBuffer.sampleRate / 400));
  const rate = audioBuffer.sampleRate / hop;
  const frameCount = Math.min(Math.floor(audioBuffer.length / hop), Math.floor(rate * 12));
  if (frameCount < 4) return { offset: 0, confidence: 0 };
  const data = audioBuffer.getChannelData(0);
  const onset = new Float32Array(frameCount);
  let previous = 0;
  let peak = 0;
  for (let frame = 0; frame < frameCount; frame++) {
    const start = frame * hop;
    const end = Math.min(data.length, start + hop);
    let energy = 0;
    for (let sample = start; sample < end; sample++) energy += data[sample] * data[sample];
    const level = Math.sqrt(energy / Math.max(1, end - start));
    onset[frame] = Math.max(0, level - previous);
    previous = previous * 0.75 + level * 0.25;
    peak = Math.max(peak, onset[frame]);
  }
  if (peak < 0.0005) return { offset: 0, confidence: 0 };
  const threshold = peak * 0.42;
  const minimumGap = Math.max(1, Math.floor(rate * 0.08));
  let candidate = -1;
  for (let frame = 0; frame < frameCount; frame++) {
    if (onset[frame] < threshold
      || (frame > 0 && onset[frame] < onset[frame - 1])
      || (frame + 1 < frameCount && onset[frame] < onset[frame + 1])) continue;
    if (candidate < 0 || frame - candidate >= minimumGap) {
      candidate = frame;
      break;
    }
  }
  if (candidate < 0) return { offset: 0, confidence: 0 };
  return {
    offset: Math.max(0, Math.min(audioBuffer.duration, candidate / rate)),
    confidence: Math.min(1, onset[candidate] / Math.max(peak, 1e-9)),
  };
}
