import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import * as Slider from '@radix-ui/react-slider';
import * as Tooltip from '@radix-ui/react-tooltip';
import {
  Activity, AudioLines, AudioWaveform, Check, ChevronDown, Clock3, FileAudio2, FolderOpen,
  Headphones, LoaderCircle, Music2, Pause, Play, Plus, Redo2, RotateCcw, Save, Scissors,
  SkipBack, Tag, Trash2, Undo2, Upload, Volume2, WandSparkles, X, ZoomIn, ZoomOut,
} from 'lucide-react';
import { AudioEngine, peaksFor } from './audio/audio.js';
import { estimateBpm, estimateFirstBeat } from './audio/bpm.js';
import { readEmbeddedBpm } from './audio/metadata.js';
import { Button } from './components/ui/button.jsx';
import { DJ_OPERATION_BY_ID, DJ_OPERATION_GROUPS, DJ_OPERATIONS, operationController } from './dj-operations.js';

const API = '/api';
const TRACK_COLORS = ['155 58% 57%', '210 100% 78%'];
const INSTANT_CLIP_WIDTH = 30;
const CLIP_LANE_HEIGHT = 22;
const TYPES = [
  { id: 'djfx', label: 'DJ 操作 / 音效', icon: AudioLines, color: 'event-djfx', eventTypes: ['dj', 'fx'] },
  { id: 'action', label: '机器人动作', icon: Activity, color: 'event-action' },
  { id: 'marker', label: '标记', icon: Tag, color: 'event-marker' },
];

const laneAcceptsEvent = (lane, event) => lane.eventTypes ? lane.eventTypes.includes(event.type) : event.type === lane.id;
const operationFitsLane = (operation, lane) => lane.eventTypes ? lane.eventTypes.includes(operation.lane) : operation.lane === lane.id;
const eventTypeLabel = event => event.type === 'dj' || event.type === 'fx'
  ? 'DJ 操作 / 音效'
  : TYPES.find(type => type.id === event.type)?.label || event.type;

