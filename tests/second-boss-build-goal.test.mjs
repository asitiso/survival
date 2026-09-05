import test from 'node:test';
import assert from 'node:assert/strict';
import { secondBossBuildGoal } from '../dist/game/second-boss-build-goal.js';
const base={heroId:'arkan',spellLevels:{fireBolt:10,chainLightning:10,frostNova:9,flameField:8,meteorStorm:3,blackHole:3},activeRelic:'abyss-eye',activeFusions:['fire-chain'],equipment:{coins:2000,weapon:{id:'arcane-staff',kind:'weapon',name:'Arcane',rank:3,power:.15,legendary:false},armor:{id:'iron-robe',kind:'armor',name:'Robe',rank:3,power:.08,legendary:false},healingPotions:2}};
test('phase 603 second-boss goal stays hidden before the second boss or before 30 minutes',()=>{assert.equal(secondBossBuildGoal({...base,elapsedSeconds:1799,bossesKilled:2}),null);assert.equal(secondBossBuildGoal({...base,elapsedSeconds:2000,bossesKilled:1}),null);});
test('phase 604 second-boss goal exposes exactly one existing build recovery target',()=>{const goal=secondBossBuildGoal({...base,elapsedSeconds:2000,bossesKilled:2});assert.ok(goal);assert.match(goal.label,/다음 목표/);assert.equal(goal.newActionCount,0);});
test('phase 605 completed builds receive a short maintain-build goal instead of another recovery lecture',()=>{const goal=secondBossBuildGoal({...base,elapsedSeconds:2500,bossesKilled:3,activeFusions:['fire-chain','frost-flame']});assert.equal(goal?.kind,'complete');assert.match(goal?.label??'',/완성 빌드/);});
test('phase 606 second-boss goal stops after the 30-60 minute focus window',()=>{assert.equal(secondBossBuildGoal({...base,elapsedSeconds:3601,bossesKilled:4}),null);});
