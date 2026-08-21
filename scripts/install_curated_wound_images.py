#!/usr/bin/env python3
import io, json, re, sys, unicodedata
from datetime import datetime, timezone
from pathlib import Path
from urllib.parse import urlparse

import numpy as np
import requests
from PIL import Image, ImageFilter, ImageOps

ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'assets'/'wound-images'/'user-hq'
MANIFEST=ROOT/'wound-images-curated-v1.json'
REPORT=ROOT/'wound-images-curated-report.txt'
UA='Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126 Safari/537.36'
S=requests.Session(); S.headers.update({'User-Agent':UA,'Accept':'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8','Accept-Language':'pt-PT,pt;q=0.9,en;q=0.7'})

# Curadoria manual: uma fotografia principal por cada um dos 27 materiais do catálogo.
# O site nunca usa estes URLs em runtime; a workflow descarrega-os e guarda cópias locais.
SOURCES={
'Acticoat® / Acticoat® Flex 3':['https://myself-shop.de/media/image/product/1058/lg/acticoat-flex-3.jpg'],
'Actisorb® Silver 220':['https://cdn11.bigcommerce.com/s-evy5wg6u1j/images/stencil/2560w/products/489/1200/s-l1600_8__56389.1574345720.jpg?c=2'],
'Adaptic®':['https://cdn.awsli.com.br/2500x2500/476/476175/produto/19235363/546a6add44.jpg'],
'Allevyn® Life':['https://www.chemist.net/media/catalog/product/a/l/allevyn_life_dressing_10.3cm_x_10.3cm_2.jpg'],
'Aquacel® Ag+ Extra':['https://cdn.awsli.com.br/2500x2500/535/535858/produto/83608211/sku16-d7se7mu3pc.png'],
'Aquacel® Extra':['https://m.media-amazon.com/images/I/81tqd7Dx42L.jpg'],
'Argenpal 42,5 mg barra cutânea®':['https://canamo.net/sites/default/files/styles/max_1200/public/images/2021/05/10/feminizadas-caseras-primera-parte-4.jpg.jpg?itok=NKI4V--x','https://canamo.net/sites/default/files/styles/max_1200/public/images/2021/05/10/feminizadas-caseras-primera-parte-5.jpg.jpg?itok=yPzAXj1X'],
'Atrauman® Ag':['https://media.farmaciatei.ro/gallery/46998/pansament-atrauman-ag-10-x-10-cm-10-x-10-cm-3-bucati-hartmann-2321.jpg'],
'Cutanplast®':['https://www.josec.co.za/cdn/shop/files/Cutanplast-StandardHaemostaticAbsorbableGelatinSponge.jpg?v=1761653947&width=1600'],
'Emla® Penso':['https://cdn-shopkit.com/usercontent/plataforma-de-pedidos/media/images/d2cc461-092732-emla-penso-2.jpeg'],
'Inadine®':['https://img.aponeo.de/738/07584205-inadine-salbengaze-m-pvp-iod-5x5-cm-1.jpg','https://bayshoreprorx.myshopify.com/cdn/shop/files/600031_600x.jpg?v=1747073581&width=1600'],
'Jelonet®':['https://i0.wp.com/ctchealth.ca/wp-content/uploads/2021/11/5000223074043-front.jpg?fit=1600%2C1600&ssl=1'],
'Melgisorb® Plus':['https://www.netpharmacy.co.nz/cdn/shop/files/melgisorb-plus-absorbent-alginate-dressing-10x10cm-10-pieces.webp?v=1722314055&width=1600'],
'Mepilex®':['https://media.healthii.de/17414243/mepilex-10x10-cm-schaumverband-crosp-medical-default-px1000-JopR6vYu.jpg','https://ixxilon.mauve.de/1000/11075314_1.jpg?ver=1765877054'],
'Mepilex® Border':['https://cdn-netshop.lyreco.se/static/1541655011013486/images/EasyOrderHighResolution/21/32/asset.2282132.jpg','https://cdn.shop-apotheke.com/images/D17/558/870/D17558870-p11.jpg'],
'Mepilex® Heel':['https://cdn.awsli.com.br/800x800/2639/2639625/produto/286976353/cb8cba827863598d263a42f5d3f24ea1-aq3u0fmv0z.png'],
'Merogel®':['https://images.dotmed.com/images/listingpics2/5/5/9/6/5596357.jpg'],
'Multidex®':['https://medicalmonks.com/wp-content/uploads/2016/05/Multidex_46-701-655x655.jpg'],
'Nu-Gel®':['https://cdn11.bigcommerce.com/s-evy5wg6u1j/images/stencil/2560w/products/655/1726/Nu_Gel_1__85615.1605103887.jpg?c=2'],
'Promogran®':['https://cdn11.bigcommerce.com/s-hr7ra7xc8x/images/stencil/3840w/products/5474/16936/fpplboqt5mrjmkgxoxqt__12968.1661713129.jpg?compression=lossless'],
'Spongostan® Standard':['https://medifacil.com/cdn/shop/files/MS0002C_550x550.jpg?v=1774396606&width=1600'],
'Surgicel®':['https://images.dentalstores.in/library/product/ethicon-surgicel-pack-of-1-hemostat-2.png','https://www.net32.com/cdn-cgi/image/dpr=2,width=1024/media/shared/common/mp/j-j-dental/surgicel/media/jnj-dental-surgicel-original-hemostat-12perbox-1955.jpg'],
'Surgicel® Fibrilar':['https://www.kalteq.com/wp-content/uploads/2025/01/surgicell-fibrillar-absorbable-hemostat.png'],
'TachoSil®':['https://corza.com/wp-content/uploads/2023/04/tachosil.png','https://corza.com/wp-content/uploads/2023/04/Hero_Image_2.jpg'],
'Tutopatch®':['https://bess.eu/fileadmin/user_upload/Bilder/bessmed/RTI_Gewebematrix_Tutomesh_und_Fortiva/Tutopatch_2022.jpg'],
'Varihesive® Extra Fino':['https://cdn.shop-apotheke.at/images/D03/892/654/D03892654-p10.jpg'],
'Varihesive® Gel Control':['https://www.talinamed.pt/img/p/1/9/3/5/3/19353.jpg'],
}

