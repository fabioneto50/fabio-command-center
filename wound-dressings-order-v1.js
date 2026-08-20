(()=>{
  const KEY='fcc-master-subcategory-order-v1';
  const wrap=document.querySelector('#page-clinical > .tabs');if(!wrap)return;
  const id=t=>{const on=t.getAttribute('onclick')||t.dataset.originalOnclick||'';return on.match(/subtab\([^,]+,\s*['"]([^'"]+)['"]/)?.[1]||t.dataset.subId||t.id||('label:'+t.textContent.trim())};
  const current=[...wrap.querySelectorAll(':scope > .tab')].map(id);if(!current.includes('clin-dressings'))return;
  let all={};try{all=JSON.parse(localStorage.getItem(KEY)||'{}')||{}}catch(e){all={}}
  let order=Array.isArray(all.clinical)?all.clinical.filter(x=>current.includes(x)):[];
  current.forEach(x=>{if(!order.includes(x))order.push(x)});
  order=order.filter(x=>x!=='clin-dressings');
  const i=order.indexOf('clin-material');if(i>=0)order.splice(i+1,0,'clin-dressings');else order.unshift('clin-dressings');
  all.clinical=order;try{localStorage.setItem(KEY,JSON.stringify(all))}catch(e){}
})();
