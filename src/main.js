import './style.css';
import './vj.css';
import { AudioEngine, clamp, createDemo, estimateBPM, estimateFirstBeat, estimateDynamicBeatGrid, estimateKey, estimateAutoGain, estimateAutoHotcues, peaksFor, spectrumFor } from './audio.js';
import { storedTracks, saveTrack, removeTrack, setting } from './storage.js';
import { setupPerformance } from './performance.js';
import { setupRecording } from './recording-ui.js';
import { setupLibrary } from './library.js';
import { readMetadata } from './metadata.js';
import { relinkTrack } from './relink.js';
import { PlaybackHistory } from './history.js';
import { FILTER_FX_TYPES } from './effects.js';
import { VJController, VJ_EFFECTS, VJ_ANIMATIONS } from './vj.js';
import { VJOutput } from './vj-output.js';

const icons = {
  play: '<path d="m8 5 11 7-11 7z" fill="currentColor" stroke="none"/>',
  pause: '<path d="M8 5v14M16 5v14" stroke-width="4"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  music: '<path d="M9 18V5l11-2v13M9 9l11-2"/><ellipse cx="6" cy="18" rx="3" ry="2"/><ellipse cx="17" cy="16" rx="3" ry="2"/>',
  headphones: '<path d="M4 14v-2a8 8 0 0 1 16 0v2M4 13H2v7h5v-7zm16 0h2v7h-5v-7z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  folder: '<path d="M3 6h7l2 2h9v12H3z"/>',
  arrow: '<path d="M12 4v16m-6-6 6 6 6-6"/>',
  loop: '<path d="M18 4l3 3-3 3M6 20l-3-3 3-3M21 7H7a4 4 0 0 0-4 4m0 6h14a4 4 0 0 0 4-4"/>',
  close: '<path d="m6 6 12 12M18 6 6 18"/>',
  trash: '<path d="M4 7h16M9 7V4h6v3M6 7l1 14h10l1-14M10 11v6m4-6v6"/>',
  help: '<circle cx="12" cy="12" r="9"/><path d="M9.5 8a2.5 2.5 0 0 1 5 0c0 2-2.5 2-2.5 4m0 3v1"/>',
  volume: '<path d="M3 10h4l5-4v12l-5-4H3zm13-2a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"/>',
};
const icon = name => `<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">${icons[name] || ''}</svg>`;
const $ = (query, root = document) => root.querySelector(query);
const $$ = (query, root = document) => [...root.querySelectorAll(query)];
const escape = text => String(text).replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[x]);
export const time = seconds => `${String(Math.floor(Math.max(0, seconds) / 60)).padStart(2, '0')}:${String(Math.floor(Math.max(0, seconds) % 60)).padStart(2, '0')}`;
const engine = new AudioEngine();
const vj = new VJController({ setting });
const vjOutput = new VJOutput();
const vjEffectOptions = Object.entries(VJ_EFFECTS).map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
const vjAnimationOptions = Object.entries(VJ_ANIMATIONS).map(([value, label]) => `<option value="${value}">${label}</option>`).join('');
const tracks = [];
let selectedDeck = 0, toastTimer, importing = false;
const waveZoom = [0, 0, 0, 0];
const loadSerial = [0, 0, 0, 0], loopBeats = [4, 4, 4, 4], bpmTaps = [[], [], [], []];
let deckLayout = 'twoHorizontal';
const previewState = { meters: [0, 0, 0, 0] };
const annotationWrites = new Map();
const annotationQueues = new Map();
let pendingAnnotationWrites = 0;
let restoringSession = true, sessionSaveTimer = 0, sessionWrite = Promise.resolve();

function deckMarkup(id) {
  const label = 'ABCD'[id];
  return `<section class="deck deck-${label.toLowerCase()} ${id === 0 ? 'selected' : ''}" data-deck="${id}" tabindex="-1" aria-label="播放器 ${label}">
    <div class="deck-top"><button class="deck-label" data-select="${id}" title="选择播放器 ${label}">${label}</button><div class="track-heading"><span class="eyebrow deck-state">DECK ${label} · READY</span><h2 class="track-title">准备载入</h2><p class="track-subtitle">将音乐拖入此处</p></div><span class="deck-dot"></span></div>
    <div class="wave-box"><canvas class="waveform" aria-label="${label} 台音频波形"></canvas><input class="seek" type="range" min="0" max="1000" value="0" aria-label="${label} 台播放位置" title="点击波形定位"/><div class="wave-center"></div><span class="wave-label">WAVEFORM</span></div>
    <div class="time-row"><span class="elapsed">00:00</span><div class="beat-dots"><i></i><i></i><i></i><i></i></div><span class="remaining">−00:00</span></div>
    <div class="deck-center"><div class="platter"><div class="vinyl"><div class="vinyl-label"><span>MX / 0${id + 1}</span><strong>${label}</strong><small>LOCAL SESSION</small></div><i class="spindle"></i></div><div class="platter-mark"></div></div><div class="tempo-panel"><div class="eyebrow">TEMPO <span class="estimate-badge"></span></div><div class="bpm-value">120<span>.0</span></div><div class="bpm-caption">BPM</div><button class="sync-button" title="匹配另一台的速度；不自动对齐节拍">SYNC <span>速度同步</span></button><div class="tempo-label"><span>变速 / 变调</span><button class="tempo-reset" title="恢复原速">+0.0%</button></div><input class="tempo" type="range" min="-50" max="50" step="0.1" value="0" aria-label="${label} 台变速"/><label class="tempo-range-label">范围 <select class="tempo-range" aria-label="${label} 台速度范围">${[6,8,10,12,16,20,25,33,50,100].map(value => `<option value="${value}" ${value === 50 ? 'selected' : ''}>±${value}%</option>`).join('')}</select></label></div></div>
    <div class="transport"><button class="cue-button" title="返回 Cue 点并暂停；Shift 点击在当前位置设置 Cue">CUE</button><button class="play-button" aria-label="播放 ${label}">${icon('play')}<span>播放</span></button><button class="reverse-button" aria-pressed="false" title="切换持续反向播放">REV</button><button class="set-cue" title="在当前位置设置 Cue 点">SET CUE</button></div>
    <div class="pads-heading"><span class="eyebrow">HOT CUES</span><span>双击编辑名称/颜色 · Shift + 点击清除</span></div><div class="hotcues">${Array.from({ length: 8 }, (_, n) => `<button class="hotcue" data-cue="${n}" title="设置或跳转到 Cue ${n+1}"><strong>0${n+1}</strong><span>设置标记</span></button>`).join('')}</div>
    <div class="loop-row"><span class="eyebrow">LOOP</span><button class="loop-half" aria-label="${label} 台循环减半">÷2</button><span class="loop-length">4 拍</span><button class="loop-double" aria-label="${label} 台循环加倍">×2</button><button class="loop-toggle" aria-pressed="false">${icon('loop')}<span>循环</span></button></div>
  </section>`;
}

function channelMarkup(id) {
  const label = 'ABCD'[id];
  return `<div class="mixer-channel channel-${label.toLowerCase()}" data-channel="${id}"><span class="channel-label">${label}</span>${[['high','HI'],['mid','MID'],['low','LOW']].map(([band,name]) => `<label class="eq-control"><span>${name}<button type="button" class="eq-kill" data-kill-band="${band}" aria-pressed="false" aria-label="${label} 台 ${name} EQ Kill">KILL</button><output>0 dB</output></span><input type="range" class="eq" data-band="${band}" min="-24" max="12" value="0" step="1" aria-label="${label} 台 ${name} 均衡器" title="双击恢复 0 dB"/></label>`).join('')}<label class="filter-control"><span>FILTER<output>OFF</output></span><input class="filter" type="range" min="-100" max="100" value="0" aria-label="${label} 台滤波" title="左侧低通，右侧高通；双击归零"/></label><div class="fader-area"><input class="channel-volume" type="range" min="0" max="100" value="80" aria-label="${label} 台音量"/><div class="fader-ticks"><span>0</span><span>−6</span><span>−12</span><span>−∞</span></div><div class="channel-meter"><div></div></div></div><output class="volume-readout">80%</output><button class="auto-gain" aria-label="${label} 台重新计算自动增益" title="按曲目响度重新计算增益">AUTO GAIN <span>1.00×</span></button><label class="cross-assign-label">交叉推子<select class="cross-assign" aria-label="${label} 台交叉推子分配"><option value="left" ${id % 2 === 0 ? 'selected' : ''}>左侧</option><option value="thru">直通</option><option value="right" ${id % 2 ? 'selected' : ''}>右侧</option></select></label></div>`;
}

