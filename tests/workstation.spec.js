import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-deck="0"] .track-title')).toHaveText('Night Drive');
  await expect(page.locator('[data-deck="1"] .track-title')).toHaveText('After Hours');
});

async function slider(page, selector, value) {
  await page.locator(selector).evaluate((element, value) => { element.value = value; element.dispatchEvent(new Event('input', { bubbles: true })); }, value);
}

test('two real audio decks render without runtime errors or overflow', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await expect(page.locator('#track-count')).toHaveText('2 首');
  await expect(page.locator('canvas:visible')).toHaveCount(2);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({ path: 'screenshots/mixdesk-desktop.png', fullPage: true });
  await page.getByRole('button', { name: '播放 A', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__mixdesk.previewState.meters[0])).toBeGreaterThan(0.01);
  await expect.poll(() => page.evaluate(() => window.__mixdesk.engine.decks[0].position)).toBeGreaterThan(0.3);
  await page.getByRole('button', { name: '暂停 A', exact: true }).click();
  const paused = await page.evaluate(() => window.__mixdesk.engine.decks[0].position);
  await page.waitForTimeout(200);
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].position)).toBeCloseTo(paused, 5);
  expect(errors).toEqual([]);
});

test('seek, cue and hot cues preserve exact timeline positions', async ({ page }) => {
  await slider(page, '[data-deck="0"] .seek', 250);
  const expected = await page.evaluate(() => window.__mixdesk.engine.decks[0].buffer.duration / 4);
  await page.locator('[data-deck="0"] .set-cue').click();
  await page.locator('[data-deck="0"] [data-cue="0"]').click();
  await slider(page, '[data-deck="0"] .seek', 500);
  await page.locator('[data-deck="0"] .cue-button').click();
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].position)).toBeCloseTo(expected, 4);
  await slider(page, '[data-deck="0"] .seek', 600);
  await page.locator('[data-deck="0"] [data-cue="0"]').click();
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].position)).toBeCloseTo(expected, 4);
  await page.locator('[data-deck="0"] [data-cue="0"]').click({ modifiers: ['Shift'] });
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].hotcues[0])).toBeNull();
});

test('tempo sync and loop boundaries agree with the audio clock', async ({ page }) => {
  await page.locator('[data-deck="1"] .sync-button').click();
  const bpms = await page.evaluate(() => window.__mixdesk.engine.decks.map(deck => deck.bpm * deck.rate));
  expect(bpms[1]).toBeCloseTo(bpms[0], 5);
  await page.locator('[data-deck="0"] .loop-half').click();
  await page.locator('[data-deck="0"] .loop-half').click();
  await page.locator('[data-deck="0"] .loop-toggle').click();
  await page.getByRole('button', { name: '播放 A', exact: true }).click();
  await page.waitForTimeout(1300);
  const looped = await page.evaluate(() => ({ pos: window.__mixdesk.engine.decks[0].position, loop: window.__mixdesk.engine.decks[0].loop, playing: window.__mixdesk.engine.decks[0].playing, sourceLoop: window.__mixdesk.engine.decks[0].source.loop }));
  expect(looped.playing).toBeTruthy(); expect(looped.sourceLoop).toBeTruthy();
  expect(looped.pos).toBeGreaterThanOrEqual(looped.loop.start); expect(looped.pos).toBeLessThan(looped.loop.end);
  await slider(page, '[data-deck="0"] .seek', 500);
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].loop)).toBeNull();
});

test('continuous SYNC follows source tempo and manual override releases the target', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const [source, target] = window.__mixdesk.engine.decks;
    target.setSyncTarget(0);
    target.setSyncEnabled(true);
    source.setRate(1.1);
    await new Promise(resolve => setTimeout(resolve, 140));
    const followed = { enabled: target.syncEnabled, source: source.musicalBpm, target: target.musicalBpm, rate: target.rate };
    target.setRate(0.9);
    await new Promise(resolve => setTimeout(resolve, 140));
    return { followed, released: { enabled: target.syncEnabled, rate: target.rate, bpm: target.musicalBpm } };
  });
  expect(result.followed.enabled).toBeTruthy();
  expect(result.followed.target).toBeCloseTo(result.followed.source, 2);
  expect(result.followed.rate).toBeGreaterThan(1.05);
  expect(result.released.enabled).toBeFalsy();
  expect(result.released.rate).toBeCloseTo(0.9, 3);
});

