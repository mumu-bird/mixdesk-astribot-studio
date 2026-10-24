import { test, expect } from '@playwright/test';

function toneWav(frequency, seconds = 4, sampleRate = 44100) {
  const count = Math.floor(seconds * sampleRate);
  const data = Buffer.alloc(count * 2);
  for (let i = 0; i < count; i++) data.writeInt16LE(Math.round(Math.sin((2 * Math.PI * frequency * i) / sampleRate) * 9500), i * 2);
  const header = Buffer.alloc(44);
  header.write('RIFF', 0); header.writeUInt32LE(36 + data.length, 4); header.write('WAVE', 8);
  header.write('fmt ', 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22); header.writeUInt32LE(sampleRate, 24); header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34); header.write('data', 36); header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

function beatWav(bpm = 120, seconds = 8, sampleRate = 44100, firstBeatOffset = 0) {
  const count = Math.floor(seconds * sampleRate);
  const data = Buffer.alloc(count * 2);
  const beatSamples = Math.round(sampleRate * 60 / bpm);
  const pulseSamples = Math.round(sampleRate * 0.045);
  for (let start = Math.round(firstBeatOffset * sampleRate); start < count; start += beatSamples) {
    for (let offset = 0; offset < pulseSamples && start + offset < count; offset++) {
      const envelope = 0.82 * Math.exp(-offset / (sampleRate * 0.014));
      const sample = Math.round(Math.sin((2 * Math.PI * 75 * offset) / sampleRate) * envelope * 32767);
      data.writeInt16LE(Math.max(-32768, Math.min(32767, sample)), (start + offset) * 2);
    }
  }
  const header = Buffer.alloc(44);
  header.write('RIFF', 0); header.writeUInt32LE(36 + data.length, 4); header.write('WAVE', 8);
  header.write('fmt ', 12); header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20);
  header.writeUInt16LE(1, 22); header.writeUInt32LE(sampleRate, 24); header.writeUInt32LE(sampleRate * 2, 28);
  header.writeUInt16LE(2, 32); header.writeUInt16LE(16, 34); header.write('data', 36); header.writeUInt32LE(data.length, 40);
  return Buffer.concat([header, data]);
}

async function addTrack(page, slot, name, frequency) {
  await page.locator('.track-card').nth(slot).locator('input[type=file]').setInputFiles({
    name, mimeType: 'audio/wav', buffer: toneWav(frequency),
  });
  await expect(page.locator('.track-card').nth(slot).locator('.track-meta')).toContainText('BPM 未设置');
}

async function resetDraft(page) {
  await page.evaluate(async () => {
    const project = await fetch('/api/draft').then(response => response.json());
    for (const group of Object.values(project.groups)) {
      group.songs = [0, 1].map(() => ({ assetId: null, title: '', duration: 0, bpm: null, start: 0, end: 0, performanceStart: 0, waveform: [] }));
      group.events = [];
      group.order = [0, 1];
      group.transition = { overlap: 8, curve: 'equalPower' };
    }
    const response = await fetch('/api/draft', {
      method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project }),
    });
    if (!response.ok) throw new Error('test draft reset failed');
  });
  await page.reload();
}

async function scrubTo(page, proportion, trackIndex = null) {
  await page.locator('.timeline-section').scrollIntoViewIfNeeded();
  const area = trackIndex == null ? page.locator('.event-lane-area').nth(0) : page.locator('.track-lanes').nth(trackIndex).locator('.track-lane-area');
  const box = await area.boundingBox();
  await page.mouse.click(box.x + box.width * proportion, box.y + box.height / 2);
}

async function watchDropPreview(page, lane) {
  await page.locator('.timeline-section').scrollIntoViewIfNeeded();
  await page.evaluate(laneId => {
    const target = document.querySelector(`[data-drop-lane="${laneId}"]`);
    window.__djDropPreview = new Promise(resolve => {
      const observer = new MutationObserver(records => {
        for (const record of records) for (const node of record.addedNodes) {
          if (!(node instanceof HTMLElement)) continue;
          const preview = node.matches('.operation-drop-preview') ? node : node.querySelector('.operation-drop-preview');
          if (!preview) continue;
          observer.disconnect();
          resolve({ operation: preview.dataset.previewOperation, time: Number(preview.dataset.previewTime), width: preview.style.width });
          return;
        }
      });
      observer.observe(target, { childList: true, subtree: true });
      setTimeout(() => { observer.disconnect(); resolve(null); }, 5000);
    });
  }, lane);
}

test('imports two songs, edits reverse timing, saves and previews a continuous real mix', async ({ page }) => {
  await page.goto('/');
  await resetDraft(page);
  await expect(page.getByRole('heading', { name: '音乐预排' })).toBeVisible();
  await expect(page.locator('.workspace-grid')).toBeVisible();
  const bounds = await page.locator('.workspace-grid').boundingBox();
  expect(bounds.width).toBeGreaterThan(1050);

  await addTrack(page, 0, 'Midnight Circuit.wav', 440);
  await addTrack(page, 1, 'Glass Horizon.wav', 880);
  await expect(page.locator('.track-card').nth(0).locator('.track-meta')).toContainText('00:04');

  const overlap = page.getByRole('slider', { name: '转场重叠时长' });
  await overlap.focus();
  await overlap.press('Home');
  for (let index = 0; index < 4; index++) await overlap.press('ArrowRight');
  await expect(page.locator('.overlap-readout')).toContainText('2s');

  await page.getByRole('button', { name: '机器人动作', exact: true }).click();
  await expect(page.getByText('未验证动作')).toBeVisible();
  // Keep the marker on deck A so the reverse insertion below demonstrates
  // the source-track event shift even though both decks start at 00:00.
  await page.locator('.timeline-song.song-0').click();
  await page.waitForTimeout(50);
  await scrubTo(page, 0.82, 0);
  await page.getByRole('button', { name: '标记', exact: true }).click();
  const markerTime = Number(await page.locator('.property-body input[type=number]').first().inputValue());
  expect(markerTime).toBeGreaterThan(4.5);
  const marker = page.locator('.event-clip.event-marker');
  await expect(marker).toHaveCount(1);
  const markerStart = Number(await marker.getAttribute('data-time'));

  await scrubTo(page, 0.15, 0);
  await page.locator('[data-operation="scratch-reverse"]').click();
  await expect(page.locator('.event-clip[data-operation="scratch-reverse"]')).toHaveCount(1);
  await expect(page.locator('.source-range').filter({ hasText: '新增演出时长' })).toContainText('+4.0s');
  const shiftedMarkerTime = Number(await marker.getAttribute('data-time'));
  expect(shiftedMarkerTime).toBeGreaterThan(markerStart + 3.5);
  const markerSlot = await marker.getAttribute('data-slot');
  await marker.click();
  await page.getByRole('combobox', { name: '所在曲目' }).waitFor();
  expect(await page.getByRole('combobox', { name: '所在曲目' }).inputValue()).toBe(markerSlot);
  await page.getByRole('button', { name: '交换顺序' }).click();
  expect(await marker.getAttribute('data-slot')).toBe(markerSlot);
  expect(await page.getByRole('combobox', { name: '所在曲目' }).inputValue()).toBe(markerSlot);
  await page.getByRole('button', { name: '交换顺序' }).click();

  await page.getByRole('button', { name: '保存草稿' }).click();
  await expect(page.locator('.save-state')).toContainText('已保存');
  await page.reload();
  await expect(page.locator('.event-clip.event-dj')).toContainText('搓碟倒放');
  const reloadedMarkerTime = Number(await page.locator('.event-clip.event-marker').getAttribute('data-time'));
  expect(reloadedMarkerTime).toBeCloseTo(shiftedMarkerTime, 1);

  await page.getByRole('button', { name: /试听混音/ }).click();
  await expect(page.getByText('正在试听')).toBeVisible();
  await page.waitForTimeout(400);
  const firstTrack = await page.evaluate(() => {
    const analyser = window.__djMaster.engine.analyser;
    const wave = new Float32Array(analyser.fftSize); analyser.getFloatTimeDomainData(wave);
    const rms = Math.sqrt(wave.reduce((sum, sample) => sum + sample * sample, 0) / wave.length);
    let crossings = 0; for (let i = 1; i < wave.length; i++) if (wave[i - 1] < 0 && wave[i] >= 0) crossings++;
    return { rms, frequency: crossings * window.__djMaster.engine.context.sampleRate / wave.length };
  });
  expect(firstTrack.rms).toBeGreaterThan(0.03);
  expect(firstTrack.frequency).toBeGreaterThan(250);
  expect(firstTrack.frequency).toBeLessThan(650);
  await expect(page.locator('.event-clip.is-active')).toHaveCount(1);

  const mixMetrics = await page.evaluate(async () => {
    const engine = window.__djMaster.engine;
    const state = window.__djMaster.state;
    const context = engine.context;
    const wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    while (context.currentTime < state.startedAt + 3.05) await wait(20);
    const rmsValues = [];
    while (context.currentTime < state.startedAt + 5.05) {
      const data = new Float32Array(engine.analyser.fftSize); engine.analyser.getFloatTimeDomainData(data);
      rmsValues.push(Math.sqrt(data.reduce((sum, sample) => sum + sample * sample, 0) / data.length));
      await wait(35);
    }
    while (context.currentTime < state.startedAt + 6.2) await wait(20);
    const data = new Float32Array(engine.analyser.fftSize); engine.analyser.getFloatTimeDomainData(data);
    let crossings = 0; for (let i = 1; i < data.length; i++) if (data[i - 1] < 0 && data[i] >= 0) crossings++;
    return { minDuringFade: Math.min(...rmsValues), maxDuringFade: Math.max(...rmsValues),
      secondFrequency: crossings * context.sampleRate / data.length, elapsed: context.currentTime - state.startedAt };
  });
  expect(mixMetrics.minDuringFade).toBeGreaterThan(0.04);
  expect(mixMetrics.maxDuringFade).toBeLessThan(0.5);
  expect(mixMetrics.secondFrequency).toBeGreaterThan(700);
  expect(mixMetrics.secondFrequency).toBeLessThan(1050);
  await expect(page.locator('.time-code')).not.toContainText('00:00');
  await page.getByRole('button', { name: /停止试听/ }).click();
});

