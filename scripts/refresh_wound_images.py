#!/usr/bin/env python3
import hashlib, io, json, re, unicodedata
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup
from PIL import Image, ImageOps

try:
    import fitz
except Exception:
    fitz = None

ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / 'wound-dressings-v1.js'
OUT = ROOT / 'assets' / 'wound-images' / 'hq'
MANIFEST = ROOT / 'wound-images-hq-v3.json'
REPORT = ROOT / 'wound-images-hq-report.txt'
UA = 'Mozilla/5.0 (compatible; FabioCommandCenterImageRefresh/3.1; +https://github.com/fabioneto50/fabio-command-center)'
SESSION = requests.Session(); SESSION.headers.update({'User-Agent': UA, 'Accept-Language':'pt-PT,pt;q=0.9,en;q=0.7','Accept':'text/html,application/xhtml+xml,image/avif,image/webp,image/apng,*/*;q=0.8'})
MIN_AREA = 90000
MIN_EDGE = 150
MAX_EDGE = 1800

OVERRIDES = {
    'Inadine®': ['https://www.solventum.com/pt-pt/home/f/b5005265097/','https://www.solventum.com/en-sg/home/v/v101264711/'],
    'Melgisorb® Plus': ['https://www.molnlycke.com/en-us/products/wound-care/alginate-fiber-dressings/melgisorb-plus?variantId=252000'],
    'Mepilex®': ['https://www.molnlycke.com/pt-pt/produtos/tratamento-de-feridas/pensos-espuma-sem-rebordo/mepilex/'],
    'Mepilex® Border': ['https://www.molnlycke.com/en-us/products/wound-care/bordered-foam-dressings/mepilex-border-flex/'],
    'Mepilex® Heel': ['https://www.molnlycke.com/en-gb/products/wound-care/non-bordered-foam-dressings/mepilex-heel-2/'],
    'Aquacel® Extra': ['https://www.convatec.com/products/advanced-wound-care/aquacel-extra-hydrofiber-dressing/'],
    'Aquacel® Ag+ Extra': ['https://www.convatec.com/products/advanced-wound-care/aquacel-ag-extra-dressing/'],
    'Atrauman® Ag': ['https://www.hartmann.info/en/products/wound-management/contact-layers/atrauman%C2%AE-ag'],
}

STOP = {'aposito','penso','material','com','sem','para','plus','extra','standard','flex','life','gel','the','and','silver'}
PACK_WORDS = ('pack','package','packaging','box','carton','embalagem','caixa','pouch','sachet')
DRESS_WORDS = ('dressing','apósito','aposito','gaze','foam','sponge','matrix','pad','sheet','gel','gauze','curativo')
BAD_WORDS = ('logo','icon','sprite','avatar','favicon','banner','flag','social','youtube','facebook','instagram','linkedin')


def fold(s):
    s = unicodedata.normalize('NFD', str(s or ''))
    return ''.join(c for c in s if unicodedata.category(c) != 'Mn').lower()

def slug(s):
    return re.sub(r'[^a-z0-9]+','-',fold(s)).strip('-')[:80] or 'image'

def product_tokens(name):
    return [x for x in re.findall(r'[a-z0-9]+', fold(name)) if len(x)>2 and x not in STOP]

def parse_catalog():
    text = CATALOG.read_text(encoding='utf-8')
    out=[]
    pat = re.compile(r"\{name:'((?:\\'|[^'])+)'.*?links:\[(.*?)\]\}", re.S)
    for m in pat.finditer(text):
        name=m.group(1).replace("\\'", "'")
        urls=re.findall(r"'([^']+)'",m.group(2))
        out.append((name, urls))
    return out

