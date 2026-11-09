import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {DECIMAL_COUNT,EXPANDED_DECIMAL_COUNT,findMatches,getExcerpt} from '../dist/core.js';

const initial=readFileSync(new URL('../dist/pi-digits.txt',import.meta.url),'utf8');
const expanded=initial+['01','02','03','04'].map(n=>readFileSync(new URL(`../dist/pi-chunks/${n}.txt`,import.meta.url),'utf8')).join('');

test('Eight-digit sequence beyond the initial range is found at decimal 3,370,559',()=>{
  assert.equal(initial.length,DECIMAL_COUNT);
  assert.deepEqual(findMatches(initial,'01122890'),[]);
  assert.equal(expanded.length,EXPANDED_DECIMAL_COUNT);
  const matches=findMatches(expanded,'01122890');
  assert.equal(matches[0]+1,3_370_559);
  assert.equal(getExcerpt(expanded,matches[0],8,20).match,'01122890');
});

test('Optional blocks preserve matches crossing every two-million-digit boundary',()=>{
  for(let boundary=DECIMAL_COUNT;boundary<EXPANDED_DECIMAL_COUNT;boundary+=DECIMAL_COUNT){
    const start=boundary-6,sequence=expanded.slice(start,start+24);
    assert.ok(findMatches(expanded,sequence).includes(start));
  }
});

test('Extended range can still honestly return no matches',()=>{
  assert.deepEqual(findMatches(expanded,'999999999999999999999999'),[]);
});