test('previews each imported track independently from its track card', async ({ page }) => {
  await page.goto('/');
  await resetDraft(page);
  await addTrack(page, 0, 'Solo Preview A.wav', 440);
  await addTrack(page, 1, 'Solo Preview B.wav', 660);

  await expect(page.getByRole('button', { name: '试听曲目 1' })).toBeEnabled();
  await expect(page.getByRole('button', { name: '试听曲目 2' })).toBeEnabled();
  await page.getByRole('button', { name: '试听曲目 1' }).click();
  await expect(page.getByRole('button', { name: '停止曲目 1' })).toBeVisible();
  await page.getByRole('button', { name: '试听曲目 2' }).click();
  await expect(page.getByRole('button', { name: '停止曲目 2' })).toBeVisible();
  await expect(page.getByRole('button', { name: '试听曲目 1' })).toBeVisible();
  await page.getByRole('button', { name: '停止曲目 2' }).click();
  await expect(page.getByRole('button', { name: '试听曲目 2' })).toBeVisible();
});

test('audition applies timeline filter automation on the mapped deck and restores it', async ({ page }) => {
  await page.goto('/');
  await resetDraft(page);
  await addTrack(page, 0, 'Filter Preview A.wav', 880);
  await addTrack(page, 1, 'Filter Preview B.wav', 880);
  const overlap = page.getByRole('slider', { name: '转场重叠时长' });
  await overlap.focus(); await overlap.press('Home');
  await scrubTo(page, 0.125);
  await expect(page.locator('.operation-card[data-operation="filter-sweep"] .operation-audible-hint')).toContainText('可试听');
  await page.locator('.operation-card[data-operation="filter-sweep"]').click();
  await scrubTo(page, 0.625);
  await page.locator('.operation-card[data-operation="filter-sweep"]').click();
  await page.getByRole('spinbutton', { name: '操作参数 滤波量' }).fill('0.7');
  await expect(page.locator('.event-clip[data-operation="filter-sweep"]')).toHaveCount(2);
  await expect(page.locator('.operation-provenance')).toContainText('试听中会实际应用到音频');

  await page.getByRole('button', { name: /试听混音/ }).click();
  const levels = await page.evaluate(async () => {
    const engine = window.__djMaster.engine;
    const state = window.__djMaster.state;
    const sampleAt = async seconds => {
      while (engine.context.currentTime < state.startedAt + seconds) await new Promise(resolve => setTimeout(resolve, 10));
      const data = new Float32Array(engine.analyser.fftSize);
      engine.analyser.getFloatTimeDomainData(data);
      return Math.sqrt(data.reduce((sum, sample) => sum + sample * sample, 0) / data.length);
    };
    const before = await sampleAt(0.45);
    const during = await sampleAt(1.8);
    const restored = await sampleAt(3.55);
    return { before, during, restored,
      effect: state.previewEffects.map(item => ({ id: item.operation.id, deck: item.deck, relativeStart: item.start - state.startedAt, duration: item.duration, target: item.target })) };
  });
  expect(levels.before).toBeGreaterThan(0.04);
  expect(levels.during).toBeLessThan(levels.before * 0.68);
  expect(levels.restored).toBeGreaterThan(levels.during * 1.5);
  expect(levels.effect).toHaveLength(2);
  expect(levels.effect[0].id).toBe('filter-sweep');
  expect(levels.effect[0].deck).toBe(0);
  expect(levels.effect[0].relativeStart).toBeCloseTo(1, 1);
  expect(levels.effect[0].duration).toBe(2);
  expect(levels.effect[0].target).toBeCloseTo(610, -1);
  expect(levels.effect[1].deck).toBe(1);
  expect(levels.effect[1].relativeStart).toBeCloseTo(5, 1);
  expect(levels.effect[1].target).toBeCloseTo(1355, 0);
  expect(await page.evaluate(() => window.__djMaster.engine.decks[1]._djPreviewFilterPath.highpass.type)).toBe('highpass');
  await page.getByRole('button', { name: /停止试听/ }).click();
  expect(await page.evaluate(() => window.__djMaster.engine.decks[0].filter.frequency.value)).toBe(22000);
});

test('overlapping filter sweeps continue from the active filter value without snapping open', async ({ page }) => {
  await page.goto('/');
  await resetDraft(page);
  await addTrack(page, 0, 'Filter Overlap A.wav', 2200);
  await addTrack(page, 1, 'Filter Overlap B.wav', 2200);
  const overlap = page.getByRole('slider', { name: '转场重叠时长' });
  await overlap.focus(); await overlap.press('Home');

  await scrubTo(page, 0.125);
  await page.locator('.operation-card[data-operation="filter-sweep"]').click();
  await scrubTo(page, 0.1875);
  await page.locator('.operation-card[data-operation="filter-sweep"]').click();
  await page.getByRole('spinbutton', { name: '操作参数 滤波量' }).fill('0.7');
  await page.getByRole('button', { name: /试听混音/ }).click();

  const levels = await page.evaluate(async () => {
    const engine = window.__djMaster.engine;
    const state = window.__djMaster.state;
    const sampleAt = async seconds => {
      while (engine.context.currentTime < state.startedAt + seconds) await new Promise(resolve => setTimeout(resolve, 5));
      const data = new Float32Array(engine.analyser.fftSize);
      engine.analyser.getFloatTimeDomainData(data);
      return Math.sqrt(data.reduce((sum, sample) => sum + sample * sample, 0) / data.length);
    };
    return {
      beforeSecond: await sampleAt(1.4),
      justAfterSecond: await sampleAt(1.52),
      later: await sampleAt(1.8),
      effects: state.previewEffects.map(item => ({ start: item.start - state.startedAt, target: item.target })),
    };
  });
  expect(levels.effects).toHaveLength(2);
  expect(levels.effects[1].start).toBeCloseTo(1.5, 1);
  expect(levels.effects[1].target).toBeCloseTo(1355, 0);
  expect(levels.justAfterSecond).toBeLessThan(levels.beforeSecond * 2);
  expect(levels.later).toBeGreaterThan(levels.justAfterSecond * 2);
  await page.getByRole('button', { name: /停止试听/ }).click();
  const restoredFilterPath = await page.evaluate(() => {
    const path = window.__djMaster.engine.decks[0]._djPreviewFilterPath;
    return { lowpass: path.lowpassGain.gain.value, highpass: path.highpassGain.gain.value };
  });
  expect(restoredFilterPath.lowpass).toBe(1);
  expect(restoredFilterPath.highpass).toBe(0);
});

