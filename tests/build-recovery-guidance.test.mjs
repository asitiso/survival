import test from 'node:test';
import assert from 'node:assert/strict';
import { buildRecoveryGuidance } from '../dist/game/build-recovery-guidance.js';

const levels={fireBolt:10,chainLightning:8,frostNova:4,flameField:6,meteorStorm:3,blackHole:3};
const fullEquipment={coins:500,weapon:{id:'arcane-staff',kind:'weapon',name:'마력 지팡이',rank:2,power:.15,legendary:false},armor:{id:'iron-robe',kind:'armor',name:'철갑 로브',rank:2,power:.08,legendary:false},healingPotions:2};

test('phase 431 recovery guidance stays silent during the opening so it does not teach over the fight',()=>{
  assert.equal(buildRecoveryGuidance({heroId:'arkan',elapsedSeconds:300,spellLevels:levels,activeRelic:null,activeFusions:[],equipment:fullEquipment}),null);
});

test('phase 432 recovery guidance prioritizes a missing equipment slot before optional optimization',()=>{
  const hint=buildRecoveryGuidance({heroId:'arkan',elapsedSeconds:900,spellLevels:levels,activeRelic:'abyss-eye',activeFusions:[],equipment:{...fullEquipment,armor:null}});
  assert.equal(hint?.kind,'equipment');
  assert.match(hint?.label??'',/방어구/);
});

test('phase 433 recovery guidance points at the nearest actionable fusion component',()=>{
  const hint=buildRecoveryGuidance({heroId:'kain',elapsedSeconds:1200,spellLevels:levels,activeRelic:'storm-core',activeFusions:[],equipment:fullEquipment});
  assert.equal(hint?.kind,'fusion');
  assert.match(hint?.label??'',/번개/);
  assert.match(hint?.label??'',/10/);
});

test('phase 434 a structurally complete build does not waste a HUD line on generic advice',()=>{
  const maxed={...levels,chainLightning:10,frostNova:10};
  const hint=buildRecoveryGuidance({heroId:'edric',elapsedSeconds:3600,spellLevels:maxed,activeRelic:'oath-seal',activeFusions:['solar-detonation','thunder-singularity'],equipment:fullEquipment});
  assert.equal(hint,null);
});
