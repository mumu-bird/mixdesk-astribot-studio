import { test, expect } from '@playwright/test';

async function ready(page) {
  await page.goto('/');
  await expect(page.locator('[data-deck="0"] .track-title')).toHaveText('Night Drive');
}

async function reverseTrack(page, duration = 8) {
  await page.evaluate(async duration => {
    const { engine } = window.__mixdesk;
    const deck = engine.decks[0], buffer = engine.context.createBuffer(1, engine.context.sampleRate * duration, engine.context.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = i / data.length;
    deck.load({ id: 'reverse-regression', title: 'Reverse regression', bpm: 120 }, buffer);
  }, duration);
}

test('REV reverses PCM and makes the transport clock decrease', async ({ page }) => {
  await ready(page); await reverseTrack(page);
  const result = await page.evaluate(async () => {
    const deck = window.__mixdesk.engine.decks[0];
    const reversed = deck.getReverseBuffer().getChannelData(0);
    deck.seek(3); deck.setReverse(true); await deck.play();
    const before = deck.position;
    await new Promise(resolve => setTimeout(resolve, 180));
    const after = deck.position;
    deck.pause();
    return { first: reversed[0], last: reversed.at(-1), before, after, reverse: deck.reverse, playing: deck.playing };
  });
  expect(result.first).toBeGreaterThan(result.last);
  expect(result.after).toBeLessThan(result.before - 0.08);
  expect(result.reverse).toBe(true);
  expect(result.playing).toBe(false);
});

test('reverse loops stay inside their original timeline and continue backwards', async ({ page }) => {
  await ready(page); await reverseTrack(page);
  const result = await page.evaluate(async () => {
    const deck = window.__mixdesk.engine.decks[0];
    deck.seek(2); deck.setReverse(true); deck.setLoop(1, 3, { jump: true }); await deck.play();
    const first = deck.position;
    await new Promise(resolve => setTimeout(resolve, 220));
    const second = deck.position;
    const loop = { ...deck.loop }, sourceLoop = deck.source.loop;
    deck.pause();
    return { first, second, loop, sourceLoop, paused: deck.position };
  });
  expect(result.sourceLoop).toBe(true);
  expect(result.first).toBeGreaterThanOrEqual(result.loop.start);
  expect(result.first).toBeLessThan(result.loop.end);
  expect(result.second).toBeGreaterThanOrEqual(result.loop.start);
  expect(result.second).toBeLessThan(result.loop.end);
  expect(result.second).toBeLessThan(result.first);
  expect(result.paused).toBeCloseTo(result.second, 2);
});

test('reverse Slip Hot Cue restores its descending background clock', async ({ page }) => {
  await ready(page); await reverseTrack(page);
  const result = await page.evaluate(async () => {
    const deck = window.__mixdesk.engine.decks[0], wait = ms => new Promise(resolve => setTimeout(resolve, ms));
    deck.seek(5); deck.setReverse(true); deck.hotcues[0] = 1; deck.performance.setSlip(true); await deck.play();
    const started = deck.performance.beginSlipCue(1, 0, 'test-reverse');
    await wait(220);
    const preview = { audible: deck.position, background: deck.performance.backgroundPosition };
    deck.performance.endSlipCue('test-reverse');
    const restored = deck.position;
    deck.pause();
    return { started, preview, restored, reverse: deck.reverse };
  });
  expect(result.started).toBe(true);
  expect(result.preview.audible).toBeLessThan(1);
  expect(result.preview.audible).toBeGreaterThan(0.7);
  expect(result.preview.background).toBeLessThan(5);
  expect(Math.abs(result.restored - result.preview.background)).toBeLessThan(0.08);
  expect(result.reverse).toBe(true);
});