test('audition schedules mapped filter, bass and channel-level operations on their source decks', async ({ page }) => {
  await page.goto('/');
  await resetDraft(page);
  await addTrack(page, 0, 'Mapped Preview A.wav', 440);
  await addTrack(page, 1, 'Mapped Preview B.wav', 660);
  const overlap = page.getByRole('slider', { name: '转场重叠时长' });
  await overlap.focus(); await overlap.press('Home');

  await scrubTo(page, 0.125);
  await page.locator('.operation-card[data-operation="filter-sweep"]').click();
  await scrubTo(page, 0.25);
  await page.locator('.operation-card[data-operation="bass-cut"]').click();
  await scrubTo(page, 0.625);
  await page.locator('.operation-card[data-operation="channel-level"]').click();
  await page.getByRole('spinbutton', { name: '操作参数 目标值' }).fill('0.3');

  await page.getByRole('button', { name: /试听混音/ }).click();
  await expect(page.getByText('正在试听')).toBeVisible();
  const effects = await page.evaluate(() => window.__djMaster.state.previewEffects.map(item => ({
    id: item.operation.id, deck: item.deck, start: Number((item.start - window.__djMaster.state.startedAt).toFixed(2)),
    duration: item.duration, target: Number(item.target.toFixed(2)),
  })));
  expect(effects).toEqual([
    { id: 'filter-sweep', deck: 0, start: 1, duration: 2, target: 612.53 },
    { id: 'bass-cut', deck: 0, start: 2, duration: 2, target: -12 },
    { id: 'channel-level', deck: 1, start: 5, duration: 1.5, target: 0.3 },
  ]);
  await page.getByRole('button', { name: /停止试听/ }).click();
});

test('audition applies mapped FX, tempo, pitch and sampler controls on the audio clock', async ({ page }) => {
  await page.goto('/');
  await resetDraft(page);
  await page.getByRole('button', { name: '加载一分钟演示' }).click();
  await expect(page.getByRole('button', { name: /试听混音/ })).toBeEnabled({ timeout: 15000 });
  for (const id of ['fx-1', 'tempo-rate', 'pitch-shift', 'sampler-kick']) {
    await page.locator(`.operation-card[data-operation="${id}"]`).click();
  }
  await page.getByRole('button', { name: /试听混音/ }).click();
  await expect(page.getByText('正在试听')).toBeVisible();
  const preview = await page.evaluate(() => window.__djMaster.state.previewEffects.map(item => ({
    id: item.operation.id, target: item.target, execution: item.operation.preview,
  })));
  expect(preview).toEqual(expect.arrayContaining([
    { id: 'fx-1', target: 'echo', execution: 'audio-effect' },
    { id: 'tempo-rate', target: 1.08, execution: 'audio-rate' },
    { id: 'pitch-shift', target: 1.122462048309373, execution: 'audio-pitch' },
    { id: 'sampler-kick', target: 'kick', execution: 'audio-sample' },
  ]));
  const samplerScheduled = await page.evaluate(() => window.__djMaster.engine.sampler.decks[0].slots[0].startedAt >= window.__djMaster.state.startedAt);
  expect(samplerScheduled).toBeTruthy();
  await page.getByRole('button', { name: /停止试听/ }).click();
});

test('audition audibly applies and restores bass cut and channel level envelopes', async ({ page }) => {
  await page.goto('/');
  await resetDraft(page);
  await addTrack(page, 0, 'Bass Preview A.wav', 80);
  await addTrack(page, 1, 'Bass Preview B.wav', 80);
  const overlap = page.getByRole('slider', { name: '转场重叠时长' });
  await overlap.focus(); await overlap.press('Home');

  await scrubTo(page, 0.0625);
  await page.locator('.operation-card[data-operation="bass-cut"]').click();
  await scrubTo(page, 0.5625);
  await page.locator('.operation-card[data-operation="channel-level"]').click();
  await page.getByRole('spinbutton', { name: '操作参数 目标值' }).fill('0.3');
  await page.getByRole('button', { name: /试听混音/ }).click();

  const levels = await page.evaluate(async () => {
    const engine = window.__djMaster.engine;
    const state = window.__djMaster.state;
    const sampleAt = async seconds => {
      while (engine.context.currentTime < state.startedAt + seconds) await new Promise(resolve => setTimeout(resolve, 10));
      const data = new Float32Array(engine.analyser.fftSize);
      engine.analyser.getFloatTimeDomainData(data);
      return Math.sqrt(data.reduce((sum, sample) => sum + sample * sample, 0) / data.length);
    };
    return {
      bassBefore: await sampleAt(0.25),
      bassDuring: await sampleAt(1.5),
      bassRestored: await sampleAt(3.1),
      levelBefore: await sampleAt(4.25),
      levelDuring: await sampleAt(5.5),
      levelRestored: await sampleAt(6.7),
    };
  });
  expect(levels.bassDuring).toBeLessThan(levels.bassBefore * 0.5);
  expect(levels.bassRestored).toBeGreaterThan(levels.bassDuring * 1.7);
  expect(levels.levelDuring).toBeLessThan(levels.levelBefore * 0.55);
  expect(levels.levelRestored).toBeGreaterThan(levels.levelDuring * 1.5);
  await page.getByRole('button', { name: /停止试听/ }).click();
});

test('dragging a mapped DJ control creates an event with verified hardware mapping', async ({ page }) => {
  await page.goto('/');
  await resetDraft(page);
  await addTrack(page, 0, 'Blue Hour.wav', 330);
  await addTrack(page, 1, 'Silver Line.wav', 550);
  const overlap = page.getByRole('slider', { name: '转场重叠时长' });
  await overlap.focus(); await overlap.press('Home');

  const operation = page.locator('[data-operation="loop-4"]').first();
  const lane = page.locator('[data-drop-lane="djfx"]');
  const box = await lane.boundingBox();
  await watchDropPreview(page, 'djfx');
  await operation.dragTo(lane, { targetPosition: { x: box.width * 0.28, y: box.height / 2 } });
  const preview = await page.evaluate(() => window.__djDropPreview);
  expect(preview.operation).toBe('loop-4');
  expect(preview.width).toBe('30px');

  const event = page.locator('.event-clip[data-operation="loop-4"]');
  await expect(event).toHaveCount(1);
  await event.click();
  await expect(page.locator('.operation-provenance')).toContainText('DJControl_Mix.djm');
  await expect(page.locator('.operation-provenance')).toContainText('LOOP_4_BEAT_A');
  await expect(page.locator('.operation-provenance')).toContainText('loop');
  await expect(page.locator('.operation-provenance')).toContainText('逆向映射值');
  await expect(page.locator('.operation-provenance')).toContainText('4');
  await expect(page.locator('.operation-provenance')).toContainText('尚未连接');
  const beats = page.getByRole('spinbutton', { name: '操作参数 拍数' });
  await beats.fill('8');
  await expect(page.locator('.operation-parameters')).toContainText('"beats":8');
  await page.getByRole('button', { name: '保存草稿' }).click();
  await page.reload();
  await expect(page.locator('.event-clip[data-operation="loop-4"]')).toHaveCount(1);
  await page.locator('.event-clip[data-operation="loop-4"]').click();
  await expect(page.locator('.operation-parameters')).toContainText('"beats":8');
});

test('DJ operations and audio effects share one timeline lane while keeping source colors', async ({ page }) => {
  await page.goto('/');
  await resetDraft(page);
  await addTrack(page, 0, 'Unified Lane A.wav', 440);
  await addTrack(page, 1, 'Unified Lane B.wav', 660);
  const lane = page.locator('[data-drop-lane="djfx"]');
  await expect(lane).toHaveCount(1);
  await page.locator('.operation-card[data-operation="loop-4"]').click();
  await page.locator('.operation-card[data-operation="filter-sweep"]').click();
  await expect(lane.locator('.event-clip[data-operation="loop-4"]')).toHaveCount(1);
  await expect(lane.locator('.event-clip[data-operation="filter-sweep"]')).toHaveCount(1);
  await expect(lane.locator('.event-clip.event-dj[data-operation="loop-4"]')).toHaveCount(1);
  await expect(lane.locator('.event-clip.event-fx[data-operation="filter-sweep"]')).toHaveCount(1);
  await expect(page.getByText('DJ 操作 / 音效菜单', { exact: true })).toBeVisible();
});

