import { setting, settingsBatch } from './storage.js';
import { sampleConfig, samplerSettings, isSampleHold, visibleSampleIndices, samplerPageCount } from './sampler.js';
import { exportSamplePack, exportDjucedSamplePack, djucedPackBpm, importSamplePack, importDjucedSamplePack, importDjucedArchive, migrateLegacySlots } from './sample-pack.js';
import { checkImportCancelled, abortable } from './djz.js';
import { encodeWav } from './wav.js';
import './sampler.css';
const $=(s,root=document)=>root.querySelector(s),$$=(s,root=document)=>[...root.querySelectorAll(s)];
export function setupSampler({engine,toast}) {
  const sampler=engine.sampler;let loading=true,busy=false,target={index:0,deck:0},editing=null,globalWrites=Promise.resolve(),globalPending=0;
  const key=(i,d=sampler.activeDeck)=>'sampler:v4:deck:'+d+':slot:'+i,globalKey=(d=sampler.activeDeck)=>'sampler:v4:deck:'+d+':settings';
  const modes=[['loop','重触发循环'],['oneshot','重触发单次'],['hold','按住循环'],['hold-oneshot','按住单次'],['toggle-loop','开关循环'],['toggle-oneshot','开关单次']];
  const options=modes.map(([v,n])=>'<option value="'+v+'">'+n+'</option>').join('');
  const slots=Array.from({length:16},(_,i)=>'<div class="sample-slot" data-sample="'+i+'"><button class="sample-trigger" aria-label="播放采样 '+(i+1)+'"><span>组 '+(Math.floor(i/4)+1)+' · 样本 '+(i%4+1)+'</span><strong></strong><small></small></button><div class="sample-actions"><button class="sample-load" aria-label="载入采样 '+(i+1)+'">载入</button><button class="sample-stop" aria-label="停止采样 '+(i+1)+'">停止</button><button class="sample-edit" aria-label="编辑采样 '+(i+1)+'">编辑</button></div><select class="sample-mode" aria-label="采样 '+(i+1)+' 模式">'+options+'</select></div>').join('');
  const decks=[0,1,2,3].map(i=>'<option value="'+i+'">'+'ABCD'[i]+' 台</option>').join('');
  const groups=[0,1,2,3].map(g=>'<label>组 '+(g+1)+' 音量<input class="sample-group-volume" type="range" min="0" max="100" value="100" aria-label="组 '+(g+1)+' 音量"/><button class="sample-group-play" type="button">播放 / 停止</button></label>').join('');
  $('#library').insertAdjacentHTML('beforebegin','<section class="sampler-panel" aria-label="分组采样器"><div class="sampler-heading"><div><span class="eyebrow">SAMPLER</span><h2>分组采样器</h2></div><label>采样台<select id="sampler-deck" aria-label="采样台">'+decks+'</select></label><label>显示<select id="sampler-display" aria-label="采样器显示槽位"><option value="3">3 页</option><option value="4">4 槽</option><option value="8" selected>8 槽</option><option value="16">16 槽</option></select></label><label>音量<input id="sampler-volume" type="range" min="0" max="100" value="65" aria-label="采样器音量"/></label><button id="sampler-stop">全部停止</button></div><div class="sampler-tools"><label>新载入模式<select id="sampler-default-mode" aria-label="新载入采样默认模式">'+options+'</select></label><label><input id="sampler-quantize" type="checkbox"/>按拍触发</label><label>来源<select id="sampler-target" aria-label="采样量化来源">'+decks+'</select></label><label>间隔<select id="sampler-beats" aria-label="采样量化间隔">'+[.25,.5,1,2,4,8,16,32].map(n=>'<option value="'+n+'">'+n+' 拍</option>').join('')+'</select></label><button id="sample-pack-export">导出采样包</button><button id="sample-pack-import">导入采样包</button><button id="sample-djs-import">导入 DJUCED 采样包</button></div><div class="sampler-groups">'+groups+'</div><div class="sampler-pagination"><button type="button" id="sampler-prev" aria-label="上一页采样">←</button><output id="sampler-page" aria-live="polite"></output><button type="button" id="sampler-next" aria-label="下一页采样">→</button></div><div class="sample-pads">'+slots+'</div><p id="sampler-status" role="status">正在恢复本机采样…</p><p>每台四组，每组四个可选样本；同组切换、不同组可同时播放。最长 30 秒 / 30 MB，自动保存。DJUCED 包导入当前采样台：单选 .djz，或同时选择 .djs 和对应音频。</p><input id="sample-file" type="file" accept="audio/*,.wav,.mp3,.flac" hidden/><input id="sample-pack-file" type="file" accept=".mxpack" hidden/><input id="sample-djs-file" type="file" accept=".djz,.djs,audio/*,.wav,.mp3,.flac" multiple hidden/></section>');
  document.body.insertAdjacentHTML('beforeend','<dialog id="sample-dialog"><form><div class="dialog-heading"><h2 id="sample-dialog-title">编辑采样</h2><button type="button" id="sample-edit-close" class="icon-button" aria-label="关闭采样编辑">×</button></div><div class="sample-edit-fields"><label class="sample-name-field">名称<input id="sample-name" maxlength="100" required aria-label="采样名称"/></label><label>入点（秒）<input id="sample-start" type="number" min="0" step="any" required aria-label="采样入点"/></label><label>出点（秒）<input id="sample-end" type="number" min="0.001" step="any" required aria-label="采样出点"/></label><label>音量（%）<input id="sample-gain" type="number" min="0" max="200" step="1" required aria-label="采样音量"/></label><label>原始 BPM<input id="sample-bpm" type="number" min="30" max="300" step="0.1" aria-label="采样原始 BPM"/></label></div><label class="sample-sync-label"><input id="sample-sync" type="checkbox"/>触发时匹配来源台速度（变速变调）</label><label class="sample-sync-label"><input id="sample-key-lock" type="checkbox"/>速度匹配时保持采样音高（Key Lock）</label><p>播放区间与循环使用相同入点/出点。BPM 可留空；速度匹配限 0.5–2 倍。Key Lock 需要浏览器音频工作线程支持。</p><p id="sample-edit-error" role="alert"></p><div class="dialog-actions"><button type="button" id="sample-reset">恢复合成采样</button><button id="sample-save" class="primary-button">保存采样</button></div></form></dialog>');
  const status=message=>{$('#sampler-status').textContent=message;};
  let importController=null;
  $('#sampler-status').insertAdjacentHTML('afterend','<button id="sample-import-cancel" type="button" hidden>取消导入</button>');
  $('#sample-import-cancel').onclick=()=>importController?.abort();
  $('#sample-djs-import').insertAdjacentHTML('beforebegin','<button id="sample-djz-export">导出 DJUCED 包</button>');
  document.body.insertAdjacentHTML('beforeend','<dialog id="sample-export-dialog"><form><div class="dialog-heading"><h2 id="sample-export-title">导出 DJUCED 采样包</h2><button type="button" id="sample-export-close" class="icon-button" aria-label="关闭采样包导出">×</button></div><div class="sample-edit-fields"><label class="sample-name-field">采样包名称<input id="sample-export-name" maxlength="100" required/></label><label>采样包 BPM<input id="sample-export-bpm" type="number" min="30" max="300" step="any" required/></label></div><p>仅导出当前采样台的四组样本，保留空位、六种模式、BPM 和量化设置。音频按入点/出点裁剪并应用样本音量，转为 16 位 WAV。</p><p>组音量、采样台总音量、速度匹配、Key Lock、分页和输出路由不包含在 DJUCED 包中。保存完整工作台设置请使用“导出采样包”（.mxpack）。</p><p>已验证 DJUCED 6.6.1 载入；完整工作台备份请同时保存 .mxpack。</p><p id="sample-export-status" role="status"></p><div class="dialog-actions"><button type="button" id="sample-export-cancel">取消</button><button id="sample-export-submit" class="primary-button">导出 .djz</button></div></form></dialog>');
  let exportController=null,exportDeck=0;
  const download=(blob,name)=>{const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);};
  const cancelExport=()=>{exportController?.abort();$('#sample-export-dialog').close();};
  $('#sample-export-close').onclick=$('#sample-export-cancel').onclick=cancelExport;
  $('#sample-export-dialog').addEventListener('cancel',()=>exportController?.abort());
  $('#sample-djz-export').onclick=()=>{exportDeck=sampler.activeDeck;$('#sample-export-title').textContent='导出 '+'ABCD'[exportDeck]+' 台 · DJUCED 采样包';$('#sample-export-name').value='MIXDESK '+'ABCD'[exportDeck];$('#sample-export-bpm').value=djucedPackBpm(sampler,exportDeck);$('#sample-export-status').textContent='';$('#sample-export-dialog').showModal();};
  $('#sample-export-dialog form').onsubmit=async event=>{
    event.preventDefault();if(loading||busy)return;
    busy=true;exportController=new AbortController();render();$('#sample-export-submit').disabled=$('#sample-export-name').disabled=$('#sample-export-bpm').disabled=true;
    $('#sample-export-status').textContent='正在裁剪音频并打包…';
    try{
      const title=$('#sample-export-name').value;
      const result=await exportDjucedSamplePack(sampler,{deck:exportDeck,title,bpm:Number($('#sample-export-bpm').value),signal:exportController.signal});
      download(result.blob,(title.trim().replace(/[<>:"/\\|?*\u0000-\u001f]/g,'_')||'MIXDESK')+'.djz');
      const message='已导出 '+'ABCD'[exportDeck]+' 台 · '+result.sampleCount+' 个样本'+(result.clippedSamples?'；'+result.clippedSamples+' 个超限采样值被削波，请降低样本音量后重试':'');
      status(message);$('#sample-export-status').textContent=message;
    }catch(error){const message=error.name==='AbortError'?'已取消导出':error.message;status(message);$('#sample-export-status').textContent=message;}
    finally{busy=false;exportController=null;$('#sample-export-submit').disabled=$('#sample-export-name').disabled=$('#sample-export-bpm').disabled=false;render();}
  };
  function render(){
    const visible=visibleSampleIndices(sampler.settings);
    $$('.sample-slot').forEach((root,i)=>{
      const slot=sampler.slots[i],active=sampler.isActive(i);root.hidden=!visible.includes(i);
      $('.sample-trigger',root).classList.toggle('active',active);$('.sample-trigger strong',root).textContent=slot.name;
      $('.sample-trigger small',root).textContent=slot.pending?'等待拍点':active?'正在播放':!slot.buffer?'请选择音频':isSampleHold(slot.mode)?'按住播放 · 松开停止':slot.mode.startsWith('toggle')?'点击播放 · 再点停止':'点击重触发';
      $('.sample-mode',root).value=slot.mode;$('.sample-mode',root).disabled=loading||busy||!slot.buffer;$('.sample-edit',root).disabled=loading||busy||!slot.buffer;$('.sample-trigger',root).disabled=loading||busy||!slot.buffer;$('.sample-load',root).disabled=loading||busy;
    });
    const {display,page}=sampler.settings,pages=samplerPageCount(sampler.settings);$('.sample-pads').style.setProperty('--sampler-columns',String(Math.min(visible.length,8)));
    $('#sampler-page').textContent=(page+1)+' / '+pages;$('#sampler-prev').disabled=loading||busy||page===0;$('#sampler-next').disabled=loading||busy||page===pages-1;
    for(const selector of ['#sampler-deck','#sampler-default-mode','#sampler-display','#sampler-volume','#sampler-quantize','#sampler-target','#sampler-beats','#sample-pack-import','#sample-pack-export','#sample-djs-import','#sample-djz-export','.sample-group-volume','.sample-group-play'])$$(selector).forEach(el=>el.disabled=loading||busy);
    $('#sample-save').disabled=$('#sample-reset').disabled=loading||busy;$('#sample-key-lock').disabled=loading||busy||!engine.pitchAvailable;
  }
  function showSettings(){const s=sampler.settings;$('#sampler-default-mode').value=s.defaultMode;$('#sampler-deck').value=String(sampler.activeDeck);$('#sampler-volume').value=s.volume*100;$('#sampler-quantize').checked=s.quantize;$('#sampler-target').value=s.target;$('#sampler-beats').value=s.beats;$('#sampler-display').value=s.display;$$('.sample-group-volume').forEach((el,i)=>el.value=s.groupVolumes[i]*100);}
  async function run(action,propagate=false){if(loading||busy){if(propagate)throw new Error('采样器正在保存，请稍后再试');return;}busy=true;render();status('正在保存…');try{await action();status('采样已保存到本机');}catch(error){status(error.message||'采样保存失败');if(error.name!=='AbortError')toast(error.message||'采样保存失败');if(propagate)throw error;}finally{busy=false;render();}}
  function serialRecord(record){return record.empty?{empty:true}:{file:record.file,config:record.config};}
  async function applyPacks(packs,extra=[]){
    const prepared=packs.map(pack=>sampler.prepareReplacement(pack));
    const entries=packs.flatMap(pack=>[...pack.slots.map((s,i)=>[key(i,pack.deck),serialRecord(s)]),[globalKey(pack.deck),pack.settings]]);
    await settingsBatch([...entries,...extra,['sampler:v4:initialized',true]],()=>{
      const stages=[];try{for(const p of prepared)stages.push(sampler.stageReplacement(p));}catch(error){stages.reverse().forEach(s=>s.rollback());throw error;}
      return {commit:()=>stages.forEach(s=>s.commit()),rollback:()=>stages.reverse().forEach(s=>s.rollback())};
    });showSettings();
  }
  const press=(i,k,deck=sampler.activeDeck)=>{if(!loading&&!busy)return sampler.press(i,k,deck).catch(error=>toast(error.message||'采样播放失败'));};
  const pressGroup=(group,k,deck=sampler.activeDeck)=>{if(!loading&&!busy)return sampler.pressGroup(group,k,deck).catch(error=>toast(error.message||'采样播放失败'));};
  const releaseGroup=(group,k,deck=sampler.activeDeck)=>sampler.releaseGroup(group,k,deck);
  $$('.sample-slot').forEach((root,index)=>{
    const button=$('.sample-trigger',root);
    button.onclick=()=>{if(!isSampleHold(sampler.triggerMode(index)))void press(index,'click');};
    button.onpointerdown=event=>{if(event.button!==0||!isSampleHold(sampler.triggerMode(index))||loading||busy)return;event.preventDefault();button.setPointerCapture(event.pointerId);void press(index,'pointer:'+event.pointerId);};
    const release=event=>sampler.releasePrefix('pointer:'+event.pointerId);button.onpointerup=release;button.onpointercancel=release;button.onlostpointercapture=release;
    button.onkeydown=event=>{if(!['Space','Enter'].includes(event.code)||!isSampleHold(sampler.triggerMode(index)))return;event.preventDefault();event.stopPropagation();if(!event.repeat)void press(index,'key:'+event.code);};
    button.onkeyup=event=>{if(!['Space','Enter'].includes(event.code))return;event.preventDefault();event.stopPropagation();sampler.releasePrefix('key:'+event.code);};
    $('.sample-stop',root).onclick=()=>sampler.stop(index);
    $('.sample-load',root).onclick=()=>{target={index,deck:sampler.activeDeck};$('#sample-file').click();};
    $('.sample-edit',root).onclick=()=>openEditor(index);
    $('.sample-mode',root).onchange=event=>{const mode=event.target.value,deck=sampler.activeDeck;void run(async()=>{const record=sampler.record(index,deck);record.config.mode=mode;await setting(key(index,deck),record);sampler.configure(index,{mode},deck);});};
  });
  async function saveBuffer(index,buffer,name,file,config,deck){await setting(key(index,deck),{file,config});sampler.load(index,buffer,name,file,config,deck);}
  async function loadBuffer(index,buffer,name='Sample '+(index+1),options={}){
    const deck=options.deck??sampler.activeDeck;if(!Number.isInteger(index)||index<0||index>=16||!buffer||buffer.duration<=0||buffer.duration>30)throw new Error('采样槽位或音频无效');
    return run(async()=>{const file=new File([encodeWav(buffer)],name.replace(/[\\/:*?"<>|]+/g,' ').slice(0,80)+'.wav',{type:'audio/wav'});const config=sampleConfig({name,mode:options.mode||'loop',bpm:options.bpm??null,sync:!!options.sync,keyLock:!!options.keyLock},buffer.duration);await saveBuffer(index,buffer,name,file,config,deck);},true);
  }
  $('#sample-file').onchange=async event=>{const file=event.target.files[0],{index,deck}=target;event.target.value='';if(!file)return;await run(async()=>{if(file.size>30*1024**2)throw new Error('采样文件请小于 30 MB');let buffer;try{buffer=await engine.decode(file);}catch{throw new Error('采样无法解码，请选择 WAV 或 MP3');}if(buffer.duration>30)throw new Error('请选择不超过 30 秒的采样');const config=sampleConfig({mode:sampler.decks[deck].settings.defaultMode,name:file.name.replace(/\.[^.]+$/,'')},buffer.duration);await saveBuffer(index,buffer,config.name,file,config,deck);});};
  function openEditor(index){const slot=sampler.slots[index];if(!slot.buffer)return;editing={index,deck:sampler.activeDeck};$('#sample-dialog-title').textContent='编辑 '+'ABCD'[editing.deck]+' 台 · 组 '+(Math.floor(index/4)+1)+' · 样本 '+(index%4+1);$('#sample-reset').textContent='清空样本';$('#sample-name').value=slot.name;$('#sample-start').value=slot.start;$('#sample-end').value=slot.end;$('#sample-start').max=$('#sample-end').max=slot.buffer.duration;$('#sample-gain').value=slot.gain*100;$('#sample-bpm').value=slot.bpm??'';$('#sample-sync').checked=slot.sync;$('#sample-key-lock').checked=slot.keyLock;$('#sample-edit-error').textContent='';$('#sample-dialog').showModal();}
  $('#sample-edit-close').onclick=()=>$('#sample-dialog').close();
  $('#sample-dialog form').onsubmit=async event=>{event.preventDefault();if(busy||loading)return;busy=true;render();try{const {index,deck}=editing,slot=sampler.decks[deck].slots[index],config=sampleConfig({...slot,name:$('#sample-name').value,start:Number($('#sample-start').value),end:Number($('#sample-end').value),gain:Number($('#sample-gain').value)/100,bpm:$('#sample-bpm').value,sync:$('#sample-sync').checked,keyLock:$('#sample-key-lock').checked},slot.buffer.duration);await setting(key(index,deck),{file:slot.file,config});sampler.configure(index,config,deck);status('采样已保存到本机');$('#sample-dialog').close();}catch(error){$('#sample-edit-error').textContent=error.message;}finally{busy=false;render();}};
  $('#sample-reset').onclick=()=>void run(async()=>{const {index,deck}=editing;await setting(key(index,deck),{empty:true});sampler.decks[deck].reset(index);$('#sample-dialog').close();});
  function persistSettings(deck=sampler.activeDeck){const snapshot=samplerSettings(sampler.decks[deck].settings);globalPending++;status('正在保存…');globalWrites=globalWrites.catch(()=>{}).then(()=>setting(globalKey(deck),snapshot)).then(()=>{if(globalPending===1)status('采样设置已保存到本机');}).catch(()=>status('采样设置保存失败，本次会话仍可使用')).finally(()=>globalPending--);}
  function globalChanged(){const display=Number($('#sampler-display').value),pages=display===3?3:16/display;sampler.configureGlobal({defaultMode:$('#sampler-default-mode').value,volume:Number($('#sampler-volume').value)/100,quantize:$('#sampler-quantize').checked,target:Number($('#sampler-target').value),beats:Number($('#sampler-beats').value),display,page:Math.min(sampler.settings.page,pages-1),groupVolumes:$$('.sample-group-volume').map(el=>Number(el.value)/100)});persistSettings();}
  async function changePage(delta,{wrap=false,deck=sampler.activeDeck}={}){if(loading||busy)return;const bank=sampler.decks[deck],pages=samplerPageCount(bank.settings);let page=bank.settings.page+delta;if(wrap)page=(page%pages+pages)%pages;if(page<0||page>=pages)return;busy=true;render();try{await globalWrites;await setting(globalKey(deck),{...bank.settings,page});bank.configureGlobal({page});status('采样设置已保存到本机');}catch(error){status(error.message);}finally{busy=false;render();}}
  $('#sampler-prev').onclick=()=>void changePage(-1);$('#sampler-next').onclick=()=>void changePage(1);
  $('#sampler-default-mode').onchange=globalChanged;$('#sampler-display').onchange=globalChanged;$('#sampler-volume').oninput=globalChanged;$('#sampler-quantize').onchange=$('#sampler-target').onchange=$('#sampler-beats').onchange=globalChanged;$$('.sample-group-volume').forEach(el=>el.oninput=globalChanged);
  $$('.sample-group-play').forEach((el,i)=>el.onclick=()=>void sampler.playGroup(i)?.catch(error=>toast(error.message)));
  $('#sampler-deck').onchange=event=>{sampler.releasePrefix('pointer:');sampler.releasePrefix('key:');sampler.selectDeck(Number(event.target.value));showSettings();};
  $('#sampler-stop').onclick=()=>sampler.stopAll();
  $('#sample-pack-export').onclick=()=>{try{const url=URL.createObjectURL(exportSamplePack(sampler)),a=document.createElement('a');a.href=url;a.download='MIXDESK-samples.mxpack';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);status('四台采样包已导出');}catch(error){status(error.message);}};
  $('#sample-pack-import').onclick=()=>$('#sample-pack-file').click();$('#sample-djs-import').onclick=()=>$('#sample-djs-file').click();
  $('#sample-pack-file').onchange=async event=>{const file=event.target.files[0];event.target.value='';if(!file)return;await run(async()=>{const pack=await importSamplePack(file,engine);await globalWrites;await applyPacks(pack.decks.map((d,deck)=>({...d,deck})),pack.migrated?[['sampler:v4:legacy-package',file]]:[]);});};
  $('#sample-djs-file').onchange=async event=>{
    const files=[...event.target.files],deck=sampler.activeDeck;event.target.value='';if(!files.length)return;
    await run(async()=>{
      const archives=files.filter(file=>/\.djz$/i.test(file.name));
      if(archives.length&&files.length!==1)throw new Error('请单独选择一个 .djz 采样包');
      importController=new AbortController();const signal=importController.signal,cancel=$('#sample-import-cancel');
      cancel.hidden=false;cancel.disabled=false;
      try{
        const options={deck,signal,onProgress:status};
        const pack=archives.length?await importDjucedArchive(archives[0],engine,options):await importDjucedSamplePack(files,engine,options);
        await abortable(globalWrites,signal);checkImportCancelled(signal);
        cancel.disabled=true;status('正在保存采样包…');
        await applyPacks([pack]);
      }finally{importController=null;cancel.hidden=true;cancel.disabled=false;}
    });
  };
  sampler.onchange=render;engine.pitchReady?.then(render);
  async function decodeRecord(record,index){if(record.empty)return record;const buffer=record.file?await engine.decode(record.file):sampler.defaultBuffer(index);if(!buffer||buffer.duration>30)throw new Error('缓存音频无效');return {...record,buffer};}
  const ready=(async()=>{const problems=[];try{
    if(!await setting('sampler:v4:initialized')){
      const old=await Promise.all(Array.from({length:16},(_,i)=>setting('sampler:slot:'+i))),global=await setting('sampler:global');
      if(global||old.some(Boolean)){
        const records=[];for(let i=0;i<16;i++){const record=old[i]||{file:null,config:sampler.defaultConfig(i)};const primary=await decodeRecord(record,i),layers=[];for(const layer of record.layers||[])layers.push(layer?await decodeRecord(layer,i):null);records.push({...primary,layers});}
        const migrated=migrateLegacySlots(records,samplerSettings(global||{}),engine);await applyPacks(migrated.decks.map((d,deck)=>({...d,deck})),[['sampler:v4:legacy-backup',{slots:old,settings:global}]]);
      }else await applyPacks(sampler.decks.map((bank,deck)=>({deck,settings:bank.settings,slots:bank.slots.map((_,i)=>bank.record(i))})));
    }else{
      // Read the four banks concurrently. The previous nested sequence did
      // up to 68 IndexedDB round trips before clearing the loading state,
      // which made a reload appear frozen on slower browsers.
      await Promise.all(Array.from({length:4}, async (_,deck)=>{
        const bank=sampler.decks[deck];
        try { const saved=await setting(globalKey(deck)); if(saved) bank.configureGlobal(saved); }
        catch { problems.push('ABCD'[deck]+' 台设置'); }
        const records=await Promise.all(Array.from({length:16},(_,i)=>setting(key(i,deck)).then(record=>({i,record})).catch(()=>({i,error:true}))));
        await Promise.all(records.map(async ({i,record,error})=>{
          if(error){problems.push('ABCD'[deck]+'-'+(i+1));return;}
          if(!record)return;
          try { bank.slots[i]=bank.prepareSlot(i,await decodeRecord(record,i)); }
          catch { problems.push('ABCD'[deck]+'-'+(i+1)); }
        }));
      }));
    }
  }catch(error){problems.push(error.message||'旧数据迁移未完成');}
    loading=false;showSettings();render();status(problems.length?'部分缓存无法恢复，旧数据保留：'+problems.join('、'):'采样已就绪 · 自动保存到本机');
  })();
  const releaseHolds=()=>{sampler.releasePrefix('pointer:');sampler.releasePrefix('key:');};window.addEventListener('blur',releaseHolds);document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseHolds();});document.addEventListener('keyup',event=>{if(['Space','Enter'].includes(event.code))sampler.releasePrefix('key:'+event.code);});
  const timer=setInterval(()=>{if(!document.hidden)render();},100);window.addEventListener('pagehide',()=>{clearInterval(timer);sampler.stopAll();});
  render();return {ready,press,release:(i,key,deck=sampler.activeDeck)=>sampler.release(i,key,deck),pressGroup,releaseGroup,nextPage:()=>changePage(1),cycleNextPage:(deck=sampler.activeDeck)=>changePage(1,{wrap:true,deck}),loadBuffer,get loading(){return loading;}};
}
