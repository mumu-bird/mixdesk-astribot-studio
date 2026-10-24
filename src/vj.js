const CHANNELS = 2;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function parseClock(value) {
  const text = String(value || '').trim();
  const match = text.match(/^(?:(\d+):)?(\d{1,2}):(\d{1,3})(?:[.,](\d{1,3}))?$/);
  if (match) {
    const fraction = String(match[4] || '').padEnd(3, '0');
    return Number(match[1] || 0) * 3600 + Number(match[2]) * 60 + Number(match[3]) + (fraction ? Number(fraction) / 1000 : 0);
  }
  const short = text.match(/^(\d{1,3}):(\d{1,3})(?:[.,](\d{1,3}))?$/);
  if (!short) return NaN;
  const fraction = String(short[3] || '').padEnd(3, '0');
  return Number(short[1]) * 60 + Number(short[2]) + (fraction ? Number(fraction) / 1000 : 0);
}

export function parseLyrics(text) {
  const source = String(text || '').replace(/^\uFEFF/, '').replace(/\r/g, '');
  const cues = [];
  const add = (start, end, value) => {
    const lyric = String(value || '').replace(/<[^>]+>/g, '').replace(/\n+/g, ' ').trim();
    if (Number.isFinite(start) && lyric) cues.push({ start: Math.max(0, start), end: Number.isFinite(end) ? Math.max(start, end) : null, text: lyric });
  };
  const lines = source.split('\n');
  const isSrt = /(?:^|\n)\s*\d{1,3}:\d{2}:\d{2}[,.]\d{1,3}\s*-->/.test(source);
  if (isSrt) {
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/^\s*(\d{1,3}:\d{2}:\d{2}[,.]\d{1,3})\s*-->\s*(\d{1,3}:\d{2}:\d{2}[,.]\d{1,3})/);
      if (!match) continue;
      const body = []; for (let j = i + 1; j < lines.length && lines[j].trim(); j++) body.push(lines[j]);
      add(parseClock(match[1]), parseClock(match[2]), body.join(' '));
    }
  } else {
    for (const line of lines) {
      const tags = [...line.matchAll(/\[(\d{1,3}:\d{2}(?:[.,]\d{1,3})?)\]/g)];
      if (tags.length) { const value = line.replace(/\[(\d{1,3}:\d{2}(?:[.,]\d{1,3})?)\]/g, '').trim(); tags.forEach(tag => add(parseClock(tag[1]), null, value)); continue; }
      const pipe = line.match(/^\s*(\d{1,3}:\d{2}(?:[.,]\d{1,3})?)\s*[|\t]\s*(.+)$/);
      if (pipe) add(parseClock(pipe[1]), null, pipe[2]);
    }
  }
  cues.sort((a, b) => a.start - b.start);
  return cues.map((cue, index) => ({ ...cue, end: cue.end ?? cues[index + 1]?.start ?? null }));
}

function lyricAt(cues, position) {
  const time = Number(position); if (!Array.isArray(cues) || !Number.isFinite(time)) return '';
  return cues.find(item => time >= item.start - 0.02 && (item.end == null || time < item.end))?.text || '';
}

function isFile(value) {
  return value && typeof value === 'object' && typeof value.size === 'number' && typeof value.slice === 'function';
}

// The native VJ editor exposes an effect and an animation lane for each
// channel.  These names intentionally describe browser-safe equivalents; the
// original plug-in DSP and its downloadable assets are not present in the app
// bundle and cannot be reconstructed from the UI symbols alone.
export const VJ_EFFECTS = Object.freeze({
  none: '无',
  blur: '柔焦',
  brightness: '亮度',
  contrast: '对比度',
  saturate: '饱和度',
  grayscale: '灰度',
  sepia: '棕褐',
  invert: '反色',
  hue: '色相',
});

export const VJ_ANIMATIONS = Object.freeze({
  none: '无',
  pulse: '呼吸',
  drift: '漂移',
  zoom: '缩放',
  spin: '旋转',
  strobe: '闪烁',
});

const defaultEffect = () => ({ name: 'none', amount: 0.5, enabled: false });
const defaultAnimation = () => ({ name: 'none', speed: 1, amount: 0.5, enabled: false });

