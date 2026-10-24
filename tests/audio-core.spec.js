import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  // The dev hook exists before asynchronous demo loading/session restore ends.
  await page.waitForFunction(() => window.__mixdesk?.engine.decks[0].buffer && !document.querySelector('#app').inert);
});

const attachMetrics = (testInfo, metrics) => testInfo.attach('audio-metrics', {
  body: JSON.stringify(metrics, null, 2), contentType: 'application/json',
});

test('transport fades bound PCM discontinuities on play, seek and pause', async ({ page }, testInfo) => {
  const result = await page.evaluate(async () => {
    const { Deck } = await import('/src/audio.js');
    const context = new OfflineAudioContext(2, 14400, 48000);
    const deck = new Deck({ context, master: context.createGain(), pitchAvailable: false }, 0);
    // Tap the transport before EQ/FX so filters cannot hide a hard cut.
    deck.stems.input.connect(context.destination);
    const buffer = context.createBuffer(2, 96000, 48000);
    for (let c = 0; c < 2; c++) {
      const pcm = buffer.getChannelData(c);
      pcm.fill(0.25, 0, 48000); pcm.fill(-0.25, 48000);
    }
    deck.load({ id: 'dc-transition', bpm: 120 }, buffer);
    deck.startSource();
    const seekAt = context.suspend(0.05).then(async () => {
      deck.seek(1.2); await context.resume();
    });
    const stopAt = context.suspend(0.10).then(async () => {
      // A burst of commands must not leave any outgoing voice audible.
      deck.seek(0.2); deck.seek(1.3); deck.pause(); await context.resume();
    });
    const output = await context.startRendering(); await Promise.all([seekAt, stopAt]);
    const pcm = output.getChannelData(0);
    let step = 0, tail = 0, stereoError = 0;
    for (let i = 1; i < pcm.length; i++) {
      step = Math.max(step, Math.abs(pcm[i] - pcm[i - 1]));
      stereoError = Math.max(stereoError, Math.abs(pcm[i] - output.getChannelData(1)[i]));
      if (i > 6000) tail = Math.max(tail, Math.abs(pcm[i]));
    }
    return { step, tail, stereoError, initial: pcm[0], forward: pcm[1200], jumped: pcm[3800] };
  });
  await attachMetrics(testInfo, result);
  expect(result.initial).toBe(0);
  expect(result.forward).toBeCloseTo(0.25, 5);
  expect(result.jumped).toBeCloseTo(-0.25, 5);
  expect(result.step).toBeLessThan(0.01);
  expect(result.tail).toBe(0);
  expect(result.stereoError).toBe(0);
});

for (const reverse of [false, true]) {
  for (const looping of [false, true]) {
    test(`Slip scratch restores the ${reverse ? 'reverse' : 'forward'} audio clock${looping ? ' inside a loop' : ''}`, async ({ page }, testInfo) => {
      const result = await page.evaluate(async ({ reverse, looping }) => {
        const { Deck } = await import('/src/audio.js');
        const context = new OfflineAudioContext(1, 28800, 48000);
        const deck = new Deck({ context, master: context.createGain(), pitchAvailable: false }, 0);
        deck.stems.input.connect(context.destination);
        const buffer = context.createBuffer(1, 192000, 48000), pcm = buffer.getChannelData(0);
        for (let i = 0; i < pcm.length; i++) pcm[i] = 0.2 * Math.sin(2 * Math.PI * (i < 48000 ? 220 : 880) * i / 48000);
        deck.load({ id: 'slip-scratch', bpm: 120 }, buffer);
        deck.setReverse(reverse); deck.setRate(1.25); deck.performance.setSlip(true);
        deck.offset = 1.6;
        if (looping) deck.loop = { start: 1, end: 2, beats: 2 };
        deck.startSource();
        let shadow, released, held, rateAt, ratePosition, resumedAt;
        const touch = context.suspend(0.10).then(async () => {
          deck.scratchTouch(true); deck.scratchMove(-1.2); held = deck.position;
          await context.resume();
        });
        const tempo = context.suspend(0.20).then(async () => {
          rateAt = context.currentTime;
          ratePosition = 1.6 + (reverse ? -1 : 1) * rateAt * 1.25;
          deck.setRate(0.8); await context.resume();
        });
        const release = context.suspend(0.40).then(async () => {
          resumedAt = context.currentTime;
          shadow = deck.performance.backgroundPosition;
          deck.scratchTouch(false); released = deck.position;
          await context.resume();
        });
        const output = await context.startRendering(); await Promise.all([touch, tempo, release]);
        let expected = ratePosition + (reverse ? -1 : 1) * (resumedAt - rateAt) * 0.8;
        if (looping) expected = 1 + ((expected - 1) % 1 + 1) % 1;
        const data = output.getChannelData(0); let crossings = 0;
        for (let i = 22000; i < 27000; i++) if (data[i] < 0 && data[i + 1] >= 0) crossings++;
        return { shadow, released, held, expected, playing: deck.playing, frequency: crossings * 48000 / 5000 };
      }, { reverse, looping });
      await attachMetrics(testInfo, result);
      expect(Math.abs(result.shadow - result.expected)).toBeLessThan(0.0001);
      expect(Math.abs(result.released - result.expected)).toBeLessThan(0.0001);
      expect(result.held).toBeLessThan(1);
      expect(result.playing).toBe(true);
      // 880 Hz region at 0.8 speed, rather than the scratched 220 Hz region.
      expect(result.frequency).toBeGreaterThan(690);
      expect(result.frequency).toBeLessThan(720);
    });
  }
}