test('Auto Gain estimates a bounded per-track gain and auto Hot Cue analysis follows the grid', async ({ page }) => {
  const result = await page.evaluate(() => {
    const { context } = window.__mixdesk.engine, low = context.createBuffer(1, context.sampleRate * 4, context.sampleRate), high = context.createBuffer(1, context.sampleRate * 4, context.sampleRate);
    low.getChannelData(0).fill(0.04); high.getChannelData(0).fill(0.24);
    const beat = context.createBuffer(1, context.sampleRate * 12, context.sampleRate), data = beat.getChannelData(0), step = Math.floor(context.sampleRate * 0.5);
    for (let i = 0; i < data.length; i += step) for (let j = 0; j < Math.min(step, data.length - i); j++) data[i + j] = Math.exp(-j / 120) * (i % (step * 8) === 0 ? 0.9 : 0.35);
    const lowGain = window.__mixdesk.estimateAutoGain(low), highGain = window.__mixdesk.estimateAutoGain(high);
    const hotcues = window.__mixdesk.estimateAutoHotcues(beat, 120, 0);
    return { lowGain, highGain, hotcues };
  });
  expect(result.lowGain).toBeGreaterThan(result.highGain);
  expect(result.highGain).toBeGreaterThanOrEqual(0.25);
  expect(result.lowGain).toBeLessThanOrEqual(4);
  expect(result.hotcues.length).toBeGreaterThan(0);
  expect(result.hotcues[0]).toBe(0);
  expect(result.hotcues.length).toBeLessThanOrEqual(8);
});

test('crossfader, channel volume, EQ and master affect the actual output signal', async ({ page }) => {
  await page.getByRole('button', { name: '播放 A', exact: true }).click();
  const outputRms = () => page.evaluate(() => {
    const analyser = window.__mixdesk.engine.analyser, samples = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(samples);
    return Math.sqrt(samples.reduce((sum, value) => sum + value*value, 0) / samples.length);
  });
  await expect.poll(outputRms).toBeGreaterThan(0.005);
  await slider(page, '#crossfader', 100);
  await expect.poll(outputRms).toBeLessThan(0.0001);
  await page.locator('#center-crossfader').click();
  await expect.poll(outputRms).toBeGreaterThan(0.005);
  await slider(page, '[data-channel="0"] .channel-volume', 0);
  await expect.poll(outputRms).toBeLessThan(0.0001);
  await slider(page, '[data-channel="0"] .channel-volume', 80);
  await slider(page, '[data-channel="0"] [data-band="low"]', -24);
  await expect.poll(() => page.evaluate(() => window.__mixdesk.engine.decks[0].low.gain.value)).toBeCloseTo(-24, 1);
  await slider(page, '#master', 0);
  await expect.poll(outputRms).toBeLessThan(0.0001);
});

function clickWav(bpm = 120, duration = 12) {
  const sampleRate = 22050, length = duration * sampleRate;
  const buffer = Buffer.alloc(44 + length * 2);
  buffer.write('RIFF', 0); buffer.writeUInt32LE(buffer.length - 8, 4); buffer.write('WAVEfmt ', 8);
  buffer.writeUInt32LE(16, 16); buffer.writeUInt16LE(1, 20); buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24); buffer.writeUInt32LE(sampleRate * 2, 28); buffer.writeUInt16LE(2, 32); buffer.writeUInt16LE(16, 34);
  buffer.write('data', 36); buffer.writeUInt32LE(length * 2, 40);
  for (let i = 0; i < length; i++) {
    const phase = (i/sampleRate) % (60/bpm);
    const value = Math.sin(2*Math.PI*1200*phase) * Math.exp(-phase*90) * 0.75;
    buffer.writeInt16LE(Math.round(value*32767), 44+i*2);
  }
  return buffer;
}

