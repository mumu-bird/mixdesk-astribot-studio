import { test, expect } from '@playwright/test';
async function ready(page) {
  await page.goto('/'); await expect(page.locator('[data-deck="0"] .track-title')).toHaveText('Night Drive');
}
const mode = (page, value) => page.locator('[data-deck="0"] .pad-mode').selectOption(value);
const pad = (page, index) => page.locator(`[data-deck="0"] [data-pad="${index}"]`);
const measure = () => {
  const a = window.__padAnalyser, data = new Float32Array(a.frequencyBinCount); a.getFloatFrequencyData(data);
  let peak = 1; for (let i = 2; i < data.length; i++) if (data[i] > data[peak]) peak = i;
  return peak * window.__mixdesk.engine.context.sampleRate / a.fftSize;
};
async function toneTrack(page, segmented = false) {
  await page.evaluate(async segmented => {
    const e = window.__mixdesk.engine, d = e.decks[0], buffer = e.context.createBuffer(1, e.context.sampleRate * 12, e.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / buffer.sampleRate, f = segmented ? 220 + Math.floor(t / 0.5) * 110 : t < 1 ? 440 : 880;
      data[i] = 0.1 * Math.sin(2 * Math.PI * f * t);
    }
    d.load({ id: 'pad-tone', bpm: 120 }, buffer);
    const analyser = e.context.createAnalyser(); analyser.fftSize = 4096; d.trim.connect(analyser); window.__padAnalyser = analyser;
    d.seek(0.2); await d.play();
  }, segmented);
}

test('Roll audio, changing tempo and release agree with the audio clock', async ({ page }) => {
  await ready(page); await toneTrack(page);
  await page.evaluate(() => {
    const d = window.__mixdesk.engine.decks[0]; window.__roll = d.performance.roll(0.25, 2);
  });
  await page.waitForTimeout(1000);
  const rolled = await page.evaluate(() => { const d = window.__mixdesk.engine.decks[0]; return { position: d.position, background: d.performance.backgroundPosition, length: d.loop.end - d.loop.start }; });
  expect(rolled.length).toBeCloseTo(0.125, 6); expect(rolled.position).toBeLessThan(1); expect(rolled.background).toBeGreaterThan(1);
  expect(await page.evaluate(measure)).toBeGreaterThan(425); expect(await page.evaluate(measure)).toBeLessThan(455);
  await page.evaluate(() => window.__mixdesk.engine.decks[0].setRate(1.25));
  await page.waitForTimeout(250);
  const release = await page.evaluate(() => {
    const d = window.__mixdesk.engine.decks[0], timeline = d.performance.gesture.timeline;
    d.performance.release(window.__roll);
    const actual = d.position, now = d.context.currentTime;
    const expected = timeline.position + (now - timeline.anchor) * timeline.rate;
    // AudioContext.currentTime advances in render quanta on another thread.
    // Compare at one observation time, allowing one 128-frame clock step.
    return { expected, actual, quantum: 128 / d.context.sampleRate * d.rate, loop: d.loop, playing: d.playing };
  });
  expect(Math.abs(release.actual - release.expected)).toBeLessThanOrEqual(release.quantum + 1e-6); expect(release.loop).toBeNull(); expect(release.playing).toBe(true);
  await expect.poll(() => page.evaluate(measure)).toBeGreaterThan(1080);
  expect(await page.evaluate(measure)).toBeLessThan(1120);
});

