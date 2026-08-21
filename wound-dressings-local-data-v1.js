(()=>{
  if(window.__fccWoundDressingsLocalDataV1Installed)return;
  window.__fccWoundDressingsLocalDataV1Installed=true;

  const UPDATES=[
    {
      product:'Inadine®',
      presentations:[
        ['Após c/ iodopovidona 10% 5x5cm Unid TOP','100006970']
      ]
    }
  ];

  function apply(){
    const api=window.fccWoundDressings;
    if(!api?.data)return false;

    for(const update of UPDATES){
      const product=api.data.find(item=>item.name===update.product);
      if(!product||!Array.isArray(product.presentations))continue;
      for(const presentation of update.presentations){
        const code=presentation[1];
        if(!product.presentations.some(item=>item?.[1]===code))product.presentations.push(presentation);
      }
    }

    api.render?.();
    return true;
  }

  if(apply())return;
  let tries=0;
  const timer=setInterval(()=>{
    tries++;
    if(apply()||tries>=30)clearInterval(timer);
  },120);
})();
