#!/usr/bin/env python3
import base64
import collections
import json
import pathlib
import re
import sys

ROOT=pathlib.Path(__file__).resolve().parents[1]
CATALOG=ROOT/'wound-dressings-v1.js'
LOCAL_DATA=ROOT/'wound-dressings-local-data-v1.js'
MEDIA_MODEL=ROOT/'wound-dressings-media-model-v1.js'
IMAGE_SHIM=ROOT/'wound-dressings-images-v2.js'
BUNDLE=ROOT/'wound-images-user-v4.json'
HUB=ROOT/'navigation-hub.js'
ALL_CHUNKS=sorted(ROOT.glob('wound-images-chunk-*.js'))

catalog_text=CATALOG.read_text(encoding='utf-8')
base_products=re.findall(r"\{name:'((?:\\'|[^'])+)'",catalog_text)
base_products=[x.replace("\\'", "'") for x in base_products]

media_text=MEDIA_MODEL.read_text(encoding='utf-8') if MEDIA_MODEL.exists() else ''
expected_block=re.search(r"const EXPECTED=\{(.*?)\};",media_text,re.S)
expected={}
if expected_block:
    expected={name.replace("\\'", "'"):int(count) for name,count in re.findall(r"'((?:\\'|[^'])+)':(\d+)",expected_block.group(1))}
rename_block=re.search(r"const RENAMES=\{(.*?)\};",media_text,re.S)
renames={}
if rename_block:
    renames={a.replace("\\'", "'"):b.replace("\\'", "'") for a,b in re.findall(r"'((?:\\'|[^'])+)':'((?:\\'|[^'])+)'",rename_block.group(1))}
canonical=lambda name: renames.get(name,name)

local_text=LOCAL_DATA.read_text(encoding='utf-8') if LOCAL_DATA.exists() else ''
mepitel_match=re.search(r"const MEPITEL=\{\s*name:'((?:\\'|[^'])+)'",local_text,re.S)
mepitel_name=mepitel_match.group(1).replace("\\'", "'") if mepitel_match else None
final_products=[canonical(name) for name in base_products]
if mepitel_name and mepitel_name not in final_products:
    final_products.append(mepitel_name)

bundle_error=''
bundle_format=''
bundle_products={}
try:
    payload=json.loads(BUNDLE.read_text(encoding='utf-8'))
    bundle_format=payload.get('format','')
    bundle_products=payload.get('products') or {}
    if not isinstance(bundle_products,dict):
        bundle_error='products is not an object'
        bundle_products={}
except Exception as exc:
    bundle_error=str(exc)

raw_valid_counts={}
invalid_items=[]
for name,items in bundle_products.items():
    if not isinstance(items,list):
        invalid_items.append((name,'not-list'))
        raw_valid_counts[name]=0
        continue
    count=0
    for i,b64 in enumerate(items):
        valid=False
        if isinstance(b64,str) and len(b64)>=64:
            try:
                raw=base64.b64decode(b64[:128]+'===',validate=False)
                valid=b'ftypavif' in raw
            except Exception:
                valid=False
        if valid:
            count+=1
        else:
            invalid_items.append((name,i))
    raw_valid_counts[name]=count

valid_counts=collections.Counter()
for name,count in raw_valid_counts.items():
    valid_counts[canonical(name)]+=count

missing_products=[name for name in final_products if valid_counts.get(name,0)==0]
short_products={name:{'expected':count,'found':valid_counts.get(name,0)} for name,count in expected.items() if valid_counts.get(name,0)<count}
over_products={name:{'expected':count,'found':valid_counts.get(name,0)} for name,count in expected.items() if valid_counts.get(name,0)>count}
extra_products=[name for name in valid_counts if name not in expected]
expected_not_catalogue=[name for name in expected if name not in final_products]
catalogue_not_expected=[name for name in final_products if name not in expected]
expected_total=sum(expected.values())
bundle_total=sum(valid_counts.values())

hub_text=HUB.read_text(encoding='utf-8')
active_names=re.findall(r"'(wound-images-chunk-[^']+\.js)'",hub_text)
ACTIVE_CHUNKS=[ROOT/name for name in active_names]
missing_chunks=[p.name for p in ACTIVE_CHUNKS if not p.exists()]
dormant=[p.name for p in ALL_CHUNKS if p.name not in active_names]
fallback_counter=collections.Counter()
for chunk in ACTIVE_CHUNKS:
    if not chunk.exists():
        continue
    text=chunk.read_text(encoding='utf-8')
    for name in re.findall(r'["\']([^"\']+)["\']\s*:\s*["\']data:image/(?:avif|webp|png|jpeg|jpg);base64,',text):
        fallback_counter[name]+=1

remote_urls=re.findall(r'https?://[^\'"`\s]+',media_text)
shim_text=IMAGE_SHIM.read_text(encoding='utf-8') if IMAGE_SHIM.exists() else ''
model_wired=('wound-dressings-media-model-v1.js' in shim_text and 'wound-dressings-images-v2.js' in hub_text)
modular_storage=('extendDressings' in media_text and 'images' in media_text and 'FCCContent' in media_text)

print('Base products in wound catalogue:',len(base_products))
print('Final runtime products:',len(final_products))
print('Expected modular image products:',len(expected))
print('Expected total images:',expected_total)
print('Bundle format:',bundle_format or 'missing')
print('Bundle valid AVIF images:',bundle_total)
print('Bundle load/parse error:',bundle_error or 'none')
print('Missing product images:',missing_products or 'none')
print('Products below expected image count:',short_products or 'none')
print('Products above expected image count:',over_products or 'none')
print('Invalid bundle image entries:',invalid_items or 'none')
print('Extra bundle products after canonical rename:',extra_products or 'none')
print('Expected products absent from final catalogue:',expected_not_catalogue or 'none')
print('Final catalogue products absent from EXPECTED:',catalogue_not_expected or 'none')
print('Modular media model wired:',model_wired)
print('Storage model uses FCCContent/product.images:',modular_storage)
print('Active fallback image chunks:',len(ACTIVE_CHUNKS),[p.name for p in ACTIVE_CHUNKS])
print('Fallback embedded image keys:',len(fallback_counter))
print('Dormant fallback chunks ignored by runtime:',dormant or 'none')
print('Missing active fallback chunk files:',missing_chunks or 'none')
print('Remote image URLs in active modular gallery:',remote_urls or 'none')

ok=(
    len(final_products)==28
    and len(expected)==28
    and set(final_products)==set(expected)
    and bundle_format=='avif'
    and not bundle_error
    and bundle_total==expected_total==46
    and not missing_products
    and not short_products
    and not over_products
    and not invalid_items
    and not extra_products
    and not expected_not_catalogue
    and not catalogue_not_expected
    and model_wired
    and modular_storage
    and not missing_chunks
    and not fallback_counter
    and not remote_urls
)
print('Wound image audit:', 'PASS' if ok else 'FAIL')
sys.exit(0 if ok else 1)