test('Slicer selects audible regions and handles overlapping held pads in last-pressed order', async ({ page }) => {
  await ready(page); await toneTrack(page, true);
  await page.evaluate(() => {
    const p = window.__mixdesk.engine.decks[0].performance;
    p.sliceRepeat = 0.25; window.__slice1 = p.slice(6);
  });
  await expect.poll(() => page.evaluate(measure)).toBeGreaterThan(865); expect(await page.evaluate(measure)).toBeLessThan(895);
  await page.evaluate(() => window.__slice2 = window.__mixdesk.engine.decks[0].performance.slice(2));
  await expect.poll(() => page.evaluate(measure)).toBeLessThan(455); expect(await page.evaluate(measure)).toBeGreaterThan(425);
  const state = await page.evaluate(() => {
    const p = window.__mixdesk.engine.decks[0].performance; p.release(window.__slice1);
    return { active: p.active.pad, held: p.gesture.held.length, start: window.__mixdesk.engine.decks[0].loop.start };
  });
  expect(state).toEqual({ active: 2, held: 1, start: 1 });
  const release = await page.evaluate(() => { const d = window.__mixdesk.engine.decks[0], expected = d.performance.backgroundPosition; d.performance.release(window.__slice2); return { gap: Math.abs(d.position - expected), loop: d.loop }; });
  expect(release.gap).toBeLessThan(0.02); expect(release.loop).toBeNull();
});

test('Slicer fixed mode keeps the selected region while the deck advances', async ({ page }) => {
  await ready(page); await toneTrack(page, true);
  const state = await page.evaluate(async () => {
    const d = window.__mixdesk.engine.decks[0], p = d.performance;
    d.seek(0.2); p.domainBeats = 8; await d.play(); p.setSlicerMode('fixed');
    const first = p.slicerDomain(); await new Promise(resolve => setTimeout(resolve, 4200));
    const second = p.slicerDomain(); p.setSlicerMode('moving'); const moving = p.slicerDomain();
    return { first, second, moving, mode: p.slicerMode };
  });
  expect(state.second.start).toBeCloseTo(state.first.start, 6);
  expect(state.second.length).toBeCloseTo(state.first.length, 6);
  expect(state.mode).toBe('moving');
  expect(state.moving.start).toBeGreaterThanOrEqual(state.first.start);
});

test('Slip loops restore background progress while ordinary loops exit at the audible position', async ({ page }) => {
  await ready(page);
  const result = await page.evaluate(async () => {
    const d = window.__mixdesk.engine.decks[0], wait = ms => new Promise(r => setTimeout(r, ms));
    d.seek(2); d.performance.setSlip(true); await d.play(); d.toggleLoop(0.25);
    await wait(350); d.setRate(1.5); await wait(250);
    const slipTimeline = { ...d.performance.loopSlip }; d.clearLoop(); const slipActual = d.position;
    const slip = { expected: slipTimeline.position + (d.context.currentTime - slipTimeline.anchor) * slipTimeline.rate, actual: slipActual, quantum: 128 / d.context.sampleRate * d.rate, loop: d.loop };
    d.performance.setSlip(false); d.setRate(1); d.seek(2); d.toggleLoop(0.25); await wait(400);
    const audible = d.position; d.clearLoop();
    return { slip, ordinary: { expected: audible, actual: d.position }, quantum: 256 / d.context.sampleRate, sourceLoop: d.source.loop };
  });
  expect(Math.abs(result.slip.actual - result.slip.expected)).toBeLessThanOrEqual(result.slip.quantum + 1e-6); expect(result.slip.actual).toBeGreaterThan(2.6);
  expect(Math.abs(result.ordinary.actual - result.ordinary.expected)).toBeLessThanOrEqual(result.quantum + 1e-6); expect(result.ordinary.actual).toBeLessThan(2.13);
  expect(result.sourceLoop).toBe(false); expect(result.slip.loop).toBeNull();
});

test('Slip Hot Cue previews a cue and returns to the background clock', async ({ page }) => {
  await ready(page);
  const result = await page.evaluate(async () => {
    const d = window.__mixdesk.engine.decks[0], wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    d.seek(2); d.hotcues[0] = 0.5; d.performance.setSlip(true); await d.play();
    const started = d.performance.beginSlipCue(d.hotcues[0], 0);
    await wait(300);
    const preview = { started, audible: d.position, background: d.performance.backgroundPosition, active: !!d.performance.slipCue };
    d.performance.endSlipCue();
    const restored = { audible: d.position, active: !!d.performance.slipCue, slip: d.performance.slipEnabled };
    d.performance.setSlip(false);
    return { preview, restored };
  });
  expect(result.preview.started).toBe(true);
  expect(result.preview.active).toBe(true);
  expect(result.preview.audible).toBeGreaterThan(0.5);
  expect(result.preview.audible).toBeLessThan(1.2);
  expect(result.preview.background).toBeGreaterThan(2.2);
  expect(Math.abs(result.restored.audible - result.preview.background)).toBeLessThan(0.08);
  expect(result.restored).toEqual(expect.objectContaining({ active: false, slip: true }));
});

