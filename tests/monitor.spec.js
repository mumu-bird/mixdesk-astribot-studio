import { test, expect } from '@playwright/test';

async function ready(page) {
  await page.addInitScript(() => {
    window.routingCalls = []; window.testSinks = new WeakMap();
    window.outputs = [
      { kind: 'audiooutput', deviceId: 'speakers', groupId: 'one', label: 'Test speakers' },
      { kind: 'audiooutput', deviceId: 'phones', groupId: 'two', label: 'Test headphones' },
      { kind: 'audiooutput', deviceId: 'speaker-alias', groupId: 'one', label: 'Speaker alias' },
    ];
    Object.defineProperty(navigator.mediaDevices, 'enumerateDevices', { value: async () => window.outputs });
    Object.defineProperty(AudioContext.prototype, 'sinkId', { get() { return window.testSinks.get(this) || ''; } });
    AudioContext.prototype.setSinkId = async function(id) { window.routingCalls.push(['master', id]); window.testSinks.set(this, id); };
    HTMLMediaElement.prototype.setSinkId = async function(id) {
      window.routingCalls.push(['phones', id]); if (window.rejectHeadphones) throw new Error('Output permission denied');
    };
    HTMLMediaElement.prototype.play = async () => {};
  });
  await page.goto('/'); await expect(page.locator('[data-deck="0"] .track-title')).toHaveText('Night Drive');
}
async function route(page) {
  await page.locator('#audio-settings').click();
  await page.locator('#audio-master').selectOption('speakers');
  await page.locator('#audio-headphones').selectOption('phones');
  await page.locator('#audio-enable').click();
  await expect(page.locator('#routing-status')).toContainText('独立预听已启用');
  await page.locator('#audio-close').click();
}

test('PFL survives channel/master silence, stays out of recorder, and responds to MIX', async ({ page }) => {
  await ready(page); await route(page);
  const result = await page.evaluate(async () => {
    const { engine: e, onAction } = window.__mixdesk;
    const { feedbackMessages } = await import('/src/midi.js');
    await onAction({ action: 'pfl', deck: 0 });
    await onAction({ action: 'headphoneVolume', value: 0.75 });
    e.decks[0].setVolume(0); e.setMaster(0); e.setCrossfader(1);
    await e.decks[0].play();
    await new Promise(resolve => setTimeout(resolve, 180)); // Let volume smoothing reach silence before recording.
    const read = a => { const d = new Float32Array(a.fftSize); a.getFloatTimeDomainData(d); return Math.sqrt(d.reduce((s,x)=>s+x*x,0)/d.length); };
    const chunks = [], recorder = new MediaRecorder(e.recordDestination.stream);
    const stopped = new Promise(resolve => recorder.onstop = resolve);
    recorder.ondataavailable = ev => chunks.push(ev.data); recorder.start();
    await new Promise(resolve => setTimeout(resolve, 600)); recorder.stop(); await stopped;
    const buffer = await e.context.decodeAudioData(await new Blob(chunks).arrayBuffer());
    const data = buffer.getChannelData(0), recordingRMS = Math.sqrt(data.reduce((s,x)=>s+x*x,0)/data.length);
    return { cue: read(e.monitor.analyser), master: read(e.analyser), recordingRMS,
      feedback: feedbackMessages(e.decks, e.sampler, e.monitor), volume: document.querySelector('#headphone-volume').value };
  });
  expect(result.cue).toBeGreaterThan(0.005); expect(result.master).toBeLessThan(0.0001);
  expect(result.recordingRMS).toBeLessThan(0.0001); expect(result.volume).toBe('75');
  expect(result.feedback).toContainEqual([0x91, 12, 127]);
  await expect(page.locator('[data-pfl="0"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('#audio-settings').click(); await page.locator('#audio-disable').click();
  await expect.poll(() => page.evaluate(() => window.__mixdesk.engine.monitor.enabled)).toBe(false);
  await expect.poll(() => page.evaluate(() => window.__mixdesk.engine.context.sinkId)).toBe('');
});

test('same-device routes and denied outputs never enable PFL', async ({ page }) => {
  await ready(page); await page.locator('#audio-settings').click();
  await page.locator('#audio-master').selectOption('speakers');
  await page.locator('#audio-headphones').selectOption('speaker-alias');
  await page.locator('#audio-enable').click(); await expect(page.locator('#routing-status')).toContainText('同一设备');
  expect(await page.evaluate(() => window.routingCalls)).toEqual([]);
  await page.locator('#audio-headphones').selectOption('speakers');
  await page.locator('#audio-enable').click(); await expect(page.locator('#routing-status')).toContainText('同一设备');
  await page.locator('#audio-headphones').selectOption('phones');
  await page.evaluate(() => window.rejectHeadphones = true);
  await page.locator('#audio-enable').click(); await expect(page.locator('#routing-status')).toContainText('permission denied');
  expect(await page.evaluate(() => ({ enabled: window.__mixdesk.engine.monitor.enabled, gate: window.__mixdesk.engine.monitor.safety.gain.value, sink: window.__mixdesk.engine.context.sinkId }))).toEqual({ enabled: false, gate: 0, sink: '' });
});

test('hot-unplug mutes cue and disables LED feedback', async ({ page }) => {
  await ready(page); await route(page);
  await page.locator('[data-pfl="0"]').click();
  await page.evaluate(() => { window.outputs = window.outputs.filter(d => d.deviceId !== 'phones'); navigator.mediaDevices.dispatchEvent(new Event('devicechange')); });
  await expect(page.locator('#monitor-summary')).toHaveText('独立输出未启用');
  expect(await page.evaluate(async () => {
    const e = window.__mixdesk.engine, { feedbackMessages } = await import('/src/midi.js');
    return { gate: e.monitor.safety.gain.value, led: feedbackMessages(e.decks, e.sampler, e.monitor).find(m => m[0] === 0x91 && m[1] === 12)?.[2] };
  })).toEqual({ gate: 0, led: 0 });
});

test('disable during pending sink change prevents late cue playback', async ({ page }) => {
  await ready(page);
  const result = await page.evaluate(async () => {
    const m = window.__mixdesk.engine.monitor; let release;
    m.audio.setSinkId = () => new Promise(resolve => release = resolve);
    const enabling = m.enable('speakers', 'phones').catch(e => e.message);
    while (!release) await new Promise(resolve => setTimeout(resolve, 10));
    const disabling = m.disable(); release();
    const error = await enabling; await disabling;
    return { error, enabled: m.enabled, gate: m.safety.gain.value, sink: m.context.sinkId, busy: m.busy };
  });
  expect(result).toEqual({ error: '输出切换已取消', enabled: false, gate: 0, sink: '', busy: false });
});
