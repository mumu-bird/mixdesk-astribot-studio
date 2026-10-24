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

export const DJ_OPERATION_GROUPS = [
  { id: 'transport', label: '播放与 Cue' },
  { id: 'rhythm', label: '循环与节拍' },
  { id: 'mix', label: '音效与混音' },
  { id: 'performance', label: '转盘表演' },
];

export const DJ_OPERATIONS = [
  {
    id: 'play-pause', group: 'transport', label: '播放 / 暂停', hint: 'PLAY', icon: AudioLines,
    ...deckCommand('PLAY', 'play_pause', {}, 'dj', { timing: 'instant', mappingValue: '0', controlMap: 'DJControl_Mix.djm' }),
  },
  {
    id: 'cue-preview', group: 'transport', label: 'Cue 预听', hint: 'CUE', icon: Headphones,
    ...deckCommand('CUE', 'cue_stop', { temporary: true }, 'dj', { timing: 'duration', duration: 1, mappingValue: 'auto temporary', controlMap: 'DJControl_Mix.djm' }),
  },
  ...[1, 2, 3, 4].map(index => ({
    id: `hot-cue-${index}`, group: 'transport', label: `Hot Cue ${index}`, hint: `HC ${index}`, icon: Zap,
    ...deckCommand(`HC${index}`, 'hot_cue', { index }, 'dj', { timing: 'instant', mappingValue: String(index), controlMap: 'DJControl_Mix.djm' }),
  })),
  ...[1, 2, 4, 8].map(beats => ({
    id: `loop-${beats}`, group: 'rhythm', label: `${beats} 拍循环`, hint: `${beats} BEAT`, icon: AudioWaveform,
    ...deckCommand(`LOOP_${beats}_BEAT`, 'loop', { beats, mode: 'toggle' }, 'dj', { timing: 'instant', mappingValue: String(beats), controlMap: 'DJControl_Mix.djm' }),
  })),
  ...[-1, 1].map(direction => ({
    id: `beat-jump-${direction > 0 ? 'forward' : 'back'}`, group: 'rhythm',
    label: `${direction > 0 ? '前进' : '后退'} 4 拍`, hint: direction > 0 ? '+4 BEAT' : '−4 BEAT', icon: FastForward,
    ...deckCommand('JOG_SHIFT_BEND', 'seek_loop', { beats: 4, direction }, 'dj', { timing: 'instant', icon: direction < 0 ? RotateCcw : FastForward, mappingValue: '4', controlMap: 'DJControl_Mix.djm' }),
  })),
  {
    id: 'sync', group: 'rhythm', label: '速度同步', hint: 'SYNC', icon: AudioWaveform,
    ...deckCommand('SYNC', 'sync', { mode: 'toggle' }, 'dj', { timing: 'instant', mappingValue: '0', controlMap: 'DJControl_Mix.djm' }),
  },
  {
    id: 'filter-sweep', group: 'mix', label: '滤波渐入', hint: 'FILTER', icon: SlidersHorizontal,
    ...deckCommand('FILTER', 'set_pass_filter_amount', { amount: -0.7, temporary: true }, 'fx', {
      timing: 'duration', duration: 2, mappingValue: 'auto temporary', controlMap: 'DJControl_Mix.djm', preview: 'audio-filter',
    }),
  },
  {
    id: 'bass-cut', group: 'mix', label: '低频收拢', hint: 'LOW', icon: Volume2,
    ...deckCommand('LOW', 'bass', { value: -12 }, 'fx', { timing: 'duration', duration: 2, mappingValue: '+0', controlMap: 'DJControl_Mix.djm', preview: 'audio-eq' }),
  },
  ...[1, 2, 3].map(index => ({
    id: `fx-${index}`, group: 'mix', label: `切换 FX ${index}`, hint: `FX ${index}`, icon: Sparkles,
    ...deckCommand(`FX_${index}`, 'toggle_effect', { index }, 'fx', {
      timing: 'instant', controls: [`FX_A${index}_ON`, `FX_B${index}_ON`], mappingValue: String(index), controlMap: 'DJControl_Mix.djm',
    }),
  })),
  {
    id: 'channel-level', group: 'mix', label: '音量推子', hint: 'LEVEL', icon: Volume2,
    ...deckCommand('VOL', 'level', { value: 0.8 }, 'fx', { timing: 'duration', duration: 1.5, mappingValue: 'auto', controlMap: 'DJControl_Mix.djm', preview: 'audio-level' }),
  },
  {
    id: 'crossfader', group: 'mix', label: '交叉推子', hint: 'X-FADER', icon: SlidersHorizontal,
    lane: 'fx', timing: 'duration', duration: 2, action: 'crossfader', controls: ['XFADER'], controllerChannels: [0],
    parameters: { value: 0.5, curve: 'equalPower' }, mappingValue: '-16383', controlMap: 'DJControl_Mix.djm', preview: 'audio-crossfader',
  },
  {
    id: 'scratch-reverse', group: 'performance', label: '搓碟倒放', hint: 'JOG SCRATCH', icon: RotateCcw,
    ...deckCommand('JOG_SCRATCH', 'scratch', { direction: 'reverse', seconds: 2 }, 'dj', {
      timing: 'duration', duration: 2, mappingValue: 'auto', controlMap: 'DJControl_Mix.djm', kind: 'reverse', preview: 'reverse-segment', defaultDuration: 2,
    }),
  },
  {
    id: 'scratch-mode', group: 'performance', label: 'Scratch 模式', hint: 'SCRATCH MODE', icon: Disc3,
    ...deckCommand('ScratchON_OFF', 'scratch_mode', { mode: 'toggle' }, 'dj', { timing: 'instant', mappingValue: 'auto', controlMap: 'DJControl_Mix.djm' }),
  },
  {
    id: 'stop-deck', group: 'performance', label: '停止播放', hint: 'STOP', icon: CirclePause,
    ...deckCommand('CUE_SH', 'stop', {}, 'dj', { timing: 'instant', mappingValue: 'auto', controlMap: 'DJControl_Mix.djm' }),
  },
];

export const DJ_OPERATION_BY_ID = Object.fromEntries(DJ_OPERATIONS.map(operation => [operation.id, operation]));

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