/**
 * Local two-channel VJ transport.
 *
 * DJUCED exposes two Video channels with independent path, rate, position,
 * opacity and transport controls. The browser implementation keeps the same
 * state model while using muted HTMLVideoElements so video audio never joins
 * the DJ mix a second time.
 */
export class VJController {
  constructor({ setting = null, onChange = () => {} } = {}) {
    this.setting = setting;
    this.onChange = onChange;
    this.channels = Array.from({ length: CHANNELS }, (_, index) => ({
      index,
      file: null,
      name: '',
      url: '',
      loaded: false,
      visible: true,
      opacity: 1,
      rate: 1,
      position: 0,
      duration: 0,
      playing: false,
      syncToDeck: true,
      video: null,
      generation: 0,
      playGeneration: 0,
      lyrics: { file: null, name: '', cues: [], visible: true, opacity: 1, fontSize: 28, position: 'bottom', shadow: true },
      lyricsElement: null,
      effect: defaultEffect(),
      animation: defaultAnimation(),
    }));
  }

  channel(index) {
    const value = Number(index);
    if (!Number.isInteger(value) || value < 0 || value >= CHANNELS) throw new Error('VJ 通道无效');
    return this.channels[value];
  }

  mount(container, index) {
    const state = this.channel(index);
    if (!container) throw new Error('VJ 视频容器不存在');
    if (state.video) state.video.remove();
    const video = document.createElement('video');
    video.className = 'vj-video';
    video.muted = true;
    video.defaultMuted = true;
    video.playsInline = true;
    video.preload = 'metadata';
    video.controls = false;
    video.setAttribute('aria-label', `VJ ${index === 0 ? 'A' : 'B'} 视频`);
    video.addEventListener('loadedmetadata', () => {
      state.duration = Number.isFinite(video.duration) ? video.duration : 0;
      state.loaded = !!video.src;
      state.position = clamp(state.position, 0, state.duration || Infinity);
      if (state.loaded && Math.abs(video.currentTime - state.position) > 0.05) {
        try { video.currentTime = state.position; } catch { /* Metadata can precede seekability. */ }
      }
      this.applyVisualState(state);
      this.emit();
    });
    video.addEventListener('timeupdate', () => {
      if (state.video === video) {
        state.position = Number.isFinite(video.currentTime) ? video.currentTime : state.position;
        this.applyLyrics(state);
        this.emit();
      }
    });
    video.addEventListener('play', () => { if (state.video === video) { state.playing = true; this.applyVisualState(state); this.emit(); } });
    video.addEventListener('pause', () => { if (state.video === video && !video.ended) { state.playing = false; this.applyVisualState(state); this.emit(); } });
    video.addEventListener('ended', () => {
      if (state.video !== video) return;
      state.playing = false;
      state.position = Number.isFinite(video.duration) ? video.duration : state.position;
      this.applyVisualState(state);
      this.emit();
    });
    video.addEventListener('error', () => {
      if (state.video !== video) return;
      state.loaded = false;
      state.playing = false;
      this.emit();
    });
    const screen = container.querySelector('.vj-screen') || container;
    screen.querySelector('.vj-video')?.remove();
    screen.querySelector('.vj-lyrics')?.remove();
    const lyrics = document.createElement('div');
    lyrics.className = 'vj-lyrics';
    lyrics.setAttribute('aria-live', 'polite');
    screen.append(lyrics);
    state.lyricsElement = lyrics;
    screen.prepend(video);
    state.video = video;
    this.applyVisualState(state);
    return video;
  }

