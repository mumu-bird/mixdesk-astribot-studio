import { test, expect } from '@playwright/test';
async function ready(page) {
  await page.goto('/'); await expect(page.locator('[data-deck="0"] .track-title')).toHaveText('Night Drive');
  await page.locator('#deck-layout').selectOption('four');
  await page.getByRole('button', { name: '将 Night Drive 载入 C 台', exact: true }).click();
  await page.getByRole('button', { name: '将 After Hours 载入 D 台', exact: true }).click();
}
async function slider(page, selector, value) {
  await page.locator(selector).evaluate((el, x) => { el.value = x; el.dispatchEvent(new Event('input')); }, value);
}
const masterRMS = page => page.evaluate(() => {
  const a = window.__mixdesk.engine.analyser, data = new Float32Array(a.fftSize); a.getFloatTimeDomainData(data);
  return Math.sqrt(data.reduce((s,x)=>s+x*x,0)/data.length);
});

test('all four decks render audio independently with crossfader assignment and PFL taps', async ({ page }) => {
  await ready(page);
  for (let id = 0; id < 4; id++) {
    await page.getByRole('button', { name: `播放 ${'ABCD'[id]}`, exact: true }).click();
    await expect.poll(() => page.evaluate(i => window.__mixdesk.engine.decks[i].meter(), id)).toBeGreaterThan(0.005);
  }
  expect(await page.evaluate(() => window.__mixdesk.engine.monitor.gates.length)).toBe(4);
  await slider(page, '#crossfader', 100);
  await slider(page, '[data-channel="1"] .channel-volume', 0);
  await slider(page, '[data-channel="3"] .channel-volume', 0);
  await expect.poll(() => masterRMS(page)).toBeLessThan(0.0001);
  await page.locator('[data-channel="2"] .cross-assign').selectOption('thru');
  await expect.poll(() => masterRMS(page)).toBeGreaterThan(0.005);
  await slider(page, '[data-channel="2"] .channel-volume', 0);
  await expect.poll(() => masterRMS(page)).toBeLessThan(0.0001);
  await slider(page, '[data-channel="3"] .channel-volume', 80);
  await expect.poll(() => masterRMS(page)).toBeGreaterThan(0.005);
});

test('four-deck sync source and Instant Double target the chosen deck', async ({ page }) => {
  await ready(page);
  await slider(page, '[data-deck="0"] .tempo', 10);
  await page.locator('[data-deck="3"] .sync-source').selectOption('0');
  await page.locator('[data-deck="3"] .sync-button').click();
  expect(await page.evaluate(() => { const [a,,,d] = window.__mixdesk.engine.decks; return d.bpm * d.rate - a.bpm * a.rate; })).toBeCloseTo(0, 5);
  await page.evaluate(async () => { const a = window.__mixdesk.engine.decks[0]; a.seek(4); a.hotcues[7] = 3; await a.play(); });
  await page.locator('[data-deck="2"] .sync-source').selectOption('0');
  await page.locator('[data-deck="2"] .instant-double').click();
  await expect.poll(() => page.evaluate(() => window.__mixdesk.engine.decks[2].playing)).toBe(true);
  expect(await page.evaluate(() => { const [a,,c] = window.__mixdesk.engine.decks; return { source: c.track.id === a.track.id, cue8: c.hotcues[7], playing: c.playing, gap: Math.abs(a.position - c.position) < 0.15 }; })).toEqual({ source: true, cue8: 3, playing: true, gap: true });
  await page.locator('#deck-layout').selectOption('two');
  await expect(page.locator('[data-deck="2"]')).toBeHidden();
  await expect(page.locator('[data-deck-status="2"]')).toHaveText('C · 播放中');
  const before = await page.evaluate(() => window.__mixdesk.engine.decks[2].position);
  await expect.poll(() => page.evaluate(() => window.__mixdesk.engine.decks[2].position)).toBeGreaterThan(before + 0.1);
  await page.getByRole('button', { name: '查看 C 台' }).click();
  await expect(page.locator('[data-deck="2"]')).toBeVisible();
  await expect(page.locator('#deck-layout')).toHaveValue('four');
});

test('eight hot cues persist across reload and four-deck layout fits desktop and phone', async ({ page }) => {
  await ready(page);
  await page.evaluate(() => window.__mixdesk.engine.decks[2].seek(7));
  await page.locator('[data-deck="2"] [data-cue="7"]').click();
  await expect(page.locator('[data-deck="2"] [data-cue="7"]')).toHaveClass(/set/);
  await expect(page.locator('[data-deck="2"] .annotation-status')).toHaveText('标记已保存到本机');
  await page.reload();
  await expect(page.locator('#deck-layout')).toHaveValue('four');
  await expect(page.locator('[data-deck="0"] [data-cue="7"]')).toHaveClass(/set/);
  await expect(page.locator('[data-deck="0"] [data-cue="7"] span')).toHaveText('00:07');
  for (const viewport of [{ width: 1440, height: 1080 }, { width: 900, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    for (let id = 0; id < 4; id++) await expect(page.locator(`[data-deck="${id}"] .play-button`)).toBeVisible();
  }
  await page.screenshot({ path: 'screenshots/mixdesk-four-decks-mobile.png', fullPage: true });
  await page.setViewportSize({ width: 1440, height: 1080 });
  await page.screenshot({ path: 'screenshots/mixdesk-four-decks.png', fullPage: true });
});

test('DJUCED layout presets keep deck state and expose distinct workspace modes', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#deck-layout')).toHaveValue('twoHorizontal');
  await page.locator('#deck-layout').selectOption('twoVertical');
  await expect(page.locator('.console')).toHaveAttribute('data-layout', 'twoVertical');
  await expect(page.locator('[data-deck="2"]')).toBeHidden();
  await expect(page.locator('.mixer')).toBeVisible();

  await page.locator('#deck-layout').selectOption('twoSampler');
  await expect(page.locator('.sampler-panel')).toBeVisible();
  await expect(page.locator('[data-deck="2"]')).toBeHidden();

  await page.locator('#deck-layout').selectOption('fourHorizontal');
  await expect(page.locator('.console')).toHaveAttribute('data-layout', 'fourHorizontal');
  await expect(page.locator('[data-deck="2"]')).toBeVisible();
  const horizontal = await page.locator('.console').evaluate(el => getComputedStyle(el).gridTemplateColumns);
  await page.locator('#deck-layout').selectOption('fourVertical');
  await expect(page.locator('.console')).toHaveAttribute('data-layout', 'fourVertical');
  const vertical = await page.locator('.console').evaluate(el => getComputedStyle(el).gridTemplateColumns);
  expect(horizontal).not.toBe(vertical);

  await page.locator('#deck-layout').selectOption('browser');
  await expect(page.locator('#layout-mode-panel')).toHaveAttribute('data-mode', 'browser');
  await expect(page.locator('#layout-mode-panel')).toContainText('浏览曲库');
  await expect(page.locator('.console')).toBeHidden();
  await expect(page.locator('#library')).toBeVisible();
  await page.locator('#deck-layout').selectOption('prepare');
  await expect(page.locator('#layout-mode-panel')).toHaveAttribute('data-mode', 'prepare');
  await expect(page.locator('#layout-mode-panel')).toContainText('待播列表');
  await expect(page.locator('.console')).toBeHidden();
  await expect(page.locator('#library')).toBeVisible();
});
