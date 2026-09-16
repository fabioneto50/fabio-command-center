"""Apply a checked, idempotent engineering review delta; never personal/browser data."""
from pathlib import Path
import json,hashlib
root=Path(__file__).resolve().parents[1]
changes=json.loads((root/'scripts/review-r3.json').read_text());pending={}
for name,change in changes.items():
    p=Path(name);assert not p.is_absolute() and '..' not in p.parts and name in ['fcc-ui.css','fcc-navigation.js','home-current-news-v1.js','tests/audit-browser.py']
    target=root/p;base=target.read_text();digest=hashlib.sha256(base.encode()).hexdigest()
    if digest==change['sha256']:continue
    assert digest==change['baseSha256'],name+' source changed; reconcile before applying'
    out=[]
    for part in change['parts']:
        if isinstance(part,list):
            a,b=part;assert isinstance(a,int) and isinstance(b,int) and 0<=a<=b<=len(base)
            out.append(base[a:b])
        else:assert isinstance(part,str);out.append(part)
    text=''.join(out);assert hashlib.sha256(text.encode()).hexdigest()==change['sha256'],name+' result checksum'
    pending[target]=text
for path,text in pending.items():path.write_text(text)
print('Applied verified post-audit corrections:',len(pending))
