let dbPromise;
function database() {
  if (!dbPromise) dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open('mixdesk-library', 2);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains('tracks')) request.result.createObjectStore('tracks', { keyPath: 'id' });
      if (!request.result.objectStoreNames.contains('settings')) request.result.createObjectStore('settings');
    };
    request.onsuccess = () => {
      request.result.onversionchange = () => { request.result.close(); dbPromise = null; };
      resolve(request.result);
    };
    request.onerror = () => reject(request.error);
  });
  return dbPromise;
}

export async function setting(key, value) {
  const db = await database();
  const write = arguments.length > 1;
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('settings', write ? 'readwrite' : 'readonly');
    const store = transaction.objectStore('settings');
    const request = write ? store.put(value, key) : store.get(key);
    transaction.oncomplete = () => resolve(write ? value : request.result);
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || new Error('保存失败'));
  });
}

// Read-modify-write stays in one transaction so tabs cannot overwrite each
// other's playlist/favorite edits with stale in-memory snapshots.
export async function updateSetting(key, update) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('settings', 'readwrite'), store = tx.objectStore('settings');
    const request = store.get(key); let next, failure;
    request.onsuccess = () => {
      try { next = update(request.result); store.put(next, key); }
      catch (error) { failure = error; tx.abort(); }
    };
    tx.oncomplete = () => resolve(next);
    tx.onerror = tx.onabort = () => reject(failure || tx.error || new Error('曲库保存失败'));
  });
}

export async function storedTracks() {
  const db = await database();
  return new Promise((resolve, reject) => {
    const request = db.transaction('tracks').objectStore('tracks').getAll();
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveTrack(track) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('tracks', 'readwrite');
    transaction.objectStore('tracks').put(track);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
    transaction.onabort = () => reject(transaction.error || new Error('保存失败'));
  });
}

// File identity and its DJ annotations must commit together. Runtime changes
// run while the transaction can still abort, so a failed deck/source swap also
// leaves the previous file and markers on disk.
export async function replaceTrackRecord(track, annotations, { apply, rollback }) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(['tracks', 'settings'], 'readwrite');
    let remaining = 2, applied = false, failure;
    const staged = () => {
      if (--remaining) return;
      applied = true;
      try { apply(); } catch (error) { failure = error; tx.abort(); }
    };
    tx.oncomplete = () => resolve();
    tx.onabort = () => {
      try { if (applied) rollback(); }
      catch (error) { failure = new Error(`${failure?.message || '重新关联保存失败'}；恢复播放失败：${error.message}`); }
      reject(failure || tx.error || new Error('重新关联保存失败，原文件未改变'));
    };
    try {
      tx.objectStore('tracks').put(track).onsuccess = staged;
      tx.objectStore('settings').put(annotations, `annotations:${track.id}`).onsuccess = staged;
    } catch (error) { failure = error; tx.abort(); }
  });
}

export async function removeTrack(id) {
  const db = await database();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction('tracks', 'readwrite');
    transaction.objectStore('tracks').delete(id);
    transaction.oncomplete = resolve;
    transaction.onerror = () => reject(transaction.error);
  });
}

// The optional synchronous apply callback runs while the write transaction is
// still active. It may return commit/rollback hooks for a prepared runtime
// change. If preparation or an IDB request fails, the old records remain and
// the runtime change is rolled back before the promise rejects.
export async function settingsBatch(entries, apply) {
  const db = await database();
  return new Promise((resolve,reject)=>{
    const tx=db.transaction('settings','readwrite'),store=tx.objectStore('settings');
    let lifecycle=null,failure=null,remaining=entries.length;
    const stage=()=>{try{lifecycle=apply?.();}catch(error){failure=error;tx.abort();}};
    tx.oncomplete=()=>{try{lifecycle?.commit?.();resolve();}catch(error){reject(error);}};
    tx.onabort=()=>{try{lifecycle?.rollback?.();}catch(error){failure??=error;}reject(failure||tx.error||new Error('设置保存失败'));};
    try{
      for(const [key,value] of entries){const request=store.put(value,key);request.onsuccess=()=>{if(--remaining===0)stage();};}
      if(!remaining)stage();
    }catch(error){failure=error;tx.abort();}
  });
}
