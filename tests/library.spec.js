import { test, expect } from '@playwright/test';
import { readFile } from 'node:fs/promises';
import { parseBlob } from 'music-metadata';
import { taggedWav } from './fixtures/audio.js';
const rowIds = page => page.locator('#track-list tr[data-track]').evaluateAll(rows => rows.map(row => row.dataset.track));
const collection = (page, name) => page.locator('.collection-tabs button').filter({ hasText: name }).click();
async function ready(page) { await page.goto('/'); await expect(page.locator('#track-count')).toHaveText('2 首'); await expect(page.locator('[data-deck="0"] .track-title')).toHaveText('Night Drive'); }
async function saveMetadata(page, title, changes) {
  await page.getByRole('button',{name:'编辑 '+title,exact:true}).click();
  for(const [key,value] of Object.entries(changes)) await page.locator('#meta-'+key).fill(String(value));
  await page.locator('#metadata-save').click(); await expect(page.locator('#metadata-dialog')).not.toBeVisible();
}
async function createList(page, name) {
  await page.locator('#playlist-new').click(); await page.locator('#playlist-name').fill(name);
  await page.locator('#playlist-save').click(); await expect(page.locator('#playlist-dialog')).not.toBeVisible();
}
async function importAudio(page) {
  await page.locator('#file-input').setInputFiles({name:'fixture.wav',mimeType:'audio/wav',buffer:taggedWav()});
  await expect(page.locator('#track-list')).toContainText('Tagged Night');
}

test('ordinary lists deduplicate, reorder, persist, rename and remove membership', async ({page}) => {
  await ready(page); await createList(page,'Warm-up'); await collection(page,'所有歌曲');
  await page.locator('#library-select-all').check(); await page.locator('#playlist-target').selectOption({label:'Warm-up'});
  await page.locator('#playlist-add').click(); await expect(page.locator('#library-status')).toHaveText('已保存到本机');
  await page.locator('#playlist-add').click(); await expect(page.locator('#library-status')).toHaveText('已保存到本机');
  await collection(page,'Warm-up'); expect(await rowIds(page)).toEqual(['demo-night-drive','demo-after-hours']);
  await page.getByRole('button',{name:'上移 After Hours'}).click(); await expect.poll(()=>rowIds(page)).toEqual(['demo-after-hours','demo-night-drive']);
  await page.reload(); await collection(page,'Warm-up'); expect(await rowIds(page)).toEqual(['demo-after-hours','demo-night-drive']);
  await page.locator('#playlist-edit').click(); await page.locator('#playlist-name').fill('Opening set'); await page.locator('#playlist-save').click();
  await page.getByRole('checkbox',{name:'选择 After Hours',exact:true}).check(); await page.locator('#playlist-remove').click();
  await expect.poll(()=>rowIds(page)).toEqual(['demo-night-drive']); await expect(page.locator('#track-count')).toHaveText('2 首');
  await page.locator('#playlist-delete').click(); await expect(page.locator('.collection-tabs')).not.toContainText('Opening set');
  await expect(page.locator('#track-list tr[data-track]')).toHaveCount(2);
});

test('smart lists combine rules and follow favorites and metadata changes', async ({page}) => {
  await ready(page); await saveMetadata(page,'Night Drive',{rating:4});
  await page.getByRole('button',{name:'收藏 Night Drive',exact:true}).click(); await expect(page.getByRole('button',{name:'收藏 Night Drive',exact:true})).toHaveAttribute('aria-pressed','true');
  await page.locator('#smart-new').click(); await page.locator('#playlist-name').fill('Low tempo favorites');
  await page.locator('#rule-genre').fill('house'); await page.locator('#rule-min').fill('119'); await page.locator('#rule-max').fill('122');
  await page.locator('#rule-rating').selectOption('4'); await page.locator('#rule-favorite').check(); await page.locator('#playlist-save').click();
  await expect(page.locator('#track-list tr[data-track]')).toHaveCount(1); await expect(page.locator('#track-list')).toContainText('Night Drive');
  await saveMetadata(page,'Night Drive',{bpm:130}); await expect(page.locator('#track-list tr[data-track]')).toHaveCount(0);
  await page.locator('#playlist-edit').click(); await page.locator('#rule-max').fill('132'); await page.locator('#playlist-save').click();
  await expect(page.locator('#track-list tr[data-track]')).toHaveCount(1);
  await page.getByRole('button',{name:'收藏 Night Drive',exact:true}).click(); await expect(page.locator('#track-list tr[data-track]')).toHaveCount(0);
  await page.reload(); await collection(page,'Low tempo favorites'); await expect(page.locator('#track-list tr[data-track]')).toHaveCount(0);
});

