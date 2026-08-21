#!/usr/bin/env python3
import collections
import pathlib
import re
import sys

ROOT=pathlib.Path(__file__).resolve().parents[1]
CATALOG=ROOT/'wound-dressings-v1.js'
IMAGE_MODULE=ROOT/'wound-dressings-images-v2.js'
HUB=ROOT/'navigation-hub.js'
ALL_CHUNKS=sorted(ROOT.glob('wound-images-chunk-*.js'))

catalog_text=CATALOG.read_text(encoding='utf-8')
products=re.findall(r"\{name:'((?:\\'|[^'])+)'",catalog_text)
products=[x.replace("\\'", "'") for x in products]

hub_text=HUB.read_text(encoding='utf-8')
active_names=re.findall(r"'(wound-images-chunk-[^']+\.js)'",hub_text)
ACTIVE_CHUNKS=[ROOT/name for name in active_names]
dormant=[p.name for p in ALL_CHUNKS if p.name not in active_names]

counter=collections.Counter()
locations=collections.defaultdict(list)
for chunk in ACTIVE_CHUNKS:
    text=chunk.read_text(encoding='utf-8')
    for name in re.findall(r'"([^"]+)":"data:image/(?:webp|png|jpeg|jpg);base64,',text):
        counter[name]+=1
        locations[name].append(chunk.name)

missing=[p for p in products if counter[p]==0]
duplicates=[p for p in products if counter[p]>1]
extras=[k for k in counter if k not in products]
module_text=IMAGE_MODULE.read_text(encoding='utf-8')
remote_urls=re.findall(r'https?://[^\'"`\s]+',module_text)
missing_chunks=[p.name for p in ACTIVE_CHUNKS if not p.exists()]

print('Products in wound catalogue:',len(products))
print('Active embedded image keys:',len(counter))
print('Active image chunks:',len(ACTIVE_CHUNKS),[p.name for p in ACTIVE_CHUNKS])
print('Dormant image chunks ignored by runtime:',dormant or 'none')
print('Missing active chunk files:',missing_chunks or 'none')
print('Missing product images:',missing or 'none')
print('Duplicate active product images:',{p:locations[p] for p in duplicates} or 'none')
print('Extra active embedded image keys:',extras or 'none')
print('Remote image URLs in active gallery module:',remote_urls or 'none')

ok=(len(products)>=20 and len(counter)==len(products) and not missing_chunks and not missing and not duplicates and not extras and not remote_urls)
print('Wound image audit:', 'PASS' if ok else 'FAIL')
sys.exit(0 if ok else 1)
