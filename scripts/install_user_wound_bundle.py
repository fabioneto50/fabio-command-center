import base64, json, pathlib, shutil

src=pathlib.Path('wound-images-user-v4.json')
if not src.exists():
    print('Bundle already consumed; nothing to do.')
    raise SystemExit(0)

data=json.loads(src.read_text(encoding='utf-8'))
expected={
'Acticoat® / Acticoat® Flex 3':('acticoat',1),'Actisorb® Silver 220':('actisorb-silver-220',1),'Adaptic®':('adaptic',1),'Allevyn® Life':('allevyn-life',1),'Aquacel® Ag+ Extra':('aquacel-ag-extra',2),'Aquacel® Extra':('aquacel-extra',2),'Argenpal 42,5 mg barra cutânea®':('argenpal',1),'Atrauman® Ag':('atrauman-ag',4),'Cutanplast®':('cutanplast',2),'Emla® Penso':('emla-penso',1),'Inadine®':('inadine',4),'Jelonet®':('jelonet',2),'Melgisorb® Plus':('melgisorb-plus',2),'Mepilex®':('mepilex',2),'Mepilex® Border Flex':('mepilex-border-flex',2),'Mepilex® Border Heel':('mepilex-border-heel',2),'Mepitel®':('mepitel',1),'Merogel®':('merogel',1),'Multidex®':('multidex',1),'Nu-Gel®':('nu-gel',1),'Promogran®':('promogran',1),'Spongostan® Standard':('spongostan-standard',1),'Surgicel®':('surgicel',3),'Surgicel® Fibrilar':('surgicel-fibrilar',3),'TachoSil®':('tachosil',1),'Tutopatch®':('tutopatch',1),'Varihesive® Extra Fino':('varihesive-extra-fino',1),'Varihesive® Gel Control':('varihesive-gel-control',1)}
aliases={'Mepilex® Border':'Mepilex® Border Flex','Mepilex® Heel':'Mepilex® Border Heel'}
products={aliases.get(k,k):v for k,v in data.get('products',{}).items()}
missing=[n for n in expected if n not in products]
extras=[n for n in products if n not in expected]
bad={n:(len(products.get(n,[])),cnt) for n,(_,cnt) in expected.items() if len(products.get(n,[]))!=cnt}
total=sum(len(products.get(n,[])) for n in expected)
if missing or extras or bad or total!=46:
    raise SystemExit(f'Bundle validation failed: missing={missing} extras={extras} bad_counts={bad} total={total}')

out=pathlib.Path('assets/wound-images/user-final')
if out.parent.exists(): shutil.rmtree(out.parent)
out.mkdir(parents=True,exist_ok=True)
manifest={'version':'2.1-user-only','product_count':28,'verified_product_count':28,'image_count':46,'source_policy':'user-provided-conversation-only','products':{}}
written=0
for name,(slug,count) in expected.items():
    images=[]
    for i,b64 in enumerate(products[name],1):
        raw=base64.b64decode(b64,validate=True)
        if b'ftypavif' not in raw[:32]: raise SystemExit(f'Invalid AVIF payload for {name} image {i}')
        fn=f'{slug}-{i:02d}.avif'
        (out/fn).write_bytes(raw)
        images.append({'src':f'./assets/wound-images/user-final/{fn}','label':'Imagem principal' if i==1 else f'Imagem complementar {i-1}','verified':True,'local':True,'source':'user-provided-conversation'})
        written+=1
    manifest['products'][name]={'images':images}
pathlib.Path('wound-images-curated-v1.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
pathlib.Path('wound-user-install-audit.txt').write_text(f'Products: 28\nImages: {written}\nSource: user-provided-conversation-only\nOld/external images: disabled\n',encoding='utf-8')
print(f'Validated and extracted {written} images for {len(expected)} products.')
