import fs from 'node:fs';
function assert(c,m){if(!c)throw new Error(m)}
const src=fs.readFileSync('medication-catalog-v6.js','utf8');
const fix=fs.readFileSync('medication-catalog-v6-recovery-fix.js','utf8');
const loader=fs.readFileSync('medication-info-ux-v5.js','utf8');
assert(src.includes("const EXPECTED=690"),'V6 recovery must require exactly 690 records');
assert(!src.includes('DecompressionStream'),'V6 must not depend on the corrupt gzip payload');
assert(!src.includes('medcat-v6-chunk-'),'V6 must not load the corrupt chunk files');
assert(fix.includes("const EXPECTED=690"),'canonical fallback must require exactly 690 records');
assert(fix.includes("querySelectorAll(':scope > .med4-mini[data-med4]')"),'canonical fallback must inspect only direct medication cards');
assert(fix.includes('map.size===EXPECTED'),'canonical fallback must enforce unique medication names');
assert(fix.includes('records.length!==EXPECTED||unique.size!==EXPECTED'),'canonical fallback must validate count and uniqueness before publishing');
assert(loader.includes("load('medication-catalog-v6-recovery-fix.js')"),'loader must run the canonical V6 fallback before V7');
assert(loader.indexOf("medication-catalog-v6-recovery-fix.js")<loader.indexOf("medication-catalog-v7.js"),'V6 fallback must load before V7');
console.log('PASS V6 recovery static invariants · expected=690 · canonical direct-list selector · corrupt gzip dependency removed');
