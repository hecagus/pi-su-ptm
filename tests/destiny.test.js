import test from 'node:test';
import assert from 'node:assert/strict';
import {ORACLE_UNIVERSES,getOracleScene} from '../dist/multiverse.js';
import {getDestinyChallenge,chooseDestiny,normalizeEndings,unlockEnding,ENDING_COUNT} from '../dist/destiny.js';
import {createShareModel,layoutShareBody} from '../dist/share-card.js';

const reading=(world,variant)=>({universe:world,fragment:String(variant).padStart(12,'0'),born:'03142000',current:'11102026',target:'2050-01-01'});
const all=[];
ORACLE_UNIVERSES.forEach((world,index)=>world.stories.forEach((_,variant)=>all.push(reading(index,variant))));

test('All twelve scenes have three distinct decisions and coherent, unique endings',()=>{
  const ids=new Set();
  for(const result of all){
    const scene=getOracleScene(result),challenge=getDestinyChallenge(result);
    assert.equal(challenge.choices.length,3);
    assert.equal(new Set(challenge.choices.map(c=>c.id)).size,3);
    const statuses=[];
    for(const choice of challenge.choices){
      const before=JSON.stringify(result),ending=chooseDestiny(result,choice.id);
      assert.equal(ending.sceneKey,`${scene.id}:${scene.variant}`);
      assert.equal(ending.label,choice.label);
      for(const field of ['title','story','lastWords','statusLabel'])assert.ok(ending[field].length>8);
      assert.equal(JSON.stringify(result),before,'decisions must not alter the mathematical reading');
      assert.deepEqual(chooseDestiny(result,choice.id),ending);
      statuses.push(ending.status);ids.add(ending.endingId);
    }
    assert.ok(statuses.includes('portal'));
    assert.ok(statuses.includes('defeat'));
    assert.throws(()=>chooseDestiny(result,'nonexistent'));
  }
  assert.equal(ids.size,36);assert.equal(ENDING_COUNT,36);
});

test('The flying car scene has the promised run, catch and film endings',()=>{
  const result=reading(1,0);
  assert.equal(chooseDestiny(result,'correr').status,'portal');
  assert.match(chooseDestiny(result,'atrapar').story,/resistencia estructural/);
  assert.match(chooseDestiny(result,'grabar').story,/millones de vistas/);
  assert.throws(()=>chooseDestiny(result,'manual'));
});

test('Collection survives serialization, deduplicates replays and discards invalid stored data',()=>{
  const first=chooseDestiny(reading(0,0),'manual').endingId,second=chooseDestiny(reading(1,0),'correr').endingId;
  let collection=unlockEnding(null,first);
  collection=unlockEnding(JSON.parse(JSON.stringify(collection)),first);
  collection=unlockEnding(collection,second);
  assert.deepEqual(collection,[first,second]);
  assert.deepEqual(normalizeEndings([first,first,null,{},'unknown',42]),[first]);
  assert.deepEqual(normalizeEndings({}),[]);
  assert.deepEqual(unlockEnding(collection,'unknown'),collection);
});

test('Shared card and copied text match each decision without birth data or a stale ending',()=>{
  for(const result of all){
    for(const choice of getDestinyChallenge(result).choices){
      const ending=chooseDestiny(result,choice.id),model=createShareModel(result,'1 de enero de 2050','https://example.test',ending);
      assert.equal(model.title,ending.title);assert.equal(model.words,ending.lastWords);
      assert.ok(model.text.includes(ending.story));assert.ok(model.text.includes('FICCIÓN MATEMÁTICA'));
      assert.ok(!JSON.stringify(model).includes(result.born));
      assert.ok(!JSON.stringify(model).includes(result.current));
    }
  }
  assert.throws(()=>createShareModel(reading(1,0),'fecha','https://example.test',chooseDestiny(reading(0,0),'manual')));
  const plain=createShareModel(reading(1,0),'fecha','https://example.test');
  assert.equal(plain.title,getOracleScene(reading(1,0)).cause);
  assert.equal(plain.choice,'');
});

test('All oracle and ending card texts fit within the artwork body with conservative font widths',()=>{
  const ctx={font:'',measureText(text){return {width:[...text].length*Number(this.font.match(/(\d+)px/)[1])*.66};}};
  for(const result of all){
    for(const ending of [null,...getDestinyChallenge(result).choices.map(c=>chooseDestiny(result,c.id))]){
      const model=createShareModel(result,'1 de enero de 2050','https://example.test',ending);
      const blocks=layoutShareBody(ctx,model),last=blocks.at(-1);
      assert.ok(last.y+last.lines.length*last.height<=1078);
      assert.ok(blocks.every(b=>b.font.match(/\d+px/)));
    }
  }
});