  applyVisualState(state) {
    if (!state.video) return;
    state.video.style.opacity = String(state.visible ? state.opacity : 0);
    state.video.style.setProperty('--vj-opacity', String(state.visible ? state.opacity : 0));
    state.video.style.display = state.visible ? '' : 'none';
    state.video.playbackRate = state.rate;
    const effect = state.effect || defaultEffect();
    const amount = clamp(Number(effect.amount) || 0, 0, 1);
    const filters = {
      none: '',
      blur: `blur(${(amount * 12).toFixed(2)}px)`,
      brightness: `brightness(${(0.35 + amount * 1.65).toFixed(3)})`,
      contrast: `contrast(${(0.4 + amount * 1.8).toFixed(3)})`,
      saturate: `saturate(${(amount * 2.4).toFixed(3)})`,
      grayscale: `grayscale(${amount.toFixed(3)})`,
      sepia: `sepia(${amount.toFixed(3)})`,
      invert: `invert(${amount.toFixed(3)})`,
      hue: `hue-rotate(${Math.round(amount * 360)}deg)`,
    };
    state.video.style.filter = effect.enabled === false ? '' : (filters[effect.name] || '');
    const animation = state.animation || defaultAnimation();
    state.video.style.setProperty('--vj-animation-amount', String(clamp(Number(animation.amount) || 0, 0, 1)));
    state.video.style.animationName = animation.enabled === false ? '' : `vj-${animation.name}`;
    state.video.style.animationDuration = animation.enabled === false ? '' : `${(1 / clamp(Number(animation.speed) || 1, 0.1, 8)).toFixed(3)}s`;
    state.video.style.animationTimingFunction = animation.name === 'strobe' ? 'steps(2, jump-none)' : 'ease-in-out';
    state.video.style.animationIterationCount = animation.enabled === false ? '' : 'infinite';
    state.video.style.animationPlayState = state.playing ? 'running' : 'paused';
    this.applyLyrics(state);
  }

  applyLyrics(state) {
    const element = state.lyricsElement;
    if (!element) return;
    const settings = state.lyrics || {};
    element.textContent = lyricAt(settings.cues, state.position);
    element.style.display = state.visible && settings.visible && element.textContent ? '' : 'none';
    element.style.opacity = String(clamp(Number(settings.opacity) || 0, 0, 1));
    element.style.fontSize = `${clamp(Number(settings.fontSize) || 28, 12, 96)}px`;
    element.dataset.position = settings.position || 'bottom';
    element.classList.toggle('no-shadow', settings.shadow === false);
  }

  emit() {
    try { this.onChange(this.snapshot()); } catch { /* UI callbacks must not break transport. */ }
  }

  async setVideo(fileOrUrl, loaded = true, index = 0) {
    const state = this.channel(index);
    const generation = ++state.generation;
    state.playGeneration++;
    if (state.url && state.url.startsWith('blob:')) URL.revokeObjectURL(state.url);
    state.file = isFile(fileOrUrl) ? fileOrUrl : null;
    state.name = isFile(fileOrUrl) ? (fileOrUrl.name || '') : (typeof fileOrUrl === 'string' ? fileOrUrl.split('/').pop() : '');
    state.url = isFile(fileOrUrl) ? URL.createObjectURL(fileOrUrl) : (typeof fileOrUrl === 'string' ? fileOrUrl : '');
    state.loaded = !!loaded && !!state.url;
    state.playing = false;
    state.position = 0;
    state.duration = 0;
    if (!state.video) {
      this.emit();
      return state;
    }
    const video = state.video;
    video.pause();
    video.removeAttribute('src');
    video.load();
    if (!state.url) {
      video.load();
      this.emit();
      return state;
    }
    await new Promise(resolve => {
      let timeout;
      const done = () => { cleanup(); resolve(); };
      const cleanup = () => {
        clearTimeout(timeout);
        video.removeEventListener('loadedmetadata', done);
        video.removeEventListener('error', done);
      };
      video.addEventListener('loadedmetadata', done, { once: true });
      video.addEventListener('error', done, { once: true });
      timeout = setTimeout(done, 5000);
      video.src = state.url;
      video.load();
    });
    if (generation !== state.generation) return state;
    if (video.readyState >= 1 && Number.isFinite(video.duration)) {
      state.duration = video.duration;
      state.loaded = true;
    }
    this.applyVisualState(state);
    this.emit();
    return state;
  }

  async loadFile(index, file) {
    if (!isFile(file) || !file.type.startsWith('video/') && !/\.(mp4|webm|mov|m4v|ogv|avi)$/i.test(file.name || '')) throw new Error('请选择视频文件');
    return this.setVideo(file, true, index);
  }

  async play(index = 0) {
    const state = this.channel(index);
    if (!state.video || !state.url) return false;
    const video = state.video;
    const generation = ++state.playGeneration;
    state.video.muted = true;
    state.video.defaultMuted = true;
    state.video.playbackRate = state.rate;
    state.playing = true;
    this.applyVisualState(state);
    this.emit();
    try { await video.play(); }
    catch (error) {
      if (generation === state.playGeneration) { state.playing = false; this.emit(); }
      throw error;
    }
    if (generation !== state.playGeneration || video !== state.video) {
      if (video === state.video && !state.playing) video.pause();
      return false;
    }
    state.playing = true;
    this.emit();
    return true;
  }

