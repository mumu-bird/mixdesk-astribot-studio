// Small, local tag writer for the formats the browser can safely export.
// It deliberately creates a new file and never mutates the imported File.

const textEncoder = new TextEncoder();

function syncsafe(value) {
  const n = Math.max(0, Math.floor(value));
  return Uint8Array.of((n >>> 21) & 0x7f, (n >>> 14) & 0x7f, (n >>> 7) & 0x7f, n & 0x7f);
}

function concat(...parts) {
  const size = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) { output.set(part, offset); offset += part.length; }
  return output;
}

function utf16be(value) {
  const text = String(value ?? '');
  const output = new Uint8Array(2 + text.length * 2 + 2);
  output[0] = 0xfe; output[1] = 0xff;
  for (let index = 0; index < text.length; index++) {
    const code = text.charCodeAt(index);
    output[2 + index * 2] = code >>> 8;
    output[3 + index * 2] = code & 0xff;
  }
  return output;
}

function frame(id, body) {
  const header = new Uint8Array(10);
  for (let index = 0; index < 4; index++) header[index] = id.charCodeAt(index);
  new DataView(header.buffer).setUint32(4, body.length, false);
  return concat(header, body);
}

function textFrame(id, value) {
  if (value == null || String(value).trim() === '') return null;
  return frame(id, concat(Uint8Array.of(1), utf16be(value)));
}

function commentFrame(value) {
  if (value == null || String(value).trim() === '') return null;
  const language = new TextEncoder().encode('eng');
  return frame('COMM', concat(Uint8Array.of(1), language, new Uint8Array(2), utf16be(value)));
}

function ratingFrame(value) {
  const rating = Math.max(0, Math.min(5, Math.round(Number(value) || 0)));
  if (!rating) return null;
  // ID3 POPM uses 1..255; map the application's five stars to that range.
  return frame('POPM', concat(new TextEncoder().encode('mixdesk\0'), Uint8Array.of(Math.round(rating * 255 / 5), 0, 0, 0)));
}

async function artworkFrame(artwork) {
  if (!(artwork instanceof Blob) || artwork.size < 1 || artwork.size > 5 * 1024 * 1024) return null;
  const bytes = new Uint8Array(await artwork.arrayBuffer());
  const mime = String(artwork.type || 'image/jpeg').toLowerCase();
  // APIC descriptions use the selected text encoding. An empty UTF-16
  // description therefore has a two-byte terminator, not a single NUL.
  return frame('APIC', concat(Uint8Array.of(1), textEncoder.encode(`${mime}\0`), Uint8Array.of(3, 0, 0), bytes));
}

/** Build an ID3v2.3 tag. UTF-16 frames keep Chinese metadata readable in old DJ apps. */
export async function buildId3Tag(track) {
  const frames = [
    textFrame('TIT2', track.title), textFrame('TPE1', track.artist), textFrame('TALB', track.album),
    textFrame('TCON', track.genre), textFrame('TKEY', track.key), textFrame('TYER', track.year),
    textFrame('TBPM', Number.isFinite(Number(track.bpm)) ? Number(track.bpm).toFixed(1) : null),
    commentFrame(track.comment), ratingFrame(track.rating), await artworkFrame(track.artwork),
  ].filter(Boolean);
  const body = concat(...frames);
  const header = concat(new TextEncoder().encode('ID3'), Uint8Array.of(3, 0, 0), syncsafe(body.length));
  return concat(header, body);
}

function riffChunk(id, body) {
  const header = new Uint8Array(8); header.set(new TextEncoder().encode(id));
  new DataView(header.buffer).setUint32(4, body.length, true);
  return concat(header, body, body.length & 1 ? Uint8Array.of(0) : new Uint8Array());
}

function isWav(bytes) { return bytes.length >= 12 && new TextDecoder().decode(bytes.subarray(0, 4)) === 'RIFF' && new TextDecoder().decode(bytes.subarray(8, 12)) === 'WAVE'; }
function isMp3(bytes) { return bytes.length >= 3 && new TextDecoder().decode(bytes.subarray(0, 3)) === 'ID3' || (bytes.length >= 2 && bytes[0] === 0xff && (bytes[1] & 0xe0) === 0xe0); }

export async function writeTagsCopy(file, track) {
  if (!(file instanceof Blob)) throw new Error('此曲目没有可导出的原始文件');
  const source = new Uint8Array(await file.arrayBuffer());
  const tag = await buildId3Tag(track);
  const type = String(file.type || '').toLowerCase();
  if (isWav(source) || /audio\/(wav|x-wav)/.test(type) || /\.(wav|wave)$/i.test(file.name || '')) {
    if (!isWav(source)) throw new Error('WAV 文件结构无效，无法写入标签');
    const chunks = [];
    let offset = 12;
    while (offset + 8 <= source.length) {
      const id = new TextDecoder().decode(source.subarray(offset, offset + 4));
      const size = new DataView(source.buffer, source.byteOffset + offset + 4, 4).getUint32(0, true);
      const end = offset + 8 + size + (size & 1);
      if (end > source.length) throw new Error('WAV 区块长度无效');
      if (id !== 'id3 ') chunks.push(source.slice(offset, end));
      offset = end;
    }
    if (offset !== source.length) throw new Error('WAV 文件末尾不完整');
    const body = concat(new TextEncoder().encode('WAVE'), riffChunk('id3 ', tag), ...chunks);
    const header = new Uint8Array(8); header.set(new TextEncoder().encode('RIFF'));
    new DataView(header.buffer).setUint32(4, body.length, true);
    return new Blob([concat(header, body)], { type: 'audio/wav' });
  }
  if (isMp3(source) || type === 'audio/mpeg' || /\.mp3$/i.test(file.name || '')) {
    let audio = source;
    if (source.length >= 10 && new TextDecoder().decode(source.subarray(0, 3)) === 'ID3') {
      const size = (source[6] << 21) | (source[7] << 14) | (source[8] << 7) | source[9];
      const end = Math.min(source.length, 10 + size + ((source[5] & 0x10) ? 10 : 0));
      audio = source.slice(end);
    }
    return new Blob([concat(tag, audio)], { type: 'audio/mpeg' });
  }
  throw new Error('当前仅支持导出 WAV 或 MP3 标签副本');
}

