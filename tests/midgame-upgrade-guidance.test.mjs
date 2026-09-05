import test from 'node:test';
import assert from 'node:assert/strict';
import { guideMidgameUpgradeChoices } from '../dist/game/midgame-upgrade-guidance.js';

const choice=(id,description='일반 강화')=>({id,title:String(id),description,accent:'#fff'});
const levels={fireBolt:7,chainLightning:10,frostNova:6,flameField:9,meteorStorm:2,blackHole:2};

test('phase 583 midgame guidance marks exactly one bridge choice from ten through twenty minutes',()=>{
  const guided=guideMidgameUpgradeChoices([choice('fireBolt'),choice('spellPower'),choice('moveSpeed')],{elapsedSeconds:720,heroId:'arkan',spellLevels:levels,activeFusions:[]});
  assert.equal(guided.filter(x=>x.best).length,1);
  assert.equal(guided.find(x=>x.best)?.badge,'빌드 연결');
});

test('phase 584 a nearest fusion component outranks generic stats when it is offered',()=>{
  const guided=guideMidgameUpgradeChoices([choice('spellPower'),choice('flameField','Lv.10 · 최종 진화 · 공격 형태 대폭 변화'),choice('moveSpeed')],{elapsedSeconds:780,heroId:'arkan',spellLevels:levels,activeFusions:[]});
  assert.equal(guided.find(x=>x.best)?.id,'flameField');
  assert.match(guided.find(x=>x.best)?.hint??'',/융합|진화/);
});

test('phase 585 midgame guidance never reorders the actual level-up cards',()=>{
  const choices=[choice('moveSpeed'),choice('fireBolt'),choice('cooldown')];
  const guided=guideMidgameUpgradeChoices(choices,{elapsedSeconds:900,heroId:'seria',spellLevels:levels,activeFusions:[]});
  assert.deepEqual(guided.map(x=>x.id),choices.map(x=>x.id));
});

test('phase 586 midgame guidance is bounded to ten-through-twenty minutes and does not mutate spell levels',()=>{
  const before=structuredClone(levels);
  const early=guideMidgameUpgradeChoices([choice('fireBolt'),choice('spellPower'),choice('cooldown')],{elapsedSeconds:599,heroId:'kain',spellLevels:levels,activeFusions:[]});
  const late=guideMidgameUpgradeChoices([choice('fireBolt'),choice('spellPower'),choice('cooldown')],{elapsedSeconds:1200,heroId:'kain',spellLevels:levels,activeFusions:[]});
  assert.equal(early.some(x=>x.best||x.badge||x.hint),false);
  assert.equal(late.some(x=>x.best||x.badge||x.hint),false);
  assert.deepEqual(levels,before);
});