$('#app').innerHTML = `<div class="app-shell"><header class="topbar"><a class="brand" href="#" aria-label="MIXDESK 首页"><span class="brand-mark"><i></i><i></i><i></i></span>MIXDESK<span class="version">/ 01</span></a><nav><button class="nav-active">混音台</button><button id="library-nav">音乐库</button></nav><div class="top-actions"><span class="local-status"><i></i>本地运行</span><button id="vj-toggle" class="vj-toggle" type="button">VJ</button><button id="help" class="icon-button" aria-label="使用指南">${icon('help')}</button><button id="record" class="record-button"><i></i><span>录制混音</span></button><button class="import-button">${icon('plus')}导入音乐</button></div></header>
    <main><div class="session-heading"><div><div class="eyebrow">YOUR SOUND. YOUR SESSION.</div><h1>混音工作台<span>让音乐，自然衔接。</span></h1></div><div class="session-meta"><span id="audio-status"><i></i>音频已就绪</span><span class="session-badge">STEREO / <span id="sample-rate">48</span> kHz</span></div></div>
    <div class="console" data-layout="twoHorizontal">${deckMarkup(0)}<section class="mixer" aria-label="混音器"><div class="mixer-title"><span class="eyebrow">MIXER</span><button id="mixer-settings" class="mixer-settings" type="button">设置</button><span class="signal-dot"></span></div><div class="mixer-channels">${[0,1,2,3].map(channelMarkup).join('')}</div><div class="crossfader-section"><div><span class="eyebrow">CROSSFADER</span><button id="center-crossfader" title="推子回到中间">RESET</button></div><input id="crossfader" type="range" min="-100" max="100" value="0" aria-label="交叉推子"/><div class="cross-labels"><b>A</b><span>等功率混音</span><b>B</b></div></div><div class="master-section"><label for="master">${icon('volume')} MASTER <output id="master-output">75%</output></label><input id="master" type="range" min="0" max="100" value="75" aria-label="总音量"/><div class="master-meter"><div></div></div><span class="master-caption">OUTPUT LEVEL</span></div></section>${deckMarkup(1)}${deckMarkup(2)}${deckMarkup(3)}</div>
    <section id="vj-panel" class="vj-panel" hidden aria-label="VJ 视频"><div class="vj-toolbar"><div><span class="eyebrow">VJING · LOCAL VIDEO</span><h2>双通道视频</h2><p>视频跟随 A / B 台播放、定位和速度；视频音轨保持静音。</p></div><div class="vj-actions"><button id="vj-add" type="button">导入视频</button><button id="vj-lyrics-add" type="button">导入歌词</button><button id="vj-output" type="button">打开外接输出窗</button><button id="vj-hide-all" type="button">全部隐藏</button><button id="vj-show-all" type="button">全部显示</button></div></div><div class="vj-stage"><div class="vj-layer" data-vj-layer="0" data-channel-label="VIDEO A"><div class="vj-screen"><div class="vj-empty">导入视频到 A 通道</div></div><div class="vj-channel-controls"><span class="vj-file-name">未载入视频</span><button class="vj-load" type="button">载入</button><button class="vj-toggle-visible" type="button">显示</button><button class="vj-play" data-vj-action="play" type="button">播放</button><button class="vj-stop" data-vj-action="stop" type="button">停止</button><button class="vj-fullscreen" type="button">全屏</button><button class="vj-lyrics-load" type="button">歌词</button><button class="vj-lyrics-clear" type="button">清除歌词</button><button class="vj-lyrics-toggle" type="button">歌词显示</button><label>字号 <input class="vj-lyrics-size" type="number" min="12" max="96" step="1" value="28" aria-label="VJ 歌词字号"/></label><label class="vj-sync-label">跟随 <select class="vj-sync" aria-label="VJ A 跟随音频台"><option value="true">A 台</option><option value="false">独立</option></select></label><label>速度 <input class="vj-rate" type="number" min="0.1" max="4" step="0.05" value="1" aria-label="VJ A 播放速度"/></label><label>特效 <select class="vj-effect" aria-label="VJ A 特效">${vjEffectOptions}</select></label><label>强度 <input class="vj-effect-amount" type="range" min="0" max="100" value="50" aria-label="VJ A 特效强度"/></label><button class="vj-effect-toggle" type="button">特效</button><label>动画 <select class="vj-animation" aria-label="VJ A 动画">${vjAnimationOptions}</select></label><label>动画强度 <input class="vj-animation-amount" type="range" min="0" max="100" value="50" aria-label="VJ A 动画强度"/></label><label>动画速度 <input class="vj-animation-speed" type="number" min="0.1" max="8" step="0.1" value="1" aria-label="VJ A 动画速度"/></label><button class="vj-animation-toggle" type="button">动画</button><button class="vj-visual-reset" type="button">重置视觉</button><label>透明度 <input class="vj-opacity" type="range" min="0" max="100" value="100" aria-label="VJ A 透明度"/></label><input class="vj-seek" data-vj-action="seek" type="range" min="0" max="1000" value="0" aria-label="VJ A 视频进度"/></div></div><div class="vj-layer" data-vj-layer="1" data-channel-label="VIDEO B"><div class="vj-screen"><div class="vj-empty">导入视频到 B 通道</div></div><div class="vj-channel-controls"><span class="vj-file-name">未载入视频</span><button class="vj-load" type="button">载入</button><button class="vj-toggle-visible" type="button">显示</button><button class="vj-play" data-vj-action="play" type="button">播放</button><button class="vj-stop" data-vj-action="stop" type="button">停止</button><button class="vj-fullscreen" type="button">全屏</button><button class="vj-lyrics-load" type="button">歌词</button><button class="vj-lyrics-clear" type="button">清除歌词</button><button class="vj-lyrics-toggle" type="button">歌词显示</button><label>字号 <input class="vj-lyrics-size" type="number" min="12" max="96" step="1" value="28" aria-label="VJ 歌词字号"/></label><label class="vj-sync-label">跟随 <select class="vj-sync" aria-label="VJ B 跟随音频台"><option value="true">B 台</option><option value="false">独立</option></select></label><label>速度 <input class="vj-rate" type="number" min="0.1" max="4" step="0.05" value="1" aria-label="VJ B 播放速度"/></label><label>特效 <select class="vj-effect" aria-label="VJ B 特效">${vjEffectOptions}</select></label><label>强度 <input class="vj-effect-amount" type="range" min="0" max="100" value="50" aria-label="VJ B 特效强度"/></label><button class="vj-effect-toggle" type="button">特效</button><label>动画 <select class="vj-animation" aria-label="VJ B 动画">${vjAnimationOptions}</select></label><label>动画强度 <input class="vj-animation-amount" type="range" min="0" max="100" value="50" aria-label="VJ B 动画强度"/></label><label>动画速度 <input class="vj-animation-speed" type="number" min="0.1" max="8" step="0.1" value="1" aria-label="VJ B 动画速度"/></label><button class="vj-animation-toggle" type="button">动画</button><button class="vj-visual-reset" type="button">重置视觉</button><label>透明度 <input class="vj-opacity" type="range" min="0" max="100" value="100" aria-label="VJ B 透明度"/></label><input class="vj-seek" data-vj-action="seek" type="range" min="0" max="1000" value="0" aria-label="VJ B 视频进度"/></div></div></div><input id="vj-file" type="file" accept="video/*,.mp4,.webm,.mov,.m4v,.ogv" hidden/><input id="vj-lyrics-file" type="file" accept=".lrc,.srt,.txt,.vtt,text/plain" hidden/></section>
    <section class="library" id="library" aria-label="音乐库"><div class="library-toolbar"><div class="library-title">${icon('folder')}<h2>音乐库</h2><span id="track-count">0 首</span></div><div class="library-tools"><label class="search">${icon('search')}<input id="search" placeholder="搜索曲目…" aria-label="搜索曲目"/><kbd>⌘ K</kbd></label><button class="text-button import-button">${icon('plus')}添加音乐</button></div></div><div class="library-table-wrap"><table><thead><tr><th class="number-col">#</th><th>曲目 / 来源</th><th>风格</th><th>BPM</th><th>时长</th><th class="load-col">载入播放器</th><th class="delete-col"></th></tr></thead><tbody id="track-list"></tbody></table></div><div class="library-note"><span>${icon('music')} 已备好两首原创合成演示，点击播放即可试听</span><span>MP3 · WAV · FLAC · 浏览器支持的其他音频</span></div></section>
    <footer><span><i class="privacy-dot"></i>音乐保留在本机 · 无需账号</span><div><kbd>A–D</kbd>选台 <span></span><kbd>空格</kbd>播放 <span></span><kbd>1–8</kbd>Pad <span></span><kbd>L</kbd>循环</div><span>MIXDESK <b>0.8.4</b></span></footer></main>
    <input id="file-input" type="file" accept="audio/*,.flac,.wav,.mp3,.m4a,.aiff,.aif,.ogg,.opus" multiple hidden/><div id="toast" role="status" aria-live="polite"></div><div id="drop-overlay"><div>${icon('arrow')}<h2>把音乐放进来</h2><p>释放文件，加入本地音乐库</p></div></div>
    <dialog id="help-dialog"><div class="dialog-heading"><div><span class="eyebrow">QUICK START</span><h2>开始你的第一段混音</h2></div><button id="close-help" class="icon-button" aria-label="关闭使用指南">${icon('close')}</button></div><ol><li><b>挑两首音乐</b><p>演示曲已载入 A、B 台。也可以导入音频文件，再点击曲目旁的 A / B。</p></li><li><b>匹配速度</b><p>SYNC 匹配另一台的 BPM。导入曲的 BPM 是估算值，可点击 BPM 数字手动校正。启用 KEY LOCK 可在变速时保持原始音高，旁边可按半音移调。</p></li><li><b>寻找衔接点</b><p>点击波形跳转，SET CUE 设置起点；暂停时按住 CUE 预览，松开返回。八个 Hot Cue 保存当前位置，再点跳转，Shift 点击清除。Pad 菜单可切换 Roll、Slicer、Beat Jump 和保存循环。</p></li><li><b>把两首歌混在一起</b><p>调节三段均衡器、滤波器和音量，用交叉推子从 A 平滑过渡到 B。导入时会估算首拍初值，也可在拍网格校正中手动修正，再用“对齐拍点”按网格同步。</p></li><li><b>录下这一刻</b><p>录音设置可选压缩格式或原生 16/24 位 WAV。点击录制混音，再点结束并下载；WAV 已保存片段可在刷新后恢复。只录主输出，最长 30 分钟。</p></li></ol><div class="help-note">已加入 Key Lock、两组三槽音效、四台分组采样（每台四组、每组四个可选样本）、自动首拍初值、手动拍网格和 MIX MIDI 映射。Roll / Slicer 按住生效、松开恢复进度；SLIP 可用于普通循环。独立预听需两个输出设备；暂不提供人声分离，控制器需真机验证。曲库支持播放列表、智能筛选、收藏、标签和封面读取。音乐与标记保存在本机浏览器。</div><button id="start-mixing" class="primary-button">开始混音 ${icon('play')}</button></dialog>
    <dialog id="bpm-dialog"><form method="dialog"><div class="eyebrow">EDIT TRACK TEMPO</div><h2>校正原始 BPM</h2><p>填写曲目原速的 BPM，用于速度同步和循环长度。</p><input id="bpm-input" type="number" min="30" max="300" step="0.1" required aria-label="原始 BPM"/><div class="dialog-actions"><button value="cancel" formnovalidate>取消</button><button class="primary-button" value="save">保存</button></div></form></dialog><dialog id="cue-dialog"><form><div class="dialog-heading"><div><span class="eyebrow">HOT CUE</span><h2>编辑 Cue <span id="cue-edit-number"></span></h2></div><button type="button" class="icon-button" id="cue-edit-close" aria-label="关闭 Cue 编辑">×</button></div><label>名称<input id="cue-edit-name" maxlength="40" aria-label="Cue 名称" placeholder="例如：主歌进入"/></label><label>颜色<select id="cue-edit-color" aria-label="Cue 颜色"><option value="">跟随播放器颜色</option><option value="#a9dba0">绿色</option><option value="#f4ad6b">橙色</option><option value="#89c8e7">蓝色</option><option value="#c9a6e8">紫色</option><option value="#f28b82">红色</option><option value="#f6d365">黄色</option></select></label><p id="cue-edit-error" role="alert"></p><div class="dialog-actions"><button type="button" id="cue-edit-clear">清除标记</button><button type="button" id="cue-edit-cancel">取消</button><button class="primary-button" id="cue-edit-save">保存</button></div></form></dialog></div>`;

$('.session-heading').insertAdjacentHTML('afterend', `<div class="layout-toolbar"><label>播放器布局 <select id="deck-layout" aria-label="播放器布局"><option value="twoHorizontal">2 台横向</option><option value="twoVertical">2 台纵向</option><option value="twoSampler">2 台 + 采样器</option><option value="fourHorizontal">4 台横向</option><option value="fourVertical">4 台纵向</option><option value="browser">Browser 曲库</option><option value="prepare">Prepare 待播</option><option value="two" hidden>双台（兼容）</option><option value="four" hidden>四台（兼容）</option></select></label><div class="deck-status-buttons">${[0,1,2,3].map(id => `<button data-deck-status="${id}" aria-label="查看 ${'ABCD'[id]} 台">${'ABCD'[id]} · 空台</button>`).join('')}</div><span>切换布局保留所有播放器状态</span></div><section id="layout-mode-panel" class="layout-mode-panel" hidden aria-live="polite"></section>`);
document.body.insertAdjacentHTML('beforeend', `<dialog id="mixer-settings-dialog"><div class="dialog-heading"><div><span class="eyebrow">MIXER SETTINGS</span><h2>混音器设置</h2></div><button id="mixer-settings-close" class="icon-button" aria-label="关闭混音器设置">×</button></div><div class="mixer-setting-grid"><label>主输出余量 <output id="master-headroom-value">0 dB</output><input id="master-headroom" type="range" min="-18" max="0" step="1" value="0" aria-label="主输出余量"/></label><label class="setting-check"><input id="master-limiter" type="checkbox" checked/> 主输出限幅器</label><label>交叉推子曲线 <output id="crossfader-curve-value">标准</output><input id="crossfader-curve" type="range" min="0" max="100" step="1" value="50" aria-label="交叉推子曲线"/></label><label class="setting-check"><input id="crossfader-hamster" type="checkbox"/> Hamster 反向交叉推子</label><label>自动增益下限 <output id="gain-lower-value">−20 dB</output><input id="gain-lower" type="range" min="-40" max="0" step="1" value="-20" aria-label="自动增益下限"/></label><label>自动增益上限 <output id="gain-upper-value">+12 dB</output><input id="gain-upper" type="range" min="0" max="24" step="1" value="12" aria-label="自动增益上限"/></label>${[0,1,2,3].map(index => `<label>Filter FX 槽 ${index + 1}<select id="filter-fx-preset-${index}" aria-label="Filter FX 槽 ${index + 1}">${Object.entries(FILTER_FX_TYPES).map(([value, name]) => `<option value="${value}">${name}</option>`).join('')}</select></label>`).join('')}</div><p>这些参数对应 DJUCED 的主余量、限幅器、交叉推子曲线、Hamster、自动增益范围和四个 Filter FX 预选槽。修改会立即作用于音频引擎，并保存到本机混音会话。</p></dialog>`);

