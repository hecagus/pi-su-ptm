import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
import {DECIMAL_COUNT,EXPANDED_DECIMAL_COUNT} from '../dist/core.js';

// Run from the repository root after generating the full decimal corpus.
// node scripts/prepare-expanded.mjs /path/to/pi-10m.txt
const source=process.argv[2];
assert.ok(source,'Pass the path to ten million decimal digits.');
const digits=readFileSync(source,'utf8').trim();
assert.equal(digits.length,EXPANDED_DECIMAL_COUNT);
assert.match(digits,/^\d+$/);
assert.equal(digits.slice(0,DECIMAL_COUNT),readFileSync('dist/pi-digits.txt','utf8'));
mkdirSync('dist/pi-chunks',{recursive:true});
const manifest={total:digits.length,chunkSize:DECIMAL_COUNT,chunks:[]};
for(let offset=DECIMAL_COUNT;offset<digits.length;offset+=DECIMAL_COUNT){
  const file=`${String(offset/DECIMAL_COUNT).padStart(2,'0')}.txt`;
  const chunk=digits.slice(offset,offset+DECIMAL_COUNT);
  writeFileSync(`dist/pi-chunks/${file}`,chunk);
  manifest.chunks.push({file,sha256:createHash('sha256').update(chunk).digest('hex')});
}
writeFileSync('dist/pi-chunks/manifest.json',JSON.stringify(manifest,null,2)+'\n');
console.log('Prepared four additional blocks of two million decimal digits.');
