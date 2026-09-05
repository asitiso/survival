import test from 'node:test';
import assert from 'node:assert/strict';
import { guideBossRewardChoices } from '../dist/game/boss-reward-guidance.js';

const base = [
  {kind:'upgrade',id:'meteorStorm',title:'궁극기',description:'궁극기 성장',accent:'#f66'},
  {kind:'relic',id:'relic:abyss-eye',relicId:'abyss-eye',title:'유물',description:'유물 설명',accent:'#a6f'},
  {kind:'fusion',id:'fusion:solar-detonation',fusionId:'solar-detonation',title:'융합',description:'융합 설명',accent:'#fa5'},
];

test('phase 423 boss reward guidance names upgrade relic and fusion roles at a glance',()=>{
  const guided=guideBossRewardChoices(base,{activeRelic:null,activeFusionCount:0});
  assert.deepEqual(guided.map(x=>x.badge),['궁극기 성장','첫 유물','빌드 융합']);
});

test('phase 424 boss reward guidance marks exactly one strongest recommendation without reordering cards',()=>{
  const guided=guideBossRewardChoices(base,{activeRelic:null,activeFusionCount:0});
  assert.equal(guided.filter(x=>x.best).length,1);
  assert.equal(guided[2].best,true);
  assert.deepEqual(guided.map(x=>x.id),base.map(x=>x.id));
});

test('phase 425 existing relic is explained as a swap instead of pretending it is a free extra slot',()=>{
  const guided=guideBossRewardChoices(base,{activeRelic:'time-gear',activeFusionCount:1});
  assert.equal(guided[1].badge,'유물 교체');
  assert.match(guided[1].hint,/현재 유물/);
});

test('phase 426 guidance stays compact and does not add or remove reward choices',()=>{
  const guided=guideBossRewardChoices(base,{activeRelic:null,activeFusionCount:0});
  assert.equal(guided.length,3);
  for(const choice of guided){
    assert.ok(choice.badge.length<=8);
    assert.ok(choice.hint.length<=18);
  }
});