EXPECTED=27

def fold(s):
    s=unicodedata.normalize('NFD',str(s or ''))
    return ''.join(c for c in s if unicodedata.category(c)!='Mn').lower()

def slug(s):
    return re.sub(r'[^a-z0-9]+','-',fold(s)).strip('-')

def fetch_image(url):
    host=urlparse(url).scheme+'://'+urlparse(url).netloc+'/'
    headers={'Referer':host}
    r=S.get(url,timeout=35,allow_redirects=True,headers=headers)
    r.raise_for_status()
    if len(r.content)<2500: raise ValueError(f'ficheiro demasiado pequeno ({len(r.content)} bytes)')
    im=Image.open(io.BytesIO(r.content)); im=ImageOps.exif_transpose(im)
    im.load()
    if im.width<280 or im.height<220: raise ValueError(f'resolução insuficiente {im.width}x{im.height}')
    return im

def edge_background_alpha(im):
    rgba=im.convert('RGBA')
    existing=np.asarray(rgba.getchannel('A'),dtype=np.uint8)
    if existing.min()<250:return rgba
    rgb=np.asarray(im.convert('RGB'),dtype=np.int16);h,w=rgb.shape[:2]
    b=max(1,min(h,w)//100)
    border=np.concatenate([rgb[:b].reshape(-1,3),rgb[-b:].reshape(-1,3),rgb[:,:b].reshape(-1,3),rgb[:,-b:].reshape(-1,3)],axis=0)
    bg=np.median(border,axis=0)
    # Remove fundos neutros (branco, cinzento ou bege muito pouco saturado) ligados às margens.
    # O flood-fill impede apagar áreas claras internas da embalagem.
    if (bg.max()-bg.min())>32 or bg.mean()<45:return rgba
    dist=np.sqrt(((rgb-bg)**2).sum(axis=2));candidate=dist<34
    from collections import deque
    q=deque();seen=np.zeros((h,w),dtype=bool)
    for x in range(w):
        if candidate[0,x]:q.append((0,x));seen[0,x]=1
        if candidate[h-1,x] and not seen[h-1,x]:q.append((h-1,x));seen[h-1,x]=1
    for y in range(h):
        if candidate[y,0] and not seen[y,0]:q.append((y,0));seen[y,0]=1
        if candidate[y,w-1] and not seen[y,w-1]:q.append((y,w-1));seen[y,w-1]=1
    while q:
        y,x=q.popleft()
        for yy,xx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
            if 0<=yy<h and 0<=xx<w and candidate[yy,xx] and not seen[yy,xx]:seen[yy,xx]=1;q.append((yy,xx))
    alpha=np.full((h,w),255,dtype=np.uint8);alpha[seen]=0
    rgba.putalpha(Image.fromarray(alpha,'L').filter(ImageFilter.GaussianBlur(.65)))
    return rgba

def save_native(im,path):
    rgba=edge_background_alpha(im)
    rgba.save(path,'WEBP',quality=96,method=6,exact=True)
    return rgba.size

def main():
    if len(SOURCES)!=EXPECTED:raise SystemExit(f'ERRO: mapa de fontes tem {len(SOURCES)} produtos; esperado {EXPECTED}')
    OUT.mkdir(parents=True,exist_ok=True)
    for p in OUT.glob('*'):p.unlink()
    products={};rows=[];failures=[]
    for i,(name,urls) in enumerate(SOURCES.items(),1):
        err=[];used=None;im=None
        for url in urls:
            try:im=fetch_image(url);used=url;break
            except Exception as e:err.append(f'{url}: {e}')
        if im is None:failures.append((name,err));print(f'FAIL {name}: '+ ' | '.join(err));continue
        fn=slug(name)+'.webp';path=OUT/fn;w,h=save_native(im,path)
        item={'src':'./assets/wound-images/user-hq/'+fn,'label':'Imagem principal','width':w,'height':h,'verified':True,'source_page':used,'local':True}
        products[name]={'images':[item]};rows.append(f'{name}: {w}x{h} · {path.stat().st_size} bytes · {used}');print(f'OK {i:02d}/{EXPECTED} {name}: {w}x{h}')
    if failures or len(products)!=EXPECTED:
        for name,errs in failures:print(f'\n{name}\n  '+'\n  '.join(errs))
        raise SystemExit(f'ERRO: cobertura {len(products)}/{EXPECTED}; nada deve ser publicado parcialmente')
    payload={'version':'1.0','generated_at':datetime.now(timezone.utc).isoformat(),'product_count':EXPECTED,'verified_product_count':len(products),'products':products}
    MANIFEST.write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
    REPORT.write_text('\n'.join(['Fábio Command Center · curated wound images','',f'Generated: {payload["generated_at"]}',f'Products: {EXPECTED}',f'Verified local images: {len(products)}','Background: edge-connected neutral background removed where applicable','Resize: none (native source dimensions preserved)','',*rows,'']),encoding='utf-8')
    print(f'\nPASS: {len(products)}/{EXPECTED} imagens locais verificadas')

if __name__=='__main__':main()