test('Turning Slip off while a Hot Cue is held restores the background position', async ({ page }) => {
  await ready(page);
  const result = await page.evaluate(async () => {
    const d = window.__mixdesk.engine.decks[0], wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    d.seek(2); d.hotcues[0] = 0.5; d.performance.setSlip(true); await d.play();
    d.performance.beginSlipCue(0.5, 0); await wait(250);
    const background = d.performance.backgroundPosition;
    d.performance.setSlip(false);
    return { position: d.position, background, slipCue: d.performance.slipCue, slip: d.performance.slipEnabled };
  });
  expect(result.slipCue).toBeNull();
  expect(result.slip).toBe(false);
  expect(Math.abs(result.position - result.background)).toBeLessThan(0.08);
});

test('roll over a slip loop restores the loop first, then restores its outer timeline', async ({ page }) => {
  await ready(page);
  const result = await page.evaluate(async () => {
    const d = window.__mixdesk.engine.decks[0]; d.seek(3); d.performance.setSlip(true); await d.play(); d.toggleLoop(1);
    const base = { ...d.loop }, token = d.performance.roll(0.0625, 0);
    await new Promise(r => setTimeout(r, 650));
    const timeline = { ...d.performance.loopSlip }; d.performance.release(token);
    const restored = { ...d.loop }; d.clearLoop(); const position = d.position;
    const outside = timeline.position + (d.context.currentTime - timeline.anchor) * timeline.rate;
    return { base, restored, outside, position, quantum: 128 / d.context.sampleRate * d.rate, loop: d.loop };
  });
  expect(result.restored).toEqual(result.base); expect(Math.abs(result.position - result.outside)).toBeLessThanOrEqual(result.quantum + 1e-6); expect(result.loop).toBeNull();
});

test('pause, seek, load and end-of-track prevent late pad releases from restarting or replaying tails', async ({ page }) => {
  await ready(page);
  const result = await page.evaluate(async () => {
    const { engine: e } = window.__mixdesk, d = e.decks[0];
    await d.play(); let token = d.performance.roll(0.125, 1); d.pause(); d.performance.release(token);
    const paused = { playing: d.playing, source: d.source, loop: d.loop };
    await d.play(); token = d.performance.slice(1); d.seek(5); d.performance.release(token); const seek = d.position;
    token = d.performance.roll(0.125, 1); d.load({ id: 'replacement', bpm: 120 }, d.buffer); d.performance.release(token);
    const loaded = { playing: d.playing, position: d.position };
    d.seek(d.buffer.duration - 0.15); await d.play(); token = d.performance.roll(0.125, 1);
    await new Promise(r => setTimeout(r, 350)); d.performance.release(token);
    return { paused, seek, loaded, ended: { playing: d.playing, position: d.position, duration: d.buffer.duration, source: d.source } };
  });
  expect(result.paused).toEqual({ playing: false, source: null, loop: null });
  expect(result.seek).toBeCloseTo(5, 2); expect(result.loaded).toEqual({ playing: false, position: 0 });
  expect(result.ended.playing).toBe(false); expect(result.ended.source).toBeNull(); expect(result.ended.position).toBe(result.ended.duration);
});

