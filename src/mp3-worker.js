// lamejs's npm CommonJS entry is not browser safe: several internal globals
// are missing after bundling. The maintained distribution bundle is a classic
// script, so load that bundle explicitly in this classic worker.
importScripts(new URL('../vendor/lame.min.js', self.location.href).href);
const { Mp3Encoder } = self.lamejs || {};
if (typeof Mp3Encoder !== 'function') throw new Error('MP3 编码器加载失败');
let encoder = null, channels = 2, sampleRate = 44100, kbps = 192;
self.onmessage = event => {
  const message = event.data;
  try {
    if (message.type === 'start') {
      channels = message.channels; sampleRate = message.sampleRate; kbps = message.kbps;
      encoder = new Mp3Encoder(channels, sampleRate, kbps);
      self.postMessage({ id: message.id, ok: true });
      return;
    }
    if (!encoder) throw new Error('MP3 encoder is not initialized');
    if (message.type === 'chunk') {
      const left = new Float32Array(message.left), right = channels === 2 ? new Float32Array(message.right) : left;
      const parts = [];
      for (let offset = 0; offset < left.length; offset += 1152) {
        const end = Math.min(left.length, offset + 1152), l = new Int16Array(end - offset), r = channels === 2 ? new Int16Array(end - offset) : l;
        for (let i = 0; i < l.length; i++) {
          l[i] = Math.max(-32768, Math.min(32767, Math.round(left[offset + i] * 32767)));
          if (channels === 2) r[i] = Math.max(-32768, Math.min(32767, Math.round(right[offset + i] * 32767)));
        }
        const bytes = encoder.encodeBuffer(l, r); if (bytes.length) parts.push(new Uint8Array(bytes));
      }
      const size = parts.reduce((sum, part) => sum + part.length, 0), output = new Uint8Array(size); let cursor = 0;
      for (const part of parts) { output.set(part, cursor); cursor += part.length; }
      self.postMessage({ id: message.id, ok: true, bytes: output.buffer }, [output.buffer]);
      return;
    }
    if (message.type === 'finish') {
      const bytes = encoder.flush(); encoder = null;
      const output = new Uint8Array(bytes);
      self.postMessage({ id: message.id, ok: true, bytes: output.buffer }, [output.buffer]);
    }
  } catch (error) {
    encoder = null; self.postMessage({ id: message.id, ok: false, error: error?.message || String(error) });
  }
};
