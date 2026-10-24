/** Read a trustworthy BPM tag when the imported container has one. */
export async function readEmbeddedBpm(file) {
  try {
    const { parseBlob } = await import('music-metadata');
    const { common } = await parseBlob(file, { duration: false });
    const bpm = Number(common.bpm);
    return Number.isFinite(bpm) && bpm >= 30 && bpm <= 300 ? bpm : null;
  } catch {
    return null;
  }
}
