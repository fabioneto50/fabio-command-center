(()=>{
  if(window.__fccContentConfigV2Installed)return;
  window.__fccContentConfigV2Installed=true;
  const C=window.FCCContent;if(!C)return;

  C.registerArea({id:'clinical-sepsis-extra',page:'clinical',target:'#merged-clin-sepsis .clin-merged-body',targetId:'clin-sepsis',title:'Conteúdo adicional',description:'Cartões extensíveis de Sépsis / Choque.',searchLabel:'Clinical · Sépsis / Choque',searchable:true,filterable:true,items:[]});
  C.registerArea({id:'clinical-medications-extra',page:'clinical',target:'#clin-drugs',targetId:'clin-drugs',title:'Medicação adicional',description:'Novas fichas podem ser adicionadas apenas neste ficheiro, sem alterar o motor da página.',searchLabel:'Clinical · Medicação',searchable:true,filterable:true,items:[]});
  C.registerArea({id:'clinical-dressings-extra',page:'clinical',target:'#clin-dressings .penso-shell',targetId:'clin-dressings',title:'Pensos adicionais',description:'Área modular para novos produtos que ainda não pertençam ao catálogo institucional principal.',searchLabel:'Clinical · Pensos / Apósitos',searchable:true,filterable:true,items:[]});

  const asImages=v=>(Array.isArray(v)?v:[]).filter(x=>x&&typeof x.src==='string');
  window.FCCContentManifest={
    version:2,
    areas:['clinical-sepsis-extra','clinical-medications-extra','clinical-dressings-extra'],
    addMedication:item=>C.registerItems('clinical-medications-extra',item),
    addDressing:item=>C.registerItems('clinical-dressings-extra',item),
    addCatalogueDressing:item=>C.extendDressings(item),
    addDressingImages:(name,images)=>C.extendDressings({name,images:asImages(images)}),
    addSepsisCard:item=>C.registerItems('clinical-sepsis-extra',item),
    addSubtab:def=>C.registerSubtab(def)
  };
})();
