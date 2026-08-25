import fs from 'node:fs';
function assert(c,m){if(!c)throw new Error(m)}
const src=fs.readFileSync('medication-catalog-v6.js','utf8');
assert(src.includes("const EXPECTED=690"),'V6 recovery must require exactly 690 records');
assert(src.includes("document.querySelectorAll('#med4Results [data-med4]')"),'V6 recovery must derive canonical V4 rows from the rendered readable source');
assert(src.includes('map.size===EXPECTED'),'V6 recovery must enforce unique canonical names');
assert(src.includes('DATA.length!==EXPECTED||unique.size!==EXPECTED'),'V6 recovery must validate count and uniqueness before publishing');
assert(src.includes("source:'medication-info-v4 DOM + contentPack'"),'V6 recovery source marker missing');
assert(!src.includes('DecompressionStream'),'V6 must not depend on the corrupt gzip payload');
assert(!src.includes('medcat-v6-chunk-'),'V6 must not load the corrupt chunk files');
console.log('PASS V6 recovery static invariants · expected=690 · corrupt gzip dependency removed');
