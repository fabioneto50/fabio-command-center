"""Stage only public runtime files; audit and source-transfer files are not published."""
from pathlib import Path
import hashlib, json, shutil
ROOT=Path(__file__).resolve().parents[1]
DEST=ROOT/'_site'
manifest=json.loads((ROOT/'asset-manifest.json').read_text())
if DEST.exists():shutil.rmtree(DEST)
DEST.mkdir()
files=set(manifest['assets'])|{'asset-manifest.json','service-worker.js','recovery.html','build-info.json','news-feed.json','.nojekyll'}
# Existing tabs may use a previous immutable build; do not delete those assets on deployment.
files.update(str(p.relative_to(ROOT)) for p in (ROOT/'release').rglob('*') if p.is_file())
for name in sorted(files):
    relative=Path(name)
    assert not relative.is_absolute() and '..' not in relative.parts
    src=ROOT/relative
    assert src.is_file() and not src.is_symlink()
    data=src.read_bytes()
    if name in manifest['assets']:
        expected=manifest['assets'][name]
        assert len(data)==expected['bytes'] and hashlib.sha256(data).hexdigest()==expected['sha256'], name
    dst=DEST/relative;dst.parent.mkdir(parents=True,exist_ok=True);dst.write_bytes(data)
print(json.dumps({'build':manifest['build'],'publicFiles':len(files),'currentManifestFiles':len(manifest['assets']),'bytes':sum((DEST/n).stat().st_size for n in files)}))