test('Slip Hot Cue release during a scratch rebases the held transport; pause cancels late releases', async ({ page }, testInfo) => {
  const result = await page.evaluate(async () => {
    const deck = window.__mixdesk.engine.decks[0], wait = ms => new Promise(r => setTimeout(r, ms));
    deck.seek(5); deck.performance.setSlip(true); await deck.play();
    deck.performance.beginSlipCue(1, 0, 'nested');
    deck.scratchTouch(true); deck.scratchMove(-0.5);
    await wait(100);
    deck.performance.endSlipCue('nested');
    await wait(100);
    const expected = deck.performance.backgroundPosition;
    deck.scratchTouch(false);
    const actual = deck.position, playing = deck.playing;
    deck.scratchTouch(true); await wait(30); deck.pause();
    const stopped = deck.position;
    deck.scratchTouch(false); await wait(30);
    return { expected, actual, playing, stopped, after: deck.position, restarted: deck.playing };
  });
  await attachMetrics(testInfo, result);
  expect(result.expected).toBeGreaterThan(5.14);
  expect(Math.abs(result.actual - result.expected)).toBeLessThan(0.015);
  expect(result.playing).toBe(true);
  expect(result.after).toBe(result.stopped);
  expect(result.restarted).toBe(false);
});

test('live stereo key changes keep audio flowing without refilling the pitch processor', async ({ page }, testInfo) => {
  const result = await page.evaluate(async () => {
    const { Deck } = await import('/src/audio.js');
    const { default: pitchUrl } = await import('/src/pitch-worklet.js?worker&url');
    const context = new OfflineAudioContext(2, 105600, 48000);
    await context.audioWorklet.addModule(pitchUrl);
    const deck = new Deck({ context, master: context.createGain(), pitchAvailable: true }, 0);
    deck.stems.input.connect(context.destination);
    const buffer = context.createBuffer(2, 192000, 48000);
    for (let c = 0; c < 2; c++) {
      const data = buffer.getChannelData(c);
      for (let i = 0; i < data.length; i++) data[i] = 0.2 * Math.sin(2 * Math.PI * (c ? 660 : 440) * i / 48000);
    }
    deck.load({ id: 'stereo-pitch', bpm: 120 }, buffer);
    deck.setRate(1.25); deck.setPitch(true); deck.startSource();
    const up = context.suspend(0.7).then(async () => { deck.setPitch(true, 12); await context.resume(); });
    const down = context.suspend(1.4).then(async () => { deck.setPitch(true, -12); await context.resume(); });
    const output = await context.startRendering(); await Promise.all([up, down]);
    const metrics = [];
    for (let c = 0; c < 2; c++) {
      const data = output.getChannelData(c); let silent = 0, longest = 0;
      // RMS windows reject ordinary zero crossings. Exclude initial DSP fill.
      for (let i = 24000; i < 96000; i += 240) {
        let power = 0; for (let j = i; j < i + 240; j++) power += data[j] ** 2;
        silent = power / 240 < 1e-7 ? silent + 240 : 0; longest = Math.max(longest, silent);
      }
      const frequency = (start, end) => {
        let n = 0; for (let i = start; i < end; i++) if (data[i] < 0 && data[i + 1] >= 0) n++;
        return n * 48000 / (end - start);
      };
      metrics.push({ silence: longest / 48000, original: frequency(24000, 31200), up: frequency(50400, 60000), down: frequency(86400, 96000) });
    }
    return metrics;
  });
  await attachMetrics(testInfo, result);
  for (const [channel, metric] of result.entries()) {
    const tone = channel ? 660 : 440;
    expect(metric.silence).toBeLessThan(0.02);
    expect(Math.abs(metric.original - tone)).toBeLessThan(12);
    expect(Math.abs(metric.up - tone * 2)).toBeLessThan(12);
    expect(Math.abs(metric.down - tone / 2)).toBeLessThan(12);
  }
});