  pause(position = null, index = 0) {
    const state = this.channel(index);
    if (!state.video) return false;
    state.playGeneration++;
    state.video.pause();
    state.playing = false;
    this.applyVisualState(state);
    if (position !== null && position !== undefined && Number.isFinite(Number(position))) this.setPosition(position, index);
    else state.position = Number.isFinite(state.video.currentTime) ? state.video.currentTime : state.position;
    this.emit();
    return true;
  }

  stop(index = 0) {
    const state = this.channel(index);
    if (!state.video) return false;
    this.pause(null, index);
    this.setPosition(0, index);
    state.playing = false;
    this.emit();
    return true;
  }

  setPosition(seconds, index = 0) {
    const state = this.channel(index);
    const value = Number(seconds);
    if (!Number.isFinite(value)) return state.position;
    state.position = clamp(value, 0, state.duration || Infinity);
    if (state.video && Number.isFinite(state.position)) {
      try { state.video.currentTime = state.position; } catch { /* Metadata may not be ready yet. */ }
    }
    this.applyLyrics(state);
    this.emit();
    return state.position;
  }

  setPositionMs(milliseconds, index = 0) {
    const value = Number(milliseconds);
    return this.setPosition(Number.isFinite(value) ? value / 1000 : NaN, index);
  }

  setRate(rate, index = 0) {
    const state = this.channel(index);
    const value = clamp(Number(rate) || 1, 0.1, 4);
    if (Math.abs(value - state.rate) < 0.0001) return state.rate;
    state.rate = value;
    if (state.video) state.video.playbackRate = value;
    this.emit();
    return value;
  }

  setOpacity(opacity, index = 0) {
    const state = this.channel(index);
    const value = Number(opacity);
    if (!Number.isFinite(value)) return state.opacity;
    state.opacity = clamp(value, 0, 1);
    this.applyVisualState(state);
    this.emit();
    return state.opacity;
  }

  setVisible(visible, index = 0) {
    const state = this.channel(index);
    state.visible = !!visible;
    this.applyVisualState(state);
    this.emit();
    return state.visible;
  }

  setEffect(patch = {}, index = 0) {
    const state = this.channel(index);
    const next = { ...state.effect, ...patch };
    next.name = Object.hasOwn(VJ_EFFECTS, next.name) ? next.name : 'none';
    next.amount = clamp(Number(next.amount) || 0, 0, 1);
    next.enabled = next.name !== 'none' && next.enabled !== false;
    state.effect = next;
    this.applyVisualState(state);
    this.emit();
    return state.effect;
  }

  setAnimation(patch = {}, index = 0) {
    const state = this.channel(index);
    const next = { ...state.animation, ...patch };
    next.name = Object.hasOwn(VJ_ANIMATIONS, next.name) ? next.name : 'none';
    next.speed = clamp(Number(next.speed) || 1, 0.1, 8);
    next.amount = clamp(Number(next.amount) || 0, 0, 1);
    next.enabled = next.name !== 'none' && next.enabled !== false;
    state.animation = next;
    this.applyVisualState(state);
    this.emit();
    return state.animation;
  }

  resetVisuals(index = 0) {
    const state = this.channel(index);
    state.effect = defaultEffect();
    state.animation = defaultAnimation();
    this.applyVisualState(state);
    this.emit();
    return state;
  }

  clear(index = 0) {
    const state = this.channel(index);
    state.generation++;
    state.playGeneration++;
    state.video?.pause();
    if (state.url && state.url.startsWith('blob:')) URL.revokeObjectURL(state.url);
    if (state.video) {
      state.video.removeAttribute('src');
      state.video.load();
    }
    Object.assign(state, { file: null, name: '', url: '', loaded: false, playing: false, position: 0, duration: 0, effect: defaultEffect(), animation: defaultAnimation(), lyrics: { file: null, name: '', cues: [], visible: true, opacity: 1, fontSize: 28, position: 'bottom', shadow: true } });
    this.applyVisualState(state);
    this.emit();
    return state;
  }