test('instant controls have fixed-width markers and overlapping controls occupy separate layers', async ({ page }) => {
  await page.goto('/');
  await resetDraft(page);
  for (const id of ['loop-4', 'sync', 'hot-cue-1']) {
    await page.locator(`.operation-card[data-operation="${id}"]`).click();
  }

  const events = page.locator('.event-clip.event-instant');
  await expect(events).toHaveCount(3);
  await expect(page.locator('.operation-card[data-operation="loop-4"] .operation-timing')).toHaveText('单次');
  const layers = await events.evaluateAll(nodes => nodes.map(node => node.dataset.layer));
  expect(new Set(layers).size).toBe(3);
  for (const event of await events.all()) {
    await expect(event).toHaveAttribute('data-timing', 'instant');
    expect(await event.evaluate(node => node.getBoundingClientRect().width)).toBe(30);
  }
  await expect(page.getByText('瞬时按键 · 固定显示')).toBeVisible();
});

test('instant controls use the live timeline width to avoid unnecessary vertical stacking', async ({ page }) => {
  await page.setViewportSize({ width: 1920, height: 1000 });
  await page.goto('/');
  await resetDraft(page);
  await page.evaluate(async () => {
    const project = await fetch('/api/draft').then(response => response.json());
    for (const group of Object.values(project.groups)) {
      group.songs = group.songs.map((song, index) => ({ ...song, title: `Track ${index + 1}`, duration: 8, start: 0, end: 8, bpm: null, waveform: [] }));
      group.transition.overlap = 0;
    }
    const response = await fetch('/api/draft', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project }) });
    if (!response.ok) throw new Error('test draft setup failed');
  });
  await page.reload();
  const lane = page.locator('[data-drop-lane="djfx"]');
  expect((await lane.boundingBox()).width).toBeGreaterThan(1088);

  await scrubTo(page, 0.1);
  await page.locator('.operation-card[data-operation="fx-1"]').click();
  await scrubTo(page, 0.1 + 0.5 / 16);
  await page.locator('.operation-card[data-operation="fx-1"]').click();

  const events = page.locator('.event-clip[data-operation="fx-1"]');
  await expect(events).toHaveCount(2);
  const layers = await events.evaluateAll(nodes => nodes.map(node => node.dataset.layer));
  expect(layers[0]).toBe(layers[1]);
  const boxes = await events.evaluateAll(nodes => nodes.map(node => {
    const { x, y, width, height } = node.getBoundingClientRect();
    return { x, y, width, height };
  }));
  expect(boxes[0].x + boxes[0].width).toBeLessThanOrEqual(boxes[1].x);
});

test('timeline zoom improves long-set precision and drop times stay aligned while zoomed', async ({ page }) => {
  await page.goto('/');
  await resetDraft(page);
  await page.evaluate(async () => {
    const project = await fetch('/api/draft').then(response => response.json());
    for (const group of Object.values(project.groups)) {
      group.songs = group.songs.map((song, index) => ({ ...song, title: `Long track ${index + 1}`, duration: 60, start: 0, end: 60, bpm: null, waveform: [] }));
      group.transition.overlap = 8;
    }
    const response = await fetch('/api/draft', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ project }) });
    if (!response.ok) throw new Error('test draft setup failed');
  });
  await page.reload();

  const lane = page.locator('[data-drop-lane="djfx"]');
  const baseWidth = (await lane.boundingBox()).width;
  await page.getByRole('button', { name: '放大时间轴' }).click();
  await expect(page.locator('.timeline-zoom-control > span')).toHaveText('125%');
  const zoomedWidth = (await lane.boundingBox()).width;
  expect(zoomedWidth).toBeGreaterThan(baseWidth);

  await watchDropPreview(page, 'djfx');
  await page.locator('.operation-card[data-operation="filter-sweep"]').dragTo(lane, { targetPosition: { x: zoomedWidth * 0.7, y: 18 } });
  const preview = await page.evaluate(() => window.__djDropPreview);
  expect(preview.operation).toBe('filter-sweep');
  const event = page.locator('.event-clip[data-operation="filter-sweep"]');
  await expect(event).toHaveCount(1);
  expect(Number(await event.getAttribute('data-time'))).toBeCloseTo(preview.time, 1);

  await page.getByRole('button', { name: '适配时间轴' }).click();
  await expect(page.locator('.timeline-zoom-control > span')).not.toHaveText('125%');
  expect((await lane.boundingBox()).width).toBeLessThan(zoomedWidth);
});

test('duration controls resize on the timeline, move cleanly, and persist after reload', async ({ page }) => {
  await page.goto('/');
  await resetDraft(page);
  await addTrack(page, 0, 'Filter One.wav', 330);
  await addTrack(page, 1, 'Filter Two.wav', 550);
  const overlap = page.getByRole('slider', { name: '转场重叠时长' });
  await overlap.focus(); await overlap.press('Home');

  const lane = page.locator('[data-drop-lane="djfx"]');
  await expect(page.locator('.operation-card[data-operation="filter-sweep"] .operation-timing')).toContainText('2.0s');
  const laneBox = await lane.boundingBox();
  await watchDropPreview(page, 'djfx');
  await page.locator('.operation-card[data-operation="filter-sweep"]').dragTo(lane, { targetPosition: { x: laneBox.width * 0.42, y: laneBox.height / 2 } });
  const preview = await page.evaluate(() => window.__djDropPreview);
  expect(preview.operation).toBe('filter-sweep');
  expect(preview.width).toContain('%');
  const event = page.locator('.event-clip[data-operation="filter-sweep"]');
  await expect(event).toHaveAttribute('data-timing', 'duration');
  await expect(event.locator('.event-resize-handle')).toHaveCount(1);
  const initialDuration = Number(await event.getAttribute('data-duration'));
  await event.scrollIntoViewIfNeeded();
  const handleBox = await event.locator('.event-resize-handle').boundingBox();
  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(handleBox.x + handleBox.width / 2 + 105, handleBox.y + handleBox.height / 2, { steps: 6 });
  await page.mouse.up();
  const resizedDuration = Number(await event.getAttribute('data-duration'));
  expect(resizedDuration).toBeGreaterThan(initialDuration + 0.5);

  const beforeMove = Number(await event.getAttribute('data-time'));
  await event.scrollIntoViewIfNeeded();
  const eventBox = await event.boundingBox();
  await page.mouse.move(eventBox.x + eventBox.width / 2, eventBox.y + eventBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(eventBox.x + eventBox.width / 2 + 80, eventBox.y + eventBox.height / 2, { steps: 5 });
  await page.mouse.up();
  const afterMove = Number(await event.getAttribute('data-time'));
  expect(afterMove).toBeGreaterThan(beforeMove + 0.5);

  await page.getByRole('button', { name: '保存草稿' }).click();
  await expect(page.locator('.save-state')).toContainText('已保存');
  await page.reload();
  const restored = page.locator('.event-clip[data-operation="filter-sweep"]');
  await expect(restored).toHaveAttribute('data-timing', 'duration');
  expect(Number(await restored.getAttribute('data-duration'))).toBeCloseTo(resizedDuration, 1);
  expect(Number(await restored.getAttribute('data-time'))).toBeCloseTo(afterMove, 1);
});

test('duration drops keep their requested start near the timeline end and expose fixed versus resizable modes', async ({ page }) => {
  await page.goto('/');
  await resetDraft(page);
  await addTrack(page, 0, 'End Drop A.wav', 440);
  await addTrack(page, 1, 'End Drop B.wav', 660);
  const overlap = page.getByRole('slider', { name: '转场重叠时长' });
  await overlap.focus(); await overlap.press('Home');

  const durationCard = page.locator('.operation-card[data-operation="filter-sweep"]');
  const instantCard = page.locator('.operation-card[data-operation="loop-4"]');
  await expect(durationCard).toHaveAttribute('data-duration-mode', 'resizable');
  await expect(instantCard).toHaveAttribute('data-duration-mode', 'fixed');

  const lane = page.locator('[data-drop-lane="djfx"]');
  const laneBox = await lane.boundingBox();
  await watchDropPreview(page, 'djfx');
  await durationCard.dragTo(lane, { targetPosition: { x: laneBox.width * 0.9, y: laneBox.height / 2 } });
  const preview = await page.evaluate(() => window.__djDropPreview);
  expect(preview.operation).toBe('filter-sweep');
  const durationEvent = page.locator('.event-clip[data-operation="filter-sweep"]');
  await expect(durationEvent).toHaveAttribute('data-duration-mode', 'resizable');
  await expect(durationEvent.locator('.event-resize-handle')).toHaveCount(1);
  const durationBox = await durationEvent.boundingBox();
  expect(durationBox.x).toBeGreaterThan(laneBox.x + laneBox.width * 0.84);

  await instantCard.click();
  const instantEvent = page.locator('.event-clip[data-operation="loop-4"]');
  await expect(instantEvent).toHaveAttribute('data-duration-mode', 'fixed');
  await expect(instantEvent.locator('.event-resize-handle')).toHaveCount(0);
  await expect(page.getByText('瞬时按键 · 固定显示')).toBeVisible();
});

test('beat snap follows track BPM and can be turned off for free placement', async ({ page }) => {
  await page.goto('/');
  await resetDraft(page);
  await addTrack(page, 0, 'Beat Grid A.wav', 440);
  await addTrack(page, 1, 'Beat Grid B.wav', 660);
  await page.getByRole('spinbutton', { name: '曲目 1 BPM' }).fill('120');
  await page.getByRole('spinbutton', { name: '曲目 2 BPM' }).fill('120');
  await page.getByRole('spinbutton', { name: '曲目 1 首拍偏移' }).fill('0.1');
  const overlap = page.getByRole('slider', { name: '转场重叠时长' });
  await overlap.focus(); await overlap.press('Home');

  const snapButton = page.getByRole('button', { name: '节拍吸附' });
  await expect(snapButton).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('.beat-guide')).toHaveCount(8);
  const beatOffsetPx = await page.locator('.beat-guide-0').first().evaluate(node => node.style.getPropertyValue('--beat-offset'));
  expect(Number.parseFloat(beatOffsetPx)).toBeGreaterThan(0);
  await page.getByRole('combobox', { name: '节拍吸附细分' }).selectOption('0.5');

  await page.locator('.timeline-section').scrollIntoViewIfNeeded();
  const lane = page.locator('[data-drop-lane="djfx"]');
  const laneBox = await lane.boundingBox();
  await page.locator('.operation-card[data-operation="filter-sweep"]').dragTo(lane, {
    targetPosition: { x: laneBox.width * 0.28, y: laneBox.height / 2 },
  });
  const snapped = page.locator('.event-clip[data-operation="filter-sweep"]');
  await expect(snapped).toHaveCount(1);
  expect(Number(await snapped.getAttribute('data-time'))).toBeCloseTo(2.35, 2);

  await snapButton.click();
  await expect(snapButton).toHaveAttribute('aria-pressed', 'false');
  await page.locator('.timeline-section').scrollIntoViewIfNeeded();
  const freeLaneBox = await lane.boundingBox();
  await page.locator('.operation-card[data-operation="bass-cut"]').dragTo(lane, {
    targetPosition: { x: freeLaneBox.width * 0.31, y: freeLaneBox.height / 2 },
  });
  const freePlacement = page.locator('.event-clip[data-operation="bass-cut"]');
  await expect(freePlacement).toHaveCount(1);
  expect(Number(await freePlacement.getAttribute('data-time'))).toBeCloseTo(2.48, 2);
  await expect(page.locator('.beat-guide')).toHaveCount(0);

  await page.getByRole('button', { name: '保存草稿' }).click();
  await expect(page.locator('.save-state')).toContainText('已保存');
  await page.reload();
  await expect(page.getByRole('spinbutton', { name: '曲目 1 BPM' })).toHaveValue('120');
  await expect(page.getByRole('spinbutton', { name: '曲目 1 首拍偏移' })).toHaveValue('0.1');
  expect(Number(await page.locator('.event-clip[data-operation="filter-sweep"]').getAttribute('data-time'))).toBeCloseTo(2.35, 2);
});

