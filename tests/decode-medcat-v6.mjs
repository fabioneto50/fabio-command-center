import fs from 'node:fs';
import zlib from 'node:zlib';

const parts=[];
for(let i=1;i<=5;i++){
  const p=`medcat-v6-chunk-${String(i).padStart(2,'0')}.js`;
  const src=fs.readFileSync(p,'utf8');
  const m=src.match(/\+'([A-Za-z0-9+/=]+)'\s*;?\s*$/s);
  if(!m) throw new Error(`Unable to extract base64 from ${p}`);
  parts.push(m[1]);
  console.log(`PART_${i}`,m[1].length);
}
const b64=parts.join('');
console.log('B64_TOTAL',b64.length,'MOD4',b64.length%4);
const buf=Buffer.from(b64,'base64');
console.log('COMPRESSED_BYTES',buf.length,'HEADER',buf.subarray(0,4).toString('hex'));
let raw;
try{raw=zlib.gunzipSync(buf);}catch(e){console.error('GUNZIP_ERROR',e.message);process.exit(2)}
console.log('RAW_BYTES',raw.length);
let obj;
try{obj=JSON.parse(raw.toString('utf8'));}catch(e){console.error('JSON_ERROR',e.message);process.exit(3)}
console.log('TOP_KEYS',Object.keys(obj));
console.log('R_COUNT',Array.isArray(obj.r)?obj.r.length:null,'V_COUNT',Array.isArray(obj.v)?obj.v.length:null);
if(!Array.isArray(obj.r)||obj.r.length!==690) throw new Error(`Expected 690 records, got ${obj.r?.length}`);
const names=obj.r.map(r=>String(r?.[0]||'').trim());
const unique=new Set(names.map(n=>n.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()));
if(unique.size!==690) throw new Error(`Expected 690 unique names, got ${unique.size}`);
console.log('PASS original V0.2 compressed payload',JSON.stringify({records:obj.r.length,unique:unique.size,pool:obj.v.length}));
