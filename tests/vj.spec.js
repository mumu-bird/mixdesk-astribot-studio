import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-deck="0"] .track-title')).toHaveText('Night Drive');
});

test('VJ panel exposes two independent muted video channels', async ({ page }) => {
  await page.locator('#vj-toggle').click();
  await expect(page.locator('#vj-panel')).toBeVisible();
  await expect(page.locator('[data-vj-layer]')).toHaveCount(2);
  const result = await page.evaluate(() => window.__mixdesk.vj.channels.map(channel => ({
    index: channel.index,
    visible: channel.visible,
    opacity: channel.opacity,
    rate: channel.rate,
    muted: channel.video?.muted,
  })));
  expect(result).toEqual([
    { index: 0, visible: true, opacity: 1, rate: 1, muted: true },
    { index: 1, visible: true, opacity: 1, rate: 1, muted: true },
  ]);
  // Verify the card does not clip its controls below the fixed video aspect ratio.
  for (const width of [1440, 800, 390]) {
    await page.setViewportSize({ width, height: 900 });
    const clipped = await page.locator('[data-vj-layer]').evaluateAll(layers => layers.flatMap(layer => {
      const card = layer.getBoundingClientRect();
      return [...layer.querySelectorAll('.vj-channel-controls button, .vj-channel-controls input, .vj-channel-controls select')]
        .filter(control => {
          const box = control.getBoundingClientRect();
          return box.left < card.left || box.right > card.right || box.top < card.top || box.bottom > card.bottom;
        }).map(control => control.className);
    }));
    expect(clipped, `VJ controls at ${width}px`).toEqual([]);
  }
});

test('VJ fullscreen keeps the same video and transport controls, then returns to the workstation', async ({ page }) => {
  await page.locator('#vj-toggle').click();
  const layer = page.locator('[data-vj-layer="0"]');
  await layer.locator('.vj-fullscreen').click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement?.dataset.vjLayer)).toBe('0');
  await expect(layer.locator('.vj-video')).toHaveCount(1);
  await expect(layer.locator('.vj-load')).toBeVisible();
  await layer.locator('.vj-fullscreen').click();
  await expect.poll(() => page.evaluate(() => document.fullscreenElement === null)).toBe(true);
  await expect(page.locator('#vj-panel')).toBeVisible();
});

test('VJ opacity, visibility and transport state follow the local controller API', async ({ page }) => {
  await page.locator('#vj-toggle').click();
  const result = await page.evaluate(async () => {
    const { vj } = window.__mixdesk;
    vj.setOpacity(.35, 0);
    vj.setVisible(false, 1);
    vj.setRate(1.25, 0);
    vj.setPosition(4, 0);
    return vj.channels.map(channel => ({ opacity: channel.opacity, visible: channel.visible, rate: channel.rate, position: channel.position }));
  });
  expect(result).toEqual([
    { opacity: .35, visible: true, rate: 1.25, position: 4 },
    { opacity: 1, visible: false, rate: 1, position: 0 },
  ]);
  await page.locator('[data-vj-layer="1"] .vj-toggle-visible').click();
  await expect(page.locator('[data-vj-layer="1"] .vj-toggle-visible')).toHaveText('隐藏');
  await page.locator('[data-vj-layer="0"] .vj-opacity').fill('20');
  expect(await page.evaluate(() => window.__mixdesk.vj.channels[0].opacity)).toBeCloseTo(.2, 5);
});

test('VJ effects and animations are per-channel and persist after reload', async ({ page }) => {
  await page.locator('#vj-toggle').click();
  const result = await page.evaluate(async () => {
    const { vj } = window.__mixdesk;
    vj.setEffect({ name: 'sepia', amount: .75, enabled: true }, 0);
    vj.setAnimation({ name: 'pulse', amount: .6, speed: 2, enabled: true }, 0);
    await vj.save();
    return vj.snapshot().channels[0];
  });
  expect(result.effect).toMatchObject({ name: 'sepia', amount: .75, enabled: true });
  expect(result.animation).toMatchObject({ name: 'pulse', amount: .6, speed: 2, enabled: true });
  await expect(page.locator('[data-vj-layer="0"] .vj-effect')).toHaveValue('sepia');
  await expect(page.locator('[data-vj-layer="0"] .vj-effect-toggle')).toHaveText('特效开');
  await expect(page.locator('[data-vj-layer="0"] .vj-animation-toggle')).toHaveText('动画开');
  await page.locator('[data-vj-layer="0"] .vj-animation-amount').fill('65');
  await page.evaluate(() => window.__mixdesk.vj.save());
  expect(await page.evaluate(() => window.__mixdesk.vj.channel(0).animation.amount)).toBe(.65);
  expect(await page.evaluate(() => window.__mixdesk.vj.channel(1).animation.enabled)).toBe(false);
  await page.reload();
  await expect.poll(() => page.evaluate(() => window.__mixdesk.vj.channel(0).effect.name)).toBe('sepia');
  const restored = await page.evaluate(() => {
    const state = window.__mixdesk.vj.channel(0);
    return { effect: state.effect, animation: state.animation, filter: state.video.style.filter, animationName: state.video.style.animationName };
  });
  expect(restored.effect).toMatchObject({ name: 'sepia', amount: .75, enabled: true });
  expect(restored.animation).toMatchObject({ name: 'pulse', speed: 2, amount: .65, enabled: true });
  expect(restored.filter).toContain('sepia');
  expect(restored.animationName).toBe('vj-pulse');
});