test('keyboard shortcuts save, undo, redo, audition, and delete without stealing text input', async ({ page }) => {
  await page.goto('/');
  await resetDraft(page);
  await addTrack(page, 0, 'Shortcut A.wav', 440);
  await addTrack(page, 1, 'Shortcut B.wav', 660);

  await page.locator('.operation-card[data-operation="loop-4"]').click();
  const loop = page.locator('.event-clip[data-operation="loop-4"]');
  await expect(loop).toHaveCount(1);
  await page.locator('#project-title').focus();
  await page.keyboard.press('Control+z');
  await expect(loop).toHaveCount(1);
  await page.locator('.timeline-header h2').click();
  await page.keyboard.press('Control+z');
  await expect(loop).toHaveCount(0);
  await page.keyboard.press('Control+y');
  await expect(loop).toHaveCount(1);
  await page.keyboard.press('Control+s');
  await expect(page.locator('.save-state')).toContainText('已保存');

  await page.locator('.timeline-header h2').click();
  await page.keyboard.press('Space');
  await expect(page.getByText('正在试听')).toBeVisible();
  await page.keyboard.press('Space');
  await expect(page.getByText('已停止')).toBeVisible();

  await loop.click();
  await page.keyboard.press('Delete');
  await expect(loop).toHaveCount(0);
});

test('copy and paste places a complete event at the playhead and remaps it to the destination deck', async ({ page }) => {
  await page.goto('/');
  await resetDraft(page);
  await addTrack(page, 0, 'Copy Source.wav', 440);
  await addTrack(page, 1, 'Copy Destination.wav', 660);
  const overlap = page.getByRole('slider', { name: '转场重叠时长' });
  await overlap.focus(); await overlap.press('Home');

  await page.locator('.operation-card[data-operation="filter-sweep"]').click();
  const events = page.locator('.event-clip[data-operation="filter-sweep"]');
  await events.first().click();
  const duration = page.getByRole('spinbutton', { name: '持续时长' });
  await duration.fill('2.5');
  await page.keyboard.press('Control+c');
  await expect(page.getByRole('status')).not.toContainText('已复制');
  await events.first().click();
  await page.keyboard.press('Control+c');
  await expect(page.getByRole('status')).toContainText('已复制');
  await scrubTo(page, 0.7);
  await page.keyboard.press('Control+v');

  await expect(events).toHaveCount(2);
  const second = events.nth(1);
  expect(Number(await second.getAttribute('data-time'))).toBeGreaterThan(4);
  expect(Number(await second.getAttribute('data-duration'))).toBeCloseTo(2.5, 1);
  await second.click();
  expect(await second.getAttribute('data-slot')).toBe('1');
  await expect(page.locator('.operation-provenance')).toContainText('FILTER_B');

  await page.keyboard.press('Control+z');
  await expect(events).toHaveCount(1);
  await page.keyboard.press('Control+y');
  await expect(events).toHaveCount(2);
  await page.getByRole('button', { name: '保存草稿' }).click();
  await expect(page.locator('.save-state')).toContainText('已保存');
  await page.reload();
  await expect(page.locator('.event-clip[data-operation="filter-sweep"]')).toHaveCount(2);
  await expect(page.locator('.event-clip[data-operation="filter-sweep"]').nth(1)).toHaveAttribute('data-slot', '1');
});

test('copy and paste inserts a reverse performance at a new source position', async ({ page }) => {
  await page.goto('/');
  await resetDraft(page);
  await addTrack(page, 0, 'Reverse Copy A.wav', 440);
  await addTrack(page, 1, 'Reverse Copy B.wav', 660);
  const overlap = page.getByRole('slider', { name: '转场重叠时长' });
  await overlap.focus(); await overlap.press('Home');

  await scrubTo(page, 0.3);
  await page.locator('.operation-card[data-operation="scratch-reverse"]').click();
  const reversals = page.locator('.event-clip[data-operation="scratch-reverse"]');
  await expect(reversals).toHaveCount(1);
  await reversals.first().click();
  await page.keyboard.press('Control+c');
  await expect(page.getByRole('status')).toContainText('已复制');

  await scrubTo(page, 0.85);
  await page.keyboard.press('Control+v');
  await expect(reversals).toHaveCount(2);
  const pasted = reversals.nth(1);
  expect(Number(await pasted.getAttribute('data-time'))).toBeGreaterThan(Number(await reversals.first().getAttribute('data-time')));
  expect(Number(await pasted.getAttribute('data-duration'))).toBeCloseTo(2, 1);
  expect(await pasted.getAttribute('data-slot')).toBe('1');
  await pasted.click();
  await expect(page.locator('.operation-provenance')).toContainText('JOG_SCRATCH_B');
  await expect(page.locator('.source-range').filter({ hasText: '新增演出时长' })).toContainText('+4.0s');
});

