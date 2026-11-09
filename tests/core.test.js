import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {isValidDate,flexibleDateSequence,findMatches,getExcerpt} from '../dist/core.js';
import {fictionalOracle,validateBirth} from '../dist/oracle.js';

const digits=readFileSync(new URL('../dist/pi-digits.txt',import.meta.url),'utf8');

test('Gregorian century and leap-day boundaries',()=>{
  assert.equal(isValidDate(29,2,1900),false);
  assert.equal(isValidDate(29,2,2000),true);
  assert.equal(isValidDate(31,4,2026),false);
  assert.equal(isValidDate(1,1,0),false);
});
test('Date encodings default to day/month/year and preserve zeroes in either order',()=>{
  assert.equal(flexibleDateSequence(14,3,2000,{withYear:true}), '14032000');
  assert.equal(flexibleDateSequence(14,3,2000,{withYear:true,order:'MDY'}), '03142000');
  assert.equal(flexibleDateSequence(14,3,2000,{withYear:true,order:'DMY',shortYear:true}), '140300');
});
test('Matches include overlapping sequences and correct boundaries',()=>{
  assert.deepEqual(findMatches('1111','11'),[0,1,2]);
  assert.deepEqual(findMatches('123','999'),[]);
  assert.deepEqual(getExcerpt('12345',0,2),{start:0,end:5,before:'',match:'12',after:'345'});
});
test('Real corpus contains 0314 at decimal 3495',()=>{
  assert.equal(digits.length,2_000_000);
  assert.equal(findMatches(digits,'0314')[0]+1,3495);
  assert.equal(findMatches(digits,'0314').length,205);
});
test('Future and impossible birth dates are rejected',()=>{
  const today={day:9,month:11,year:2026};
  assert.throws(()=>validateBirth({day:10,month:11,year:2026},today));
  assert.throws(()=>validateBirth({day:29,month:2,year:1900},today));
});
test('Oracle formula is reproducible and uses exact integer arithmetic',()=>{
  const birth={day:14,month:3,year:2000},today={day:9,month:11,year:2026};
  const a=fictionalOracle(birth,today,digits);
  assert.deepEqual(a,fictionalOracle(birth,today,digits));
  assert.equal(BigInt(a.sum),BigInt('03142000')+BigInt('11092026'));
  assert.equal(a.fragment,digits.slice(a.offset,a.offset+12));
  assert.equal(a.days,Number(BigInt(a.fragment)%25550n)+1);
  const elapsed=(Date.parse(a.target+'T12:00:00Z')-Date.UTC(2026,10,9,12))/86400000;
  assert.equal(elapsed,a.days);
  assert.notEqual(fictionalOracle(birth,today,digits,1).offset,a.offset);
});