test('manual loop boundaries and saved slots persist, recall exact times and delete with Shift', async ({ page }) => {
  await ready(page);
  await page.evaluate(() => window.__mixdesk.engine.decks[0].seek(2.125));
  await page.getByRole('button', { name: 'A 台循环入点' }).click();
  await page.evaluate(() => window.__mixdesk.engine.decks[0].seek(3.875));
  await page.getByRole('button', { name: 'A 台循环出点' }).click();
  await mode(page, 'saved'); await pad(page, 7).click();
  await expect(pad(page, 7)).toHaveClass(/saved/);
  await expect(page.locator('[data-deck="0"] .pad-hint')).toContainText('已保存到本机');
  await page.reload(); await expect(page.locator('[data-deck="0"] .track-title')).toHaveText('Night Drive');
  await mode(page, 'saved'); await pad(page, 7).click();
  expect(await page.evaluate(() => { const d = window.__mixdesk.engine.decks[0]; return { start: d.loop.start, end: d.loop.end, position: d.position, playing: d.playing }; })).toEqual({ start: 2.125, end: 3.875, position: 2.125, playing: false });
  await pad(page, 7).click({ modifiers: ['Shift'] }); await expect(pad(page, 7)).not.toHaveClass(/saved/);
  await expect(page.locator('[data-deck="0"] .pad-hint')).toContainText('已保存到本机');
  await page.reload(); await expect(page.locator('[data-deck="0"] .track-title')).toHaveText('Night Drive');
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].savedLoops[7])).toBeNull();
});

test('pointer release outside pads, keyboard key-up and window blur all release Roll', async ({ page }) => {
  await ready(page); await mode(page, 'roll'); await page.getByRole('button', { name: '播放 A', exact: true }).click();
  const box = await pad(page, 4).boundingBox(); await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2); await page.mouse.down();
  await expect(pad(page, 4)).toHaveClass(/active/);
  await page.mouse.move(5, 5); await page.mouse.up();
  await expect.poll(() => page.evaluate(() => window.__mixdesk.engine.decks[0].performance.gesture)).toBeNull();
  await page.locator('[data-deck="0"]').focus(); await page.keyboard.down('Digit1');
  await expect(pad(page, 0)).toHaveClass(/active/); await page.keyboard.up('Digit1');
  await expect(pad(page, 0)).not.toHaveClass(/active/);
  await page.keyboard.down('Digit2'); await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect.poll(() => page.evaluate(() => window.__mixdesk.engine.decks[0].performance.gesture)).toBeNull(); await page.keyboard.up('Digit2');
});

test('Cue hold previews from Cue, release returns, and Play latches the preview', async ({ page }) => {
  await ready(page);
  await page.evaluate(() => { const d = window.__mixdesk.engine.decks[0]; d.cuePoint = 2; d.seek(5); });
  const box = await page.locator('[data-deck="0"] .cue-button').boundingBox();
  await page.mouse.move(box.x + 10, box.y + 10); await page.mouse.down();
  await expect.poll(() => page.evaluate(() => window.__mixdesk.engine.decks[0].position)).toBeGreaterThan(2.15);
  await expect.poll(() => page.evaluate(() => window.__mixdesk.engine.decks[0].meter())).toBeGreaterThan(0.003);
  await page.mouse.up();
  expect(await page.evaluate(() => { const d = window.__mixdesk.engine.decks[0]; return { playing: d.playing, position: d.position }; })).toEqual({ playing: false, position: 2 });
  await page.evaluate(async () => {
    const { onAction } = window.__mixdesk;
    await onAction({ action: 'cue', deck: 0 }); await onAction({ action: 'play', deck: 0 }); await onAction({ action: 'cueRelease', deck: 0 });
  });
  await expect.poll(() => page.evaluate(() => window.__mixdesk.engine.decks[0].position)).toBeGreaterThan(2.1);
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].playing)).toBe(true);
  await page.evaluate(() => window.__mixdesk.onAction({ action: 'cue', deck: 0 }));
  expect(await page.evaluate(() => { const d = window.__mixdesk.engine.decks[0]; return { playing: d.playing, position: d.position }; })).toEqual({ playing: false, position: 2 });
});