test('metadata updates loaded copies and escapes markup across reload', async ({page}) => {
  await ready(page); await page.getByRole('button',{name:'将 Night Drive 载入 B 台'}).click();
  await page.evaluate(async()=>{const d=window.__mixdesk.engine.decks[0];d.seek(4);await d.play();d.toggleLoop(4);});
  const title='<img src=x onerror=window.metadataInjected=1>';
  await saveMetadata(page,'Night Drive',{title,artist:'Edited Artist',bpm:132,comment:'A & B <tags>'});
  await expect(page.locator('[data-deck="0"] .track-title')).toHaveText(title); await expect(page.locator('[data-deck="1"] .track-title')).toHaveText(title);
  const state=await page.evaluate(()=>({injected:window.metadataInjected,deck:window.__mixdesk.engine.decks.slice(0,2).map(d=>({bpm:d.bpm,loop:d.loop,position:d.position,playing:d.playing}))}));
  expect(state.injected).toBeUndefined(); expect(state.deck.map(d=>d.bpm)).toEqual([132,132]); expect(state.deck[0].playing).toBe(true); expect(state.deck[0].loop).toBeNull(); expect(state.deck[0].position).toBeGreaterThan(4);
  expect(await page.locator('#track-list img').count()).toBe(0); await page.reload();
  await expect(page.locator('[data-deck="0"] .track-title')).toHaveText(title);
  await page.getByRole('button',{name:'编辑 '+title,exact:true}).click(); await expect(page.locator('#meta-comment')).toHaveValue('A & B <tags>'); await expect(page.locator('#meta-bpm')).toHaveValue('132');
});

test('embedded tags and artwork import, persist and reread without rewriting the file', async ({page}) => {
  await ready(page); const original=taggedWav(); const requests=[];
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith('http://127.0.0.1:5173')) requests.push(r.url());});
  await importAudio(page); await expect(page.locator('#track-count')).toHaveText('3 首');
  const metadata=()=>page.evaluate(async()=>{const t=window.__mixdesk.tracks.find(t=>t.file?.name==='fixture.wav');return {title:t.title,artist:t.artist,album:t.album,genre:t.genre,bpm:t.bpm,key:t.key,year:t.year,estimated:t.estimated,tagsRead:t.tagsRead,artwork:t.artwork?.size,bytes:[...new Uint8Array(await t.file.arrayBuffer())]};});
  let info=await metadata(); expect(info).toMatchObject({title:'Tagged Night',artist:'Local Artist',album:'Test Album',genre:'House',bpm:128,key:'Am',year:2026,estimated:false,tagsRead:true}); expect(info.artwork).toBeGreaterThan(50); expect(Buffer.from(info.bytes).equals(original)).toBe(true);
  await expect.poll(()=>page.locator('img[alt="Tagged Night 封面"]').evaluate(img=>img.complete&&img.naturalWidth>0)).toBe(true);
  await page.getByRole('button',{name:'将 Tagged Night 载入 A 台'}).click(); await page.getByRole('button',{name:'播放 A',exact:true}).click(); await expect.poll(()=>page.evaluate(()=>window.__mixdesk.previewState.meters[0])).toBeGreaterThan(0.01);
  await page.reload(); await expect(page.locator('#track-list')).toContainText('Tagged Night'); await saveMetadata(page,'Tagged Night',{title:'Manual title',artist:'Manual artist',bpm:135,rating:5});
  await page.getByRole('button',{name:'编辑 Manual title',exact:true}).click(); await page.locator('#metadata-reread').click();
  await expect(page.locator('#metadata-form-error')).toHaveText('文件标签已重新读取'); await expect(page.locator('#meta-title')).toHaveValue('Tagged Night'); await expect(page.locator('#meta-rating')).toHaveValue('5'); await expect(page.locator('#meta-bpm')).toHaveValue('128');
  await page.locator('#metadata-close').click(); info=await metadata(); expect(Buffer.from(info.bytes).equals(original)).toBe(true); expect(requests).toEqual([]);
});

