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
const buf=Buffer.from(b64,'base64');
const declaredCrc=buf.readUInt32LE(buf.length-8)>>>0;
const declaredSize=buf.readUInt32LE(buf.length-4)>>>0;
console.log('B64_TOTAL',b64.length,'MOD4',b64.length%4);
console.log('COMPRESSED_BYTES',buf.length,'HEADER',buf.subarray(0,10).toString('hex'),'TRAILER',buf.subarray(-8).toString('hex'));
let raw=null;
try{
  raw=zlib.gunzipSync(buf);
  console.log('GUNZIP_OK');
}catch(e){
  console.log('GUNZIP_CHECKSUM_REJECTED',e.message);
  const flags=buf[3];
  if(flags!==0) throw new Error(`Unsupported gzip flags ${flags}; safe raw fallback disabled`);
  const deflate=buf.subarray(10,-8);
  try{
    raw=zlib.inflateRawSync(deflate);
    console.log('RAW_DEFLATE_RECOVERY_OK');
  }catch(e2){
    console.error('RAW_DEFLATE_RECOVERY_ERROR',e2.message);
    process.exit(2);
  }
}
const text=raw.toString('utf8');
console.log('RAW_BYTES',raw.length);
console.log('TRAILER_META',JSON.stringify({declaredCrc:declaredCrc.toString(16),declaredSize,actualSize:raw.length,delta:declaredSize-raw.length}));
let obj;
try{
  obj=JSON.parse(text);
}catch(e){
  console.error('JSON_ERROR',e.message);
  const probes=['sco-chave','Risco-chave','scos / precauções','Monitorização','Farmacocinética'];
  for(const probe of probes){
    let from=0,shown=0;
    while(shown<4){
      const idx=text.indexOf(probe,from);if(idx<0)break;
      console.log('PROBE',probe,'IDX',idx,'CTX',JSON.stringify(text.slice(Math.max(0,idx-180),Math.min(text.length,idx+300))));
      from=idx+probe.length;shown++;
    }
  }
  const control=[];
  for(let i=0;i<text.length;i++){
    const c=text.charCodeAt(i);
    if((c<32&&c!==9&&c!==10&&c!==13)||c===0xfffd) control.push([i,c]);
    if(control.length>=20)break;
  }
  console.log('SUSPICIOUS_CHARS',JSON.stringify(control));
  console.log('TEXT_HEAD',JSON.stringify(text.slice(0,500)));
  console.log('TEXT_TAIL',JSON.stringify(text.slice(-700)));
  process.exit(3);
}
console.log('TOP_KEYS',Object.keys(obj));
console.log('R_COUNT',Array.isArray(obj.r)?obj.r.length:null,'V_COUNT',Array.isArray(obj.v)?obj.v.length:null);
if(!Array.isArray(obj.r)||obj.r.length!==690) throw new Error(`Expected 690 records, got ${obj.r?.length}`);
const names=obj.r.map(r=>String(r?.[0]||'').trim());
const unique=new Set(names.map(n=>n.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim()));
if(unique.size!==690) throw new Error(`Expected 690 unique names, got ${unique.size}`);
console.log('PASS original V0.2 payload recovered',JSON.stringify({records:obj.r.length,unique:unique.size,pool:Array.isArray(obj.v)?obj.v.length:null}));
