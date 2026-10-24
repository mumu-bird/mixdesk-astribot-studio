import { DJZ_LIMITS } from './djz-archive.js';

export function checkImportCancelled(signal) {
  if (signal?.aborted) throw new DOMException('已取消导入', 'AbortError');
}

// A decoder cannot always be interrupted, but its late result must be discarded.
export function abortable(promise, signal) {
  if (!signal) return promise;
  return new Promise((resolve, reject) => {
    const cancel = () => {
      signal.removeEventListener('abort', cancel);
      reject(new DOMException('已取消导入', 'AbortError'));
    };
    signal.addEventListener('abort', cancel, {once: true});
    if (signal.aborted) cancel();
    Promise.resolve(promise).then(resolve, reject).finally(() => signal.removeEventListener('abort', cancel));
  });
}

function runArchive(message, transfer, {signal, onProgress} = {}) {
  return new Promise((resolve, reject) => {
    const verb = message.operation === 'unpack' ? '导入' : '导出';
    if (signal?.aborted) return reject(new DOMException('已取消'+verb, 'AbortError'));
    const worker = new Worker(new URL('./djz-worker.js', import.meta.url), {type: 'module'});
    let finished = false;
    const finish = (error, data) => {
      if (finished) return;
      finished = true;
      clearTimeout(timeout);
      signal?.removeEventListener('abort', cancel);
      worker.terminate();
      if (error) reject(error);
      else resolve(data);
    };
    const cancel = () => finish(new DOMException('已取消'+verb, 'AbortError'));
    const timeout = setTimeout(() => finish(new Error(verb+'超时，请减少采样包大小后重试')), 120000);
    signal?.addEventListener('abort', cancel, {once: true});
    worker.onmessage = ({data}) => {
      if (data.progress) { onProgress?.(data.progress); return; }
      finish(data.error ? new Error(data.error) : null, data);
    };
    worker.onerror = () => finish(new Error('采样包处理器加载失败，请刷新后重试'));
    try { worker.postMessage(message, transfer); }
    catch (error) { finish(error); }
  });
}

export async function createDjz(files, options) {
  const {bytes} = await runArchive({operation:'pack', files}, files.map(file => file.bytes), options);
  return new Blob([bytes], {type: 'application/x-7z-compressed'});
}

export async function extractDjz(file, options = {}) {
  checkImportCancelled(options.signal);
  if (!Number.isSafeInteger(file.size) || file.size < 1 || file.size > DJZ_LIMITS.archive) throw new Error('DJUCED 采样包需小于 256 MB');
  options.onProgress?.('正在读取采样包…');
  const bytes = await abortable(file.arrayBuffer(), options.signal);
  checkImportCancelled(options.signal);
  const result = await runArchive({operation:'unpack', bytes}, [bytes], options);
  return result.files;
}