function renderVJ() {
  vj.channels.forEach((state, index) => {
    const root = $(`[data-vj-layer="${index}"]`);
    if (!root) return;
    root.classList.toggle('loaded', !!state.loaded);
    $('.vj-file-name', root).textContent = state.name || '未载入视频';
    const visible = $('.vj-toggle-visible', root);
    visible.textContent = state.visible ? '隐藏' : '显示';
    visible.classList.toggle('active', state.visible);
    visible.setAttribute('aria-pressed', String(state.visible));
    $('.vj-opacity', root).value = String(Math.round(state.opacity * 100));
    $('.vj-rate', root).value = String(state.rate);
    $('.vj-sync', root).value = String(state.syncToDeck);
    const lyrics = state.lyrics || {};
    $('.vj-lyrics-toggle', root).textContent = lyrics.visible === false ? '歌词隐藏' : '歌词显示';
    $('.vj-lyrics-toggle', root).classList.toggle('active', lyrics.visible !== false);
    $('.vj-lyrics-toggle', root).setAttribute('aria-pressed', String(lyrics.visible !== false));
    $('.vj-lyrics-load', root).textContent = lyrics.name ? `歌词 · ${lyrics.name}` : '歌词';
    $('.vj-lyrics-size', root).value = String(lyrics.fontSize || 28);
    const effect = state.effect || { name: 'none', amount: .5, enabled: false };
    $('.vj-effect', root).value = effect.name;
    $('.vj-effect-amount', root).value = String(Math.round(effect.amount * 100));
    $('.vj-effect-toggle', root).textContent = effect.enabled ? '特效开' : '特效关';
    $('.vj-effect-toggle', root).classList.toggle('active', effect.enabled);
    $('.vj-effect-toggle', root).setAttribute('aria-pressed', String(effect.enabled));
    const animation = state.animation || { name: 'none', speed: 1, amount: .5, enabled: false };
    $('.vj-animation', root).value = animation.name;
    $('.vj-animation-speed', root).value = String(animation.speed);
    $('.vj-animation-amount', root).value = String(Math.round(animation.amount * 100));
    $('.vj-animation-toggle', root).textContent = animation.enabled ? '动画开' : '动画关';
    $('.vj-animation-toggle', root).classList.toggle('active', animation.enabled);
    $('.vj-animation-toggle', root).setAttribute('aria-pressed', String(animation.enabled));
    const seek = $('.vj-seek', root);
    if (document.activeElement !== seek) seek.value = state.duration ? String(Math.round(state.position / state.duration * 1000)) : '0';
    const transport = $('.vj-play', root);
    transport.textContent = state.playing ? '暂停' : '播放';
    transport.dataset.vjAction = state.playing ? 'pause' : 'play';
    transport.disabled = !state.loaded;
    $('.vj-stop', root).disabled = !state.loaded;
  });
}

vj.channels.forEach((_, index) => vj.mount($(`[data-vj-layer="${index}"]`), index));
vj.onChange = snapshot => { renderVJ(); vjOutput.sync(snapshot); };
renderVJ();
let vjTarget = 0, vjLyricsTarget = 0;
const vjFile = $('#vj-file');
const vjLyricsFile = $('#vj-lyrics-file');
$('#vj-toggle').onclick = () => {
  const panel = $('#vj-panel');
  panel.hidden = !panel.hidden;
  $('#vj-toggle').classList.toggle('active', !panel.hidden);
  if (!panel.hidden) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
};
$('#vj-add').onclick = () => vjFile.click();
$('#vj-lyrics-add').onclick = () => { vjLyricsTarget = 0; vjLyricsFile.click(); };
$('#vj-output').onclick = () => {
  if (!vjOutput.open()) toast('浏览器阻止了输出窗，请允许此页面打开弹出式窗口');
  else vjOutput.sync(vj.snapshot());
};
window.addEventListener('message', event => {
  if (event.source === vjOutput.popup && event.data?.type === 'mixdesk-vj-output-ready') vjOutput.sync(vj.snapshot());
});
document.addEventListener('fullscreenchange', () => {
  $$('[data-vj-layer]').forEach(root => {
    const fullscreen = document.fullscreenElement === root;
    $('.vj-fullscreen', root).textContent = fullscreen ? '退出全屏' : '全屏';
    $('.vj-fullscreen', root).setAttribute('aria-pressed', String(fullscreen));
  });
});
$$('[data-vj-layer]').forEach((root, index) => {
  $('.vj-load', root).onclick = () => { vjTarget = index; vjFile.click(); };
  $('.vj-fullscreen', root).onclick = async () => {
    try {
      if (document.fullscreenElement === root) await document.exitFullscreen();
      else await root.requestFullscreen();
    } catch { toast('浏览器不支持此视频画面的全屏输出'); }
  };
  $('.vj-lyrics-load', root).onclick = () => { vjLyricsTarget = index; vjLyricsFile.click(); };
  $('.vj-lyrics-clear', root).onclick = () => { vj.clearLyrics(index); void vj.save(); };
  $('.vj-lyrics-toggle', root).onclick = () => { const state = vj.channel(index); vj.setLyrics({ visible: state.lyrics.visible === false }, index); void vj.save(); };
  $('.vj-lyrics-size', root).onchange = event => { vj.setLyrics({ fontSize: Number(event.target.value) }, index); void vj.save(); };
  $('.vj-effect', root).onchange = event => { vj.setEffect({ name: event.target.value }, index); void vj.save(); };
  $('.vj-effect-amount', root).oninput = event => { vj.setEffect({ amount: Number(event.target.value) / 100 }, index); void vj.save(); };
  $('.vj-effect-toggle', root).onclick = () => { const effect = vj.channel(index).effect; vj.setEffect({ enabled: !effect.enabled }, index); void vj.save(); };
  $('.vj-animation', root).onchange = event => { vj.setAnimation({ name: event.target.value }, index); void vj.save(); };
  $('.vj-animation-amount', root).oninput = event => { vj.setAnimation({ amount: Number(event.target.value) / 100 }, index); void vj.save(); };
  $('.vj-animation-speed', root).onchange = event => { vj.setAnimation({ speed: Number(event.target.value) }, index); void vj.save(); };
  $('.vj-animation-toggle', root).onclick = () => { const animation = vj.channel(index).animation; vj.setAnimation({ enabled: !animation.enabled }, index); void vj.save(); };
  $('.vj-visual-reset', root).onclick = () => { vj.resetVisuals(index); void vj.save(); };
  $('.vj-toggle-visible', root).onclick = () => { vj.setVisible(!vj.channel(index).visible, index); void vj.save(); };
  $('.vj-opacity', root).oninput = event => { vj.setOpacity(Number(event.target.value) / 100, index); void vj.save(); };
  $('.vj-rate', root).onchange = event => {
    const rate = Number(event.target.value);
    if (vj.channel(index).syncToDeck) engine.decks[index].setRate(rate);
    else vj.setRate(rate, index);
    vj.syncDeck(engine.decks[index], index);
    void vj.save();
  };
  $('.vj-sync', root).onchange = event => { vj.setSyncToDeck(event.target.value === 'true', index, engine.decks[index]); void vj.save(); };
  $('.vj-play', root).onclick = () => {
    const state = vj.channel(index);
    if (state.syncToDeck) {
      const deck = engine.decks[index];
      if (deck.playing) deck.pause(); else deck.play().catch(() => toast('音频设备暂时不可用，请重试播放'));
      vj.syncDeck(deck, index);
    } else if (state.playing) vj.pause(null, index);
    else vj.play(index).catch(() => toast('视频播放失败'));
    void vj.save();
  };
  $('.vj-stop', root).onclick = () => {
    if (vj.channel(index).syncToDeck) {
      const deck = engine.decks[index]; deck.pause(); deck.seek(0); vj.syncDeck(deck, index);
    } else vj.stop(index);
    void vj.save();
  };
  $('.vj-seek', root).oninput = event => {
    const state = vj.channel(index), position = Number(event.target.value) / 1000 * (state.duration || 0);
    if (state.syncToDeck) {
      const deck = engine.decks[index]; deck.seek(position); vj.syncDeck(deck, index);
    } else vj.setPosition(position, index);
  };
  $('.vj-seek', root).onchange = () => { void vj.save(); };
});
vjLyricsFile.onchange = async event => {
  const file = event.target.files?.[0]; event.target.value = '';
  if (!file) return;
  try { await vj.loadLyrics(vjLyricsTarget, file); await vj.save(); $('#vj-panel').hidden = false; $('#vj-toggle').classList.add('active'); }
  catch (error) { toast(error.message || '歌词载入失败'); }
};
vjFile.onchange = async event => {
  const file = event.target.files?.[0]; event.target.value = '';
  if (!file) return;
  try { await vj.loadFile(vjTarget, file); await vj.save(); $('#vj-panel').hidden = false; $('#vj-toggle').classList.add('active'); }
  catch (error) { toast(error.message || '视频载入失败'); }
};
$('#vj-hide-all').onclick = () => { vj.channels.forEach((_, index) => vj.setVisible(false, index)); void vj.save(); };
$('#vj-show-all').onclick = () => { vj.channels.forEach((_, index) => vj.setVisible(true, index)); void vj.save(); };
function renderLayoutModePanel() {
  const panel = $('#layout-mode-panel');
  if (!panel) return;
  const snapshot = deckLayout === 'prepare'
    ? engine.decks.map((deck, id) => `${id}:${deck.track?.id || ''}:${deck.playing ? 'playing' : 'ready'}`).join('|')
    : deckLayout;
  if (panel.dataset.mode === deckLayout && panel.dataset.snapshot === snapshot) return;
  if (deckLayout === 'browser') {
    panel.hidden = false;
    panel.dataset.mode = 'browser';
    panel.dataset.snapshot = snapshot;
    panel.innerHTML = '<div><span class="eyebrow">BROWSER</span><h2>浏览曲库</h2><p>按风格、调性、BPM、评分和播放列表整理本机音乐。播放器继续保持当前播放状态。</p></div><button class="layout-return" type="button">返回混音台</button>';
  } else if (deckLayout === 'prepare') {
    const loaded = engine.decks.map((deck, id) => deck.track ? `<li><b>${'ABCD'[id]} 台</b><span>${escape(deck.track.title)}</span><small>${deck.playing ? '播放中' : '已载入'}</small></li>` : '').filter(Boolean).join('');
    panel.hidden = false;
    panel.dataset.mode = 'prepare';
    panel.dataset.snapshot = snapshot;
    panel.innerHTML = `<div><span class="eyebrow">PREPARE</span><h2>待播列表</h2><p>把曲目拖到 A–D 台或从曲库载入；这里汇总当前会话中已经准备好的曲目。</p></div><ul class="prepare-list">${loaded || '<li class="empty">还没有准备好的曲目</li>'}</ul><button class="layout-return" type="button">返回混音台</button>`;
  } else {
    panel.hidden = true;
    panel.dataset.mode = '';
    panel.dataset.snapshot = '';
    panel.innerHTML = '';
  }
  $('.layout-return', panel)?.addEventListener('click', () => setLayout('twoHorizontal'), { once: true });
}
function setLayout(layout) {
  const valid = ['two','four','twoHorizontal','twoVertical','twoSampler','fourHorizontal','fourVertical','browser','prepare'];
  deckLayout = valid.includes(layout) ? layout : 'twoHorizontal';
  $('.app-shell').dataset.layout = deckLayout;
  $('.console').dataset.layout = deckLayout === 'four' ? 'fourHorizontal' : deckLayout === 'two' ? 'twoHorizontal' : deckLayout.startsWith('four') ? deckLayout : deckLayout.startsWith('two') ? deckLayout : 'twoHorizontal';
  $('#deck-layout').value = deckLayout;
  if (deckLayout.startsWith('two') && selectedDeck > 1) selectDeck(0);
  if (deckLayout === 'browser') $('#library').scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (deckLayout === 'prepare') { $('#library').scrollIntoView({ behavior: 'smooth', block: 'start' }); library.setView('all'); }
  renderLayoutModePanel();
  setting('deck-layout', deckLayout).catch(() => {});
}
$('#deck-layout').onchange = event => setLayout(event.target.value);
$$('[data-deck-status]').forEach(button => button.onclick = () => {
  const id = Number(button.dataset.deckStatus);
  if (id > 1) setLayout(deckLayout.startsWith('four') ? deckLayout : 'four');
  selectDeck(id); $(`[data-deck="${id}"]`).scrollIntoView({ block: 'nearest', behavior: 'smooth' });
});
$('.app-shell').dataset.layout = deckLayout;