def recursive_images(obj, result):
    if isinstance(obj, dict):
        for k,v in obj.items():
            if k.lower() in ('image','images','thumbnailurl','contenturl'):
                if isinstance(v,str): result.append((v,'json-ld'))
                elif isinstance(v,list):
                    for q in v:
                        if isinstance(q,str): result.append((q,'json-ld'))
                        elif isinstance(q,dict): recursive_images(q,result)
                elif isinstance(v,dict): recursive_images(v,result)
            else: recursive_images(v,result)
    elif isinstance(obj,list):
        for v in obj: recursive_images(v,result)

def candidate_score(url, hint, name):
    text=fold(url+' '+hint); score=0
    for t in product_tokens(name):
        if t in text: score += 35
    if any(w in text for w in PACK_WORDS): score += 18
    if any(w in text for w in DRESS_WORDS): score += 20
    if any(w in text for w in BAD_WORDS): score -= 150
    if any(x in text for x in ('hero','product','prod','gallery','zoom','large','original')): score += 12
    if any(x in text for x in ('thumb','thumbnail','small','64x','100x','150x')): score -= 20
    return score

def html_candidates(url, html, name):
    soup=BeautifulSoup(html,'html.parser'); raw=[]
    for key in ('og:image','og:image:secure_url','twitter:image','twitter:image:src'):
        for tag in soup.find_all('meta',attrs={'property':key})+soup.find_all('meta',attrs={'name':key}):
            if tag.get('content'): raw.append((tag['content'],key))
    for sc in soup.find_all('script',attrs={'type':'application/ld+json'}):
        try: recursive_images(json.loads(sc.string or ''),raw)
        except Exception: pass
    for img in soup.find_all('img'):
        hint=' '.join(filter(None,[img.get('alt'),img.get('title'),img.get('class') and ' '.join(img.get('class'))]))
        for a in ('src','data-src','data-original','data-lazy-src','data-zoom-image'):
            if img.get(a): raw.append((img.get(a),hint))
        for a in ('srcset','data-srcset'):
            if img.get(a):
                for part in img.get(a).split(','): raw.append((part.strip().split()[0],hint))
    for src in soup.find_all('source'):
        if src.get('srcset'):
            for part in src.get('srcset').split(','): raw.append((part.strip().split()[0],'picture'))
    seen=set(); final=[]
    for u,h in raw:
        if not u or u.startswith('data:'): continue
        u=urljoin(url,u)
        if u in seen: continue
        seen.add(u); final.append((candidate_score(u,h,name),u,h))
    return sorted(final,reverse=True)[:60]

def fetch(url, timeout=25, referer=None):
    headers={'Referer':referer} if referer else None
    r=SESSION.get(url,timeout=timeout,allow_redirects=True,headers=headers)
    r.raise_for_status(); return r

def open_image_bytes(data):
    im=Image.open(io.BytesIO(data)); im=ImageOps.exif_transpose(im)
    if im.mode not in ('RGB','RGBA'): im=im.convert('RGB')
    return im

def image_entry_from_bytes(data, name, source_page, origin_hint, idx, seen_hashes):
    try: im=open_image_bytes(data)
    except Exception: return None
    w,h=im.size
    if w*h < MIN_AREA or min(w,h)<MIN_EDGE: return None
    if max(w,h)>MAX_EDGE:
        im.thumbnail((MAX_EDGE,MAX_EDGE),Image.Resampling.LANCZOS); w,h=im.size
    rgb=im.convert('RGB'); bio=io.BytesIO(); rgb.save(bio,format='WEBP',quality=92,method=6)
    payload=bio.getvalue(); digest=hashlib.sha256(payload).hexdigest()
    if digest in seen_hashes: return None
    seen_hashes.add(digest)
    text=fold(origin_hint)
    if any(x in text for x in PACK_WORDS): label='Embalagem'
    elif any(x in text for x in DRESS_WORDS): label='Produto / apósito'
    else: label='Produto / vista '+str(idx)
    filename=f'{slug(name)}-{idx:02d}.webp'; path=OUT/filename; path.write_bytes(payload)
    return {'src':'./assets/wound-images/hq/'+filename,'label':label,'width':w,'height':h,'source_page':source_page,'bytes':len(payload)}