const deepCopy = value => JSON.parse(JSON.stringify(value));
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const audioUrl = id => `${API}/audio/${id}`;
const fmt = seconds => {
  const value = Math.max(0, Math.floor(seconds || 0));
  return `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
};
const fileTitle = name => name.replace(/\.[^.]+$/, '');
const blankSong = () => ({ assetId: null, title: '', duration: 0, bpm: null, beatOffset: 0, start: 0, end: 0, performanceStart: 0, waveform: [] });

function beatOffsetForSong(song, bpm = Number(song?.bpm)) {
  const beatSeconds = 60 / bpm;
  const offset = Number(song?.beatOffset) || 0;
  return ((offset % beatSeconds) + beatSeconds) % beatSeconds;
}

function trackWindow(song) {
  const duration = Number(song?.duration) || 0;
  const start = clamp(Number(song?.start) || 0, 0, duration);
  const end = clamp(Number(song?.end) || duration, start, duration);
  return { start, end, duration: Math.max(0, end - start) };
}

function getSchedule(group) {
  const order = Array.isArray(group.order) && group.order.length === 2 ? group.order : [0, 1];
  const songs = order.map(slot => group.songs[slot] || blankSong());
  const windows = songs.map(trackWindow);
  const reverseEvents = (group.events || []).filter(event => event.type === 'dj' && event.kind === 'reverse');
  const routes = windows.map((window, track) => {
    const reversals = reverseEvents
      .filter(event => Number(event.sourceTrack) === order[track])
      .sort((a, b) => Number(a.sourceTime) - Number(b.sourceTime));
    const segments = [];
    let sourceCursor = window.start;
    let timeCursor = 0;
    for (const event of reversals) {
      const sourcePoint = clamp(Number(event.sourceStart) || Number(event.sourceTime), sourceCursor, window.end);
      const reverseSeconds = Math.min(Number(event.reverseSeconds) || Number(event.extraSeconds) || 0, sourcePoint - sourceCursor);
      if (sourcePoint > sourceCursor) {
        segments.push({ kind: 'forward', timeStart: timeCursor, timeEnd: timeCursor + sourcePoint - sourceCursor, sourceStart: sourceCursor, sourceEnd: sourcePoint });
        timeCursor += sourcePoint - sourceCursor;
      }
      if (reverseSeconds > 0.004) {
        segments.push({ kind: 'reverse', timeStart: timeCursor, timeEnd: timeCursor + reverseSeconds, sourceStart: sourcePoint, sourceEnd: sourcePoint - reverseSeconds });
        timeCursor += reverseSeconds;
        segments.push({ kind: 'replay', timeStart: timeCursor, timeEnd: timeCursor + reverseSeconds, sourceStart: sourcePoint - reverseSeconds, sourceEnd: sourcePoint });
        timeCursor += reverseSeconds;
      }
      sourceCursor = sourcePoint;
    }
    if (window.end > sourceCursor) {
      segments.push({ kind: 'forward', timeStart: timeCursor, timeEnd: timeCursor + window.end - sourceCursor, sourceStart: sourceCursor, sourceEnd: window.end });
      timeCursor += window.end - sourceCursor;
    }
    return { segments, duration: timeCursor };
  });
  const extras = routes.map((route, index) => Math.max(0, route.duration - windows[index].duration));
  const overlap = clamp(Number(group.transition?.overlap) || 0, 0, Math.min(windows[0].duration, windows[1].duration));
  const starts = songs.map(song => Math.max(0, Number(song.performanceStart) || 0));
  const crossfaderEvent = (group.events || []).find(event => event.operation?.id === 'crossfader');
  const explicitCrossfadeStart = crossfaderEvent
    ? starts[Math.max(0, order.indexOf(Number(crossfaderEvent.sourceTrack) || 0))] + Math.max(0, Number(crossfaderEvent.trackTime) || 0)
    : null;
  const crossfadeStart = explicitCrossfadeStart == null
    ? Math.max(0, Math.min(starts[0] + routes[0].duration, starts[1] + routes[1].duration) - overlap)
    : explicitCrossfadeStart;
  const crossfadeDuration = clamp(Number(crossfaderEvent?.duration) || overlap, 0, 120);
  const eventEnd = (group.events || []).reduce((end, event) => Math.max(end, (Number(event.time) || 0) + eventPerformanceDuration(event)), 0);
  const total = Math.max(starts[0] + routes[0].duration, starts[1] + routes[1].duration, eventEnd);
  return { order, songs, windows, starts, extras, overlap, crossfadeStart, crossfadeDuration, total, reverseEvents, routes };
}

function findRoutePosition(schedule, track, performance) {
  const window = schedule.windows[track];
  const route = schedule.routes[track];
  const localTime = clamp(performance - schedule.starts[track], 0, route.duration);
  const segment = route.segments.find((item, index) => localTime >= item.timeStart - 1e-6
    && (localTime < item.timeEnd - 1e-6 || index === route.segments.length - 1));
  if (!segment) return { sourceTime: window.start, segment: null, phase: 0 };
  const fraction = clamp((localTime - segment.timeStart) / Math.max(1e-8, segment.timeEnd - segment.timeStart), 0, 1);
  return { sourceTime: segment.sourceStart + (segment.sourceEnd - segment.sourceStart) * fraction, segment, phase: fraction };
}

function findSourceTime(group, schedule, track, performance) {
  return findRoutePosition(schedule, track, performance).sourceTime;
}

function trackIndexAtTime(schedule, time, preferred = null) {
  const point = Number(time) || 0;
  const candidates = [0, 1].filter(index => point >= schedule.starts[index] - 1e-6
    && point <= schedule.starts[index] + schedule.routes[index].duration + 1e-6);
  if (preferred != null && candidates.includes(preferred)) return preferred;
  if (point >= schedule.crossfadeStart && candidates.includes(1)) return 1;
  return candidates[0] ?? (point >= schedule.crossfadeStart ? 1 : 0);
}

function isInstantEvent(event) {
  if (event.kind === 'reverse') return false;
  if (event.type === 'marker') return true;
  const definition = DJ_OPERATION_BY_ID[event.operation?.id];
  return event.timing === 'instant' || event.operation?.timing === 'instant' || definition?.timing === 'instant';
}

function eventPerformanceDuration(event) {
  if (event.kind === 'reverse') {
    return Math.max(0, Number(event.reverseSeconds) || Number(event.duration) || Number(event.extraSeconds) / 2 || 0) * 2;
  }
  return Math.max(0, Number(event.duration) || 0);
}

function operationTimingLabel(operation) {
  return operation?.timing === 'instant' ? '固定按键' : '可拉伸效果';
}

function ensurePreviewFilterPath(deck) {
  if (deck._djPreviewFilterPath) return deck._djPreviewFilterPath;
  const lowpass = deck.filter;
  const highpass = deck.context.createBiquadFilter();
  const lowpassGain = deck.context.createGain();
  const highpassGain = deck.context.createGain();
  highpass.type = 'highpass';
  highpass.frequency.value = 25;
  highpass.Q.value = 0.7;
  lowpass.type = 'lowpass';
  lowpass.frequency.value = 22000;
  lowpass.Q.value = 0.7;
  lowpassGain.gain.value = 1;
  highpassGain.gain.value = 0;
  try { deck.high.disconnect(lowpass); } catch {}
  try { lowpass.disconnect(deck.filterFx.input); } catch {}
  deck.high.connect(lowpass).connect(lowpassGain).connect(deck.filterFx.input);
  deck.high.connect(highpass).connect(highpassGain).connect(deck.filterFx.input);
  deck._djPreviewFilterPath = { lowpass, highpass, lowpassGain, highpassGain };
  return deck._djPreviewFilterPath;
}

const finiteNumber = value => Number.isFinite(Number(value));

function operationControlValues(operation, deck) {
  const parameters = operation?.parameters || {};
  const controlId = operation?.controlId || ({
    'filter-sweep': 'filter-amount',
    'bass-cut': 'eq-low',
    'channel-level': 'channel-volume',
    crossfader: 'crossfader',
  }[operation?.id]);
  const current = controlId === 'eq-low'
    ? Number(deck?.eqDb?.low) || 0
    : controlId === 'channel-volume'
      ? (finiteNumber(deck?._faderLevel) ? Number(deck._faderLevel) : 0.8)
      : controlId === 'filter-amount'
        ? Number(deck?._djPreviewFilterValue) || 0
        : controlId === 'tempo-rate' || controlId === 'pitch-semitones'
          ? (controlId === 'tempo-rate' ? 1 : 0)
          : Number(parameters.startValue);
  const from = finiteNumber(parameters.startValue) ? Number(parameters.startValue) : (finiteNumber(current) ? current : 0);
  const fallback = controlId === 'filter-amount' ? parameters.amount : controlId === 'eq-low' || controlId === 'channel-volume' || controlId === 'crossfader' ? parameters.value : undefined;
  const to = finiteNumber(parameters.endValue)
    ? Number(parameters.endValue)
    : finiteNumber(fallback) ? Number(fallback)
      : finiteNumber(parameters.amount) ? Number(parameters.amount)
        : finiteNumber(parameters.semitones) ? Number(parameters.semitones) : from;
  return { from, to };
}

function previewTarget(operation, deck, values = operationControlValues(operation, deck)) {
  const parameters = operation?.parameters || {};
  if (operation?.id === 'filter-sweep') {
    const amount = clamp(Number(values.to), -1, 1);
    const filterType = amount <= 0 ? 'lowpass' : 'highpass';
    const filterPath = ensurePreviewFilterPath(deck);
    const fromAmount = clamp(Number(values.from), -1, 1);
    const hzFor = value => value <= 0 ? 22000 * Math.pow(0.006, -value) : 25 * Math.pow(300, value);
    const baseline = hzFor(fromAmount);
    const target = hzFor(amount);
    return {
      parameter: filterType === 'lowpass' ? filterPath.lowpass.frequency : filterPath.highpass.frequency,
      baseline, target: clamp(target, 25, 22000),
      from: clamp(filterType === 'lowpass' ? hzFor(fromAmount) : hzFor(fromAmount), 25, 22000),
      blend: [
        { parameter: filterPath.lowpassGain.gain, from: fromAmount <= 0 ? 1 : 0, baseline: 1, target: filterType === 'lowpass' ? 1 : 0 },
        { parameter: filterPath.highpassGain.gain, from: fromAmount > 0 ? 1 : 0, baseline: 0, target: filterType === 'highpass' ? 1 : 0 },
      ],
    };
  }
  if (operation?.id === 'bass-cut') {
    return { parameter: deck.low.gain, baseline: 0, from: clamp(Number(values.from), -24, 12), target: clamp(Number(values.to), -24, 12) };
  }
  if (operation?.id === 'channel-level') {
    return { parameter: deck.trim.gain, baseline: 0.8, from: clamp(Number(values.from), 0, 1), target: clamp(Number(values.to), 0, 1) };
  }
  return null;
}

function resetPreviewEffects(decks, time) {
  for (const deck of decks) {
    const filterPath = ensurePreviewFilterPath(deck);
    for (const [parameter, value] of [
      [filterPath.lowpass.frequency, 22000], [filterPath.highpass.frequency, 25],
      [filterPath.lowpassGain.gain, 1], [filterPath.highpassGain.gain, 0],
      [deck.low.gain, 0], [deck.trim.gain, 0.8],
    ]) {
      parameter.cancelScheduledValues(time);
      parameter.setTargetAtTime(value, time, 0.012);
    }
    deck._faderLevel = 0.8;
    deck._djPreviewFilterValue = 0;
    for (const slot of deck.effects?.slots || []) {
      for (const [parameter, value] of [[slot.send.gain, 0], [slot.dry.gain, 1], [slot.wet.gain, 0]]) {
        parameter.cancelScheduledValues(time);
        parameter.setTargetAtTime(value, time, 0.012);
      }
    }
  }
}

function previewEnvelopeValue(envelope, time) {
  if (time <= envelope.start) return envelope.from;
  if (time < envelope.attackEnd) {
    const progress = (time - envelope.start) / Math.max(1e-8, envelope.attackEnd - envelope.start);
    return envelope.from + (envelope.target - envelope.from) * progress;
  }
  if (time <= envelope.releaseStart) return envelope.target;
  if (time < envelope.end) {
    const progress = (time - envelope.releaseStart) / Math.max(1e-8, envelope.end - envelope.releaseStart);
    return envelope.target + (envelope.returnValue - envelope.target) * progress;
  }
  return envelope.returnValue;
}

function schedulePreviewEffects(events, plan, decks, now) {
  const scheduled = [];
  const envelopes = new Map();
  const prepared = (events || []).flatMap(event => {
    const operation = event.operation;
    if (!operation || event.kind === 'reverse') return [];
    const routeIndex = Math.max(0, plan.order.indexOf(Number(event.sourceTrack) || 0));
    const deck = decks[routeIndex];
    const values = operationControlValues(operation, deck);
    const effect = previewTarget(operation, deck, values);
    if (!effect) return [];
    return [{ event, operation, routeIndex, deck, effect, values, start: now + plan.starts[routeIndex] + Math.max(0, Number(event.trackTime) || 0) }];
  }).sort((a, b) => a.start - b.start);
  for (const { event, operation, routeIndex, deck, effect, values, start } of prepared) {
    const duration = clamp(Number(event.duration) || 1, 0.25, 300);
    const attack = Math.min(0.35, duration * 0.2);
    const release = Math.min(0.35, duration * 0.2);
    const automation = [{ parameter: effect.parameter, baseline: effect.baseline, from: effect.from ?? values.from, target: effect.target }, ...(effect.blend || [])];
    for (const { parameter, baseline, from: requestedFrom, target } of automation) {
      const previous = envelopes.get(parameter);
      const from = previous ? previewEnvelopeValue(previous, start) : (finiteNumber(requestedFrom) ? requestedFrom : baseline);
      parameter.cancelScheduledValues(start);
      parameter.setValueAtTime(from, start);
      parameter.linearRampToValueAtTime(target, start + attack);
      const releaseStart = start + duration - release;
      parameter.setValueAtTime(target, releaseStart);
      if (operation.restore) parameter.linearRampToValueAtTime(from, start + duration);
      envelopes.set(parameter, {
        start, from, target, baseline, returnValue: operation.restore ? from : target,
        attackEnd: start + attack, releaseStart, end: start + duration,
      });
    }
    if (operation.controlId === 'filter-amount') deck._djPreviewFilterValue = values.to;
    if (operation.controlId === 'channel-volume') deck._faderLevel = values.to;
    scheduled.push({ event, operation, deck: routeIndex, start, duration, target: effect.target });
  }
  return scheduled;
}

function schedulePreviewCrossfader(events, plan, decks, now) {
  const [left, right] = decks.map(deck => deck.crossGain.gain);
  const handoffStart = plan.crossfadeStart;
  const leftEnd = handoffStart + plan.crossfadeDuration;
  const prepared = (events || []).filter(event => event.operation?.id === 'crossfader').map(event => {
    const track = Math.max(0, plan.order.indexOf(Number(event.sourceTrack) || 0));
    const start = plan.starts[track] + Math.max(0, Number(event.trackTime) || 0);
    const duration = clamp(Number(event.duration) || 1, 0.25, 300);
    const params = event.operation.parameters || {};
    const from = finiteNumber(params.startValue) ? Number(params.startValue) : 0;
    const value = finiteNumber(params.endValue) ? Number(params.endValue) : Number(params.value);
    return { event, operation: event.operation, deck: track, start, duration,
      end: start + duration, release: Math.min(0.15, duration * 0.2), from: clamp(Number.isFinite(from) ? from : 0, 0, 1), target: clamp(Number.isFinite(value) ? value : 0.5, 0, 1) };
  }).sort((a, b) => a.start - b.start);
  const automation = [];
  const crossPosition = time => {
    if (time < handoffStart) return 0;
    if (time >= leftEnd) return 1;
    const baseline = clamp((time - handoffStart) / Math.max(0.001, leftEnd - handoffStart), 0, 1);
    let value = baseline;
    for (const effect of automation) {
      if (time < effect.start || time >= effect.end + effect.release) continue;
      if (time <= effect.end) {
        const progress = clamp((time - effect.start) / effect.duration, 0, 1);
        value = effect.from + (effect.target - effect.from) * progress;
      } else {
        const progress = clamp((time - effect.end) / effect.release, 0, 1);
        value = effect.target + (baseline - effect.target) * progress;
      }
    }
    return clamp(value, 0, 1);
  };
  for (const effect of prepared) {
    if (!Number.isFinite(effect.from)) effect.from = crossPosition(effect.start);
    automation.push(effect);
  }
  const positions = new Set([0, plan.total, handoffStart, leftEnd]);
  for (let position = 0.05; position < plan.total; position += 0.05) positions.add(position);
  for (const effect of automation) {
    for (const position of [effect.start, effect.end, effect.end + effect.release]) {
      positions.add(clamp(position, 0, plan.total));
    }
  }
  const ordered = [...positions].sort((a, b) => a - b);
  for (const parameter of [left, right]) parameter.cancelScheduledValues(decks[0].context.currentTime);
  for (const [index, position] of ordered.entries()) {
    const x = crossPosition(position);
    const gains = [Math.cos(x * Math.PI / 2), Math.sin(x * Math.PI / 2)];
    for (const [channel, parameter] of [left, right].entries()) {
      if (index === 0) parameter.setValueAtTime(gains[channel], now + position);
      else parameter.linearRampToValueAtTime(gains[channel], now + position);
    }
  }
  return automation.map(effect => ({ ...effect, start: now + effect.start }));
}

function schedulePreviewRatePitch(events, plan, trackSources, now) {
  const scheduled = [];
  for (const event of events || []) {
    const operation = event.operation;
    if (!operation || !['audio-rate', 'audio-pitch'].includes(operation.preview)) continue;
    const routeIndex = Math.max(0, plan.order.indexOf(Number(event.sourceTrack) || 0));
    const start = plan.starts[routeIndex] + Math.max(0, Number(event.trackTime) || 0);
    const duration = clamp(Number(event.duration) || 1, 0.25, 300);
    const params = operation.parameters || {};
    const from = operation.preview === 'audio-rate'
      ? (finiteNumber(params.startValue) ? Number(params.startValue) : 1)
      : (finiteNumber(params.startValue) ? 2 ** (Number(params.startValue) / 12) : 1);
    const to = operation.preview === 'audio-rate'
      ? (finiteNumber(params.endValue) ? Number(params.endValue) : finiteNumber(params.value) ? Number(params.value) : 1)
      : (finiteNumber(params.endValue) ? 2 ** (Number(params.endValue) / 12) : finiteNumber(params.semitones) ? 2 ** (Number(params.semitones) / 12) : 1);
    const attack = Math.min(0.2, duration * 0.2);
    for (const item of trackSources.filter(source => source.trackIndex === routeIndex)) {
      const itemStart = item.when - now;
      const itemEnd = itemStart + item.duration;
      const overlapStart = Math.max(start, itemStart);
      const overlapEnd = Math.min(start + duration, itemEnd);
      if (overlapEnd <= overlapStart) continue;
      const at = now + overlapStart;
      const until = now + overlapEnd;
      item.source.playbackRate.cancelScheduledValues(at);
      item.source.playbackRate.setValueAtTime(from, at);
      item.source.playbackRate.linearRampToValueAtTime(to, Math.min(until, at + attack));
      if (operation.restore) item.source.playbackRate.linearRampToValueAtTime(from, until);
    }
    scheduled.push({ event, operation, deck: routeIndex, start: now + start, duration, target: to });
  }
  return scheduled;
}

function schedulePreviewFXButtons(events, plan, decks, now) {
  const scheduled = [];
  for (const event of events || []) {
    const operation = event.operation;
    if (!operation || operation.preview !== 'audio-effect') continue;
    const routeIndex = Math.max(0, plan.order.indexOf(Number(event.sourceTrack) || 0));
    const deck = decks[routeIndex];
    const slotIndex = Number(operation.effectSlot);
    const slot = deck?.effects?.slots?.[slotIndex];
    if (!slot) continue;
    const type = operation.effectType || ['echo', 'reverb', 'flanger'][slotIndex] || 'echo';
    try { slot.setType(type); slot.setAmount(clamp(Number(operation.parameters?.amount) || 0.35, 0, 1)); } catch { continue; }
    const start = now + plan.starts[routeIndex] + Math.max(0, Number(event.trackTime) || 0);
    const duration = clamp(Number(event.duration) || Number(operation.holdDuration) || 2, 0.25, 300);
    const end = start + duration;
    for (const [parameter, value] of [[slot.send.gain, 1], [slot.dry.gain, 1 - slot.amount], [slot.wet.gain, slot.amount]]) {
      parameter.cancelScheduledValues(start);
      parameter.setValueAtTime(0, start);
      parameter.linearRampToValueAtTime(value, start + 0.03);
      parameter.setValueAtTime(value, end);
      parameter.linearRampToValueAtTime(0, end + (slot.type === 'reverb' ? 1.2 : 0.15));
    }
    scheduled.push({ event, operation, deck: routeIndex, start, duration, target: type });
  }
  return scheduled;
}

function layoutEventLanes(events, total, measuredLaneWidth = 0, zoom = 1) {
  const duration = Math.max(1, total);
  const canvasWidth = Math.max(820, duration * 7) * zoom;
  const laneWidth = Math.max(1, Number(measuredLaneWidth) || canvasWidth - 186);
  const pixelsPerSecond = laneWidth / duration;
  const layouts = {};
  for (const type of TYPES) {
    const laneEvents = events.filter(event => laneAcceptsEvent(type, event))
      .sort((a, b) => Number(a.time) - Number(b.time) || String(a.id).localeCompare(String(b.id)));
    const layerEnds = [];
    for (const event of laneEvents) {
      const instant = isInstantEvent(event);
      const rawLeft = clamp((Number(event.time) || 0) * pixelsPerSecond, 0, laneWidth);
      const requestedWidth = instant
        ? INSTANT_CLIP_WIDTH
        : Math.max(22, eventPerformanceDuration(event) * pixelsPerSecond);
      // Keep the start point where the user dropped it. If a duration runs
      // past the end of the set, clip only its visible tail instead of moving
      // the whole event backwards (which made drops near the end look wrong).
      const left = instant ? Math.min(rawLeft, Math.max(0, laneWidth - requestedWidth)) : rawLeft;
      const width = Math.min(Math.max(1, requestedWidth), Math.max(1, laneWidth - left));
      let layer = layerEnds.findIndex(end => end + 4 <= left);
      if (layer < 0) layer = layerEnds.length;
      layerEnds[layer] = left + width;
      layouts[event.id] = { layer, width, instant, left: (left / laneWidth) * 100, widthPercent: (width / laneWidth) * 100 };
    }
    layouts[`height:${type.id}`] = Math.max(1, layerEnds.length);
  }
  return layouts;
}

function parameterLabel(key) {
  return ({ beats: '拍数', index: 'FX 序号', value: '兼容目标值', startValue: '起始值', endValue: '目标值', direction: '方向', duration: '渐变时长', amount: '滤波量', semitones: '半音', holdDuration: '按住时长', seconds: '倒放时长' })[key] || key;
}

function Waveform({ song, color, className = '' }) {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = Math.max(1, Math.floor(rect.width * ratio));
    canvas.height = Math.max(1, Math.floor(rect.height * ratio));
    const context = canvas.getContext('2d');
    context.scale(ratio, ratio);
    context.clearRect(0, 0, rect.width, rect.height);
    const peaks = song?.waveform || [];
    if (!peaks.length) {
      context.strokeStyle = 'rgba(153, 166, 162, .3)';
      context.beginPath(); context.moveTo(0, rect.height / 2); context.lineTo(rect.width, rect.height / 2); context.stroke();
      return;
    }
    const gap = 2;
    const width = Math.max(1.2, rect.width / peaks.length - gap);
    context.fillStyle = color;
    for (let i = 0; i < peaks.length; i++) {
      const height = Math.max(2, Number(peaks[i]) * (rect.height - 2));
      context.globalAlpha = 0.4 + Number(peaks[i]) * 0.55;
      context.fillRect(i * (rect.width / peaks.length), (rect.height - height) / 2, width, height);
    }
    context.globalAlpha = 1;
  }, [song?.waveform, color]);
  return <canvas ref={canvasRef} className={`waveform ${className}`} aria-label="音频波形" />;
}

function IconButton({ label, children, ...props }) {
  return <Tooltip.Root><Tooltip.Trigger asChild><Button aria-label={label} title={label} size="icon" variant="ghost" {...props}>{children}</Button></Tooltip.Trigger><Tooltip.Portal><Tooltip.Content className="tooltip" sideOffset={5}>{label}<Tooltip.Arrow className="tooltip-arrow" /></Tooltip.Content></Tooltip.Portal></Tooltip.Root>;
}

function App() {
  const [project, setProject] = useState(null);
  const [groupId, setGroupId] = useState('A');
  const [selectedId, setSelectedId] = useState(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [busySlot, setBusySlot] = useState(null);
  const [estimatingSlot, setEstimatingSlot] = useState(null);
  const [playhead, setPlayhead] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [audioError, setAudioError] = useState('');
  const [trackPreviewSlot, setTrackPreviewSlot] = useState(null);
  const [trackPreviewBusy, setTrackPreviewBusy] = useState(null);
  const [reverseLength, setReverseLength] = useState(2);
  const [overlapValue, setOverlapValue] = useState(8);
  const [snapEnabled, setSnapEnabled] = useState(true);
  const [snapDivision, setSnapDivision] = useState(1);
  const [timelineZoom, setTimelineZoom] = useState(1);
  const [activeTrack, setActiveTrack] = useState(null);
  const [operationFilter, setOperationFilter] = useState('');
  const [dragOverLane, setDragOverLane] = useState(null);
  const [dragPreview, setDragPreview] = useState(null);
  const engineRef = useRef(null);
  const buffersRef = useRef(new Map());
  const schedulerRef = useRef({ sources: [], startedAt: 0, duration: 0, groupId: null });
  const singlePreviewRef = useRef({ source: null, gain: null, slot: null, token: 0 });
  const historyRef = useRef({ undo: [], redo: [] });
  const demoLoadingRef = useRef(false);
  const eventClipboardRef = useRef(null);
  const timelineGestureRef = useRef(null);
  const projectRef = useRef(null);
  const dragOperationRef = useRef(null);
  const toastTimer = useRef(null);
  const fileInputs = useRef([]);
  const timelineLaneRef = useRef(null);
  const timelineScrollRef = useRef(null);
  const [timelineLaneWidth, setTimelineLaneWidth] = useState(0);

  const group = project?.groups?.[groupId];
  const schedule = useMemo(() => group ? getSchedule(group) : null, [group]);
  const selectedEvent = group?.events?.find(event => event.id === selectedId) || null;
  const laneLayouts = useMemo(() => layoutEventLanes(group?.events || [], schedule?.total || 1, timelineLaneWidth, timelineZoom), [group?.events, schedule?.total, timelineLaneWidth, timelineZoom]);
  const total = Math.max(1, schedule?.total || 1);
  const timelineCanvasWidth = Math.max(820, total * 7) * timelineZoom;

  useEffect(() => {
    setOverlapValue(Number(group?.transition?.overlap) || 0);
  }, [groupId, group?.transition?.overlap]);

  useEffect(() => {
    const node = timelineLaneRef.current;
    if (!node) return undefined;
    const updateWidth = () => {
      const width = Math.round(node.getBoundingClientRect().width);
      setTimelineLaneWidth(current => current === width ? current : width);
    };
    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);
    return () => observer.disconnect();
  }, [groupId, Boolean(project)]);

  const beatGuides = useMemo(() => {
    if (!schedule || !snapEnabled) return [];
    const laneWidth = Math.max(1, timelineLaneWidth || Math.max(820, schedule.total * 7) * timelineZoom - 186);
    return schedule.songs.flatMap((song, index) => {
      const bpm = Number(song.bpm);
      if (!Number.isFinite(bpm) || bpm <= 0) return [];
      const beatSeconds = 60 / bpm;
      return [{
        track: index,
        left: schedule.starts[index] / total * 100,
        width: schedule.routes[index].duration / total * 100,
        beatSpace: laneWidth / total * beatSeconds,
        beatOffset: laneWidth / total * beatOffsetForSong(song, bpm),
      }];
    });
  }, [schedule, snapEnabled, total, timelineLaneWidth, timelineZoom]);

  const showToast = useCallback(message => {
    setToast(message);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(''), 3000);
  }, []);

  const ensureEngine = useCallback(() => {
    if (!engineRef.current) {
      engineRef.current = new AudioEngine();
      window.__djMaster = { engine: engineRef.current, get state() { return schedulerRef.current; } };
    }
    return engineRef.current;
  }, []);

  useEffect(() => {
    let active = true;
    fetch(`${API}/draft`).then(response => {
      if (!response.ok) throw new Error('草稿读取失败');
      return response.json();
    }).then(data => {
      if (!active) return;
      projectRef.current = data;
      setProject(data);
      setOverlapValue(data.groups.A.transition.overlap);
    }).catch(error => setAudioError(error.message));
    const events = new EventSource(`${API}/state`);
    events.onmessage = event => {
      try {
        const data = JSON.parse(event.data);
        if (data.kind === 'saved') showToast(`草稿 v${data.version} 已保存`);
        if (data.kind === 'import_failed' || data.kind === 'save_failed') showToast(data.message || '本地操作失败');
      } catch { /* Ignore malformed event frames. */ }
    };
    return () => {
      active = false;
      events.close();
      clearTimeout(toastTimer.current);
      stopScheduledAudio();
      void engineRef.current?.close();
    };
  }, [showToast]);

  const markProject = useCallback((next, keepHistory = true) => {
    if (schedulerRef.current.sources.length) stopScheduledAudio();
    if (singlePreviewRef.current.source) stopSingleTrackPreview();
    if (keepHistory && projectRef.current) {
      historyRef.current.undo.push(deepCopy(projectRef.current));
      if (historyRef.current.undo.length > 60) historyRef.current.undo.shift();
      historyRef.current.redo = [];
    }
    projectRef.current = next;
    setProject(next);
    setDirty(true);
  }, []);

  const editGroup = useCallback((mutate, keepHistory = true) => {
    const current = projectRef.current;
    if (!current) return;
    const next = deepCopy(current);
    mutate(next.groups[groupId]);
    markProject(next, keepHistory);
  }, [groupId, markProject]);

  const snapPerformanceTime = (targetSchedule, time, preferredTrack = activeTrack) => {
    const boundedTime = clamp(Number(time) || 0, 0, targetSchedule.total);
    if (!snapEnabled) return boundedTime;
    const trackIndex = trackIndexAtTime(targetSchedule, boundedTime, preferredTrack);
    const song = targetSchedule.songs[trackIndex];
    const bpm = Number(song?.bpm);
    if (!Number.isFinite(bpm) || bpm <= 0) return boundedTime;
    const step = (60 / bpm) * snapDivision;
    const start = targetSchedule.starts[trackIndex];
    const phase = beatOffsetForSong(song, bpm) % step;
    const localTime = boundedTime - start;
    const snapped = start + phase + Math.round((localTime - phase) / step) * step;
    return clamp(snapped, start, Math.min(targetSchedule.total, start + targetSchedule.routes[trackIndex].duration));
  };

  const refreshEventTimes = (targetGroup, targetSchedule = getSchedule(targetGroup)) => {
    targetGroup.events = targetGroup.events.map(event => {
      const track = Math.max(0, targetSchedule.order.indexOf(Number(event.sourceTrack) || 0));
      const trackTime = Number.isFinite(Number(event.trackTime))
        ? Number(event.trackTime)
        : Math.max(0, Number(event.time) - targetSchedule.starts[track]);
      return { ...event, trackTime, time: targetSchedule.starts[track] + trackTime };
    }).sort((a, b) => a.time - b.time);
  };

  const saveDraft = async () => {
    if (!project || saving || demoLoadingRef.current) return;
    setSaving(true);
    try {
      const response = await fetch(`${API}/draft`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail || '保存失败');
      projectRef.current = body;
      setProject(body);
      setDirty(false);
      showToast(`草稿 v${body.version} 已保存`);
    } catch (error) { showToast(error.message || '保存失败'); }
    finally { setSaving(false); }
  };

  const undo = redo => {
    const from = redo ? historyRef.current.redo : historyRef.current.undo;
    const to = redo ? historyRef.current.undo : historyRef.current.redo;
    const previous = from.pop();
    if (!previous) return;
    if (projectRef.current) to.push(deepCopy(projectRef.current));
    markProject(previous, false);
  };

  const swapOrder = () => editGroup(target => { target.order = [...target.order].reverse(); refreshEventTimes(target); });

  const importAudio = async (slot, file) => {
    if (!file) return;
    if (file.size > 150 * 1024 * 1024) { showToast('文件不能超过 150 MB'); return; }
    const extension = file.name.split('.').at(-1)?.toLowerCase();
    if (!['mp3', 'wav', 'flac'].includes(extension)) { showToast('仅支持 MP3、WAV、FLAC'); return; }
    setBusySlot(slot); setAudioError('');
    try {
      const form = new FormData(); form.append('file', file);
      const response = await fetch(`${API}/audio/import`, { method: 'POST', body: form });
      const asset = await response.json();
      if (!response.ok) throw new Error(asset.detail || '导入失败');
      const engine = ensureEngine();
      const [buffer, taggedBpm] = await Promise.all([engine.decode(file), readEmbeddedBpm(file)]);
      buffersRef.current.set(asset.id, buffer);
      const wave = Array.from(peaksFor(buffer, 256), value => Number(value));
      const taggedFirstBeat = taggedBpm ? estimateFirstBeat(buffer, taggedBpm) : { offset: 0, confidence: 0 };
      const hasTaggedFirstBeat = taggedFirstBeat.confidence >= 0.4;
      const taggedBeatSeconds = taggedBpm ? 60 / taggedBpm : 1;
      editGroup(target => {
        const existing = target.songs[slot];
        target.songs[slot] = {
          ...existing,
          assetId: asset.id,
          title: fileTitle(file.name),
          filename: asset.filename,
          size: asset.size,
          duration: buffer.duration,
          bpm: taggedBpm,
          bpmSource: taggedBpm ? 'tag' : null,
          beatOffset: hasTaggedFirstBeat ? ((taggedFirstBeat.offset % taggedBeatSeconds) + taggedBeatSeconds) % taggedBeatSeconds : 0,
          beatOffsetSource: hasTaggedFirstBeat ? 'estimated' : null,
          start: 0,
          end: buffer.duration,
          waveform: wave,
        };
        refreshEventTimes(target);
      });
      showToast(taggedBpm ? `${asset.filename} 已导入 · BPM 标签 ${taggedBpm}` : `${asset.filename} 已导入`);
    } catch (error) {
      setAudioError(error.message || '无法解码此音频文件');
      showToast(error.message || '导入失败');
    } finally { setBusySlot(null); }
  };

  const loadDemoArrangement = async () => {
    if (busySlot !== null || saving || demoLoadingRef.current) return;
    demoLoadingRef.current = true;
    stopScheduledAudio();
    setAudioError('');
    setBusySlot('demo');
    try {
      const response = await fetch(`${API}/demo/seed`, { method: 'POST' });
      const body = await response.json();
      if (!response.ok) throw new Error(body.detail || '演示预排加载失败');
      const songs = body.groups?.A?.songs || [];
      const engine = ensureEngine();
      const decoded = new Map();
      const hydratedSongs = await Promise.all(songs.map(async song => {
        if (!song?.assetId) return song;
        const audioResponse = await fetch(audioUrl(song.assetId));
        if (!audioResponse.ok) throw new Error(`无法读取 ${song.title || '演示音乐'}`);
        const buffer = await engine.decode(await audioResponse.blob());
        decoded.set(song.assetId, buffer);
        // Keep the planned source window (the demo's first deck ends at 56s
        // so the reverse/replay pass expands its performance route to 58s),
        // while refreshing the decoded asset duration and waveform.
        const sourceEnd = clamp(Number(song.end) || buffer.duration, Number(song.start) || 0, buffer.duration);
        return { ...song, duration: buffer.duration, end: sourceEnd, waveform: Array.from(peaksFor(buffer, 256), value => Number(value)) };
      }));
      if (hydratedSongs.length !== 2 || decoded.size !== 2) throw new Error('演示音乐不完整');
      const current = projectRef.current;
      const hydrated = { ...current, groups: { ...current.groups, A: { ...body.groups.A, songs: hydratedSongs } } };
      for (const [assetId, buffer] of decoded) buffersRef.current.set(assetId, buffer);
      markProject(hydrated);
      setGroupId('A');
      setSelectedId(null);
      setOverlapValue(Number(hydrated.groups.A.transition?.overlap) || 8);
      showToast('一分钟演示已载入 · 00:58，可直接试听混音');
    } catch (error) {
      setAudioError(error.message || '演示预排加载失败');
      showToast(error.message || '演示预排加载失败');
    } finally {
      demoLoadingRef.current = false;
      setBusySlot(null);
    }
  };

  const getBuffer = async song => {
    if (!song?.assetId) throw new Error('请先导入两首音乐');
    if (buffersRef.current.has(song.assetId)) return buffersRef.current.get(song.assetId);
    const response = await fetch(audioUrl(song.assetId));
    if (!response.ok) throw new Error(`无法读取 ${song.title || '音乐文件'}`);
    const blob = await response.blob();
    const buffer = await ensureEngine().decode(blob);
    buffersRef.current.set(song.assetId, buffer);
    return buffer;
  };

  const estimateTrackTempo = async slot => {
    const song = projectRef.current?.groups?.[groupId]?.songs?.[slot];
    if (!song?.assetId || estimatingSlot !== null) return;
    setEstimatingSlot(slot);
    try {
      const buffer = await getBuffer(song);
      const estimate = estimateBpm(buffer);
      if (!estimate.bpm) {
        showToast('没有检测到稳定拍点，请试听后手动填写 BPM');
        return;
      }
      const bpm = clamp(estimate.bpm, 20, 300);
      const firstBeat = estimateFirstBeat(buffer, bpm);
      const useEstimatedFirstBeat = song.beatOffsetSource !== 'manual' && firstBeat.confidence >= 0.4;
      editGroup(target => {
        const track = target.songs[slot];
        track.bpm = bpm;
        track.bpmSource = 'estimated';
        const beatSeconds = 60 / bpm;
        const currentOffset = Number(track.beatOffset) || 0;
        track.beatOffset = ((currentOffset % beatSeconds) + beatSeconds) % beatSeconds;
        if (useEstimatedFirstBeat) {
          track.beatOffset = ((firstBeat.offset % beatSeconds) + beatSeconds) % beatSeconds;
          track.beatOffsetSource = 'estimated';
        }
      });
      const firstBeatNote = useEstimatedFirstBeat ? ` · 首拍约 ${firstBeat.offset.toFixed(2)} 秒` : '';
      showToast(`BPM 估算为 ${bpm}${firstBeatNote}，已填入，请试听核对`);
    } catch (error) {
      showToast(error.message || 'BPM 估算失败');
    } finally {
      setEstimatingSlot(null);
    }
  };

  function stopScheduledAudio() {
    const state = schedulerRef.current;
    const engine = engineRef.current;
    if (!engine) return;
    stopSingleTrackPreview();
    const now = engine.context.currentTime;
    for (const item of state.sources) {
      try { item.source.stop(Math.max(now + 0.01, item.when)); } catch { /* Already ended. */ }
      item.source.onended = () => { try { item.source.disconnect(); item.gain?.disconnect(); } catch { /* Already closed. */ } };
    }
    for (const deck of engine.decks.slice(0, 2)) {
      const gain = deck.crossGain.gain;
      gain.cancelScheduledValues(now);
      gain.setTargetAtTime(0, now, 0.012);
    }
    resetPreviewEffects(engine.decks.slice(0, 2), now);
    for (const deck of engine.sampler.decks.slice(0, 2)) deck.stopAll();
    schedulerRef.current = { ...state, sources: [] };
    setPlaying(false);
  }

  function stopSingleTrackPreview() {
    const preview = singlePreviewRef.current;
    preview.token += 1;
    if (preview.source) {
      try { preview.source.stop(); } catch { /* Already ended. */ }
      try { preview.source.disconnect(); } catch { /* Already disconnected. */ }
    }
    if (preview.gain) {
      try { preview.gain.disconnect(); } catch { /* Already disconnected. */ }
    }
    singlePreviewRef.current = { ...preview, source: null, gain: null, slot: null };
    setTrackPreviewSlot(null);
    setTrackPreviewBusy(null);
  }

  const previewTrack = async slot => {
    const song = projectRef.current?.groups?.[groupId]?.songs?.[slot];
    if (!song?.assetId) { showToast('请先导入这首音乐'); return; }
    if (trackPreviewSlot === slot) { stopSingleTrackPreview(); return; }
    if (schedulerRef.current.sources.length || playing) stopScheduledAudio();
    stopSingleTrackPreview();
    const token = singlePreviewRef.current.token;
    setTrackPreviewBusy(slot);
    try {
      if (schedulerRef.current.sources.length || playing) stopScheduledAudio();
      const engine = ensureEngine();
      await engine.context.resume();
      const buffer = await getBuffer(song);
      if (token !== singlePreviewRef.current.token) return;
      const window = trackWindow(song);
      const start = clamp(window.start, 0, Math.max(0, buffer.duration - 0.001));
      const duration = Math.max(0.01, Math.min(window.duration, buffer.duration - start));
      const source = engine.context.createBufferSource();
      const gain = engine.context.createGain();
      const when = engine.context.currentTime + 0.04;
      source.buffer = buffer;
      gain.gain.setValueAtTime(0, when);
      gain.gain.linearRampToValueAtTime(1, when + 0.02);
      gain.gain.setValueAtTime(1, when + Math.max(0.02, duration - 0.04));
      gain.gain.linearRampToValueAtTime(0, when + duration);
      source.connect(gain).connect(engine.master);
      singlePreviewRef.current = { source, gain, slot, token };
      setTrackPreviewSlot(slot);
      setTrackPreviewBusy(null);
      source.onended = () => {
        if (singlePreviewRef.current.source !== source) return;
        try { source.disconnect(); gain.disconnect(); } catch { /* Already disconnected. */ }
        singlePreviewRef.current = { ...singlePreviewRef.current, source: null, gain: null, slot: null };
        setTrackPreviewSlot(null);
      };
      source.start(when, start, duration);
    } catch (error) {
      setTrackPreviewBusy(null);
      if (token === singlePreviewRef.current.token) showToast(error.message || '单曲试听启动失败');
    }
  };

  const preview = async () => {
    if (demoLoadingRef.current) return;
    if (!group || !schedule || !schedule.songs.every(song => song.assetId)) { showToast('请先导入两首音乐'); return; }
    if (playing) { stopScheduledAudio(); return; }
    setAudioError(''); setPlayhead(0);
    const engine = ensureEngine();
    const currentProject = projectRef.current;
    try {
      await engine.context.resume();
      if (demoLoadingRef.current || currentProject !== projectRef.current) return;
      const currentGroup = currentProject.groups[groupId];
      const plan = getSchedule(currentGroup);
      const buffers = await Promise.all(plan.songs.map(song => getBuffer(song)));
      if (demoLoadingRef.current || currentProject !== projectRef.current) return;
      const now = engine.context.currentTime + 0.08;
      const sources = [];
      const trackSources = [];
      schedulerRef.current = { sources, startedAt: now, duration: plan.total, groupId };
      const startDeck = (index, track, buffer) => {
        const deck = engine.decks[index];
        deck.pause();
        deck.load({ id: track.assetId, title: track.title, bpm: track.bpm || 120 }, buffer);
        engine.assignCrossfader(index, index === 0 ? 'left' : 'right');
      };
      plan.songs.forEach((track, index) => startDeck(index, track, buffers[index]));
      resetPreviewEffects(engine.decks.slice(0, 2), now);

      const addSegment = (trackIndex, startSource, duration, at, reverse = false) => {
        if (duration <= 0.004) return;
        const deck = engine.decks[trackIndex];
        const sourceBuffer = reverse ? deck.getReverseBuffer() : buffers[trackIndex];
        const source = engine.context.createBufferSource();
        source.buffer = sourceBuffer;
        const gain = engine.context.createGain();
        const fade = Math.min(0.004, duration / 4);
        gain.gain.setValueAtTime(0, at);
        gain.gain.linearRampToValueAtTime(1, at + fade);
        gain.gain.setValueAtTime(1, at + duration - fade);
        gain.gain.linearRampToValueAtTime(0, at + duration);
        source.connect(gain).connect(deck.stems.input);
        const sourceOffset = reverse ? sourceBuffer.duration - startSource : startSource;
        source.start(at, clamp(sourceOffset, 0, sourceBuffer.duration), duration);
        source.onended = () => { try { source.disconnect(); gain.disconnect(); } catch { /* Already closed. */ } };
        sources.push({ source, gain, when: at });
        trackSources.push({ source, gain, when: at, duration, trackIndex });
      };

      const trackActualEnds = [];
      for (let trackIndex = 0; trackIndex < 2; trackIndex++) {
        const window = plan.windows[trackIndex];
        const reversals = plan.reverseEvents
          .filter(event => Number(event.sourceTrack) === plan.order[trackIndex])
          .sort((a, b) => Number(a.sourceTime) - Number(b.sourceTime));
        let sourceCursor = window.start;
        let audioAt = now + plan.starts[trackIndex];
        for (const event of reversals) {
          const sourcePoint = clamp(Number(event.sourceStart) || Number(event.sourceTime), sourceCursor, window.end);
          const reverseSeconds = Math.min(Number(event.reverseSeconds) || Number(event.extraSeconds) || 0, sourcePoint - sourceCursor);
          if (sourcePoint > sourceCursor) {
            const length = sourcePoint - sourceCursor;
            addSegment(trackIndex, sourceCursor, length, audioAt);
            audioAt += length;
          }
          if (reverseSeconds > 0.004) {
            addSegment(trackIndex, sourcePoint, reverseSeconds, audioAt, true);
            audioAt += reverseSeconds;
            addSegment(trackIndex, sourcePoint - reverseSeconds, reverseSeconds, audioAt);
            audioAt += reverseSeconds;
          }
          // The reversed segment is immediately replayed forward to its start
          // point, so subsequent source playback resumes at sourcePoint.
          sourceCursor = sourcePoint;
        }
        if (window.end > sourceCursor) {
          const length = window.end - sourceCursor;
          addSegment(trackIndex, sourceCursor, length, audioAt);
          audioAt += length;
        }
        trackActualEnds.push(audioAt);
      }

      const endAt = Math.max(...trackActualEnds);
      const previewDecks = engine.decks.slice(0, 2);
      const previewEffects = [
        ...schedulePreviewEffects(currentGroup.events, plan, previewDecks, now),
        ...schedulePreviewCrossfader(currentGroup.events, plan, previewDecks, now),
        ...schedulePreviewRatePitch(currentGroup.events, plan, trackSources, now),
        ...schedulePreviewFXButtons(currentGroup.events, plan, previewDecks, now),
      ];
      for (const event of currentGroup.events || []) {
        const operation = event.operation;
        if (operation?.preview !== 'audio-sample') continue;
        const routeIndex = Math.max(0, plan.order.indexOf(Number(event.sourceTrack) || 0));
        const when = now + plan.starts[routeIndex] + Math.max(0, Number(event.trackTime) || 0);
        const sampleIndex = Number(operation.sampleIndex) || 0;
        try {
          const samplerDeck = engine.sampler.decks[routeIndex];
          samplerDeck.triggerAt(sampleIndex, when);
          previewEffects.push({ event, operation, deck: routeIndex, start: when, duration: 0.5, target: operation.sample });
        } catch (error) {
          console.warn('采样事件未能调度', error);
        }
      }
      schedulerRef.current = { sources, startedAt: now, duration: endAt - now, groupId, previewEffects };
      setPlaying(true);
      const selection = currentGroup.events?.find(event => event.id === selectedId);
      if (selection) setSelectedId(selection.id);
    } catch (error) {
      stopScheduledAudio();
      setAudioError(error.message || '试听启动失败');
      showToast(error.message || '试听启动失败');
    }
  };

  useEffect(() => {
    if (!playing || !engineRef.current) return undefined;
    const timer = setInterval(() => {
      const state = schedulerRef.current;
      const current = engineRef.current?.context.currentTime || 0;
      const value = clamp(current - state.startedAt, 0, state.duration);
      setPlayhead(value);
      if (value >= state.duration) { setPlaying(false); clearInterval(timer); }
    }, 40);
    return () => clearInterval(timer);
  }, [playing]);

  const addEvent = (type, atTime = playhead) => {
    if (!group || !schedule) return;
    const eventTime = snapPerformanceTime(schedule, atTime);
    const trackIndex = trackIndexAtTime(schedule, eventTime, activeTrack);
    const trackTime = Math.max(0, eventTime - schedule.starts[trackIndex]);
    const sourceTime = findSourceTime(group, schedule, trackIndex, eventTime);
    const defaults = {
      dj: { name: '滤波渐开', duration: 4, resource: 'DJ 操作' },
      action: { name: '挥手致意', duration: 6, resource: '动作映射' },
      fx: { name: '上升音效', duration: 3, resource: '音效' },
      marker: { name: '段落标记', duration: 0, resource: '标记' },
    }[type];
    const event = {
      id: crypto.randomUUID(), type, name: defaults.name, duration: defaults.duration,
      sourceTrack: schedule.order[trackIndex], sourceTime, trackTime, time: eventTime, resource: defaults.resource,
      verification: type === 'action' ? 'unverified' : 'data-only', parameters: {},
    };
    editGroup(target => { target.events.push(event); refreshEventTimes(target); });
    setSelectedId(event.id);
  };

  const addReverse = (operationId = 'scratch-reverse', atTime = playhead, preferredLength = null) => {
    if (!group || !schedule) return;
    const eventTime = snapPerformanceTime(schedule, atTime);
    const operation = DJ_OPERATION_BY_ID[operationId];
    const trackIndex = trackIndexAtTime(schedule, eventTime, activeTrack);
    const slotIndex = schedule.order[trackIndex];
    const window = schedule.windows[trackIndex];
    const trackTime = Math.max(0, eventTime - schedule.starts[trackIndex]);
    const sourceTime = findSourceTime(group, schedule, trackIndex, eventTime);
    const routePosition = findRoutePosition(schedule, trackIndex, eventTime);
    const priorPoint = schedule.reverseEvents.filter(event => Number(event.sourceTrack) === slotIndex && Number(event.sourceTime) <= sourceTime)
      .reduce((max, event) => Math.max(max, Number(event.sourceStart) || Number(event.sourceTime)), window.start);
    if (['reverse', 'replay'].includes(routePosition.segment?.kind)) { showToast('请在正常播放段插入搓碟倒放'); return; }
    const requestedLength = Number(preferredLength) > 0 ? Number(preferredLength) : operation?.defaultDuration || reverseLength;
    const length = Math.min(requestedLength, Math.max(0, sourceTime - priorPoint));
    if (length < 0.25) { showToast('当前音源位置没有可倒放片段'); return; }
    const controller = operation ? operationController(operation, slotIndex) : null;
    const event = {
      id: crypto.randomUUID(), type: operation?.lane || 'dj', kind: 'reverse', name: operation?.label || '搓碟倒放',
      duration: length, reverseSeconds: length, extraSeconds: length * 2,
      sourceTrack: slotIndex, sourceTime, sourceStart: sourceTime, sourceEnd: sourceTime - length,
      trackTime, time: eventTime, resource: operation?.action || '反向播放', verification: 'audio', parameters: {},
      ...(operation ? { operation: {
        id: operation.id, group: operation.group, action: operation.action, parameters: { ...operation.parameters, seconds: length },
        controller, controlMap: operation.controlMap, preview: 'reverse-segment', execution: 'preview-audio',
      } } : {}),
    };
    editGroup(target => {
      target.events = target.events.map(item => {
        const itemTrackIndex = Math.max(0, schedule.order.indexOf(Number(item.sourceTrack) || 0));
        const itemTrackTime = Number.isFinite(Number(item.trackTime))
          ? Number(item.trackTime)
          : Math.max(0, Number(item.time) - schedule.starts[itemTrackIndex]);
        return Number(item.sourceTrack) === slotIndex && itemTrackTime >= trackTime
          ? { ...item, trackTime: itemTrackTime + length * 2 }
          : Number.isFinite(Number(item.trackTime)) ? item : { ...item, trackTime: itemTrackTime };
      });
      target.events.push(event);
      refreshEventTimes(target);
    });
    setSelectedId(event.id);
  };

  const addOperation = (operationId, atTime = playhead) => {
    const operation = DJ_OPERATION_BY_ID[operationId];
    if (!operation) return;
    if (operation.kind === 'reverse') { addReverse(operationId, atTime); return; }
    if (!group || !schedule) return;
    const eventTime = snapPerformanceTime(schedule, atTime);
    const trackIndex = trackIndexAtTime(schedule, eventTime, activeTrack);
    const slotIndex = schedule.order[trackIndex];
    const sourceTime = findSourceTime(group, schedule, trackIndex, eventTime);
    const trackTime = Math.max(0, eventTime - schedule.starts[trackIndex]);
    const controller = operationController(operation, slotIndex);
      const controlMetadata = Object.fromEntries(['controlType', 'controlId', 'unit', 'min', 'max', 'curve', 'audioTarget', 'effectSlot', 'effectType', 'holdDuration', 'sample', 'sampleIndex', 'restore']
        .filter(key => operation[key] !== undefined).map(key => [key, operation[key]]));
      const operationParameters = {
        ...operation.parameters,
        ...(operation.controlType === 'continuous' ? { startValue: operation.startValue, endValue: operation.endValue, curve: operation.curve || 'linear' } : {}),
        ...(operation.controlType === 'button' && operation.holdDuration ? { holdDuration: operation.holdDuration } : {}),
      };
      const event = {
      id: crypto.randomUUID(), type: operation.lane, name: operation.label,
      timing: operation.timing,
        duration: operation.timing === 'duration' ? Number(operation.duration || operation.holdDuration) || 1 : 0,
      sourceTrack: slotIndex, sourceTime, trackTime, time: eventTime,
      resource: operation.action, verification: 'mapping-confirmed',
        parameters: { ...operationParameters },
      operation: {
        id: operation.id, group: operation.group, action: operation.action,
        ...controlMetadata,
        parameters: { ...operationParameters }, timing: operation.timing, controller,
        controlMap: operation.controlMap, preview: operation.preview || 'command-only',
        execution: ['reverse-segment', 'audio-filter', 'audio-eq', 'audio-level', 'audio-crossfader', 'audio-rate', 'audio-pitch', 'audio-effect', 'audio-sample'].includes(operation.preview) ? 'preview-audio' : 'not-connected',
      },
    };
    editGroup(target => { target.events.push(event); refreshEventTimes(target); });
    setSelectedId(event.id);
  };

  const handleOperationDrop = (event, type) => {
    event.preventDefault();
    event.stopPropagation();
    setDragOverLane(null);
    setDragPreview(null);
    const operationId = event.dataTransfer.getData('application/x-dj-operation') || event.dataTransfer.getData('text/plain');
    if (!DJ_OPERATION_BY_ID[operationId]) return;
    const rect = event.currentTarget.getBoundingClientRect();
    const atTime = clamp((event.clientX - rect.left) / Math.max(1, rect.width), 0, 1) * schedule.total;
    const operation = DJ_OPERATION_BY_ID[operationId];
    const lane = TYPES.find(item => item.id === type);
    if (!lane || !operationFitsLane(operation, lane)) { showToast(`请将“${operation.label}”放到 ${TYPES.find(item => item.eventTypes?.includes(operation.lane) || item.id === operation.lane)?.label || '对应'}轨道`); return; }
    addOperation(operationId, atTime);
  };

  const handleOperationDragOver = (event, type) => {
    if (!Array.from(event.dataTransfer.types).includes('application/x-dj-operation')) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
    setDragOverLane(type);
    const operationId = dragOperationRef.current || event.dataTransfer.getData('application/x-dj-operation');
    const operation = DJ_OPERATION_BY_ID[operationId];
    const lane = TYPES.find(item => item.id === type);
    if (!operation || !lane || !operationFitsLane(operation, lane) || !schedule) {
      setDragPreview(null);
      return;
    }
    const rect = event.currentTarget.getBoundingClientRect();
    const laneWidth = Math.max(1, rect.width);
    const time = snapPerformanceTime(schedule, clamp((event.clientX - rect.left) / laneWidth, 0, 1) * schedule.total);
    const previewEvent = {
      id: '__operation-drop-preview',
      type: operation.lane,
      time,
      duration: operation.timing === 'duration' ? Number(operation.duration) || 1 : 0,
      timing: operation.timing,
      operation: { id: operation.id, timing: operation.timing },
    };
    const previewLayout = layoutEventLanes([...(group?.events || []), previewEvent], schedule.total, laneWidth)[previewEvent.id];
    setDragPreview({
      lane: type,
      operationId,
      time,
      left: previewLayout.left,
      width: previewLayout.instant ? `${INSTANT_CLIP_WIDTH}px` : `${Math.max(0.5, previewLayout.widthPercent)}%`,
      cursor: `${clamp((time / Math.max(1, schedule.total)) * 100, 0, 100)}%`,
      layer: previewLayout.layer,
    });
  };

  const updateEvent = (id, patch, keepHistory = true) => editGroup(target => {
    const event = target.events.find(item => item.id === id);
    if (!event) return;
    if ('duration' in patch && event.kind === 'reverse') {
      const oldDuration = Number(event.reverseSeconds) || Number(event.duration) || 0.25;
      const sourceTrack = Number(event.sourceTrack) || 0;
      const sourceStart = Number(event.sourceStart) || Number(event.sourceTime) || 0;
      const trackIndex = Math.max(0, getSchedule(target).order.indexOf(sourceTrack));
      const window = getSchedule(target).windows[trackIndex];
      const previousReverseStart = target.events
        .filter(item => item !== event && item.kind === 'reverse' && Number(item.sourceTrack) === sourceTrack && Number(item.sourceTime) < Number(event.sourceTime))
        .reduce((latest, item) => Math.max(latest, Number(item.sourceStart) || Number(item.sourceTime) || 0), window.start);
      const maxDuration = Math.max(0.25, sourceStart - previousReverseStart);
      const duration = clamp(Number(patch.duration) || 0.25, 0.25, maxDuration);
      const addedTime = (duration - oldDuration) * 2;
      event.duration = duration;
      event.reverseSeconds = duration;
      event.extraSeconds = duration * 2;
      event.sourceEnd = sourceStart - duration;
      event.parameters = { ...event.parameters, seconds: duration };
      if (event.operation) event.operation.parameters.seconds = duration;
      if (Math.abs(addedTime) > 1e-8) {
        target.events = target.events.map(item => item !== event && Number(item.sourceTrack) === sourceTrack && Number(item.trackTime) > Number(event.trackTime)
          ? { ...item, trackTime: Math.max(0, Number(item.trackTime) + addedTime) }
          : item);
      }
      refreshEventTimes(target);
      return;
    }
    Object.assign(event, patch);
    if ('reverseSeconds' in patch && event.operation) {
      event.operation.parameters.seconds = Number(patch.reverseSeconds);
      event.parameters = { ...event.parameters, seconds: Number(patch.reverseSeconds) };
    }
    if ('sourceTrack' in patch && event.operation) {
      const operation = DJ_OPERATION_BY_ID[event.operation.id];
      if (operation) event.operation.controller = operationController(operation, Number(event.sourceTrack));
    }
    if ('time' in patch) {
      const nextSchedule = getSchedule(target);
      const playbackIndex = Math.max(0, nextSchedule.order.indexOf(Number(event.sourceTrack) || 0));
      const eventTime = snapPerformanceTime(nextSchedule, Number(patch.time), playbackIndex);
      event.time = eventTime;
      event.sourceTime = findSourceTime(target, nextSchedule, playbackIndex, eventTime);
      event.trackTime = Math.max(0, eventTime - nextSchedule.starts[playbackIndex]);
      if (event.kind === 'reverse') {
        event.sourceStart = event.sourceTime;
        event.sourceEnd = event.sourceStart - event.reverseSeconds;
      }
    }
    refreshEventTimes(target);
  }, keepHistory);

  const beginTimelineGesture = (event, mode, pointerEvent, trackIndex = null) => {
    if (pointerEvent.button !== 0 || playing) return;
    pointerEvent.preventDefault();
    pointerEvent.stopPropagation();
    const clip = pointerEvent.currentTarget.closest('.event-clip, .timeline-song');
    clip?.focus({ preventScroll: true });
    clip?.setPointerCapture(pointerEvent.pointerId);
    if (trackIndex == null) setSelectedId(event.id);
    else setActiveTrack(trackIndex);
    clip?.classList.add('is-dragging');
    timelineGestureRef.current = {
      id: event.id,
      mode,
      trackIndex,
      pointerId: pointerEvent.pointerId,
      startX: pointerEvent.clientX,
      startTime: Number(event.time) || 0,
      startPerformanceStart: trackIndex == null ? 0 : Number(schedule.starts[trackIndex]) || 0,
      startDuration: Number(event.duration) || 0,
      durationScale: event.kind === 'reverse' ? 2 : 1,
      startTotal: total,
      areaWidth: clip?.parentElement?.getBoundingClientRect().width || 1,
      initialProject: deepCopy(projectRef.current),
      didMove: false,
    };
  };

  const moveTimelineGesture = pointerEvent => {
    const gesture = timelineGestureRef.current;
    if (!gesture || gesture.pointerId !== pointerEvent.pointerId) return;
    const deltaX = pointerEvent.clientX - gesture.startX;
    if (Math.abs(deltaX) < 3 && !gesture.didMove) return;
    gesture.didMove = true;
    const deltaTime = deltaX / Math.max(1, gesture.areaWidth) * gesture.startTotal;
    if (gesture.mode === 'song-move') {
      updateSongPerformanceStart(schedule.order[gesture.trackIndex], gesture.startPerformanceStart + deltaTime, false);
      return;
    }
    if (gesture.mode === 'resize') {
      const duration = Math.max(0.25, gesture.startDuration + deltaTime / gesture.durationScale);
      updateEvent(gesture.id, { duration: Math.round(duration * 10) / 10 }, false);
    } else {
      const time = Math.max(0, Math.round((gesture.startTime + deltaTime) * 10) / 10);
      updateEvent(gesture.id, { time }, false);
    }
  };

  const endTimelineGesture = pointerEvent => {
    const gesture = timelineGestureRef.current;
    if (!gesture || gesture.pointerId !== pointerEvent.pointerId) return;
    if (gesture.didMove && gesture.initialProject) {
      historyRef.current.undo.push(gesture.initialProject);
      if (historyRef.current.undo.length > 60) historyRef.current.undo.shift();
      historyRef.current.redo = [];
    }
    pointerEvent.currentTarget.closest('.event-clip, .timeline-song')?.classList.remove('is-dragging');
    timelineGestureRef.current = null;
  };

  const updateOperationParameter = (eventId, key, value) => editGroup(target => {
    const event = target.events.find(item => item.id === eventId);
    if (!event?.operation) return;
    const nextValue = Number(value);
    if (!Number.isFinite(nextValue)) return;
    event.operation.parameters[key] = nextValue;
    event.parameters = { ...event.parameters, [key]: nextValue };
    if (key === 'endValue') {
      const max = Number(event.operation.max);
      const min = Number(event.operation.min);
      const bounded = Number.isFinite(max) && Number.isFinite(min) ? clamp(nextValue, min, max) : nextValue;
      event.operation.parameters[key] = bounded;
      event.parameters[key] = bounded;
    }
    if (key === 'seconds' && event.kind === 'reverse') {
      const trackIndex = Math.max(0, getSchedule(target).order.indexOf(Number(event.sourceTrack) || 0));
      const trackWindowValue = getSchedule(target).windows[trackIndex];
      const maxLength = Math.max(0.25, Number(event.sourceStart) - trackWindowValue.start);
      const length = clamp(nextValue, 0.25, maxLength);
      event.operation.parameters.seconds = length;
      event.reverseSeconds = length;
      event.extraSeconds = length * 2;
      event.duration = length;
      event.sourceEnd = event.sourceStart - length;
    }
    refreshEventTimes(target);
  });

  const removeSelected = () => {
    if (!selectedEvent) return;
    const id = selectedEvent.id;
    editGroup(target => { target.events = target.events.filter(event => event.id !== id); refreshEventTimes(target); });
    setSelectedId(null);
  };

  const duplicateSelected = () => {
    if (!selectedEvent) return;
    const copy = { ...deepCopy(selectedEvent), id: crypto.randomUUID(), trackTime: Number(selectedEvent.trackTime || 0) + 8 };
    editGroup(target => { target.events.push(copy); refreshEventTimes(target); });
    setSelectedId(copy.id);
  };

  const copySelected = () => {
    if (!selectedEvent) return;
    eventClipboardRef.current = deepCopy(selectedEvent);
    showToast(`已复制“${selectedEvent.name}”`);
  };

  const pasteCopied = () => {
    const copied = eventClipboardRef.current;
    if (!copied || !group || !schedule) return;
    if (copied.kind === 'reverse') {
      addReverse(copied.operation?.id || 'scratch-reverse', playhead, copied.reverseSeconds);
      return;
    }
    const time = snapPerformanceTime(schedule, playhead);
    const trackIndex = trackIndexAtTime(schedule, time, activeTrack);
    const slotIndex = schedule.order[trackIndex];
    const event = {
      ...deepCopy(copied),
      id: crypto.randomUUID(),
      sourceTrack: slotIndex,
      sourceTime: findSourceTime(group, schedule, trackIndex, time),
      trackTime: Math.max(0, time - schedule.starts[trackIndex]),
      time,
    };
    if (event.operation) {
      const operation = DJ_OPERATION_BY_ID[event.operation.id];
      if (operation) event.operation.controller = operationController(operation, slotIndex);
    }
    editGroup(target => { target.events.push(event); refreshEventTimes(target); });
    setSelectedId(event.id);
  };

  const editSong = (slot, patch) => editGroup(target => {
    const current = target.songs[slot];
    const next = { ...current, ...patch };
    if ('start' in patch && !('beatOffset' in patch) && Number(next.bpm) > 0) {
      const beatSeconds = 60 / Number(next.bpm);
      const shift = (Number(patch.start) || 0) - (Number(current.start) || 0);
      const offset = (Number(current.beatOffset) || 0) - shift;
      next.beatOffset = ((offset % beatSeconds) + beatSeconds) % beatSeconds;
    }
    target.songs[slot] = next;
    refreshEventTimes(target);
  });

  const updateSongPerformanceStart = (slot, value, keepHistory = true) => editGroup(target => {
    const song = target.songs[slot];
    if (!song) return;
    song.performanceStart = Math.round(Math.max(0, Number(value) || 0) * 10) / 10;
    refreshEventTimes(target);
  }, keepHistory);

  const movePlayhead = (event, preferredTrack = null) => {
    if (playing) return;
    if (preferredTrack != null) setActiveTrack(preferredTrack);
    const rect = event.currentTarget.getBoundingClientRect();
    setPlayhead(clamp((event.clientX - rect.left) / rect.width, 0, 1) * schedule.total);
  };

  const adjustTimelineZoom = amount => setTimelineZoom(value => clamp(Math.round((value + amount) * 100) / 100, 0.25, 4));
  const fitTimeline = () => {
    const availableWidth = timelineScrollRef.current?.clientWidth || timelineCanvasWidth;
    setTimelineZoom(clamp(availableWidth / Math.max(820, total * 7), 0.25, 4));
  };

  const reorderEvents = targetGroup => { refreshEventTimes(targetGroup); };

  const updateTransitionOverlap = value => editGroup(target => {
    target.transition.overlap = value;
    const crossfader = target.events.find(event => event.operation?.id === 'crossfader');
    if (crossfader) crossfader.duration = value;
    refreshEventTimes(target);
  });

  useEffect(() => {
    const handleKeyDown = event => {
      const element = event.target instanceof Element ? event.target : null;
      const editingText = Boolean(element?.closest('input, textarea, select, [contenteditable="true"]'));
      const modifier = event.metaKey || event.ctrlKey;
      const key = event.key.toLowerCase();

      if (modifier && key === 's') {
        event.preventDefault();
        void saveDraft();
        return;
      }
      if (editingText) return;
      if (modifier && key === 'c' && selectedEvent) {
        event.preventDefault();
        copySelected();
      } else if (modifier && key === 'v' && eventClipboardRef.current) {
        event.preventDefault();
        pasteCopied();
      } else if (modifier && key === 'z') {
        event.preventDefault();
        undo(event.shiftKey);
      } else if (modifier && key === 'y') {
        event.preventDefault();
        undo(true);
      } else if ((event.key === 'Delete' || event.key === 'Backspace') && selectedEvent) {
        event.preventDefault();
        removeSelected();
      } else if (event.code === 'Space' && !event.repeat && !element?.closest('button')) {
        event.preventDefault();
        void preview();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [copySelected, pasteCopied, playing, preview, project, removeSelected, saveDraft, selectedEvent, undo]);

  if (!project) return <div className="boot-screen"><LoaderCircle size={22} className="spin" /><span>正在读取本地草稿</span></div>;

  const currentTrackIndex = schedule ? trackIndexAtTime(schedule, playhead, activeTrack) : 0;
  const currentEvents = group.events || [];

  return <div className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark"><Music2 size={18} /></div><div><strong>DJ <span>MASTER</span></strong><small>ASTRIBOT / STUDIO</small></div></div>
      <div className="sidebar-section">工作区</div>
      <Tabs.Root value={groupId} onValueChange={value => { stopScheduledAudio(); setGroupId(value); setSelectedId(null); setOverlapValue(project.groups[value].transition.overlap); }}>
        <Tabs.List className="group-tabs" aria-label="预排组">
          {['A', 'B'].map((id, index) => <Tabs.Trigger value={id} key={id} className="group-trigger"><span className={`group-dot dot-${id.toLowerCase()}`} /> <span><b>预排组 {id}</b><small>{project.groups[id].name || `Group 0${index + 1}`}</small></span>{groupId === id && <ChevronDown size={14} className="group-chevron" />}</Tabs.Trigger>)}
        </Tabs.List>
      </Tabs.Root>
      <div className="sidebar-bottom"><div className="local-status"><span className="status-dot" />本机草稿</div><div className="sidebar-foot">DJ MASTER · 预排工作区<br />音频素材存储在 App 主机</div></div>
    </aside>

    <main className="main-area">
      <header className="topbar">
        <div className="crumb"><span>DJ MASTER</span><span className="crumb-divider">/</span><b>音乐预排</b><span className="group-pill">组 {groupId}</span></div>
        <div className="top-actions">
          <div className={`save-state ${dirty ? 'is-dirty' : ''}`}><span className="save-dot" />{dirty ? '未保存修改' : `已保存 · v${project.version}`}</div>
          <div className="top-divider" />
          <IconButton label="撤销" disabled={!historyRef.current.undo.length} onClick={() => undo(false)}><Undo2 size={16} /></IconButton>
          <IconButton label="重做" disabled={!historyRef.current.redo.length} onClick={() => undo(true)}><Redo2 size={16} /></IconButton>
          <Button variant="outline" size="sm" onClick={loadDemoArrangement} disabled={busySlot !== null || saving} title="载入两首确定的合成演示音乐和完整的一分钟预排"><WandSparkles size={14} />{busySlot === 'demo' ? '载入演示…' : '加载一分钟演示'}</Button>
          <Button variant="primary" size="sm" onClick={saveDraft} disabled={saving || busySlot === 'demo' || !dirty}>{saving ? <LoaderCircle size={14} className="spin" /> : <Save size={14} />}{saving ? '保存中' : '保存草稿'}</Button>
        </div>
      </header>

      <div className="workspace-scroll">
        <div className="page-heading">
          <div><div className="eyebrow">ARRANGEMENT WORKSPACE</div><h1>音乐预排</h1></div>
          <div className="project-name"><label htmlFor="project-title">项目名称</label><input id="project-title" value={project.title || ''} onChange={event => markProject({ ...project, title: event.target.value })} /></div>
        </div>

        <div className="workspace-grid">
          <section className="editor-column">
            <div className="track-header section-head"><div><span className="section-kicker">01 / TRACKS</span><h2>曲目素材</h2></div><Button variant="outline" size="sm" onClick={swapOrder}><RotateCcw size={14} />交换顺序</Button></div>
            <div className="tracks-grid">
              {schedule.order.map((slot, sequenceIndex) => {
                const song = group.songs[slot] || blankSong();
                const color = TRACK_COLORS[sequenceIndex];
                const window = trackWindow(song);
                const inputRef = node => { fileInputs.current[slot] = node; };
                return <article className={`track-card ${song.assetId ? 'has-audio' : ''}`} key={`${groupId}-${slot}`}>
                  <div className="track-card-head">
                    <div className="track-index" style={{ color: `hsl(${color})`, borderColor: `hsl(${color} / .34)`, background: `hsl(${color} / .08)` }}>0{sequenceIndex + 1}</div>
                    <div className="track-title-wrap"><input className="track-title" placeholder={`曲目 ${sequenceIndex + 1}`} value={song.title || ''} onChange={event => editSong(slot, { title: event.target.value })} aria-label={`曲目 ${sequenceIndex + 1} 名称`} /><span className="track-meta">{song.assetId ? `${fmt(song.duration)} · ${song.bpm ? `${song.bpm} BPM${song.bpmSource === 'tag' ? '（标签）' : song.bpmSource === 'estimated' ? '（估算）' : ''}` : 'BPM 未设置'} · ${(song.size / 1024 / 1024).toFixed(1)} MB` : '未导入音频'}</span></div>
                    {song.assetId && <Button size="sm" variant={trackPreviewSlot === slot ? 'default' : 'ghost'} className="track-preview-button" aria-label={`${trackPreviewSlot === slot ? '停止' : '试听'}曲目 ${sequenceIndex + 1}`} onClick={() => previewTrack(slot)} disabled={trackPreviewBusy !== null || busySlot !== null || estimatingSlot !== null}>{trackPreviewBusy === slot ? <LoaderCircle size={13} className="spin" /> : trackPreviewSlot === slot ? <Pause size={13} /> : <Headphones size={13} />}{trackPreviewBusy === slot ? '准备中' : trackPreviewSlot === slot ? '停止' : '试听'}</Button>}
                    <input ref={inputRef} className="hidden-input" type="file" accept=".mp3,.wav,.flac,audio/mpeg,audio/wav,audio/flac" onChange={event => importAudio(slot, event.target.files?.[0])} />
                    <Button size="sm" variant={song.assetId ? 'outline' : 'default'} onClick={() => fileInputs.current[slot]?.click()} disabled={busySlot !== null || estimatingSlot !== null}>{busySlot === slot ? <LoaderCircle size={14} className="spin" /> : song.assetId ? <FolderOpen size={14} /> : <Upload size={14} />}{busySlot === slot ? '导入中' : song.assetId ? '替换' : '导入音乐'}</Button>
                  </div>
                  <div className={`wave-wrap ${song.assetId ? '' : 'wave-empty'}`}><Waveform song={song} color={`hsl(${color})`} /><div className="wave-center" /></div>
                  <div className="track-controls">
                    <label>起点 <input aria-label={`曲目 ${sequenceIndex + 1} 起点`} type="number" min="0" max={song.duration || 0} step="0.1" value={song.start || 0} disabled={!song.assetId} onChange={event => editSong(slot, { start: clamp(Number(event.target.value) || 0, 0, Math.max(0, window.end - 0.1)) })} /> <span>秒</span></label>
                    <label>终点 <input aria-label={`曲目 ${sequenceIndex + 1} 终点`} type="number" min={song.start || 0} max={song.duration || 0} step="0.1" value={song.end || 0} disabled={!song.assetId} onChange={event => editSong(slot, { end: clamp(Number(event.target.value) || 0, song.start || 0, song.duration || 0) })} /> <span>秒</span></label>
                    <div className="bpm-tools">
                      <label className="bpm-field">BPM <input aria-label={`曲目 ${sequenceIndex + 1} BPM`} type="number" min="20" max="300" step="0.1" placeholder="--" value={song.bpm ?? ''} onChange={event => {
                        const bpm = event.target.value === '' ? null : clamp(Number(event.target.value) || 120, 20, 300);
                        const currentOffset = Number(song.beatOffset) || 0;
                        const beatSeconds = bpm ? 60 / bpm : 1;
                        const beatOffset = bpm ? ((currentOffset % beatSeconds) + beatSeconds) % beatSeconds : currentOffset;
                        editSong(slot, { bpm, bpmSource: bpm ? 'manual' : null, beatOffset });
                      }} />{song.bpmSource === 'estimated' && <small className="bpm-estimated-badge">估算</small>}</label>
                      <Button size="sm" variant="ghost" className="bpm-estimate-button" aria-label={`估算曲目 ${sequenceIndex + 1} BPM`} onClick={() => estimateTrackTempo(slot)} disabled={!song.assetId || busySlot !== null || estimatingSlot !== null}>{estimatingSlot === slot ? <LoaderCircle size={12} className="spin" /> : <AudioWaveform size={12} />}{estimatingSlot === slot ? '检测中' : '估算'}</Button>
                    </div>
                    <label className="offset-field" title="从所选片段起点到第一个拍点的时间">首拍 <input aria-label={`曲目 ${sequenceIndex + 1} 首拍偏移`} type="number" min="0" max={song.bpm ? Math.max(0, 60 / Number(song.bpm) - 0.01) : 2} step="0.01" value={song.beatOffset ?? 0} disabled={!song.assetId || !song.bpm} onChange={event => editSong(slot, { beatOffset: Math.max(0, Number(event.target.value) || 0), beatOffsetSource: 'manual' })} />{song.beatOffsetSource === 'estimated' && <small className="beat-estimated-badge">估算</small>} <span>秒</span></label>
                  </div>
                </article>;
              })}
            </div>

            <div className="transition-section">
              <div className="transition-label"><div className="transition-icon"><AudioWaveform size={16} /></div><div><b>交叉淡变</b><small>等功率曲线</small></div></div>
              <div className="transition-slider">
                <Slider.Root className="slider-root" min={0} max={32} step={0.5} value={[overlapValue]} onValueChange={value => setOverlapValue(value[0])} onValueCommit={value => updateTransitionOverlap(value[0])} aria-label="转场重叠时长">
                  <Slider.Track className="slider-track"><Slider.Range className="slider-range" /></Slider.Track><Slider.Thumb className="slider-thumb" aria-label="转场重叠时长" />
                </Slider.Root>
                <div className="slider-scale"><span>无重叠</span><span>32 秒</span></div>
              </div>
              <div className="overlap-readout"><b>{overlapValue.toFixed(overlapValue % 1 ? 1 : 0)}s</b><small>重叠</small></div>
            </div>

            <div className="timeline-section">
              <div className="section-head timeline-header"><div><span className="section-kicker">02 / TIMELINE</span><h2>多轨时间轴</h2></div><div className="timeline-tools"><div className="beat-snap-control"><Button size="sm" variant={snapEnabled ? 'default' : 'outline'} aria-pressed={snapEnabled} onClick={() => setSnapEnabled(value => !value)} title="新增或移动事件时吸附到当前曲目的拍点"><AudioWaveform size={13} />节拍吸附</Button><select aria-label="节拍吸附细分" value={snapDivision} onChange={event => setSnapDivision(Number(event.target.value))} disabled={!snapEnabled}><option value="0.25">1/4 拍</option><option value="0.5">1/2 拍</option><option value="1">1 拍</option><option value="2">2 拍</option><option value="4">4 拍</option></select><small>{schedule.songs[currentTrackIndex]?.bpm ? `${schedule.songs[currentTrackIndex].bpm} BPM` : '填写曲目 BPM 后生效'}</small></div><div className="timeline-zoom-control" aria-label="时间轴缩放"><Button size="sm" variant="ghost" aria-label="缩小时间轴" title="缩小时间轴" onClick={() => adjustTimelineZoom(-0.25)} disabled={timelineZoom <= 0.25}><ZoomOut size={13} /></Button><span>{Math.round(timelineZoom * 100)}%</span><Button size="sm" variant="ghost" aria-label="放大时间轴" title="放大时间轴" onClick={() => adjustTimelineZoom(0.25)} disabled={timelineZoom >= 4}><ZoomIn size={13} /></Button><Button size="sm" variant="outline" aria-label="适配时间轴" title="适配可用宽度" onClick={fitTimeline}>适配</Button></div><span className="timeline-duration"><Clock3 size={14} />{fmt(schedule.total)}</span><div className="head-rule" /><Button size="sm" variant="outline" className="preview-button" onClick={preview} disabled={busySlot !== null || !group.songs.every(song => song.assetId)}>{playing ? <><Pause size={14} />停止试听</> : <><Play size={14} fill="currentColor" />试听混音</>}</Button></div></div>
              <div className="time-readout"><span className="play-status"><span className={playing ? 'live-dot' : 'idle-dot'} />{playing ? '正在试听' : '已停止'}</span><span className="time-code">{fmt(playhead)} <i>/</i> {fmt(schedule.total)}</span></div>
              <div className={`mix-overlap-summary ${playing && schedule.crossfadeDuration > 0 && playhead >= schedule.crossfadeStart && playhead < schedule.crossfadeStart + schedule.crossfadeDuration ? 'is-active' : ''}`}>
                <AudioWaveform size={14} />
                {schedule.crossfadeDuration > 0 ? <><b>双曲混音 {fmt(schedule.crossfadeStart)}–{fmt(schedule.crossfadeStart + schedule.crossfadeDuration)}</b><span>{schedule.crossfadeDuration}s · 两首同时播放 · 等功率交叉淡变</span></> : <><b>同时起播</b><span>拖动音乐块调整入场点，再设置交叉淡变</span></>}
              </div>
              <section className="operation-library" aria-label="DJ 操作 / 音效菜单">
                <div className="operation-library-head">
                  <div><b>DJ 操作 / 音效菜单</b><small>点击添加到播放头 · 拖拽到统一轨道</small></div>
                  <div className="operation-filters" aria-label="DJ 操作 / 音效类别">
                    <Button size="sm" variant={operationFilter === '' ? 'default' : 'ghost'} onClick={() => setOperationFilter('')}>全部</Button>
                    {DJ_OPERATION_GROUPS.map(item => <Button size="sm" key={item.id} variant={operationFilter === item.id ? 'default' : 'ghost'} onClick={() => setOperationFilter(item.id)}>{item.label}</Button>)}
                  </div>
                </div>
                <div className="operation-grid">
                  {DJ_OPERATIONS.filter(operation => !operationFilter || operation.group === operationFilter).map(operation => {
                    const OperationIcon = operation.icon;
                    return <button
                      type="button" draggable="true" key={operation.id}
                      data-operation={operation.id} data-lane={operation.lane}
                      data-timing={operation.timing} data-duration-mode={operation.timing === 'instant' ? 'fixed' : 'resizable'}
                      className="operation-card"
                      aria-label={`添加 ${operation.label} 到时间轴`}
                      title={`${operation.label} · ${operation.controls.join(' / ')} · 拖到 ${TYPES.find(type => type.eventTypes?.includes(operation.lane) || type.id === operation.lane)?.label || '轨道'}`}
                      onClick={() => addOperation(operation.id)}
                      onDragStart={event => {
                        dragOperationRef.current = operation.id;
                        event.dataTransfer.effectAllowed = 'copy';
                        event.dataTransfer.setData('application/x-dj-operation', operation.id);
                        event.dataTransfer.setData('text/plain', operation.id);
                      }}
                      onDragEnd={() => { dragOperationRef.current = null; setDragOverLane(null); setDragPreview(null); }}
                    ><span className="operation-icon"><OperationIcon size={15} /></span><span className="operation-copy"><b>{operation.label}</b><small>{operation.hint}{operation.preview && <i className="operation-audible-hint"> · 可试听</i>}</small></span><span className={`operation-timing ${operation.timing === 'instant' ? 'is-instant' : ''}`} title={operation.timing === 'instant' ? '固定按键：时间轴显示一次，不可拉伸' : `可拉伸效果：默认持续 ${Number(operation.duration || 1).toFixed(1)} 秒，可在时间轴拉伸`}>{operation.timing === 'instant' ? '单次' : `${Number(operation.duration || 1).toFixed(1)}s ↔`}</span><Plus size={13} className="operation-add" /></button>;
                  })}
                </div>
                <div className="operation-legend"><span className="operation-legend-item is-fixed"><i />固定按键：落点标记</span><span className="operation-legend-item is-resizable"><i />可拉伸效果：拖右端调整时长</span><span className="operation-legend-item is-source"><i />紫色 DJ 操作 · 黄色音效</span></div>
                <div className="operation-disclaimer"><span className="legend-dot" />按 DJControl MIX 逆向映射编排；试听会真实应用搓碟、滤波、低频、音量、交叉推子、变速、变调、FX 与内置 Kick / Clap / Hat，其余设备命令只保存在草稿。</div>
              </section>
              <div className="timeline-scroll" ref={timelineScrollRef}>
                <div className="timeline-canvas" style={{ minWidth: `${timelineCanvasWidth}px` }}>
                  <div className="ruler-row"><span className="lane-name">演出时间</span><div className="ruler-track">{Array.from({ length: 6 }, (_, index) => <span key={index} style={{ left: `${index * 20}%` }}>{fmt(schedule.total * index / 5)}</span>)}</div></div>
                  <div className="timeline-body">
                    <div className="music-lanes">
                      {schedule.songs.map((song, index) => {
                        const start = schedule.starts[index];
                        const end = start + schedule.routes[index].duration;
                        return <div key={index} className="track-lanes" style={{ '--track-color': `hsl(${TRACK_COLORS[index]})` }}>
                          <div className="lane-name track-lane-title"><Music2 size={13} /><div><b>音乐 0{index + 1}</b><small>{fmt(start)}–{fmt(end)}</small></div></div>
                          <div className="track-lane-area scrub-area" onClick={event => movePlayhead(event, index)}>
                            <div
                              className={`timeline-song song-${index} ${activeTrack === index ? 'is-active' : ''}`}
                              data-start={start}
                              data-end={end}
                              data-slot={schedule.order[index]}
                              role="slider"
                              tabIndex={0}
                              aria-label={`拖动音乐 ${index + 1} 入场点`}
                              title={`${song.title || `曲目 ${index + 1}`} · 演出时间 ${fmt(start)}–${fmt(end)} · 拖动调整入场点`}
                              style={{ left: `${start / total * 100}%`, width: `${schedule.routes[index].duration / total * 100}%` }}
                              onPointerDown={pointerEvent => beginTimelineGesture({ id: `song-${index}`, time: start }, 'song-move', pointerEvent, index)}
                              onPointerMove={moveTimelineGesture}
                              onPointerUp={endTimelineGesture}
                              onPointerCancel={endTimelineGesture}
                              onClick={event => { event.stopPropagation(); setActiveTrack(index); }}
                            >
                              <div className="timeline-song-title"><span>0{index + 1}</span>{song.title || `曲目 ${index + 1}`}</div>
                              <Waveform song={song} color={`hsl(${TRACK_COLORS[index]})`} className="timeline-wave" />
                            </div>
                          </div>
                        </div>;
                      })}
                      {schedule.crossfadeDuration > 0 && <div className="music-overlap-axis"><div className="overlap-band" style={{ left: `${schedule.crossfadeStart / total * 100}%`, width: `${schedule.crossfadeDuration / total * 100}%` }}><span>混音 {schedule.crossfadeDuration}s</span></div></div>}
                    </div>
                    {TYPES.map(type => {
                      const laneLayers = Math.max(laneLayouts[`height:${type.id}`] || 1, dragPreview?.lane === type.id ? dragPreview.layer + 1 : 1);
                      const laneHeight = 13 + laneLayers * CLIP_LANE_HEIGHT;
                      return <div className="event-lane" key={type.id} style={{ height: `${laneHeight}px` }}>
                      <div className="lane-name"><type.icon size={13} />{type.label}</div>
                      <div
                        className={`event-lane-area scrub-area ${dragOverLane === type.id ? 'drop-target' : ''}`}
                        data-drop-lane={type.id}
                        ref={type.id === TYPES[0].id ? timelineLaneRef : undefined}
                        style={{ height: `${laneHeight - 2}px` }}
                        onClick={movePlayhead}
                        onDragOver={event => handleOperationDragOver(event, type.id)}
                        onDragLeave={event => { if (!event.currentTarget.contains(event.relatedTarget)) { setDragOverLane(null); setDragPreview(null); } }}
                        onDrop={event => handleOperationDrop(event, type.id)}
                      >
                        {dragPreview?.lane === type.id && <div
                          className={`operation-drop-preview ${DJ_OPERATION_BY_ID[dragPreview.operationId]?.timing === 'instant' ? 'is-instant' : 'is-duration'}`}
                          data-preview-operation={dragPreview.operationId}
                          data-preview-time={dragPreview.time}
                          aria-hidden="true"
                          style={{ left: `${dragPreview.left}%`, width: dragPreview.width, top: `${3 + dragPreview.layer * CLIP_LANE_HEIGHT}px` }}
                        ><span>{DJ_OPERATION_BY_ID[dragPreview.operationId]?.label} · {operationTimingLabel(DJ_OPERATION_BY_ID[dragPreview.operationId])}{DJ_OPERATION_BY_ID[dragPreview.operationId]?.timing === 'instant' ? '' : ` · ${Number(DJ_OPERATION_BY_ID[dragPreview.operationId]?.duration || 1).toFixed(1)}s`}</span></div>}
                        {dragPreview?.lane === type.id && <div className="operation-drop-cursor" aria-hidden="true" style={{ left: dragPreview.cursor }}><span>落点 {fmt(dragPreview.time)}</span></div>}
                        {beatGuides.map(guide => <div key={`beat-${guide.track}`} className={`beat-guide beat-guide-${guide.track}`} aria-hidden="true" style={{ left: `${guide.left}%`, width: `${guide.width}%`, '--beat-space': `${guide.beatSpace}px`, '--bar-space': `${guide.beatSpace * 4}px`, '--beat-offset': `${guide.beatOffset}px` }} />)}
                        {currentEvents.filter(event => laneAcceptsEvent(type, event)).map(event => {
                          const layout = laneLayouts[event.id] || { layer: 0, width: 22, instant: isInstantEvent(event) };
                          const instant = layout.instant;
                          const performanceDuration = eventPerformanceDuration(event);
                          const isActive = playing && (instant
                            ? playhead >= event.time && playhead < event.time + 0.25
                            : playhead >= event.time && playhead <= event.time + performanceDuration);
                          const width = instant ? `${INSTANT_CLIP_WIDTH}px` : `${Math.max(0.5, layout.widthPercent ?? (performanceDuration / total * 100))}%`;
                          const shortLabel = event.type === 'marker' ? '标记'
                            : event.operation?.id?.startsWith('hot-cue-')
                            ? `CUE ${event.operation.id.at(-1)}`
                            : event.operation?.id?.startsWith('loop-')
                              ? `L${event.operation.parameters?.beats || event.operation.id.split('-')[1]}`
                              : event.operation?.id?.startsWith('beat-jump-') ? '↔4'
                                : event.operation?.id === 'play-pause' ? 'PLAY'
                                  : event.operation?.id === 'sync' ? 'SYNC'
                                    : event.operation?.id?.startsWith('fx-') ? `FX${event.operation.parameters?.index || ''}`
                                      : event.operation?.id === 'scratch-mode' ? 'SCR'
                                        : event.operation?.id === 'stop-deck' ? 'STOP' : event.name;
                          return <button
                            key={event.id}
                            data-operation={event.operation?.id || ''}
                            data-time={event.time}
                            data-duration={event.duration}
                            data-performance-duration={performanceDuration}
                            data-timing={instant ? 'instant' : 'duration'}
                            data-duration-mode={instant ? 'fixed' : 'resizable'}
                            data-layer={layout.layer}
                            data-slot={event.sourceTrack}
                            className={`event-clip ${event.type === 'fx' ? 'event-fx' : event.type === 'dj' ? 'event-dj' : type.color} ${instant ? 'event-instant' : 'event-duration'} ${selectedId === event.id ? 'is-selected' : ''} ${isActive ? 'is-active' : ''}`}
                            style={{ left: `${layout.left ?? clamp(event.time / total * 100, 0, 100)}%`, width, top: `${3 + layout.layer * CLIP_LANE_HEIGHT}px` }}
                            onPointerDown={pointerEvent => beginTimelineGesture(event, 'move', pointerEvent)}
                            onPointerMove={moveTimelineGesture}
                            onPointerUp={endTimelineGesture}
                            onPointerCancel={endTimelineGesture}
                            onClick={eventClick => { eventClick.stopPropagation(); setSelectedId(event.id); }}
                            title={`${event.name} · ${fmt(event.time)}${instant ? ' · 固定按键' : event.kind === 'reverse' ? ` · 倒放 ${(performanceDuration / 2).toFixed(1)} 秒 + 回放 ${(performanceDuration / 2).toFixed(1)} 秒 · 共占用 ${performanceDuration.toFixed(1)} 秒，可拉伸` : ` · 可拉伸 ${Number(event.duration).toFixed(1)} 秒`}`}
                          >
                            <span>{shortLabel}</span>
                            {!instant && <i className="event-resize-handle" role="slider" aria-label={`调整 ${event.name} 持续时长`} onPointerDown={pointerEvent => beginTimelineGesture(event, 'resize', pointerEvent)} />}
                            {event.kind === 'reverse' && <RotateCcw size={11} />}
                          </button>;
                        })}
                      </div>
                    </div>;})}
                    <div className="playhead-axis"><div className="playhead" style={{ left: `${clamp(playhead / total, 0, 1) * 100}%` }}><span /></div></div>
                  </div>
                </div>
              </div>
              <div className="timeline-footer"><div className="event-adds">{TYPES.filter(type => !type.eventTypes).map(type => <Button size="sm" variant="ghost" key={type.id} onClick={() => addEvent(type.id)}><Plus size={13} />{type.label}</Button>)}<Button size="sm" variant="outline" onClick={addReverse}><Scissors size={13} />插入搓碟倒放</Button></div><div className="timeline-note"><span className="legend-dot" />事件时间跟随试听时钟<span className="keyboard-hint">Ctrl/⌘+C/V 复制到播放头 · Ctrl/⌘+S 保存 · Ctrl/⌘+Z 撤销 · Space 试听 · Delete 删除</span></div></div>
            </div>
          </section>

          <aside className="properties-column">
            <section className="property-panel">
              <div className="property-heading"><div><span className="section-kicker">03 / EVENT</span><h2>事件属性</h2></div>{selectedEvent && <span className="event-type-label">{eventTypeLabel(selectedEvent)}</span>}</div>
              {selectedEvent ? <div className="property-body">
                {selectedEvent.verification === 'unverified' && <div className="unverified-banner"><span />未验证动作</div>}
                {selectedEvent.operation && <div className={`operation-provenance ${selectedEvent.operation.execution === 'preview-audio' ? 'audio-confirmed' : ''}`}>
                  <div className="operation-provenance-title"><span>{selectedEvent.operation.execution === 'preview-audio' ? '试听中会实际应用到音频' : '设备命令 · 尚未连接'}</span><small>映射已核对</small></div>
                  <div className="operation-provenance-row"><span>逆向映射</span><b>{selectedEvent.operation.controlMap}</b></div>
                  <div className="operation-provenance-row"><span>设备控件</span><code>{selectedEvent.operation.controller?.control || '—'}</code></div>
                  <div className="operation-provenance-row"><span>原始命令</span><code>{selectedEvent.operation.action}</code></div>
                  <div className="operation-provenance-row"><span>逆向映射值</span><code>{selectedEvent.operation.controller?.mappingValue || '—'}</code></div>
                  <div className="operation-parameters"><span>参数</span><code>{JSON.stringify(selectedEvent.operation.parameters)}</code></div>
                  {selectedEvent.operation.controlType === 'continuous' && <div className="operation-control-summary"><span>连续控件</span><b>{selectedEvent.operation.controlId}</b><small>{selectedEvent.operation.unit || ''} · {selectedEvent.operation.curve || 'linear'}</small></div>}
                  {selectedEvent.operation.controlType === 'button' && <div className="operation-control-summary"><span>按键语义</span><b>按下 → 保持 → 释放</b><small>固定按键会按时间轴落点触发</small></div>}
                  {Object.entries(selectedEvent.operation.parameters || {}).filter(([, value]) => typeof value === 'number' && Number.isFinite(value) && selectedEvent.kind !== 'reverse').map(([key, value]) => <label className="operation-parameter-field" key={key}>
                    <span>{parameterLabel(key)}{selectedEvent.operation.unit && ['startValue', 'endValue'].includes(key) ? ` (${selectedEvent.operation.unit})` : ''}</span>
                    <input type="number" min={selectedEvent.operation.min} max={selectedEvent.operation.max} step={key === 'value' || key === 'amount' || key === 'startValue' || key === 'endValue' ? '0.1' : '0.25'} value={value} onChange={event => updateOperationParameter(selectedEvent.id, key, event.target.value)} aria-label={`操作参数 ${parameterLabel(key)}`} />
                  </label>)}
                </div>}
                <label className="field-label">事件名称<input value={selectedEvent.name} onChange={event => updateEvent(selectedEvent.id, { name: event.target.value })} /></label>
                  <label className="field-label">所在曲目<select value={selectedEvent.sourceTrack} onChange={event => updateEvent(selectedEvent.id, { sourceTrack: Number(event.target.value) })}><option value={0}>素材 01 · {group.songs[0].title || '未命名'}</option><option value={1}>素材 02 · {group.songs[1].title || '未命名'}</option></select></label>
                <label className="field-label">演出时间<input type="number" min="0" max={schedule.total} step="0.1" value={Number(selectedEvent.time).toFixed(1)} onChange={event => updateEvent(selectedEvent.id, { time: Math.max(0, Number(event.target.value) || 0) })} /><span className="input-suffix">秒</span></label>
                <div className="source-time-field"><span>音源位置</span><b>{Number(selectedEvent.sourceTime).toFixed(2)}s</b></div>
                {selectedEvent.kind === 'reverse' ? <>
                  <label className="field-label">倒放长度<input type="number" min="0.25" max="16" step="0.25" value={selectedEvent.reverseSeconds} onChange={event => {
                    const trackIndex = Math.max(0, schedule.order.indexOf(Number(selectedEvent.sourceTrack) || 0));
                    const priorPoint = schedule.reverseEvents
                      .filter(item => item.id !== selectedEvent.id && Number(item.sourceTrack) === schedule.order[trackIndex] && Number(item.sourceTime) < Number(selectedEvent.sourceTime))
                      .reduce((max, item) => Math.max(max, Number(item.sourceStart) || Number(item.sourceTime)), schedule.windows[trackIndex].start);
                    const length = clamp(Number(event.target.value) || 0.25, 0.25, Math.max(0.25, Number(selectedEvent.sourceTime) - priorPoint));
                    updateEvent(selectedEvent.id, { reverseSeconds: length, extraSeconds: length * 2, duration: length, sourceEnd: selectedEvent.sourceStart - length });
                  }} /><span className="input-suffix">秒</span></label>
                  <div className="source-range"><span>音源回退</span><b>{Number(selectedEvent.sourceStart).toFixed(1)} → {Number(selectedEvent.sourceEnd).toFixed(1)}s</b></div>
                  <div className="source-range"><span>正放回放</span><b>{(eventPerformanceDuration(selectedEvent) / 2).toFixed(1)}s</b></div>
                  <div className="source-range" title="时间轴完整占用包含倒放与正放回放"><span>新增演出时长</span><b className="success-text">+{eventPerformanceDuration(selectedEvent).toFixed(1)}s</b></div>
                </> : isInstantEvent(selectedEvent)
                  ? <div className="source-time-field"><span>{selectedEvent.type === 'marker' ? '事件形态' : '操作时长'}</span><b>{selectedEvent.type === 'marker' ? '瞬时标记' : '瞬时按键 · 固定显示'}</b></div>
                  : <label className="field-label">持续时长<input aria-label="持续时长" type="number" min="0.25" max="300" step="0.25" value={selectedEvent.duration} onChange={event => updateEvent(selectedEvent.id, { duration: Math.max(0.25, Number(event.target.value) || 0.25) })} /><span className="input-suffix">秒</span></label>}
                {selectedEvent.type === 'action' && <div className="data-only"><WandSparkles size={14} /><span>动作仅保存为预排事件</span></div>}
                <div className="property-actions"><Button size="sm" variant="outline" onClick={duplicateSelected}><Plus size={14} />复制</Button><Button size="sm" variant="danger" onClick={removeSelected}><Trash2 size={14} />删除</Button></div>
              </div> : <div className="empty-property"><div className="empty-property-icon"><AudioLines size={18} /></div><b>未选择事件</b><span>从时间轴选择一项</span></div>}
            </section>

            <section className="property-panel session-panel">
              <div className="property-heading"><div><span className="section-kicker">LOCAL SESSION</span><h2>预排状态</h2></div><div className="session-indicator"><span />本机</div></div>
              <div className="session-stats"><div><small>曲目</small><b>{group.songs.filter(song => song.assetId).length}<i> / 2</i></b></div><div><small>事件</small><b>{group.events.length}<i> 项</i></b></div><div><small>演出时长</small><b>{fmt(schedule.total)}</b></div></div>
              <div className="session-footer"><span>草稿版本</span><b>{dirty ? `v${project.version} · 有修改` : `v${project.version}`}</b></div>
            </section>

            <section className="reverse-control">
              <div className="reverse-icon"><SkipBack size={15} /></div><div className="reverse-content"><b>搓碟倒放</b><small>插入倒放片段</small></div><select aria-label="搓碟倒放长度" value={reverseLength} onChange={event => setReverseLength(Number(event.target.value))}><option value="1">1 秒</option><option value="2">2 秒</option><option value="4">4 秒</option><option value="8">8 秒</option></select>
            </section>
            {audioError && <div className="error-panel"><X size={14} />{audioError}<button aria-label="关闭错误提示" onClick={() => setAudioError('')}><X size={13} /></button></div>}
          </aside>
        </div>
      </div>
      {toast && <div role="status" className="toast-message"><Check size={15} />{toast}</div>}
    </main>
  </div>;
}

export default App;
