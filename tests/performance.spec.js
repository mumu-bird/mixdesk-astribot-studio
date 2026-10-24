import { test, expect } from '@playwright/test';
import { decodeMix, isMixPort, MixMidi } from '../src/midi.js';

test('MIX protocol distinguishes note release, pads, channels and unsupported devices', () => {
  expect(decodeMix([0x91, 7, 127])).toEqual({ action: 'play', deck: 0 });
  expect(decodeMix([0x91, 7, 0])).toBeNull();
  expect(decodeMix([0x81, 7, 127])).toBeNull();
  expect(decodeMix([0x91, 6, 0])).toEqual({ action: 'cueRelease', deck: 0 });
  expect(decodeMix([0x96, 0, 127])).toEqual({ action: 'hotcue', deck: 0, index: 0 });
  expect(decodeMix([0x86, 0, 0])).toEqual({ action: 'hotcueRelease', deck: 0, index: 0 });
  expect(decodeMix([0x91, 8, 127])).toEqual({ action: 'scratchTouch', deck: 0, active: true });
  expect(decodeMix([0x81, 8, 0])).toEqual({ action: 'scratchTouch', deck: 0, active: false });
  expect(decodeMix([0x91, 0x0f, 127])).toEqual({ action: 'hotcueTab', deck: 0 });
  expect(decodeMix([0x81, 0x0f, 0])).toBeNull();
  expect(decodeMix([0xb1, 10, 3])).toEqual({ action: 'scratchMove', deck: 0, value: 3 / 256 });
  expect(decodeMix([0xb2, 10, 127])).toEqual({ action: 'scratchMove', deck: 1, value: -1 / 256 });
  expect(decodeMix([0xb1, 9, 16])).toEqual({ action: 'pitchBend', deck: 0, value: 16 / 64 });
  expect(decodeMix([0xb4, 9, 127])).toEqual({ action: 'seekLoop', deck: 0, beats: 4, value: -1 });
  expect(decodeMix([0xb4, 10, 3])).toEqual({ action: 'browserMove', deck: 0, value: 3 });
  expect(decodeMix([0xb5, 10, 126])).toEqual({ action: 'browserMove', deck: 1, value: -2 });
  expect(decodeMix([0xb4, 10, 0])).toBeNull();
  expect(decodeMix([0xb3, 10, 1])).toBeNull();
  expect(decodeMix([0x94, 7, 127])).toEqual({ action: 'load', deck: 0 });
  expect(decodeMix([0x95, 7, 127])).toEqual({ action: 'load', deck: 1 });
  expect(decodeMix([0x95, 7, 0])).toBeNull();
  expect(decodeMix([0x85, 7, 127])).toBeNull();
  expect(decodeMix([0x97, 0x1b, 127])).toEqual({ action: 'stopSample', deck: 1, index: 3 });
  expect(decodeMix([0x91, 3, 127])).toEqual({ action: 'scratchModeToggle', deck: 0 });
  expect(decodeMix([0x94, 6, 127])).toEqual({ action: 'stop', deck: 0 });
  expect(decodeMix([0x95, 6, 127])).toEqual({ action: 'stop', deck: 1 });
  // DJControl MIX has four sampler pads per deck and no sampler-page key;
  // HOTCUE_TAB is a track-pad page selector, not sampler pagination.
  expect(decodeMix([0x93, 0x41, 127])).toBeNull();
  expect(decodeMix([0x82, 6, 64])).toEqual({ action: 'cueRelease', deck: 1 });
  expect(decodeMix([0x97, 0x22, 127])).toEqual({ action: 'effect', deck: 1, index: 2 });
  expect(decodeMix([0x96, 0x33, 127])).toEqual({ action: 'loop', deck: 0, beats: 8 });
  expect(decodeMix([0xb0, 0, 127])).toEqual({ action: 'crossfader', value: 1 });
  expect(decodeMix([0xb1, 0x20, 127])).toBeNull(); // LSB must not become a second knob movement.
  const continuous = new Map();
  decodeMix([0xb1, 0, 64], continuous);
  expect(decodeMix([0xb1, 0x20, 127], continuous)).toEqual({ action: 'volume', deck: 0, value: (64 * 128 + 127) / 16383 });
  expect(decodeMix([0xb1, 0x23, 127], new Map())).toBeNull(); // LSB before MSB cannot jump the control.
  const masterState = new Map();
  decodeMix([0xb0, 3, 64], masterState);
  expect(decodeMix([0xb1, 0x23, 127], masterState)).toEqual({ action: 'master', value: (64 * 128 + 127) / 16383 });
  const headphoneState = new Map();
  decodeMix([0xb0, 4, 0], headphoneState);
  expect(decodeMix([0xb1, 0x24, 64], headphoneState)).toEqual({ action: 'headphoneVolume', value: 64 / 16383 });
  const crossState = new Map();
  decodeMix([0xb0, 0, 32], crossState);
  expect(decodeMix([0xb0, 0x20, 1], crossState).value).toBeCloseTo(((32 * 128 + 1) / 16383) * 2 - 1, 8);
  expect(decodeMix([0xb1, 0x23, 127], masterState).value).toBeCloseTo((64 * 128 + 127) / 16383, 8);
  expect(decodeMix([0xb2, 0x28, 127], new Map())).toBeNull();
  expect(decodeMix([0xf8])).toBeNull();
  expect(isMixPort({ name: 'DJCONTROL MIX' })).toBeTruthy();
  expect(isMixPort({ name: 'DJControl MIX ULTRA' })).toBeFalsy();
  expect(isMixPort({ name: 'Unrelated keyboard' })).toBeFalsy();
});

