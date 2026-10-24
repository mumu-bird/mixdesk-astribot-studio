/** A movable, control-free monitor window for the two local VJ channels. */
export class VJOutput {
  constructor({ openWindow = (...args) => window.open(...args) } = {}) {
    this.openWindow = openWindow;
    this.popup = null;
  }

  open() {
    if (this.popup && !this.popup.closed) {
      this.popup.focus();
      return this.popup;
    }
    this.popup = this.openWindow('', 'mixdesk-vj-output', 'popup,width=1280,height=720');
    if (!this.popup) return null;
    this.popup.document.open();
    this.popup.document.write(`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>MIXDESK · 视频输出</title><style>
      *{box-sizing:border-box}html,body{width:100%;height:100%;margin:0;background:#000;overflow:hidden}main{position:relative;width:100%;height:100%;background:#000}video{position:absolute;inset:0;width:100%;height:100%;object-fit:contain;background:#000}#b{z-index:2}.lyrics{position:absolute;z-index:5;left:8%;right:8%;bottom:7%;text-align:center;color:#fff;font:600 28px/1.25 system-ui,sans-serif;text-shadow:0 2px 5px #000,0 0 12px #000;pointer-events:none}.lyrics[data-position="center"]{top:42%;bottom:auto}.lyrics[data-position="top"]{top:7%;bottom:auto}.lyrics.no-shadow{text-shadow:none}
      @keyframes vj-pulse{0%,100%{transform:scale(calc(1 - var(--vj-animation-amount) * .035))}50%{transform:scale(calc(1 + var(--vj-animation-amount) * .035))}}@keyframes vj-drift{0%,100%{transform:translateX(calc(var(--vj-animation-amount) * -2%))}50%{transform:translateX(calc(var(--vj-animation-amount) * 2%))}}@keyframes vj-zoom{0%,100%{transform:scale(calc(1 - var(--vj-animation-amount) * .04))}50%{transform:scale(calc(1 + var(--vj-animation-amount) * .08))}}@keyframes vj-spin{from{transform:rotate(calc(var(--vj-animation-amount) * -2deg))}to{transform:rotate(calc(var(--vj-animation-amount) * 2deg))}}@keyframes vj-strobe{0%,49%{opacity:var(--vj-opacity)}50%,100%{opacity:calc(var(--vj-opacity) * (1 - var(--vj-animation-amount)))}}
      </style></head><body><main><video id="a" muted playsinline></video><video id="b" muted playsinline></video><div id="lyrics-a" class="lyrics"></div><div id="lyrics-b" class="lyrics"></div></main><script>
      const videos=[document.querySelector('#a'),document.querySelector('#b')],lyrics=[document.querySelector('#lyrics-a'),document.querySelector('#lyrics-b')],states=[];
      function update(index){const video=videos[index],state=states[index];if(!video||!state)return;
        video.style.display=state.visible&&state.url?'':'none';video.style.opacity=String(state.visible ? state.opacity : 0);video.style.setProperty('--vj-opacity',String(state.visible ? state.opacity : 0));video.playbackRate=state.rate;
        const effect=state.effect||{};const amount=Math.max(0,Math.min(1,Number(effect.amount)||0));const filters={none:'',blur:'blur('+(amount*12).toFixed(2)+'px)',brightness:'brightness('+(0.35+amount*1.65).toFixed(3)+')',contrast:'contrast('+(0.4+amount*1.8).toFixed(3)+')',saturate:'saturate('+(amount*2.4).toFixed(3)+')',grayscale:'grayscale('+amount.toFixed(3)+')',sepia:'sepia('+amount.toFixed(3)+')',invert:'invert('+amount.toFixed(3)+')',hue:'hue-rotate('+Math.round(amount*360)+'deg)'};video.style.filter=effect.enabled===false?'':(filters[effect.name]||'');
        const animation=state.animation||{};video.style.setProperty('--vj-animation-amount',String(Math.max(0,Math.min(1,Number(animation.amount)||0))));video.style.animationName=animation.enabled===false?'':'vj-'+animation.name;video.style.animationDuration=animation.enabled===false?'':(1/Math.max(.1,Number(animation.speed)||1)).toFixed(3)+'s';video.style.animationIterationCount=animation.enabled===false?'':'infinite';video.style.animationTimingFunction=animation.name==='strobe'?'steps(2,jump-none)':'ease-in-out';video.style.animationPlayState=state.playing?'running':'paused';
        const lyric=lyrics[index],ls=state.lyrics||{};lyric.textContent=ls.current||'';lyric.style.display=state.visible&&ls.visible!==false&&lyric.textContent?'':'none';lyric.style.opacity=String(ls.opacity??1);lyric.style.fontSize=(ls.fontSize||28)+'px';lyric.dataset.position=ls.position||'bottom';lyric.classList.toggle('no-shadow',ls.shadow===false);
        if(video.dataset.url!==state.url){video.pause();video.removeAttribute('src');video.dataset.url=state.url||'';if(state.url)video.src=state.url;video.load();}
        if(!state.url)return;
        if(Number.isFinite(state.position)&&video.readyState>0&&Math.abs(video.currentTime-state.position)>(state.playing ? .35 : .01)){try{video.currentTime=state.position;}catch{}}
        if(state.playing&&video.paused)video.play().catch(()=>{});else if(!state.playing&&!video.paused)video.pause();
      }
      function apply(channels){channels.forEach((state,index)=>{states[index]=state;update(index);});}
      window.addEventListener('message',event=>{if(event.source===window.opener&&event.data?.type==='mixdesk-vj-state')apply(event.data.channels||[])});
      videos.forEach((video,index)=>video.addEventListener('loadedmetadata',()=>update(index)));
      window.opener?.postMessage({type:'mixdesk-vj-output-ready'},location.origin);
      </script></body></html>`);
    this.popup.document.close();
    this.popup.addEventListener('pagehide', () => { if (this.popup?.closed) this.popup = null; }, { once: true });
    return this.popup;
  }

  sync(snapshot) {
    if (!this.popup || this.popup.closed) { this.popup = null; return false; }
    try {
      this.popup.postMessage({ type: 'mixdesk-vj-state', channels: snapshot.channels.map(channel => ({
        url: channel.url,
        visible: channel.visible,
        opacity: channel.opacity,
        rate: channel.rate,
        position: channel.position,
        playing: channel.playing,
        effect: channel.effect,
        animation: channel.animation,
        lyrics: channel.lyrics,
      })) }, window.location.origin);
      return true;
    } catch {
      this.popup = null;
      return false;
    }
  }

  close() {
    if (this.popup && !this.popup.closed) this.popup.close();
    this.popup = null;
  }
}
