// Generated PCM with embedded ID3v2.3 tags and PNG artwork.
export function taggedWav({ duration = 3, title = 'Tagged Night', bpm = 128, tags = true } = {}) {
  const chunk = (id, body) => { const h = Buffer.alloc(8); h.write(id); h.writeUInt32LE(body.length, 4); return Buffer.concat([h, body, ...(body.length % 2 ? [Buffer.alloc(1)] : [])]); };
  const frame = (id, body) => { const h = Buffer.alloc(10); h.write(id); h.writeUInt32BE(body.length, 4); return Buffer.concat([h, body]); };
  const textFrame = (id, value) => frame(id, Buffer.concat([Buffer.from([0]), Buffer.from(String(value), 'latin1')]));
  const sampleRate = 22050, samples = Math.round(duration * sampleRate), pcm = Buffer.alloc(samples * 2), fmt = Buffer.alloc(16);
  fmt.writeUInt16LE(1, 0); fmt.writeUInt16LE(1, 2); fmt.writeUInt32LE(sampleRate, 4); fmt.writeUInt32LE(sampleRate * 2, 8); fmt.writeUInt16LE(2, 12); fmt.writeUInt16LE(16, 14);
  for (let i = 0; i < samples; i++) pcm.writeInt16LE(Math.round(6000 * Math.sin(2 * Math.PI * 440 * i / sampleRate)), i * 2);
  const parts = [chunk('fmt ', fmt)];
  if (tags) {
    const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aP9sAAAAASUVORK5CYII=', 'base64');
    const frames = Buffer.concat([textFrame('TIT2',title),textFrame('TPE1','Local Artist'),textFrame('TALB','Test Album'),textFrame('TCON','House'),textFrame('TYER',2026),textFrame('TBPM',bpm),textFrame('TKEY','Am'),frame('APIC',Buffer.concat([Buffer.from([0]),Buffer.from('image/png\0'),Buffer.from([3,0]),png]))]);
    const header = Buffer.from([0x49,0x44,0x33,3,0,0,(frames.length>>21)&127,(frames.length>>14)&127,(frames.length>>7)&127,frames.length&127]);
    parts.push(chunk('id3 ',Buffer.concat([header,frames])));
  }
  parts.push(chunk('data',pcm));
  const body = Buffer.concat([Buffer.from('WAVE'),...parts]), header = Buffer.alloc(8); header.write('RIFF'); header.writeUInt32LE(body.length,4);
  return Buffer.concat([header,body]);
}