test('MIDI outputs are deduplicated and disconnect turns off owned LEDs only', async () => {
  const sent = [], output = { name: 'DJCONTROL MIX', id: 'output', state: 'connected', send: message => sent.push([...message]), open: async () => {}, close: async () => {} };
  const input = { name: 'DJCONTROL MIX', id: 'input', state: 'connected', open: async () => {}, close: async () => {}, onmidimessage: null };
  const actions = [], midi = new MixMidi({ onAction: action => actions.push(action), onStatus: () => {} });
  midi.access = { inputs: new Map([['input', input]]), outputs: new Map([['output', output]]) };
  await midi.connect('input', 'output');
  input.onmidimessage({ data: [0x91, 7, 127] });
  input.onmidimessage({ data: [0x91, 7, 0] });
  expect(actions).toEqual([{ action: 'play', deck: 0 }]);
  midi.sendFeedback([[0x91, 7, 127], [0x96, 0x20, 0]]);
  midi.sendFeedback([[0x91, 7, 127], [0x96, 0x20, 0]]);
  expect(sent).toHaveLength(2);
  midi.sendFeedback([[0x91, 7, 0]]);
  expect(sent).toHaveLength(3);
  await midi.disconnect();
  expect(sent.slice(3)).toEqual([[0x91, 7, 0], [0x96, 0x20, 0]]);
  expect(input.onmidimessage).toBeNull();
  expect(midi.input).toBeNull(); expect(midi.output).toBeNull();
});

test('MIDI Hot Cue note repeats do not retrigger and only a matching release ends the hold', async () => {
  const input = { name: 'DJCONTROL MIX', id: 'input', state: 'connected', open: async () => {}, close: async () => {}, onmidimessage: null };
  const actions = [], midi = new MixMidi({ onAction: action => actions.push(action), onStatus: () => {} });
  midi.access = { inputs: new Map([['input', input]]), outputs: new Map() };
  await midi.connect('input');
  input.onmidimessage({ data: [0x96, 2, 127] });
  input.onmidimessage({ data: [0x96, 2, 127] });
  input.onmidimessage({ data: [0x86, 1, 0] });
  expect(actions).toEqual([{ action: 'hotcue', deck: 0, index: 2 }]);
  input.onmidimessage({ data: [0x86, 2, 0] });
  input.onmidimessage({ data: [0x86, 2, 0] });
  expect(actions).toEqual([{ action: 'hotcue', deck: 0, index: 2 }, { action: 'hotcueRelease', deck: 0, index: 2 }]);
  await midi.disconnect();
});

async function ready(page) {
  await page.goto('/');
  await expect(page.locator('[data-deck="0"] .track-title')).toHaveText('Night Drive');
}

async function connectSimulatedMix(page) {
  await page.addInitScript(() => {
    const messages = [];
    const port = (id, type) => ({ id, type, name: 'DJCONTROL MIX', state: 'connected', connection: 'closed', async open() { this.connection = 'open'; return this; }, async close() { this.connection = 'closed'; return this; }, send(data) { messages.push([...data]); } });
    const input = port('mix-in', 'input'), output = port('mix-out', 'output');
    const access = { inputs: new Map([[input.id,input]]), outputs: new Map([[output.id,output]]), onstatechange: null };
    Object.defineProperty(navigator, 'requestMIDIAccess', { value: async () => access });
    window.__fakeMidi = { input, output, access, messages };
  });
  await ready(page);
  await page.locator('#midi-panel-button').click();
  await page.locator('#midi-scan').click();
  await expect(page.locator('#midi-output')).toHaveValue('mix-out');
  await page.locator('#midi-connect').click();
  await expect(page.locator('#midi-status')).toContainText('双向控制');
  await page.locator('#midi-close').click();
}

const sendMix = (page, data) => page.evaluate(data => window.__fakeMidi.input.onmidimessage({ data: new Uint8Array(data) }), data);

test('MIX Shift-touch Jog selects songs and Load restores Hot Cues with matching pad feedback', async ({ page }) => {
  await connectSimulatedMix(page);
  await page.evaluate(() => window.__mixdesk.engine.decks[1].seek(3.25));
  await sendMix(page, [0x97, 0, 127]);
  await expect(page.locator('[data-deck="1"] [data-cue="0"]')).toHaveClass(/set/);
  await sendMix(page, [0xb4, 10, 1]);
  await expect(page.locator('#track-list .track-selected')).toHaveAttribute('data-track', 'demo-night-drive');
  await sendMix(page, [0x95, 7, 127]);
  await expect(page.locator('[data-deck="1"] .track-title')).toHaveText('Night Drive');
  await expect(page.locator('[data-deck="1"] [data-cue="0"]')).not.toHaveClass(/set/);
  await expect.poll(() => page.evaluate(() => window.__fakeMidi.messages.some(m => m[0] === 0x97 && m[1] === 0 && m[2] === 0))).toBe(true);

  await sendMix(page, [0xb5, 10, 1]);
  await expect(page.locator('#track-list .track-selected')).toHaveAttribute('data-track', 'demo-after-hours');
  await sendMix(page, [0x94, 7, 127]);
  await expect(page.locator('[data-deck="0"] .track-title')).toHaveText('After Hours');
  await expect(page.locator('[data-deck="0"] [data-cue="0"]')).toHaveClass(/set/);
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].hotcues[0])).toBe(3.25);
  await expect.poll(() => page.evaluate(() => window.__fakeMidi.messages.some(m => m[0] === 0x96 && m[1] === 0 && m[2] === 127))).toBe(true);
  await sendMix(page, [0x96, 0, 127]);
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].position)).toBe(3.25);
  await sendMix(page, [0x96, 8, 127]);
  await expect(page.locator('[data-deck="0"] [data-cue="0"]')).not.toHaveClass(/set/);
  await expect.poll(() => page.evaluate(() => window.__fakeMidi.messages.filter(m => m[0] === 0x96 && m[1] === 0).at(-1)?.[2])).toBe(0);
});

