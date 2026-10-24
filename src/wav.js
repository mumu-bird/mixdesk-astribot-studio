export function wavHeader(frames, channels, sampleRate, bitDepth = 16) {
  if (![16,24].includes(bitDepth) || !Number.isInteger(frames) || frames < 0 || ![1,2].includes(channels) || !Number.isInteger(sampleRate) || sampleRate < 8000) throw new Error('无效的 WAV 参数');
  const byteLength = frames * channels * bitDepth / 8;
  if (byteLength > 0xffffffff - 36) throw new Error('录音超过 WAV 文件大小限制');
  const bytes = new ArrayBuffer(44), view = new DataView(bytes);
  const text = (offset, value) => [...value].forEach((character, i) => view.setUint8(offset+i,character.charCodeAt(0)));
  text(0,'RIFF');view.setUint32(4,36+byteLength,true);text(8,'WAVE');text(12,'fmt ');
  view.setUint32(16,16,true);view.setUint16(20,1,true);view.setUint16(22,channels,true);
  view.setUint32(24,sampleRate,true);view.setUint32(28,sampleRate*channels*bitDepth/8,true);
  view.setUint16(32,channels*bitDepth/8,true);view.setUint16(34,bitDepth,true);text(36,'data');view.setUint32(40,byteLength,true);
  return bytes;
}

export function encodeWav(buffer) {
  const channels = Math.min(2, buffer.numberOfChannels);
  const byteLength = buffer.length * channels * 2;
  const bytes = new ArrayBuffer(44 + byteLength);
  const view = new DataView(bytes);
  const text = (offset, value) => [...value].forEach((character, i) => view.setUint8(offset + i, character.charCodeAt(0)));
  text(0, 'RIFF'); view.setUint32(4, 36 + byteLength, true); text(8, 'WAVE'); text(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, channels, true);
  view.setUint32(24, buffer.sampleRate, true); view.setUint32(28, buffer.sampleRate * channels * 2, true);
  view.setUint16(32, channels * 2, true); view.setUint16(34, 16, true); text(36, 'data'); view.setUint32(40, byteLength, true);
  const data = Array.from({ length: channels }, (_, channel) => buffer.getChannelData(channel));
  for (let i = 0; i < buffer.length; i++) for (let channel = 0; channel < channels; channel++) {
    const value = Math.max(-1, Math.min(1, Number.isFinite(data[channel][i]) ? data[channel][i] : 0));
    view.setInt16(44 + (i * channels + channel) * 2, Math.round(value * (value < 0 ? 32768 : 32767)), true);
  }
  return new Blob([bytes], { type: 'audio/wav' });
}
