import {
  Activity, AudioLines, AudioWaveform, CirclePause, Disc3, FastForward,
  Headphones, RotateCcw, Sparkles, SlidersHorizontal, Volume2, Zap,
} from 'lucide-react';

// Control names and action ids are taken from the DJUCED 6.6.1
// DJControl_Mix.djm mapping. This describes the source command; it does not
// imply that this app is currently connected to the physical controller.
const deckCommand = (stem, action, parameters = {}, lane = 'dj', extra = {}) => ({
  lane,
  action,
  parameters,
  controls: [`${stem}_A`, `${stem}_B`],
  controllerChannels: [1, 2],
  ...extra,
});

// `controlType` is deliberately explicit so the timeline can render the
// same vocabulary as a physical DJ mixer: a fader/knob is a continuous
// automation, a button is a press/hold command, and a sampler is a one-shot
// audio trigger. `startValue`/`endValue` are defaults only; an event stores
// its own editable copy when it is dropped on the timeline.
const continuousControl = (controlId, unit, min, max, startValue, endValue, extra = {}) => ({
  controlType: 'continuous', controlId, unit, min, max, startValue, endValue,
  curve: 'linear', ...extra,
});
const buttonControl = (controlId, extra = {}) => ({ controlType: 'button', controlId, ...extra });
const sampleControl = (sample, extra = {}) => ({ controlType: 'sample', controlId: `sampler-${sample}`, sample, ...extra });

export const DJ_OPERATION_GROUPS = [
  { id: 'transport', label: '播放与 Cue' },
  { id: 'rhythm', label: '循环与节拍' },
  { id: 'mix', label: '音效与混音' },
  { id: 'performance', label: '转盘表演' },
];