test('metadata export creates a tagged WAV copy and preserves the imported bytes', async ({page}) => {
  await ready(page); const original = taggedWav(); await importAudio(page);
  await page.getByRole('button',{name:'编辑 Tagged Night',exact:true}).click();
  await page.locator('#meta-title').fill('Exported Night');
  await page.locator('#meta-artist').fill('Export Artist');
  await page.locator('#meta-bpm').fill('126');
  const downloadPromise = page.waitForEvent('download'); await page.locator('#metadata-export').click();
  const download = await downloadPromise; expect(download.suggestedFilename()).toBe('fixture - tagged.wav');
  const exported = await readFile(await download.path());
  const parsed = await parseBlob(new Blob([exported], { type: 'audio/wav' }));
  expect(parsed.common.title).toBe('Exported Night');
  expect(parsed.common.artist).toBe('Export Artist');
  expect(parsed.common.bpm).toBe(126);
  expect(exported.length).toBeGreaterThan(original.length);
  const source = await page.evaluate(async () => {
    const track = window.__mixdesk.tracks.find(item => item.file?.name === 'fixture.wav');
    return [...new Uint8Array(await track.file.arrayBuffer())];
  });
  expect(Buffer.from(source).equals(original)).toBe(true);
  await expect(page.locator('#metadata-form-error')).toHaveText('已导出带标签副本，原始文件未修改');
});

test('relink swaps the audio while preserving identity, catalog membership and markers', async ({page}) => {
  await ready(page); await importAudio(page);
  const trackId = await page.evaluate(() => window.__mixdesk.tracks.find(track => track.file?.name === 'fixture.wav').id);
  await page.getByRole('button', { name: '收藏 Tagged Night', exact: true }).click();
  await createList(page, 'Relink set'); await collection(page, '所有歌曲');
  await page.locator(`[data-track="${trackId}"] [data-select-track]`).check();
  await page.locator('#playlist-target').selectOption({ label: 'Relink set' }); await page.locator('#playlist-add').click();
  await page.getByRole('button', { name: '将 Tagged Night 载入 A 台', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__mixdesk.engine.decks[0].track?.file?.name === 'fixture.wav')).toBe(true);
  await page.evaluate(async () => {
    const deck = window.__mixdesk.engine.decks[0];
    deck.seek(1); deck.cuePoint = 1; deck.hotcues[0] = 2;
    deck.hotcueMeta[0] = { name: 'Drop', color: '#f4ad6b' };
    deck.savedLoops[0] = { start: .5, end: 1.5, beats: 6.4 };
    await window.__mixdesk.saveAnnotations(0);
    await deck.play();
  });
  await page.getByRole('button', { name: '编辑 Tagged Night', exact: true }).click();
  await page.locator('#metadata-relink-file').setInputFiles({ name: 'relinked.wav', mimeType: 'audio/wav', buffer: taggedWav({ duration: 6, title: 'Ignored by relink' }) });
  await expect(page.locator('#metadata-form-error')).toContainText('已关联');
  const state = await page.evaluate(() => {
    const track = window.__mixdesk.tracks.find(item => item.id === window.__mixdesk.engine.decks[0].track.id);
    const deck = window.__mixdesk.engine.decks[0];
    return { id: track.id, name: track.file.name, title: track.title, duration: track.duration, buffer: deck.buffer.duration, position: deck.position, playing: deck.playing, cue: deck.cuePoint, hotcue: deck.hotcues[0], hotcueName: deck.hotcueMeta[0].name, loop: deck.savedLoops[0] };
  });
  expect(state.id).toBe(trackId); expect(state.name).toBe('relinked.wav'); expect(state.title).toBe('Tagged Night');
  expect(state.duration).toBeCloseTo(6, 1); expect(state.buffer).toBeCloseTo(6, 1); expect(state.position).toBeGreaterThanOrEqual(0); expect(state.playing).toBe(true);
  expect(state.cue).toBe(1); expect(state.hotcue).toBe(2); expect(state.hotcueName).toBe('Drop'); expect(state.loop).toMatchObject({ start: .5, end: 1.5 });
  await page.locator('#metadata-close').click();
  await collection(page, '收藏'); await expect(page.locator('#track-list')).toContainText('Tagged Night');
  await collection(page, 'Relink set'); await expect(page.locator('#track-list')).toContainText('Tagged Night');
  await page.reload(); await expect(page.locator('[data-deck="0"] .track-title')).toHaveText('Night Drive');
  const persisted = await page.evaluate(() => {
    const imported = window.__mixdesk.tracks.find(item => item.file?.name === 'relinked.wav');
    return { importedId: imported?.id, name: imported?.file?.name };
  });
  expect(persisted.importedId).toBe(trackId); expect(persisted.name).toBe('relinked.wav');
  await page.getByRole('button', { name: '将 Tagged Night 载入 A 台', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__mixdesk.engine.decks[0].track?.file?.name === 'relinked.wav')).toBe(true);
  const restored = await page.evaluate(() => { const deck = window.__mixdesk.engine.decks[0]; return { cue: deck.cuePoint, hotcue: deck.hotcues[0], hotcueName: deck.hotcueMeta[0].name, loop: deck.savedLoops[0] }; });
  expect(restored).toMatchObject({ cue: 1, hotcue: 2, hotcueName: 'Drop', loop: { start: .5, end: 1.5 } });
});

