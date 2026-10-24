import {chromium} from 'playwright';import assert from 'node:assert/strict';import {readFile} from 'node:fs/promises';
const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true,args:['--autoplay-policy=no-user-gesture-required']});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1080}}),errors=[],remote=[];
 page.on('pageerror',error=>errors.push(error.message));page.on('request',r=>{if(/^https?:/.test(r.url())&&!r.url().startsWith('http://127.0.0.1:4173'))remote.push(r.url());});
 await page.goto('http://127.0.0.1:4173/');await page.locator('#track-count').filter({hasText:'2 首'}).waitFor();
 await page.locator('#record-settings').click();await page.locator('#record-format').selectOption('wav24');await page.locator('#record-close').click();
 await page.getByRole('button',{name:'播放 A',exact:true}).click();await page.locator('#record').click();await page.locator('#record.recording').waitFor();await page.waitForTimeout(1200);
 const pending=page.waitForEvent('download');await page.locator('#record').click();const file=await pending,bytes=await readFile(await file.path());
 assert.equal(bytes.toString('ascii',0,4),'RIFF');assert.equal(bytes.readUInt16LE(34),24);assert.equal(bytes.readUInt32LE(40),bytes.length-44);assert.ok(bytes.length>100000);
 let energy=0;for(let i=44;i<bytes.length;i+=3)energy+=(bytes.readIntLE(i,3)/8388608)**2;const rms=Math.sqrt(energy/((bytes.length-44)/3));assert.ok(rms>.005);
 await page.getByRole('button',{name:'暂停 A',exact:true}).click();await page.reload();await page.locator('#record-settings').click();await page.locator('#recording-list article').waitFor();
 assert.match(await page.locator('#recording-list').innerText(),/已完成/);await page.waitForTimeout(300);
 await page.screenshot({path:'screenshots/mixdesk-recording-v0.6.png'});
 await page.setViewportSize({width:390,height:844});assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));assert.ok(await page.locator('#record-dialog').evaluate(d=>d.scrollWidth<=d.clientWidth));await page.screenshot({path:'screenshots/mixdesk-recording-mobile-v0.6.png'});
 assert.equal(await page.evaluate(()=>typeof window.__mixdesk),'undefined');assert.deepEqual(errors,[]);assert.deepEqual(remote,[]);
 console.log(JSON.stringify({production:true,bitDepth:24,bytes:bytes.length,rms,persistent:true,mobileOverflow:false,errors,remoteRequests:remote,devDiagnostics:false}));
}finally{await browser.close();}
