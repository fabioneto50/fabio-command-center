(()=>{
  if(window.__fccWoundDressingsLocalDataV3Installed)return;
  window.__fccWoundDressingsLocalDataV3Installed=true;

  const UPDATES=[{product:'Inadine®',presentations:[['Após c/ iodopovidona 10% 5x5cm Unid TOP','100006970']]}];
  const RENAMES=[
    {from:'Mepilex® Border',to:'Mepilex® Border Flex',link:'https://www.molnlycke.com/products-solutions/mepilex-border-flex/'},
    {from:'Mepilex® Heel',to:'Mepilex® Border Heel',link:'https://www.molnlycke.com/products-solutions/mepilex-border-heel/'}
  ];
  const MEPITEL={
    name:'Mepitel®',
    presentations:[['Penso de contacto em silicone suave','']],
    tags:['Interface','Silicone','Proteção'],
    indication:'Camada de contacto com a ferida em silicone suave, indicada para proteger o leito da ferida e minimizar a dor e o traumatismo nas mudanças de penso. Pode ser utilizada em feridas agudas e crónicas, queimaduras, enxertos e pele frágil, associando um penso secundário absorvente quando necessário.',
    components:'Malha transparente com camada de contacto em silicone suave (Safetac®) - Interface e proteção. Permite a passagem do exsudado para um penso secundário e reduz a aderência ao leito da ferida e à pele perilesional.',
    links:['https://www.molnlycke.com/products-solutions/mepitel/']
  };

  function apply(){
    const api=window.fccWoundDressings;if(!api?.data||!Array.isArray(api.data))return false;
    for(const rename of RENAMES){const product=api.data.find(item=>item.name===rename.from||item.name===rename.to);if(!product)continue;product.name=rename.to;if(rename.link)product.links=[rename.link]}
    for(const update of UPDATES){const product=api.data.find(item=>item.name===update.product);if(!product)continue;product.presentations=Array.isArray(product.presentations)?product.presentations:[];for(const presentation of update.presentations||[]){const code=presentation?.[1];if(!product.presentations.some(item=>item?.[1]===code))product.presentations.push(presentation)}}
    if(window.FCCContent?.extendDressings)window.FCCContent.extendDressings(MEPITEL);else{if(!api.data.some(item=>item.name===MEPITEL.name))api.data.push({...MEPITEL});api.render?.()}
    document.dispatchEvent(new CustomEvent('fcc-dressings-data-updated',{detail:{source:'modular-data-v3'}}));return true;
  }
  if(apply())return;
  let tries=0;const timer=setInterval(()=>{tries++;if(apply()||tries>=30)clearInterval(timer)},120);
})();
