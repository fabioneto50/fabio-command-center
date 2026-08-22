(()=>{
if(window.__fccMedicationCatalogV7BatchInstalled)return;window.__fccMedicationCatalogV7BatchInstalled=true;
const install=()=>{const A=window.FCCMedicationCatalogV7;if(!A||A.__batchWrapped)return false;const original=A.add.bind(A),queue=[];A.__batchWrapped=true;A.add=item=>{queue.push(...(Array.isArray(item)?item:[item]));return A.count};window.__FCC_MED_BATCH_FLUSH__=()=>{if(!A.__batchWrapped)return;A.add=original;delete A.__batchWrapped;const items=queue.splice(0);if(items.length)original(items);delete window.__FCC_MED_BATCH_FLUSH__};return true};
if(!install()){document.addEventListener('fcc-medication-catalog-ready',install,{once:true});}
})();