test('VJ transport controls play, seek and stop independently when deck sync is off', async ({ page }) => {
  await page.locator('#vj-toggle').click();
  await page.evaluate(() => {
    const state = window.__mixdesk.vj.channel(0), video = state.video;
    let paused = true, currentTime = 0;
    Object.defineProperty(video, 'paused', { configurable: true, get: () => paused });
    Object.defineProperty(video, 'currentTime', { configurable: true, get: () => currentTime, set: value => { currentTime = value; } });
    video.play = async () => { paused = false; };
    video.pause = () => { paused = true; };
    state.url = 'local:transport-test'; state.loaded = true; state.duration = 20;
    window.__mixdesk.vj.emit();
  });

  const layer = page.locator('[data-vj-layer="0"]');
  await layer.locator('.vj-sync').selectOption('false');
  await layer.locator('.vj-play').click();
  await expect.poll(() => page.evaluate(() => window.__mixdesk.vj.channel(0).playing)).toBe(true);
  await layer.locator('.vj-seek').fill('500');
  await expect.poll(() => page.evaluate(() => window.__mixdesk.vj.channel(0).position)).toBe(10);
  await layer.locator('.vj-rate').fill('1.5');
  await layer.locator('.vj-rate').dispatchEvent('change');
  expect(await page.evaluate(() => window.__mixdesk.vj.channel(0).rate)).toBe(1.5);

  await page.evaluate(() => {
    const { vj, engine } = window.__mixdesk;
    const deck = engine.decks[0]; deck.pause();
    vj.syncDeck(deck, 0);
  });
  expect(await page.evaluate(() => window.__mixdesk.vj.channel(0).playing)).toBe(true);
  await layer.locator('.vj-stop').click();
  await expect.poll(() => page.evaluate(() => window.__mixdesk.vj.channel(0).position)).toBe(0);
  expect(await page.evaluate(() => window.__mixdesk.vj.channel(0).playing)).toBe(false);
});

test('VJ follows deck play, pause, seek and tempo without adding a second audio path', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { engine, vj } = window.__mixdesk;
    const video = document.createElement('video');
    let paused = true;
    Object.defineProperty(video, 'duration', { value: 20, configurable: true });
    Object.defineProperty(video, 'currentTime', { value: 0, writable: true, configurable: true });
    Object.defineProperty(video, 'paused', { get: () => paused, configurable: true });
    video.play = async () => { paused = false; }; video.pause = () => { paused = true; }; video.load = () => {};
    vj.channels[0].video = video; vj.channels[0].url = 'local:test'; vj.channels[0].loaded = true; vj.channels[0].duration = 20;
    const deck = engine.decks[0]; deck.pause(); deck.seek(3); deck.setRate(1.1); deck.playing = true; deck.anchor = deck.context.currentTime;
    const expected = deck.position;
    vj.syncDeck(deck, 0);
    const playing = { rate: vj.channels[0].rate, position: vj.channels[0].position, expected, muted: vj.channels[0].video.muted };
    deck.playing = false; vj.syncDeck(deck, 0);
    return { playing, paused: vj.channels[0].playing };
  });
  expect(result.playing.rate).toBeCloseTo(1.1, 4);
  expect(result.playing.position).toBeCloseTo(result.playing.expected, 2);
  expect(result.playing.muted).toBeTruthy();
  expect(result.paused).toBeFalsy();
});