test('Cue release during audio resume and MIDI disconnect cancel pending preview', async ({ page }) => {
  await ready(page);
  const result = await page.evaluate(async () => {
    const { engine: e, midi } = window.__mixdesk, d = e.decks[0];
    const resume = e.context.resume.bind(e.context); let resolve;
    e.context.resume = () => new Promise(r => resolve = r);
    const pending = d.cuePress(); d.cueRelease(); resolve(); await pending;
    const cancelled = { playing: d.playing, preview: d.cuePreview, source: d.source };
    e.context.resume = resume; await d.cuePress(); await midi.disconnect();
    return { cancelled, disconnected: { playing: d.playing, preview: d.cuePreview, source: d.source } };
  });
  expect(result.cancelled).toEqual({ playing: false, preview: false, source: null });
  expect(result.disconnected).toEqual({ playing: false, preview: false, source: null });
});

test('editing cues on another loaded copy preserves shared saved loops', async ({ page }) => {
  await ready(page);
  await page.getByRole('button', { name: '将 Night Drive 载入 B 台', exact: true }).click();
  await page.evaluate(() => window.__mixdesk.engine.decks[0].setLoop(2, 4));
  await mode(page, 'saved'); await pad(page, 0).click();
  await expect(page.locator('[data-deck="0"] .pad-hint')).toContainText('已保存到本机');
  await page.evaluate(() => window.__mixdesk.engine.decks[1].seek(8));
  await page.locator('[data-deck="1"] [data-cue="0"]').click();
  await expect(page.locator('[data-deck="0"] [data-cue="0"] span')).toHaveText('00:08');
  const annotations = await page.evaluate(async () => {
    const { setting } = await import('/src/storage.js'); return setting('annotations:demo-night-drive');
  });
  expect(annotations.savedLoops[0]).toEqual({ start: 2, end: 4, beats: 4 }); expect(annotations.hotcues[0]).toBe(8);
});

test('hot cues support editable names and colors and persist across reload', async ({ page }) => {
  await ready(page);
  await page.evaluate(() => window.__mixdesk.engine.decks[0].seek(1.5));
  await page.locator('[data-deck="0"] [data-cue="0"]').click();
  await page.locator('[data-deck="0"] [data-cue="0"]').dblclick();
  await page.locator('#cue-edit-name').fill('主歌进入');
  await page.locator('#cue-edit-color').selectOption('#f4ad6b');
  await page.locator('#cue-edit-save').click();
  await expect(page.locator('[data-deck="0"] [data-cue="0"] span')).toHaveText('主歌进入');
  await expect(page.locator('[data-deck="0"] [data-cue="0"] span')).toHaveCSS('color', 'rgb(244, 173, 107)');
  await page.reload();
  await ready(page);
  await expect(page.locator('[data-deck="0"] [data-cue="0"] span')).toHaveText('主歌进入');
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].hotcueMeta[0])).toEqual({ name: '主歌进入', color: '#f4ad6b' });
  await page.locator('[data-deck="0"] [data-cue="0"]').dblclick();
  await page.locator('#cue-edit-clear').click();
  await expect(page.locator('[data-deck="0"] [data-cue="0"] span')).toHaveText('设置标记');
});