  setSyncToDeck(enabled, index = 0, deck = null) {
    const state = this.channel(index);
    state.syncToDeck = !!enabled;
    if (state.syncToDeck && deck) this.syncDeck(deck, index);
    this.emit();
    return state.syncToDeck;
  }

  async loadLyrics(index, file) {
    if (!isFile(file) || !/\.(lrc|srt|txt|vtt)$/i.test(file.name || '')) throw new Error('请选择 LRC、SRT 或文本歌词');
    const cues = parseLyrics(await file.text());
    if (!cues.length) throw new Error('歌词文件没有可识别的时间轴');
    const state = this.channel(index);
    state.lyrics = { ...state.lyrics, file, name: file.name, cues };
    this.applyLyrics(state); this.emit(); return state.lyrics;
  }

  clearLyrics(index = 0) {
    const state = this.channel(index);
    state.lyrics = { ...state.lyrics, file: null, name: '', cues: [] };
    this.applyLyrics(state); this.emit();
  }

  setLyrics(patch, index = 0) {
    const state = this.channel(index);
    state.lyrics = { ...state.lyrics, ...patch };
    this.applyLyrics(state); this.emit(); return state.lyrics;
  }

  /** Keep the video transport aligned with a DJ deck's audio clock. */
  syncDeck(deck, index = deck?.id) {
    if (!deck || index == null || index < 0 || index >= CHANNELS) return;
    const state = this.channel(index);
    if (!state.video || !state.url) return;
    if (!state.syncToDeck) return;
    const rate = deck.effectiveRate || deck.rate || 1;
    if (Math.abs(rate - state.rate) >= 0.0001) this.setRate(rate, index);
    const position = Number(deck.position);
    if (Number.isFinite(position) && Math.abs((state.video.currentTime || 0) - position) > 0.12) this.setPosition(position, index);
    if (deck.playing && !state.playing) this.play(index).catch(() => {});
    if (!deck.playing && state.playing) this.pause(null, index);
  }

  snapshot() {
    return {
      channels: this.channels.map(state => ({
        name: state.name,
        file: state.file,
        url: state.url,
        loaded: state.loaded,
        visible: state.visible,
        opacity: state.opacity,
        rate: state.rate,
        position: state.position,
        duration: state.duration,
        playing: state.playing,
        syncToDeck: state.syncToDeck,
        effect: { ...state.effect },
        animation: { ...state.animation },
        lyrics: { ...state.lyrics, current: lyricAt(state.lyrics?.cues, state.position) },
      })),
    };
  }

  async save() {
    if (!this.setting) return;
    const value = { channels: this.channels.map(state => ({ file: state.file, name: state.name, visible: state.visible, opacity: state.opacity, rate: state.rate, position: state.position, syncToDeck: state.syncToDeck, effect: state.effect, animation: state.animation, lyrics: state.lyrics })) };
    await this.setting('vj:session', value);
  }

  async restore() {
    if (!this.setting) return;
    const saved = await this.setting('vj:session');
    if (!saved || !Array.isArray(saved.channels)) return;
    for (let index = 0; index < Math.min(CHANNELS, saved.channels.length); index++) {
      const item = saved.channels[index];
      if (!item || typeof item !== 'object') continue;
      const state = this.channel(index);
      state.visible = item.visible !== false;
      state.opacity = clamp(Number(item.opacity) || 0, 0, 1);
      state.rate = clamp(Number(item.rate) || 1, 0.1, 4);
      state.position = Math.max(0, Number(item.position) || 0);
      state.syncToDeck = item.syncToDeck !== false;
      if (item.effect && typeof item.effect === 'object') state.effect = { ...state.effect, ...item.effect };
      if (item.animation && typeof item.animation === 'object') state.animation = { ...state.animation, ...item.animation };
      if (item.lyrics && typeof item.lyrics === 'object') state.lyrics = { ...state.lyrics, ...item.lyrics, cues: Array.isArray(item.lyrics.cues) ? item.lyrics.cues : [] };
      if (isFile(item.file)) {
        await this.setVideo(item.file, true, index);
        this.setPosition(item.position, index);
      }
      this.applyVisualState(state);
    }
    this.emit();
  }

  dispose() {
    for (const state of this.channels) {
      state.video?.pause();
      if (state.url && state.url.startsWith('blob:')) URL.revokeObjectURL(state.url);
    }
  }
}

export { CHANNELS as VJ_CHANNELS };
