export async function readMetadata(file) {
  try {
    const { parseBlob, selectCover } = await import('music-metadata');
    const { common, format } = await parseBlob(file, { duration: false });
    const bpm = Number(common.bpm), picture = selectCover(common.picture || []);
    const artwork = picture && picture.data.byteLength <= 5 * 1024 * 1024 && /^image\/(jpeg|png|webp)$/i.test(picture.format)
      ? new Blob([picture.data], { type: picture.format }) : null;
    return {
      title: common.title || '', artist: common.artist || '', album: common.album || '', genre: common.genre?.join(' / ') || '',
      key: common.key || '', year: common.year || null, comment: common.comment?.map(item => typeof item === 'string' ? item : item.text || '').join('\n') || '',
      tagBpm: Number.isFinite(bpm) && bpm >= 30 && bpm <= 300 ? bpm : null, artwork,
      formatInfo: { container: format.container || '', codec: format.codec || '', sampleRate: format.sampleRate || null, channels: format.numberOfChannels || null, bitrate: format.bitrate || null, lossless: format.lossless ?? null },
      tagsRead: true,
    };
  } catch { return { tagsRead: false }; }
}