test('real local file import, BPM estimate, persistence, manual correction and removal', async ({ page }) => {
  await page.locator('#file-input').setInputFiles({ name: 'Test Pulse 120.wav', mimeType: 'audio/wav', buffer: clickWav() });
  await expect(page.locator('#track-count')).toHaveText('3 首');
  await expect.poll(() => page.evaluate(() => window.__mixdesk.tracks.find(track => track.title === 'Test Pulse 120')?.bpm)).toBeCloseTo(120, 0);
  expect(await page.evaluate(() => window.__mixdesk.tracks.find(track => track.title === 'Test Pulse 120')?.gridEstimated)).toBeTruthy();
  await page.getByRole('button', { name: '将 Test Pulse 120 载入 A 台' }).click();
  await expect(page.locator('[data-deck="0"] .track-title')).toHaveText('Test Pulse 120');
  await page.locator('[data-deck="0"] .bpm-value').click();
  await page.getByRole('spinbutton', { name: '原始 BPM' }).fill('128');
  await page.getByRole('button', { name: '保存', exact: true }).click();
  await expect(page.locator('#bpm-dialog')).not.toBeVisible();
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].bpm)).toBe(128);
  await page.reload();
  await expect(page.locator('#track-count')).toHaveText('3 首');
  expect(await page.evaluate(() => window.__mixdesk.tracks.find(track => track.title === 'Test Pulse 120').bpm)).toBe(128);
  await page.getByRole('button', { name: '移除 Test Pulse 120' }).click();
  await expect(page.locator('#track-count')).toHaveText('2 首');
});

test('automatic first-beat estimate provides a conservative grid anchor', async ({ page }) => {
  const result = await page.evaluate(() => {
    const e = window.__mixdesk.engine, sampleRate = e.context.sampleRate, b = e.context.createBuffer(1, sampleRate * 4, sampleRate), data = b.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate, phase = t % 0.5;
      data[i] = phase < 0.02 ? Math.exp(-phase * 180) * 0.8 : 0;
    }
    return window.__mixdesk.estimateFirstBeat(b, 120);
  });
  expect(result.offset).toBeLessThan(0.03);
  expect(result.confidence).toBeGreaterThan(0.4);
});

test('dynamic beat-grid analysis preserves a deliberate tempo change', async ({ page }) => {
  const result = await page.evaluate(() => {
    const e = window.__mixdesk.engine, sampleRate = e.context.sampleRate, b = e.context.createBuffer(1, sampleRate * 24, sampleRate), data = b.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / sampleRate, bpm = t < 12 ? 120 : 150, phase = t % (60 / bpm);
      data[i] = phase < .02 ? Math.exp(-phase * 180) * .8 : 0;
    }
    return window.__mixdesk.estimateDynamicBeatGrid(b, 150, 0);
  });
  expect(result.segments).toBeGreaterThanOrEqual(2);
  expect(result.beatGrid[0].bpm).toBeCloseTo(120, 0);
  expect(result.beatGrid.at(-1).bpm).toBeCloseTo(150, 0);
  expect(result.beatGrid.at(-1).start).toBeGreaterThan(9);
  expect(result.beatGrid.at(-1).start).toBeLessThan(15);
});

test('variable-tempo timeline math preserves later segments and counts beats across boundaries', async ({ page }) => {
  const result = await page.evaluate(() => {
    const deck = window.__mixdesk.engine.decks[0];
    deck.beatGrid = [{ start: 0, offset: 0, bpm: 120 }, { start: 2, offset: 1, bpm: 60 }, { start: 6, offset: 5, bpm: 90 }];
    const across = deck.positionAfterBeats(1, 4);
    const count = deck.beatsBetween(1, across);
    const backward = deck.positionAfterBeats(7, -6);
    const backwardCount = deck.beatsBetween(backward, 7);
    deck.setBeatGridSegment(4, 75);
    return { across, count, backward, backwardCount, starts: deck.beatGrid.map(segment => segment.start), laterBpm: deck.beatGrid.at(-1).bpm };
  });
  expect(result.across).toBeCloseTo(4, 6);
  expect(result.count).toBeCloseTo(4, 6);
  expect(result.backward).toBeCloseTo(1.75, 6);
  expect(result.backwardCount).toBeCloseTo(6, 6);
  expect(result.starts).toEqual([0, 2, 4, 6]);
  expect(result.laterBpm).toBe(90);
});

