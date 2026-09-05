import test from 'node:test';
import assert from 'node:assert/strict';
import { guideOpeningUpgradeChoices } from '../dist/game/opening-upgrade-guidance.js';

const choice=(id,description='일반 강화')=>({id,title:String(id),description,accent:'#fff'});

test('phase 547 opening level-up guidance marks exactly one stable recommendation',()=>{
  const guided=guideOpeningUpgradeChoices([choice('spellPower'),choice('cooldown'),choice('moveSpeed')],{elapsedSeconds:80,hpRatio:1});
  assert.equal(guided.filter(x=>x.best).length,1);
  assert.equal(guided.find(x=>x.best)?.id,'spellPower');
});

test('phase 548 an imminent spell evolution outranks generic early stat growth',()=>{
  const guided=guideOpeningUpgradeChoices([choice('spellPower'),choice('fireBolt','Lv.5 · 1차 진화 · 공격 형태 변화'),choice('cooldown')],{elapsedSeconds:100,hpRatio:1});
  assert.equal(guided.find(x=>x.best)?.id,'fireBolt');
  assert.match(guided.find(x=>x.best)?.hint??'',/진화/);
});

test('phase 549 low opening HP makes immediate recovery the recommendation instead of greed',()=>{
  const guided=guideOpeningUpgradeChoices([choice('spellPower'),choice('maxHp'),choice('cooldown')],{elapsedSeconds:100,hpRatio:.48});
  assert.equal(guided.find(x=>x.best)?.id,'maxHp');
});

test('phase 550 guidance disappears after ten minutes so mature builds are not over-directed',()=>{
  const guided=guideOpeningUpgradeChoices([choice('spellPower'),choice('cooldown'),choice('moveSpeed')],{elapsedSeconds:601,hpRatio:1});
  assert.equal(guided.some(x=>x.best||x.badge||x.hint),false);
});
