import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { ACTION_BUTTONS } from '../dist/game/config.js';
import { createDefaultEndlessState, advanceEndlessRuntime } from '../dist/game/endless/runtime.js';
import { serializeExtension, restoreExtension } from '../dist/game/endless/snapshot.js';
import { deriveHeroFinalForm } from '../dist/game/endless/final-form.js';
import { encodeBuildCapsule, decodeBuildCapsule } from '../dist/domain/build-capsule.js';
import { auditTwelveHourRun } from '../dist/game/endless/twelve-hour-auditor.js';

const game = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
const results = fs.readFileSync(new URL('../src/ui/results.ts', import.meta.url), 'utf8');
const lobby = fs.readFileSync(new URL('../src/ui/lobby.ts', import.meta.url), 'utf8');

function legacy(elapsedMs=130*60_000) {
  return { heroId:'arkan', elapsedMs, level:80, threat:5, kills:14000, bossesDefeated:22, elitesDefeated:600, gold:9000, xp:30000, guardianCoreHp:920, guardianCoreMaxHp:1000, fate:'guardian', spellFusionCount:2, mapEvolutionRank:5, masteryLevel:20, deviceClass:'low' };
}

test('phase 63-82 integration still exposes exactly nine combat actions', () => {
  assert.equal(ACTION_BUTTONS.length, 9);
  assert.deepEqual(ACTION_BUTTONS.map((button)=>button.id), ['spell1','spell2','spell3','spell4','ultimate1','ultimate2','potion','shop','auto']);
});

test('signature and long-run oath progress through the existing endless runtime and snapshot', () => {
  let state=createDefaultEndlessState(1234);
  state.heroAscension.selected=['wildfire-doctrine','solar-collapse','ash-step'];
  const events=Array.from({length:30},()=>({type:'spell_cast',spellId:'fireBolt',fusion:true,affinity:'fire'}));
  const step=advanceEndlessRuntime({legacy:legacy(),state,deltaMs:16,events});
  const restored=restoreExtension(serializeExtension(step.state),1);
  assert.deepEqual(restored.signature,step.state.signature);
  assert.deepEqual(restored.oaths,step.state.oaths);
  assert.equal(deriveHeroFinalForm('arkan',restored.heroAscension.selected,legacy().elapsedMs)?.id,'solar-sovereign');
});

test('game composes signature, oath, last law and frame governor through existing combat and presentation paths', () => {
  assert.match(game,/finalFormSignatureModifiers\(/);
  assert.match(game,/longRunOathModifiers\(/);
  assert.match(game,/mythicLastLawProfile\(/);
  assert.match(game,/advanceMobileFrameGovernor\(/);
  assert.match(game,/mobileFrameGovernorPolicy\(/);
  assert.match(game,/advanceVfxQualityTransition\(this\.vfxQualityTransition, next, qualityDt\)/);
  assert.match(game,/this\.presentation\.quality\s*=\s*this\.vfxQualityTransition\.current/);
});

test('build capsule stays compact and appears in existing result/history surfaces', () => {
  const code=encodeBuildCapsule({version:1,heroId:'arkan',traitId:'pyromancer',threatLevel:5,mapId:'citadel',seed:123456,finalForm:'solar-sovereign',ascensions:['wildfire-doctrine','solar-collapse','ash-step'],fateChoices:['frenzy','guardian','gold'],relic:'phoenix-heart',fusions:['steam-burst','stormfire'],archetype:'burst',spellLevels:{fireBolt:10,chainLightning:8,frostNova:7,flameField:9}});
  assert.ok(code.length <= 100);
  assert.equal(decodeBuildCapsule(code)?.heroId,'arkan');
  assert.match(results,/BUILD CAPSULE/);
  assert.match(lobby,/BUILD \$\{newest\.buildCapsule\}/);
});

test('twelve-hour audit preserves enemy logic while presentation remains bounded', () => {
  const audit=auditTwelveHourRun('low',5);
  assert.equal(audit.passed,true);
  assert.equal(audit.presentationFirst,true);
  assert.ok(audit.checkpoints.every((point)=>point.enemyLogicCap===220));
  assert.ok(audit.maxTransientEntities < 400);
});
