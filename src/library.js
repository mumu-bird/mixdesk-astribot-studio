import { Catalog, cleanRules, matches } from './catalog.js';
import { setting } from './storage.js';
import { writeTagsCopy } from './tag-writer.js';
import './library.css';
const $ = selector => document.querySelector(selector);
const esc = value => String(value ?? '').replace(/[&<>"']/g, x => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' })[x]);
const xmlEsc = value => String(value ?? '').replace(/[&<>"']/g, x => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&apos;' })[x]);
const xmlNumber = (value, digits = 6) => Number.isFinite(Number(value)) ? Number(value).toFixed(digits) : '';
const rekordboxLocation = fileName => `file://localhost/${encodeURIComponent(fileName || '').replace(/%2F/gi, '/')}`;
const colorRgb = value => {
  const match = /^#?([\da-f]{6})$/i.exec(String(value || ''));
  if (!match) return { red: 255, green: 140, blue: 0 };
  const color = Number.parseInt(match[1], 16);
  return { red: color >> 16, green: color >> 8 & 255, blue: color & 255 };
};
const collator = new Intl.Collator('zh-Hans', { numeric: true, sensitivity: 'base' });
const metadataFields = [['title','曲目名称'],['artist','艺术家'],['album','专辑'],['genre','风格'],['key','调性'],['year','年份'],['bpm','BPM'],['rating','评分（0–5）'],['comment','注释']];
const bytesAt = (data, offset, needle) => needle.every((value, index) => data[offset + index] === value);
const textTag = tag => [...tag].map(char => char.charCodeAt(0));
const SERATO_HEADER = [0, 83, 0, 101, 0, 114, 0, 97, 0, 116, 0, 111];
const SERATO_TRACK_TAG = textTag('otrk');
const SERATO_PATH_TAG = textTag('ptrk');
const readUint32 = (data, offset) => ((data[offset] * 0x1000000) + (data[offset + 1] << 16) + (data[offset + 2] << 8) + data[offset + 3]) >>> 0;
const isTag = (data, offset, tag) => offset + 4 <= data.length && bytesAt(data, offset, tag);

const decodeUtf16Be = bytes => {
  if (!bytes.length || bytes.length % 2) throw new Error('Serato Crate 的曲目路径编码不完整');
  const swapped = new Uint8Array(bytes.length);
  for (let index = 0; index < bytes.length; index += 2) {
    swapped[index] = bytes[index + 1];
    swapped[index + 1] = bytes[index];
  }
  return new TextDecoder('utf-16le', { fatal: true }).decode(swapped).replace(/\0+$/g, '').trim();
};

// Serato .crate files are bounded records: a four-byte tag, a big-endian
// uint32 payload length, then the payload. Track paths are UTF-16BE `ptrk`
// records nested in `otrk` records. We parse those boundaries instead of
// scanning arbitrary bytes, so malformed data cannot merge two songs.
export function parseSeratoCrate(input) {
  const data = input instanceof Uint8Array ? input : new Uint8Array(input || []);
  if (data.length < 8 || !bytesAt(data, 0, textTag('vrsn'))) throw new Error('不是有效的 Serato Crate');
  const songs = [];
  let hasHeader = false;
  const parseRecords = (start, end, depth = 0) => {
    if (depth > 8) throw new Error('Serato Crate 记录嵌套过深');
    let offset = start;
    while (offset < end) {
      if (end - offset < 8) throw new Error('Serato Crate 记录头被截断');
      const length = readUint32(data, offset + 4);
      const payloadStart = offset + 8, payloadEnd = payloadStart + length;
      if (payloadEnd > end) throw new Error('Serato Crate 记录长度超出文件范围');
      const tag = data.slice(offset, offset + 4);
      if (bytesAt(tag, 0, textTag('vrsn')) && findHeader(payloadStart, payloadEnd)) hasHeader = true;
      if (bytesAt(tag, 0, SERATO_PATH_TAG)) {
        const path = decodeUtf16Be(data.slice(payloadStart, payloadEnd));
        if (path) songs.push(path);
      } else if (bytesAt(tag, 0, SERATO_TRACK_TAG)) {
        parseRecords(payloadStart, payloadEnd, depth + 1);
      } else if (payloadEnd - payloadStart >= 8 && isTag(data, payloadStart, SERATO_TRACK_TAG)) {
        // Some Serato versions wrap track fields in an additional record.
        parseRecords(payloadStart, payloadEnd, depth + 1);
      }
      offset = payloadEnd;
    }
  };
  const findHeader = (start, end) => {
    for (let offset = start; offset <= end - SERATO_HEADER.length; offset++) if (bytesAt(data, offset, SERATO_HEADER)) return true;
    return false;
  };
  parseRecords(0, data.length);
  if (!hasHeader) throw new Error('不是有效的 Serato Crate');
  return songs;
}
const download = (data, name, type) => {
  const url = URL.createObjectURL(new Blob([data], { type })); const a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 60000);
};
export function setupLibrary({ tracks, engine, toast, icon, time, load, remove, metadataChanged, reread, relink }) {
  let view = 'all', query = '', selectedId = null, visible = [], editingPlaylist = null, editingTrack = null, busy = false, lastStatus = '';
  const selected = new Set(), covers = new Map();
  const catalog = new Catalog(tracks, () => { metadataChanged(); render(); });
  $('.library-table-wrap').insertAdjacentHTML('beforebegin', `<div class="library-collections"><div class="collection-tabs" aria-label="曲库分类"></div><div class="collection-actions"><button id="playlist-new">＋ 播放列表</button><button id="smart-new">＋ 智能列表</button><button id="playlist-edit" hidden>编辑列表</button><button id="playlist-delete" hidden>删除列表</button></div></div><div class="library-filters"><label>风格<input id="filter-genre" aria-label="筛选风格" placeholder="全部风格"/></label><label>调性<input id="filter-key" aria-label="筛选调性" placeholder="全部调性"/></label><label>BPM 从<input id="filter-min-bpm" type="number" min="30" max="300" aria-label="最低 BPM"/></label><label>至<input id="filter-max-bpm" type="number" min="30" max="300" aria-label="最高 BPM"/></label><label>最低评分<select id="filter-rating" aria-label="最低评分">${[0,1,2,3,4,5].map(n => `<option value="${n}">${n ? `${n} ★` : '不限'}</option>`).join('')}</select></label><label>排序<select id="library-sort" aria-label="库排序"><option value="original">列表顺序</option><option value="title">曲目</option><option value="artist">艺术家</option><option value="bpm">BPM</option><option value="duration">时长</option><option value="rating">评分</option><option value="addedAt">加入时间</option><option value="playCount">播放次数</option></select></label><button id="sort-direction" aria-label="切换排序方向" aria-pressed="false">↑ 升序</button><button id="filters-reset">清除筛选</button></div><div class="library-bulk"><label><input id="library-select-all" type="checkbox" aria-label="选择当前结果"/> <span id="library-selection-count">已选 0 首</span></label><select id="playlist-target" aria-label="添加到播放列表"></select><button id="playlist-add">加入列表</button><button id="playlist-remove" hidden>移出列表</button><button id="playlist-export">导出列表</button><button id="playlist-export-rb">导出 Rekordbox XML</button><button id="playlist-import">导入列表</button><input id="playlist-file" type="file" accept=".json,.m3u,.m3u8,.xml,.crate" hidden/><span id="library-result-count"></span></div><p id="library-status" role="status"></p>`);
  $('.library-table-wrap thead').innerHTML = '<tr><th class="number-col">选择</th><th>曲目 / 艺术家 / 专辑</th><th>风格</th><th>BPM / 调性</th><th>时长 / 评分</th><th class="load-col">载入播放器</th><th>管理</th></tr>';
  document.body.insertAdjacentHTML('beforeend', `<dialog id="playlist-dialog"><form><div class="dialog-heading"><h2 id="playlist-dialog-title">播放列表</h2><button type="button" class="icon-button" id="playlist-close" aria-label="关闭列表编辑">×</button></div><label>列表名称<input id="playlist-name" required maxlength="100" aria-label="列表名称"/></label><fieldset id="smart-rules" hidden><legend>同时满足以下条件</legend><label>包含文本<input id="rule-text" aria-label="规则包含文本" maxlength="200"/></label><label>风格包含<input id="rule-genre" aria-label="规则风格" maxlength="200"/></label><label>调性等于<input id="rule-key" aria-label="规则调性" maxlength="200"/></label><div class="rule-range"><label>最低 BPM<input id="rule-min" type="number" min="30" max="300" aria-label="规则最低 BPM"/></label><label>最高 BPM<input id="rule-max" type="number" min="30" max="300" aria-label="规则最高 BPM"/></label></div><label>最低评分<select id="rule-rating" aria-label="规则最低评分">${[0,1,2,3,4,5].map(n => `<option value="${n}">${n}</option>`).join('')}</select></label><label class="inline-check"><input id="rule-favorite" type="checkbox"/>仅收藏曲目</label></fieldset><p id="playlist-form-error" role="alert"></p><div class="dialog-actions"><button type="button" id="playlist-cancel">取消</button><button class="primary-button" id="playlist-save">保存列表</button></div></form></dialog><dialog id="metadata-dialog"><form><div class="dialog-heading"><div><span class="eyebrow">TRACK DETAILS</span><h2>曲目信息</h2></div><button type="button" id="metadata-close" class="icon-button" aria-label="关闭曲目信息">×</button></div><div class="metadata-fields">${metadataFields.map(([key,label]) => `<label class="metadata-${key}">${label}${key === 'comment' ? '<textarea id="meta-comment" aria-label="注释" maxlength="2000"></textarea>' : `<input id="meta-${key}" aria-label="${label}" ${['year','bpm','rating'].includes(key) ? `type="number" min="${key === 'rating' ? 0 : key === 'bpm' ? 30 : 1}" max="${key === 'rating' ? 5 : key === 'bpm' ? 300 : 9999}" step="${key === 'bpm' ? '0.1' : 1}"` : 'maxlength="200"'} ${key === 'title' ? 'required' : ''}/>`}</label>`).join('')}</div><p id="metadata-file-info"></p><p>更改保存在工作台曲库。WAV / MP3 可将当前信息导出为带标签副本；原始文件保留。</p><p id="metadata-form-error" role="alert"></p><div class="dialog-actions"><button type="button" id="metadata-reread">重读文件标签</button><button type="button" id="metadata-relink">重新关联文件</button><button type="button" id="metadata-export">导出带标签副本</button><button class="primary-button" id="metadata-save">保存曲目信息</button></div></form></dialog><input id="metadata-relink-file" type="file" accept="audio/*,.flac,.wav,.mp3,.m4a,.aiff,.aif,.ogg,.opus,.webm" hidden/>`);
  const fields = () => ({ text: query, genre: $('#filter-genre').value, key: $('#filter-key').value, minBpm: $('#filter-min-bpm').value, maxBpm: $('#filter-max-bpm').value, minRating: $('#filter-rating').value });
  const status = message => { lastStatus = message; $('#library-status').textContent = message; };
  const run = async fn => {
    if (busy) return;
    busy = true; $('#library').setAttribute('aria-busy','true'); status('正在保存…');
    try { await fn(); status('已保存到本机'); }
    catch (error) { status(error.message || '保存失败，请重试'); toast(error.message || '曲库保存失败'); }
    finally { busy = false; $('#library').setAttribute('aria-busy','false'); render(); }
  };
  function cover(track) {
    if (!(track.artwork instanceof Blob)) return icon('music');
    if (!covers.has(track.id)) covers.set(track.id, { blob: track.artwork, url: URL.createObjectURL(track.artwork) });
    else if (covers.get(track.id).blob !== track.artwork) { URL.revokeObjectURL(covers.get(track.id).url); covers.set(track.id, { blob: track.artwork, url: URL.createObjectURL(track.artwork) }); }
    // The library table is a local, bounded view. Avoid lazy-loading cover art
    // here: browser implementations may defer an offscreen row indefinitely,
    // leaving a valid embedded cover with naturalWidth === 0 until scrolling.
    return `<img src="${covers.get(track.id).url}" alt="${esc(track.title)} 封面" decoding="async"/>`;
  }
  function render() {
    for (const id of selected) if (!tracks.some(t => t.id === id)) selected.delete(id);
    const playlist = catalog.playlist(view); if (!playlist && !['all','favorites','history'].includes(view)) view = 'all';
    const targets = $('#playlist-target').value;
    const collections = [{id:'all',name:'所有歌曲'},{id:'favorites',name:'收藏'},{id:'history',name:'播放历史'}, ...catalog.data.playlists];
    $('.collection-tabs').innerHTML = collections.map(p => `<button data-collection="${esc(p.id)}" class="${view === p.id ? 'active' : ''}" aria-pressed="${view === p.id}">${p.rules ? '◇ ' : ''}${esc(p.name)} <span>${catalog.view(p.id).length}</span></button>`).join('');
    $('#playlist-target').innerHTML = '<option value="">选择普通列表</option>' + catalog.data.playlists.filter(p => !p.rules).map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join('');
    $('#playlist-target').value = targets;
    $('#playlist-edit').hidden = $('#playlist-delete').hidden = !playlist;
    $('#playlist-remove').hidden = !playlist || !!playlist.rules;
    $('#library-status').title = view === 'history' ? '每次载入曲目，累计检测到主输出信号 15 秒后记一次；暂停续播和 Cue 预听不重复计次。' : '';
    let rule;
    try { rule = cleanRules(fields()); }
    catch (error) { status(error.message); visible = []; renderRows(); return; }
    if (lastStatus.startsWith('BPM') || lastStatus.startsWith('最低 BPM')) status('');
    visible = catalog.view(view).filter(t => matches(t, rule, catalog.favorite(t.id)));
    const sort = $('#library-sort').value, reverse = $('#sort-direction').getAttribute('aria-pressed') === 'true';
    if (sort !== 'original') visible.sort((a,b) => {
      const av = sort === 'playCount' ? catalog.count(a.id) : a[sort], bv = sort === 'playCount' ? catalog.count(b.id) : b[sort];
      if (av == null || av === '') return bv == null || bv === '' ? 0 : 1;
      if (bv == null || bv === '') return -1;
      const compare = typeof av === 'number' && typeof bv === 'number' ? av - bv : collator.compare(String(av),String(bv));
      return (reverse ? -1 : 1) * compare;
    });
    else if (reverse) visible.reverse();
    renderRows();
  }
  function renderRows() {
    if (!visible.some(track => track.id === selectedId)) selectedId = null;
    $('#track-count').textContent = `${tracks.length} 首`;
    $('#library-result-count').textContent = `显示 ${visible.length} 首`;
    $('#library-selection-count').textContent = `已选 ${selected.size} 首`;
    $('#library-select-all').checked = !!visible.length && visible.every(t => selected.has(t.id));
    $('#library-select-all').indeterminate = visible.some(t => selected.has(t.id)) && !$('#library-select-all').checked;
    const p = catalog.playlist(view), ordered = p && !p.rules && visible.length === catalog.view(view).length && $('#library-sort').value === 'original' && $('#sort-direction').getAttribute('aria-pressed') !== 'true';
    $('#track-list').innerHTML = visible.length ? visible.map((track, i) => `<tr data-track="${esc(track.id)}" draggable="true" class="${selectedId === track.id ? 'track-selected' : ''}"><td class="number-col"><input type="checkbox" data-select-track="${esc(track.id)}" aria-label="选择 ${esc(track.title)}" ${selected.has(track.id) ? 'checked' : ''}/><span>${i+1}</span></td><td><div class="track-cell"><div class="track-art art-${track.demo === 1 ? 'b' : track.demo === 0 ? 'a' : 'file'}">${cover(track)}</div><div><strong>${esc(track.title)}</strong><span>${esc(track.artist || '未知艺术家')}</span>${track.album ? `<small>${esc(track.album)}</small>` : ''}</div>${track.demo !== undefined ? '<span class="demo-tag">DEMO</span>' : ''}</div>${view === 'history' ? `<small class="history-detail">${esc(new Date(catalog.lastPlayed(track.id)).toLocaleString())} · ${catalog.count(track.id)} 次</small>` : ''}</td><td><span class="genre">${esc(track.genre || '—')}</span></td><td class="mono">${track.bpm ? `${track.estimated ? '≈ ' : ''}${track.bpm.toFixed(1)}` : '—'}<small class="track-key" title="${track.keyEstimated ? '本地估算调性' : ''}">${track.key ? `${track.keyEstimated ? '≈ ' : ''}${esc(track.key)}` : '—'}</small></td><td class="mono">${time(track.duration)}<small class="track-rating">${track.rating ? '★'.repeat(track.rating) : '—'}</small></td><td><div class="load-buttons">${[0,1,2,3].map(id => `<button data-load="${id}" class="load-${'abcd'[id]} ${engine.decks[id].track?.id === track.id ? 'loaded' : ''}" aria-label="将 ${esc(track.title)} 载入 ${'ABCD'[id]} 台">${'ABCD'[id]}</button>`).join('')}</div></td><td><div class="track-actions"><button data-favorite aria-pressed="${catalog.favorite(track.id)}" aria-label="收藏 ${esc(track.title)}">${catalog.favorite(track.id) ? '★' : '☆'}</button><button data-metadata aria-label="编辑 ${esc(track.title)}">信息</button>${ordered ? `<button data-move="-1" aria-label="上移 ${esc(track.title)}">↑</button><button data-move="1" aria-label="下移 ${esc(track.title)}">↓</button>` : ''}${track.demo === undefined ? `<button class="delete-track" aria-label="移除 ${esc(track.title)}">移除</button>` : ''}</div></td></tr>`).join('') : '<tr><td colspan="7" class="empty-state">没有找到曲目，试试其他关键词或筛选条件。</td></tr>';
  }
  function openPlaylist(id, smart = false) {
    const playlist = catalog.playlist(id); editingPlaylist = id || null;
    $('#playlist-dialog-title').textContent = playlist ? '编辑列表' : smart ? '新建智能列表' : '新建播放列表';
    $('#playlist-name').value = playlist?.name || ''; $('#smart-rules').hidden = playlist ? !playlist.rules : !smart;
    const rules = playlist?.rules || {};
    for (const [field,key] of [['text','text'],['genre','genre'],['key','key'],['min','minBpm'],['max','maxBpm'],['rating','minRating']]) $(`#rule-${field}`).value = rules[key] ?? (field === 'rating' ? 0 : '');
    $('#rule-favorite').checked = !!rules.favorite; $('#playlist-form-error').textContent = '';
    $('#playlist-dialog').showModal(); $('#playlist-name').focus();
  }
  $('#playlist-new').onclick = () => openPlaylist(null);
  $('#smart-new').onclick = () => openPlaylist(null,true);
  $('#playlist-edit').onclick = () => openPlaylist(view);
  $('#playlist-close').onclick = $('#playlist-cancel').onclick = () => $('#playlist-dialog').close();
  $('#playlist-dialog form').onsubmit = async event => {
    event.preventDefault(); if (busy) return;
    const rules = $('#smart-rules').hidden ? null : { text:$('#rule-text').value,genre:$('#rule-genre').value,key:$('#rule-key').value,minBpm:$('#rule-min').value,maxBpm:$('#rule-max').value,minRating:$('#rule-rating').value,favorite:$('#rule-favorite').checked };
    busy = true; $('#playlist-save').disabled = true;
    try { if (editingPlaylist) await catalog.edit(editingPlaylist,$('#playlist-name').value,rules); else view = await catalog.create($('#playlist-name').value,rules); $('#playlist-dialog').close(); status('已保存到本机'); render(); }
    catch(error) { $('#playlist-form-error').textContent = error.message; }
    finally { busy = false; $('#playlist-save').disabled = false; }
  };
  $('#playlist-delete').onclick = () => run(async () => { await catalog.delete(view); view = 'all'; });
  $('#playlist-add').onclick = () => run(async () => { if (!selected.size) throw new Error('请先选择曲目'); await catalog.add($('#playlist-target').value,[...selected]); });
  $('#playlist-remove').onclick = () => run(async () => { if (!selected.size) throw new Error('请先选择曲目'); await catalog.remove(view,[...selected]); selected.clear(); });
  $('.collection-tabs').onclick = event => { const button = event.target.closest('[data-collection]'); if (button) { view = button.dataset.collection; selected.clear(); render(); } };
  $('.collection-tabs').ondragover = event => { if (event.dataTransfer.types.includes('application/x-mixdesk-track')) event.preventDefault(); };
  $('.collection-tabs').ondrop = event => {
    const button = event.target.closest('[data-collection]'); if (!button || !event.dataTransfer.types.includes('application/x-mixdesk-track')) return;
    event.preventDefault(); event.stopPropagation(); const id = event.dataTransfer.getData('application/x-mixdesk-track');
    run(() => catalog.add(button.dataset.collection,selected.has(id) ? [...selected] : [id]));
  };
  $('#track-list').ondragstart = event => { const row = event.target.closest('[data-track]'); if (row) { event.dataTransfer.setData('application/x-mixdesk-track',row.dataset.track); event.dataTransfer.effectAllowed = 'copyMove'; } };
  $('#track-list').onchange = event => { const input = event.target.closest('[data-select-track]'); if (input) { input.checked ? selected.add(input.dataset.selectTrack) : selected.delete(input.dataset.selectTrack); renderRows(); } };
  $('#library-select-all').onchange = event => { for (const t of visible) event.target.checked ? selected.add(t.id) : selected.delete(t.id); renderRows(); };
  $('#track-list').onclick = event => {
    const row = event.target.closest('[data-track]'); if (!row) return;
    const track = tracks.find(t => t.id === row.dataset.track); if (!track) return; selectTrack(track.id);
    if (event.target.closest('[data-load]')) load(Number(event.target.closest('[data-load]').dataset.load),track);
    if (event.target.closest('[data-favorite]')) run(() => catalog.toggleFavorite(track.id));
    if (event.target.closest('[data-metadata]')) openMetadata(track);
    if (event.target.closest('[data-move]')) run(() => catalog.move(view,track.id,Number(event.target.closest('[data-move]').dataset.move)));
    if (event.target.closest('.delete-track')) run(async () => { await remove(track); await catalog.forget(track.id); });
  };
  $('#search').oninput = event => { query = event.target.value; render(); };
  for (const id of ['filter-genre','filter-key','filter-min-bpm','filter-max-bpm','filter-rating','library-sort']) $(`#${id}`).oninput = render;
  $('#sort-direction').onclick = () => { const reverse = $('#sort-direction').getAttribute('aria-pressed') !== 'true'; $('#sort-direction').setAttribute('aria-pressed',String(reverse)); $('#sort-direction').textContent = reverse ? '↓ 降序' : '↑ 升序'; render(); };
  $('#filters-reset').onclick = () => { query = ''; $('#search').value = ''; for(const id of ['filter-genre','filter-key','filter-min-bpm','filter-max-bpm']) $(`#${id}`).value = ''; $('#filter-rating').value = '0'; render(); };
  function openMetadata(track) {
    editingTrack = track.id; for(const [key] of metadataFields) $(`#meta-${key}`).value = track[key] ?? '';
    const f = track.formatInfo || {};
    $('#metadata-file-info').textContent = [track.file?.name || '原创演示',f.container,f.codec,f.sampleRate ? `${f.sampleRate} Hz` : '',f.channels ? `${f.channels} 声道` : '',f.bitrate ? `${Math.round(f.bitrate/1000)} kbps` : '',`${time(track.duration)}`,`播放 ${catalog.count(track.id)} 次`].filter(Boolean).join(' · ');
    $('#metadata-reread').disabled = !track.file; $('#metadata-relink').disabled = !relink; $('#metadata-form-error').textContent = '';
    if (!$('#metadata-dialog').open) $('#metadata-dialog').showModal();
  }
  $('#metadata-close').onclick = () => $('#metadata-dialog').close();
  $('#metadata-dialog form').onsubmit = async event => {
    event.preventDefault(); if (busy) return; busy = true; $('#metadata-save').disabled = true;
    try {
      const track = tracks.find(t => t.id === editingTrack); if (!track) throw new Error('此曲目已被移除');
      const patch = Object.fromEntries(metadataFields.filter(([key]) => String(track[key] ?? '') !== $(`#meta-${key}`).value).map(([key]) => [key,$(`#meta-${key}`).value]));
      if (Object.keys(patch).length) await catalog.metadata(editingTrack,patch);
      status('已保存到本机'); $('#metadata-dialog').close();
    }
    catch(error) { $('#metadata-form-error').textContent = error.message; }
    finally { busy = false; $('#metadata-save').disabled = false; }
  };
  $('#metadata-reread').onclick = async () => {
    if (busy) return; const track = tracks.find(t => t.id === editingTrack); if (!track?.file) return;
    busy = true; $('#metadata-reread').disabled = true;
    try { await reread(track,catalog); openMetadata(track); $('#metadata-form-error').textContent = '文件标签已重新读取'; }
    catch(error) { $('#metadata-form-error').textContent = error.message; }
    finally { busy = false; $('#metadata-reread').disabled = false; }
  };
  $('#metadata-relink').onclick = () => {
    if (!relink || !editingTrack) return;
    $('#metadata-relink-file').click();
  };
  $('#metadata-relink-file').onchange = async event => {
    const file = event.target.files[0]; event.target.value = '';
    if (!file || !editingTrack || busy) return;
    const track = tracks.find(item => item.id === editingTrack); if (!track) return;
    busy = true; $('#metadata-relink').disabled = true; $('#metadata-reread').disabled = true; $('#metadata-export').disabled = true;
    $('#metadata-form-error').textContent = '正在重新关联文件…';
    try {
      await relink(track, file);
      openMetadata(track);
      $('#metadata-form-error').textContent = `已关联「${file.name}」，曲目标记和播放列表已保留`;
      status('已重新关联音频文件');
    } catch (error) {
      $('#metadata-form-error').textContent = error.message || '重新关联失败，原文件未改变';
    } finally {
      busy = false; $('#metadata-relink').disabled = !relink; $('#metadata-reread').disabled = !track.file; $('#metadata-export').disabled = false;
    }
  };
  $('#metadata-export').onclick = async () => {
    if (busy) return;
    const track = tracks.find(item => item.id === editingTrack);
    if (!track?.file) { $('#metadata-form-error').textContent = '此曲目没有可导出的原始文件'; return; }
    const values = Object.fromEntries(metadataFields.map(([key]) => [key, $(`#meta-${key}`).value]));
    if (!String(values.title || '').trim()) { $('#metadata-form-error').textContent = '曲目名称不能为空'; return; }
    busy = true; $('#metadata-export').disabled = true; $('#metadata-form-error').textContent = '';
    try {
      const copy = await writeTagsCopy(track.file, { ...track, ...values });
      const sourceName = track.file.name || `${track.title || 'track'}.wav`;
      const base = sourceName.replace(/\.[^.]+$/, '') || 'track';
      const extension = /\.mp3$/i.test(sourceName) ? '.mp3' : '.wav';
      download(copy, `${base} - tagged${extension}`, copy.type || (extension === '.mp3' ? 'audio/mpeg' : 'audio/wav'));
      $('#metadata-form-error').textContent = '已导出带标签副本，原始文件未修改';
      status('已导出带标签副本');
    } catch (error) {
      $('#metadata-form-error').textContent = error.message || '导出标签副本失败';
    } finally {
      busy = false; $('#metadata-export').disabled = false;
    }
  };
  $('#playlist-export').onclick = () => {
    const playlist = catalog.playlist(view), name = playlist?.name || (view === 'favorites' ? '收藏' : view === 'history' ? '播放历史' : '所有歌曲');
    download(JSON.stringify({ format:'mixdesk-playlist',version:1,name,rules:playlist?.rules || null,tracks:visible.map(t => ({id:t.id,fileName:t.file?.name || null,title:t.title,artist:t.artist,duration:t.duration})) },null,2),`${name.replace(/[\\/:*?"<>|]/g,'_')}.mixdesk.json`,'application/json');
    status(`已导出当前 ${visible.length} 首曲目清单，不包含音频文件`);
  };
  $('#playlist-export-rb').onclick = async () => {
    const playlist = catalog.playlist(view), name = playlist?.name || (view === 'favorites' ? '收藏' : view === 'history' ? '播放历史' : '所有歌曲');
    const exported = await Promise.all(visible.map(async (track, index) => {
      let annotations = track.annotations || {};
      try { annotations = await setting(`annotations:${track.id}`) || annotations; } catch {}
      const bpm = Number(track.bpm) || 120;
      const grid = Array.isArray(annotations.beatGrid) && annotations.beatGrid.length
        ? annotations.beatGrid : [{ start: 0, bpm, offset: annotations.gridOffset || 0 }];
      const tempos = [...grid].sort((a, b) => a.start - b.start).map(segment =>
        `<TEMPO Inizio="${xmlNumber(segment.start)}" Bpm="${xmlNumber(segment.bpm, 2)}" Metro="4/4" Battito="1"/>`
      ).join('');
      const marks = [];
      if (Number.isFinite(annotations.cuePoint)) marks.push(`<POSITION_MARK Name="Cue" Type="0" Start="${xmlNumber(annotations.cuePoint)}" Num="-1"/>`);
      (annotations.hotcues || []).forEach((start, cueIndex) => {
        if (!Number.isFinite(start)) return;
        const { red, green, blue } = colorRgb(annotations.hotcueMeta?.[cueIndex]?.color);
        const cueName = annotations.hotcueMeta?.[cueIndex]?.name || `Hot Cue ${cueIndex + 1}`;
        marks.push(`<POSITION_MARK Name="${xmlEsc(cueName)}" Type="0" Start="${xmlNumber(start)}" Num="${cueIndex}" Red="${red}" Green="${green}" Blue="${blue}"/>`);
      });
      (annotations.savedLoops || []).forEach((loop, loopIndex) => {
        if (!loop || !Number.isFinite(loop.start) || !Number.isFinite(loop.end) || loop.end <= loop.start) return;
        marks.push(`<POSITION_MARK Name="Saved Loop ${loopIndex + 1}" Type="4" Start="${xmlNumber(loop.start)}" End="${xmlNumber(loop.end)}" Num="-1"/>`);
      });
      const fileName = track.file?.name || track.title || `Track ${index + 1}`;
      const kind = fileName.split('.').at(-1)?.toUpperCase() || 'AUDIO';
      const trackXml = `<TRACK TrackID="${index + 1}" Name="${xmlEsc(track.title)}" Artist="${xmlEsc(track.artist)}" Composer="" Album="${xmlEsc(track.album)}" Grouping="" Genre="${xmlEsc(track.genre)}" Kind="${xmlEsc(kind)}" Size="${track.file?.size || 0}" TotalTime="${Math.round(track.duration || 0)}" DiscNumber="0" TrackNumber="0" Year="${xmlEsc(track.year)}" AverageBpm="${xmlNumber(bpm, 2)}" DateAdded="" BitRate="" SampleRate="" Comments="${xmlEsc(track.comment)}" PlayCount="0" Rating="${Math.round(Number(track.rating) || 0)}" Location="${xmlEsc(rekordboxLocation(fileName))}" Remixer="" Tonality="${xmlEsc(track.key)}" Label="" Mix="">${tempos}${marks.join('')}</TRACK>`;
      return { id: index + 1, trackXml };
    }));
    const tracksXml = exported.map(item => item.trackXml).join('');
    const keys = exported.map(item => `<TRACK Key="${item.id}"/>`).join('');
    const xml = `<?xml version="1.0" encoding="UTF-8" standalone="no"?><DJ_PLAYLISTS Version="1.0.0"><PRODUCT Name="MIXDESK" Version="0.8.3" Company="MIXDESK"/><COLLECTION Entries="${exported.length}">${tracksXml}</COLLECTION><PLAYLISTS><NODE Type="0" Name="ROOT" Count="1"><NODE Type="1" Name="${xmlEsc(name)}" KeyType="0" Entries="${exported.length}">${keys}</NODE></NODE></PLAYLISTS></DJ_PLAYLISTS>`;
    download(xml, `${name.replace(/[\\/:*?"<>|]/g,'_')}.rekordbox.xml`, 'application/xml');
    status(`已导出 Rekordbox XML，包含 ${visible.length} 首曲目；浏览器只提供文件名，绝对路径需要在 Rekordbox 中重定位`);
  };
  $('#playlist-import').onclick = () => $('#playlist-file').click();
  $('#playlist-file').onchange = async event => {
    const file = event.target.files[0]; event.target.value = ''; if (!file) return;
    await run(async () => {
      if (file.size > 2 * 1024 * 1024) throw new Error('列表文件不能超过 2 MB');
      const isCrate = /\.crate$/i.test(file.name);
      const body = isCrate ? '' : await file.text(); let name = file.name.replace(/\.(json|m3u8?|crate)$/i,''), rules = null, entries;
      if (isCrate) {
        const songs = parseSeratoCrate(await file.arrayBuffer());
        entries = songs.map(sourcePath => ({ sourcePath, fileName: sourcePath.split(/[\\/]/).at(-1) || sourcePath }));
      } else if (/\.json$/i.test(file.name)) {
        const doc = JSON.parse(body); if (!doc || doc.format !== 'mixdesk-playlist' || doc.version !== 1 || !Array.isArray(doc.tracks)) throw new Error('不是支持的 MIXDESK 列表');
        name = textName(doc.name) || name; rules = doc.rules ? cleanRules(doc.rules) : null; entries = doc.tracks;
      } else if (/\.xml$/i.test(file.name)) {
        const xml = new DOMParser().parseFromString(body, 'application/xml');
        if (xml.querySelector('parsererror') || xml.documentElement?.nodeName !== 'DJ_PLAYLISTS') throw new Error('不是有效的 Rekordbox XML');
        const collection = [...xml.querySelectorAll('COLLECTION > TRACK')], byKey = new Map(collection.map(track => [track.getAttribute('TrackID'), track]));
        const playlistNodes = [...xml.querySelectorAll('PLAYLISTS NODE')].filter(item => item.getAttribute('Type') === '1');
        const node = playlistNodes.find(item => item.querySelector(':scope > TRACK')) || playlistNodes.at(-1);
        name = textName(node?.getAttribute('Name')) || name;
        const source = node ? [...node.querySelectorAll(':scope > TRACK')].map(item => byKey.get(item.getAttribute('Key'))).filter(Boolean) : collection;
        entries = source.map(track => {
          const location = track.getAttribute('Location') || track.querySelector('LOCATION')?.getAttribute('Location') || track.querySelector('LOCATION')?.getAttribute('FilePath') || '';
          let fileName = location; try { fileName = decodeURIComponent(location).split(/[\\/]/).at(-1); } catch {}
          return { fileName, title: track.getAttribute('Name') || '', artist: track.getAttribute('Artist') || '' };
        });
      } else entries = body.split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#')).map(line => ({fileName:line.split(/[\\/]/).at(-1)}));
      if (entries.length > 10000) throw new Error('每个列表最多导入 10000 项');
      let missing = 0; const ids = [];
      for (const entry of entries) {
        if (!entry || typeof entry !== 'object') { missing++; continue; }
        const exact = tracks.find(t => t.id === entry.id);
        const byName = entry.fileName ? tracks.filter(t => t.file?.name === entry.fileName) : [];
        const byMetadata = tracks.filter(t => entry.title && t.title === entry.title && (!entry.artist || t.artist === entry.artist));
        const candidates = exact ? [exact] : byName.length ? byName : byMetadata;
        if (candidates.length === 1) ids.push(candidates[0].id); else missing++;
      }
      view = await catalog.create(name,rules,ids);
      toast(`${isCrate ? 'Serato Crate 导入' : '导入'} ${new Set(ids).size} 首；${missing} 项未找到或匹配不唯一，请先导入相应音频`);
    });
  };
  window.addEventListener('pagehide', () => { for (const item of covers.values()) URL.revokeObjectURL(item.url); catalog.channel?.close(); });
  render();
  function selectTrack(id) {
    selectedId = id;
    $('#track-list').querySelectorAll('tr[data-track]').forEach(row => row.classList.toggle('track-selected', row.dataset.track === id));
  }
  function moveSelection(delta) {
    const steps = Math.trunc(Number(delta));
    if (!visible.length || !Number.isFinite(steps) || !steps) return selectedId;
    const index = Math.max(0, Math.min(visible.length - 1, visible.findIndex(track => track.id === selectedId) + steps));
    selectTrack(visible[index].id);
    const row = [...$('#track-list').querySelectorAll('tr[data-track]')].find(item => item.dataset.track === selectedId);
    row?.scrollIntoView({ block: 'nearest' });
    return selectedId;
  }
  async function loadSelected(id) {
    const track = visible.find(track => track.id === selectedId) || visible[0];
    if (!track) { toast('当前列表没有可载入的音乐'); return false; }
    selectTrack(track.id);
    await load(id, track);
    return true;
  }
  function toggleBrowser() {
    document.querySelector('#library')?.classList.toggle('library-expanded');
    return document.querySelector('#library')?.classList.contains('library-expanded');
  }
  return { catalog, render, setView(id) { view=id; render(); }, moveSelection, loadSelected, toggleBrowser, get selectedId() { return selectedId; } };
}
const textName = value => typeof value === 'string' ? value.slice(0,100).trim() : '';