function toast(message) {
  $('#toast').textContent = message;
  $('#toast').classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => $('#toast').classList.remove('visible'), 4200);
}

async function tapBpm(id) {
  const deck = engine.decks[id], now = globalThis.performance.now() / 1000;
  if (!deck.track) return toast('先载入一首音乐');
  const trackId = deck.track.id;
  const taps = bpmTaps[id].filter(tap => tap.trackId === trackId && now - tap.at < 3);
  taps.push({ at: now, trackId }); bpmTaps[id] = taps.slice(-6);
  if (taps.length < 2) return toast(`${'ABCD'[id]} 台已记录一次 BPM 拍击`);
  const intervals = taps.slice(1).map((tap, index) => tap.at - taps[index].at).filter(value => value >= 0.2 && value <= 2);
  if (!intervals.length) return toast('拍击间隔超出 BPM 范围');
  const bpm = clamp(60 / (intervals.reduce((sum, value) => sum + value, 0) / intervals.length), 30, 300);
  try { await library.catalog.metadata(deck.track.id, { bpm: Math.round(bpm * 10) / 10 }); toast(`${'ABCD'[id]} 台 BPM 已拍击为 ${bpm.toFixed(1)}`); }
  catch { toast('BPM 保存失败，请重试'); }
}

function selectDeck(id) {
  selectedDeck = id;
  $$('.deck').forEach((element, i) => element.classList.toggle('selected', i === id));
}

function renderLibrary() { library.render(); }

function metadataChanged() {
  engine.decks.forEach((deck, id) => {
    if (!deck.track) return;
    const root = $(`[data-deck="${id}"]`), bpm = deck.track.bpm || 120;
    $('.track-title', root).textContent = deck.track.title;
    $('.track-title', root).title = deck.track.title;
    $('.track-subtitle', root).textContent = deck.track.artist;
    $('.estimate-badge', root).textContent = deck.track.estimated ? '估算' : deck.track.bpm ? '' : '待校正';
    if (deck.bpm !== bpm) {
      const position = deck.position;
      deck.performance.cancel(); deck.loop = null; deck.loopIn = null;
      const previousBpm = deck.bpm;
      deck.bpm = bpm;
      if (previousBpm > 0 && deck.beatGrid.length) deck.beatGrid = deck.beatGrid.map(segment => ({ ...segment, bpm: clamp(segment.bpm * bpm / previousBpm, 30, 300) }));
      deck.seek(position); deck.updateTempo();
      deck.savedLoops.forEach(loop => { if (loop) loop.beats = (loop.end - loop.start) * bpm / 60; });
      refreshDeck(id);
    }
  });
}

async function loadDeck(id, track) {
  const token = ++loadSerial[id];
  const root = $(`[data-deck="${id}"]`);
  root.classList.add('loading');
  try {
    const buffer = track.buffer || await engine.decode(track.file);
    try { track.annotations = await setting(`annotations:${track.id}`) || track.annotations; }
    catch { toast('标记缓存不可用，本次仍可正常播放'); }
    if (loadSerial[id] !== token) return;
    const deck = engine.decks[id];
    deck.load(track, buffer);
    deck.peaks = peaksFor(buffer);
    deck.spectrum = spectrumFor(buffer, deck.peaks.length);
    $('.track-title', root).textContent = track.title;
    $('.track-title', root).title = track.title;
    $('.track-subtitle', root).textContent = track.artist;
    $('.tempo', root).value = 0;
    $('.tempo-reset', root).textContent = '+0.0%';
    $('.estimate-badge', root).textContent = track.estimated ? '估算' : track.bpm ? '' : '待校正';
    refreshDeck(id); renderLibrary();
  } catch (error) {
    if (loadSerial[id] === token) toast(`无法解码「${track.title}」。请尝试 MP3 或 WAV 文件。`);
    console.error('Audio decoding failed', error);
  } finally {
    if (loadSerial[id] === token) root.classList.remove('loading');
  }
}

function updateHotcues(id) {
  const deck = engine.decks[id];
  $$(`[data-deck="${id}"] .hotcue`).forEach((button, i) => {
    const point = deck.hotcues[i];
    button.classList.toggle('set', point !== null);
    const meta = deck.hotcueMeta[i] || { name: '', color: '' };
    $('span', button).textContent = point === null ? '设置标记' : meta.name || time(point);
    button.title = point === null ? `设置或跳转到 Cue ${i + 1}` : `${meta.name || `Cue ${i + 1} · ${time(point)}`} · 双击编辑`;
    button.style.setProperty('--cue-color', meta.color || '');
    button.dataset.cueName = meta.name;
  });
}

async function handleHotcue(id, index, clear = false) {
  const deck = engine.decks[id];
  if (!deck.buffer) return;
  if (clear) { deck.hotcues[index] = null; deck.hotcueMeta[index] = { name: '', color: '' }; }
  else if (deck.hotcues[index] === null) deck.hotcues[index] = deck.quantize ? deck.snap(deck.position) : deck.position;
  else { deck.seek(deck.hotcues[index]); return true; }
  // Paint the new marker only after its IndexedDB transaction has completed.
  // This makes a follow-up reload observe the same state the UI just showed.
  const saved = await saveAnnotations(id);
  updateHotcues(id);
  return saved;
}

async function analyzeDeckHotcues(id) {
  const deck = engine.decks[id];
  if (!deck.buffer) { toast('先载入一首音乐'); return false; }
  const points = estimateAutoHotcues(deck.buffer, deck.bpm, deck.gridOffset);
  deck.hotcues = Array.from({ length: 8 }, (_, index) => points[index] ?? null);
  deck.hotcueMeta = Array.from({ length: 8 }, (_, index) => deck.hotcues[index] === null ? { name: '', color: '' } : { name: `Auto Cue ${index + 1}`, color: '' });
  await saveAnnotations(id); updateHotcues(id); refreshDeck(id);
  toast(`${'ABCD'[id]} 台已生成 ${points.length} 个自动 Hot Cue`);
  return true;
}

let cueEditDeck = 0, cueEditIndex = 0;
function openCueEditor(id, index) {
  const deck = engine.decks[id];
  if (!deck.buffer || deck.hotcues[index] === null) { toast('先设置这个 Hot Cue，再编辑名称和颜色'); return; }
  cueEditDeck = id; cueEditIndex = index;
  const meta = deck.hotcueMeta[index] || { name: '', color: '' };
  $('#cue-edit-number').textContent = `${index + 1} · ${time(deck.hotcues[index])}`;
  $('#cue-edit-name').value = meta.name || '';
  $('#cue-edit-color').value = meta.color || '';
  $('#cue-edit-error').textContent = '';
  $('#cue-dialog').showModal(); $('#cue-edit-name').focus();
}

$('#cue-edit-close').onclick = $('#cue-edit-cancel').onclick = () => $('#cue-dialog').close();
$('#cue-edit-clear').onclick = async () => {
  const deck = engine.decks[cueEditDeck]; deck.hotcues[cueEditIndex] = null; deck.hotcueMeta[cueEditIndex] = { name: '', color: '' };
  await saveAnnotations(cueEditDeck); updateHotcues(cueEditDeck); $('#cue-dialog').close();
};
$('#cue-dialog form').onsubmit = async event => {
  event.preventDefault();
  const name = $('#cue-edit-name').value.trim().slice(0, 40), color = $('#cue-edit-color').value;
  if (name && name.length > 40) { $('#cue-edit-error').textContent = '名称最多 40 个字符'; return; }
  const deck = engine.decks[cueEditDeck]; deck.hotcueMeta[cueEditIndex] = { name, color };
  await saveAnnotations(cueEditDeck); updateHotcues(cueEditDeck); $('#cue-dialog').close();
};

async function saveAnnotations(id) {
  const deck = engine.decks[id];
  if (!deck.track) return;
  const annotations = { cuePoint: deck.cuePoint, hotcues: [...deck.hotcues], hotcueMeta: deck.hotcueMeta.map(meta => ({ ...meta })), gridOffset: deck.gridOffset, beatGrid: deck.beatGrid.map(segment => ({ ...segment })), savedLoops: deck.savedLoops.map(loop => loop ? { ...loop } : null) };
  deck.track.annotations = annotations;
  // Markers belong to a track. Keep every loaded copy current so an edit on
  // another deck cannot overwrite newly saved loops with stale annotations.
  engine.decks.forEach((other, otherId) => {
    if (other === deck || other.track?.id !== deck.track.id) return;
    other.cuePoint = annotations.cuePoint; other.gridOffset = annotations.gridOffset;
    other.beatGrid = annotations.beatGrid.map(segment => ({ ...segment }));
    other.hotcues = [...annotations.hotcues];
    other.hotcueMeta = annotations.hotcueMeta.map(meta => ({ ...meta }));
    other.savedLoops = annotations.savedLoops.map(loop => loop ? { ...loop } : null);
    other.track.annotations = annotations; refreshDeck(otherId);
  });
  const trackId = deck.track.id, token = Symbol(trackId); annotationWrites.set(trackId, token);
  const mark = message => engine.decks.forEach((other, otherId) => {
    if (other.track?.id !== trackId) return;
    const label = document.querySelector('[data-deck="' + otherId + '"] .annotation-status');
    if (label) label.textContent = message;
  });
  pendingAnnotationWrites++; mark('标记保存中…');
  const previous = annotationQueues.get(trackId) || Promise.resolve();
  const write = previous.catch(() => {}).then(() => setting('annotations:' + trackId, annotations));
  annotationQueues.set(trackId, write);
  try {
    await write;
    if (annotationWrites.get(trackId) === token) mark('标记已保存到本机');
    return true;
  } catch {
    if (annotationWrites.get(trackId) === token) mark('标记保存失败');
    toast('标记在本次会话可用，但缓存保存失败'); return false;
  } finally {
    pendingAnnotationWrites--;
    if (annotationQueues.get(trackId) === write) annotationQueues.delete(trackId);
  }

}

function refreshDeck(id) {
  const deck = engine.decks[id], root = $(`[data-deck="${id}"]`);
  if (deck.loop && !deck.loop.temporary) loopBeats[id] = deck.loop.beats;
  updateHotcues(id); updateLoop(id);
  deck.refreshPads?.();
  $('.tempo', root).value = (deck.rate - 1) * 100;
  $('.tempo-reset', root).textContent = `${deck.rate >= 1 ? '+' : ''}${((deck.rate - 1) * 100).toFixed(1)}%`;
  const autoGain = $(`.auto-gain`, $(`[data-channel="${id}"]`));
  if (autoGain) $('span', autoGain).textContent = `${deck.autoGain.toFixed(2)}×`;
  const syncButton = $('.sync-button', root);
  if (syncButton) {
    syncButton.classList.toggle('active', deck.syncEnabled);
    syncButton.setAttribute('aria-pressed', String(deck.syncEnabled));
    syncButton.title = deck.syncEnabled ? '持续跟随来源台的有效 BPM；再次点击解除' : '持续跟随来源台的有效 BPM';
    const label = $('span', syncButton); if (label) label.textContent = deck.syncEnabled ? '持续同步' : '速度同步';
  }
  if ($('.grid-label', root)) $('.grid-label', root).textContent = `首拍 ${deck.gridOffset.toFixed(3)}s`;
  const gridBpm = $('.grid-bpm', root), gridRemove = $('.grid-remove-segment', root);
  if (gridBpm) gridBpm.value = deck.beatGridAt().bpm;
  if (gridRemove) gridRemove.disabled = deck.beatGridAt().start <= 0;
  if ($('.quantize', root)) $('.quantize', root).setAttribute('aria-pressed', String(deck.quantize));
  if ($('.key-lock', root)) {
    $('.key-lock', root).setAttribute('aria-pressed', String(deck.keyLock));
    $('.key-shift', root).value = deck.keyShift;
    $('.tempo-label>span', root).textContent = deck.keyLock ? '变速 / 保持音高' : '变速 / 变调';
  }
  const reverseButton = $('.reverse-button', root);
  reverseButton.classList.toggle('active', deck.reverse);
  reverseButton.setAttribute('aria-pressed', String(deck.reverse));
  reverseButton.textContent = deck.reverse ? 'REV ON' : 'REV';
  const tempoRange = $('.tempo-range', root);
  if (tempoRange) {
    tempoRange.value = String(deck.tempoRange);
    const tempo = $('.tempo', root); tempo.min = String(-deck.tempoRange); tempo.max = String(deck.tempoRange);
  }
}

