import './performance.css';
import { EFFECT_TYPES } from './effects.js';
import { MixMidi, feedbackMessages } from './midi.js';
import { setupMonitor } from './monitor-ui.js';
import { setupPads } from './pad-ui.js';
import { setupSampler } from './sampler-ui.js';
import { STEM_DEFINITIONS } from './stems.js';

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const esc = value => String(value).replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[x]);

export function setupPerformance({ engine, tracks, library, loadDeck, toast, saveAnnotations, refreshDeck, handleHotcue, analyzeDeckHotcues = async () => false, scheduleSessionSave = () => {} }) {
  setupMonitor({ engine, toast });
  const deckRoot = id => $(`[data-deck="${id}"]`);
  const midiPickup = new Map();
  let midiApplyingTempo = false;
  engine.onRateManual = id => { if (!midiApplyingTempo) midiPickup.delete(`tempo:${id}`); };
  engine.onRateReset = id => midiPickup.delete(`tempo:${id}`);
  const slide = (selector, value) => { const input = $(selector); input.value = value; input.dispatchEvent(new Event('input', { bubbles: true })); };
  const click = (id, selector, shift = false) => $(selector, deckRoot(id)).dispatchEvent(new MouseEvent('click', { bubbles: true, shiftKey: shift }));
  const rackOptions = selected => Object.entries(EFFECT_TYPES).map(([value, name]) => `<option value="${value}" ${value === selected ? 'selected' : ''}>${name}</option>`).join('');
  const effectWetnessLabel = value => `${Math.round(Number(value) * 100)}%`;
  const renderEffects = (root, deck) => {
    const slotsRoot = $('.fx-slots', root);
    if (!slotsRoot) return;
    if (!slotsRoot.children.length) slotsRoot.innerHTML = deck.effects.slots.map((slot, index) => `<div class="fx-slot" data-fx="${index}">
      <button class="fx-enable" type="button" aria-pressed="${slot.enabled}" aria-label="${'ABCD'[deck.id]} 台效果 ${index + 1} 开关">FX${index + 1}</button>
      <select class="fx-type" aria-label="${'ABCD'[deck.id]} 台效果 ${index + 1} 类型">${rackOptions(slot.type)}</select>
      <label class="fx-amount-label">WET <input class="fx-amount" type="range" min="0" max="100" value="${Math.round(slot.amount * 100)}" aria-label="效果湿声比例"></label>
      <select class="fx-beats" aria-label="效果拍长"><option value="0.125">1/8</option><option value="0.25" ${slot.beats === 0.25 ? 'selected' : ''}>1/4</option><option value="0.5" ${slot.beats === 0.5 ? 'selected' : ''}>1/2</option><option value="1" ${slot.beats === 1 ? 'selected' : ''}>1</option><option value="2" ${slot.beats === 2 ? 'selected' : ''}>2</option><option value="4" ${slot.beats === 4 ? 'selected' : ''}>4</option></select>
    </div>`).join('');
    const wetness = deck.effects.getEffectBankWetness?.() ?? 1;
    $('.fx-bank-toggle', root).textContent = `RACK ${deck.effectRackIndex + 1} 编辑`;
    $('.fx-bank-label', root).textContent = `RACK ${deck.effectRackIndex + 1} · 三槽串联 · 可分配`;
    const wetnessControl = $('.fx-wetness', root);
    const wetnessReadout = $('.fx-wetness-readout', root);
    if (wetnessControl) wetnessControl.value = String(Math.round(wetness * 100));
    if (wetnessReadout) wetnessReadout.textContent = effectWetnessLabel(wetness);
    $$('.fx-assign', root).forEach(button => {
      const rack = Number(button.dataset.rack);
      button.classList.toggle('active', !!deck.effects.assignment?.[rack]);
      button.setAttribute('aria-pressed', String(!!deck.effects.assignment?.[rack]));
      button.onclick = () => { deck.effects.toggleAssignment(rack); renderEffects(root, deck); scheduleSessionSave(); };
    });
    $$('.fx-slot', root).forEach((row, index) => {
      const slot = deck.effects.slots[index];
      $('.fx-enable', row).onclick = () => { deck.effects.setEnabled(index, !deck.effects.slots[index].enabled); updateEffect(row, deck.effects.slots[index]); scheduleSessionSave(); };
      $('.fx-type', row).onchange = event => { deck.effects.setType(index, event.target.value); updateEffect(row, deck.effects.slots[index]); scheduleSessionSave(); };
      $('.fx-amount', row).oninput = event => { deck.effects.setAmount(index, Number(event.target.value) / 100); scheduleSessionSave(); };
      $('.fx-beats', row).onchange = event => { deck.effects.setTiming(index, deck.bpm * deck.rate, Number(event.target.value)); scheduleSessionSave(); };
      updateEffect(row, slot);
    });
    $('.fx-position', root).value = deck.effectPosition;
    if (wetnessControl) wetnessControl.oninput = event => {
      const value = deck.effects.setEffectBankWetness(Number(event.target.value) / 100);
      if (wetnessReadout) wetnessReadout.textContent = effectWetnessLabel(value);
      scheduleSessionSave();
    };
    $('.fx-reset', root).onclick = () => {
      deck.effects.resetEffects();
      renderEffects(root, deck);
      scheduleSessionSave();
    };
    $('.fx-bank-toggle', root).onclick = () => { deck.setEffectRack(deck.effectRackIndex ? 0 : 1); renderEffects(root, deck); scheduleSessionSave(); };
  };
  const updateStem = (row, channel) => {
    $('.stem-mute', row).classList.toggle('active', channel.muted);
    $('.stem-mute', row).setAttribute('aria-pressed', String(channel.muted));
    $('.stem-solo', row).classList.toggle('active', channel.solo);
    $('.stem-solo', row).setAttribute('aria-pressed', String(channel.solo));
    $('.stem-level', row).value = Math.round(channel.level * 100);
  };
  const updateAllStems = (root, deck) => $$('.stem-row', root).forEach(row => updateStem(row, deck.stems.get(row.dataset.stem)));

  engine.decks.forEach((deck, id) => {
    const root = deckRoot(id), label = 'ABCD'[id];
    const stemsMarkup = `<div class="stems-panel" aria-label="${label} 台频段控制"><div class="stems-heading"><span>频段控制 · ${label}</span><small>本地近似 · 非源分离</small></div>${STEM_DEFINITIONS.map(stem => `<div class="stem-row" data-stem="${stem.id}"><span>${stem.label}</span><input class="stem-level" type="range" min="0" max="150" value="100" aria-label="${label} 台${stem.label}音量"><button class="stem-mute" aria-pressed="false" aria-label="${label} 台静音${stem.label}">M</button><button class="stem-solo" aria-pressed="false" aria-label="${label} 台独奏${stem.label}">S</button></div>`).join('')}</div>`;
    $('.tempo-panel', root).insertAdjacentHTML('beforeend', `<label class="sync-source-label">同步 / 复制来源<select class="sync-source" aria-label="${label} 台同步来源">${engine.decks.filter(other => other !== deck).map(other => `<option value="${other.id}" ${other.id === deck.syncTarget ? 'selected' : ''}>${'ABCD'[other.id]} 台</option>`).join('')}</select></label>`);
    $('.sync-source', root).onchange = event => {
      const target = Number(event.target.value);
      if (!deck.setSyncTarget(target)) {
        event.target.value = String(deck.syncTarget);
        return toast('同步来源形成循环，无法切换');
      }
      refreshDeck(id);
    };
    $('.transport', root).insertAdjacentHTML('afterend', `<div class="key-controls"><button class="key-lock" aria-pressed="false" disabled title="变速时保持原始音高">KEY LOCK</button><label>移调 <select class="key-shift" aria-label="${label} 台移调" disabled>${Array.from({ length: 25 }, (_, i) => i - 12).map(n => `<option value="${n}" ${n === 0 ? 'selected' : ''}>${n > 0 ? '+' : ''}${n} 半音</option>`).join('')}</select></label><span class="key-status">加载音高处理…</span></div>`);
    engine.pitchReady.then(available => {
      $('.key-lock', root).disabled = !available; $('.key-shift', root).disabled = !available;
      $('.key-status', root).textContent = available ? '实时音高处理' : '当前浏览器不支持';
    });
    $('.key-lock', root).onclick = () => {
      deck.setPitch(!deck.keyLock); refreshDeck(id);
    };
    $('.key-shift', root).onchange = event => { deck.setPitch(deck.keyLock, Number(event.target.value)); refreshDeck(id); };
    $('.loop-row', root).insertAdjacentHTML('afterend', `<div class="performance-tools"><div class="jump-controls"><span>BEAT JUMP</span><button data-jump="-4" aria-label="${label} 台后退四拍">−4</button><button data-jump="4" aria-label="${label} 台前进四拍">+4</button></div><button class="quantize" aria-pressed="false" title="将新设置的 Cue 点吸附到拍网格">QUANTIZE</button><button class="phase-sync" title="依据当前拍网格对齐来源台的拍内相位">对齐拍点</button><button class="instant-double" title="从另一台复制曲目、进度、速度、Cue 与循环">复制来源台</button><label>提取到采样<select class="extract-slot" aria-label="${label} 台循环提取目标">${[0,1,2,3].map(index => `<option value="${index}">槽 ${index + 1}</option>`).join('')}</select></label><button class="extract-loop" title="将当前循环复制到采样器">提取当前循环</button><label class="fader-start-label"><input class="fader-start" type="checkbox"/>FADER START</label></div><details class="beatgrid-editor"><summary>拍网格校正 <span class="grid-label">首拍 0.000s</span></summary><div><button class="grid-set">当前位置设为首拍</button><button class="grid-back">−10ms</button><button class="grid-forward">+10ms</button><button class="grid-reset">重置为单段</button><button class="auto-hotcues" title="根据起音和拍网格生成最多八个 Hot Cue">自动生成 Hot Cue</button></div><div class="grid-segment-tools"><label>该段 BPM<input class="grid-bpm" type="number" min="30" max="300" step="0.1" value="${deck.bpm}" aria-label="${label} 台当前拍网格段 BPM"/></label><button class="grid-add-segment">在当前位置添加变拍段</button><button class="grid-remove-segment" disabled>移除当前段</button></div><p>先校正 BPM 和首拍。可在播放头位置添加变拍段；新段拍相位会对齐到前一段网格。</p></details><div class="fx-rack"><div class="fx-heading"><span>FX RACK · ${label}</span><button class="fx-bank-toggle" type="button" aria-label="${label} 台切换编辑效果组">RACK 1 编辑</button><div class="fx-assignments"><button class="fx-assign" type="button" data-rack="0" aria-label="${label} 台分配 Rack 1">R1</button><button class="fx-assign" type="button" data-rack="1" aria-label="${label} 台分配 Rack 2">R2</button></div><label class="fx-position-label">FX位置<select class="fx-position" aria-label="${label} 台 FX 位置"><option value="pre">前推子</option><option value="post">交叉推子后</option></select></label><label class="fx-wetness-label">BANK WET <input class="fx-wetness" type="range" min="0" max="100" value="100" aria-label="${label} 台当前效果组总湿声比例"><output class="fx-wetness-readout">100%</output></label><button class="fx-reset" type="button" aria-label="${label} 台重置当前效果组">重置 FX</button><small class="fx-bank-label">RACK 1 · 三槽串联 · 可分配</small></div><div class="fx-slots"></div></div>`);
    $('.beatgrid-editor', root).insertAdjacentHTML('afterend', stemsMarkup);
    $$('[data-jump]', root).forEach(button => button.onclick = () => deck.beatJump(Number(button.dataset.jump)));
    $('.quantize', root).onclick = () => { deck.quantize = !deck.quantize; refreshDeck(id); };
    $('.fader-start', root).onchange = event => { deck.setFaderStart(event.target.checked); scheduleSessionSave(); };
    $('.fx-position', root).onchange = event => { deck.setEffectPosition(event.target.value); scheduleSessionSave(); };
    renderEffects(root, deck);
    $('.phase-sync', root).onclick = () => {
      const source = engine.decks[deck.syncTarget];
      if (!deck.syncEnabled) click(id, '.sync-button');
      deck.alignPhase(source);
      refreshDeck(id);
    };
    $('.instant-double', root).onclick = async () => {
      const other = engine.decks[deck.syncTarget];
      if (!other.track) return;
      const sourceTrack = other.track;
      await loadDeck(id, sourceTrack);
      if (deck.track !== sourceTrack || other.track !== sourceTrack) return toast('曲目已变化，请重新复制');
      deck.bpm = other.bpm; deck.gridOffset = other.gridOffset; deck.beatGrid = other.beatGrid.map(segment => ({ ...segment })); deck.quantize = other.quantize;
      deck.hotcues = [...other.hotcues]; deck.hotcueMeta = other.hotcueMeta.map(meta => ({ ...meta })); deck.cuePoint = other.cuePoint;
      deck.savedLoops = other.savedLoops.map(loop => loop ? { ...loop } : null);
      deck.setRate(other.rate); deck.seek(other.position);
      deck.setPitch(other.keyLock, other.keyShift);
      deck.loop = other.loop && !other.loop.temporary ? { ...other.loop } : null;
      deck.setReverse(other.reverse);
      if (other.playing) await deck.play();
      refreshDeck(id); saveAnnotations(id);
      toast(`${label} 台已复制来源台的曲目和播放状态`);
    };
    const setGrid = value => {
      deck.moveBeatGrid(value);
      if (deck.loop) deck.toggleLoop();
      refreshDeck(id); saveAnnotations(id);
    };
    $('.grid-set', root).onclick = () => setGrid(deck.position);
    $('.grid-back', root).onclick = () => setGrid(deck.gridOffset - 0.01);
    $('.grid-forward', root).onclick = () => setGrid(deck.gridOffset + 0.01);
    $('.grid-reset', root).onclick = async () => { deck.moveBeatGrid(0); deck.beatGrid = [{ start: 0, offset: 0, bpm: deck.bpm }]; refreshDeck(id); await saveAnnotations(id); };
    $('.auto-hotcues', root).onclick = () => analyzeDeckHotcues(id);
    $('.grid-bpm', root).onchange = async event => { if (!deck.setBeatGridSegment(deck.position, Number(event.target.value))) return toast('BPM 必须在 30–300 之间'); refreshDeck(id); await saveAnnotations(id); };
    $('.grid-add-segment', root).onclick = async () => { const bpm = Number($('.grid-bpm', root).value); if (!deck.setBeatGridSegment(deck.position, bpm)) return toast('请先载入曲目，并输入 30–300 BPM'); refreshDeck(id); await saveAnnotations(id); toast(`${label} 台已添加变拍网格段`); };
    $('.grid-remove-segment', root).onclick = async () => { if (!deck.removeBeatGridSegment()) return; refreshDeck(id); await saveAnnotations(id); };
    $$('.stem-row', root).forEach(row => {
      const stem = row.dataset.stem, channel = deck.stems.get(stem);
      $('.stem-level', row).oninput = event => { deck.stems.setLevel(stem, Number(event.target.value) / 100); scheduleSessionSave(); };
      $('.stem-mute', row).onclick = () => { deck.stems.toggleMute(stem); updateStem(row, channel); scheduleSessionSave(); };
      $('.stem-solo', row).onclick = () => { deck.stems.toggleSolo(stem); updateAllStems(root, deck); scheduleSessionSave(); };
      updateStem(row, channel);
    });
  });

  const pads = setupPads({ engine, toast, saveAnnotations, refreshDeck, handleHotcue });

  function updateEffect(row, slot) {
    $('.fx-enable', row).classList.toggle('active', slot.enabled);
    $('.fx-enable', row).setAttribute('aria-pressed', String(slot.enabled));
    $('.fx-type', row).value = slot.type;
    const amount = $('.fx-amount', row), [min, max] = slot.paramLimits.get(0);
    amount.min = String(min * 100); amount.max = String(max * 100);
    amount.value = String(slot.amount * 100);
    const beats = $('.fx-beats', row), [low, high] = slot.paramLimits.get(1);
    [...beats.querySelectorAll('[data-custom]')].forEach(option => option.remove());
    if (![...beats.options].some(option => Number(option.value) === slot.beats)) {
      const option = new Option(String(slot.beats), String(slot.beats)); option.dataset.custom = 'true'; beats.add(option);
    }
    [...beats.options].forEach(option => { option.disabled = Number(option.value) < low || Number(option.value) > high; });
    beats.value = String(slot.beats);
    beats.disabled = !['echo', 'delay', 'tremolo', 'gater', 'loopRoll'].includes(slot.type);
  }
  const refreshEffects = () => engine.decks.forEach(deck => renderEffects(deckRoot(deck.id), deck));
  engine.effectRacks.forEach(rack => { rack.onchange = refreshEffects; });

  const samplerUI = setupSampler({engine,toast});
  engine.decks.forEach((deck, id) => {
    const root = deckRoot(id), button = $('.extract-loop', root);
    if (!button) return;
    button.onclick = async () => {
      const loop = deck.loop;
      if (!deck.buffer || !loop || loop.end <= loop.start) return toast('请先启用一个普通循环');
      const start = Math.max(0, Math.floor(loop.start * deck.buffer.sampleRate));
      const end = Math.min(deck.buffer.length, Math.ceil(loop.end * deck.buffer.sampleRate));
      if (end <= start) return toast('循环范围无效');
      const channels = Math.min(2, deck.buffer.numberOfChannels), copy = engine.context.createBuffer(channels, end - start, deck.buffer.sampleRate);
      for (let channel = 0; channel < channels; channel++) copy.getChannelData(channel).set(deck.buffer.getChannelData(channel).subarray(start, end));
      const target = Number($('.extract-slot', root).value) * 4;
      try { await samplerUI.loadBuffer(target, copy, `${'ABCD'[id]} Loop`, { mode: 'loop', bpm: deck.musicalBpm, deck:id }); toast(`${'ABCD'[id]} 台循环已提取到采样槽 ${Math.floor(target / 4) + 1}`); }
      catch (error) { toast(error.message || '循环提取失败'); }
    };
  });

  $('#help').insertAdjacentHTML('beforebegin', '<button id="midi-panel-button" class="midi-panel-button">控制器 <i></i></button>');
  document.body.insertAdjacentHTML('beforeend', `<dialog id="midi-dialog"><div class="dialog-heading"><div><span class="eyebrow">HERCULES DJCONTROL MIX</span><h2>连接你的控制器</h2></div><button id="midi-close" class="icon-button" aria-label="关闭控制器设置">×</button></div><p>使用系统已经识别的 MIDI 端口，支持 USB 或蓝牙传输。连接方式以设备实际提供的端口为准。</p><button id="midi-scan" class="primary-button">查找 MIDI 设备</button><div class="midi-port-fields"><label>控制输入<select id="midi-input" aria-label="MIDI 输入"><option value="">请先查找设备</option></select></label><label>灯光输出<select id="midi-output" aria-label="MIDI 输出"><option value="">不发送灯光反馈</option></select></label></div><p id="midi-status" role="status">未连接 · 点击查找设备后允许浏览器访问 MIDI</p><div class="midi-actions"><button id="midi-connect" class="primary-button" disabled>连接选定端口</button><button id="midi-disconnect">断开</button></div><div class="midi-monitor"><span id="midi-counters">接收 0 · 发送 0</span><code id="midi-last">等待控制消息</code></div><p>已映射：播放、Cue、Sync、4 个 Hot Cue、1/2/4/8 拍循环、每台 3 个 FX 开关、采样垫、音量、滤波、低频、变速、交叉推子、PFL 和耳机音量。播放与混音控制 A / B 台，采样垫控制 C / D 采样台的四组。连续旋钮按 MSB/LSB 配对读取为 14 位；普通 Jog 做临时弯音，Shift+Jog 做四拍跳转；Shift+触摸 Jog 浏览曲库，Load 将当前选中歌曲载入对应台。Scratch Jog 使用浏览器双向短音粒近似，无电机控制。</p><p>反馈按 DJUCED 的 MIX 映射实现，尚未完成真机验证。当前只列出 DJControl MIX 端口，MIX ULTRA 不使用此映射。</p></dialog>`);

  async function onAction(action) {
    const { deck: id, index, value } = action;
    if (action.action === 'play') return click(id, '.play-button');
    if (action.action === 'stop') return engine.decks[id].pause();
    if (action.action === 'cue') return engine.decks[id].cuePress();
    if (action.action === 'cueRelease') return engine.decks[id].cueRelease();
    if (action.action === 'scratchTouch') { const deck = engine.decks[id]; return action.active ? (deck.scratchMode && deck.scratchTouch(true)) : deck.scratchTouch(false); }
    if (action.action === 'scratchMove') { const deck = engine.decks[id]; return deck.scratchMode ? deck.scratchMove(action.value * 4 * deck.beatDurationAt()) : false; }
    if (action.action === 'scratchModeToggle') { const deck = engine.decks[id], enabled = !deck.scratchMode; if (!enabled) deck.scratchTouch(false); return deck.setScratchMode(enabled); }
    if (action.action === 'hotcueTab') {
      const select = $('.pad-mode', deckRoot(id));
      if (!select) return false;
      if (select.value !== 'hotcue') {
        select.value = 'hotcue';
        select.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return true;
    }
    if (action.action === 'pitchBend') return engine.decks[id].pitchBendBy(action.value);
    if (action.action === 'seekLoop') { const deck = engine.decks[id]; return deck.beatJump(action.beats * action.value); }
    if (action.action === 'sync') return click(id, '.sync-button');
    if (action.action === 'hotcue') {
      const deck = engine.decks[id];
      if (deck.performance.slipEnabled && deck.playing && deck.hotcues[index] !== null) return deck.performance.beginSlipCue(deck.hotcues[index], index, `midi:${id}:${index}`);
      return handleHotcue(id, index, false);
    }
    if (action.action === 'hotcueRelease') return engine.decks[id].performance.endSlipCue(`midi:${id}:${index}`);
    if (action.action === 'clearCue') return handleHotcue(id, index, true);
    if (action.action === 'effect') return click(id, `[data-fx="${index}"] .fx-enable`);
    if (action.action === 'sample') return samplerUI.pressGroup(index, 'midi:' + id + ':' + index, id + 2);
    if (action.action === 'sampleRelease') return samplerUI.releaseGroup(index, 'midi:' + id + ':' + index, id + 2);
    if (action.action === 'nextSamplerPage') return samplerUI.cycleNextPage(id);
    if (action.action === 'stopSample') return engine.sampler.stopGroup(index, id + 2);
    if (action.action === 'browserMove') return library.moveSelection(value);
    if (action.action === 'load') return library.loadSelected(id);
    if (action.action === 'loop') {
      const deck = engine.decks[id], wasSame = deck.loop?.beats === action.beats;
      if (deck.loop) deck.toggleLoop();
      if (!wasSame) deck.toggleLoop(action.beats);
      refreshDeck(id); return;
    }
    // Continuous MIDI values bypass integer HTML range controls so the
    // controller's 14-bit resolution reaches the audio graph intact.
    if (action.action === 'crossfader') { engine.setCrossfader(value); const input = $('#crossfader'); if (input) input.value = String(Math.round(value * 100)); return scheduleSessionSave(); }
    if (action.action === 'master') { engine.setMaster(value); const input = $('#master'); if (input) input.value = String(Math.round(value * 100)); $('#master-output').textContent = `${(value * 100).toFixed(1)}%`; return scheduleSessionSave(); }
    if (action.action === 'pfl') return engine.monitor.select(id, !engine.monitor.selected[id]);
    if (action.action === 'headphoneVolume') { engine.monitor.volume(value); const input = $('#headphone-volume'); if (input) input.value = String(Math.round(value * 100)); return scheduleSessionSave(); }
    if (action.action === 'volume') { const root = $(`[data-channel="${id}"]`); engine.decks[id].setVolume(value); const input = $('.channel-volume', root); if (input) input.value = String(Math.round(value * 100)); $('.volume-readout', root).textContent = `${(value * 100).toFixed(1)}%`; $('.fader-area', root).style.setProperty('--volume', value); return scheduleSessionSave(); }
    if (action.action === 'filter') { const root = $(`[data-channel="${id}"]`), bipolar = value * 2 - 1; engine.decks[id].setFilter(bipolar); const input = $('.filter', root); if (input) input.value = String(Math.round(bipolar * 100)); $('output', input.parentElement).textContent = Math.abs(bipolar) < 0.005 ? 'OFF' : `${bipolar < 0 ? 'LP' : 'HP'} ${Math.round(Math.abs(bipolar) * 100)}`; return scheduleSessionSave(); }
    if (action.action === 'bass') { const root = $(`[data-channel="${id}"]`), db = value < 0.5 ? value * 48 - 24 : (value - 0.5) * 24; engine.decks[id].setEQ('low', db); const input = $('.eq[data-band="low"]', root); if (input) input.value = String(Math.round(db)); $('output', input.parentElement).textContent = `${db > 0 ? '+' : ''}${db.toFixed(1)} dB`; return scheduleSessionSave(); }
    if (action.action === 'tempo') {
      const root = deckRoot(id), deck = engine.decks[id], key = `tempo:${id}`, physical = Number(value);
      if (!Number.isFinite(physical)) return;
      const range = Math.max(0.06, deck.tempoRange / 100);
      const pickupPosition = 0.5 - (deck.rate - 1) / (2 * range);
      const pickup = midiPickup.get(key);
      if (!pickup) {
        midiPickup.set(key, { position: Math.max(0, Math.min(1, pickupPosition)), last: physical, acquired: false });
        if (Math.abs(physical - pickupPosition) > 0.004) return;
      } else if (!pickup.acquired) {
        const prior = pickup.last; pickup.last = physical;
        if (Math.abs(physical - pickup.position) > 0.004 && (prior - pickup.position) * (physical - pickup.position) > 0) return;
      }
      if (midiPickup.get(key)) midiPickup.get(key).acquired = true;
      const percent = (0.5 - physical) * 2 * range * 100;
      midiApplyingTempo = true;
      try { deck.setRate(1 + percent / 100); }
      finally { midiApplyingTempo = false; }
      const input = $('.tempo', root); if (input) input.value = String(percent); $('.tempo-reset', root).textContent = `${percent >= 0 ? '+' : ''}${percent.toFixed(1)}%`; return scheduleSessionSave();
    }
    if (action.action === 'nudge') engine.decks[id].seek(engine.decks[id].position + value);
  }
  const midi = new MixMidi({
    onAction,
    onDisconnect: () => { engine.decks.forEach(deck => { deck.cueRelease(); deck.scratchTouch(false); if (String(deck.performance.slipCue?.source).startsWith('midi:')) deck.performance.endSlipCue(); }); engine.sampler.releasePrefix('midi:'); },
    onStatus: state => {
      $('#midi-status').textContent = state.message;
      const oldInput = $('#midi-input').value, oldOutput = $('#midi-output').value;
      $('#midi-input').innerHTML = state.ports.inputs.length ? state.ports.inputs.map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('') : '<option value="">未发现在线端口</option>';
      $('#midi-output').innerHTML = '<option value="">不发送灯光反馈</option>' + state.ports.outputs.map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
      if (state.ports.inputs.some(p => p.id === (state.input || oldInput))) $('#midi-input').value = state.input || oldInput;
      if (state.ports.outputs.some(p => p.id === (state.output || oldOutput))) $('#midi-output').value = state.output || oldOutput;
      else if (state.ports.outputs.length === 1) $('#midi-output').value = state.ports.outputs[0].id;
      $('#midi-connect').disabled = state.ports.inputs.length === 0;
      $('#midi-panel-button').classList.toggle('connected', !!state.input);
    },
  });
  $('#midi-panel-button').onclick = () => $('#midi-dialog').showModal();
  $('#midi-close').onclick = () => $('#midi-dialog').close();
  $('#midi-scan').onclick = async () => {
    $('#midi-scan').disabled = true;
    try { await midi.discover(); } catch (error) { $('#midi-status').textContent = `${error.message}。请检查浏览器权限；内置浏览器不可用时改用 Chrome。`; }
    finally { $('#midi-scan').disabled = false; }
  };
  $('#midi-connect').onclick = async () => {
    $('#midi-connect').disabled = true;
    try { await midi.connect($('#midi-input').value, $('#midi-output').value); }
    catch (error) { $('#midi-status').textContent = error.message; }
    finally { $('#midi-connect').disabled = midi.ports().inputs.length === 0; }
  };
  $('#midi-disconnect').onclick = () => midi.disconnect();
  // Timers also run when a browser tab is hidden. LEDs are sent only on change.
  const timer = setInterval(() => {
    midi.sendFeedback(feedbackMessages(engine.decks, engine.sampler, engine.monitor));
    if ($('#midi-dialog').open) {
      $('#midi-counters').textContent = `接收 ${midi.received} · 发送 ${midi.sent}`;
      $('#midi-last').textContent = midi.lastMessage || '等待控制消息';
    }
  }, 100);
  window.addEventListener('pagehide', () => { clearInterval(timer); midi.disconnect(); });
  return { midi, onAction, pads, samplerUI, refreshEffects };
}
