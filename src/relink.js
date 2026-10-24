import { estimateAutoGain, peaksFor, clamp } from './audio.js';
import { readMetadata } from './metadata.js';
import { replaceTrackRecord, setting } from './storage.js';

const transportKeys = ['track', 'buffer', 'reverseBuffer', 'peaks', 'offset', 'anchor', 'rate', 'bpm', 'cuePoint', 'cuePreview', 'hotcues', 'hotcueMeta', 'savedLoops', 'loop', 'loopIn', 'gridOffset', 'beatGrid', 'autoGain', 'loadVersion', 'syncEnabled', 'syncTarget', 'scratchState', 'reverse'];

function boundedAnnotations(value = {}, duration) {
  const next = structuredClone(value);
  next.cuePoint = clamp(Number(next.cuePoint) || 0, 0, Math.max(0, duration - .01));
  if (Array.isArray(next.hotcues)) {
    next.hotcues = next.hotcues.map(point => Number.isFinite(point) && point >= 0 && point < duration ? point : null);
    if (Array.isArray(next.hotcueMeta)) next.hotcueMeta = next.hotcueMeta.map((meta, index) => next.hotcues[index] == null ? { name: '', color: '' } : meta);
  }
  if (Array.isArray(next.savedLoops)) next.savedLoops = next.savedLoops.map(loop => loop && loop.start >= 0 && loop.end > loop.start && loop.end <= duration ? loop : null);
  return next;
}

/** Replace a backing file without changing catalogue identity or DJ settings. */
export async function relinkTrack({ engine, tracks, track, file, beforeApply = async () => {}, refresh = () => {} }) {
  if (!(file instanceof Blob)) throw new Error('请选择音频文件');
  if (!file.type.startsWith('audio/') && !/\.(mp3|wav|flac|m4a|aac|aif|aiff|ogg|opus|webm)$/i.test(file.name)) throw new Error('所选文件不是支持的音频格式');
  if (file.size > 150 * 1024 * 1024) throw new Error('音频文件超过 150 MB');
  let buffer, metadata;
  try { [buffer, metadata] = await Promise.all([engine.decode(file), readMetadata(file)]); }
  catch { throw new Error('音频文件无法解码，原文件未改变'); }
  if (!buffer || !Number.isFinite(buffer.duration) || buffer.duration <= 0) throw new Error('音频文件无法解码，原文件未改变');
  await beforeApply();
  const markers = await setting(`annotations:${track.id}`) || track.annotations;
  const nextAnnotations = boundedAnnotations(markers, buffer.duration);
  const next = { ...track, file, duration: buffer.duration, formatInfo: metadata.formatInfo, tagsRead: metadata.tagsRead,
    artwork: metadata.artwork || null, autoGain: estimateAutoGain(buffer), autoGainEstimated: true, annotations: nextAnnotations };
  // Never persist AudioBuffer; retaining the decoded copy avoids a second
  // decode (and prevents demo/previous runtime buffers overriding this file).
  const { buffer: ignoredBuffer, ...record } = next;
  const newPeaks = peaksFor(buffer);
  let oldTrack, snapshots = [];
  const redraw = deck => refresh(deck.id);
  await replaceTrackRecord(record, nextAnnotations, {
    apply: () => {
      if (!tracks.includes(track)) throw new Error('此曲目已被移除');
      oldTrack = { ...track };
      // Capture at the actual swap, not before decoding or disk I/O. A user
      // may have changed the loaded track or transport while we were waiting.
      snapshots = engine.decks.filter(deck => deck.track?.id === track.id).map(deck => ({
        deck, values: Object.fromEntries(transportKeys.map(key => [key, deck[key]])), position: deck.position,
        playing: deck.playing, performance: { ...deck.performance },
      }));
      Object.assign(track, next, { buffer });
      for (const { deck, values, position, playing } of snapshots) {
        deck.load(track, buffer);
        deck.rate = values.rate; deck.syncEnabled = values.syncEnabled; deck.syncTarget = values.syncTarget;
        deck.reverse = !!values.reverse;
        deck.offset = Math.min(position, Math.max(0, buffer.duration - .01));
        deck.loop = values.loop && !values.loop.temporary && values.loop.end <= buffer.duration ? { ...values.loop } : null;
        deck.peaks = newPeaks; deck.updateTempo();
        if (playing && deck.rate > 0) deck.startSource();
        redraw(deck);
      }
    },
    rollback: () => {
      if (!oldTrack) return;
      for (const key of Object.keys(track)) if (!Object.hasOwn(oldTrack, key)) delete track[key];
      Object.assign(track, oldTrack);
      let failure;
      for (const { deck, values, position, playing, performance } of snapshots) {
        try {
          deck.stopSource(); Object.assign(deck, values); Object.assign(deck.performance, performance);
          deck.offset = position; deck.playing = false; deck.setAutoGain(values.autoGain, false); deck.updateTempo();
          if (playing) deck.startSource();
          redraw(deck);
        } catch (error) { failure ||= error; }
      }
      if (failure) throw failure;
    },
  });
}