function setCue(id) {
  const deck = engine.decks[id];
  deck.cuePoint = deck.quantize ? deck.snap(deck.position) : deck.position;
  saveAnnotations(id);
  toast(`${'ABCD'[id]} 台 Cue 已设为 ${time(deck.cuePoint)}`);
}

function updateLoop(id) {
  const root = $(`[data-deck="${id}"]`), deck = engine.decks[id];
  if (deck.loop && !deck.loop.temporary) loopBeats[id] = deck.loop.beats;
  $('.loop-toggle', root).classList.toggle('active', !!deck.loop);
  $('.loop-toggle', root).setAttribute('aria-pressed', String(!!deck.loop));
  const displayedBeats = deck.loop?.beats ?? loopBeats[id];
  $('.loop-length', root).textContent = `${displayedBeats < 1 && Number.isInteger(1 / displayedBeats) ? `1/${1 / displayedBeats}` : Number(displayedBeats.toFixed(3))} 拍`;
  $('.loop-toggle span', root).textContent = deck.loop?.temporary ? '临时循环' : '循环';
}

async function togglePlay(id) {
  const deck = engine.decks[id];
  if (!deck.buffer) return toast('先载入一首音乐');
  if (deck.latchCue()) return;
  if (deck.playing) { deck.pause(); vj.syncDeck(deck, id); }
  else {
    try { await deck.play(); vj.syncDeck(deck, id); } catch { toast('音频设备暂时不可用，请重试播放'); }
  }
}

function changeLoopLength(id, factor) {
  loopBeats[id] = clamp(loopBeats[id] * factor, 0.25, 32);
  const deck = engine.decks[id];
  if (deck.loop) {
    deck.resizeLoop(loopBeats[id]);
  }
  updateLoop(id);
}

let bpmEditDeck = 0;
$$('.deck').forEach((root, id) => {
  const deck = engine.decks[id];
  root.addEventListener('pointerdown', () => selectDeck(id));
  $('.deck-label', root).onclick = () => selectDeck(id);
  $('.play-button', root).onclick = () => togglePlay(id);
  $('.reverse-button', root).onclick = () => { deck.setReverse(!deck.reverse); refreshDeck(id); };
  const platter = $('.platter', root);
  let platterGesture = null;
  platter.style.touchAction = 'none';
  const platterAngle = event => {
    const rect = platter.getBoundingClientRect();
    return Math.atan2(event.clientY - (rect.top + rect.height / 2), event.clientX - (rect.left + rect.width / 2));
  };
  platter.onpointerdown = event => {
    if (event.button !== 0 || !deck.buffer) return;
    event.preventDefault(); event.stopPropagation(); platter.setPointerCapture(event.pointerId);
    platterGesture = { pointerId: event.pointerId, angle: platterAngle(event) };
    deck.scratchTouch(true);
  };
  platter.onpointermove = event => {
    if (!platterGesture || event.pointerId !== platterGesture.pointerId) return;
    event.preventDefault();
    const angle = platterAngle(event);
    let delta = angle - platterGesture.angle;
    if (delta > Math.PI) delta -= Math.PI * 2;
    if (delta < -Math.PI) delta += Math.PI * 2;
    platterGesture.angle = angle;
    if (Math.abs(delta) < 0.0005) return;
    // One platter turn represents four beats, matching the jog's musical
    // scale while keeping the gesture independent of screen resolution.
    deck.scratchMove(delta / (Math.PI * 2) * 4 * deck.beatDurationAt());
  };
  const releasePlatter = event => {
    if (!platterGesture || (event?.pointerId != null && event.pointerId !== platterGesture.pointerId)) return;
    platterGesture = null; deck.scratchTouch(false);
  };
  platter.onpointerup = releasePlatter;
  platter.onpointercancel = releasePlatter;
  platter.onlostpointercapture = releasePlatter;
  const cueButton = $('.cue-button', root);
  cueButton.title = '播放中按下返回 Cue；暂停时按住预览，松开返回；Shift 点击设置';
  cueButton.onpointerdown = event => {
    if (event.button !== 0) return;
    event.preventDefault(); cueButton.setPointerCapture(event.pointerId);
    if (event.shiftKey) setCue(id);
    else deck.cuePress().catch(() => toast('Cue 预览播放失败'));
  };
  cueButton.onpointerup = cueButton.onpointercancel = cueButton.onlostpointercapture = () => deck.cueRelease();
  cueButton.onkeydown = event => {
    if (!['Space', 'Enter'].includes(event.code)) return;
    event.preventDefault(); event.stopPropagation();
    if (!event.repeat) {
      if (event.shiftKey) setCue(id);
      else deck.cuePress().catch(() => toast('Cue 预览播放失败'));
    }
  };
  cueButton.onkeyup = event => {
    if (['Space', 'Enter'].includes(event.code)) { event.preventDefault(); event.stopPropagation(); deck.cueRelease(); }
  };
  // Screen-reader activation has no held key/pointer: return to Cue directly.
  cueButton.onclick = event => { if (event.detail === 0) { if (event.shiftKey) setCue(id); else deck.cue(); } };
  $('.set-cue', root).onclick = () => setCue(id);
  $('.seek', root).oninput = event => { deck.seek(event.target.value / 1000 * (deck.buffer?.duration || 0)); vj.syncDeck(deck, id); updateLoop(id); };
  $('.tempo', root).oninput = event => {
    deck.setRate(1 + Number(event.target.value) / 100);
    vj.syncDeck(deck, id);
    $('.tempo-reset', root).textContent = `${event.target.value >= 0 ? '+' : ''}${Number(event.target.value).toFixed(1)}%`;
    refreshDeck(id);
  };
  $('.tempo-range', root).onchange = event => {
    const range = deck.setTempoRange(Number(event.target.value)), tempo = $('.tempo', root);
    tempo.min = String(-range); tempo.max = String(range); tempo.value = String((deck.rate - 1) * 100);
    refreshDeck(id); scheduleSessionSave();
  };
  $('.tempo-reset', root).onclick = () => { $('.tempo', root).value = 0; $('.tempo', root).dispatchEvent(new Event('input')); };
  $('.sync-button', root).onclick = () => {
    const other = engine.decks[deck.syncTarget];
    if (!deck.buffer || !other.buffer) return toast('两台都载入音乐后即可同步速度');
    if (deck.syncEnabled) {
      deck.setSyncEnabled(false); refreshDeck(id); return toast(`${'ABCD'[id]} 台已解除持续同步`);
    }
    if (!deck.setSyncEnabled(true)) return toast('同步来源形成循环，无法启用');
    engine.updateSync(); refreshDeck(id);
    const desiredRate = deck.rate;
    toast(desiredRate <= 0.5 || desiredRate >= 1.5 ? '所需速度超出 ±50% 范围，已调整到边界' : `${'ABCD'[id]} 台已持续跟随 ${'ABCD'[deck.syncTarget]} 台 · ${deck.musicalBpm.toFixed(1)} BPM`);
  };
  $$('.hotcue', root).forEach((button, i) => {
    const held = new Set();
    let suppressClick = false;
    const beginSlip = (event, source) => {
      const point = deck.hotcues[i];
      if (event.shiftKey || point === null || !deck.performance.slipEnabled || !deck.playing) return false;
      if (!deck.performance.beginSlipCue(point, i, source)) return false;
      held.add(source); suppressClick = true;
      event.preventDefault();
      return true;
    };
    const endSlip = (event, source) => {
      if (!held.delete(source)) return;
      deck.performance.endSlipCue(source);
      event?.preventDefault();
    };
    const pointerSource = event => `pointer:${id}:${i}:${event.pointerId}`;
    const keySource = event => `button:${id}:${i}:${event.code}`;
    button.onpointerdown = event => {
      if (event.button !== 0) return;
      suppressClick = false;
      if (beginSlip(event, pointerSource(event))) button.setPointerCapture?.(event.pointerId);
    };
    const releasePointer = event => endSlip(event, pointerSource(event));
    button.onpointerup = releasePointer;
    button.onpointercancel = releasePointer;
    button.onlostpointercapture = releasePointer;
    button.onkeydown = event => {
      if (!['Space', 'Enter'].includes(event.code)) return;
      if (event.repeat) { if (held.has(keySource(event))) { event.preventDefault(); event.stopPropagation(); } return; }
      suppressClick = false;
      if (beginSlip(event, keySource(event))) event.stopPropagation();
    };
    button.onkeyup = event => {
      if (!['Space', 'Enter'].includes(event.code)) return;
      if (held.has(keySource(event)) || suppressClick) {
        endSlip(event, keySource(event)); event.preventDefault(); event.stopPropagation();
      }
    };
    button.onblur = () => { for (const source of [...held]) endSlip(null, source); };
    button.onclick = event => {
      if (suppressClick) { suppressClick = false; return; }
      handleHotcue(id, i, event.shiftKey);
    };
    button.ondblclick = event => { event.preventDefault(); openCueEditor(id, i); };
  });
  $('.loop-toggle', root).onclick = () => { deck.toggleLoop(loopBeats[id]); updateLoop(id); };
  $('.loop-half', root).onclick = () => changeLoopLength(id, 0.5);
  $('.loop-double', root).onclick = () => changeLoopLength(id, 2);
  $('.bpm-value', root).setAttribute('role', 'button');
  $('.bpm-value', root).tabIndex = 0;
  $('.bpm-value', root).title = '校正曲目原始 BPM';
  const editBPM = () => { bpmEditDeck = id; $('#bpm-input').value = deck.bpm; $('#bpm-dialog').showModal(); $('#bpm-input').focus(); };
  $('.bpm-value', root).onclick = editBPM;
  $('.bpm-value', root).onkeydown = event => { if (['Enter', ' '].includes(event.key)) { event.preventDefault(); editBPM(); } };
  root.addEventListener('dragover', event => { event.preventDefault(); root.classList.add('drag-target'); });
  root.addEventListener('dragleave', () => root.classList.remove('drag-target'));
  root.addEventListener('drop', async event => {
    event.preventDefault(); event.stopPropagation(); dragDepth = 0; root.classList.remove('drag-target'); $('#drop-overlay').classList.remove('visible');
    const trackId = event.dataTransfer.getData('application/x-mixdesk-track');
    const existing = tracks.find(track => track.id === trackId);
    if (existing) { await loadDeck(id, existing); return; }
    const added = await importFiles(event.dataTransfer.files);
    if (added.length) await loadDeck(id, added[0]);
  });
});

$('#bpm-dialog form').addEventListener('submit', async event => {
  if (event.submitter?.value !== 'save') return;
  event.preventDefault();
  const bpm = Number($('#bpm-input').value), deck = engine.decks[bpmEditDeck];
  if (bpm < 30 || bpm > 300 || !Number.isFinite(bpm)) return;
  if (!deck.track) return;
  try { await library.catalog.metadata(deck.track.id, { bpm }); }
  catch { toast('BPM 保存失败，请重试'); return; }
  $('#bpm-dialog').close('save');
});