test('MIX browsing respects mouse selection, sorted and filtered lists, boundaries and empty results', async ({ page }) => {
  await connectSimulatedMix(page);
  const selected = page.locator('#track-list .track-selected');
  await page.locator('#track-list [data-track="demo-night-drive"] strong').click();
  await sendMix(page, [0xb4, 10, 1]);
  await expect(selected).toHaveAttribute('data-track', 'demo-after-hours');
  await sendMix(page, [0xb5, 10, 63]);
  await expect(selected).toHaveAttribute('data-track', 'demo-after-hours');
  await sendMix(page, [0xb4, 10, 126]);
  await expect(selected).toHaveAttribute('data-track', 'demo-night-drive');
  await sendMix(page, [0xb5, 10, 127]);
  await expect(selected).toHaveAttribute('data-track', 'demo-night-drive');
  await sendMix(page, [0xb5, 10, 0]);
  await expect(selected).toHaveAttribute('data-track', 'demo-night-drive');
  await page.locator('#library-sort').selectOption('title');
  await sendMix(page, [0xb5, 10, 127]);
  await expect(selected).toHaveAttribute('data-track', 'demo-after-hours');
  await page.locator('#search').fill('Night Drive');
  await expect(selected).toHaveCount(0);
  expect(await page.evaluate(() => window.__mixdesk.library.selectedId)).toBeNull();
  await sendMix(page, [0x95, 7, 127]);
  await expect(page.locator('[data-deck="1"] .track-title')).toHaveText('Night Drive');
  await expect(selected).toHaveAttribute('data-track', 'demo-night-drive');
  await page.locator('#search').fill('no such song');
  await sendMix(page, [0xb4, 10, 1]);
  await sendMix(page, [0x95, 7, 127]);
  await expect(selected).toHaveCount(0);
  await expect(page.locator('[data-deck="1"] .track-title')).toHaveText('Night Drive');
  expect(await page.evaluate(() => window.__mixdesk.library.selectedId)).toBeNull();
  await page.locator('#search').fill('After Hours');
  await sendMix(page, [0x94, 7, 0]);
  await expect(page.locator('[data-deck="0"] .track-title')).toHaveText('Night Drive');
  await sendMix(page, [0x94, 7, 127]);
  await expect(page.locator('[data-deck="0"] .track-title')).toHaveText('After Hours');
});

test('every effect changes audio, bypass is transparent and Echo produces delayed audio', async ({ page }) => {
  await ready(page);
  const results = await page.evaluate(async () => {
    const { EffectSlot } = await import('/src/effects.js');
    const render = async (type, enabled) => {
      const context = new OfflineAudioContext(1, 24000, 12000);
      const buffer = context.createBuffer(1, 12000, 12000), data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.sin(2 * Math.PI * 330 * i / 12000) * 0.2;
      const source = context.createBufferSource(); source.buffer = buffer;
      const effect = new EffectSlot(context, type); effect.setEnabled(enabled); effect.setAmount(0.7);
      source.connect(effect.input); effect.output.connect(context.destination); source.start(0.2);
      return (await context.startRendering()).getChannelData(0);
    };
    const dry = await render('echo', false), metrics = {};
    for (const type of ['echo','delay','reverb','flanger','chorus','phaser','wah','resonance','tremolo','gater','bitcrush','drive','paramEq','dynamics']) {
      const wet = await render(type, true), bypass = await render(type, false);
      let difference = 0, bypassError = 0, finite = true;
      for (let i = 4000; i < 12000; i++) { difference += (wet[i] - dry[i]) ** 2; bypassError += (bypass[i] - dry[i]) ** 2; finite &&= Number.isFinite(wet[i]); }
      metrics[type] = { difference: difference/8000, bypassError, finite };
    }
    const context = new OfflineAudioContext(1, 12000, 12000), source = context.createBufferSource();
    source.buffer = context.createBuffer(1, 100, 12000); source.buffer.getChannelData(0)[0] = 1;
    const echo = new EffectSlot(context, 'echo'); echo.setEnabled(true); echo.setAmount(1); echo.setTiming(120, 0.5);
    source.connect(echo.input); echo.output.connect(context.destination); source.start(0.1);
    const data = (await context.startRendering()).getChannelData(0);
    metrics.echoPeak = Math.max(...data.slice(4000, 4400).map(Math.abs));
    return metrics;
  });
  for (const type of ['echo','delay','reverb','flanger','chorus','phaser','wah','resonance','tremolo','gater','bitcrush','drive','paramEq','dynamics']) {
    expect(results[type].finite, type).toBeTruthy();
    expect(results[type].difference, type).toBeGreaterThan(0.00001);
    expect(results[type].bypassError, type).toBeLessThan(0.000001);
  }
  expect(results.echoPeak).toBeGreaterThan(0.5);
});

test('Gater uses a square gate and the selected beat length controls its cycle', async ({ page }) => {
  await ready(page);
  const result = await page.evaluate(async () => {
    const { EffectSlot } = await import('/src/effects.js');
    const render = async beats => {
      const context = new OfflineAudioContext(1, 24000, 12000), buffer = context.createBuffer(1, 12000, 12000);
      buffer.getChannelData(0).fill(0.2);
      const source = context.createBufferSource(), effect = new EffectSlot(context, 'gater');
      source.buffer = buffer; effect.setEnabled(true); effect.setAmount(1); effect.setTiming(120, beats);
      source.connect(effect.input); effect.output.connect(context.destination); source.start();
      const output = (await context.startRendering()).getChannelData(0);
      const active = [];
      for (let i = 1500; i < 10500; i += 100) active.push(Math.abs(output[i]) > 0.08);
      return { type: effect.oscillators[0].type, frequency: effect.bpm / 60 / effect.beats, active };
    };
    return { half: await render(0.5), two: await render(2) };
  });
  expect(result.half.type).toBe('square');
  expect(result.half.frequency).toBeCloseTo(4, 6);
  expect(result.two.frequency).toBeCloseTo(1, 6);
  const transitions = values => values.slice(1).filter((value, index) => value !== values[index]).length;
  expect(result.half.active.filter(Boolean).length).toBeGreaterThan(0);
  expect(transitions(result.half.active)).toBeGreaterThan(transitions(result.two.active));
});

test('shared FX racks keep per-deck lanes isolated and can be assigned together', async ({ page }) => {
  await ready(page);
  const result = await page.evaluate(async () => {
    const { EffectRack, EffectBus } = await import('/src/effects.js');
    const context = new OfflineAudioContext(1, 18000, 12000);
    const racks = [new EffectRack(context, 0), new EffectRack(context, 1)];
    const first = new EffectBus(context, 0, racks), second = new EffectBus(context, 1, racks);
    second.setAssignments([true, false]);
    first.setAssignments([true, true]);
    first.setActiveRack(0); first.setEnabled(0, true); first.setAmount(0, 1); first.setTiming(0, 120, 0.5);
    const source = context.createBufferSource(), buffer = context.createBuffer(1, 120, 12000);
    buffer.getChannelData(0)[0] = 1; source.buffer = buffer; source.connect(first.input); first.output.connect(context.destination); source.start(0.1);
    const data = (await context.startRendering()).getChannelData(0);
    return { tail: Math.max(...data.slice(3000, 7000).map(Math.abs)), sharedType: racks[0].channel(1).slots[0].type, firstAssignments: first.assignment, secondAssignments: second.assignment };
  });
  expect(result.tail).toBeGreaterThan(0.5);
  expect(result.sharedType).toBe('echo');
  expect(result.firstAssignments).toEqual([true, true]);
  expect(result.secondAssignments).toEqual([true, false]);
});

