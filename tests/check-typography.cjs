'use strict';
// Project typography contract, not a WCAG certification. Historical releases are immutable.
const fs=require('fs'),assert=require('node:assert/strict'),path=require('path');
process.chdir(path.resolve(__dirname,'..'));
const manifest=JSON.parse(fs.readFileSync('asset-manifest.json','utf8')),prefix='release/'+manifest.build+'/';
const files=['index.html',...new Set(Object.keys(manifest.assets).filter(p=>p.startsWith(prefix)&&/\.(css|js)$/.test(p)).map(p=>p.slice(prefix.length)))];
const findings=[];let count=0;
for(const name of files){
 const text=fs.readFileSync(name,'utf8');
 for(const m of text.matchAll(/font-size\s*:\s*(\d*\.?\d+)(px|rem|em)(?=\s*(?:[;!}"\n]|$))/g)){
  count++;const size=Number(m[1])*(m[2]==='px'?1:16);
  if(size<13)findings.push({file:name,css:m[0],effectivePx:size});
 }
}
const result={build:manifest.build,files:files.length,numericDeclarations:count,violations:findings,captionFloorPx:13};
fs.mkdirSync('audit-evidence',{recursive:true});fs.writeFileSync('audit-evidence/typography-static.json',JSON.stringify(result,null,2));
assert.equal(findings.length,0,'Sub-13px typography returned: '+JSON.stringify(findings));
assert.match(fs.readFileSync('fcc-ui.css','utf8'),/--fcc-caption:\.8125rem/);
console.log('TYPOGRAPHY_STATIC_PASS',JSON.stringify(result));
