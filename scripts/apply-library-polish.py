"""Apply the exact reviewed UI sources, never user data. Idempotent, checksum verified."""
from pathlib import Path
import gzip, hashlib, json
root=Path(__file__).resolve().parents[1]
packed=(root/'scripts/library-polish-source.json.gz').read_bytes()
assert len(packed)==11867 and hashlib.sha256(packed).hexdigest()=='9e6533f531f2b1d9dd2ccbe48bac12d51d1a408a5f0c66f75e2057f8fd225d74'
raw=gzip.decompress(packed);assert len(raw)==34635
changes=json.loads(raw)
allowed={'build-info.json','dilutions-cuf-v6.js','fcc-areas.js','fcc-design.css','fcc-favorites.js','fcc-navigation.js','fcc-personal.js','fcc-store.js','fcc-ui.css','home-current-news-v1.js','personal-security-v1.js','tests/audit-browser.py','tests/audit-design.py','tests/audit-library.py','tests/audit-unit.mjs','tests/audit-polish.py'}
assert set(changes)==allowed
marker=root/'scripts/library-polish-applied.json'
if marker.exists():
    assert json.loads(marker.read_text())['sourceTransferSha256']==hashlib.sha256(packed).hexdigest()
    print('Reviewed source migration already applied; subsequent source corrections are preserved.')
else:
    pending={}
    for name,item in changes.items():
        target=root/name
        base=target.read_text() if target.exists() else ''
        if hashlib.sha256(base.encode()).hexdigest()==item['sha256']:continue
        if 'parts' in item:
            assert hashlib.sha256(base.encode()).hexdigest()==item['baseSha256'],name+' changed; reconcile before applying'
            parts=[]
            for part in item['parts']:
                if isinstance(part,list):
                    a,b=part;assert isinstance(a,int) and isinstance(b,int) and 0<=a<=b<=len(base)
                    parts.append(base[a:b])
                else:assert isinstance(part,str);parts.append(part)
            content=''.join(parts)
        else:content=item['content']
        assert hashlib.sha256(content.encode()).hexdigest()==item['sha256'],name+' output checksum'
        pending[target]=content
    for target,content in pending.items():
        target.parent.mkdir(parents=True,exist_ok=True);target.write_text(content)
    marker.write_text(json.dumps({'sourceTransferSha256':hashlib.sha256(packed).hexdigest(),'files':{name:item['sha256'] for name,item in changes.items()},'note':'Initial readable source migration complete; later changes tracked normally in Git.'},indent=2))
    print('Applied',len(pending),'verified readable source files. No clinical records were rewritten.')