$$('.mixer-channel').forEach((root, id) => {
  const deck = engine.decks[id];
  $('.filter-control', root).insertAdjacentHTML('afterend', `<div class="filter-fx-row"><label>FILTER FX<select class="filter-fx-slot" aria-label="${'ABCD'[id]} 台 Filter FX 槽位">${[0,1,2,3].map(index => `<option value="${index}">槽 ${index + 1}</option>`).join('')}</select></label><select class="filter-fx-type" aria-label="${'ABCD'[id]} 台 Filter FX 类型">${Object.entries(FILTER_FX_TYPES).map(([value, name]) => `<option value="${value}">${name}</option>`).join('')}</select></div>`);
  const filterFxSlot = $('.filter-fx-slot', root), filterFxType = $('.filter-fx-type', root);
  const syncFilterFxType = () => { filterFxType.value = engine.filterFxPresets[deck.filterFxSlot] || 'off'; };
  filterFxSlot.onchange = event => { deck.setFilterFXSlot(Number(event.target.value)); syncFilterFxType(); scheduleSessionSave(); };
  filterFxType.onchange = event => { const presets = [...engine.filterFxPresets]; presets[deck.filterFxSlot] = event.target.value; engine.setFilterFxPresets(presets); syncAllFilterFxControls(); scheduleSessionSave(); };
  syncFilterFxType();
  $('.cross-assign', root).onchange = event => engine.assignCrossfader(id, event.target.value);
  $$('.eq', root).forEach(input => {
    input.oninput = () => { deck.setEQ(input.dataset.band, Number(input.value)); $('output', input.parentElement).textContent = `${Number(input.value)>0?'+':''}${input.value} dB`; };
    input.ondblclick = () => { input.value = 0; input.dispatchEvent(new Event('input')); };
  });
  $$('.eq-kill', root).forEach(button => {
    button.onclick = () => {
      const band = button.dataset.killBand, active = deck.setEQKill(band, button.getAttribute('aria-pressed') !== 'true');
      button.setAttribute('aria-pressed', String(active)); button.classList.toggle('active', active); scheduleSessionSave();
    };
  });
  const filter = $('.filter', root);
  filter.oninput = () => { deck.setFilter(Number(filter.value)/100); $('output', filter.parentElement).textContent = Number(filter.value) === 0 ? 'OFF' : `${filter.value < 0 ? 'LP' : 'HP'} ${Math.abs(filter.value)}`; };
  filter.ondblclick = () => { filter.value = 0; filter.dispatchEvent(new Event('input')); };
  $('.channel-volume', root).oninput = event => { deck.setVolume(Number(event.target.value)/100); $('.volume-readout', root).textContent = `${event.target.value}%`; $('.fader-area', root).style.setProperty('--volume', Number(event.target.value)/100); };
  $('.auto-gain', root).onclick = async () => {
    if (!deck.buffer || !deck.track) return toast('先载入一首音乐');
    const gain = estimateAutoGain(deck.buffer);
    engine.decks.forEach(other => { if (other.track?.id === deck.track.id) other.setAutoGain(gain, false); });
    deck.track.autoGain = gain; deck.track.autoGainEstimated = true;
    try { await saveTrack(serializableTrack(deck.track)); }
    catch { toast('自动增益已在本次会话生效，但保存失败'); }
    engine.decks.forEach((other, otherId) => { if (other.track?.id === deck.track.id) refreshDeck(otherId); });
    toast(`${'ABCD'[id]} 台自动增益 ${gain.toFixed(2)}×`);
  };
});

function syncAllFilterFxControls() {
  $$('.mixer-channel').forEach((root, id) => {
    const deck = engine.decks[id], slot = $('.filter-fx-slot', root), type = $('.filter-fx-type', root);
    if (!slot || !type) return;
    slot.value = String(deck.filterFxSlot);
    type.value = engine.filterFxPresets[deck.filterFxSlot] || 'off';
  });
  [0,1,2,3].forEach(index => { const control = $(`#filter-fx-preset-${index}`); if (control) control.value = engine.filterFxPresets[index] || 'off'; });
}
$('#crossfader').oninput = event => engine.setCrossfader(Number(event.target.value)/100);
$('#center-crossfader').onclick = () => { $('#crossfader').value = 0; engine.setCrossfader(0); };
$('#crossfader').ondblclick = $('#center-crossfader').onclick;
$('#master').oninput = event => { engine.setMaster(Number(event.target.value)/100); $('#master-output').textContent = `${event.target.value}%`; };

function setupMixerSettings() {
  const dialog = $('#mixer-settings-dialog');
  const headroom = $('#master-headroom'), limiter = $('#master-limiter'), curve = $('#crossfader-curve'), hamster = $('#crossfader-hamster'), lower = $('#gain-lower'), upper = $('#gain-upper');
  const presetControls = [0,1,2,3].map(index => $(`#filter-fx-preset-${index}`));
  const refresh = () => {
    $('#master-headroom-value').textContent = `${Number(headroom.value) > 0 ? '+' : ''}${headroom.value} dB`;
    $('#crossfader-curve-value').textContent = Number(curve.value) < 33 ? '慢' : Number(curve.value) > 66 ? '快' : '标准';
    $('#gain-lower-value').textContent = `${Number(lower.value) > 0 ? '+' : ''}${lower.value} dB`;
    $('#gain-upper-value').textContent = `+${upper.value} dB`;
  };
  const apply = () => {
    engine.setHeadroom(Number(headroom.value));
    engine.setLimiterEnabled(limiter.checked);
    engine.setCrossfaderCurve(Number(curve.value) / 100);
    engine.setCrossfaderHamster(hamster.checked);
    if (Number(lower.value) <= Number(upper.value)) engine.setAutoGainLimits(Number(lower.value), Number(upper.value));
    engine.setFilterFxPresets(presetControls.map(control => control.value));
    syncAllFilterFxControls();
    refresh(); scheduleSessionSave();
  };
  [headroom, limiter, curve, hamster, lower, upper, ...presetControls].forEach(control => control.addEventListener(control.type === 'range' ? 'input' : 'change', apply));
  $('#mixer-settings').onclick = () => { refresh(); dialog.showModal(); };
  $('#mixer-settings-close').onclick = () => dialog.close();
  presetControls.forEach((control, index) => control.value = engine.filterFxPresets[index]);
  refresh();
}

function sessionSnapshot() {
  return {
    version: 3,
    crossfader: Number($('#crossfader').value), master: Number($('#master').value),
    channels: engine.decks.map((deck, id) => {
      const root = $(`[data-channel="${id}"]`);
      return { volume: Number($('.channel-volume', root).value), high: Number($('.eq[data-band="high"]', root).value), mid: Number($('.eq[data-band="mid"]', root).value), low: Number($('.eq[data-band="low"]', root).value), eqKills: { ...deck.eqKills }, filter: Number($('.filter', root).value), filterFxSlot: deck.filterFxSlot, assignment: $('.cross-assign', root).value, autoGain: deck.autoGain };
    }),
    effectRacks: engine.effectRacks.map(rack => rack.snapshot()),
    stems: engine.decks.map(deck => deck.stems.snapshot()),
    mixerSettings: { headroom: engine.headroomDb, limiter: engine.limiterEnabled, crossfaderCurve: engine.crossfaderCurve, hamster: engine.crossfaderHamster, gainLowerDb: engine.autoGainLimits.lowerDb, gainUpperDb: engine.autoGainLimits.upperDb, filterFxPresets: [...engine.filterFxPresets] },
    deckOptions: engine.decks.map(deck => ({ effectPosition: deck.effectPosition, effectRack: deck.effectRackIndex, effectAssignments: deck.effects.assignment, faderStart: deck.faderStart, tempoRange: deck.tempoRange })),
  };
}
function scheduleSessionSave() {
  if (restoringSession) return;
  clearTimeout(sessionSaveTimer);
  sessionSaveTimer = setTimeout(() => {
    const snapshot = sessionSnapshot();
    sessionWrite = sessionWrite.catch(() => {}).then(() => setting('session:mixer', snapshot));
  }, 120);
}
function restoreSessionValue(selector, value, event = 'input') {
  if (value == null || !Number.isFinite(Number(value))) return;
  const input = $(selector); if (!input) return;
  input.value = String(value); input.dispatchEvent(new Event(event, { bubbles: true }));
}
async function restoreSession(savedSession) {
  try {
    const saved = savedSession === undefined ? await setting('session:mixer') : savedSession;
    if (!saved || ![1, 2, 3].includes(saved.version)) return;
    restoreSessionValue('#crossfader', saved.crossfader);
    restoreSessionValue('#master', saved.master);
    if (saved.mixerSettings && typeof saved.mixerSettings === 'object') {
      const state = saved.mixerSettings;
      const set = (selector, value, event = 'input') => { if (value == null || !$(selector)) return; $(selector).value = String(value); $(selector).dispatchEvent(new Event(event, { bubbles: true })); };
      set('#master-headroom', Number.isFinite(Number(state.headroom)) ? state.headroom : 0);
      if (typeof state.limiter === 'boolean') { $('#master-limiter').checked = state.limiter; $('#master-limiter').dispatchEvent(new Event('change', { bubbles: true })); }
      set('#crossfader-curve', Number.isFinite(Number(state.crossfaderCurve)) ? Number(state.crossfaderCurve) * 100 : 50);
      if (typeof state.hamster === 'boolean') { $('#crossfader-hamster').checked = state.hamster; $('#crossfader-hamster').dispatchEvent(new Event('change', { bubbles: true })); }
      set('#gain-lower', Number.isFinite(Number(state.gainLowerDb)) ? state.gainLowerDb : -20);
      set('#gain-upper', Number.isFinite(Number(state.gainUpperDb)) ? state.gainUpperDb : 12);
      if (Array.isArray(state.filterFxPresets)) state.filterFxPresets.slice(0, 4).forEach((value, index) => {
        const control = $(`#filter-fx-preset-${index}`);
        if (control && FILTER_FX_TYPES[value]) { control.value = value; control.dispatchEvent(new Event('change', { bubbles: true })); }
      });
    }
    if (Array.isArray(saved.channels)) saved.channels.slice(0, 4).forEach((channel, id) => {
      if (!channel || typeof channel !== 'object') return;
      restoreSessionValue(`[data-channel="${id}"] .channel-volume`, channel.volume);
      if (Number.isFinite(Number(channel.autoGain))) engine.decks[id].setAutoGain(channel.autoGain, false);
      restoreSessionValue(`[data-channel="${id}"] .eq[data-band="high"]`, channel.high);
      restoreSessionValue(`[data-channel="${id}"] .eq[data-band="mid"]`, channel.mid);
      restoreSessionValue(`[data-channel="${id}"] .eq[data-band="low"]`, channel.low);
      if (channel.eqKills && typeof channel.eqKills === 'object') Object.entries(channel.eqKills).forEach(([band, value]) => {
        const button = $(`[data-channel="${id}"] .eq-kill[data-kill-band="${band}"]`);
        if (button && value) button.click();
      });
      restoreSessionValue(`[data-channel="${id}"] .filter`, channel.filter);
      if (Number.isInteger(Number(channel.filterFxSlot))) {
        const select = $(`[data-channel="${id}"] .filter-fx-slot`);
        if (select) { select.value = String(channel.filterFxSlot); select.dispatchEvent(new Event('change', { bubbles: true })); }
      }
      if (['left', 'right', 'thru'].includes(channel.assignment)) {
        const select = $(`[data-channel="${id}"] .cross-assign`); select.value = channel.assignment; select.dispatchEvent(new Event('change', { bubbles: true }));
      }
    });
    if (Array.isArray(saved.effectRacks)) saved.effectRacks.slice(0, 2).forEach((states, index) => engine.effectRacks[index].restore(states));
    // Migrate the pre-rack session format: all four deck arrays represented
    // independent slots, so preserve deck A's and B's settings as the two
    // shared rack defaults when no new rack snapshot exists.
    if (!Array.isArray(saved.effectRacks) && Array.isArray(saved.effects)) {
      saved.effects.slice(0, 2).forEach((states, index) => engine.effectRacks[index].restore(states));
    }
    if (Array.isArray(saved.stems)) saved.stems.slice(0, 4).forEach((state, id) => {
      if (state && typeof state === 'object') { engine.decks[id].stems.restore(state); $$('.stem-row', $(`[data-deck="${id}"]`)).forEach(row => { const channel = engine.decks[id].stems.get(row.dataset.stem); $('.stem-level', row).value = Math.round(channel.level * 100); $('.stem-mute', row).classList.toggle('active', channel.muted); $('.stem-mute', row).setAttribute('aria-pressed', String(channel.muted)); $('.stem-solo', row).classList.toggle('active', channel.solo); $('.stem-solo', row).setAttribute('aria-pressed', String(channel.solo)); }); }
    });
    if (Array.isArray(saved.deckOptions)) saved.deckOptions.slice(0, 4).forEach((state, id) => {
      if (!state || typeof state !== 'object') return;
      const deck = engine.decks[id];
      deck.setEffectPosition(state.effectPosition);
      if (Number.isInteger(Number(state.effectRack))) deck.setEffectRack(state.effectRack);
      if (Array.isArray(state.effectAssignments)) deck.effects.setAssignments(state.effectAssignments);
      deck.setFaderStart(state.faderStart);
      if ([6, 8, 10, 12, 16, 20, 25, 33, 50, 100].includes(Number(state.tempoRange))) deck.setTempoRange(Number(state.tempoRange));
      const root = $(`[data-deck="${id}"]`);
      if ($('.fader-start', root)) $('.fader-start', root).checked = deck.faderStart;
      if ($('.fx-position', root)) $('.fx-position', root).value = deck.effectPosition;
      if ($('.tempo-range', root)) { $('.tempo-range', root).value = String(deck.tempoRange); $('.tempo', root).min = String(-deck.tempoRange); $('.tempo', root).max = String(deck.tempoRange); }

    });
    performance.refreshEffects();
  } catch { /* A missing or damaged session is equivalent to the defaults. */ }
  finally { restoringSession = false; }
}
function wireSessionPersistence() {
  ['#crossfader', '#master', '#master-headroom', '#master-limiter', '#crossfader-curve', '#crossfader-hamster', '#gain-lower', '#gain-upper', ...engine.decks.flatMap((_, id) => [`[data-channel="${id}"] .channel-volume`, `[data-channel="${id}"] .filter`, `[data-channel="${id}"] .eq[data-band="high"]`, `[data-channel="${id}"] .eq[data-band="mid"]`, `[data-channel="${id}"] .eq[data-band="low"]`, `[data-channel="${id}"] .eq-kill`])].forEach(selector => {
    const control = $(selector); if (control) { control.addEventListener('input', scheduleSessionSave); control.addEventListener('change', scheduleSessionSave); }
  });
  engine.decks.forEach((_, id) => {
    $(`[data-channel="${id}"] .cross-assign`)?.addEventListener('change', scheduleSessionSave);
    const fxRack = $(`[data-deck="${id}"] .fx-rack`);
    fxRack?.addEventListener('click', scheduleSessionSave);
    fxRack?.addEventListener('change', scheduleSessionSave);
    fxRack?.addEventListener('input', scheduleSessionSave);
    $$('.stems-panel', $(`[data-deck="${id}"]`)).forEach(panel => ['click', 'change', 'input'].forEach(type => panel.addEventListener(type, scheduleSessionSave)));
  });
}

