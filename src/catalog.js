import { setting, updateSetting } from './storage.js';
const KEY = 'catalog-v1';
const text = (value, max = 200) => typeof value === 'string' ? value.slice(0, max).trim() : '';
const blank = () => ({ version: 1, playlists: [], details: {}, favorites: [], history: [] });
const own = (object, key) => Object.hasOwn(object, key) ? object[key] : undefined;
export function cleanMetadata(input) {
  const result = {};
  for (const key of ['title','artist','album','genre','key','comment']) if (Object.hasOwn(input, key)) result[key] = text(input[key], key === 'comment' ? 2000 : 200);
  if (Object.hasOwn(input, 'title') && !result.title) throw new Error('曲目名称不能为空');
  for (const [key, min, max] of [['bpm',30,300],['year',1,9999],['rating',0,5]]) {
    if (!Object.hasOwn(input, key)) continue;
    const value = input[key] === '' || input[key] === null ? null : Number(input[key]);
    if (value !== null && (!Number.isFinite(value) || value < min || value > max)) throw new Error(`${key} 超出有效范围`);
    result[key] = value;
  }
  if (result.rating !== undefined && result.rating !== null) result.rating = Math.round(result.rating);
  if (result.year !== undefined && result.year !== null) result.year = Math.round(result.year);
  if (Object.hasOwn(result, 'bpm')) result.estimated = false;
  return result;
}
export function cleanRules(input = {}) {
  const rule = { text: text(input.text), genre: text(input.genre), key: text(input.key), favorite: !!input.favorite, minRating: Math.min(5, Math.max(0, Number(input.minRating) || 0)) };
  for (const key of ['minBpm','maxBpm']) {
    rule[key] = input[key] === '' || input[key] == null ? null : Number(input[key]);
    if (rule[key] !== null && (!Number.isFinite(rule[key]) || rule[key] < 30 || rule[key] > 300)) throw new Error('BPM 筛选范围应为 30–300');
  }
  if (rule.minBpm !== null && rule.maxBpm !== null && rule.minBpm > rule.maxBpm) throw new Error('最低 BPM 不能高于最高 BPM');
  return rule;
}
export function matches(track, rule = {}, favorite = false) {
  const needle = (rule.text || '').toLocaleLowerCase();
  const haystack = [track.title,track.artist,track.album,track.genre,track.key,track.comment,track.file?.name].join(' ').toLocaleLowerCase();
  return (!needle || haystack.includes(needle)) && (!rule.genre || (track.genre || '').toLocaleLowerCase().includes(rule.genre.toLocaleLowerCase()))
    && (!rule.key || (track.key || '').toLocaleLowerCase() === rule.key.toLocaleLowerCase())
    && (!rule.favorite || favorite) && (track.rating || 0) >= (rule.minRating || 0)
    && (rule.minBpm == null || (Number.isFinite(track.bpm) && track.bpm >= rule.minBpm))
    && (rule.maxBpm == null || (Number.isFinite(track.bpm) && track.bpm <= rule.maxBpm));
}
export class Catalog {
  constructor(tracks, onchange = () => {}) {
    this.tracks = tracks; this.data = blank(); this.onchange = onchange; this.queue = Promise.resolve();
    this.channel = typeof BroadcastChannel === 'function' ? new BroadcastChannel('mixdesk-catalog') : null;
    this.channel?.addEventListener('message', () => this.load().catch(() => {}));
  }
  load() {
    const run = this.queue.catch(() => {}).then(async () => { this.data = await setting(KEY) || blank(); this.apply(); return this; });
    this.queue = run; return run;
  }
  apply() {
    this.playStats = new Map();
    for (const item of this.data.history) {
      const stats = this.playStats.get(item.trackId) || { count: 0, last: 0 };
      stats.count++; stats.last = Math.max(stats.last, item.timestamp); this.playStats.set(item.trackId, stats);
    }
    for (const track of this.tracks) Object.assign(track, own(this.data.details, track.id) || {});
    this.onchange();
  }
  mutate(operation) {
    const run = this.queue.catch(() => {}).then(async () => {
      this.data = await updateSetting(KEY, previous => { const next = previous || blank(); operation(next); return next; });
      this.apply(); this.channel?.postMessage('changed'); return this.data;
    });
    this.queue = run; return run;
  }
  playlist(id) { return this.data.playlists.find(p => p.id === id); }
  favorite(id) { return this.data.favorites.includes(id); }
  async create(name, rules = null, ids = []) {
    name = text(name, 100); if (!name) throw new Error('请输入列表名称');
    const known = new Set(this.tracks.map(t => t.id));
    const playlist = { id: crypto.randomUUID(), name, trackIds: rules ? [] : [...new Set(ids.filter(id => known.has(id)))], rules: rules ? cleanRules(rules) : null };
    await this.mutate(data => data.playlists.push(playlist)); return playlist.id;
  }
  edit(id, name, rules = null) {
    name = text(name, 100); if (!name) return Promise.reject(new Error('请输入列表名称'));
    const clean = rules ? cleanRules(rules) : null;
    return this.mutate(data => { const p = data.playlists.find(p => p.id === id); if (!p) throw new Error('列表已不存在'); p.name = name; p.rules = clean; });
  }
  delete(id) { return this.mutate(data => { data.playlists = data.playlists.filter(p => p.id !== id); }); }
  add(id, ids) {
    const valid = ids.filter(id => this.tracks.some(t => t.id === id));
    return this.mutate(data => { const p = data.playlists.find(p => p.id === id); if (!p || p.rules) throw new Error('请选择普通播放列表'); p.trackIds = [...new Set([...p.trackIds, ...valid])]; });
  }
  remove(id, ids) { return this.mutate(data => { const p = data.playlists.find(p => p.id === id); if (!p || p.rules) throw new Error('请选择普通播放列表'); p.trackIds = p.trackIds.filter(id => !ids.includes(id)); }); }
  move(id, trackId, direction) {
    return this.mutate(data => { const p = data.playlists.find(p => p.id === id); if (!p || p.rules) return;
      const from = p.trackIds.indexOf(trackId), to = from + direction;
      if (from < 0 || to < 0 || to >= p.trackIds.length) return;
      [p.trackIds[from], p.trackIds[to]] = [p.trackIds[to], p.trackIds[from]];
    });
  }
  toggleFavorite(id) { return this.mutate(data => { data.favorites = data.favorites.includes(id) ? data.favorites.filter(key => key !== id) : [...data.favorites, id]; }); }
  metadata(id, patch) {
    const clean = cleanMetadata(patch);
    return this.mutate(data => { Object.defineProperty(data.details, id, { value: { ...(own(data.details,id) || {}), ...clean }, enumerable: true, configurable: true, writable: true }); });
  }
  recordPlay(id, deck, timestamp = Date.now()) {
    return this.mutate(data => { data.history.push({ id: crypto.randomUUID(), trackId: id, deck, timestamp }); if (data.history.length > 10000) data.history.splice(0, data.history.length - 10000); });
  }
  count(id) { return this.playStats?.get(id)?.count || 0; }
  lastPlayed(id) { return this.playStats?.get(id)?.last || 0; }
  view(view = 'all') {
    if (view === 'favorites') return this.tracks.filter(t => this.favorite(t.id));
    if (view === 'history') return [...this.tracks].filter(t => this.count(t.id)).sort((a,b) => this.lastPlayed(b.id) - this.lastPlayed(a.id));
    const playlist = this.playlist(view);
    if (!playlist) return [...this.tracks];
    if (playlist.rules) return this.tracks.filter(t => matches(t, playlist.rules, this.favorite(t.id)));
    const byId = new Map(this.tracks.map(t => [t.id,t])); return playlist.trackIds.map(id => byId.get(id)).filter(Boolean);
  }
  async forget(id) {
    await this.mutate(data => {
      data.favorites = data.favorites.filter(key => key !== id);
      data.playlists.forEach(p => p.trackIds = p.trackIds.filter(key => key !== id));
      // Keep metadata/history for re-import; removing a file is not erasing its annotations.
    });
  }
}