test('replacing held scratch transport and disabling Slip discard its old background clock', async ({ page }, testInfo) => {
  const result = await page.evaluate(async () => {
    const deck = window.__mixdesk.engine.decks[0], wait = ms => new Promise(r => setTimeout(r, ms));
    const results = [];
    for (const action of ['pause', 'seek', 'load', 'play', 'disableSlip']) {
      deck.pause(); deck.seek(5); deck.performance.setSlip(true); await deck.play();
      deck.scratchTouch(true); deck.scratchMove(-2); await wait(40);
      const held = deck.position;
      if (action === 'pause') deck.pause();
      else if (action === 'seek') deck.seek(7);
      else if (action === 'load') deck.load({ id: 'scratch-replacement', bpm: 120 }, deck.buffer);
      else if (action === 'play') await deck.play();
      else deck.performance.setSlip(false);
      const discarded = deck.performance.scratchSlip === null;
      deck.scratchTouch(false); await wait(30);
      results.push({ action, discarded, held, position: deck.position, playing: deck.playing });
    }
    deck.pause();
    return results;
  });
  await attachMetrics(testInfo, result);
  for (const r of result) {
    expect(r.discarded).toBe(true);
    expect(r.playing).toBe(r.action === 'play' || r.action === 'disableSlip');
    if (r.action === 'load') expect(r.position).toBe(0);
    else if (r.action === 'seek') expect(r.position).toBe(7);
    else expect(Math.abs(r.position - r.held)).toBeLessThan(0.15);
  }
});

test('rapid pitch-enabled transport replacements drain old voices without cutting the current voice', async ({ page }, testInfo) => {
  const result = await page.evaluate(async () => {
    const { engine } = window.__mixdesk; await engine.pitchReady;
    const deck = engine.decks[0], context = engine.context;
    const buffer = context.createBuffer(2, context.sampleRate * 8, context.sampleRate);
    for (let c = 0; c < 2; c++) {
      const pcm = buffer.getChannelData(c);
      for (let i = 0; i < pcm.length; i++) pcm[i] = 0.2 * Math.sin(2 * Math.PI * 440 * i / buffer.sampleRate);
    }
    deck.load({ id: 'voice-lifetime', bpm: 120 }, buffer); deck.setPitch(true); await deck.play();
    const retired = [];
    for (let i = 0; i < 10; i++) {
      retired.push(deck.voice); deck.seek(2 + i / 10); deck.setReverse(i % 2 === 0);
    }
    const newest = deck.voice;
    // An error queued by an outgoing processor must not pause its successor.
    retired[0].node.onprocessorerror?.();
    const analyser = context.createAnalyser(); analyser.fftSize = 2048;
    deck.stems.input.connect(analyser);
    const data = new Float32Array(analyser.fftSize);
    const rms = () => { analyser.getFloatTimeDomainData(data); return Math.sqrt(data.reduce((s, x) => s + x * x, 0) / data.length); };
    const deadline = performance.now() + 4000;
    while (performance.now() < deadline && (deck.retiringVoices.size || rms() < 0.05)) await new Promise(r => setTimeout(r, 25));
    const result = { playing: deck.playing, sameVoice: newest === deck.voice, newestClosed: newest.closed,
      retiredClosed: retired.every(voice => voice.closed), remaining: deck.retiringVoices.size, rms: rms() };
    deck.pause(); deck.disposeVoices();
    result.disposed = deck.voice === null && deck.retiringVoices.size === 0 && newest.closed;
    deck.stems.input.disconnect(analyser); analyser.disconnect();
    return result;
  });
  await attachMetrics(testInfo, result);
  expect(result.playing).toBe(true);
  expect(result.sameVoice).toBe(true);
  expect(result.newestClosed).toBe(false);
  expect(result.retiredClosed).toBe(true);
  expect(result.remaining).toBe(0);
  expect(result.rms).toBeGreaterThan(0.05);
  expect(result.disposed).toBe(true);
});
