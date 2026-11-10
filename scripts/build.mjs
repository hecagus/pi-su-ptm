import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
import {DECIMAL_COUNT,EXPANDED_DECIMAL_COUNT} from '../dist/core.js';
for (const name of ['index.html','styles.css','cosmic.css','app.js','core.js','oracle.js','multiverse.js','destiny.js','share-card.js','voyage.js','pi-digits.txt']) assert.ok(existsSync(`dist/${name}`),`Missing ${name}`);
const digits = readFileSync('dist/pi-digits.txt','utf8');
assert.equal(digits.length,DECIMAL_COUNT);
assert.ok(digits.startsWith('14159265358979323846264338327950288419716939937510'));
assert.match(digits,/^\d+$/);
const manifest=JSON.parse(readFileSync('dist/pi-chunks/manifest.json','utf8'));
assert.equal(manifest.total,EXPANDED_DECIMAL_COUNT);
let total=digits.length;
for(const [i,part] of manifest.chunks.entries()){
  assert.equal(part.file,`${String(i+1).padStart(2,'0')}.txt`);
  const chunk=readFileSync(`dist/pi-chunks/${part.file}`,'utf8');
  assert.equal(chunk.length,DECIMAL_COUNT);assert.match(chunk,/^\d+$/);
  assert.equal(createHash('sha256').update(chunk).digest('hex'),part.sha256);
  total+=chunk.length;
}
assert.equal(total,EXPANDED_DECIMAL_COUNT);
console.log(`Static app ready: ${total.toLocaleString('en-US')} decimal digits validated for the first search.`);