function serializableTrack(track) {
  const { buffer, ...record } = track;
  return record;
}

async function importFiles(files) {
  if (importing) { toast('正在导入上一批音乐，请稍候'); return []; }
  importing = true;
  const added = [];
  try {
    for (const file of files) {
      if (!file.type.startsWith('audio/') && !/\.(mp3|wav|flac|m4a|aac|aif|aiff|ogg|opus|webm)$/i.test(file.name)) { toast(`「${file.name}」不是支持的音频文件`); continue; }
      if (file.size > 150 * 1024 * 1024) { toast(`「${file.name}」超过 150 MB，请选择较小文件`); continue; }
      const id = `${file.name}-${file.size}-${file.lastModified}`;
      const existing = tracks.find(track => track.id === id);
      if (existing) { added.push(existing); continue; }
      $('#audio-status').innerHTML = '<i></i>正在分析音频…';
      try {
        const [buffer, metadata] = await Promise.all([engine.decode(file), readMetadata(file)]);
        const estimate = metadata.tagBpm ? { bpm: metadata.tagBpm, confidence: 1 } : estimateBPM(buffer);
        const grid = estimateFirstBeat(buffer, estimate.bpm), dynamic = estimateDynamicBeatGrid(buffer, estimate.bpm, grid.offset), key = metadata.key ? { key: metadata.key, confidence: 1 } : estimateKey(buffer);
        const autoGain = estimateAutoGain(buffer), autoHotcues = estimateAutoHotcues(buffer, estimate.bpm, grid.offset);
        const track = { ...metadata, id, file, title: metadata.title || file.name.replace(/\.[^.]+$/, ''), artist: metadata.artist || '本地导入', genre: metadata.genre || '本地音频', duration: buffer.duration, bpm: estimate.bpm, estimated: !metadata.tagBpm && !!estimate.bpm, confidence: estimate.confidence, key: key.key, keyEstimated: !metadata.key && !!key.key, keyConfidence: key.confidence, autoGain, autoGainEstimated: true, autoHotcues, annotations: { gridOffset: grid.offset, beatGrid: dynamic.beatGrid, hotcues: autoHotcues }, gridEstimated: grid.confidence > 0, gridSegments: dynamic.segments, addedAt: Date.now() };
        tracks.push(track); added.push(track); library.catalog.apply();
        try { await saveTrack(track); } catch { toast('已导入；浏览器缓存空间不足，刷新后可能需要重新导入'); }
      } catch { toast(`「${file.name}」无法解码，请尝试 MP3 或 WAV 格式`); }
      await new Promise(resolve => setTimeout(resolve, 0));
    }
    if (added.length) toast(`已加入 ${added.length} 首音乐 · 点击 A / B 载入`);
    return added;
  } finally {
    importing = false; $('#audio-status').innerHTML = '<i></i>音频已就绪';
  }
}

$$('.import-button').forEach(button => button.onclick = () => $('#file-input').click());
$('#file-input').onchange = async event => { await importFiles(event.target.files); event.target.value = ''; };
$('#library-nav').onclick = () => $('#library').scrollIntoView({ behavior: 'smooth' });
$('#help').onclick = () => $('#help-dialog').showModal();
$('#close-help').onclick = $('#start-mixing').onclick = () => $('#help-dialog').close();
$$('dialog').forEach(dialog => dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close(); } }));

let dragDepth = 0;
document.addEventListener('dragenter', event => { if ([...event.dataTransfer.types].includes('Files')) { dragDepth++; $('#drop-overlay').classList.add('visible'); } });
document.addEventListener('dragleave', () => { if (--dragDepth <= 0) { dragDepth = 0; $('#drop-overlay').classList.remove('visible'); } });
document.addEventListener('dragover', event => event.preventDefault());
document.addEventListener('drop', async event => { event.preventDefault(); dragDepth = 0; $('#drop-overlay').classList.remove('visible'); await importFiles(event.dataTransfer.files); });
document.addEventListener('keydown', event => {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') { event.preventDefault(); $('#search').focus(); return; }
  if (event.metaKey || event.ctrlKey || event.altKey || $('dialog[open]') || ['INPUT', 'TEXTAREA', 'SELECT'].includes(event.target.tagName) || event.repeat) return;
  if (event.code === 'Space' && event.target.tagName === 'BUTTON') return;
  if (event.shiftKey && event.key.toLowerCase() === 'b') { event.preventDefault(); void tapBpm(selectedDeck); return; }
  if (event.shiftKey && event.key.toLowerCase() === 's') { event.preventDefault(); const deck = engine.decks[selectedDeck]; deck.setScratchMode(!deck.scratchMode); toast(`${'ABCD'[selectedDeck]} 台 Scratch ${deck.scratchMode ? '已开启' : '已关闭'}`); return; }
  if (event.shiftKey && event.key.toLowerCase() === 'r') { event.preventDefault(); const deck = engine.decks[selectedDeck]; deck.setReverse(!deck.reverse); refreshDeck(selectedDeck); return; }
  if (event.shiftKey && ['ArrowLeft', 'ArrowRight'].includes(event.key)) {
    event.preventDefault(); const id = event.key === 'ArrowLeft' ? 0 : 1, track = tracks.find(item => item.id === library.selectedId);
    if (track) { selectDeck(id); void loadDeck(id, track); }
    else toast('先在曲库选中一首音乐');
    return;
  }
  if (event.key.toLowerCase() === 'a') { selectDeck(0); $('[data-deck="0"]').focus(); }
  if (event.key.toLowerCase() === 'b') { event.preventDefault(); void tapBpm(selectedDeck); return; }
  if (['c','d'].includes(event.key.toLowerCase())) { const id = 'abcd'.indexOf(event.key.toLowerCase()); setLayout(deckLayout.startsWith('four') ? deckLayout : 'four'); selectDeck(id); $(`[data-deck="${id}"]`).focus(); }
  if (event.code === 'Space') {
    event.preventDefault();
    if (document.activeElement.closest?.('#library')) { library.toggleBrowser(); return; }
    togglePlay(selectedDeck);
  }
  if (event.key === 'ArrowLeft') { event.preventDefault(); engine.decks[selectedDeck].beatJump(-1); }
  if (event.key === 'ArrowRight') { event.preventDefault(); engine.decks[selectedDeck].beatJump(1); }
  if (event.key === 'ArrowUp') { event.preventDefault(); library.moveSelection(-1); return; }
  if (event.key === 'ArrowDown') { event.preventDefault(); library.moveSelection(1); return; }
  if (event.key === '-' || event.key === '_') { event.preventDefault(); waveZoom[selectedDeck] = Math.min(6, waveZoom[selectedDeck] + 1); return; }
  if (event.key === '+' || event.key === '=') { event.preventDefault(); waveZoom[selectedDeck] = Math.max(0, waveZoom[selectedDeck] - 1); return; }
  if (/^Digit[1-8]$/.test(event.code)) { event.preventDefault(); performance.pads.press(selectedDeck, Number(event.code.slice(-1))-1, `digit:${event.code}`, event.shiftKey); }
  if (event.key.toLowerCase() === 'l') { engine.decks[selectedDeck].toggleLoop(loopBeats[selectedDeck]); updateLoop(selectedDeck); }
});
document.addEventListener('keyup', event => {
  if (/^Digit[1-8]$/.test(event.code)) engine.decks.forEach((_, id) => performance.pads.releaseKey(id, `digit:${event.code}`));
});

const recording = setupRecording({engine,toast,time});
// Annotation writes are awaited by every editing action before the UI commits
// the visible change. A beforeunload confirmation cannot wait for IndexedDB
// and turns ordinary reloads into a navigation deadlock, so do not block the
// browser here.

