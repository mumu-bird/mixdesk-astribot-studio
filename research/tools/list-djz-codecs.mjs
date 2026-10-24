import fs from 'node:fs/promises';
import SevenZip from '7z-wasm';
for(const path of process.argv.slice(2)){
  const lines=[],zip=await SevenZip({print:line=>lines.push(line),printErr:line=>lines.push(line)});
  zip.FS.writeFile('/input.djz',await fs.readFile(path));
  const exit=zip.callMain(['l','-slt','/input.djz']);
  if(exit!==0)throw new Error('Cannot list '+path);
  console.log(JSON.stringify({path,listing:lines.join('\n')}));
}
