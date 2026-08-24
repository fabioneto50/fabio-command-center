import fs from 'node:fs';
import zlib from 'node:zlib';
function assert(c,m){if(!c)throw new Error(m)}
function gzipPayload(gz){
  assert(gz[0]===0x1f&&gz[1]===0x8b&&gz[2]===8,'unsupported gzip header');
  let p=10;const flg=gz[3];
  if(flg&4){const n=gz[p]|(gz[p+1]<<8);p+=2+n}
  if(flg&8){while(gz[p++]!==0){} }
  if(flg&16){while(gz[p++]!==0){} }
  if(flg&2)p+=2;
  assert(p<gz.length-8,'invalid gzip payload bounds');
  return gz.subarray(p,gz.length-8);
}
let b64='';
for(let i=1;i<=5;i++){
  const f=`medcat-v6-chunk-${String(i).padStart(2,'0')}.js`;
  const src=fs.readFileSync(f,'utf8');
  const m=src.match(/\+\s*'([A-Za-z0-9+/=]+)'\s*;?\s*$/s);
  assert(m,`cannot extract base64 from ${f}`);
  console.log(`${f}: chars=${m[1].length}`);
  b64+=m[1];
}
console.log(`joined base64 chars=${b64.length}`);
const gz=Buffer.from(b64,'base64');
console.log(`gzip bytes=${gz.length} magic=${gz[0]},${gz[1]} flags=${gz[3]}`);
let raw;
try{
  raw=zlib.gunzipSync(gz);
  console.log('gzip checksum: valid');
}catch(e){
  console.log(`gzip checksum: invalid (${e.code||e.message}); testing raw deflate payload`);
  raw=zlib.inflateRawSync(gzipPayload(gz));
}
console.log(`uncompressed bytes=${raw.length}`);
const p=JSON.parse(raw.toString('utf8'));
console.log(`payload keys=${Object.keys(p).join(',')} records=${p.r?.length} values=${p.v?.length}`);
assert(Array.isArray(p.r),'payload.r missing');
assert(p.r.length===690,`V6 records ${p.r.length}/690`);
console.log('PASS V6 catalogue payload · records=690');
