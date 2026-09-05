import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ACTION_BUTTONS } from '../dist/game/config.js';
import { encodeBuildCapsule } from '../dist/domain/build-capsule.js';
import { createBuildReplayPlan } from '../dist/domain/build-replay.js';
import { sanitizeRunSnapshot } from '../dist/domain/run-snapshot.js';
import { createDefaultEndlessState } from '../dist/game/endless/runtime.js';
import { serializeExtension, restoreExtension } from '../dist/game/endless/snapshot.js';
import { mythicBossProfile } from '../dist/game/endless/mythic-boss.js';
import { mythicLastLawIdentityProfile } from '../dist/game/endless/mythic-last-law-identity.js';
import { FINAL_FORM_PATTERN_IDS } from '../dist/game/endless/final-form-patterns.js';
import { mobileFrameGovernorPolicy } from '../dist/game/endless/mobile-frame-governor.js';

const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const input=fs.readFileSync(new URL('../src/core/input.ts',import.meta.url),'utf8');
const results=fs.readFileSync(new URL('../src/ui/results.ts',import.meta.url),'utf8');

const payload={version:1,heroId:'arkan',traitId:'destruction',threatLevel:5,mapId:'ruinedGate',seed:999,finalForm:'solar-sovereign',ascensions:['wildfire-doctrine','solar-collapse','cinder-heart'],fateChoices:['frenzy','golden','guardian'],relic:'ember-crown',fusions:['solar-detonation','storm-crucible'],archetype:'burst',spellLevels:{fireBolt:10,chainLightning:9,frostNova:8,flameField:10,meteorStorm:6,blackHole:5}};

test('phase 83-102 keeps exactly nine combat actions and does not add a third results action',()=>{
  assert.equal(ACTION_BUTTONS.length,9);
  assert.deepEqual(ACTION_BUTTONS.map((x)=>x.id),['spell1','spell2','spell3','spell4','ultimate1','ultimate2','potion','shop','auto']);
  assert.match(results,/result-retry/); assert.match(results,/result-lobby/); assert.doesNotMatch(results,/result-replay|result-checkpoint/);
});

test('build replay uses the capsule as a target while snapshot preserves replay identity',()=>{
  const code=encodeBuildCapsule(payload); const plan=createBuildReplayPlan(code); assert.ok(plan);
  const snap=sanitizeRunSnapshot({version:1,savedAt:1,heroId:'arkan',traitId:'destruction',threatLevel:5,elapsed:100,hero:{level:3,xp:0,xpNext:10,hp:100,maxHp:100,coins:0,kills:0},coreHp:500,spellLevels:{fireBolt:1,chainLightning:1,frostNova:1,flameField:1,meteorStorm:1,blackHole:1},equipment:{coins:0,weapon:null,armor:null,healingPotions:1},relic:null,fusions:[],fateChoices:[],map:{id:'ruinedGate',evolutionStage:0},progression:{bossesKilled:0,goldEarned:0,shopTokens:0},replayCapsule:code});
  assert.equal(snap?.replayCapsule,code);
  assert.match(game,/currentReplayPlan/); assert.match(game,/replayGuidance\(/); assert.match(game,/REPLAY \$\{replayGuide\.progress\}%/); assert.match(game,/createBuildReplayPlan\(buildCapsule\)/);
});

test('checkpoint state migrates in endless snapshot and Game forces journal-safe save on receipt',()=>{
  const state=createDefaultEndlessState(123); state.checkpoints={reachedMilestones:[90,180,300]};
  assert.deepEqual(restoreExtension(serializeExtension(state),1).checkpoints,state.checkpoints);
  assert.match(game,/effect\.type === 'run_checkpoint'/); assert.match(game,/appendRecoveryCheckpoint/); assert.match(game,/자동 저장 완료/);
});

test('mythic identity and final form attack layers are wired into combat rather than presentation only',()=>{
  const mythic=mythicBossProfile(7200,5,3);
  assert.notEqual(mythicLastLawIdentityProfile(mythic,'inferno',.1,1).lawId,mythicLastLawIdentityProfile(mythic,'timeEater',.1,1).lawId);
  assert.equal(FINAL_FORM_PATTERN_IDS.size,12);
  assert.match(game,/mythicLastLawIdentityProfile\(/); assert.match(game,/triggerFinalFormPattern\(/); assert.match(game,/this\.enemies\.damage\(enemy, baseDamage\)/);
});

test('mobile polish is input-accurate and sheds decorative load before combat logic',()=>{
  assert.match(input,/hitTestActionButton\(p\)/); assert.match(input,/applyJoystickDeadzone/);
  const minimal=mobileFrameGovernorPolicy('minimal');
  assert.equal(minimal.particleCap,64); assert.equal(minimal.trailCap,28); assert.equal(minimal.telegraphCap,24);
  assert.match(game,/comfort\.vfxDensity/); assert.match(game,/governor\.telegraphCap/);
});
