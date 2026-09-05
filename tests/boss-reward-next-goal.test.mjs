import test from 'node:test';
import assert from 'node:assert/strict';
import { bossRewardNextGoal } from '../dist/game/boss-reward-next-goal.js';

const fullEquipment={coins:1200,weapon:{id:'arcane-staff',name:'Arcane',rank:2,legendary:false},armor:{id:'iron-robe',name:'Robe',rank:2,legendary:false},healingPotions:2};
const levels={fireBolt:8,chainLightning:10,frostNova:7,flameField:9,meteorStorm:3,blackHole:3};

test('phase 591 post-boss goal points at an empty equipment slot before optional optimization',()=>{
  const g=bossRewardNextGoal({elapsedSeconds:560,heroId:'arkan',spellLevels:levels,activeRelic:'abyss-eye',activeFusions:[],equipment:{...fullEquipment,weapon:null}});
  assert.equal(g?.kind,'equipment');
  assert.match(g?.label??'',/상점 무기/);
});

test('phase 592 choosing boss growth without a relic makes the next boss relic goal explicit',()=>{
  const g=bossRewardNextGoal({elapsedSeconds:600,heroId:'seria',spellLevels:levels,activeRelic:null,activeFusions:[],equipment:fullEquipment});
  assert.equal(g?.kind,'relic');
  assert.match(g?.label??'',/유물/);
});

test('phase 593 a mature post-boss build points at the nearest fusion component instead of generic advice',()=>{
  const g=bossRewardNextGoal({elapsedSeconds:700,heroId:'kain',spellLevels:levels,activeRelic:'abyss-eye',activeFusions:[],equipment:fullEquipment});
  assert.equal(g?.kind,'fusion');
  assert.match(g?.label??'',/Lv\.|융합/);
});

test('phase 594 post-boss goal stays one-line and is bounded to the first thirty minutes with no new action',()=>{
  const g=bossRewardNextGoal({elapsedSeconds:700,heroId:'edric',spellLevels:levels,activeRelic:'abyss-eye',activeFusions:[],equipment:fullEquipment});
  const late=bossRewardNextGoal({elapsedSeconds:1801,heroId:'edric',spellLevels:levels,activeRelic:'abyss-eye',activeFusions:[],equipment:fullEquipment});
  assert.ok((g?.label.length??0)<=44);
  assert.equal(g?.newActionCount,0);
  assert.equal(late,null);
});
