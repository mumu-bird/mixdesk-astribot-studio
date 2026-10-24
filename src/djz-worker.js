import SevenZip from '7z-wasm/7zz.es6.js';
import wasmUrl from '7z-wasm/7zz.wasm?url';
import { DJZ_LIMITS, parseArchiveListing, guardExtraction } from './djz-archive.js';

// DJUCED 6.6.1's bundled libarchive defaults to BZip2 and cannot decode
// LZMA or the automatic Delta filter that 7-Zip adds for WAV input. Keep
// headers uncompressed too, or 7-Zip may silently encode them with LZMA.
// Keep compression off the audio/UI thread; the caller owns this worker.
self.onmessage = async ({data: {operation, files, bytes:input}}) => {
  let failure = operation === 'unpack' ? '采样包损坏、加密或格式不支持' : 'DJUCED 采样包压缩失败';
  try {
    let listing = null, listingSize = 0;
    const zip = await SevenZip({locateFile: () => wasmUrl, stdin: () => null, print: line => {
      if (listing === null) return;
      listingSize += line.length+1;
      if (listingSize > DJZ_LIMITS.listing) throw new Error('采样包目录过大');
      listing.push(line);
    }, printErr: () => {}});
    if (operation === 'unpack') {
      if (!(input instanceof ArrayBuffer) || input.byteLength > DJZ_LIMITS.archive) throw new Error('采样包大小无效');
      zip.FS.writeFile('/input.djz', new Uint8Array(input), {canOwn:true});
      self.postMessage({progress:'正在检查采样包…'});
      listing = [];
      const listed = zip.callMain(['l','-slt','-ba','-bsp0','-p-','/input.djz']);
      if (listed !== 0) throw new Error('采样包损坏、加密或格式不支持');
      const entries = parseArchiveListing(listing.join('\n')); listing = null;
      failure = '采样包解压失败或校验不通过';
      zip.FS.mkdir('/unpacked');
      const collect = guardExtraction(zip.FS, entries);
      self.postMessage({progress:'正在解压采样包…'});
      const exit = zip.callMain(['x','-y','-aoa','-bsp0','-p-','-o/unpacked','/input.djz']);
      if (exit !== 0) throw new Error('采样包解压失败或校验不通过');
      const output = collect();
      self.postMessage({files:output}, output.map(file => file.bytes));
      return;
    }
    zip.FS.mkdir('/samples');
    zip.FS.chdir('/samples');
    for (const file of files) zip.FS.writeFile(file.name, new Uint8Array(file.bytes));
    const exit = zip.callMain(['a', '-t7z', '-m0=BZip2', '-mx=6', '-mf=off', '-mhc=off', '-ms=off', '-y', '/samples.djz', ...files.map(file => file.name)]);
    if (exit !== 0) throw new Error('DJUCED 采样包压缩失败');
    const bytes = zip.FS.readFile('/samples.djz');
    self.postMessage({bytes: bytes.buffer}, [bytes.buffer]);
  } catch (error) {
    self.postMessage({error: error?.message || failure});
  }
};