test('a real local video loads, seeks, stays muted, and restores from IndexedDB', async ({ page }) => {
  const imported = await page.evaluate(async () => {
    const mime = 'video/webm;codecs=vp8';
    if (!MediaRecorder.isTypeSupported(mime)) return { unsupported: true };
    const canvas = document.createElement('canvas'); canvas.width = 64; canvas.height = 64;
    const context = canvas.getContext('2d'), stream = canvas.captureStream(12), chunks = [];
    const recorder = new MediaRecorder(stream, { mimeType: mime });
    recorder.ondataavailable = event => { if (event.data.size) chunks.push(event.data); };
    const drawing = setInterval(() => { context.fillStyle = `rgb(${Math.floor(Math.random() * 255)},80,140)`; context.fillRect(0,0,64,64); }, 40);
    recorder.start();
    await new Promise(resolve => setTimeout(resolve, 900));
    const stopped = new Promise(resolve => { recorder.onstop = resolve; }); recorder.stop(); await stopped;
    clearInterval(drawing); stream.getTracks().forEach(track => track.stop());
    const file = new File(chunks, 'local-test.webm', { type: mime });
    const { vj } = window.__mixdesk;
    vj.setSyncToDeck(false, 0);
    await vj.loadFile(0, file);
    vj.setVisible(false, 0); vj.setOpacity(.4, 0); vj.setRate(1.2, 0);
    vj.setPosition(Math.min(.25, Math.max(0, vj.channels[0].duration / 4)), 0);
    await vj.save();
    return { unsupported: false, name: vj.channels[0].name, duration: vj.channels[0].duration, position: vj.channels[0].position, muted: vj.channels[0].video.muted };
  });
  test.skip(imported.unsupported, 'This browser does not support local VP8 recording.');
  expect(imported.name).toBe('local-test.webm');
  expect(imported.duration).toBeGreaterThan(.3);
  expect(imported.muted).toBeTruthy();

  await page.locator('#vj-toggle').click();
  const outputPromise = page.waitForEvent('popup');
  await page.locator('#vj-output').click();
  const output = await outputPromise;
  await expect(output.locator('video')).toHaveCount(2);
  await expect.poll(() => output.locator('#a').evaluate(video => video.readyState)).toBeGreaterThan(0);
  await expect.poll(() => output.locator('#a').evaluate(video => video.currentTime)).toBeGreaterThan(0.05);
  await page.evaluate(() => { const { vj } = window.__mixdesk; vj.setVisible(true, 0); vj.setOpacity(.4, 0); });
  await expect(output.locator('#a')).toHaveCSS('display', 'block');
  await expect(output.locator('#a')).toHaveCSS('opacity', '0.4');

  // Verify real cross-window messages and computed styles on the decoded video.
  await page.evaluate(() => {
    const { vj } = window.__mixdesk;
    vj.setEffect({ name: 'sepia', amount: .75, enabled: true }, 0);
    vj.setAnimation({ name: 'pulse', amount: .6, speed: 2, enabled: true }, 0);
  });
  for (const video of [page.locator('[data-vj-layer="0"] video'), output.locator('#a')]) {
    await expect(video).toHaveCSS('filter', 'sepia(0.75)');
    await expect(video).toHaveCSS('animation-name', 'vj-pulse');
    await expect(video).toHaveCSS('animation-duration', '0.5s');
    await expect(video).toHaveCSS('--vj-animation-amount', '0.6');
    await expect(video).toHaveCSS('animation-play-state', 'paused');
  }
  await expect(output.locator('#b')).toHaveCSS('filter', 'none');
  await expect(output.locator('#b')).toHaveCSS('animation-name', 'none');

  const transport = await page.evaluate(async () => {
    const { vj, engine } = window.__mixdesk;
    const state = vj.channel(0);
    vj.setSyncToDeck(false, 0, engine.decks[0]);
    vj.setPosition(0, 0);
    await vj.play(0);
    const playing = !state.video.paused;
    await new Promise(resolve => setTimeout(resolve, 140));
    const outputVideo = window.__mixdesk.vjOutput.popup?.document.querySelector('#a');
    const outputPlaying = { paused: outputVideo?.paused, currentTime: outputVideo?.currentTime, muted: outputVideo?.muted };
    const advanced = state.video.currentTime > 0;
    vj.pause(null, 0);
    const pausedAt = state.video.currentTime;
    await new Promise(resolve => setTimeout(resolve, 60));
    const held = state.video.currentTime;
    vj.stop(0);
    const stoppedAt = state.video.currentTime;
    vj.setPosition(0.2, 0);
    vj.setVisible(false, 0);
    await vj.save();
    return { playing, advanced, pausedAt, held, stoppedAt, outputPlaying };
  });
  expect(transport).toMatchObject({ playing: true, advanced: true, stoppedAt: 0 });
  expect(transport.held).toBeCloseTo(transport.pausedAt, 1);
  expect(transport.outputPlaying).toMatchObject({ paused: false, muted: true });
  expect(transport.outputPlaying.currentTime).toBeGreaterThan(0);
  await expect(output.locator('#a')).toHaveCSS('animation-play-state', 'paused');
  await page.evaluate(() => {
    const { vj } = window.__mixdesk;
    vj.setVisible(true, 0);
    vj.setAnimation({ name: 'strobe', amount: .5, speed: 1, enabled: true }, 0);
  });
  for (const video of [page.locator('[data-vj-layer="0"] video'), output.locator('#a')]) {
    await expect(video).toHaveCSS('animation-name', 'vj-strobe');
    const phases = await video.evaluate(element => {
      const animation = element.getAnimations()[0];
      animation.pause(); animation.currentTime = 0;
      const bright = Number(getComputedStyle(element).opacity);
      animation.currentTime = 750;
      return { bright, dim: Number(getComputedStyle(element).opacity) };
    });
    expect(phases).toEqual({ bright: .4, dim: .2 });
  }
  await page.evaluate(() => window.__mixdesk.vj.setOpacity(0, 0));
  for (const video of [page.locator('[data-vj-layer="0"] video'), output.locator('#a')]) {
    await expect(video).toHaveCSS('--vj-opacity', '0');
    expect(await video.evaluate(element => {
      element.getAnimations()[0].currentTime = 0;
      return Number(getComputedStyle(element).opacity);
    })).toBe(0);
  }
  await page.evaluate(() => {
    const { vj } = window.__mixdesk;
    vj.resetVisuals(0); vj.setOpacity(.4, 0); vj.setVisible(false, 0);
  });
  await expect(output.locator('#a')).toHaveCSS('filter', 'none');
  await expect(output.locator('#a')).toHaveCSS('animation-name', 'none');
  await output.close();

  await page.reload();
  await expect.poll(() => page.evaluate(() => window.__mixdesk.vj.channels[0].duration)).toBeGreaterThan(.3);
  const restored = await page.evaluate(() => {
    const channel = window.__mixdesk.vj.channels[0];
    return { name: channel.name, duration: channel.duration, position: channel.position, opacity: channel.opacity, visible: channel.visible, rate: channel.rate, syncToDeck: channel.syncToDeck, muted: channel.video.muted, playing: channel.playing };
  });
  expect(restored.name).toBe('local-test.webm');
  expect(restored.duration).toBeGreaterThan(.3);
  expect(restored.position).toBeCloseTo(.2, 1);
  expect(restored).toMatchObject({ opacity: .4, visible: false, rate: 1.2, syncToDeck: false, muted: true, playing: false });
});

