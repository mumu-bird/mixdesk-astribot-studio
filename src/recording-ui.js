import { PCMRecorder, exportRecording } from './pcm-recorder.js';
import { recordings, deleteRecording } from './recording-store.js';
import { setting } from './storage.js';
import { encodeWav } from './wav.js';
import { encodeMp3 } from './mp3.js';
import './recording.css';
const $=s=>document.querySelector(s);
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
export function setupRecording({engine,toast,time}) {
  const compressedMime=typeof MediaRecorder!=='undefined'?['audio/webm;codecs=opus','audio/webm','audio/mp4'].find(mime=>MediaRecorder.isTypeSupported(mime)):null;
  let recorder=null,busy=false,last=null,started=0,format=compressedMime?'compressed':'wav24',renderVersion=0,recordsBusy=false;
  const download=(blob,extension)=>{const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download='MIXDESK-'+new Date().toISOString().replace(/[:.]/g,'-')+'.'+extension;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);};
  $('#record').insertAdjacentHTML('afterend','<button id="export-wav" class="wav-button" disabled title="重新导出最近的 WAV，或将压缩录音转为 16 位 WAV">WAV</button><button id="export-mp3" class="wav-button" disabled title="把最近录音编码为 MP3">MP3</button>');
  $('.layout-toolbar').insertAdjacentHTML('beforeend','<button id="record-settings">录音设置 / 缓存</button>');
  document.body.insertAdjacentHTML('beforeend','<dialog id="record-dialog"><div class="dialog-heading"><div><span class="eyebrow">RECORDING</span><h2>混音录音</h2></div><button id="record-close" class="icon-button" aria-label="关闭录音设置">×</button></div><label class="record-format-label">录音格式<select id="record-format" aria-label="录音格式"><option value="compressed">压缩录音 · WebM / M4A</option><option value="wav16">原生 WAV · 16 位 PCM</option><option value="wav24">原生 WAV · 24 位 PCM</option></select></label><p id="record-format-info"></p><p>只录主输出，包含 FX 与采样；独立耳机预听不进入录音。原生 WAV 直接采集主输出 PCM，不经过有损编码。达到 30 分钟或 1 GiB 时自动停止。</p><p>WAV 每约 0.4 秒分块保存到当前浏览器。意外关闭后可导出已保存部分，末尾未写入片段可能丢失；清理站点数据会删除缓存。压缩录音只在本次页面中保留。</p><p id="record-live-status" role="status">尚未开始录音</p><div class="record-list-heading"><h3>本机 WAV 录音</h3><button id="record-refresh">刷新列表</button></div><div id="recording-list"></div><p id="record-library-status" role="status"></p></dialog>');
  $('#record-format option[value=compressed]').disabled=!compressedMime;
  for(const value of ['wav16','wav24'])$('#record-format option[value='+value+']').disabled=!engine.context.audioWorklet;
  if(!compressedMime&&!engine.context.audioWorklet)$('#record').disabled=true;
  function formatInfo() {
    $('#record-format').value=format;
    $('#record-format-info').textContent=format==='compressed'?'压缩格式：'+(compressedMime||'不可用')+'；WAV 按钮执行有损录音转码，不恢复丢失的信息。':(engine.context.sampleRate/1000)+' kHz · 双声道 · '+(format==='wav24'?'24':'16')+' 位 PCM，约 '+(engine.context.sampleRate*2*(format==='wav24'?3:2)*60/1024**2).toFixed(1)+' MiB / 分钟。';
  }
  const setLive=message=>{$('#record-live-status').textContent=message;};
  function idle() {recorder=null;busy=false;$('#record').classList.remove('recording');$('#record span').textContent='录制混音';$('#record-format').disabled=false;$('#export-wav').disabled=!last;$('#export-mp3').disabled=!last;}
  async function lastAudioBuffer() { if(!last)throw new Error('还没有可导出的录音'); const blob=last.id?await exportRecording(last.id):last.blob; return engine.context.decodeAudioData(await blob.arrayBuffer()); }
  async function renderRecords() {
    const version=++renderVersion;
    try {
      const sessions=await recordings();if(version!==renderVersion)return;
      $('#recording-list').innerHTML=sessions.length?sessions.map(s=>{
        const active=recorder instanceof PCMRecorder && recorder.session?.id===s.id && recorder.state!=='inactive';
        const state=active?'录制中':s.status==='complete'?'已完成':s.status==='error'?'已停止 · 部分录音':'未结束 · 可导出已保存部分';
        return '<article data-recording="'+esc(s.id)+'"><div><strong>'+esc(new Date(s.createdAt).toLocaleString())+'</strong><span>'+time(s.frames/s.sampleRate)+' · '+s.bitDepth+' 位 · '+(s.bytes/1024**2).toFixed(1)+' MiB · '+state+'</span><small>'+(s.clipped?'检测到 '+s.clipped+' 个超限采样；导出已裁切到 PCM 范围。':'')+esc(s.error||'')+'</small></div><button data-record-export="'+esc(s.id)+'" '+(!s.frames?'disabled':'')+'>导出 WAV</button><button data-record-export-mp3="'+esc(s.id)+'" '+(!s.frames?'disabled':'')+'>导出 MP3</button><button data-record-delete="'+esc(s.id)+'" '+(active?'disabled':'')+'>删除缓存</button></article>';
      }).join(''):'<p>暂无 WAV 缓存。选择原生 WAV 后开始录音。</p>';
    }catch(error){$('#record-library-status').textContent='无法读取录音缓存：'+error.message;}
  }
  $('#record-settings').onclick=()=>{formatInfo();void renderRecords();$('#record-dialog').showModal();};
  $('#record-close').onclick=()=>$('#record-dialog').close();$('#record-refresh').onclick=()=>void renderRecords();
  $('#record-format').onchange=async event=>{if(recorder||busy)return;format=event.target.value;formatInfo();try{await setting('record-format',format);}catch{toast('格式仅在本次会话生效，设置保存失败');}};
  setting('record-format').then(value=>{if(!recorder&&!busy&&['compressed','wav16','wav24'].includes(value)&&!$('#record-format option[value='+value+']').disabled){format=value;formatInfo();}}).catch(()=>{});
  $('#recording-list').onclick=async event=>{
    if(recordsBusy)return;const exp=event.target.closest('[data-record-export]'),mp3=event.target.closest('[data-record-export-mp3]'),del=event.target.closest('[data-record-delete]');if(!exp&&!mp3&&!del)return;
    recordsBusy=true;$('#record-library-status').textContent=exp||mp3?'准备导出…':'正在删除缓存…';
    try {
      if(exp){download(await exportRecording(exp.dataset.recordExport),'wav');$('#record-library-status').textContent='已导出本机保存的完整片段';}
      else if(mp3){const audio=await engine.context.decodeAudioData(await (await exportRecording(mp3.dataset.recordExportMp3)).arrayBuffer());download(await encodeMp3(audio,192),'mp3');$('#record-library-status').textContent='已导出 192 kbps MP3';}
      else {await deleteRecording(del.dataset.recordDelete);if(last?.id===del.dataset.recordDelete){last=null;$('#export-wav').disabled=true;$('#export-mp3').disabled=true;}$('#record-library-status').textContent='录音缓存已删除';await renderRecords();}
    } catch(error){$('#record-library-status').textContent=error.message;}
    finally{recordsBusy=false;}
  };
  $('#export-wav').onclick=async()=>{
    if(!last)return;$('#export-wav').disabled=true;$('#export-wav').textContent='导出…';
    try {
      if(last.id){download(await exportRecording(last.id),'wav');toast('已重新导出原生 WAV');}
      else {const buffer=await engine.context.decodeAudioData(await last.blob.arrayBuffer());download(encodeWav(buffer),'wav');toast('已导出 WAV · 转码不会提升原始录音音质');}
    }catch(error){toast('WAV 导出失败：'+error.message);}
    finally{$('#export-wav').disabled=!last;$('#export-mp3').disabled=!last;$('#export-wav').textContent='WAV';}
  };
  $('#export-mp3').onclick=async()=>{if(!last)return;$('#export-mp3').disabled=true;$('#export-mp3').textContent='编码…';try{download(await encodeMp3(await lastAudioBuffer(),192), 'mp3');toast('已导出 192 kbps MP3');}catch(error){toast('MP3 导出失败：'+error.message);}finally{$('#export-mp3').disabled=!last;$('#export-mp3').textContent='MP3';}};
  async function stop() {
    if(busy||!recorder||recorder.state!=='recording')return;
    busy=true;$('#record span').textContent='正在保存…';setLive('正在结束并保存录音…');
    if(recorder instanceof PCMRecorder)await recorder.stop();else recorder.stop();
  }
  $('#record').onclick=async()=>{
    if(busy)return;if(recorder?.state==='recording'){await stop();return;}
    if(recorder)return;busy=true;$('#record-format').disabled=true;
    try {
      await engine.context.resume();
      if(format!=='compressed') {
        const instance=new PCMRecorder(engine,{
          onprogress:s=>setLive('已保存 '+time(s.frames/s.sampleRate)+' · '+(s.bytes/1024**2).toFixed(1)+' MiB'+(s.clipped?' · 检测到削波':'')),
          onerror:error=>{setLive(error.message);toast(error.message);},
          onstop:async(s,{reason,failed})=>{
            last=s?.frames?{id:s.id}:null;idle();
            if(!failed)setLive('已保存 '+time(s.frames/s.sampleRate)+(reason==='limit'?' · 已达到录音上限':''));
            if(last&&!failed){try{download(await exportRecording(s.id),'wav');toast('原生 WAV 已下载，缓存可在录音设置中再次导出');}catch(error){toast('缓存已保存，请在录音设置中重试导出：'+error.message);}}
            if($('#record-dialog').open)await renderRecords();
          },
        });
        recorder=instance;await instance.start(format==='wav24'?24:16);
      } else {
        const chunks=[];const instance=new MediaRecorder(engine.recordDestination.stream,{mimeType:compressedMime});
        instance.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
        instance.onstop=()=>{const blob=new Blob(chunks,{type:instance.mimeType});download(blob,instance.mimeType.includes('mp4')?'m4a':'webm');last=blob.size<=50*1024**2?{blob}:null;idle();setLive('压缩录音已下载；此格式没有持久缓存');toast('混音已下载'+(last?' · 点击 WAV 可转码导出':''));};
        instance.onerror=()=>{toast('录音遇到错误，请重新尝试');setLive('压缩录音失败');idle();};
        instance.start(1000);recorder=instance;
      }
      started=Date.now();$('#record').classList.add('recording');busy=false;toast('开始录制混音 · 再次点击结束并下载');
    }catch(error){idle();setLive(error.message);toast('无法启动录音：'+error.message);}
  };
  const timer=setInterval(()=>{
    if(recorder?.state!=='recording')return;
    const seconds=recorder instanceof PCMRecorder?(recorder.session?.frames||0)/engine.context.sampleRate:(Date.now()-started)/1000;
    $('#record span').textContent=time(seconds)+' · 结束录制';
    if(!(recorder instanceof PCMRecorder)&&seconds>=1800)void stop();
  },250);
  window.addEventListener('beforeunload',event=>{if(recorder||busy){event.preventDefault();event.returnValue='';}});
  window.addEventListener('pagehide',()=>{clearInterval(timer);if(recorder instanceof PCMRecorder){recorder.node?.port.postMessage({type:'stop'});recorder.disconnect();}});
  formatInfo();return {get recorder(){return recorder;},get busy(){return busy;},stop,renderRecords};
}