export const DJ_OPERATIONS = [
  {
    id: 'play-pause', group: 'transport', label: '播放 / 暂停', hint: 'PLAY', icon: AudioLines,
    ...deckCommand('PLAY', 'play_pause', {}, 'dj', { timing: 'instant', mappingValue: '0', controlMap: 'DJControl_Mix.djm', preview: 'audio-transport', ...buttonControl('play') }),
  },
  {
    id: 'cue-preview', group: 'transport', label: 'Cue 预听', hint: 'CUE', icon: Headphones,
    ...deckCommand('CUE', 'cue_stop', { temporary: true, holdDuration: 1 }, 'dj', { timing: 'duration', duration: 1, mappingValue: 'auto temporary', controlMap: 'DJControl_Mix.djm', preview: 'audio-transport', ...buttonControl('cue', { holdDuration: 1 }) }),
  },
  ...[1, 2, 3, 4].map(index => ({
    id: `hot-cue-${index}`, group: 'transport', label: `Hot Cue ${index}`, hint: `HC ${index}`, icon: Zap,
    ...deckCommand(`HC${index}`, 'hot_cue', { index }, 'dj', { timing: 'instant', mappingValue: String(index), controlMap: 'DJControl_Mix.djm', preview: 'audio-transport', ...buttonControl(`hot-cue-${index}`) }),
  })),
  ...[1, 2, 4, 8].map(beats => ({
    id: `loop-${beats}`, group: 'rhythm', label: `${beats} 拍循环`, hint: `${beats} BEAT`, icon: AudioWaveform,
    ...deckCommand(`LOOP_${beats}_BEAT`, 'loop', { beats, mode: 'toggle' }, 'dj', { timing: 'instant', mappingValue: String(beats), controlMap: 'DJControl_Mix.djm', preview: 'audio-transport', ...buttonControl(`loop-${beats}`) }),
  })),
  ...[-1, 1].map(direction => ({
    id: `beat-jump-${direction > 0 ? 'forward' : 'back'}`, group: 'rhythm',
    label: `${direction > 0 ? '前进' : '后退'} 4 拍`, hint: direction > 0 ? '+4 BEAT' : '−4 BEAT', icon: FastForward,
    ...deckCommand('JOG_SHIFT_BEND', 'seek_loop', { beats: 4, direction }, 'dj', { timing: 'instant', icon: direction < 0 ? RotateCcw : FastForward, mappingValue: '4', controlMap: 'DJControl_Mix.djm', preview: 'audio-transport', ...buttonControl(`beat-jump-${direction > 0 ? 'forward' : 'back'}`) }),
  })),
  {
    id: 'sync', group: 'rhythm', label: '速度同步', hint: 'SYNC', icon: AudioWaveform,
    ...deckCommand('SYNC', 'sync', { mode: 'toggle' }, 'dj', { timing: 'instant', mappingValue: '0', controlMap: 'DJControl_Mix.djm', preview: 'audio-transport', ...buttonControl('sync') }),
  },
  {
    id: 'filter-sweep', group: 'mix', label: '滤波渐入', hint: 'FILTER', icon: SlidersHorizontal,
    ...deckCommand('FILTER', 'set_pass_filter_amount', { amount: -0.7, temporary: true }, 'fx', {
      timing: 'duration', duration: 2, mappingValue: 'auto temporary', controlMap: 'DJControl_Mix.djm', preview: 'audio-filter',
      ...continuousControl('filter-amount', '范围', -1, 1, 0, -0.7, { audioTarget: 'filter', restore: true }),
    }),
  },
  {
    id: 'bass-cut', group: 'mix', label: '低频收拢', hint: 'LOW', icon: Volume2,
    ...deckCommand('LOW', 'bass', { value: -12 }, 'fx', { timing: 'duration', duration: 2, mappingValue: '+0', controlMap: 'DJControl_Mix.djm', preview: 'audio-eq', ...continuousControl('eq-low', 'dB', -24, 12, 0, -12, { audioTarget: 'eq-low', restore: true }) }),
  },
  ...[1, 2, 3].map(index => ({
    id: `fx-${index}`, group: 'mix', label: `切换 FX ${index}`, hint: `FX ${index}`, icon: Sparkles,
    ...deckCommand(`FX_${index}`, 'toggle_effect', { index }, 'fx', {
      timing: 'duration', duration: 2, controls: [`FX_A${index}_ON`, `FX_B${index}_ON`], mappingValue: String(index), controlMap: 'DJControl_Mix.djm',
      preview: 'audio-effect',
      ...buttonControl(`fx-${index}`, { audioTarget: 'effect-slot', effectSlot: index - 1, effectType: ['echo', 'reverb', 'flanger'][index - 1], holdDuration: 2 }),
    }),
  })),
  {
    id: 'channel-level', group: 'mix', label: '音量推子', hint: 'LEVEL', icon: Volume2,
    ...deckCommand('VOL', 'level', { value: 0.55 }, 'fx', { timing: 'duration', duration: 1.5, mappingValue: 'auto', controlMap: 'DJControl_Mix.djm', preview: 'audio-level', ...continuousControl('channel-volume', '%', 0, 1, 0.8, 0.55, { audioTarget: 'channel-volume' }) }),
  },
  {
    id: 'crossfader', group: 'mix', label: '交叉推子', hint: 'X-FADER', icon: SlidersHorizontal,
    lane: 'fx', timing: 'duration', duration: 2, action: 'crossfader', controls: ['XFADER'], controllerChannels: [0],
    parameters: { value: 0.5, curve: 'equalPower' }, mappingValue: '-16383', controlMap: 'DJControl_Mix.djm', preview: 'audio-crossfader',
    ...continuousControl('crossfader', '%', 0, 1, 0, 1, { audioTarget: 'crossfader', curve: 'equalPower' }),
  },
  {
    id: 'scratch-reverse', group: 'performance', label: '搓碟倒放', hint: 'JOG SCRATCH', icon: RotateCcw,
    ...deckCommand('JOG_SCRATCH', 'scratch', { direction: 'reverse', seconds: 2 }, 'dj', {
      timing: 'duration', duration: 2, mappingValue: 'auto', controlMap: 'DJControl_Mix.djm', kind: 'reverse', preview: 'reverse-segment', defaultDuration: 2,
      ...buttonControl('scratch-reverse', { holdDuration: 2, audioTarget: 'reverse-segment' }),
    }),
  },
  {
    id: 'scratch-mode', group: 'performance', label: 'Scratch 模式', hint: 'SCRATCH MODE', icon: Disc3,
    ...deckCommand('ScratchON_OFF', 'scratch_mode', { mode: 'toggle' }, 'dj', { timing: 'instant', mappingValue: 'auto', controlMap: 'DJControl_Mix.djm', preview: 'audio-transport', ...buttonControl('scratch-mode') }),
  },
  {
    id: 'stop-deck', group: 'performance', label: '停止播放', hint: 'STOP', icon: CirclePause,
    ...deckCommand('CUE_SH', 'stop', {}, 'dj', { timing: 'instant', mappingValue: 'auto', controlMap: 'DJControl_Mix.djm', preview: 'audio-transport', ...buttonControl('stop-deck') }),
  },
  {
    id: 'tempo-rate', group: 'mix', label: '变速', hint: 'TEMPO', icon: FastForward,
    ...deckCommand('TEMPO', 'set_rate', { value: 1.08 }, 'fx', {
      timing: 'duration', duration: 3, mappingValue: 'auto', controlMap: 'DJControl_Mix.djm', preview: 'audio-rate',
      ...continuousControl('tempo-rate', '倍速', 0.5, 2, 1, 1.08, { audioTarget: 'playback-rate' }),
    }),
  },
  {
    id: 'pitch-shift', group: 'mix', label: '变调', hint: 'PITCH', icon: SlidersHorizontal,
    ...deckCommand('KEY_SHIFT', 'set_pitch', { semitones: 2, keyLock: false }, 'fx', {
      timing: 'duration', duration: 3, mappingValue: 'auto', controlMap: 'DJControl_Mix.djm', preview: 'audio-pitch',
      ...continuousControl('pitch-semitones', '半音', -12, 12, 0, 2, { audioTarget: 'pitch-rate' }),
    }),
  },
  ...[
    ['kick', 'Kick', 'KICK'], ['clap', 'Clap', 'CLAP'], ['hat', 'Hat', 'HAT'],
  ].map(([sample, label, hint], index) => ({
    id: `sampler-${sample}`, group: 'performance', label, hint, icon: Zap,
    ...deckCommand(`SAMPLER_${hint}`, 'sampler_trigger', { sample, sampleIndex: index, mode: 'oneshot' }, 'fx', {
      timing: 'instant', mappingValue: String(index), controlMap: 'DJControl_Mix.djm', preview: 'audio-sample',
      ...sampleControl(sample, { sampleIndex: index }),
    }),
  })),
];