test('MIDI Slip Hot Cue keeps one background clock and ignores older or repeated releases', async ({ page }) => {
  await ready(page); await toneTrack(page, true);
  const result = await page.evaluate(async () => {
    const { engine, onAction } = window.__mixdesk, d = engine.decks[0], p = d.performance;
    d.seek(5); d.hotcues[0] = 0.5; d.hotcues[1] = 1.5; p.setSlip(true);
    await onAction({ action: 'hotcue', deck: 0, index: 0 });
    const anchor = p.slipCue.timeline.anchor;
    await new Promise(r => setTimeout(r, 140));
    const beforeRepeat = d.position;
    await onAction({ action: 'hotcue', deck: 0, index: 0 });
    const afterRepeat = d.position;
    await onAction({ action: 'hotcue', deck: 0, index: 1 });
    await onAction({ action: 'hotcueRelease', deck: 0, index: 0 });
    const held = { pad: p.slipCue.pad, anchor: p.slipCue.timeline.anchor, position: d.position, background: p.backgroundPosition };
    await onAction({ action: 'hotcueRelease', deck: 0, index: 1 });
    const released = { active: p.slipCue, position: d.position, playing: d.playing };
    d.pause();
    await onAction({ action: 'hotcueRelease', deck: 0, index: 1 });
    return { anchor, beforeRepeat, afterRepeat, held, released, stopped: !d.playing };
  });
  expect(result.afterRepeat).toBeGreaterThanOrEqual(result.beforeRepeat);
  expect(result.held.pad).toBe(1); expect(result.held.anchor).toBe(result.anchor);
  expect(result.held.position).toBeGreaterThanOrEqual(1.5); expect(result.held.position).toBeLessThan(1.7);
  expect(result.held.background).toBeGreaterThan(5.1);
  expect(result.released.active).toBeNull(); expect(result.released.playing).toBe(true);
  expect(Math.abs(result.released.position - result.held.background)).toBeLessThan(0.03);
  expect(result.stopped).toBe(true);
});

test('MIX HOTCUE_TAB selects the Hot Cue pad page without changing cue data', async ({ page }) => {
  await ready(page);
  await page.locator('[data-deck="0"] .pad-mode').selectOption('roll');
  await page.evaluate(() => window.__mixdesk.onAction({ action: 'hotcueTab', deck: 0 }));
  await expect(page.locator('[data-deck="0"] .pad-mode')).toHaveValue('hotcue');
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].hotcues)).toEqual([null, null, null, null, null, null, null, null]);
});

test('Digit Hot Cue release follows its original deck and cannot end a MIDI hold on the same pad', async ({ page }) => {
  await ready(page); await toneTrack(page);
  await page.evaluate(() => {
    const d = window.__mixdesk.engine.decks[0]; d.seek(4); d.hotcues[0] = 0.2; d.performance.setSlip(true);
  });
  await page.locator('[data-deck="0"]').focus(); await page.keyboard.down('Digit1');
  await expect.poll(() => page.evaluate(() => window.__mixdesk.engine.decks[0].performance.slipCue?.source)).toBe('keyboard:0:digit:Digit1');
  await page.evaluate(() => window.__mixdesk.onAction({ action: 'hotcue', deck: 0, index: 0 }));
  await page.keyboard.up('Digit1');
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].performance.slipCue?.source)).toBe('midi:0:0');
  await page.evaluate(() => window.__mixdesk.onAction({ action: 'hotcueRelease', deck: 0, index: 0 }));
  await page.keyboard.down('Digit1'); await page.locator('[data-deck="1"]').click({ position: { x: 15, y: 15 } }); await page.keyboard.up('Digit1');
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].performance.slipCue)).toBeNull();
  await page.locator('[data-deck="0"]').focus(); await page.keyboard.down('Digit1');
  await page.evaluate(() => window.dispatchEvent(new Event('blur'))); await page.keyboard.up('Digit1');
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].performance.slipCue)).toBeNull();
  await page.locator('[data-deck="0"]').click({ position: { x: 15, y: 15 } });
  await page.keyboard.down('Shift'); await page.keyboard.press('Digit1'); await page.keyboard.up('Shift');
  await expect.poll(() => page.evaluate(() => window.__mixdesk.engine.decks[0].hotcues[0])).toBeNull();
});

test('Hot Cue pointer cancellation and focused button keys release Slip without swallowing Shift clear', async ({ page }) => {
  await ready(page); await toneTrack(page);
  await page.evaluate(() => { const d = window.__mixdesk.engine.decks[0]; d.seek(4); d.hotcues[0] = 0.2; d.performance.setSlip(true); });
  const cue = page.locator('[data-deck="0"] .hotcue[data-cue="0"]');
  await cue.dispatchEvent('pointerdown', { button: 0, pointerId: 3 });
  await expect.poll(() => page.evaluate(() => !!window.__mixdesk.engine.decks[0].performance.slipCue)).toBe(true);
  await cue.dispatchEvent('pointercancel', { pointerId: 3 });
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].performance.slipCue)).toBeNull();
  await cue.focus(); await page.keyboard.down('Space');
  await expect.poll(() => page.evaluate(() => !!window.__mixdesk.engine.decks[0].performance.slipCue)).toBe(true);
  await page.keyboard.up('Space');
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].performance.slipCue)).toBeNull();
  await cue.click({ modifiers: ['Shift'] });
  await expect.poll(() => page.evaluate(() => window.__mixdesk.engine.decks[0].hotcues[0])).toBeNull();
});