function drawWave(canvas, deck, color) {
  const rect = canvas.getBoundingClientRect(), dpr = Math.min(devicePixelRatio || 1, 2);
  const width = Math.round(rect.width * dpr), height = Math.round(rect.height * dpr);
  if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, width, height);
  if (!deck.peaks || !deck.buffer) return;
  const duration = deck.buffer.duration;
  const zoom = 1 + waveZoom[deck.id] * 0.5;
  const visibleDuration = duration / zoom;
  const visibleStart = Math.max(0, Math.min(duration - visibleDuration, deck.position - visibleDuration / 2));
  const progress = Math.max(0, Math.min(1, (deck.position - visibleStart) / visibleDuration));
  const xFor = seconds => (seconds - visibleStart) / visibleDuration * width;
  ctx.fillStyle = `${color}09`; ctx.fillRect(0, 0, width * progress, height);
  const beat = deck.beatDurationAt();
  ctx.strokeStyle = '#ffffff0c'; ctx.lineWidth = 1;
  ctx.strokeStyle = '#ffffff0c'; ctx.lineWidth = 1;
  for (const segment of deck.beatGrid) {
    const step = 60 / segment.bpm, end = deck.beatGrid[deck.beatGrid.indexOf(segment) + 1]?.start ?? duration;
    for (let t = segment.offset; t < end; t += step) { if (t < visibleStart || t > visibleStart + visibleDuration) continue; const x = xFor(t); ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); }
  }
  if (deck.loop) { ctx.fillStyle = `${color}25`; ctx.fillRect(xFor(deck.loop.start), 0, (deck.loop.end-deck.loop.start) / visibleDuration * width, height); }
  const step = 3 * dpr, bars = Math.floor(width/step);
  for (let i = 0; i < bars; i++) {
    const sample = visibleStart / duration + i / bars * visibleDuration / duration;
    const peakIndex = Math.min(deck.peaks.length - 1, Math.max(0, Math.floor(sample * deck.peaks.length)));
    const amp = deck.peaks[peakIndex];
    const barHeight = Math.max(2, amp ** 0.65 * height * 0.87);
    const completed = i / bars < progress;
    const spectrumIndex = peakIndex * 3;
    const low = deck.spectrum?.[spectrumIndex] ?? amp;
    const mid = deck.spectrum?.[spectrumIndex + 1] ?? amp;
    const high = deck.spectrum?.[spectrumIndex + 2] ?? amp;
    const x = i * step, barWidth = Math.max(1, step - dpr);
    // The original has a frequency-aware OpenGL texture. Three stacked bands
    // preserve that visual cue while keeping the amplitude silhouette and
    // seek/marker overlays unchanged.
    const lowHeight = Math.max(1, Math.min(barHeight, barHeight * (0.25 + low * 0.75)));
    const midHeight = Math.max(1, Math.min(barHeight, barHeight * (0.2 + mid * 0.8)));
    const highHeight = Math.max(1, Math.min(barHeight, barHeight * (0.15 + high * 0.85)));
    ctx.fillStyle = completed ? '#78bdca99' : '#78bdca';
    ctx.fillRect(x, height / 2, barWidth, lowHeight / 2);
    ctx.fillStyle = completed ? `${color}aa` : color;
    ctx.fillRect(x, (height - midHeight) / 2, barWidth, midHeight);
    ctx.fillStyle = completed ? '#f2d28b99' : '#f2d28b';
    ctx.fillRect(x, (height - highHeight) / 2, barWidth, highHeight / 3);
  }
  deck.hotcues.forEach((point, i) => { if (point !== null && point >= visibleStart && point <= visibleStart + visibleDuration) { const x = xFor(point); ctx.fillStyle = color; ctx.fillRect(x, 0, dpr, height); ctx.font = `${9*dpr}px monospace`; ctx.fillText(`${i+1}`, x+3*dpr, 11*dpr); } });
  if (deck.performance.gesture || deck.performance.loopSlip || deck.performance.slipCue || deck.performance.scratchSlip) {
    const x = xFor(deck.performance.backgroundPosition);
    ctx.save(); ctx.strokeStyle = '#d8e79b'; ctx.setLineDash([3*dpr, 3*dpr]);
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke(); ctx.restore();
  }
  ctx.fillStyle = '#f6f7f8'; ctx.fillRect(progress*width, 0, 1.5*dpr, height);
  ctx.beginPath(); ctx.moveTo(progress*width-4*dpr, 0); ctx.lineTo(progress*width+4*dpr, 0); ctx.lineTo(progress*width, 5*dpr); ctx.fill();
}

let frame = 0;
const masterData = new Float32Array(engine.analyser.fftSize);
function animate() {
  requestAnimationFrame(animate);
  frame++;
  if (document.hidden || frame % 2) return;
  engine.decks.forEach((deck, id) => {
    const root = $(`[data-deck="${id}"]`), position = deck.position;
    if (id < 2) vj.syncDeck(deck, id);
    root.classList.toggle('playing', deck.playing);
    root.classList.toggle('reversing', deck.reverse);
    const reverseButton = $('.reverse-button', root);
    reverseButton.classList.toggle('active', deck.reverse);
    reverseButton.setAttribute('aria-pressed', String(deck.reverse));
    reverseButton.textContent = deck.reverse ? 'REV ON' : 'REV';
    const button = $('.play-button', root);
    if (button.dataset.playing !== String(deck.playing)) {
      button.dataset.playing = String(deck.playing); button.innerHTML = `${icon(deck.playing?'pause':'play')}<span>${deck.playing?'暂停':'播放'}</span>`; button.setAttribute('aria-label', `${deck.playing?'暂停':'播放'} ${'ABCD'[id]}`);
    }
    $('.deck-state', root).textContent = `DECK ${'ABCD'[id]} · ${deck.playing?'ON AIR':'READY'}${deck.reverse ? ' · REV' : ''}`;
    $('.elapsed', root).textContent = time(position);
    $('.remaining', root).textContent = `−${time((deck.buffer?.duration || 0)-position)}`;
    const bpm = deck.musicalBpm.toFixed(1).split('.');
    if ($('.bpm-value', root).dataset.bpm !== bpm.join('.')) { $('.bpm-value', root).innerHTML = `${bpm[0]}<span>.${bpm[1]}</span>`; $('.bpm-value', root).dataset.bpm = bpm.join('.'); }
    if (document.activeElement !== $('.tempo', root)) $('.tempo', root).value = ((deck.rate - 1) * 100).toFixed(1);
    const syncButton = $('.sync-button', root);
    if (syncButton?.getAttribute('aria-pressed') !== String(deck.syncEnabled)) {
      syncButton?.classList.toggle('active', deck.syncEnabled);
      syncButton?.setAttribute('aria-pressed', String(deck.syncEnabled));
      const label = $('span', syncButton); if (label) label.textContent = deck.syncEnabled ? '持续同步' : '速度同步';
    }
    const grid = deck.beatGridAt(position), beat = ((Math.floor((position-grid.offset)/(60/grid.bpm))%4)+4)%4;
    $$('.beat-dots i', root).forEach((dot,i) => dot.classList.toggle('lit', deck.playing && beat === i));
    if (document.activeElement !== $('.seek', root)) $('.seek', root).value = deck.buffer ? position/deck.buffer.duration*1000 : 0;
    previewState.meters[id] = deck.meter();
    const level = clamp((20*Math.log10(previewState.meters[id]+0.00001)+48)/48, 0, 1);
    $(`[data-channel="${id}"] .channel-meter div`).style.height = `${level*100}%`;
    if (frame % 4 === 0 && root.getBoundingClientRect().width > 0) drawWave($('.waveform',root), deck, ['#a9dba0','#f4ad6b','#89c8e7','#c9a6e8'][id]);
    $(`[data-deck-status="${id}"]`).textContent = `${'ABCD'[id]} · ${deck.playing ? '播放中' : deck.track ? '就绪' : '空台'}`;
    $(`[data-deck-status="${id}"]`).classList.toggle('active', deck.playing);
    if (frame % 12 === 0) updateLoop(id);
  });
  if (deckLayout === 'prepare' && frame % 12 === 0) renderLayoutModePanel();
  engine.analyser.getFloatTimeDomainData(masterData);
  const rms = Math.sqrt(masterData.reduce((sum,x)=>sum+x*x,0)/masterData.length);
  $('.master-meter div').style.width = `${clamp((20*Math.log10(rms+0.00001)+48)/48,0,1)*100}%`;

}

async function init() {
  $('#app').inert = true;
  const savedSession = setting('session:mixer').catch(() => null);
  // The demo decks are the safe boot path. IndexedDB, an old catalog record,
  // or a persisted VJ file must not keep the transport on an empty screen.
  try { const saved = await Promise.race([setting('deck-layout'), new Promise(resolve => setTimeout(() => resolve(null), 1200))]); if (saved) setLayout(saved); } catch { /* Default layout remains usable. */ }
  $('#sample-rate').textContent = (engine.context.sampleRate/1000).toString();
  const demoDetails = [
    { id: 'demo-night-drive', title: 'Night Drive', artist: 'MIXDESK Originals · 合成演示', genre: 'Deep House', bpm: 120, demo: 0 },
    { id: 'demo-after-hours', title: 'After Hours', artist: 'MIXDESK Originals · 合成演示', genre: 'Minimal House', bpm: 124, demo: 1 },
  ];
  for (const track of demoDetails) { track.buffer = createDemo(engine.context,track.demo); track.duration = track.buffer.duration; tracks.push(track); }
  await Promise.all([loadDeck(0,tracks[0]), loadDeck(1,tracks[1])]);
  // Read the session while loading, then apply it after Deck.load has set its
  // defaults. Keep controls inert until then so early edits cannot be lost.
  await restoreSession((await savedSession) || null);
  $('#app').inert = false;
  renderLayoutModePanel(); renderLibrary(); animate();
  const historyTimer = setInterval(() => history.tick(), 250);
  window.addEventListener('pagehide', () => clearInterval(historyTimer), { once: true });

  // Restore optional state after the primary transport is usable. Each stage
  // is bounded so a damaged IndexedDB value cannot block the workstation.
  void (async () => {
    try {
      const stored = await Promise.race([storedTracks(), new Promise(resolve => setTimeout(() => resolve([]), 2500))]);
      if (stored?.length) { tracks.push(...stored); renderLibrary(); }
    } catch { toast('浏览器缓存不可用，导入的音乐仅在本次会话保留'); }
    try { await Promise.race([library.catalog.load(), new Promise(resolve => setTimeout(resolve, 2500))]); renderLibrary(); }
    catch { toast('曲库分类缓存不可用，请检查浏览器存储'); }
    try { await Promise.race([vj.restore(), new Promise(resolve => setTimeout(resolve, 2500))]); }
    catch { toast('VJ 会话恢复失败，视频仍可重新载入'); }
  })();
}

const library = setupLibrary({
  tracks, engine, toast, icon, time, metadataChanged,
  load: async (id, track) => { if (id > 1) setLayout(deckLayout.startsWith('four') ? deckLayout : 'four'); selectDeck(id); await loadDeck(id, track); renderLayoutModePanel(); },
  remove: async track => {
    await removeTrack(track.id); tracks.splice(tracks.indexOf(track), 1);
    toast('已从音乐库移除；已载入的播放器仍可继续播放');
  },
  reread: async (track, catalog) => {
    const metadata = await readMetadata(track.file);
    if (!metadata.tagsRead) throw new Error('此文件的标签无法读取');
    const patch = Object.fromEntries(['title','artist','album','genre','key','year','comment'].map(key => [key, metadata[key]]));
    patch.title ||= track.file.name.replace(/\.[^.]+$/, '');
    if (metadata.tagBpm) patch.bpm = metadata.tagBpm;
    // Commit file-derived artwork first, then the editable catalog overlay.
    const updated = { ...serializableTrack(track), artwork: metadata.artwork, formatInfo: metadata.formatInfo, tagsRead: true };
    await saveTrack(updated);
    Object.assign(track, updated); await catalog.metadata(track.id, patch);
  },
  relink: async (track, file) => {
    await relinkTrack({ engine, tracks, track, file,
      beforeApply: async () => { await annotationQueues.get(track.id); },
      refresh: refreshDeck,
    });
    metadataChanged();
  },
});
const history = new PlaybackHistory(engine, library.catalog, () => toast('播放历史暂时无法保存，将自动重试'));
const performance = setupPerformance({ engine, tracks, library, loadDeck, toast, saveAnnotations, refreshDeck, handleHotcue, analyzeDeckHotcues, scheduleSessionSave });
setupMixerSettings();
wireSessionPersistence();
// Diagnostics are available only in Vite development mode for real audio-path tests.
if (import.meta.env.DEV) window.__mixdesk = { engine, tracks, vj, vjOutput, previewState, estimateBPM, estimateFirstBeat, estimateDynamicBeatGrid, estimateKey, estimateAutoGain, estimateAutoHotcues, loadDeck, saveAnnotations, library, history, recording, ...performance };
init().catch(error => { $('#app').inert = false; console.error(error); toast('初始化失败，请刷新页面重试'); });
