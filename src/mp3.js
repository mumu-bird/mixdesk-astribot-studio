const supportedRates = [48000, 44100, 32000, 24000, 22050, 16000, 12000, 11025, 8000];
const blockFrames = 1152 * 128;
let serial = 0;
function nearestRate(rate) { return supportedRates.reduce((best, value) => Math.abs(value - rate) < Math.abs(best - rate) ? value : best); }
export async function encodeMp3(input, kbps = 192, onprogress = () => {}) {
  if (!input || ![1, 2].includes(input.numberOfChannels)) throw new Error('MP3 需要单声道或双声道音频');
  if (!Number.isFinite(kbps) || kbps < 64 || kbps > 320) throw new Error('MP3 比特率应为 64–320 kbps');
  if (typeof Worker === 'undefined' || typeof OfflineAudioContext === 'undefined') throw new Error('当前浏览器不支持后台 MP3 编码');
  const channels = 2, sampleRate = nearestRate(input.sampleRate), length = Math.ceil(input.duration * sampleRate);
  const offline = new OfflineAudioContext(channels, length, sampleRate), source = offline.createBufferSource();
  source.buffer = input; source.connect(offline.destination); source.start();
  const rendered = await offline.startRendering(), left = rendered.getChannelData(0), right = rendered.getChannelData(1);
  const worker = new Worker(new URL('./mp3-worker.js', import.meta.url)), parts = [];
  const call = (type, extra = {}, transfer = []) => new Promise((resolve, reject) => {
    const id = ++serial, timeout = setTimeout(() => { worker.terminate(); reject(new Error('MP3 编码器响应超时')); }, 30000);
    const handler = event => {
      if (event.data?.id !== id) return;
      worker.removeEventListener('message', handler); clearTimeout(timeout);
      event.data.ok ? resolve(event.data.bytes ? new Uint8Array(event.data.bytes) : null) : reject(new Error(event.data.error));
    };
    const onerror = event => { worker.removeEventListener('message', handler); clearTimeout(timeout); reject(new Error(event.message || 'MP3 编码器 Worker 失败')); };
    worker.addEventListener('message', handler); worker.addEventListener('error', onerror, { once: true });
    worker.postMessage({ id, type, ...extra }, transfer);
  });
  try {
    await call('start', { channels, sampleRate, kbps: Math.round(kbps) });
    for (let offset = 0; offset < length; offset += blockFrames) {
      const end = Math.min(length, offset + blockFrames), l = left.slice(offset, end), r = right.slice(offset, end);
      const bytes = await call('chunk', { left: l.buffer, right: r.buffer }, [l.buffer, r.buffer]);
      if (bytes?.length) parts.push(bytes);
      onprogress(end / length);
    }
    const tail = await call('finish'); if (tail?.length) parts.push(tail);
    return new Blob(parts, { type: 'audio/mpeg' });
  } catch (error) {
    throw new Error(error?.message || 'MP3 编码失败');
  } finally { worker.terminate(); }
}