def collect_pdf_bytes(data, page, name, slots, seen_hashes):
    if fitz is None: return
    try: doc=fitz.open(stream=data,filetype='pdf')
    except Exception: return
    candidates=[]
    for pno,p in enumerate(doc):
        for im in p.get_images(full=True):
            try:
                info=doc.extract_image(im[0]); raw=info.get('image',b''); pil=open_image_bytes(raw); w,h=pil.size
                if w*h>=MIN_AREA and min(w,h)>=MIN_EDGE: candidates.append((w*h,raw,f'PDF página {pno+1}'))
            except Exception: pass
    for _,raw,hint in sorted(candidates,reverse=True):
        if len(slots)>=2: break
        ent=image_entry_from_bytes(raw,name,page,hint,len(slots)+1,seen_hashes)
        if ent: ent['score']=5; slots.append(ent)

def collect_html(page, name, slots, seen_hashes):
    try: r=fetch(page)
    except Exception: return
    ctype=fold(r.headers.get('content-type',''))
    if 'pdf' in ctype or r.url.lower().split('?')[0].endswith('.pdf'):
        return collect_pdf_bytes(r.content,r.url,name,slots,seen_hashes)
    if 'html' not in ctype and not r.text.lstrip().startswith('<'): return
    for score,u,hint in html_candidates(r.url,r.text,name):
        if len(slots)>=2: break
        try:
            ir=fetch(u,20,r.url); ct=fold(ir.headers.get('content-type',''))
            if 'svg' in ct: continue
            ent=image_entry_from_bytes(ir.content,name,r.url,u+' '+hint,len(slots)+1,seen_hashes)
            if ent: ent['score']=score; slots.append(ent)
        except Exception: continue

def main():
    OUT.mkdir(parents=True,exist_ok=True)
    for f in OUT.glob('*.webp'): f.unlink()
    products={}; lines=[]; catalog=parse_catalog()
    if len(catalog)<20: raise SystemExit(f'Catalog parsing failed: only {len(catalog)} products')
    success=two=0
    for name,urls in catalog:
        slots=[]; seen=set(); sources=[]
        for u in OVERRIDES.get(name,[])+urls:
            if u not in sources: sources.append(u)
        for page in sources:
            if len(slots)>=2: break
            try: collect_html(page,name,slots,seen)
            except Exception as e: lines.append(f'WARN {name}: {page}: {e}')
        slots=sorted(slots,key=lambda x:(x.get('score',0),x['width']*x['height']),reverse=True)[:2]
        if slots:
            success+=1
            if len(slots)>=2: two+=1
            if not any(x['label']=='Produto / apósito' for x in slots): slots[0]['label']='Produto / apósito'
            if len(slots)>1 and slots[1]['label']=='Produto / apósito': slots[1]['label']='Embalagem / vista alternativa'
        products[name]={'images':slots,'document_fallback':True,'sources':sources}
        dims=', '.join(f"{x['label']} {x['width']}x{x['height']}" for x in slots) or 'fallback documental'
        lines.append(f'{name}: {dims}')
    manifest={'version':'3.1','generated_at':datetime.now(timezone.utc).isoformat(),'product_count':len(catalog),'hq_product_count':success,'two_image_product_count':two,'products':products}
    MANIFEST.write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    REPORT.write_text('\n'.join(['Fábio Command Center · wound dressing HQ image refresh',f"Generated: {manifest['generated_at']}",f"Products: {len(catalog)}",f"Products with HQ image: {success}",f"Products with 2 HQ images: {two}",'',*lines,'']),encoding='utf-8')
    print(REPORT.read_text(encoding='utf-8'))
    if success < len(catalog):
        print(f'WARNING: HQ coverage partial ({success}/{len(catalog)}); document fallback remains active for missing products.')
    return 0

if __name__=='__main__': raise SystemExit(main())
