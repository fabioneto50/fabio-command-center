import fs from 'node:fs';
import zlib from 'node:zlib';
import crypto from 'node:crypto';
const EXPECTED=923,EXPECTED_B64=124076;
const JSON_SHA='ba3434f94ad5a8bf10673a9ad9d14c49db2dcca3ff4309e27eef0f3457cdabaf';
const GZIP_SHA='553069927315e9fe8caa1d574db5f5b80d958c480f6fbaa9c8ed7e0ca955a297';
const required=['Classe / farmacodinâmica','Utilização clínica','Farmacocinética','Monitorização','Riscos / precauções','Função renal','Função hepática','Interações','Antídoto / reversão','Pontos críticos de enfermagem','Gravidez e aleitamento','Pediatria','Hemodiálise / CRRT','ECMO','QT / ECG','LASA','TDM','Conservação','Extravasamento'];
function assert(c,m){if(!c)throw new Error(m)}
const parts=[];
for(let i=1;i<=8;i++){
  const path=`medication-master-923-data-${String(i).padStart(2,'0')}.js`;
  const src=fs.readFileSync(path,'utf8');
  const m=src.match(/\+'([A-Za-z0-9+/=]+)'\s*;?\s*$/s);assert(m,`base64 missing in ${path}`);parts.push(m[1]);
}
const b64=parts.join('');assert(b64.length===EXPECTED_B64,`base64 ${b64.length}/${EXPECTED_B64}`);
const gzip=Buffer.from(b64,'base64');const gzipHash=crypto.createHash('sha256').update(gzip).digest('hex');assert(gzipHash===GZIP_SHA,`gzip hash ${gzipHash}`);
const raw=zlib.gunzipSync(gzip);const jsonHash=crypto.createHash('sha256').update(raw).digest('hex');assert(jsonHash===JSON_SHA,`json hash ${jsonHash}`);
const records=JSON.parse(raw.toString('utf8'));assert(Array.isArray(records)&&records.length===EXPECTED,`records ${records?.length}/${EXPECTED}`);
const ids=new Set(),names=new Set();let generic=0,genericRenal=0;
for(let i=0;i<records.length;i++){
  const r=records[i];assert(+r.sourceId===i+1,`sourceId position ${i+1} -> ${r.sourceId}`);assert(r.id&&r.name,`missing id/name at ${i+1}`);ids.add(String(r.id));names.add(String(r.name).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim());
  for(const k of required)assert(Object.prototype.hasOwnProperty.call(r.details||{},k),`missing details.${k} at sourceId ${r.sourceId}`);
  if(String(r.details?.['Classe / farmacodinâmica']||'').includes('Confirmar na validação individual / RCM'))generic++;
  if(String(r.details?.['Função renal']||'').includes('Confirmar na validação individual / RCM'))genericRenal++;
}
assert(ids.size===EXPECTED,`unique internal ids ${ids.size}/${EXPECTED}`);assert(names.size===EXPECTED,`unique names ${names.size}/${EXPECTED}`);
console.log('PASS canonical medication master',JSON.stringify({records:EXPECTED,uniqueIds:ids.size,uniqueNames:names.size,jsonSha256:jsonHash,gzipSha256:gzipHash,generic,genericRenal}));