test('jumping to an existing Hot Cue does not rewrite its saved annotation', async ({ page }) => {
  await ready(page);
  await page.evaluate(async () => {
    const { engine, saveAnnotations } = window.__mixdesk, deck = engine.decks[0];
    deck.hotcues[0] = 1;
    await saveAnnotations(0);
    const put = IDBObjectStore.prototype.put;
    window.__annotationWrites = 0;
    IDBObjectStore.prototype.put = function (...args) {
      window.__annotationWrites++;
      return put.apply(this, args);
    };
  });
  await page.locator('[data-deck="0"] .hotcue[data-cue="0"]').click();
  expect(await page.evaluate(() => window.__annotationWrites)).toBe(0);
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].position)).toBe(1);
});

test('simulated MIX ports release Slip on hot unplug, retain keyboard ownership and send Cue LEDs', async ({ page }) => {
  await page.addInitScript(() => {
    const messages = [];
    const port = id => ({ id, name: 'DJCONTROL MIX', state: 'connected', async open() {}, async close() {}, send(data) { messages.push([...data]); } });
    const input = port('mix-in'), output = port('mix-out');
    const access = { inputs: new Map([[input.id, input]]), outputs: new Map([[output.id, output]]), onstatechange: null };
    Object.defineProperty(navigator, 'requestMIDIAccess', { value: async () => access });
    window.__slipMidi = { input, output, access, messages };
  });
  await ready(page); await toneTrack(page);
  await page.locator('#midi-panel-button').click(); await page.locator('#midi-scan').click(); await page.locator('#midi-connect').click();
  await expect(page.locator('#midi-status')).toContainText('双向控制'); await page.locator('#midi-close').click();
  await page.evaluate(() => {
    const d = window.__mixdesk.engine.decks[0]; d.seek(4); d.hotcues[0] = 0.2; d.performance.setSlip(true);
    window.__slipMidi.input.onmidimessage({ data: [0x96, 0, 127] });
  });
  await expect(page.locator('[data-deck="0"] .hotcue[data-cue="0"]')).toHaveAttribute('aria-pressed', 'true');
  await expect.poll(() => page.evaluate(() => window.__slipMidi.messages.some(m => m[0] === 0x96 && m[1] === 0 && m[2] === 127))).toBe(true);
  const release = await page.evaluate(async () => {
    const d = window.__mixdesk.engine.decks[0], m = window.__slipMidi, background = d.performance.backgroundPosition;
    m.input.state = 'disconnected'; m.access.onstatechange();
    await new Promise(r => setTimeout(r, 50));
    return { gap: Math.abs(d.position - background), active: d.performance.slipCue, playing: d.playing, handler: m.input.onmidimessage, cleared: m.messages.some(m => m[0] === 0x96 && m[1] === 0 && m[2] === 0) };
  });
  expect(release.active).toBeNull(); expect(release.handler).toBeNull(); expect(release.playing).toBe(true); expect(release.cleared).toBe(true); expect(release.gap).toBeLessThan(0.15);
  await expect(page.locator('[data-deck="0"] .hotcue[data-cue="0"]')).toHaveAttribute('aria-pressed', 'false');
  await page.locator('[data-deck="0"]').focus(); await page.keyboard.down('Digit1');
  await page.evaluate(() => window.__mixdesk.midi.disconnect());
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].performance.slipCue?.source)).toBe('keyboard:0:digit:Digit1');
  await page.keyboard.up('Digit1');
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].performance.slipCue)).toBeNull();
});
