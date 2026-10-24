// Minimal independent reader for 7z's plain header and Folder coder table.
// Interoperability depends on the encoded methods, not the writer's flags.
import assert from 'node:assert/strict';
export function sevenZipCoders(bytes){
  assert.equal(bytes.subarray(0,6).toString('hex'),'377abcaf271c');
  let at=32+Number(bytes.readBigUInt64LE(12));
  const end=at+Number(bytes.readBigUInt64LE(20));assert.ok(at>=32&&end<=bytes.length);
  const byte=()=>{assert.ok(at<end,'truncated 7z header');return bytes[at++];};
  const integer=()=>{const first=byte();let value=0n,mask=0x80;for(let i=0;i<8;i++){if(!(first&mask))return Number(value+(BigInt(first&(mask-1))<<BigInt(8*i)));value+=BigInt(byte())<<BigInt(i*8);mask>>=1;}assert.ok(value<=BigInt(Number.MAX_SAFE_INTEGER));return Number(value);};
  const expect=id=>assert.equal(byte(),id,'unexpected 7z property');
  expect(1); // Header, not EncodedHeader (0x17, often LZMA by default).
  expect(4); // MainStreamsInfo.
  expect(6);integer();const streams=integer();expect(9);for(let i=0;i<streams;i++)integer();expect(0);
  expect(7);expect(11);const folders=integer();expect(0); // Internal Folder list.
  const result=[];
  for(let f=0;f<folders;f++){
    const count=integer(),ids=[];let inputs=0,outputs=0;
    for(let c=0;c<count;c++){
      const flags=byte();assert.equal(flags&0xc0,0,'alternative coder methods are unsupported by this verifier');
      const id=Buffer.from(Array.from({length:flags&15},byte)).toString('hex');ids.push(id);
      if(flags&0x10){inputs+=integer();outputs+=integer();}else{inputs++;outputs++;}
      if(flags&0x20){const length=integer();at+=length;assert.ok(at<=end);}
    }
    for(let n=0;n<outputs-1;n++){integer();integer();}
    if(inputs-(outputs-1)>1)for(let n=0;n<inputs-(outputs-1);n++)integer();
    result.push(ids);
  }
  return result;
}