test('failed relink leaves the original file and runtime state intact', async ({page}) => {
  await ready(page); await importAudio(page); await page.getByRole('button', { name: '将 Tagged Night 载入 A 台', exact: true }).click();
  await expect.poll(() => page.evaluate(() => window.__mixdesk.engine.decks[0].track?.file?.name === 'fixture.wav')).toBe(true);
  const before = await page.evaluate(() => {
    const deck = window.__mixdesk.engine.decks[0]; deck.seek(1); deck.cuePoint = 1;
    return { name: deck.track.file.name, duration: deck.track.duration, id: deck.track.id, cue: deck.cuePoint };
  });
  await page.getByRole('button', { name: '编辑 Tagged Night', exact: true }).click();
  await page.locator('#metadata-relink-file').setInputFiles({ name: 'broken.wav', mimeType: 'audio/wav', buffer: Buffer.from('not an audio file') });
  await expect(page.locator('#metadata-form-error')).toContainText('无法解码');
  const after = await page.evaluate(() => { const deck = window.__mixdesk.engine.decks[0]; return { name: deck.track.file.name, duration: deck.track.duration, id: deck.track.id, cue: deck.cuePoint }; });
  expect(after).toEqual(before);
  await page.reload();
  await expect(page.locator('#track-list')).toContainText('Tagged Night');
  const persisted = await page.evaluate(() => { const track = window.__mixdesk.tracks.find(item => item.file?.name === 'fixture.wav'); return { name: track?.file?.name, id: track?.id }; });
  expect(persisted).toEqual({ name: 'fixture.wav', id: before.id });
});

test('JSON and M3U round trips preserve order and never fetch unresolved URLs', async ({page}) => {
  await ready(page); await createList(page,'Export set'); await collection(page,'所有歌曲'); await page.locator('#library-select-all').check();
  await page.locator('#playlist-target').selectOption({label:'Export set'}); await page.locator('#playlist-add').click(); await expect(page.locator('#library-status')).toHaveText('已保存到本机'); await collection(page,'Export set');
  await page.getByRole('button',{name:'上移 After Hours'}).click(); await expect.poll(()=>rowIds(page)).toEqual(['demo-after-hours','demo-night-drive']);
  const downloadPromise=page.waitForEvent('download'); await page.locator('#playlist-export').click(); const download=await downloadPromise; const doc=JSON.parse(await readFile(await download.path(),'utf8'));
  expect(doc.tracks.map(t=>t.id)).toEqual(['demo-after-hours','demo-night-drive']); expect(doc.tracks[0].file).toBeUndefined();
  doc.name='Imported set'; doc.tracks.push(doc.tracks[0],{id:'missing-id',fileName:'missing.wav'});
  await page.locator('#playlist-file').setInputFiles({name:'roundtrip.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(doc))});
  await expect(page.locator('.collection-tabs button.active')).toContainText('Imported set'); expect(await rowIds(page)).toEqual(['demo-after-hours','demo-night-drive']); await expect(page.locator('#toast')).toContainText('1 项未找到');
  await collection(page,'所有歌曲'); await importAudio(page); const external=[]; page.on('request',r=>{if(r.url().includes('example.invalid')) external.push(r.url());});
  await page.locator('#playlist-file').setInputFiles({name:'Local.m3u8',mimeType:'text/plain',buffer:Buffer.from(['#EXTM3U','/Users/test/fixture.wav','fixture.wav','https://example.invalid/missing.mp3'].join(String.fromCharCode(10)))});
  await expect(page.locator('.collection-tabs button.active')).toContainText('Local'); await expect(page.locator('#track-list tr[data-track]')).toHaveCount(1); expect(external).toEqual([]);
  const before=await page.locator('.collection-tabs button').count(); await page.locator('#playlist-file').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from('null')}); await expect(page.locator('#library-status')).toContainText('不是支持的'); expect(await page.locator('.collection-tabs button').count()).toBe(before);
});

