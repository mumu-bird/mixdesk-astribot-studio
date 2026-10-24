"""Verify actual DJUCED-installed audio against a separately unpacked DJZ.
No files are copied into DJUCED here: installation must be done by the app.
"""
import hashlib,io,json,pathlib,subprocess,sys,wave,xml.etree.ElementTree as ET
archive=pathlib.Path(sys.argv[1]).resolve()
installed=pathlib.Path(sys.argv[2]).resolve()
def unpack(name):
 return subprocess.check_output(['bsdtar','-xOf',str(archive),name])
expected_xml=unpack('default.djs')
root=ET.fromstring(expected_xml)
assert (installed/'default.djs').read_bytes()==expected_xml,'Native installed XML differs'
results=[]
for group in root.findall('sampler'):
 for sample in group.findall('sample'):
  name=sample.attrib['file'];source=unpack(name);actual=(installed/name).read_bytes()
  with wave.open(io.BytesIO(source)) as f: fmt=f.getparams();expected_pcm=f.readframes(f.getnframes())
  with wave.open(io.BytesIO(actual)) as f: actual_fmt=f.getparams();actual_pcm=f.readframes(f.getnframes())
  assert fmt==actual_fmt and expected_pcm==actual_pcm,name+' PCM or format differs'
  results.append({'group':int(group.attrib['idx']),'cell':int(sample.attrib['idx']),'type':int(sample.attrib['type']),'file':name,'bpm':sample.attrib['bpm'],'frames':fmt.nframes,'channels':fmt.nchannels,'sample_rate':fmt.framerate,'pcm_equal':True,'pcm_sha256':hashlib.sha256(actual_pcm).hexdigest(),'native_file_changed':source!=actual})
assert len(results)==6,'Expected the six-mode interoperability fixture'
print(json.dumps({'archive':str(archive),'archive_sha256':hashlib.sha256(archive.read_bytes()).hexdigest(),'installed':str(installed),'pack_title':root.attrib['title'],'pack_bpm':root.attrib.get('bpm'),'quant':root.attrib.get('quant'),'quant_enabled':root.attrib.get('quant-enabled'),'default_type':root.attrib.get('defaultSampleType'),'descriptor_equal':True,'samples':results},ensure_ascii=False,indent=2))
