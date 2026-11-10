import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {fictionalOracle} from '../dist/oracle.js';
import {getOracleScene,oracleShareText,ORACLE_UNIVERSES} from '../dist/multiverse.js';

const digits=readFileSync(new URL('../dist/pi-digits.txt',import.meta.url),'utf8');
const birth={day:14,month:3,year:2000},today={day:9,month:11,year:2026};
const reading=jump=>fictionalOracle(birth,today,digits,jump);

test('The first consultation starts in Universe 1, Earth-1218',()=>{
  const scene=getOracleScene(reading(0));
  assert.equal(scene.number,1);
  assert.equal(scene.name,'Earth-1218');
  assert.equal(scene.jump,0);
  assert.equal(scene.visit,1);
});

test('Successive jumps change the world, its story and the fictional date',()=>{
  const results=[0,1,2].map(reading),scenes=results.map(getOracleScene);
  assert.deepEqual(scenes.map(s=>s.name),['Earth-1218','Spider-Man','Dragon Ball']);
  assert.equal(new Set(results.map(r=>r.target)).size,3);
  assert.equal(new Set(scenes.map(s=>s.cause)).size,3);
  for(const scene of scenes){
    const world=ORACLE_UNIVERSES.find(w=>w.id===scene.id);
    assert.ok(world.stories.some(s=>s.cause===scene.cause&&s.story===scene.story&&s.lastWords===scene.lastWords));
  }
});

test('Returning to a world keeps its universe ID and opens another timeline',()=>{
  const scene=getOracleScene(reading(3));
  assert.equal(scene.number,1);
  assert.equal(scene.name,'Earth-1218');
  assert.equal(scene.visit,2);
  assert.equal(scene.jump,3);
  assert.deepEqual(getOracleScene(reading(0)),getOracleScene(reading(0)));
});

test('Shared text preserves the displayed universe, story, date and fiction notice',()=>{
  const result=reading(1),scene=getOracleScene(result),label='fecha de prueba';
  const shared=oracleShareText(result,label,'https://example.test');
  for(const value of ['FICCIÓN MATEMÁTICA','UNIVERSO 2','Spider-Man',label,scene.cause,scene.story,scene.lastWords,'https://example.test#oracle'])assert.ok(shared.includes(value));
  assert.ok(!shared.includes('Dragon Ball'));
});
