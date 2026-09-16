"""Apply a checksummed, idempotent engineering patch. No network or personal data."""
from pathlib import Path
import hashlib,json
root=Path(__file__).resolve().parents[1]
allowed={'fcc-navigation.js','fcc-medications.js','fcc-offline.js','service-worker.template.js','scripts/build-assets.cjs','tests/audit-browser.py','tests/audit-upgrade.py','fcc-store.js','app.js','fcc-content-core-v1.js','tests/audit-unit.mjs'}
delta=json.loads((root/'scripts/review-final.json').read_text());pending={}
for name,item in delta.items():
    assert name in allowed
    path=root/name;base=path.read_text();digest=hashlib.sha256(base.encode()).hexdigest()
    if digest==item['sha256']:continue
    assert digest==item['baseSha256'],name+' changed since review'
    parts=[]
    for part in item['parts']:
        if isinstance(part,list):
            a,b=part;assert isinstance(a,int) and isinstance(b,int) and 0<=a<=b<=len(base)
            parts.append(base[a:b])
        else:assert isinstance(part,str);parts.append(part)
    text=''.join(parts);assert hashlib.sha256(text.encode()).hexdigest()==item['sha256'],name+' checksum'
    pending[path]=text
for path,text in pending.items():path.write_text(text)
print('Applied verified final-review changes:',len(pending))