export const DJ_OPERATION_BY_ID = Object.fromEntries(DJ_OPERATIONS.map(operation => [operation.id, operation]));

// Concrete local MIXDESK method used by the timeline audition.  Keeping this
// registry beside the recovered controller mapping makes an operation review
// auditable: a menu card cannot be marked as audio-confirmed without naming
// the Deck/Engine API it drives.
const AUDIO_METHOD_BY_OPERATION = {
  'play-pause': 'Deck.play() / Deck.pause()',
  'cue-preview': 'Deck.cuePress() / Deck.cueRelease()',
  'hot-cue-1': 'Deck.seek(hotcues[0])', 'hot-cue-2': 'Deck.seek(hotcues[1])',
  'hot-cue-3': 'Deck.seek(hotcues[2])', 'hot-cue-4': 'Deck.seek(hotcues[3])',
  'loop-1': 'Deck.setLoop() + sampler-clock overlay', 'loop-2': 'Deck.setLoop() + sampler-clock overlay',
  'loop-4': 'Deck.setLoop() + sampler-clock overlay', 'loop-8': 'Deck.setLoop() + sampler-clock overlay',
  'beat-jump-forward': 'Deck.beatJump(+4)', 'beat-jump-back': 'Deck.beatJump(-4)',
  sync: 'Deck.setSyncEnabled()', 'scratch-mode': 'Deck.setScratchMode() + scratch grain', 'stop-deck': 'Deck.pause()',
  'filter-sweep': 'Deck.setFilter()', 'bass-cut': 'Deck.setEQ("low")', 'channel-level': 'Deck.setVolume()',
  crossfader: 'AudioEngine.setCrossfader()', 'tempo-rate': 'Deck.setRate()', 'pitch-shift': 'Deck.setPitch()',
  'scratch-reverse': 'Deck.setReverse() + reverse/replay route', 'fx-1': 'Deck.effects.setType()/setAmount()/setEnabled()',
  'fx-2': 'Deck.effects.setType()/setAmount()/setEnabled()', 'fx-3': 'Deck.effects.setType()/setAmount()/setEnabled()',
  'sampler-kick': 'engine.sampler.triggerAt(0)', 'sampler-clap': 'engine.sampler.triggerAt(1)', 'sampler-hat': 'engine.sampler.triggerAt(2)',
};
for (const operation of DJ_OPERATIONS) operation.audioMethod = AUDIO_METHOD_BY_OPERATION[operation.id] || null;

export function operationController(operation, playbackDeck) {
  const deck = playbackDeck === 1 ? 1 : 0;
  return {
    device: 'Hercules DJControl MIX',
    mapping: operation.controlMap || 'DJControl_Mix.djm',
    deck: operation.controls.length > 1 ? (deck === 0 ? 'A' : 'B') : null,
    control: operation.controls[operation.controls.length > 1 ? deck : 0],
    action: operation.action,
    channel: operation.controllerChannels[operation.controllerChannels.length > 1 ? deck : 0],
    mappingValue: operation.mappingValue ?? '',
  };
}
