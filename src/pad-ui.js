import { ROLL_BEATS, JUMP_BEATS } from './deck-performance.js';
import './pads.css';
const $ = (selector, root) => root.querySelector(selector);
const $$ = (selector, root) => [...root.querySelectorAll(selector)];
const fraction = n => n < 1 ? `1/${Math.round(1 / n)}` : `${n}`;
const stamp = n => `${Math.floor(n / 60).toString().padStart(2, '0')}:${(n % 60).toFixed(2).padStart(5, '0')}`;
const descriptions = {
  hotcue: '点击设置或跳转 · Shift 点击清除 · SLIP 开启时按住预览，松开恢复',
  roll: '按住重复短循环，松开回到持续前进的位置 · 需播放中',
  slicer: '按住重复指定切片，松开恢复进度 · 每个区域分为八片',
  jump: '点击按拍数跳转，保持播放状态',
  saved: '空槽保存当前循环 · 点击调用 · Shift 点击清除',
};

export function setupPads({ engine, toast, saveAnnotations, refreshDeck, handleHotcue }) {
  const states = engine.decks.map((deck, id) => {
    const root = document.querySelector(`[data-deck="${id}"]`), label = 'ABCD'[id];
    const state = { deck, root, mode: 'hotcue', held: new Map(), revision: '', saving: 0, saveMessage: '' };
    $('.pads-heading', root).innerHTML = `<label class="pad-mode-label">PADS <select class="pad-mode" aria-label="${label} 台 Pad 模式"><option value="hotcue">HOT CUE</option><option value="roll">LOOP ROLL</option><option value="slicer">SLICER</option><option value="jump">BEAT JUMP</option><option value="saved">SAVED LOOP</option></select></label><button class="slip-toggle" aria-pressed="false" title="循环、Hot Cue 预览或抓碟期间保持后台进度，结束后恢复">SLIP</button>`;
    $('.hotcues', root).insertAdjacentHTML('afterend', `<div class="performance-pads" hidden>${Array.from({ length: 8 }, (_, i) => `<button class="performance-pad" data-pad="${i}" aria-label="${label} 台演奏垫 ${i + 1}"><strong></strong><span></span></button>`).join('')}</div><div class="slicer-settings" hidden><label>区域<select class="slice-domain" aria-label="${label} 台切片区域">${[4,8,16,32].map(n => `<option value="${n}" ${n === 8 ? 'selected' : ''}>${n} 拍</option>`).join('')}</select></label><label>区域跟随<select class="slice-mode" aria-label="${label} 台切片区域模式"><option value="moving">随播放移动</option><option value="fixed">固定当前区域</option></select></label><label>重复<select class="slice-repeat" aria-label="${label} 台切片重复">${[0.125,0.25,0.5,1,2,4].map(n => `<option value="${n}" ${n === 1 ? 'selected' : ''}>${fraction(n)} 拍</option>`).join('')}</select></label><span class="slicer-region"></span></div><p class="pad-hint"></p><p class="annotation-status" role="status"></p><div class="slip-readout" aria-live="off"></div>`);
    $('.loop-row', root).insertAdjacentHTML('afterend', `<div class="manual-loop"><button class="loop-in" aria-label="${label} 台循环入点">LOOP IN</button><button class="loop-out" aria-label="${label} 台循环出点">LOOP OUT</button><span class="manual-loop-status">手动设置循环边界</span></div>`);
    const resetHolds = () => { state.held.clear(); deck.performance.endSlipCue(); deck.performance.finish(); update(state); };
    $('.pad-mode', root).onchange = event => { resetHolds(); state.mode = event.target.value; state.revision = ''; update(state); };
    $('.slip-toggle', root).onclick = () => { deck.performance.setSlip(!deck.performance.slipEnabled); update(state); };
    $('.slice-domain', root).onchange = event => { resetHolds(); deck.performance.domainBeats = Number(event.target.value); if (deck.performance.slicerMode === 'fixed') deck.performance.setSlicerMode('fixed'); update(state); };
    $('.slice-mode', root).onchange = event => { resetHolds(); deck.performance.setSlicerMode(event.target.value); update(state); };
    $('.slice-repeat', root).onchange = event => { resetHolds(); deck.performance.sliceRepeat = Number(event.target.value); };
    $('.loop-in', root).onclick = () => {
      if (!deck.buffer) return toast('先载入音乐');
      resetHolds(); const point = deck.quantize ? deck.snap(deck.position) : deck.position;
      deck.clearLoop(); deck.loopIn = point; update(state); refreshDeck(id);
    };
    $('.loop-out', root).onclick = () => {
      if (deck.loopIn === null) return toast('先设置 LOOP IN');
      const end = deck.quantize ? deck.snap(deck.position) : deck.position;
      if (!deck.setLoop(deck.loopIn, end)) return toast('循环出点必须在入点之后');
      deck.loopIn = null; refreshDeck(id); update(state);
    };
    $$('.performance-pad', root).forEach((button, index) => {
      button.onpointerdown = event => {
        if (event.button !== 0 || !['roll','slicer'].includes(state.mode)) return;
        event.preventDefault(); button.setPointerCapture(event.pointerId);
        press(id, index, `pointer:${event.pointerId}`, false);
      };
      const release = event => releaseKey(id, `pointer:${event.pointerId}`);
      button.onpointerup = release; button.onpointercancel = release; button.onlostpointercapture = release;
      button.onkeydown = event => {
        if (!['Space','Enter'].includes(event.code) || !['roll','slicer'].includes(state.mode)) return;
        event.preventDefault(); event.stopPropagation();
        if (!event.repeat) press(id, index, `button:${event.code}:${index}`);
      };
      button.onkeyup = event => {
        if (!['Space','Enter'].includes(event.code)) return;
        event.preventDefault(); event.stopPropagation(); releaseKey(id, `button:${event.code}:${index}`);
      };
      button.onclick = event => { if (!['roll','slicer'].includes(state.mode)) press(id, index, 'click', event.shiftKey); };
    });
    deck.refreshPads = () => update(state);
    deck.performance.onchange = () => update(state);
    update(state); return state;
  });

  async function press(id, index, key, clear = false) {
    const state = states[id], { deck, mode } = state;
    if (state.held.has(key)) return;
    if (mode === 'hotcue') {
      if (!clear && deck.performance.slipEnabled && deck.playing && deck.hotcues[index] !== null) {
        if (deck.performance.beginSlipCue(deck.hotcues[index], index, `keyboard:${id}:${key}`)) {
          state.held.set(key, { slip: true, source: `keyboard:${id}:${key}` }); update(state);
        }
        return;
      }
      return handleHotcue(id, index, clear);
    }
    if (!deck.buffer) return toast('先载入音乐');
    if (mode === 'jump') { deck.beatJump(JUMP_BEATS[index]); refreshDeck(id); return; }
    if (mode === 'saved') {
      if (clear) deck.savedLoops[index] = null;
      else if (deck.savedLoops[index]) deck.recallLoop(index);
      else if (!deck.saveLoop(index)) return toast('先启用一个普通循环，再点击空槽保存');
      state.saving++; state.saveMessage = ''; update(state);
      const saved = await saveAnnotations(id);
      state.saving--; state.saveMessage = saved ? '已保存到本机' : '本机保存失败';
      refreshDeck(id); update(state); return;
    }
    const token = mode === 'roll' ? deck.performance.roll(ROLL_BEATS[index], index) : deck.performance.slice(index);
    if (token === null) return toast(deck.playing ? '该区域超出了曲目范围' : '请先播放曲目，再按住演奏垫');
    state.held.set(key, token); update(state);
  }
  function releaseKey(id, key) {
    const state = states[id], token = state.held.get(key);
    if (token === undefined) return;
    state.held.delete(key);
    if (token && token.slip) state.deck.performance.endSlipCue(token.source);
    else state.deck.performance.release(token);
    refreshDeck(id); update(state);
  }
  function releaseAll() {
    states.forEach(state => {
      state.held.clear();
      // Window focus belongs to keyboard/pointer input, not an attached MIDI
      // controller. Keep a controller-owned preview until its note-off arrives.
      if (state.deck.performance.slipCue && !String(state.deck.performance.slipCue.source).startsWith('midi:')) state.deck.performance.endSlipCue();
      state.deck.performance.finish();
      state.deck.cueRelease();
      update(state);
    });
  }
  function update(state) {
    const { root, deck, mode } = state, perf = deck.performance;
    $('.hotcues', root).hidden = mode !== 'hotcue';
    $('.performance-pads', root).hidden = mode === 'hotcue';
    $('.slicer-settings', root).hidden = mode !== 'slicer';
    $('.pad-hint', root).textContent = descriptions[mode] + (mode === 'saved' ? ` · ${state.saving ? '正在保存…' : state.saveMessage}` : '');
    $('.slip-toggle', root).setAttribute('aria-pressed', String(perf.slipEnabled));
    $('.manual-loop-status', root).textContent = deck.loopIn === null ? '手动设置循环边界' : `IN ${stamp(deck.loopIn)}`;
    const domain = perf.slicerDomain();
    if (mode === 'slicer') { $('.slicer-region', root).textContent = `${stamp(domain.start)}–${stamp(Math.min(deck.buffer?.duration || 0, domain.start + domain.length))}`; $('.slice-mode', root).value = perf.slicerMode; }
    const revision = JSON.stringify([mode, deck.savedLoops]);
    $$('.performance-pad', root).forEach((button, index) => {
      button.classList.toggle('active', perf.active?.pad === index && perf.active?.kind === mode);
      button.classList.toggle('current-slice', mode === 'slicer' && deck.playing && Math.floor((perf.backgroundPosition - domain.start) / (domain.length / 8)) === index);
      button.classList.toggle('saved', mode === 'saved' && !!deck.savedLoops[index]);
      if (revision === state.revision) return;
      const loop = deck.savedLoops[index];
      $('strong', button).textContent = mode === 'roll' ? `${fraction(ROLL_BEATS[index])} 拍` : mode === 'jump' ? `${JUMP_BEATS[index] > 0 ? '+' : ''}${JUMP_BEATS[index]} 拍` : `${index + 1}`;
      $('span', button).textContent = mode === 'roll' ? '按住 ROLL' : mode === 'slicer' ? '按住切片' : mode === 'jump' ? '跳转' : loop ? `${stamp(loop.start)} / ${stamp(loop.end - loop.start)}` : '保存循环';
    });
    const midiHeldCue = perf.slipCue && String(perf.slipCue.source).startsWith('midi:') ? perf.slipCue.pad : null;
    $$('.hotcue', root).forEach((button, index) => {
      const held = mode === 'hotcue' && index === midiHeldCue;
      button.classList.toggle('midi-held', held);
      button.setAttribute('aria-pressed', String(held));
    });
    state.revision = revision;
    $('.slip-readout', root).textContent = perf.gesture || perf.loopSlip || perf.slipCue || perf.scratchSlip ? `后台进度 ${stamp(perf.backgroundPosition)} · ${perf.slipCue ? 'SLIP HOT CUE' : perf.active?.kind?.toUpperCase() || (perf.scratchSlip ? 'SLIP SCRATCH' : 'SLIP LOOP')}` : '';
  }
  const timer = setInterval(() => { if (!document.hidden) states.forEach(update); }, 100);
  window.addEventListener('blur', releaseAll);
  document.addEventListener('visibilitychange', () => { if (document.hidden) releaseAll(); });
  window.addEventListener('pagehide', () => { clearInterval(timer); releaseAll(); });
  return { press, releaseKey, releaseAll };
}