test('BPM estimation suggests a tempo for steady beats and leaves non-rhythmic audio untouched', async ({ page }) => {
  await page.goto('/');
  await resetDraft(page);
  await page.locator('.track-card').nth(0).locator('input[type=file]').setInputFiles({
    name: 'Steady 120.wav', mimeType: 'audio/wav', buffer: beatWav(120, 8, 44100, 0.12),
  });
  await expect(page.locator('.track-card').nth(0).locator('.track-meta')).toContainText('BPM 未设置');
  await addTrack(page, 1, 'Sustained Tone.wav', 440);

  await page.getByRole('button', { name: '估算曲目 1 BPM' }).click();
  const bpm = page.getByRole('spinbutton', { name: '曲目 1 BPM' });
  await expect(bpm).not.toHaveValue('');
  expect(Math.abs(Number(await bpm.inputValue()) - 120)).toBeLessThanOrEqual(3);
  await expect(page.locator('.track-card').nth(0).locator('.track-meta')).toContainText('估算');
  const firstBeat = page.getByRole('spinbutton', { name: '曲目 1 首拍偏移' });
  await expect(firstBeat).toHaveValue(/0\.1[0-5]/);
  await expect(page.locator('.beat-estimated-badge')).toHaveCount(1);
  await page.getByRole('button', { name: '保存草稿' }).click();
  await expect(page.locator('.save-state')).toContainText('已保存');
  await page.reload();
  await expect(page.locator('.track-card').nth(0).locator('.track-meta')).toContainText('估算');
  const restoredFirstBeat = page.getByRole('spinbutton', { name: '曲目 1 首拍偏移' });
  const sourceOffset = Number(await restoredFirstBeat.inputValue());
  await expect(page.locator('.beat-estimated-badge')).toHaveCount(1);
  await page.getByRole('spinbutton', { name: '曲目 1 起点' }).fill('0.2');
  const expectedTrimmedOffset = ((sourceOffset - 0.2) % 0.5 + 0.5) % 0.5;
  expect(Number(await restoredFirstBeat.inputValue())).toBeCloseTo(expectedTrimmedOffset, 2);

  await page.locator('.track-card').nth(0).locator('input[type=file]').setInputFiles({
    name: 'Replacement.wav', mimeType: 'audio/wav', buffer: toneWav(550),
  });
  await expect(page.getByRole('spinbutton', { name: '曲目 1 BPM' })).toHaveValue('');
  await expect(page.getByRole('spinbutton', { name: '曲目 1 首拍偏移' })).toHaveValue('0');

  await page.getByRole('button', { name: '估算曲目 2 BPM' }).click();
  await expect(page.locator('[role=status]')).toContainText('没有检测到稳定拍点');
  await expect(page.getByRole('spinbutton', { name: '曲目 2 BPM' })).toHaveValue('');

  await page.locator('.track-card').nth(1).locator('input[type=file]').setInputFiles({
    name: 'Steady 96.wav', mimeType: 'audio/wav', buffer: beatWav(96),
  });
  await page.getByRole('button', { name: '估算曲目 2 BPM' }).click();
  const secondBpm = page.getByRole('spinbutton', { name: '曲目 2 BPM' });
  await expect(secondBpm).not.toHaveValue('');
  expect(Math.abs(Number(await secondBpm.inputValue()) - 96)).toBeLessThanOrEqual(3);
});

test('embedded BPM tags take precedence only when the tagged tempo is valid', async ({ page }) => {
  await page.goto('/');
  const values = await page.evaluate(async () => {
    const { readEmbeddedBpm } = await import('/src/audio/metadata.js');
    const taggedFile = value => {
      const payload = new TextEncoder().encode(String(value));
      const frame = new Uint8Array(11 + payload.length);
      frame.set(new TextEncoder().encode('TBPM'), 0);
      new DataView(frame.buffer).setUint32(4, payload.length + 1, false);
      frame[10] = 0;
      frame.set(payload, 11);
      const header = new Uint8Array(10);
      header.set(new TextEncoder().encode('ID3'), 0);
      header[3] = 3;
      const size = frame.length;
      header[6] = (size >> 21) & 0x7f;
      header[7] = (size >> 14) & 0x7f;
      header[8] = (size >> 7) & 0x7f;
      header[9] = size & 0x7f;
      return new Blob([header, frame], { type: 'audio/mpeg' });
    };
    return Promise.all([readEmbeddedBpm(taggedFile(124)), readEmbeddedBpm(taggedFile(320))]);
  });
  expect(values[0]).toBe(124);
  expect(values[1]).toBeNull();
});

test('scratch reverse routes backward then replays forward without losing later event order', async ({ page }) => {
  await page.goto('/');
  await resetDraft(page);
  await addTrack(page, 0, 'Reverse Test.wav', 440);
  await addTrack(page, 1, 'Second.wav', 660);
  const overlap = page.getByRole('slider', { name: '转场重叠时长' });
  await overlap.focus(); await overlap.press('Home');
  await scrubTo(page, 0.15);
  await page.locator('[data-operation="scratch-reverse"]').click();
  const reverse = page.locator('.event-clip[data-operation="scratch-reverse"]');
  await expect(reverse).toHaveCount(1);
  const reverseTime = Number(await reverse.getAttribute('data-time'));
  await page.getByRole('button', { name: '保存草稿' }).click();
  await expect(page.locator('.save-state')).toContainText('已保存');
  const reverseData = await page.evaluate(async () => {
    const text = await fetch('/api/draft').then(response => response.text());
    return JSON.parse(text).groups.A.events.find(event => event.operation?.id === 'scratch-reverse');
  });
  expect(reverseData.operation.controller.control).toBe('JOG_SCRATCH_A');
  expect(reverseData.operation.action).toBe('scratch');
  expect(reverseData.operation.execution).toBe('preview-audio');
  expect(reverseData.operation.controller.mappingValue).toBe('auto');
  await expect(page.locator('.source-range').filter({ hasText: '新增演出时长' })).toContainText('+2.4s');

  await scrubTo(page, 0.9);
  await page.getByRole('button', { name: '标记', exact: true }).click();
  const marker = page.locator('.event-clip.event-marker').last();
  const markerTime = Number(await marker.getAttribute('data-time'));
  expect(markerTime).toBeGreaterThan(reverseTime + 4);
  await marker.click();
  const markerSource = Number((await page.locator('.source-time-field b').first().textContent()).replace('s', ''));
  expect(markerSource).toBeGreaterThan(0);
  expect(markerSource).toBeLessThan(4);
});

test('stretching scratch reverse updates the source window and shifts later events by the added performance time', async ({ page }) => {
  await page.goto('/');
  await resetDraft(page);
  for (const [slot, frequency] of [[0, 440], [1, 660]]) {
    await page.locator('.track-card').nth(slot).locator('input[type=file]').setInputFiles({
      name: `Reverse Resize ${slot}.wav`, mimeType: 'audio/wav', buffer: toneWav(frequency, 16),
    });
    await expect(page.locator('.track-card').nth(slot).locator('.track-meta')).toContainText('BPM 未设置');
  }
  const overlap = page.getByRole('slider', { name: '转场重叠时长' });
  await overlap.focus(); await overlap.press('Home');

  await scrubTo(page, 0.28);
  await page.locator('[data-operation="scratch-reverse"]').click();
  const reverse = page.locator('.event-clip[data-operation="scratch-reverse"]');
  await expect(reverse).toHaveCount(1);
  await expect(reverse.locator('.event-resize-handle')).toHaveCount(1);
  const initialDuration = Number(await reverse.getAttribute('data-duration'));
  const initialTotal = 32 + initialDuration * 2;
  await expect(reverse).toHaveAttribute('data-performance-duration', String(initialDuration * 2));
  await expect(reverse).toHaveAttribute('title', /倒放 2\.0 秒 \+ 回放 2\.0 秒 · 共占用 4\.0 秒/);
  const lane = page.locator('[data-drop-lane="djfx"]');
  const laneBox = await lane.boundingBox();
  const initialBox = await reverse.boundingBox();
  expect(initialBox.width / laneBox.width * initialTotal).toBeCloseTo(initialDuration * 2, 1);
  await page.getByRole('button', { name: '保存草稿' }).click();
  await expect(page.locator('.save-state')).toContainText('已保存');
  const initialState = await page.evaluate(async () => {
    const draft = await fetch('/api/draft').then(response => response.json());
    return draft.groups.A.events.find(event => event.operation?.id === 'scratch-reverse');
  });

  await scrubTo(page, 0.48);
  await page.getByRole('button', { name: '标记', exact: true }).click();
  const marker = page.locator('.event-clip.event-marker');
  await expect(marker).toHaveCount(1);
  const markerBefore = Number(await marker.getAttribute('data-time'));

  await reverse.scrollIntoViewIfNeeded();
  const handleBox = await reverse.locator('.event-resize-handle').boundingBox();
  // Moving the complete occupancy edge by two seconds adds one second to
  // reverse and one second to replay. Keep this scale fixed during the gesture.
  const dragPixels = laneBox.width / initialTotal * 2;
  await page.mouse.move(handleBox.x + handleBox.width / 2, handleBox.y + handleBox.height / 2);
  await page.mouse.down();
  await page.mouse.move(handleBox.x + handleBox.width / 2 + dragPixels, handleBox.y + handleBox.height / 2, { steps: 6 });
  await page.mouse.up();

  const resizedDuration = Number(await reverse.getAttribute('data-duration'));
  expect(resizedDuration).toBeCloseTo(initialDuration + 1, 1);
  await expect(reverse).toHaveAttribute('data-performance-duration', String(resizedDuration * 2));
  const resizedBox = await reverse.boundingBox();
  const resizedLaneBox = await lane.boundingBox();
  expect(resizedBox.width / resizedLaneBox.width * (32 + resizedDuration * 2)).toBeCloseTo(resizedDuration * 2, 1);
  expect(Number(await marker.getAttribute('data-time'))).toBeGreaterThan(markerBefore + 0.2);
  await page.getByRole('button', { name: '保存草稿' }).click();
  await expect(page.locator('.save-state')).toContainText('已保存');
  const resizedState = await page.evaluate(async () => {
    const draft = await fetch('/api/draft').then(response => response.json());
    return draft.groups.A.events.find(event => event.operation?.id === 'scratch-reverse');
  });
  expect(resizedState.reverseSeconds).toBeCloseTo(resizedDuration, 1);
  expect(resizedState.extraSeconds).toBeCloseTo(resizedDuration * 2, 1);
  expect(resizedState.sourceEnd).toBeCloseTo(resizedState.sourceStart - resizedDuration, 1);
  expect(Number(await marker.getAttribute('data-time'))).toBeGreaterThan(markerBefore + (resizedDuration - initialDuration) * 2 - 0.15);
});

