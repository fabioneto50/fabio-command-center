import fs from 'node:fs';
import zlib from 'node:zlib';
const parts=[];
for(let i=1;i<=5;i++){
  const p=`medcat-v6-chunk-${String(i).padStart(2,'0')}.js`;
  const src=fs.readFileSync(p,'utf8');
  const m=src.match(/\+'([A-Za-z0-9+/=]+)'\s*;?\s*$/s);
  if(!m)throw new Error(`base64 não encontrado em ${p}`);
  parts.push(m[1]);
}
const buf=Buffer.from(parts.join(''),'base64');
const raw=zlib.inflateRawSync(buf.subarray(10,-8));
const text=raw.toString('utf8');
for(const name of ['Paracetamol','Diazepam','Diazepam oral']){
  const indexes=[];let at=-1;
  while((at=text.indexOf(name,at+1))>=0&&indexes.length<10)indexes.push(at);
  console.log('V02_NAME',JSON.stringify({name,count:indexes.length,indexes,contexts:indexes.slice(0,3).map(i=>text.slice(Math.max(0,i-100),i+180))}));
}
console.log('V02_RAW_BYTES',raw.length);
