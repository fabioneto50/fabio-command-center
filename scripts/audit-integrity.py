"""Static release gate. Does not infer clinical validity from passing software checks."""
from pathlib import Path
from html.parser import HTMLParser
import json,hashlib,subprocess,re
ROOT=Path(__file__).resolve().parents[1]
checks=[]
def check(name,condition):
 checks.append({'name':name,'pass':bool(condition)})
 if not condition:raise AssertionError(name)
class Document(HTMLParser):
 def __init__(self):super().__init__();self.ids=[];self.scripts=[]
 def handle_starttag(self,tag,attrs):
  a=dict(attrs)
  if 'id'in a:self.ids.append(a['id'])
  if tag=='script' and 'src'in a:self.scripts.append(a['src'])
p=Document();p.feed((ROOT/'index.html').read_text())
check('HTML identifiers unique',len(p.ids)==len(set(p.ids)))
m=json.loads((ROOT/'asset-manifest.json').read_text())
check('Release version 1.4.0',m['version']=='1.4.0')
check('Six initial scripts',len(p.scripts)==6)
for f in p.scripts:check('Initial immutable asset '+f,f in m['assets'])
for f,expected in m['assets'].items():
 path=ROOT/f;check('Exists '+f,path.is_file())
 content=path.read_bytes();check('Hash '+f,hashlib.sha256(content).hexdigest()==expected['sha256']);check('Size '+f,len(content)==expected['bytes'])
for name,package in m['packages'].items():check('Complete package inventory '+name,all(f in m['assets'] for f in package['files']))
for file in ROOT.glob('*.js'):
 r=subprocess.run(['node','--check',str(file)],text=True,capture_output=True)
 check('JavaScript syntax '+file.name,r.returncode==0)
for f in m['assets']:
 if f.endswith('.js') and not f.endswith('fcc-store.js'):
  text=(ROOT/f).read_text()
  check('No personal plaintext storage '+f,'localStorage.setItem(' not in text and 'localStorage.getItem(' not in text)
check('No shared PIN in build metadata','PIN' not in (ROOT/'build-info.json').read_text())
check('No shared authentication hash','PIN_HASH' not in (ROOT/'personal-security-v1.js').read_text())
for name,count in [('medications',923),('cases',200),('dressings',28)]:check('Preserved '+name,len(json.loads((ROOT/'data'/f'{name}.json').read_text()))==count)
hashes=ROOT/'data'/'baseline-integrity.json'
if hashes.exists():
 for name,digest in json.loads(hashes.read_text()).items():
  check('Original clinical bytes '+name,hashlib.sha256((ROOT/'data'/name).read_bytes()).hexdigest()==digest)
check('Service worker build matches',"const BUILD='"+m['build']+"'" in (ROOT/'service-worker.js').read_text())
out=ROOT/'audit-evidence';out.mkdir(exist_ok=True);(out/'static-integrity.json').write_text(json.dumps(checks,indent=2))
print(f'STATIC_PASS {len(checks)} checks')