test('Rekordbox XML export and import match local tracks without fetching paths', async ({page}) => {
  await ready(page);
  const downloadPromise = page.waitForEvent('download'); await page.locator('#playlist-export-rb').click();
  const download = await downloadPromise; const xml = await readFile(await download.path(), 'utf8');
  expect(xml).toContain('<DJ_PLAYLISTS'); expect(xml).toContain('Night Drive'); expect(xml).toContain('After Hours');
  await page.locator('#playlist-file').setInputFiles({name:'set.xml',mimeType:'application/xml',buffer:Buffer.from(xml)});
  await expect(page.locator('.collection-tabs button.active')).toContainText('所有歌曲');
  expect(await page.locator('#track-list tr[data-track]')).toHaveCount(2);
});

test('Rekordbox XML export uses standard Location, TEMPO and POSITION_MARK fields', async ({page}) => {
  await ready(page);
  await page.evaluate(() => {
    const track = window.__mixdesk.tracks.find(item => item.title === 'Night Drive');
    track.annotations = { cuePoint: 1.25, beatGrid: [{ start: 0, offset: 0, bpm: 120 }, { start: 32, offset: 0, bpm: 124 }], hotcues: [2.5], hotcueMeta: [{ name: 'Verse & Drop', color: '#f4ad6b' }], savedLoops: [{ start: 8, end: 10, beats: 4 }] };
  });
  const download = await (async () => { const promise = page.waitForEvent('download'); await page.locator('#playlist-export-rb').click(); return promise; })();
  const xml = await readFile(await download.path(), 'utf8');
  const details = await page.evaluate(source => {
    const doc = new DOMParser().parseFromString(source, 'application/xml'), track = doc.querySelector('COLLECTION > TRACK');
    return { error: doc.querySelector('parsererror')?.textContent || '', location: track?.getAttribute('Location'), bpm: track?.getAttribute('AverageBpm'), tempos: [...track.querySelectorAll('TEMPO')].map(el => [el.getAttribute('Inizio'), el.getAttribute('Bpm')]), marks: [...track.querySelectorAll('POSITION_MARK')].map(el => [el.getAttribute('Name'), el.getAttribute('Type'), el.getAttribute('Start'), el.getAttribute('End'), el.getAttribute('Num')]), legacy: !!track?.querySelector('LOCATION') };
  }, xml);
  expect(details.error).toBe(''); expect(details.location).toMatch(/^file:\/\/localhost\//); expect(details.bpm).toBe('120.00');
  expect(details.tempos).toEqual([['0.000000', '120.00'], ['32.000000', '124.00']]);
  expect(details.marks).toEqual([['Cue', '0', '1.250000', null, '-1'], ['Verse & Drop', '0', '2.500000', null, '0'], ['Saved Loop 1', '4', '8.000000', '10.000000', '-1']]);
  expect(details.legacy).toBe(false);
});

test('Rekordbox XML import accepts nested playlists and Location attributes without fetching paths', async ({page}) => {
  await ready(page); const requests = []; page.on('request', request => { if (/^https?:/.test(request.url()) && !request.url().startsWith('http://127.0.0.1:5173')) requests.push(request.url()); });
  const xml = `<?xml version="1.0"?><DJ_PLAYLISTS Version="1.0.0"><PRODUCT Name="rekordbox"/><COLLECTION Entries="2"><TRACK TrackID="42" Name="Night Drive" Artist="MIXDESK Originals · 合成演示" Location="file://localhost/Users/dj/Music/Night%20Drive.mp3"/><TRACK TrackID="77" Name="Unused" Artist="Someone" Location="file://localhost/Users/dj/Music/Unused.mp3"/></COLLECTION><PLAYLISTS><NODE Type="0" Name="ROOT"><NODE Type="0" Name="Sets"><NODE Type="1" Name="External Mix" Entries="1"><TRACK Key="42"/></NODE></NODE></NODE></PLAYLISTS></DJ_PLAYLISTS>`;
  await page.locator('#playlist-file').setInputFiles({name:'external.rekordbox.xml',mimeType:'application/xml',buffer:Buffer.from(xml)});
  await expect(page.locator('.collection-tabs button.active')).toContainText('External Mix'); await expect(page.locator('#track-list tr[data-track]')).toHaveCount(1); expect(requests).toEqual([]);
});

test('Serato Crate import parses bounded UTF-16BE track records without opening paths', async ({page}) => {
  await ready(page);
  const crate = await readFile('tests/fixtures/serato-Test.crate');
  const requests = [];
  page.on('request', request => { if (/^https?:/.test(request.url()) && !request.url().startsWith('http://127.0.0.1:5173')) requests.push(request.url()); });
  await page.locator('#playlist-file').setInputFiles({name:'Test.crate',mimeType:'application/octet-stream',buffer:crate});
  await expect(page.locator('.collection-tabs button.active')).toContainText('Test');
  await expect(page.locator('#track-list tr[data-track]')).toHaveCount(0);
  await expect(page.locator('#toast')).toContainText('Serato Crate 导入 0 首；2 项未找到');
  expect(requests).toEqual([]);
  const parsed = await page.evaluate(async () => {
    const { parseSeratoCrate } = await import('/src/library.js');
    const bytes = await (await fetch('/tests/fixtures/serato-Test.crate')).arrayBuffer();
    return parseSeratoCrate(bytes);
  });
  expect(parsed).toEqual([
    'Users/rick/Music/Antonio Giacca - Birdland (Radio Mix).mp3',
    'Users/rick/Music/Bounce (Extended Mix) - Calvin Harris feat. Kelis.m4a',
  ]);
});

test('simultaneous tabs retain edits and broadcast refreshed metadata', async ({page,context}) => {
  await ready(page); const other=await context.newPage(); await ready(other);
  await Promise.all([page.evaluate(()=>window.__mixdesk.library.catalog.create('Tab one')),other.evaluate(()=>window.__mixdesk.library.catalog.create('Tab two'))]);
  await expect(page.locator('.collection-tabs')).toContainText('Tab two'); await expect(other.locator('.collection-tabs')).toContainText('Tab one');
  await Promise.all([page.evaluate(()=>window.__mixdesk.library.catalog.metadata('demo-night-drive',{artist:'Concurrent Artist'})),other.evaluate(()=>window.__mixdesk.library.catalog.metadata('demo-night-drive',{album:'Concurrent Album'}))]);
  await expect.poll(()=>page.evaluate(()=>window.__mixdesk.tracks[0].album)).toBe('Concurrent Album'); await expect.poll(()=>other.evaluate(()=>window.__mixdesk.tracks[0].artist)).toBe('Concurrent Artist');
  await other.close(); await page.reload(); await expect(page.locator('#track-list')).toContainText('Concurrent Artist'); await expect(page.locator('#track-list')).toContainText('Concurrent Album'); await expect(page.locator('.collection-tabs')).toContainText('Tab one'); await expect(page.locator('.collection-tabs')).toContainText('Tab two');
});

test('filters, sorting, drag to deck/list and compact layout remain usable', async ({page}) => {
  await ready(page); await createList(page,'Drag set'); await collection(page,'所有歌曲');
  await page.locator('[data-track="demo-after-hours"]').dragTo(page.locator('.collection-tabs button').filter({hasText:'Drag set'}));
  await collection(page,'Drag set'); expect(await rowIds(page)).toEqual(['demo-after-hours']);
  // Initiate the real HTML drag before scrolling to the offscreen deck.
  const source = page.locator('[data-track="demo-after-hours"] .track-art'); await source.scrollIntoViewIfNeeded();
  const box = await source.boundingBox(); await page.mouse.move(box.x + 10, box.y + 10); await page.mouse.down();
  await page.mouse.move(box.x + 20, box.y + 10, { steps: 5 });
  const target = page.locator('[data-deck="0"] .track-heading'); await target.scrollIntoViewIfNeeded();
  const end = await target.boundingBox(); await page.mouse.move(end.x + 20, end.y + 20, { steps: 10 }); await page.mouse.up();
  await expect(page.locator('[data-deck="0"] .track-title')).toHaveText('After Hours');
  await collection(page,'所有歌曲'); await page.locator('#library-sort').selectOption('bpm'); await page.locator('#sort-direction').click(); expect(await rowIds(page)).toEqual(['demo-after-hours','demo-night-drive']);
  await page.locator('#filter-min-bpm').fill('123'); expect(await rowIds(page)).toEqual(['demo-after-hours']); await page.locator('#filter-max-bpm').fill('121'); await expect(page.locator('#library-status')).toContainText('最低 BPM 不能高于最高 BPM');
  await page.locator('#filters-reset').click(); await expect(page.locator('#track-list tr[data-track]')).toHaveCount(2);
  await page.setViewportSize({width:390,height:844}); expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  await page.locator('#smart-new').click(); expect(await page.locator('#playlist-dialog').evaluate(d=>d.scrollWidth<=d.clientWidth)).toBe(true); await page.locator('#playlist-cancel').click();
});

test('measured main output creates one persisted play per load after fifteen seconds', async ({page}) => {
  test.setTimeout(45000); await ready(page); const count=()=>page.evaluate(()=>window.__mixdesk.library.catalog.count('demo-night-drive'));
  await page.evaluate(async()=>{const e=window.__mixdesk.engine;e.decks[0].setVolume(0);e.monitor.select(0,true);await e.decks[0].play();}); await page.waitForTimeout(900);
  expect(await page.evaluate(()=>window.__mixdesk.history.states.get(0).seconds)).toBe(0); expect(await count()).toBe(0);
  await page.evaluate(async()=>{const d=window.__mixdesk.engine.decks[0];d.pause();d.setVolume(.8);await d.cuePress();}); await page.waitForTimeout(600);
  expect(await page.evaluate(()=>window.__mixdesk.history.states.get(0).seconds)).toBe(0);
  await page.evaluate(async()=>{const d=window.__mixdesk.engine.decks[0];d.cue();await d.play();});
  await expect.poll(count,{timeout:22000,intervals:[500]}).toBe(1);
  expect(await page.evaluate(()=>window.__mixdesk.history.states.get(0).seconds)).toBeGreaterThanOrEqual(15);
  await page.evaluate(async()=>{const d=window.__mixdesk.engine.decks[0];d.pause();d.seek(1);await d.play();}); await page.waitForTimeout(600); expect(await count()).toBe(1);
  await collection(page,'播放历史'); await expect(page.locator('#track-list')).toContainText('1 次'); await page.reload(); await collection(page,'播放历史'); await expect(page.locator('#track-list')).toContainText('Night Drive'); expect(await count()).toBe(1);
});

test('history excludes previews, unobserved gaps and silence, resets per load', async ({page}) => {
  await ready(page);
  const result=await page.evaluate(async()=>{
    const {PlaybackHistory}=await import('/src/history.js'); const ctx={currentTime:0,state:'running'};
    const d={id:0,loadVersion:1,track:{id:'x'},playing:true,cuePreview:false,meter:()=>.1,crossGain:{gain:{value:1}}};
    const e={context:ctx,decks:[d],master:{gain:{value:1}}}; const entries=[]; const h=new PlaybackHistory(e,{recordPlay:async(...args)=>entries.push(args)});
    const step=(seconds=1)=>{ctx.currentTime+=seconds;h.tick();};
    h.tick(); d.cuePreview=true; for(let i=0;i<20;i++)step(); const preview=h.states.get(0).seconds;
    d.cuePreview=false; step(60); const gap=h.states.get(0).seconds;
    e.master.gain.value=0;for(let i=0;i<20;i++)step();const silence=h.states.get(0).seconds;
    e.master.gain.value=1;for(let i=0;i<17;i++)step();await new Promise(r=>setTimeout(r,0)); const first=entries.length;
    d.playing=false;step();d.playing=true;for(let i=0;i<20;i++)step();await new Promise(r=>setTimeout(r,0));const resumed=entries.length;
    d.loadVersion++;step();for(let i=0;i<16;i++)step();await new Promise(r=>setTimeout(r,0));return{preview,gap,silence,first,resumed,reloaded:entries.length};
  });
  expect(result).toEqual({preview:0,gap:0,silence:0,first:1,resumed:1,reloaded:2});
});
