(()=>{
if(window.__fccMedicationCatalogV7BatchInstalled)return;window.__fccMedicationCatalogV7BatchInstalled=true;
const install=()=>{const A=window.FCCMedicationCatalogV7;if(!A||A.__batchWrapped)return false;const original=A.add.bind(A),queue=[];A.__batchWrapped=true;A.add=item=>{queue.push(...(Array.isArray(item)?item:[item]));return A.count};setTimeout(()=>{A.add=original;delete A.__batchWrapped;if(queue.length)original(queue)},0);return true};
if(!install()){document.addEventListener('fcc-medication-catalog-ready',install,{once:true});}
})();
