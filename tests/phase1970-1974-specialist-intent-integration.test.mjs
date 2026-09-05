import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { autoTargetIndicator } from '../dist/game/auto-target-visibility.js';

const gameSource=readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const enemySource=readFileSync(new URL('../src/game/enemies.ts',import.meta.url),'utf8');
const autoTargetSource=readFileSync(new URL('../src/game/auto-targeting.ts',import.meta.url),'utf8');

const target=(type,target='hero')=>({id:7,type,pos:{x:300,y:300},target,hp:50,maxHp:100,alive:true,radius:22});

test('phase 1970 game loads specialist intent atlas independently and passes it to enemy rendering',()=>{
  assert.match(gameSource,/SPECIALIST_INTENT_ATLAS/);
  assert.match(gameSource,/specialistIntentAtlasImage/);
  assert.match(gameSource,/specialistIntentAtlasReady/);
  assert.match(gameSource,/initializeSpecialistIntentAtlas\(\)/);
  assert.match(gameSource,/image\.src\s*=\s*SPECIALIST_INTENT_ATLAS\.src/);
  assert.match(gameSource,/renderEnemies\([\s\S]*this\.specialistIntentAtlasImage,[\s\S]*this\.specialistIntentAtlasReady,[\s\S]*this\.hero\.pos/);
});

test('phase 1970-1974 specialist body rendering is icon-first while all six legacy cues remain',()=>{
  assert.match(enemySource,/specialistIntentIcon/);
  assert.match(enemySource,/specialistIntentOnBodyLayout/);
  assert.match(enemySource,/specialistIntentEmphasis/);
  assert.match(enemySource,/specialistIntentAtlasReady\s*&&\s*specialistIntentAtlasImage/);
  assert.match(enemySource,/ctx\.drawImage\(specialistIntentAtlasImage/);
  assert.match(enemySource,/enemy\.type === 'bomber'/);
  assert.match(enemySource,/enemy\.type === 'shaman'/);
  assert.match(enemySource,/enemy\.type === 'shieldbearer'/);
  assert.match(enemySource,/enemy\.type === 'assassin'/);
  assert.match(enemySource,/enemy\.type === 'siegeGolem'/);
  assert.match(enemySource,/ctx\.fillText\('CORE'/);
  assert.match(enemySource,/enemy\.type === 'nullifier'/);
  assert.match(enemySource,/enemy\.preferredRange \* 0\.32/);
});

test('phase 1971 active-state inputs come only from existing guard timer target and nullifier range',()=>{
  assert.match(enemySource,/guardHp:\s*enemy\.guardHp\s*\?\?\s*0/);
  assert.match(enemySource,/specialistTimer:\s*enemy\.specialistTimer\s*\?\?\s*99/);
  assert.match(enemySource,/target:\s*enemy\.target/);
  assert.match(enemySource,/distance\(enemy\.pos,\s*heroPos\)\s*<=\s*245\s*\+\s*enemy\.radius/);
});

test('phase 1973 AUTO target guidance reuses specialist identity without changing labels',()=>{
  assert.equal(autoTargetIndicator(target('bomber'),{x:0,y:0},null).specialistIntent,'bomber');
  assert.equal(autoTargetIndicator(target('shaman'),{x:0,y:0},null).specialistIntent,'shaman');
  assert.equal(autoTargetIndicator(target('shieldbearer'),{x:0,y:0},null).specialistIntent,'shieldbearer');
  assert.equal(autoTargetIndicator(target('assassin'),{x:0,y:0},null).specialistIntent,'assassin');
  assert.equal(autoTargetIndicator(target('siegeGolem','core'),{x:0,y:0},{x:100,y:100}).specialistIntent,'siegeGolem');
  assert.equal(autoTargetIndicator(target('nullifier'),{x:0,y:0},null).specialistIntent,'nullifier');
  assert.equal(autoTargetIndicator(target('grunt'),{x:0,y:0},null).specialistIntent,null);
  assert.equal(autoTargetIndicator(target('bomber'),{x:0,y:0},null).label,'AUTO · THREAT');
  assert.equal(autoTargetIndicator(target('siegeGolem','core'),{x:0,y:0},{x:100,y:100}).label,'AUTO · CORE');
  assert.match(gameSource,/cue\.specialistIntent/);
  assert.match(gameSource,/specialistIntentIcon\(cue\.specialistIntent\)/);
});

test('phase 1973 targeting weights and switch margin remain frozen',()=>{
  assert.match(autoTargetSource,/enemy\.type==='siegeGolem'\)score\+=110/);
  assert.match(autoTargetSource,/enemy\.type==='bomber'\|\|enemy\.type==='nullifier'\|\|enemy\.type==='assassin'\)score\+=70/);
  assert.match(autoTargetSource,/const AUTO_SWITCH_MARGIN=48/);
});
