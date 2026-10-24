import {mkdtempSync,mkdirSync,writeFileSync,readFileSync,rmSync,symlinkSync} from 'node:fs';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {execFileSync} from 'node:child_process';
import {taggedWav} from './audio.js';

// Independent libarchive writer, not the application's 7z-wasm exporter.
export function nativeArchive(files, {duplicate,link,format='7zip'} = {}) {
  const dir=mkdtempSync(join(tmpdir(),'mixdesk-djz-test-'));
  try {
    for(const [name,bytes] of Object.entries(files)) {mkdirSync(dirname(join(dir,name)),{recursive:true});writeFileSync(join(dir,name),bytes);}
    if(link)symlinkSync('default.djs',join(dir,link));
    const output=join(dir,'fixture.djz');
    execFileSync('bsdtar',['-cf',output,'--format',format,...(format==='7zip'?['--options','compression=bzip2']:[]),'-C',dir,...Object.keys(files),...(duplicate?[duplicate]:[]),...(link?[link]:[])]);
    return readFileSync(output);
  } finally {rmSync(dir,{recursive:true,force:true});}
}

export const packXml='<pack title="独立工具采样包" bpm="137.5" quant="4" quant-enabled="1" defaultSampleType="3">'+[0,1,2,3].map(g=>'<sampler idx="'+g+'">'+[0,2,4,7,10,15].flatMap((index,type)=>Math.floor(index/4)===g?['<sample idx="'+index%4+'" title="样本 '+type+'" type="'+type+'" file="'+(type%2?'right':'left')+'/tone.wav" bpm="137.5"/>']:[]).join('')+'</sampler>').join('')+'</pack>';
export function packFiles(xml=packXml) {
  const positive=taggedWav({duration:.75,tags:false}),negative=Buffer.from(positive);
  for(let p=44;p<negative.length;p+=2)negative.writeInt16LE(-negative.readInt16LE(p),p);
  return {'default.djs':xml,'left/tone.wav':positive,'right/tone.wav':negative};
}

// Small standard ustar fixtures can retain unsafe names without creating them
// anywhere on the host filesystem. Used to test rejection of real archives.
export function tarArchive(files) {
  const parts=[];
  for(const [name,content] of Object.entries(files)) {
    const bytes=Buffer.from(content),h=Buffer.alloc(512);
    h.write(name,0,100);h.write('0000644\0',100);h.write('0000000\0',108);h.write('0000000\0',116);
    h.write(bytes.length.toString(8).padStart(11,'0')+'\0',124);h.write('00000000000\0',136);
    h.fill(32,148,156);h.write('0',156);h.write('ustar\0',257);h.write('00',263);
    h.write(h.reduce((sum,b)=>sum+b,0).toString(8).padStart(6,'0')+'\0 ',148);
    parts.push(h,bytes,Buffer.alloc((512-bytes.length%512)%512));
  }
  return Buffer.concat([...parts,Buffer.alloc(1024)]);
}
