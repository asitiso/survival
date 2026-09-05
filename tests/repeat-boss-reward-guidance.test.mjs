import test from 'node:test';import assert from 'node:assert/strict';import { reduceRepeatBossRewardDecision } from '../dist/game/repeat-boss-reward-guidance.js';
const choices=[
 {kind:'relic',relicId:'time-gear',title:'Time Gear',description:'swap',accent:'#fff',badge:'유물 교체',hint:'현재 유물과 교체',best:false},
 {kind:'upgrade',id:'meteorStorm',title:'Meteor',description:'grow',accent:'#fff',badge:'궁극기 성장',hint:'보스 화력 직접 상승',best:true},
 {kind:'upgrade',id:'spellPower',title:'Power',description:'grow',accent:'#fff',badge:'기본 성장',hint:'안정적인 전투 강화',best:false},
];
test('phase 615 completed midrun rewards keep exactly one recommendation',()=>{const out=reduceRepeatBossRewardDecision(choices,{elapsedSeconds:2200,activeRelic:'abyss-eye',activeFusionCount:2});assert.equal(out.filter(x=>x.best).length,1);});
test('phase 616 completed builds prefer a non-replacement growth reward when one exists',()=>{const out=reduceRepeatBossRewardDecision(choices,{elapsedSeconds:2200,activeRelic:'abyss-eye',activeFusionCount:2});assert.notEqual(out.find(x=>x.best)?.kind,'relic');});
test('phase 617 repeat reward guidance uses a short maintain-build badge without reordering cards',()=>{const out=reduceRepeatBossRewardDecision(choices,{elapsedSeconds:2200,activeRelic:'abyss-eye',activeFusionCount:2});assert.deepEqual(out.map(x=>x.title),choices.map(x=>x.title));assert.match(out.find(x=>x.best)?.badge??'',/유지/);});
test('phase 618 repeat reward reduction is inactive outside the 30-60 minute completed-build window',()=>{const out=reduceRepeatBossRewardDecision(choices,{elapsedSeconds:1200,activeRelic:'abyss-eye',activeFusionCount:2});assert.deepEqual(out,choices);});
