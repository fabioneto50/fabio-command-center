#!/usr/bin/env python3
import collections,json,pathlib,re,sys
ROOT=pathlib.Path(__file__).resolve().parents[1]
CATALOG=ROOT/'wound-dressings-v1.js'; LOCAL_DATA=ROOT/'wound-dressings-local-data-v1.js'; MEDIA_MODEL=ROOT/'wound-dressings-media-model-v1.js'; IMAGE_SHIM=ROOT/'wound-dressings-images-v2.js'; MANIFEST=ROOT/'wound-images-curated-v1.json'; HUB=ROOT/'navigation-hub.js'; ASSET_ROOT=ROOT/'assets'/'wound-images'/'user-final'; ALL_CHUNKS=sorted(ROOT.glob('wound-images-chunk-*.js'))
catalog_text=CATALOG.read_text(encoding='utf-8'); base_products=re.findall(r"\{name:'((?:\\'|[^'])+)'",catalog_text); base_products=[x.replace("\\'", "'") for x in base_products]
media_text=MEDIA_MODEL.read_text(encoding='utf-8') if MEDIA_MODEL.exists() else ''
block=re.search(r"const EXPECTED=\{(.*?)\};",media_text,re.S); expected={name.replace("\\'", "'"):int(count) for name,count in re.findall(r"'((?:\\'|[^'])+)':(\d+)",block.group(1))} if block else {}
rblock=re.search(r"const RENAMES=\{(.*?)\};",media_text,re.S); renames={a.replace("\\'", "'"):b.replace("\\'", "'") for a,b in re.findall(r"'((?:\\'|[^'])+)':'((?:\\'|[^'])+)'",rblock.group(1))} if rblock else {}; canonical=lambda name:renames.get(name,name)
local_text=LOCAL_DATA.read_text(encoding='utf-8') if LOCAL_DATA.exists() else ''; mm=re.search(r"const MEPITEL=\{\s*name:'((?:\\'|[^'])+)'",local_text,re.S); mepitel=mm.group(1).replace("\\'", "'") if mm else None
final_products=[canonical(x) for x in base_products]; final_products.append(mepitel) if mepitel and mepitel not in final_products else None
error=''; payload={}; products={}
try:
 payload=json.loads(MANIFEST.read_text(encoding='utf-8')); products=payload.get('products') or {}; assert isinstance(products,dict)
except Exception as exc: error=str(exc); products={}
invalid=[]; missing_files=[]; invalid_files=[]; remote=[]; counts=collections.Counter(); refs=[]
for raw_name,record in products.items():
 name=canonical(raw_name); images=record.get('images') if isinstance(record,dict) else None
 if not isinstance(images,list): invalid.append((raw_name,'images-not-list')); continue
 for i,item in enumerate(images):
  if not isinstance(item,dict): invalid.append((raw_name,i,'not-object')); continue
  src=item.get('src','')
  if not isinstance(src,str) or not src.startswith('./assets/wound-images/user-final/'): invalid.append((raw_name,i,'invalid-src')); continue
  if src.startswith(('http:','https:','data:')): remote.append((raw_name,i)); continue
  rel=src[2:]; path=ROOT/rel; refs.append(rel)
  if not path.is_file(): missing_files.append(rel); continue
  raw=path.read_bytes(); ext=path.suffix.lower(); valid=(ext=='.webp' and len(raw)>=12 and raw[:4]==b'RIFF' and raw[8:12]==b'WEBP') or (ext=='.avif' and b'ftypavif' in raw[:64])
  if not valid: invalid_files.append(rel); continue
  if item.get('verified') is not True or item.get('local') is not True: invalid.append((raw_name,i,'not-verified-local')); continue
  counts[name]+=1
assets=sorted(str(p.relative_to(ROOT)) for p in ASSET_ROOT.iterdir() if p.is_file()) if ASSET_ROOT.is_dir() else []; unref=sorted(set(assets)-set(refs)); dup=sorted(k for k,v in collections.Counter(refs).items() if v>1)
missing_products=[n for n in final_products if counts.get(n,0)==0]; short={n:{'expected':c,'found':counts.get(n,0)} for n,c in expected.items() if counts.get(n,0)<c}; over={n:{'expected':c,'found':counts.get(n,0)} for n,c in expected.items() if counts.get(n,0)>c}; extra=[n for n in counts if n not in expected]; expected_not=[n for n in expected if n not in final_products]; catalogue_not=[n for n in final_products if n not in expected]; expected_total=sum(expected.values()); total=sum(counts.values())
hub=HUB.read_text(encoding='utf-8'); active=re.findall(r"'(wound-images-chunk-[^']+\.js)'",hub); active_paths=[ROOT/n for n in active]; missing_chunks=[p.name for p in active_paths if not p.exists()]; fallback=collections.Counter()
for p in active_paths:
 if p.exists():
  text=p.read_text(encoding='utf-8'); fallback.update(re.findall(r'["\']([^"\']+)["\']\s*:\s*["\']data:image/(?:avif|webp|png|jpeg|jpg);base64,',text))
shim=IMAGE_SHIM.read_text(encoding='utf-8') if IMAGE_SHIM.exists() else ''; wired=('wound-dressings-media-model-v1.js' in shim and 'wound-dressings-images-v2.js' in hub); modular=('extendDressings' in media_text and 'images' in media_text and 'FCCContent' in media_text); staging=(ROOT/'wound-photo-chunks').exists()
print('Base products in wound catalogue:',len(base_products)); print('Final runtime products:',len(final_products)); print('Expected modular image products:',len(expected)); print('Expected total images:',expected_total); print('Manifest version:',payload.get('version','missing')); print('Manifest metadata products/images:',payload.get('product_count'),payload.get('image_count')); print('Manifest source policy:',payload.get('source_policy','missing')); print('Manifest load/parse error:',error or 'none'); print('Validated local image files:',total); print('Physical files in user-final:',len(assets)); print('Missing product images:',missing_products or 'none'); print('Products below expected image count:',short or 'none'); print('Products above expected image count:',over or 'none'); print('Invalid manifest entries:',invalid or 'none'); print('Missing referenced files:',missing_files or 'none'); print('Invalid local image files:',invalid_files or 'none'); print('Remote/data image entries:',remote or 'none'); print('Duplicate asset references:',dup or 'none'); print('Unreferenced user-final assets:',unref or 'none'); print('Extra manifest products:',extra or 'none'); print('Expected products absent from final catalogue:',expected_not or 'none'); print('Final catalogue products absent from EXPECTED:',catalogue_not or 'none'); print('Modular media model wired:',wired); print('Storage model uses FCCContent/product.images:',modular); print('Active legacy image chunks:',len(active),active); print('Fallback embedded image keys:',len(fallback)); print('Missing active fallback chunk files:',missing_chunks or 'none'); print('Temporary wound-photo staging exists:',staging)
ok=(len(final_products)==28 and len(expected)==28 and set(final_products)==set(expected) and not error and payload.get('product_count')==28 and payload.get('image_count')==46 and payload.get('source_policy')=='user-provided-conversation-only' and total==expected_total==46 and len(assets)==46 and not missing_products and not short and not over and not invalid and not missing_files and not invalid_files and not remote and not dup and not unref and not extra and not expected_not and not catalogue_not and wired and modular and not missing_chunks and not fallback and not staging)
print('Wound image audit:','PASS' if ok else 'FAIL'); sys.exit(0 if ok else 1)
