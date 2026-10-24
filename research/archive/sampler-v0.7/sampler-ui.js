import { setting, settingsBatch } from './storage.js';
import { sampleConfig } from './sampler.js';
import { exportSamplePack, importSamplePack, importDjucedSamplePack } from './sample-pack.js';
import { encodeWav } from './wav.js';
import './sampler.css';
const $=(s,root=document)=>root.querySelector(s),$$=(s,root=document)=>[...root.querySelectorAll(s)];
export function setupSampler({engine,toast}) {
  const sampler=engine.sampler;let loading=true,busy=false,target={index:0,layerIndex:0},editing=null,globalWrites=Promise.resolve(),globalPending=0;
  const key=index=>'sampler:slot:'+index;
  const slots=sampler.slots.map((slot,i)=>'<div class="sample-slot" data-sample="'+i+'"><button class="sample-trigger" aria-label="播放采样 '+(i+1)+'"><span>'+('ABCD'[Math.floor(i/4)])+' · 0'+(i%4+1)+'</span><strong></strong><small></small></button><div class="sample-actions"><button class="sample-load" aria-label="载入采样 '+(i+1)+'">载入</button><button class="sample-stop" aria-label="停止采样 '+(i+1)+'">停止</button><button class="sample-edit" aria-label="编辑采样 '+(i+1)+'">编辑</button></div><label class="sample-layer-label">层 <select class="sample-layer" aria-label="采样 '+(i+1)+' 当前层"><option value="0">1</option><option value="1">2</option><option value="2">3</option><option value="3">4</option></select></label><select class="sample-mode" aria-label="采样 '+(i+1)+' 模式"><option value="oneshot">单次触发</option><option value="loop">循环开关</option><option value="hold">按住循环</option></select></div>').join('');
  $('#library').insertAdjacentHTML('beforebegin','<section class="sampler-panel" aria-label="十六槽采样器"><div class="sampler-heading"><div><span class="eyebrow">SAMPLER</span><h2>多层采样器</h2></div><label>显示 <select id="sampler-display" aria-label="采样器显示槽位"><option value="4">4 槽</option><option value="8" selected>8 槽</option><option value="16">16 槽</option></select></label><label>音量 <input id="sampler-volume" type="range" min="0" max="100" value="65" aria-label="采样器音量"/></label><button id="sampler-stop">全部停止</button></div><div class="sampler-tools"><label><input id="sampler-quantize" type="checkbox"/>按拍触发</label><label>来源<select id="sampler-target" aria-label="采样量化来源">'+[0,1,2,3].map(i=>'<option value="'+i+'">'+'ABCD'[i]+' 台</option>').join('')+'</select></label><label>间隔<select id="sampler-beats" aria-label="采样量化间隔">'+[.25,.5,1,2,4,8,16,32].map(n=>'<option value="'+n+'">'+(n<1?'1/'+(1/n):n)+' 拍</option>').join('')+'</select></label><button id="sample-pack-export">导出采样包</button><button id="sample-pack-import">导入采样包</button><button id="sample-djs-import">导入 DJUCED 采样包</button></div><div class="sampler-pagination"><button type="button" id="sampler-prev" aria-label="上一页采样">←</button><output id="sampler-page" aria-live="polite"></output><button type="button" id="sampler-next" aria-label="下一页采样">→</button></div><div class="sample-pads">'+slots+'</div><p id="sampler-status" role="status">正在恢复本机采样…</p><p>最长 30 秒 / 30 MB · 自动保存到本机 · 量化支持 ¼–32 拍，来源未播放时立即触发；速度匹配可启用采样 Key Lock。导出为 MIXDESK .mxpack；导入 DJUCED 包时，请同时选择 .djs 和对应音频文件。</p><input id="sample-file" type="file" accept="audio/*,.wav,.mp3,.flac" hidden/><input id="sample-pack-file" type="file" accept=".mxpack" hidden/><input id="sample-djs-file" type="file" accept=".djs,audio/*,.wav,.mp3,.flac" multiple hidden/></section>');
  document.body.insertAdjacentHTML('beforeend','<dialog id="sample-dialog"><form><div class="dialog-heading"><h2 id="sample-dialog-title">编辑采样</h2><button type="button" id="sample-edit-close" class="icon-button" aria-label="关闭采样编辑">×</button></div><div class="sample-edit-fields"><label class="sample-name-field">名称<input id="sample-name" maxlength="100" required aria-label="采样名称"/></label><label>入点（秒）<input id="sample-start" type="number" min="0" step="any" required aria-label="采样入点"/></label><label>出点（秒）<input id="sample-end" type="number" min="0.001" step="any" required aria-label="采样出点"/></label><label>音量（%）<input id="sample-gain" type="number" min="0" max="200" step="1" required aria-label="采样音量"/></label><label>原始 BPM<input id="sample-bpm" type="number" min="30" max="300" step="0.1" aria-label="采样原始 BPM"/></label></div><label class="sample-sync-label"><input id="sample-sync" type="checkbox"/>触发时匹配来源台速度（变速变调）</label><label class="sample-sync-label"><input id="sample-key-lock" type="checkbox"/>速度匹配时保持采样音高（Key Lock）</label><p>播放区间与循环使用相同入点/出点。BPM 可留空；速度匹配限 0.5–2 倍。Key Lock 需要浏览器音频工作线程支持。</p><p id="sample-edit-error" role="alert"></p><div class="dialog-actions"><button type="button" id="sample-reset">恢复合成采样</button><button id="sample-save" class="primary-button">保存采样</button></div></form></dialog>');
  const status=message=>{$('#sampler-status').textContent=message;};
  function render() {
    $$('.sample-slot').forEach((root,i)=>{
      const slot=sampler.slots[i],layer=sampler.layer(i,Number($('.sample-layer',root)?.value||0)),active=sampler.layers(i).filter(item=>item.source),scheduled=active.some(item=>item.startedAt>engine.context.currentTime);
      $('.sample-trigger',root).classList.toggle('active',active.length>0);$('.sample-trigger strong',root).textContent=layer?.name||'空采样层';
      $('.sample-trigger small',root).textContent=slot.pending||scheduled?'等待拍点':active.length?`正在播放 · ${active.length} 层`:sampler.triggerMode(i)==='hold'?'按住播放 · 松开停止':sampler.triggerMode(i)==='loop'?'点击循环 · 再点停止':'点击触发';
      $('.sample-mode',root).value=layer?.mode||'oneshot';
      $('.sample-mode',root).dataset.empty=String(!layer);
    });
    const display = sampler.settings.display || 8,page=sampler.settings.page||0,pages=Math.ceil(sampler.slots.length/display);
    $('.sample-pads').style.setProperty('--sampler-columns',String(Math.min(display,8)));
    $$('.sample-slot').forEach((slot,i)=>slot.hidden=i<page*display||i>=(page+1)*display);
    $('#sampler-display').value=String(display);$('#sampler-page').textContent=`${page+1} / ${pages}`;$('#sampler-prev').disabled=loading||busy||page===0;$('#sampler-next').disabled=loading||busy||page>=pages-1;
    for(const selector of ['.sample-trigger','.sample-load','.sample-edit','.sample-mode','.sample-layer','#sample-pack-import','#sample-pack-export','#sample-djs-import','#sampler-volume','#sampler-quantize','#sampler-target','#sampler-beats','#sampler-display'])$$(selector,$('.sampler-panel')).forEach(el=>el.disabled=loading||busy);
    $$('.sample-mode[data-empty="true"]').forEach(el=>el.disabled=true);
    $('#sample-save').disabled=$('#sample-reset').disabled=loading||busy;
    const keyLock=$('#sample-key-lock'); if(keyLock) keyLock.disabled=loading||busy||!sampler.engine.pitchAvailable;
  }
  function showSettings() {$('#sampler-volume').value=Math.round(sampler.settings.volume*100);$('#sampler-quantize').checked=sampler.settings.quantize;$('#sampler-target').value=sampler.settings.target;$('#sampler-beats').value=sampler.settings.beats;$('#sampler-display').value=sampler.settings.display||8;}
  async function run(action) {
    if(loading||busy)return;busy=true;render();status('正在保存…');
    try {await action();status('采样已保存到本机');}
    catch(error){status(error.message||'采样保存失败');toast(error.message||'采样保存失败');}
    finally {busy=false;render();}
  }
  async function loadBuffer(index, buffer, name = `Loop ${index + 1}`, options = {}) {
    if (!Number.isInteger(index) || index < 0 || index >= sampler.slots.length) throw new Error('采样槽位无效');
    if (!buffer || !Number.isFinite(buffer.duration) || buffer.duration <= 0 || buffer.duration > 30) throw new Error('循环必须是不超过 30 秒的音频');
    return run(async () => {
      const filename = `${String(name).replace(/[\\/:*?"<>|]+/g, ' ').trim().slice(0, 80) || `Loop ${index + 1}`}.wav`;
      const file = new File([encodeWav(buffer)], filename, { type: 'audio/wav' });
      const config = sampleConfig({ name: filename.replace(/\.wav$/i, ''), mode: options.mode || 'loop', start: 0, end: buffer.duration, gain: 1, bpm: options.bpm ?? null, sync: !!options.sync, keyLock: !!options.keyLock }, buffer.duration);
      const record = sampler.record(index); record.file = file; record.config = config;
      await setting(key(index), record);
      sampler.load(index, buffer, config.name, file, config);
    });
  }
  function packRecord(slot) {
    return {file:slot.file,config:slot.config,layers:(slot.layers||[]).map(layer=>layer?{file:layer.file,config:layer.config}:null)};
  }
  const press=(index,key)=>{if(!loading&&!busy)return sampler.press(index,key).catch(()=>toast('采样播放失败'));};
  $$('.sample-slot').forEach((root,index)=>{
    const button=$('.sample-trigger',root);
    button.onclick=()=>{if(sampler.triggerMode(index)!=='hold')void press(index,'click');};
    button.onpointerdown=event=>{if(event.button!==0||sampler.triggerMode(index)!=='hold'||loading||busy)return;event.preventDefault();button.setPointerCapture(event.pointerId);void press(index,'pointer:'+event.pointerId);};
    const release=event=>sampler.release(index,'pointer:'+event.pointerId);
    button.onpointerup=release;button.onpointercancel=release;button.onlostpointercapture=release;
    button.onkeydown=event=>{if(!['Space','Enter'].includes(event.code)||sampler.triggerMode(index)!=='hold')return;event.preventDefault();event.stopPropagation();if(!event.repeat)void press(index,'key:'+event.code);};
    button.onkeyup=event=>{if(!['Space','Enter'].includes(event.code))return;event.preventDefault();event.stopPropagation();sampler.release(index,'key:'+event.code);};
    $('.sample-stop',root).onclick=()=>sampler.stop(index);
    $('.sample-load',root).onclick=()=>{target={index,layerIndex:Number($('.sample-layer',root).value)};$('#sample-file').click();};
    $('.sample-edit',root).onclick=()=>openEditor(index);
    $('.sample-layer',root).onchange=()=>render();
    $('.sample-mode',root).onchange=event=>{const mode=event.target.value,layerIndex=Number($('.sample-layer',root).value);void run(async()=>{const record=sampler.record(index);if(layerIndex===0)record.config.mode=mode;else if(record.layers[layerIndex-1])record.layers[layerIndex-1].config.mode=mode;await setting(key(index),record);sampler.configureLayer(index,{mode},layerIndex);});};
  });
  $('#sample-file').onchange=async event=>{
    const file=event.target.files[0],index=target.index,layerIndex=target.layerIndex;event.target.value='';if(!file)return;
    await run(async()=>{
      if(file.size>30*1024**2)throw new Error('采样文件请小于 30 MB');
      let buffer;try{buffer=await engine.decode(file);}catch{throw new Error('采样无法解码，请选择 WAV 或 MP3');}
      if(buffer.duration>30)throw new Error('请选择不超过 30 秒的采样');
      const config=sampleConfig({name:file.name.replace(/\.[^.]+$/,'')},buffer.duration);
      const record=sampler.record(index);
      if(layerIndex===0){record.file=file;record.config=config;await setting(key(index),record);sampler.load(index,buffer,config.name,file,config);}
      else {record.layers[layerIndex-1]={file,config};await setting(key(index),record);sampler.loadLayer(index,buffer,config.name,file,config,layerIndex);}
    });
  };
  function openEditor(index) {
    const root=document.querySelector(`[data-sample="${index}"]`),layerIndex=Number($('.sample-layer',root).value),slot=sampler.layer(index,layerIndex); if(!slot)return toast('请先载入该采样层'); editing={index,layerIndex};$('#sample-dialog-title').textContent='编辑采样 '+(index+1)+' · 层 '+(layerIndex+1);
    $('#sample-reset').textContent=layerIndex===0?'恢复合成采样':'删除该层';
    $('#sample-name').value=slot.name;$('#sample-start').value=slot.start;$('#sample-end').value=slot.end;$('#sample-start').max=$('#sample-end').max=slot.buffer.duration;
    $('#sample-gain').value=Math.round(slot.gain*100);$('#sample-bpm').value=slot.bpm??'';$('#sample-sync').checked=slot.sync;$('#sample-key-lock').checked=slot.keyLock;$('#sample-key-lock').disabled=!sampler.engine.pitchAvailable;$('#sample-edit-error').textContent='';$('#sample-dialog').showModal();
  }
  $('#sample-edit-close').onclick=()=>$('#sample-dialog').close();
  $('#sample-dialog form').onsubmit=async event=>{
    event.preventDefault();if(busy||loading)return;busy=true;render();
    try {
      const {index,layerIndex}=editing,slot=sampler.layer(index,layerIndex),config=sampleConfig({...slot,name:$('#sample-name').value,start:Number($('#sample-start').value),end:Number($('#sample-end').value),gain:Number($('#sample-gain').value)/100,bpm:$('#sample-bpm').value,sync:$('#sample-sync').checked,keyLock:$('#sample-key-lock').checked},slot.buffer.duration),record=sampler.record(index);
      if(layerIndex===0) { record.file=slot.file; record.config=config; await setting(key(index),record); } else { record.layers[layerIndex-1]={file:slot.file,config}; await setting(key(index),record); }
      sampler.configureLayer(index,config,layerIndex);status('采样已保存到本机');$('#sample-dialog').close();
    }catch(error){$('#sample-edit-error').textContent=error.message;}
    finally{busy=false;render();}
  };
  $('#sample-reset').onclick=()=>void run(async()=>{const {index,layerIndex}=editing;if(layerIndex===0){const record=sampler.record(index);record.file=null;record.config=sampler.defaultConfig(index);await setting(key(index),record);sampler.reset(index);}else{const record=sampler.record(index);record.layers[layerIndex-1]=null;await setting(key(index),record);sampler.clearLayer(index,layerIndex);}$('#sample-dialog').close();});
  function persistGlobalSettings() {
    const snapshot={...sampler.settings};globalPending++;status('正在保存…');
    globalWrites=globalWrites.catch(()=>{}).then(()=>setting('sampler:global',snapshot)).then(()=>{if(globalPending===1)status('采样设置已保存到本机');}).catch(()=>{status('采样设置保存失败，本次会话仍可使用');}).finally(()=>{globalPending--;});
  }
  function globalChanged() {
    const display=Number($('#sampler-display').value),page=Math.min(sampler.settings.page||0,Math.ceil(sampler.slots.length/display)-1);
    sampler.configureGlobal({volume:Number($('#sampler-volume').value)/100,quantize:$('#sampler-quantize').checked,target:Number($('#sampler-target').value),beats:Number($('#sampler-beats').value),display,page});
    persistGlobalSettings();
  }
  async function changePage(delta, { wrap = false } = {}) {
    if (loading || busy) return;
    const display=sampler.settings.display||8, pages=Math.ceil(sampler.slots.length/display), current=sampler.settings.page||0;
    let page=current+delta;
    if (wrap && pages > 1) page=(page%pages+pages)%pages;
    if(page<0||page>=pages)return;
    // Do not expose the new page until its IndexedDB write has completed. A
    // quick reload after clicking the pager must restore the page the user saw.
    busy=true; render(); status('正在保存…');
    try {
      await globalWrites;
      await setting('sampler:global',{...sampler.settings,page});
      sampler.configureGlobal({page});
      status('采样设置已保存到本机');
    } catch(error) { status(error.message||'采样设置保存失败'); toast(error.message||'采样设置保存失败'); }
    finally { busy=false; render(); }
  }
  function nextPage() { return changePage(1); }
  // DJUCED's set_next_sampler_page action advances through the page list and
  // wraps to page zero at the end. The visible pager remains bounded so its
  // arrow buttons still communicate the current edge to mouse users.
  function cycleNextPage() { return changePage(1, { wrap: true }); }
  $('#sampler-prev').onclick=()=>void changePage(-1);$('#sampler-next').onclick=()=>void changePage(1);
  $('#sampler-display').onchange=globalChanged;$('#sampler-volume').oninput=globalChanged;$('#sampler-quantize').onchange=$('#sampler-target').onchange=$('#sampler-beats').onchange=globalChanged;
  $('#sampler-stop').onclick=()=>sampler.stopAll();
  $('#sample-pack-export').onclick=()=>{
    try {
      const url=URL.createObjectURL(exportSamplePack(sampler)),a=document.createElement('a');a.href=url;a.download='MIXDESK-samples.mxpack';a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);status('采样包已导出，包含自定义音频与槽位设置');
    } catch(error) {status(error.message||'采样包导出失败');}
  };
  $('#sample-pack-import').onclick=()=>$('#sample-pack-file').click();
  $('#sample-djs-import').onclick=()=>$('#sample-djs-file').click();
  $('#sample-pack-file').onchange=async event=>{
    const file=event.target.files[0];event.target.value='';if(!file)return;
    await run(async()=>{
      const pack=await importSamplePack(file,engine);await globalWrites;
      const prepared=sampler.prepareReplacement(pack);
      try {
        await settingsBatch([...pack.slots.map((slot,index)=>[key(index),packRecord(slot)]),['sampler:global',pack.settings]],()=>sampler.stageReplacement(prepared));
      } catch(error) {
        sampler.discardReplacement(prepared);
        throw error;
      }
      showSettings();
    });
  };
  $('#sample-djs-file').onchange=async event=>{
    const files=[...event.target.files];event.target.value='';if(!files.length)return;
    await run(async()=>{
      const pack=await importDjucedSamplePack(files,engine);await globalWrites;
      const prepared=sampler.prepareReplacement(pack);
      try { await settingsBatch([...pack.slots.map((slot,index)=>[key(index),packRecord(slot)]),['sampler:global',pack.settings]],()=>sampler.stageReplacement(prepared)); }
      catch(error) { sampler.discardReplacement(prepared); throw error; }
      showSettings();
    });
  };
  sampler.onchange=render;
  sampler.engine.pitchReady?.then(()=>render());
  const ready=(async()=>{
    const problems=[];
    try{const global=await setting('sampler:global');if(global)sampler.configureGlobal(global);}catch{problems.push('全局设置');}
    for(let index=0;index<sampler.slots.length;index++)try{
      const record=await setting(key(index));if(!record)continue;
      if(record.file){const buffer=await engine.decode(record.file);if(buffer.duration>30)throw new Error();sampler.load(index,buffer,record.config.name,record.file,record.config);}
      else sampler.configure(index,record.config);
      for(const [layerIndex,layer] of (record.layers||[]).entries()) if(layer){const buffer=layer.file?await engine.decode(layer.file):sampler.defaultBuffer(index);if(buffer.duration>30)throw new Error();sampler.loadLayer(index,buffer,layer.config.name,layer.file,layer.config,layerIndex+1);}
    }catch{problems.push('槽 '+(index+1));}
    loading=false;showSettings();render();status(problems.length?'部分缓存无法恢复：'+problems.join('、'):'采样已就绪 · 自动保存到本机');
  })();
  const releaseHolds=()=>{sampler.releasePrefix('pointer:');sampler.releasePrefix('key:');};
  window.addEventListener('blur',releaseHolds);document.addEventListener('visibilitychange',()=>{if(document.hidden)releaseHolds();});
  document.addEventListener('keyup',event=>{if(['Space','Enter'].includes(event.code))sampler.releasePrefix('key:'+event.code);});
  window.addEventListener('beforeunload',event=>{if(busy||globalPending){event.preventDefault();event.returnValue='';}});
  const timer=setInterval(()=>{if(!document.hidden)render();},100);
  window.addEventListener('pagehide',()=>{clearInterval(timer);sampler.stopAll();});
  render();return {ready,press,release:(index,key)=>sampler.release(index,key),nextPage,cycleNextPage,loadBuffer,get loading(){return loading;}};
}
