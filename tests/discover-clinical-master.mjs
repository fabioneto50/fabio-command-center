const BASE='https://clinical-urgencia-uci.replit.app/';
const h=await fetch(BASE,{redirect:'follow'});console.log('HOME',h.status,h.url);const html=await h.text();console.log('HTML_BYTES',Buffer.byteLength(html));
const srcs=[...html.matchAll(/<script[^>]+src=["']([^"']+)["']/gi)].map(m=>new URL(m[1],h.url).href);
console.log('SCRIPTS',srcs.length,srcs);
const needles=['sourceId','Catalogo_Clinico_Medicacao_923','Base_Dados_Medicamentos_Clinical_923','pdf-abacavir','Abacavir','medications','medicationData','923'];
for(const u of srcs){
  const r=await fetch(u);const t=await r.text();console.log('SCRIPT',u,'STATUS',r.status,'BYTES',Buffer.byteLength(t));
  for(const n of needles){const i=t.indexOf(n);if(i>=0)console.log('HIT',n,'AT',i,'CTX',JSON.stringify(t.slice(Math.max(0,i-180),Math.min(t.length,i+420))))}
  const chunkUrls=[...t.matchAll(/["']([^"']+\.js)["']/g)].map(m=>{try{return new URL(m[1],u).href}catch{return null}}).filter(Boolean);
  if(chunkUrls.length)console.log('CHUNK_REFS_SAMPLE',chunkUrls.slice(0,20));
}