test('loads the one-minute presentation arrangement with two deterministic tracks and a real mixed audition', async ({ page }) => {
  test.setTimeout(100000);
  await page.goto('/');
  await resetDraft(page);
  await page.getByRole('button', { name: '加载一分钟演示' }).click();
  // Decoding the two 58-second deterministic WAVs is asynchronous; allow the
  // browser enough time on slower demo machines before asserting the hydrated UI.
  await expect(page.locator('.track-card').nth(0).locator('.track-title')).toHaveValue('Night Drive', { timeout: 60000 });
  await expect(page.locator('.track-card').nth(1).locator('.track-title')).toHaveValue('After Hours');
  await expect(page.locator('.track-card').nth(0).locator('.track-meta')).toContainText('00:58');
  await expect(page.locator('.track-card').nth(1).locator('.track-meta')).toContainText('00:58');
  await expect(page.locator('.overlap-readout')).toContainText('8s');
  await expect(page.locator('.timeline-duration')).toContainText('00:58');
  const musicRows = page.locator('.track-lanes');
  await expect(musicRows).toHaveCount(2);
  for (let index = 0; index < 2; index++) await expect(musicRows.nth(index).locator('.timeline-song')).toHaveCount(1);
  const firstSong = musicRows.nth(0).locator('.timeline-song');
  const secondSong = musicRows.nth(1).locator('.timeline-song');
  await expect(firstSong).toHaveAttribute('data-start', '0');
  await expect(firstSong).toHaveAttribute('data-end', '58');
  await expect(secondSong).toHaveAttribute('data-start', '0');
  await expect(secondSong).toHaveAttribute('data-end', '58');
  await expect(page.locator('.mix-overlap-summary')).toContainText('00:26');
  await expect(page.locator('.mix-overlap-summary')).toContainText('00:34');
  await expect(page.locator('.mix-overlap-summary')).toContainText('8');
  for (const width of [1440, 1180]) {
    await page.setViewportSize({ width, height: 1000 });
    const firstSongBox = await firstSong.boundingBox();
    const secondSongBox = await secondSong.boundingBox();
    const firstMusicLane = await musicRows.nth(0).locator('.track-lane-area').boundingBox();
    const secondMusicLane = await musicRows.nth(1).locator('.track-lane-area').boundingBox();
    const overlapBand = await page.locator('.overlap-band').boundingBox();
    expect(firstSongBox.y + firstSongBox.height).toBeLessThanOrEqual(secondSongBox.y);
    const songOverlapWidth = Math.min(firstSongBox.x + firstSongBox.width, secondSongBox.x + secondSongBox.width) - Math.max(firstSongBox.x, secondSongBox.x);
    expect(Math.abs(songOverlapWidth - firstMusicLane.width)).toBeLessThan(1);
    expect(Math.abs(overlapBand.x - (firstMusicLane.x + firstMusicLane.width * 26 / 58))).toBeLessThan(1);
    expect(Math.abs(overlapBand.x + overlapBand.width - (firstMusicLane.x + firstMusicLane.width * 34 / 58))).toBeLessThan(1);
    expect(overlapBand.y).toBeLessThanOrEqual(firstMusicLane.y + 1);
    expect(overlapBand.y + overlapBand.height).toBeGreaterThanOrEqual(secondMusicLane.y + secondMusicLane.height - 1);
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await expect(page.locator('.event-clip[data-operation="filter-sweep"]')).toHaveCount(1);
  await expect(page.locator('.event-clip[data-operation="bass-cut"]')).toHaveCount(1);
  await expect(page.locator('.event-clip[data-operation="scratch-reverse"]')).toHaveCount(1);
  await expect(page.locator('.event-clip[data-operation="loop-4"]')).toHaveCount(0);
  await expect(page.locator('.event-clip[data-operation="crossfader"]')).toHaveCount(1);
  await expect(page.locator('.event-clip.event-marker')).toHaveCount(2);
  await expect(page.locator('.save-state')).toContainText('未保存');

  const arrangement = await page.evaluate(async () => {
    const draft = await fetch('/api/draft').then(response => response.json());
    const current = document.querySelector('.event-clip[data-operation="crossfader"]');
    return { savedFirstSong: draft.groups.A.songs[0].title, faderStart: Number(current.dataset.time), faderDuration: Number(current.dataset.duration) };
  });
  expect(arrangement.savedFirstSong).toBe('');
  expect(arrangement.faderStart).toBe(26);
  expect(arrangement.faderDuration).toBe(8);

  await page.getByRole('button', { name: '保存草稿' }).click();
  await expect(page.locator('.save-state')).toContainText('已保存');
  await page.reload();
  await expect(page.locator('.track-card').nth(0).locator('.track-title')).toHaveValue('Night Drive');
  await expect(page.locator('.track-card').nth(1).locator('.track-title')).toHaveValue('After Hours');
  await expect(page.locator('.track-card').nth(0).locator('canvas.waveform')).toBeVisible();
  const operations = await page.evaluate(async () => {
    const draft = await fetch('/api/draft').then(response => response.json());
    return draft.groups.A.events.filter(event => event.operation).sort((a, b) => a.time - b.time);
  });
  expect(operations.map(event => [event.operation.id, event.time, event.kind === 'reverse' ? event.extraSeconds : event.duration])).toEqual([
    ['filter-sweep', 5, 2], ['bass-cut', 12, 2], ['scratch-reverse', 19, 2],
    ['crossfader', 26, 8], ['channel-level', 42, 3],
  ]);
  for (let index = 1; index < operations.length; index++) {
    const previous = operations[index - 1];
    expect(operations[index].time - previous.time - (previous.kind === 'reverse' ? previous.extraSeconds : previous.duration)).toBeGreaterThanOrEqual(5);
  }

  await page.getByRole('button', { name: /试听混音/ }).click();
  await expect(page.getByText('正在试听')).toBeVisible();
  const audioLevels = await page.evaluate(async () => {
    const { engine, state } = window.__djMaster;
    const waitUntil = async seconds => {
      while (engine.context.currentTime < state.startedAt + seconds) await new Promise(resolve => setTimeout(resolve, 25));
    };
    const rms = analyser => {
      const wave = new Float32Array(analyser.fftSize);
      analyser.getFloatTimeDomainData(wave);
      return Math.sqrt(wave.reduce((sum, sample) => sum + sample * sample, 0) / wave.length);
    };
    await waitUntil(2);
    const first = { master: rms(engine.analyser), left: rms(engine.decks[0].analyser), right: rms(engine.decks[1].analyser) };
    await waitUntil(6);
    const filter = engine.decks[0]._djPreviewFilterPath.lowpass.frequency.value;
    await waitUntil(13);
    const bass = engine.decks[0].low.gain.value;
    await waitUntil(20.5);
    const replayActive = document.querySelector('.event-clip[data-operation="scratch-reverse"]').classList.contains('is-active');
    await waitUntil(21.3);
    const reverseFinished = !document.querySelector('.event-clip[data-operation="scratch-reverse"]').classList.contains('is-active');
    await waitUntil(26.5);
    const overlap = [];
    while (engine.context.currentTime < state.startedAt + 33.5) {
      overlap.push({ master: rms(engine.analyser), left: rms(engine.decks[0].analyser), right: rms(engine.decks[1].analyser), leftGain: engine.decks[0].crossGain.gain.value, rightGain: engine.decks[1].crossGain.gain.value, active: document.querySelector('.event-clip[data-operation="crossfader"]').classList.contains('is-active') });
      await new Promise(resolve => setTimeout(resolve, 80));
    }
    await waitUntil(36);
    const second = { master: rms(engine.analyser), left: rms(engine.decks[0].analyser), right: rms(engine.decks[1].analyser) };
    await waitUntil(43);
    const level = engine.decks[1].trim.gain.value;
    return { first, filter, bass, replayActive, reverseFinished, overlap, second, level, duration: state.duration, effects: state.previewEffects.map(item => item.operation.id) };
  });
  expect(audioLevels.first.master).toBeGreaterThan(0.005);
  expect(audioLevels.first.right).toBeGreaterThan(0.005);
  expect(audioLevels.filter).toBeLessThan(1000);
  expect(audioLevels.bass).toBeCloseTo(-12, 1);
  expect(audioLevels.replayActive).toBe(true);
  expect(audioLevels.reverseFinished).toBe(true);
  expect(audioLevels.overlap.length).toBeGreaterThan(30);
  expect(Math.max(...audioLevels.overlap.map(sample => sample.left))).toBeGreaterThan(0.005);
  expect(Math.max(...audioLevels.overlap.map(sample => sample.right))).toBeGreaterThan(0.005);
  expect(Math.min(...audioLevels.overlap.map(sample => sample.master))).toBeGreaterThan(0.001);
  expect(audioLevels.overlap.some(sample => sample.leftGain > 0.2 && sample.rightGain > 0.2)).toBe(true);
  expect(audioLevels.overlap.filter(sample => sample.active).length / audioLevels.overlap.length).toBeGreaterThan(0.95);
  expect(audioLevels.second.master).toBeGreaterThan(0.005);
  expect(audioLevels.second.left).toBeGreaterThan(0.005);
  expect(audioLevels.level).toBeCloseTo(0.55, 1);
  expect(audioLevels.duration).toBeGreaterThan(57.9);
  expect(audioLevels.duration).toBeLessThan(58.1);
  expect(audioLevels.effects).toEqual(expect.arrayContaining(['filter-sweep', 'bass-cut', 'channel-level']));
  await expect(page.getByText('已停止')).toBeVisible({ timeout: 30000 });
  await expect(page.locator('.time-code')).toContainText('00:58');
});

test('editing the mapped crossfader changes the audible handoff and restores the remaining deck', async ({ page }) => {
  await page.goto('/');
  await resetDraft(page);
  await addTrack(page, 0, 'Crossfader A.wav', 440);
  await addTrack(page, 1, 'Crossfader B.wav', 880);
  const overlap = page.getByRole('slider', { name: '转场重叠时长' });
  await overlap.focus(); await overlap.press('Home');
  for (let index = 0; index < 4; index++) await overlap.press('ArrowRight');
  await scrubTo(page, 1 / 3);
  await page.locator('.operation-card[data-operation="crossfader"]').click();
  await page.getByRole('spinbutton', { name: '操作参数 目标值' }).fill('0');
  await page.getByRole('spinbutton', { name: '持续时长', exact: true }).fill('2');
  await expect(page.locator('.operation-provenance')).toContainText('试听中会实际应用到音频');
  await page.getByRole('button', { name: /试听混音/ }).click();
  const samples = await page.evaluate(async () => {
    const { engine, state } = window.__djMaster;
    const sampleAt = async seconds => {
      while (engine.context.currentTime < state.startedAt + seconds) await new Promise(resolve => setTimeout(resolve, 10));
      const wave = new Float32Array(engine.analyser.fftSize);
      engine.analyser.getFloatTimeDomainData(wave);
      let crossings = 0;
      for (let index = 1; index < wave.length; index++) if (wave[index - 1] < 0 && wave[index] >= 0) crossings++;
      return { left: engine.decks[0].crossGain.gain.value, right: engine.decks[1].crossGain.gain.value, frequency: crossings * engine.context.sampleRate / wave.length };
    };
    return { heldLeft: await sampleAt(3.2), after: await sampleAt(4.5) };
  });
  expect(samples.heldLeft.left).toBeGreaterThan(0.98);
  expect(samples.heldLeft.right).toBeLessThan(0.02);
  expect(samples.heldLeft.frequency).toBeGreaterThan(350);
  expect(samples.heldLeft.frequency).toBeLessThan(550);
  expect(samples.after.right).toBeGreaterThan(0.98);
  expect(samples.after.frequency).toBeGreaterThan(750);
  expect(samples.after.frequency).toBeLessThan(1000);
  await page.getByRole('button', { name: /停止试听/ }).click();
});

test('loading the demo can be undone without replacing the saved draft', async ({ page }) => {
  await page.goto('/');
  await resetDraft(page);
  await addTrack(page, 0, 'Keep This Song.wav', 440);
  const overlap = page.getByRole('slider', { name: '转场重叠时长' });
  await overlap.focus(); await overlap.press('Home');
  for (let index = 0; index < 6; index++) await overlap.press('ArrowRight');
  await page.getByRole('button', { name: '保存草稿' }).click();
  await expect(page.locator('.save-state')).toContainText('已保存');
  await page.locator('#project-title').fill('Unsaved local title');
  let releaseDemo;
  const heldDemo = new Promise(resolve => { releaseDemo = resolve; });
  await page.route('**/api/demo/seed', async route => { await heldDemo; await route.continue(); });
  let savesWhileLoading = 0;
  page.on('request', request => {
    if (request.method() === 'PUT' && new URL(request.url()).pathname === '/api/draft') savesWhileLoading++;
  });
  try {
    await page.getByRole('button', { name: '加载一分钟演示' }).click();
    await expect(page.getByRole('button', { name: '载入演示…' })).toBeVisible();
    await expect(page.getByRole('button', { name: '保存草稿' })).toBeDisabled();
    await page.keyboard.press('ControlOrMeta+s');
    await page.waitForTimeout(150);
    expect(savesWhileLoading).toBe(0);
  } finally { releaseDemo(); }
  await expect(page.locator('.track-card').nth(0).locator('.track-title')).toHaveValue('Night Drive', { timeout: 15000 });
  await expect(overlap).toHaveAttribute('aria-valuenow', '8');
  await expect(page.locator('.save-state')).toContainText('未保存');
  const saved = await page.evaluate(async () => fetch('/api/draft').then(response => response.json()));
  expect(saved.groups.A.songs[0].title).toBe('Keep This Song');
  expect(saved.title).not.toBe('Unsaved local title');
  await page.getByRole('button', { name: '撤销' }).click();
  await expect(page.locator('.track-card').nth(0).locator('.track-title')).toHaveValue('Keep This Song');
  await expect(overlap).toHaveAttribute('aria-valuenow', '3');
  await expect(page.locator('#project-title')).toHaveValue('Unsaved local title');
  await page.getByRole('button', { name: '重做' }).click();
  await expect(page.locator('.track-card').nth(0).locator('.track-title')).toHaveValue('Night Drive');
  await expect(overlap).toHaveAttribute('aria-valuenow', '8');
});

test('a failed demo audio load preserves the workspace and saved draft', async ({ page }) => {
  await page.goto('/');
  await resetDraft(page);
  await addTrack(page, 0, 'Preserved Song.wav', 330);
  await page.getByRole('button', { name: '保存草稿' }).click();
  await expect(page.locator('.save-state')).toContainText('已保存');
  const before = await page.evaluate(async () => fetch('/api/draft').then(response => response.json()));
  await page.route('**/api/audio/*', route => route.fulfill({ status: 500, body: 'unavailable' }));
  await page.getByRole('button', { name: '加载一分钟演示' }).click();
  await expect(page.getByText('无法读取 Night Drive').first()).toBeVisible();
  await expect(page.locator('.track-card').nth(0).locator('.track-title')).toHaveValue('Preserved Song');
  const after = await page.evaluate(async () => fetch('/api/draft').then(response => response.json()));
  expect(after).toEqual(before);
});
