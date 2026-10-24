import { chromium } from 'playwright';
import assert from 'node:assert/strict';
import { taggedWav } from '../tests/fixtures/audio.js';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
try {
  const page=await browser.newPage({viewport:{width:1440,height:1080}}),errors=[],remote=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith('http://127.0.0.1:4173'))remote.push(r.url());});
  await page.goto('http://127.0.0.1:4173/');await page.locator('#track-count').filter({hasText:'2 首'}).waitFor();
  assert.equal(await page.evaluate(()=>typeof window.__mixdesk),'undefined');
  await page.locator('#file-input').setInputFiles({name:'library-smoke.wav',mimeType:'audio/wav',buffer:taggedWav()});
  await page.locator('#track-count').filter({hasText:'3 首'}).waitFor();
  await page.getByRole('button',{name:'将 Tagged Night 载入 A 台'}).click();
  await page.getByRole('button',{name:'播放 A',exact:true}).click();await page.waitForTimeout(500);await page.getByRole('button',{name:'暂停 A',exact:true}).click();
  await page.locator('#playlist-new').click();await page.locator('#playlist-name').fill('Warm-up · 本地歌单');await page.locator('#playlist-save').click();
  await page.locator('[data-collection="all"]').click();await page.locator('#library-select-all').check();await page.locator('#playlist-target').selectOption({label:'Warm-up · 本地歌单'});await page.locator('#playlist-add').click();
  await page.locator('.collection-tabs button').filter({hasText:'Warm-up'}).click();assert.equal(await page.locator('#track-list tr[data-track]').count(),3);
  await page.locator('#library').screenshot({path:'screenshots/mixdesk-library-v0.5.png'});
  await page.getByRole('button',{name:'编辑 Tagged Night',exact:true}).click();await page.screenshot({path:'screenshots/mixdesk-metadata-v0.5.png'});await page.locator('#metadata-close').click();
  await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));await page.locator('#library').scrollIntoViewIfNeeded();await page.screenshot({path:'screenshots/mixdesk-library-mobile-v0.5.png'});
  await page.reload();await page.locator('.collection-tabs button').filter({hasText:'Warm-up'}).click();assert.equal(await page.locator('#track-list tr[data-track]').count(),3);
  assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);
  console.log(JSON.stringify({production:true,tags:true,playback:true,playlistPersistence:true,mobileOverflow:false,errors,remoteRequests:remote,devDiagnostics:false}));
} finally {await browser.close();}
