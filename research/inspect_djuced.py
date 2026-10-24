"""Read-only inspection of the installed DJUCED bundle; never executes it."""
from pathlib import Path
from collections import Counter
import csv
import hashlib
import json
import plistlib
import re
import subprocess
import xml.etree.ElementTree as ET

ROOT = Path('/Applications/DJUCED/DJUCED.app')
OUT = Path(__file__).resolve().parent / 'evidence'
OUT.mkdir(parents=True, exist_ok=True)
info = plistlib.loads((ROOT / 'Contents/Info.plist').read_bytes())
exe = ROOT / 'Contents/MacOS' / info['CFBundleExecutable']
digest = hashlib.sha256()
with exe.open('rb') as f:
    for block in iter(lambda: f.read(1024 * 1024), b''):
        digest.update(block)
files = []
for p in sorted(ROOT.rglob('*')):
    if p.is_file() and not p.is_symlink():
        files.append({'path': str(p.relative_to(ROOT)), 'size': p.stat().st_size})
dependencies = subprocess.check_output(['otool', '-arch', 'arm64', '-L', str(exe)], text=True)
(OUT / 'dependencies-arm64.txt').write_text(dependencies)
symbols = subprocess.check_output(['nm', '-arch', 'arm64', '-g', str(exe)], text=True)
demangled = subprocess.run(['xcrun', 'c++filt'], input=symbols, capture_output=True, text=True, check=True).stdout
relevant = [s for s in demangled.splitlines() if re.search(r'BassStream|TempoClock|StemsManager|Waveform|BPM|BeatGrid|CrossFader|Crossfader|AudioCue|LoopManager', s) and len(s) < 600]
(OUT / 'audio-symbols-arm64.txt').write_text('\n'.join(relevant) + '\n')
maps = []
controllers = []
for p in sorted((ROOT / 'Contents/Resources/midi').glob('*.djm')):
    root = ET.parse(p).getroot()
    entries = list(root.iter('map'))
    controllers.append({'file': p.name, 'name': root.get('name'), 'mapping_count': len(entries)})
    for e in entries:
        action = e.get('action', '')
        match = re.search(r'\baction=([^\s]+)', action)
        maps.append({'file': p.name, 'control': e.get('name', ''), 'action_name': match.group(1) if match else '', 'expression': action})
with (OUT / 'controller-mappings.csv').open('w', newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['file', 'control', 'action_name', 'expression'])
    writer.writeheader()
    writer.writerows(maps)
data = {
    'app': str(ROOT), 'version': info['CFBundleShortVersionString'],
    'build': info['CFBundleVersion'], 'binary_sha256': digest.hexdigest(),
    'binary_size': exe.stat().st_size, 'architectures': ['x86_64', 'arm64'],
    'file_count': len(files), 'files': files,
    'global_symbol_line_count': len(symbols.splitlines()), 'selected_symbol_count': len(relevant),
    'controllers': controllers,
    'mapping_count': len(maps), 'actions': dict(Counter(m['action_name'] for m in maps if m['action_name']).most_common()),
    'limitations': ['Static inspection only; no runtime call tracing.', 'Symbols and linked libraries do not establish complete implementation.', 'Original source code has not been recovered.'],
}
(OUT / 'inventory.json').write_text(json.dumps(data, ensure_ascii=False, indent=2))
print(json.dumps({k: v for k, v in data.items() if k not in ['files','controllers','actions']}, ensure_ascii=False, indent=2))
print('Sample actions:', ', '.join(list(data['actions'])[:35]))
