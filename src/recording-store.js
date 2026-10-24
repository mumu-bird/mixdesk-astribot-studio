let dbPromise;
function database() {
  if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open('mixdesk-recordings', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('sessions', { keyPath: 'id' });
      request.result.createObjectStore('chunks', { keyPath: ['sessionId', 'index'] });
    };
    request.onsuccess = () => { request.result.onversionchange = () => { request.result.close(); dbPromise = null; }; resolve(request.result); };
    request.onerror = () => { dbPromise = null; reject(request.error); };
  });
  return dbPromise;
}
async function transaction(stores, mode, action) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(stores, mode); let result, failure;
    const set = value => { result = value; };
    const fail = error => { failure = error; tx.abort(); };
    tx.oncomplete = () => resolve(result);
    tx.onabort = tx.onerror = () => reject(failure || tx.error || new Error('录音缓存写入失败'));
    try { action(tx, set, fail); } catch(error) { fail(error); }
  });
}
export const createRecording = session => transaction(['sessions'],'readwrite',(tx,set) => { tx.objectStore('sessions').add(session); set(session); });
export const recordings = () => transaction(['sessions'],'readonly',(tx,set) => { const r=tx.objectStore('sessions').getAll();r.onsuccess=()=>set(r.result.sort((a,b)=>b.createdAt-a.createdAt)); });
export function appendRecording(id, index, bytes, frames, clipped, peak) {
  return transaction(['sessions','chunks'],'readwrite',(tx,set,fail)=>{
    const sessions=tx.objectStore('sessions'), r=sessions.get(id);
    r.onsuccess=()=>{
      const session=r.result;
      if (!session || session.chunkCount !== index || session.status !== 'recording') return fail(new Error('录音片段顺序异常，已停止以保护已保存内容'));
      if (!Number.isInteger(frames) || frames < 1 || bytes.byteLength !== frames*session.channels*session.bitDepth/8) return fail(new Error('录音片段数据不完整'));
      tx.objectStore('chunks').add({sessionId:id,index,data:new Blob([bytes]),frames});
      session.chunkCount++;session.frames+=frames;session.bytes+=bytes.byteLength;session.clipped+=clipped;session.peak=Math.max(session.peak,peak);session.updatedAt=Date.now();
      sessions.put(session);set(session);
    };
  });
}
export function finishRecording(id, status = 'complete', error = '') {
  return transaction(['sessions'],'readwrite',(tx,set,fail)=>{
    const store=tx.objectStore('sessions'),r=store.get(id);r.onsuccess=()=>{
      const session=r.result;if(!session)return fail(new Error('录音缓存已不存在'));
      session.status=status;session.error=error;session.updatedAt=Date.now();store.put(session);set(session);
    };
  });
}
export function recordingData(id) {
  return transaction(['sessions','chunks'],'readonly',(tx,set,fail)=>{
    const r=tx.objectStore('sessions').get(id);r.onsuccess=()=>{
      const session=r.result;if(!session)return fail(new Error('录音缓存已不存在'));
      const chunks=tx.objectStore('chunks').getAll(IDBKeyRange.bound([id,0],[id,Number.MAX_SAFE_INTEGER]));
      chunks.onsuccess=()=>{
        const parts=chunks.result;
        if(parts.length!==session.chunkCount || parts.some((p,i)=>p.index!==i) || parts.reduce((sum,p)=>sum+p.data.size,0)!==session.bytes) return fail(new Error('录音缓存片段不完整，无法导出'));
        set({session,parts:parts.map(p=>p.data)});
      };
    };
  });
}
export const deleteRecording = id => transaction(['sessions','chunks'],'readwrite',tx=>{
  tx.objectStore('sessions').delete(id);
  tx.objectStore('chunks').delete(IDBKeyRange.bound([id,0],[id,Number.MAX_SAFE_INTEGER]));
});
