const $ = selector => document.querySelector(selector);
const esc = value => String(value).replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[x]);
export function setupMonitor({ engine, toast }) {
  const monitor = engine.monitor;
  document.querySelector('.master-section').insertAdjacentHTML('afterend', `<section class="monitor-controls" aria-label="耳机预听"><div class="monitor-heading"><span class="eyebrow">HEADPHONES</span><button id="audio-settings">输出设置</button></div><div class="pfl-buttons">${engine.decks.map((_, id) => `<button data-pfl="${id}" aria-label="${'ABCD'[id]} 台耳机预听" aria-pressed="false">PFL ${'ABCD'[id]}</button>`).join('')}</div><label>耳机音量<input id="headphone-volume" type="range" min="0" max="100" value="60" aria-label="耳机音量"/></label><label>CUE / MASTER<input id="headphone-blend" type="range" min="0" max="100" value="0" aria-label="耳机预听与主输出混合"/></label><p id="monitor-summary">独立输出未启用</p></section>`);
  document.body.insertAdjacentHTML('beforeend', `<dialog id="audio-dialog"><div class="dialog-heading"><div><span class="eyebrow">AUDIO ROUTING</span><h2>独立耳机预听</h2></div><button id="audio-close" class="icon-button" aria-label="关闭音频设置">×</button></div><p>主输出给观众，预听输出给耳机。请选择两个独立的输出设备，例如内建扬声器与 USB 声卡。单个多通道声卡的通道分配尚不支持。</p><div class="audio-device-actions"><button id="audio-scan" class="primary-button">刷新输出设备</button><button id="audio-grant">授权一个输出设备</button></div><div class="midi-port-fields"><label>主输出<select id="audio-master" aria-label="主输出设备"></select></label><label>耳机预听<select id="audio-headphones" aria-label="耳机输出设备"></select></label></div><p id="routing-status" role="status">独立输出未启用</p><div class="midi-actions"><button id="audio-enable" class="primary-button">启用独立预听</button><button id="audio-disable">关闭独立预听</button></div><p>预听位于通道推子之前，不进入录音；通过 CUE / MASTER 调整耳机里的混合。音频设备需要先获得浏览器授权；不会请求麦克风。更换设备可能短暂中断播放。</p></dialog>`);
  let devices = [], scanning = 0;
  const state = () => {
    document.querySelectorAll('[data-pfl]').forEach(button => {
      const selected = monitor.selected[Number(button.dataset.pfl)];
      button.setAttribute('aria-pressed', String(selected));
      button.classList.toggle('audible', selected && monitor.enabled);
      button.title = monitor.enabled ? '推子前预听' : '预选通道；请先启用独立预听';
    });
    $('#monitor-summary').textContent = monitor.enabled ? '独立预听已启用' : monitor.busy ? '正在切换输出…' : '独立输出未启用';
    $('#audio-enable').disabled = monitor.busy || !monitor.supported;
    $('#audio-master').disabled = $('#audio-headphones').disabled = monitor.busy;
  };
  monitor.onchange = state;
  async function scan() {
    const token = ++scanning;
    const all = await navigator.mediaDevices?.enumerateDevices();
    if (token !== scanning) return;
    devices = (all || []).filter(d => d.kind === 'audiooutput' && d.deviceId && !['default', 'communications'].includes(d.deviceId));
    for (const selector of ['#audio-master', '#audio-headphones']) {
      const select = $(selector), old = select.value;
      select.innerHTML = '<option value="">选择输出设备</option>' + devices.map((d, i) => `<option value="${esc(d.deviceId)}">${esc(d.label || `输出设备 ${i + 1}`)}</option>`).join('');
      if (devices.some(d => d.deviceId === old)) select.value = old;
    }
    if (devices.length < 2) $('#routing-status').textContent = '需要两个可访问的独立输出设备。若未显示，请在浏览器站点权限中允许选择音频输出，或使用下方授权按钮。';
    else $('#routing-status').textContent = monitor.enabled ? '独立预听正在运行' : '已找到输出设备，请选择主输出与耳机';
    if (!monitor.supported) $('#routing-status').textContent = '当前浏览器不支持独立输出，请在新版 Chrome 中打开本地工作台';
    state();
  }
  $('#audio-settings').onclick = () => { $('#audio-dialog').showModal(); scan().catch(error => $('#routing-status').textContent = error.message); };
  $('#audio-close').onclick = () => $('#audio-dialog').close();
  $('#audio-scan').onclick = () => scan().catch(error => $('#routing-status').textContent = error.message);
  $('#audio-grant').hidden = !navigator.mediaDevices?.selectAudioOutput;
  $('#audio-grant').onclick = async () => {
    try { await navigator.mediaDevices.selectAudioOutput(); await scan(); }
    catch (error) { $('#routing-status').textContent = `未获得输出授权：${error.message}`; }
  };
  $('#audio-enable').onclick = async () => {
    try {
      const master = devices.find(d => d.deviceId === $('#audio-master').value), headphones = devices.find(d => d.deviceId === $('#audio-headphones').value);
      if (!master || !headphones) throw new Error('请先选择主输出和耳机输出');
      if (master.groupId && master.groupId === headphones.groupId) throw new Error('这两个端口属于同一设备，请选择不同的输出设备');
      await monitor.enable(master.deviceId, headphones.deviceId);
      $('#routing-status').textContent = '独立预听已启用 · 点击 PFL 选择预听通道';
    } catch (error) { $('#routing-status').textContent = error.message; }
    state();
  };
  $('#audio-disable').onclick = async () => {
    try { await monitor.disable(); $('#routing-status').textContent = '预听已关闭，主输出已恢复'; }
    catch (error) { $('#routing-status').textContent = `预听已静音；主输出恢复失败：${error.message}`; }
  };
  document.querySelectorAll('[data-pfl]').forEach(button => button.onclick = () => {
    const id = Number(button.dataset.pfl); monitor.select(id, !monitor.selected[id]);
    if (!monitor.enabled) toast('已预选通道，请在输出设置中启用独立预听');
  });
  $('#headphone-volume').oninput = event => monitor.volume(Number(event.target.value) / 100);
  $('#headphone-blend').oninput = event => monitor.blend(Number(event.target.value) / 100);
  navigator.mediaDevices?.addEventListener('devicechange', async () => {
    // Fail closed on any routing change; never let cue audio fall back to speakers.
    if (monitor.enabled || monitor.busy) {
      try { await monitor.disable(); } catch { /* Displayed below; bus is muted. */ }
      toast('音频设备已变化，独立预听已关闭，请重新选择输出');
    }
    if ($('#audio-dialog').open) scan().catch(() => {});
  });
  window.addEventListener('pagehide', () => { monitor.disable().catch(() => {}); });
  state();
}