test('local LRC and SRT lyrics follow VJ position and persist styling', async ({ page }) => {
  await page.locator('#vj-toggle').click();
  const result = await page.evaluate(async () => {
    const { vj } = window.__mixdesk;
    const lrc = new File(['[00:00.00]Intro\n[00:02.00]Drop'], 'set.lrc', { type: 'text/plain' });
    await vj.loadLyrics(0, lrc);
    vj.setPosition(2.2, 0); vj.setLyrics({ fontSize: 44, position: 'center', opacity: .7 }, 0); await vj.save();
    return { cues: vj.channel(0).lyrics.cues, current: vj.snapshot().channels[0].lyrics.current, style: vj.channel(0).lyricsElement?.textContent };
  });
  expect(result.cues).toHaveLength(2);
  expect(result.current).toBe('Drop');
  expect(result.style).toBe('Drop');
  await expect(page.locator('[data-vj-layer="0"] .vj-lyrics')).toHaveText('Drop');
  await expect(page.locator('[data-vj-layer="0"] .vj-lyrics')).toHaveCSS('font-size', '44px');
  await page.reload();
  await expect.poll(() => page.evaluate(() => window.__mixdesk.vj.channel(0).lyrics.name)).toBe('set.lrc');
  expect(await page.evaluate(() => window.__mixdesk.vj.channel(0).lyrics.fontSize)).toBe(44);
});

test('parseLyrics accepts SRT and pipe timeline text', async ({ page }) => {
  const result = await page.evaluate(async () => {
    const { parseLyrics } = await import('/src/vj.js');
    return {
      srt: parseLyrics('1\n00:00:01,000 --> 00:00:02,000\nHello\n\n2\n00:00:03,000 --> 00:00:04,000\nWorld'),
      pipe: parseLyrics('00:01.50 | One\n00:02.50\tTwo'),
    };
  });
  expect(result.srt.map(c => c.text)).toEqual(['Hello', 'World']);
  expect(result.pipe.map(c => c.start)).toEqual([1.5, 2.5]);
});
