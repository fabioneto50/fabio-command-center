#!/usr/bin/env python3
import collections
import pathlib
import re
import sys

ROOT=pathlib.Path(__file__).resolve().parents[1]
CATALOG=ROOT/'wound-dressings-v1.js'
IMAGE_MODULE=ROOT/'wound-dressings-images-v2.js'
CHUNKS=sorted(ROOT.glob('wound-images-chunk-*.js'))

catalog_text=CATALOG.read_text(encoding='utf-8')
products=re.findall(r"\{name:'((?:\\'|[^'])+)'",catalog_text)
products=[x.replace("\\'", "'") for x in products]

counter=collections.Counter()
for chunk in CHUNKS:
    text=chunk.read_text(encoding='utf-8')
    for name in re.findall(r'"([^"]+)":"data:image/(?:webp|png|jpeg|jpg);base64,',text):
        counter[name]+=1

missing=[p for p in products if counter[p]==0]
duplicates=[p for p in products if counter[p]>1]
extras=[k for k in counter if k not in products]
module_text=IMAGE_MODULE.read_text(encoding='utf-8')
remote_urls=re.findall(r'https?://[^\'"`\s]+',module_text)

print('Products in wound catalogue:',len(products))
print('Embedded image keys:',len(counter))
print('Image chunks:',len(CHUNKS))
print('Missing product images:',missing or 'none')
print('Duplicate product images:',duplicates or 'none')
print('Extra embedded image keys:',extras or 'none')
print('Remote image URLs in active gallery module:',remote_urls or 'none')

ok=(len(products)>=20 and not missing and not duplicates and not remote_urls)
print('Wound image audit:', 'PASS' if ok else 'FAIL')
sys.exit(0 if ok else 1)