test('FX bank wetness is transparent at zero and parameter limits survive lanes and snapshots', async ({ page }) => {
  await ready(page);
  const result = await page.evaluate(async () => {
    const { EffectRack } = await import('/src/effects.js');
    const context = new OfflineAudioContext(1, 4800, 12000), rack = new EffectRack(context, 0);
    const first = rack.channel('deck-a'), second = rack.channel('deck-b');
    rack.setSlotType(0, 'echo'); rack.setSlotAmount(0, 1); rack.setSlotTiming(0, 120, 0.5); rack.setSlotEnabled(0, true); rack.setWetness(0);
    const buffer = context.createBuffer(1, 1200, 12000), input = buffer.getChannelData(0); input[0] = 1;
    const source = context.createBufferSource(); source.buffer = buffer; source.connect(first.input); first.output.connect(context.destination); source.start(0.1);
    const output = (await context.startRendering()).getChannelData(0), impulse = output[1200];
    rack.modifyEffectParamLimits(0, 1, 0.25, 0.75);
    const clamped = rack.modifyEffectParam(0, 1, 0.1);
    const snapshot = rack.snapshot(), restored = new EffectRack(new OfflineAudioContext(1, 100, 12000), 1);
    restored.restore(snapshot);
    const timing = rack.getEffectParam(0, 1), limits = second.slots[0].paramLimits.get(1);
    const reset = rack.resetEffects();
    return {
      impulse, tail: Math.max(...output.slice(1201).map(Math.abs)),
      timing, clamped, limits,
      restored: { wetness: restored.getWetness(), limits: restored.getEffectParamLimits(0, 1), enabled: restored.slotStates[0].enabled },
      reset: { wetness: rack.getWetness(), amount: rack.getEffectParam(0, 0), beats: rack.getEffectParam(0, 1), enabled: reset.slots[0].enabled },
    };
  });
  expect(result.impulse).toBeCloseTo(1, 5);
  expect(result.tail).toBeLessThan(1e-5);
  expect(result.timing).toBeCloseTo(0.25, 8);
  expect(result.clamped).toBeCloseTo(0.25, 8);
  expect(result.limits).toEqual([0.25, 0.75]);
  expect(result.restored).toEqual({ wetness: 0, limits: [0.25, 0.75], enabled: true });
  expect(result.reset).toEqual({ wetness: 1, amount: 0.35, beats: 0.5, enabled: false });
});

test('local stem approximation is transparent at defaults and only changes the path after control input', async ({ page }) => {
  await ready(page);
  const metrics = await page.evaluate(async () => {
    const { StemMixer } = await import('/src/stems.js');
    const render = async configure => {
      const context = new OfflineAudioContext(1, 24000, 12000), mixer = new StemMixer(context);
      const buffer = context.createBuffer(1, 12000, 12000), data = buffer.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.sin(2 * Math.PI * 330 * i / 12000) * 0.2;
      const source = context.createBufferSource(); source.buffer = buffer; source.connect(mixer.input); mixer.output.connect(context.destination);
      configure?.(mixer); source.start(); return (await context.startRendering()).getChannelData(0);
    };
    const dry = await render(), active = await render(mixer => mixer.setMuted('vocals', true));
    let difference = 0, dryEnergy = 0, defaultError = 0;
    for (let i = 0; i < 12000; i++) {
      const expected = Math.sin(2 * Math.PI * 330 * i / 12000) * 0.2;
      defaultError = Math.max(defaultError, Math.abs(dry[i] - expected));
      if (i >= 1000 && i < 11000) { difference += (active[i] - dry[i]) ** 2; dryEnergy += dry[i] ** 2; }
    }
    return { difference, dryEnergy, defaultError };
  });
  expect(metrics.dryEnergy).toBeGreaterThan(1);
  expect(metrics.defaultError).toBeLessThan(1e-6);
  expect(metrics.difference).toBeGreaterThan(0.0001);
});

test('sampler reaches master output and stop silences it', async ({ page }) => {
  await ready(page);
  const rms = () => page.evaluate(() => {
    const a = window.__mixdesk.engine.analyser, d = new Float32Array(a.fftSize); a.getFloatTimeDomainData(d);
    return Math.sqrt(d.reduce((s,x)=>s+x*x,0)/d.length);
  });
  await page.getByRole('button', { name: '播放采样 2', exact: true }).click();
  await expect.poll(rms).toBeGreaterThan(0.003);
  await page.getByRole('button', { name: '全部停止' }).click();
  await expect.poll(rms).toBeLessThan(0.0001);
});

test('Inpulse-style sampler page action wraps after the last page', async ({ page }) => {
  await ready(page);
  await page.locator('#sampler-display').selectOption('4');
  await expect(page.locator('#sampler-page')).toHaveText('1 / 4');
  for (let i = 0; i < 4; i++) await page.evaluate(() => window.__mixdesk.onAction({ action: 'nextSamplerPage', deck: 0 }));
  await expect(page.locator('#sampler-page')).toHaveText('1 / 4');
});

test('platter scratch holds the audio timeline and resumes transport on release', async ({ page }) => {
  await ready(page);
  const result = await page.evaluate(async () => {
    const deck = window.__mixdesk.engine.decks[0];
    deck.seek(1); await deck.play(); await new Promise(resolve => setTimeout(resolve, 120));
    const before = deck.position;
    deck.scratchTouch(true); await new Promise(resolve => setTimeout(resolve, 80));
    const held = deck.position;
    deck.scratchMove(0.6); const moved = deck.position;
    deck.scratchTouch(false); await new Promise(resolve => setTimeout(resolve, 80));
    return { before, held, moved, playing: deck.playing, resumed: deck.position > moved };
  });
  expect(result.held).toBeCloseTo(result.before, 2);
  expect(result.moved - result.held).toBeCloseTo(0.6, 2);
  expect(result.playing).toBeTruthy();
  expect(result.resumed).toBeTruthy();
});

