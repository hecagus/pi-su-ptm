import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
for (const name of ['index.html','styles.css','app.js','core.js','oracle.js','pi-digits.txt']) assert.ok(existsSync(`dist/${name}`),`Missing ${name}`);
const digits = readFileSync('dist/pi-digits.txt','utf8');
assert.equal(digits.length,2_000_000);
assert.ok(digits.startsWith('14159265358979323846264338327950288419716939937510'));
assert.match(digits,/^\d+$/);
console.log('Static app ready: 2,000,000 decimal digits validated.');