test('untagged imported audio receives an editable estimated key hint', async ({ page }) => {
  await page.locator('#file-input').setInputFiles({ name: 'Key hint.wav', mimeType: 'audio/wav', buffer: clickWav(120, 12) });
  await expect(page.locator('#track-count')).toHaveText('3 首');
  const info = await page.evaluate(() => { const t = window.__mixdesk.tracks.find(track => track.title === 'Key hint'); return { key: t.key, estimated: t.keyEstimated }; });
  expect(info.key).toMatch(/^[A-G](#)?m?$/);
  expect(info.estimated).toBeTruthy();
});

test('waveform analysis exposes separate low, mid and high frequency energy', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { spectrumFor } = await import('/src/audio.js');
    const context = window.__mixdesk.engine.context;
    const buffer = context.createBuffer(1, context.sampleRate * 2, context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      const t = i / buffer.sampleRate;
      data[i] = 0.2 * Math.sin(2 * Math.PI * 120 * t) + 0.2 * Math.sin(2 * Math.PI * 4200 * t);
    }
    const spectrum = spectrumFor(buffer, 16);
    let low = 0, mid = 0, high = 0;
    for (let i = 0; i < 16; i++) { low += spectrum[i * 3]; mid += spectrum[i * 3 + 1]; high += spectrum[i * 3 + 2]; }
    return { length: spectrum.length, low: low / 16, mid: mid / 16, high: high / 16 };
  });
  expect(result.length).toBe(48);
  expect(result.low).toBeGreaterThan(0.15);
  expect(result.high).toBeGreaterThan(0.15);
  expect(result.mid).toBeLessThan(Math.min(result.low, result.high));
});

test('recording exports nonempty audio from the mixed output', async ({ page }) => {
  await page.getByRole('button', { name: '播放 A', exact: true }).click();
  await page.locator('#record').click();
  await expect(page.locator('#record')).toHaveClass(/recording/);
  await page.waitForTimeout(1400);
  const downloadPromise = page.waitForEvent('download');
  await page.locator('#record').click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toMatch(/^MIXDESK-.*\.webm$/);
  const path = await download.path();
  const { readFile } = await import('node:fs/promises');
  const data = await readFile(path);
  expect(data.length).toBeGreaterThan(5000);
  const rms = await page.evaluate(async bytes => {
    const buffer = await window.__mixdesk.engine.context.decodeAudioData(new Uint8Array(bytes).buffer);
    const samples = buffer.getChannelData(0);
    return Math.sqrt(samples.reduce((sum,x)=>sum+x*x,0)/samples.length);
  }, [...data]);
  expect(rms).toBeGreaterThan(0.005);
  const wavDownload = page.waitForEvent('download');
  await page.locator('#export-wav').click();
  const wav = await wavDownload;
  expect(wav.suggestedFilename()).toMatch(/\.wav$/);
  const pcm = await readFile(await wav.path());
  expect(pcm.toString('ascii', 0, 4)).toBe('RIFF');
  expect(pcm.toString('ascii', 8, 12)).toBe('WAVE');
  expect(pcm.readUInt16LE(20)).toBe(1);
  expect(pcm.readUInt16LE(34)).toBe(16);
  expect(pcm.readUInt32LE(40)).toBe(pcm.length - 44);
  const duration = await page.evaluate(async bytes => (await window.__mixdesk.engine.context.decodeAudioData(new Uint8Array(bytes).buffer)).duration, [...pcm]);
  expect(duration).toBeGreaterThan(1);
});

test('search, help and compact viewport remain usable', async ({ page }) => {
  await page.locator('#search').fill('after');
  await expect(page.locator('#track-list tr')).toHaveCount(1);
  await expect(page.locator('#track-list')).toContainText('After Hours');
  await page.locator('#search').fill('');
  await page.getByRole('button', { name: '使用指南' }).click();
  await expect(page.locator('#help-dialog')).toBeVisible();
  await page.getByRole('button', { name: '开始混音' }).click();
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBeTruthy();
  await page.screenshot({ path: 'screenshots/mixdesk-mobile.png', fullPage: true });
});