test('reverse scratch grains read reversed PCM and release restores a coherent transport', async ({ page }) => {
  await ready(page);
  const result = await page.evaluate(async () => {
    const { Deck } = await import('/src/audio.js');
    const context = new OfflineAudioContext(1, 4800, 48000), master = context.createGain(); master.connect(context.destination);
    const deck = new Deck({ context, pitchAvailable: false, master }, 0);
    const buffer = context.createBuffer(1, 48000, 48000), data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = i / data.length;
    deck.buffer = buffer; deck.scratchState = { position: 0.75, wasPlaying: false };
    deck.scratchVelocity = -2; deck.startScratchGrain();
    const reversed = deck.scratchSource.buffer.getChannelData(0);
    const first = reversed[0], next = reversed[100], rate = deck.scratchSource.playbackRate.value;
    const output = (await context.startRendering()).getChannelData(0);
    let energy = 0; for (const sample of output) energy += sample * sample;
    return { first, next, rate, energy };
  });
  expect(result.first).toBeGreaterThan(result.next);
  expect(result.rate).toBe(2);
  expect(result.energy).toBeGreaterThan(0.0001);
});

test('14-bit MIDI actions retain fractional DSP precision while the control UI rounds only its display', async ({ page }) => {
  await ready(page);
  const value = 0.5037;
  await page.evaluate(value => window.__mixdesk.onAction({ action: 'volume', deck: 0, value }), value);
  await page.waitForTimeout(50);
  const state = await page.evaluate(() => ({ gain: window.__mixdesk.engine.decks[0].trim.gain.value, slider: document.querySelector('[data-channel="0"] .channel-volume').value }));
  expect(Number(state.slider)).toBe(Math.round(value * 100));
  expect(state.gain).toBeCloseTo(value, 2);
});

test('MIX tempo control uses software pickup before taking over the pitch slider', async ({ page }) => {
  await ready(page);
  const result = await page.evaluate(async () => {
    const deck = window.__mixdesk.engine.decks[0];
    await window.__mixdesk.onAction({ action: 'tempo', deck: 0, value: 0.8 });
    const before = deck.rate;
    await window.__mixdesk.onAction({ action: 'tempo', deck: 0, value: 0.4 });
    const acquired = deck.rate;
    await window.__mixdesk.onAction({ action: 'tempo', deck: 0, value: 0.6 });
    return { before, acquired, after: deck.rate };
  });
  expect(result.before).toBe(1);
  expect(result.acquired).toBeCloseTo(1.1, 5);
  expect(result.after).toBeCloseTo(0.9, 5);
});

test('stems controls route real audio, support mute and solo, and persist', async ({ page }) => {
  await ready(page);
  const rms = () => page.evaluate(() => {
    const a = window.__mixdesk.engine.analyser, data = new Float32Array(a.fftSize);
    a.getFloatTimeDomainData(data); return Math.sqrt(data.reduce((sum, value) => sum + value * value, 0) / data.length);
  });
  await page.getByRole('button', { name: '播放 A', exact: true }).click();
  await expect.poll(rms).toBeGreaterThan(0.005);
  for (const stem of ['vocals', 'drums', 'bass', 'music']) await page.locator(`[data-deck="0"] [data-stem="${stem}"] .stem-mute`).click();
  await expect.poll(rms).toBeLessThan(0.0001);
  for (const stem of ['vocals', 'drums', 'bass', 'music']) await page.locator(`[data-deck="0"] [data-stem="${stem}"] .stem-mute`).click();
  await expect.poll(rms).toBeGreaterThan(0.005);
  await page.locator('[data-deck="0"] [data-stem="bass"] .stem-solo').click();
  await expect(page.locator('[data-deck="0"] [data-stem="bass"] .stem-solo')).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-deck="0"] [data-stem="vocals"] .stem-solo')).toHaveAttribute('aria-pressed', 'false');
  await page.locator('[data-deck="0"] [data-stem="vocals"] .stem-level').evaluate(element => { element.value = '35'; element.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.waitForTimeout(250); await page.reload(); await ready(page);
  await expect(page.locator('[data-deck="0"] [data-stem="bass"] .stem-solo')).toHaveAttribute('aria-pressed', 'true');
  expect(await page.locator('[data-deck="0"] [data-stem="vocals"] .stem-level').inputValue()).toBe('35');
});

test('manual grid, quantized cue, phase alignment and cue persistence', async ({ page }) => {
  await ready(page);
  await page.evaluate(() => window.__mixdesk.engine.decks[0].seek(0.2));
  await page.locator('[data-deck="0"] .beatgrid-editor summary').click();
  await page.locator('[data-deck="0"] .grid-set').click();
  await page.locator('[data-deck="0"] .quantize').click();
  await page.evaluate(() => window.__mixdesk.engine.decks[0].seek(1.31));
  await page.locator('[data-deck="0"] [data-cue="0"]').click();
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].hotcues[0])).toBeCloseTo(1.2, 5);
  await page.locator('[data-deck="1"] .phase-sync').click();
  const phaseDifference = await page.evaluate(() => {
    const d = window.__mixdesk.engine.decks;
    const phase = x => (((x.position-x.gridOffset)/(60/x.bpm))%1+1)%1;
    return Math.abs(phase(d[0])-phase(d[1]));
  });
  expect(phaseDifference).toBeLessThan(0.001);
  await page.reload();
  await expect(page.locator('[data-deck="0"] .track-title')).toHaveText('Night Drive');
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].hotcues[0])).toBeCloseTo(1.2, 5);
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].gridOffset)).toBeCloseTo(0.2, 5);
});

