import { chromium, expect } from '@playwright/test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { readFile, mkdir, writeFile } from 'node:fs/promises';

// Start a production preview first: npm run preview -- --port 4173 --strictPort
const base = process.env.MIXDESK_SMOKE_URL || 'http://127.0.0.1:4173/';
const chrome = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const browser = await chromium.launch({
  ...(existsSync(chrome) ? { executablePath: chrome } : {}),
  headless: true,
  args: ['--autoplay-policy=no-user-gesture-required', '--disable-audio-output'],
});
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1080 } });
  const errors = [], remote = [];
  page.on('pageerror', e => errors.push(e.message));
  page.on('request', r => {
    if (/^https?:/.test(r.url()) && new URL(r.url()).origin !== new URL(base).origin) remote.push(r.url());
  });
  await page.goto(base);
  await page.waitForFunction(() => document.querySelector('#app')?.inert === false);
  const deck = page.locator('[data-deck="0"]');
  await expect(deck.locator('.track-title')).toHaveText('Night Drive');
  await expect(page.locator('footer')).toContainText('0.8.4');
  assert.equal(await page.evaluate(() => '__mixdesk' in window), false, 'Use the production build, without the dev hook');
  await expect(deck.locator('.key-lock')).toBeEnabled();
  await page.locator('#record-settings').click();
  await page.locator('#record-format').selectOption('wav24');
  await page.locator('#record-close').click();
  await deck.locator('.key-lock').click();
  await deck.locator('.play-button').click();
  await expect(deck).toHaveClass(/playing/);
  await page.locator('#record').click();
  await expect(page.locator('#record')).toHaveClass(/recording/);
  await page.waitForTimeout(400);
  for (const shift of ['7', '-5', '0']) {
    await deck.locator('.key-shift').selectOption(shift);
    await page.waitForTimeout(350);
  }
  await deck.locator('.slip-toggle').click();
  await deck.locator('.platter').scrollIntoViewIfNeeded();
  const platter = await deck.locator('.platter').boundingBox();
  assert.ok(platter);
  await page.mouse.move(platter.x + platter.width * 0.8, platter.y + platter.height * 0.5);
  await page.mouse.down();
  await page.mouse.move(platter.x + platter.width * 0.5, platter.y + platter.height * 0.8, { steps: 8 });
  await expect(deck.locator('.slip-readout')).toContainText('SLIP SCRATCH');
  await page.waitForTimeout(150);
  await page.mouse.up();
  await expect(deck).toHaveClass(/playing/);
  await expect(deck.locator('.slip-readout')).toHaveText('');
  await page.waitForTimeout(350);
  await deck.locator('.reverse-button').click();
  await expect(deck.locator('.reverse-button')).toHaveAttribute('aria-pressed', 'true');
  await page.waitForTimeout(350);
  await deck.locator('.reverse-button').click();
  await page.waitForTimeout(350);
  await deck.locator('.play-button').click();
  await expect(deck).not.toHaveClass(/playing/);
  await page.waitForTimeout(150);
  const download = page.waitForEvent('download');
  await page.locator('#record').click();
  const wav = await readFile(await (await download).path());
  assert.equal(wav.toString('ascii', 0, 4), 'RIFF');
  assert.equal(wav.toString('ascii', 8, 12), 'WAVE');
  assert.equal(wav.readUInt16LE(22), 2);
  assert.equal(wav.readUInt16LE(34), 24);
  let power = 0, peak = 0;
  for (let i = 44; i < wav.length; i += 3) {
    const sample = wav.readIntLE(i, 3) / 8388608;
    power += sample ** 2; peak = Math.max(peak, Math.abs(sample));
  }
  const metrics = {
    production: true, version: '0.8.4', channels: 2, bitDepth: 24,
    sampleRate: wav.readUInt32LE(24), duration: (wav.length - 44) / wav.readUInt32LE(28),
    rms: Math.sqrt(power / ((wav.length - 44) / 3)), peak, errors, remoteRequests: remote,
    actions: ['Key Lock', 'live +7/-5/0 semitones', 'Slip scratch', 'reverse', 'pause', 'WAV download'],
  };
  assert.ok(metrics.duration > 2);
  assert.ok(metrics.rms > 0.005);
  assert.deepEqual(errors, []);
  assert.deepEqual(remote, []);
  await mkdir('research/evidence', { recursive: true });
  await writeFile('research/evidence/audio-core-production.wav', wav);
  await writeFile('research/evidence/audio-core-production.json', JSON.stringify(metrics, null, 2) + '\n');
  console.log(JSON.stringify(metrics, null, 2));
} finally {
  await browser.close();
}
