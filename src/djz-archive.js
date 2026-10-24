export const DJZ_LIMITS = Object.freeze({
  archive:256*1024**2, total:256*1024**2, file:30*1024**2,
  descriptor:1024**2, entries:256, listing:512*1024,
});

export function archivePath(value) {
  const path = String(value).replace(/\\/g, '/');
  if (!path || path.length > 1024 || /[\u0000-\u001f\u007f:]/.test(path) || path.split('/').some(part => !part || part === '.' || part === '..')) {
    throw new Error('采样包包含无效文件路径');
  }
  return path;
}

// Technical listing is only a preflight. The extraction FS also enforces this
// manifest at creation/write time, and every resulting node is checked again.
export function parseArchiveListing(text) {
  if (text.length > DJZ_LIMITS.listing) throw new Error('采样包目录过大');
  const blocks = text.replace(/^\n+|\n+$/g, '').split(/\n\s*\n/).filter(Boolean);
  if (!blocks.length || blocks.length > DJZ_LIMITS.entries) throw new Error('采样包文件数量需为 1–256');
  const entries = [], names = new Set(); let total = 0;
  for (const block of blocks) {
    const meta = Object.create(null);
    for (const line of block.split('\n')) {
      const match = /^([^=\r\n]+) = (.*)$/.exec(line);
      if (!match || Object.hasOwn(meta, match[1])) throw new Error('采样包目录无效');
      meta[match[1]] = match[2];
    }
    const name = archivePath(meta.Path ?? ''), key = name.toLowerCase();
    if (names.has(key)) throw new Error('采样包包含重复文件路径');
    names.add(key);
    if (meta.Encrypted === '+' || /AES|ZipCrypto/i.test(meta.Method ?? '')) throw new Error('不支持加密采样包');
    if (Object.keys(meta).some(k => /link/i.test(k) && meta[k]) || /(^|[\s_])[lhbcps][rwxstST-]{9}/.test((meta.Attributes ?? '')+' '+(meta.Mode ?? ''))) throw new Error('采样包不支持链接或特殊文件');
    const directory = meta.Folder === '+' || /(^|\s)D/.test(meta.Attributes ?? '') || /[\s_]dr/.test(meta.Attributes ?? '');
    if (!/^\d+$/.test(meta.Size ?? '') || !Number.isSafeInteger(Number(meta.Size))) throw new Error('采样包文件大小无效');
    const size = Number(meta.Size), limit = key === 'default.djs' ? DJZ_LIMITS.descriptor : DJZ_LIMITS.file;
    if (size > limit || (directory && size !== 0)) throw new Error(key === 'default.djs' ? '采样包描述文件需小于 1 MB' : '采样包单文件需小于 30 MB');
    total += size;
    if (total > DJZ_LIMITS.total) throw new Error('采样包解压后需小于 256 MB');
    entries.push({name, size, directory});
  }
  const files = new Set(entries.filter(e => !e.directory).map(e => e.name.toLowerCase()));
  for (const entry of entries) {
    const parts = entry.name.toLowerCase().split('/'); parts.pop();
    while (parts.length) {
      if (files.has(parts.join('/'))) throw new Error('采样包文件与目录冲突');
      parts.pop();
    }
  }
  if (!files.has('default.djs')) throw new Error('采样包根目录缺少 default.djs');
  return entries;
}

export function guardExtraction(FS, entries) {
  const root = '/unpacked', files = new Map(), dirs = new Set([root]);
  for (const entry of entries) {
    const path = root+'/'+entry.name;
    if (entry.directory) dirs.add(path); else files.set(path, entry.size);
    const parts = path.split('/'); parts.pop();
    while (parts.length > 1) { dirs.add(parts.join('/')); parts.pop(); }
  }
  const checkSize = (node, end) => {
    const limit = files.get(FS.getPath(node));
    if (limit === undefined || !Number.isSafeInteger(end) || end < 0 || end > limit) throw new Error('采样包实际解压内容超出目录声明');
  };
  const mknod = FS.mknod.bind(FS);
  FS.mknod = (path, mode, dev) => {
    if (!(FS.isDir(mode) ? dirs.has(path) : FS.isFile(mode) && files.has(path))) throw new Error('采样包包含未声明的文件路径');
    return mknod(path, mode, dev);
  };
  const write = FS.write.bind(FS);
  FS.write = (stream, buffer, offset, length, position, canOwn) => {
    if (FS.isFile(stream.node.mode)) checkSize(stream.node, (position ?? stream.position)+length);
    else if (stream.fd !== 1 && stream.fd !== 2) throw new Error('采样包不支持特殊文件');
    return write(stream, buffer, offset, length, position, canOwn);
  };
  const truncate = FS.doTruncate.bind(FS);
  FS.doTruncate = (stream, node, length) => { checkSize(node, length); return truncate(stream, node, length); };
  if (FS.allocate) {
    const allocate = FS.allocate.bind(FS);
    FS.allocate = (stream, offset, length) => { checkSize(stream.node, offset+length); return allocate(stream, offset, length); };
  }
  for (const method of ['symlink','link','rename','mmap']) FS[method] = () => { throw new Error('采样包不支持链接或映射文件'); };
  return () => {
    const seen = new Set(), result = [];
    const visit = dir => {
      for (const name of FS.readdir(dir).filter(n => n !== '.' && n !== '..')) {
        const path = dir+'/'+name, stat = FS.lstat(path);
        if (FS.isDir(stat.mode) && dirs.has(path)) visit(path);
        else if (FS.isFile(stat.mode) && files.get(path) === stat.size) {
          seen.add(path);
          const bytes = FS.readFile(path);
          result.push({name:path.slice(root.length+1), bytes:bytes.buffer});
        } else throw new Error('采样包实际解压内容与目录不一致');
      }
    };
    visit(root);
    if (seen.size !== files.size) throw new Error('采样包文件不完整');
    return result;
  };
}