test('mixer and FX session settings persist across reload', async ({ page }) => {
  await ready(page);
  await page.locator('#master').evaluate((el) => { el.value = '61'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.locator('#crossfader').evaluate((el) => { el.value = '-35'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.locator('[data-channel="0"] .channel-volume').evaluate((el) => { el.value = '42'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.locator('[data-channel="0"] [data-band="low"]').evaluate((el) => { el.value = '-12'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.locator('[data-channel="0"] .cross-assign').selectOption('thru');
  await page.locator('[data-deck="0"] [data-fx="0"] .fx-type').selectOption('drive');
  await page.locator('[data-deck="0"] [data-fx="0"] .fx-amount').evaluate((el) => { el.value = '72'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.locator('[data-deck="0"] [data-fx="0"] .fx-enable').click();
  await page.waitForTimeout(250);
  await page.reload();
  await ready(page);
  expect(await page.locator('#master').inputValue()).toBe('61');
  expect(await page.locator('#crossfader').inputValue()).toBe('-35');
  expect(await page.locator('[data-channel="0"] .channel-volume').inputValue()).toBe('42');
  expect(await page.locator('[data-channel="0"] [data-band="low"]').inputValue()).toBe('-12');
  await expect(page.locator('[data-channel="0"] .cross-assign')).toHaveValue('thru');
  await expect(page.locator('[data-deck="0"] [data-fx="0"] .fx-type')).toHaveValue('drive');
  expect(await page.locator('[data-deck="0"] [data-fx="0"] .fx-amount').inputValue()).toBe('72');
  await expect(page.locator('[data-deck="0"] [data-fx="0"] .fx-enable')).toHaveAttribute('aria-pressed', 'true');
});

test('FX Rack assignment and shared slot edits persist across reload', async ({ page }) => {
  await ready(page);
  await page.locator('[data-deck="0"] .fx-assign[data-rack="1"]').click();
  await page.locator('[data-deck="0"] .fx-bank-toggle').click();
  await page.locator('[data-deck="0"] [data-fx="1"] .fx-type').selectOption('chorus');
  await page.waitForTimeout(250);
  const state = await page.evaluate(() => {
    const deck = window.__mixdesk.engine.decks[0];
    return { rack: deck.effectRackIndex, assignments: deck.effects.assignment, type: deck.effects.slots[1].type, otherLaneType: window.__mixdesk.engine.decks[1].effects.racks[1].slots[1].type };
  });
  expect(state).toEqual({ rack: 1, assignments: [true, true], type: 'chorus', otherLaneType: 'chorus' });
  await page.reload();
  await ready(page);
  expect(await page.evaluate(() => {
    const deck = window.__mixdesk.engine.decks[0];
    return { rack: deck.effectRackIndex, assignments: deck.effects.assignment, type: deck.effects.slots[1].type };
  })).toEqual({ rack: 1, assignments: [true, true], type: 'chorus' });
});

test('mixer settings alter crossfader shape, limiter path and persist', async ({ page }) => {
  await ready(page);
  await page.locator('#mixer-settings').click();
  await page.locator('#master-headroom').evaluate(el => { el.value = '-6'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.locator('#master-limiter').uncheck();
  await page.locator('#crossfader-curve').evaluate(el => { el.value = '100'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.locator('#crossfader-hamster').check();
  await page.locator('#gain-lower').evaluate(el => { el.value = '-12'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.locator('#gain-upper').evaluate(el => { el.value = '6'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  const state = await page.evaluate(() => {
    const e = window.__mixdesk.engine;
    e.setCrossfader(0);
    return { headroom: e.headroomDb, limiter: e.limiterEnabled, curve: e.crossfaderCurve, hamster: e.crossfaderHamster, lower: e.autoGainLimits.lowerDb, upper: e.autoGainLimits.upperDb, left: e.decks[0].crossGain.gain.value, right: e.decks[1].crossGain.gain.value };
  });
  expect(state.headroom).toBe(-6); expect(state.limiter).toBeFalsy(); expect(state.curve).toBe(1); expect(state.hamster).toBeTruthy();
  expect(state.lower).toBe(-12); expect(state.upper).toBe(6); expect(state.left).toBeCloseTo(0.5, 2); expect(state.right).toBeCloseTo(0.5, 2);
  await page.waitForTimeout(250); await page.reload(); await ready(page);
  expect(await page.evaluate(() => ({ headroom: window.__mixdesk.engine.headroomDb, limiter: window.__mixdesk.engine.limiterEnabled, curve: window.__mixdesk.engine.crossfaderCurve, hamster: window.__mixdesk.engine.crossfaderHamster, lower: window.__mixdesk.engine.autoGainLimits.lowerDb, upper: window.__mixdesk.engine.autoGainLimits.upperDb }))).toEqual({ headroom: -6, limiter: false, curve: 1, hamster: true, lower: -12, upper: 6 });
});

test('Filter FX slots stay synchronized across channels, settings and filter amount', async ({ page }) => {
  await ready(page);
  const channelA = page.locator('[data-channel="0"]');
  const channelB = page.locator('[data-channel="1"]');
  await channelA.locator('.filter-fx-slot').selectOption('2');
  await expect(channelA.locator('.filter-fx-type')).toHaveValue('reverb');
  await channelA.locator('.filter-fx-type').selectOption('phaser');
  await expect(channelB.locator('.filter-fx-type')).toHaveValue('off');
  await channelB.locator('.filter-fx-slot').selectOption('2');
  await expect(channelB.locator('.filter-fx-type')).toHaveValue('phaser');
  await page.locator('#mixer-settings').click();
  await page.locator('#filter-fx-preset-2').selectOption('wah');
  await expect(channelA.locator('.filter-fx-type')).toHaveValue('wah');
  await expect(channelB.locator('.filter-fx-type')).toHaveValue('wah');
  const state = await page.evaluate(() => {
    const [a, b] = window.__mixdesk.engine.decks;
    return { presets: window.__mixdesk.engine.filterFxPresets, aSlot: a.filterFxSlot, bSlot: b.filterFxSlot, aType: a.filterFx.type, bType: b.filterFx.type };
  });
  expect(state).toEqual({ presets: ['off', 'echo', 'wah', 'flanger'], aSlot: 2, bSlot: 2, aType: 'wah', bType: 'wah' });
  await page.locator('#mixer-settings-close').click();
  await channelA.locator('.filter').evaluate(el => { el.value = '35'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  expect(await page.evaluate(() => ({ amount: window.__mixdesk.engine.decks[0].filterFx.amount, enabled: window.__mixdesk.engine.decks[0].filterFx.slot.enabled }))).toEqual({ amount: 0.35, enabled: true });
  await channelA.locator('.filter').evaluate(el => { el.value = '0'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].filterFx.slot.enabled)).toBe(false);
  await page.waitForTimeout(250);
  await page.reload();
  await ready(page);
  await expect(page.locator('[data-channel="0"] .filter-fx-slot')).toHaveValue('2');
  await expect(page.locator('[data-channel="0"] .filter-fx-type')).toHaveValue('wah');
  await expect(page.locator('[data-channel="1"] .filter-fx-slot')).toHaveValue('2');
  await expect(page.locator('[data-channel="1"] .filter-fx-type')).toHaveValue('wah');
});

test('mixer EQ kill switches mute and restore individual bands', async ({ page }) => {
  await ready(page);
  const control = page.locator('[data-channel="0"] .eq[data-band="low"]');
  await control.evaluate(el => { el.value = '-8'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await page.locator('[data-channel="0"] .eq-kill[data-kill-band="low"]').click();
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].eqKills.low)).toBe(true);
  await expect.poll(() => page.evaluate(() => window.__mixdesk.engine.decks[0].low.gain.value)).toBeCloseTo(-100, 1);
  await page.locator('[data-channel="0"] .eq-kill[data-kill-band="low"]').click();
  await expect.poll(() => page.evaluate(() => window.__mixdesk.engine.decks[0].low.gain.value)).toBeCloseTo(-8, 1);
  await page.waitForTimeout(250); await page.reload(); await ready(page);
  await expect(page.locator('[data-channel="0"] .eq-kill[data-kill-band="low"]')).toHaveAttribute('aria-pressed', 'false');
});

test('tempo range exposes DJUCED ranges and zero stops transport', async ({ page }) => {
  await ready(page);
  const deck = page.locator('[data-deck="0"]');
  await deck.locator('.tempo-range').selectOption('10');
  await expect(deck.locator('.tempo')).toHaveAttribute('min', '-10');
  await expect(deck.locator('.tempo')).toHaveAttribute('max', '10');
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].tempoRange)).toBe(10);
  await deck.locator('.tempo').evaluate(el => { el.value = '10'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].rate)).toBeCloseTo(1.1, 5);
  await deck.locator('.tempo').evaluate(el => { el.value = '0'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  await deck.locator('.tempo-range').selectOption('100');
  await page.evaluate(() => window.__mixdesk.engine.decks[0].setRate(0));
  expect(await page.evaluate(() => ({ rate: window.__mixdesk.engine.decks[0].rate, playing: window.__mixdesk.engine.decks[0].playing }))).toEqual({ rate: 0, playing: false });
});

test('MIDI actions drive UI, DSP state and matching FX feedback', async ({ page }) => {
  await ready(page);
  await page.evaluate(() => window.__mixdesk.onAction({ action: 'effect', deck: 0, index: 0 }));
  await expect(page.locator('[data-deck="0"] [data-fx="0"] .fx-enable')).toHaveAttribute('aria-pressed', 'true');
  const messages = await page.evaluate(async () => {
    const { feedbackMessages } = await import('/src/midi.js');
    const { engine } = window.__mixdesk;
    return feedbackMessages(engine.decks, engine.sampler);
  });
  expect(messages).toContainEqual([0x96, 0x20, 127]);
  await page.evaluate(() => { window.__mixdesk.engine.decks[0].hotcues[0] = 1; });
  const hotcueFeedback = await page.evaluate(async () => {
    const { feedbackMessages } = await import('/src/midi.js'), { engine } = window.__mixdesk;
    return feedbackMessages(engine.decks, engine.sampler);
  });
  expect(hotcueFeedback).toContainEqual([0x96, 0x00, 127]);
  expect(hotcueFeedback).toContainEqual([0x96, 0x08, 127]);
  await page.evaluate(() => window.__mixdesk.onAction({ action: 'loop', deck: 1, beats: 8 }));
  await expect(page.locator('[data-deck="1"] .loop-length')).toHaveText('8 拍');
  await page.evaluate(() => window.__mixdesk.onAction({ action: 'crossfader', value: 1 }));
  await expect(page.locator('#crossfader')).toHaveValue('100');
  await page.evaluate(() => window.__mixdesk.onAction({ action: 'scratchModeToggle', deck: 0 }));
  expect(await page.evaluate(() => window.__mixdesk.engine.decks[0].scratchMode)).toBe(true);
  const scratchModeLed = await page.evaluate(async () => {
    const { feedbackMessages } = await import('/src/midi.js'), { engine } = window.__mixdesk;
    return feedbackMessages(engine.decks, engine.sampler).find(message => message[0] === 0x94 && message[1] === 3);
  });
  expect(scratchModeLed).toEqual([0x94, 3, 127]);
});

test('MIX VU feedback follows the mapped channels and their different ranges', async ({ page }) => {
  await ready(page);
  const levels = await page.evaluate(async () => {
    const { feedbackMessages } = await import('/src/midi.js');
    const { engine } = window.__mixdesk;
    engine.decks[0].meter = () => 0.5;
    engine.decks[1].meter = () => 1;
    return feedbackMessages(engine.decks, engine.sampler)
      .filter(([status, key]) => (status === 0x91 && key === 0x00) || (status === 0x92 && key === 0x23));
  });
  expect(levels).toEqual([[0x91, 0x00, 27], [0x92, 0x23, 127]]);
});

test('post-crossfader FX routing and fader start follow the channel controls', async ({ page }) => {
  await ready(page);
  const result = await page.evaluate(async () => {
    const deck = window.__mixdesk.engine.decks[0];
    deck.setEffectPosition('post'); deck.setFaderStart(true); deck.setVolume(0.8);
    await deck.play(); await new Promise(resolve => setTimeout(resolve, 80)); deck.setVolume(0);
    await new Promise(resolve => setTimeout(resolve, 80));
    const stoppedAtZero = !deck.playing;
    deck.setVolume(0.8); await new Promise(resolve => setTimeout(resolve, 100));
    const restartedAtRaise = deck.playing;
    return { position: deck.effectPosition, stoppedAtZero, restartedAtRaise };
  });
  expect(result).toEqual({ position: 'post', stoppedAtZero: true, restartedAtRaise: true });
});

test('normal jog pitch bend briefly changes transport speed and returns to the set tempo', async ({ page }) => {
  await ready(page);
  const result = await page.evaluate(async () => {
    const deck = window.__mixdesk.engine.decks[0]; deck.seek(1); await deck.play();
    deck.pitchBendBy(0.5); const bent = deck.effectiveRate;
    await new Promise(resolve => setTimeout(resolve, 220));
    const restored = deck.effectiveRate; deck.pause(); return { bent, restored };
  });
  expect(result.bent).toBeGreaterThan(1);
  expect(result.restored).toBe(1);
});

test('controller panel reports denied access without claiming a connection', async ({ page }) => {
  await page.addInitScript(() => Object.defineProperty(navigator, 'requestMIDIAccess', { value: async () => { throw new DOMException('MIDI permission denied', 'NotAllowedError'); } }));
  await ready(page);
  await page.locator('#midi-panel-button').click();
  await page.locator('#midi-scan').click();
  await expect(page.locator('#midi-status')).toContainText('denied');
  await expect(page.locator('#midi-connect')).toBeDisabled();
  await expect(page.locator('#midi-panel-button')).not.toHaveClass(/connected/);
});

test('Key Lock holds a 440 Hz tone while speed changes; key shift moves it by semitones', async ({ page }) => {
  await ready(page);
  await expect(page.locator('[data-deck="0"] .key-lock')).toBeEnabled();
  await page.evaluate(async () => {
    const { engine } = window.__mixdesk;
    const buffer = engine.context.createBuffer(1, engine.context.sampleRate * 12, engine.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = 0.15 * Math.sin(2 * Math.PI * 440 * i / buffer.sampleRate);
    const deck = engine.decks[0];
    deck.load({ id: 'pitch-test', bpm: 120 }, buffer); deck.setRate(1.25); deck.setPitch(true);
    const analyser = engine.context.createAnalyser(); analyser.fftSize = 8192;
    deck.trim.connect(analyser); window.__toneAnalyser = analyser;
    await deck.play();
  });
  const frequency = () => page.evaluate(() => {
    const a = window.__toneAnalyser, data = new Float32Array(a.frequencyBinCount); a.getFloatFrequencyData(data);
    let peak = 1;
    for (let i = 2; i < data.length; i++) if (data[i] > data[peak]) peak = i;
    return peak * window.__mixdesk.engine.context.sampleRate / a.fftSize;
  });
  await expect.poll(frequency, { timeout: 7000 }).toBeGreaterThan(430);
  expect(await frequency()).toBeLessThan(450);
  await page.evaluate(() => window.__mixdesk.engine.decks[0].setPitch(false));
  await expect.poll(frequency).toBeGreaterThan(535);
  expect(await frequency()).toBeLessThan(565);
  await page.evaluate(() => window.__mixdesk.engine.decks[0].setPitch(true, 12));
  await expect.poll(frequency).toBeGreaterThan(865);
  expect(await frequency()).toBeLessThan(895);
  await page.evaluate(() => window.__mixdesk.engine.decks[0].pause());
  const rms = () => page.evaluate(() => {
    const a = window.__toneAnalyser, data = new Float32Array(a.fftSize); a.getFloatTimeDomainData(data);
    return Math.sqrt(data.reduce((s,x) => s+x*x,0)/data.length);
  });
  await expect.poll(rms).toBeLessThan(0.0001);
});

test('instant double copies timeline, rate, cues, loop and playing state', async ({ page }) => {
  await ready(page);
  await page.evaluate(async () => {
    const deck = window.__mixdesk.engine.decks[0];
    deck.seek(4); deck.hotcues[0] = 1.5; deck.cuePoint = 2;
    deck.setRate(1.1); deck.toggleLoop(4); await deck.play();
  });
  await page.locator('[data-deck="1"] .instant-double').click();
  await expect.poll(() => page.evaluate(() => window.__mixdesk.engine.decks[1].playing)).toBeTruthy();
  const result = await page.evaluate(() => {
    const [a,b] = window.__mixdesk.engine.decks;
    return { title: b.track.title, rate: b.rate, cue: b.cuePoint, hotcue: b.hotcues[0], loop: b.loop, positionDifference: Math.abs(a.position-b.position) };
  });
  expect(result.title).toBe('Night Drive'); expect(result.rate).toBe(1.1);
  expect(result.cue).toBe(2); expect(result.hotcue).toBe(1.5);
  expect(result.loop.beats).toBe(4); expect(result.positionDifference).toBeLessThan(0.15);
});

test('browser MIDI connect, live FX feedback and hot unplug use actual UI paths with simulated ports', async ({ page }) => {
  await connectSimulatedMix(page);
  await page.locator('[data-deck="0"] [data-fx="0"] .fx-enable').click();
  await expect.poll(() => page.evaluate(() => window.__fakeMidi.messages.some(m => m[0] === 0x96 && m[1] === 0x20 && m[2] === 127))).toBeTruthy();
  await page.evaluate(() => window.__fakeMidi.input.onmidimessage({ data: new Uint8Array([0x97, 0x21, 127]) }));
  await expect(page.locator('[data-deck="1"] [data-fx="1"] .fx-enable')).toHaveAttribute('aria-pressed', 'true');
  await page.evaluate(() => { const m = window.__fakeMidi; m.input.state = 'disconnected'; m.access.onstatechange(); });
  await expect(page.locator('#midi-panel-button')).not.toHaveClass(/connected/);
  expect(await page.evaluate(() => window.__fakeMidi.input.onmidimessage)).toBeNull();
});

test('Key Lock drains and disposes its processor at end of track', async ({ page }) => {
  await ready(page);
  await page.evaluate(async () => {
    const { engine } = window.__mixdesk; await engine.pitchReady;
    const buffer = engine.context.createBuffer(1, engine.context.sampleRate, engine.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = Math.sin(i/engine.context.sampleRate*2*Math.PI*440)*0.1;
    const deck = engine.decks[0]; deck.load({ id: 'short-pitch', bpm: 120 }, buffer); deck.setPitch(true); deck.setRate(1.2); await deck.play();
  });
  await expect.poll(() => page.evaluate(() => window.__mixdesk.engine.decks[0].playing)).toBeFalsy();
  await expect.poll(() => page.evaluate(() => window.__mixdesk.engine.decks[0].pitchNode === null)).toBeTruthy();
});
