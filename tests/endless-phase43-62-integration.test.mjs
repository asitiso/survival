import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

import { ACTION_BUTTONS } from '../dist/game/config.js';
import { deriveHeroFinalForm } from '../dist/game/endless/final-form.js';
import { createDefaultOverdriveState, advanceBuildOverdrive, overdriveModifiers } from '../dist/game/endless/build-overdrive.js';
import { mythicBossProfile } from '../dist/game/endless/mythic-boss.js';
import { mythicPhaseProfile } from '../dist/game/endless/mythic-phases.js';

const game = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
const results = fs.readFileSync(new URL('../src/ui/results.ts', import.meta.url), 'utf8');

test('phase 43-62 integration preserves exactly nine combat actions', () => {
  assert.equal(ACTION_BUTTONS.length,9);
});

test('game composes final form and overdrive into the existing combat build instead of new actions', () => {
  assert.match(game,/deriveHeroFinalForm\(/);
  assert.match(game,/finalFormModifiers\(/);
  assert.match(game,/resolveBuildArchetype\(/);
  assert.match(game,/overdriveModifiers\(/);
  const form=deriveHeroFinalForm('arkan',['wildfire-doctrine','solar-collapse','ash-step'],90*60_000);
  assert.equal(form?.id,'solar-sovereign');
  let state=createDefaultOverdriveState();
  state=advanceBuildOverdrive(state,Array.from({length:50},()=>({type:'spell_cast',spellId:'fireBolt'})),90*60_000);
  assert.equal(overdriveModifiers(state,'burst',90*60_000+1).active,true);
});

test('game wires mythic hp ratio and weakpoint ratio into the new three-phase profile', () => {
  assert.match(game,/mythicPhaseProfile\(/);
  assert.match(game,/boss\.hp\s*\/\s*Math\.max\(1,\s*boss\.maxHp\)/);
  const mythic=mythicBossProfile(3700,5,3);
  assert.equal(mythicPhaseProfile(mythic,.2,0).phase,3);
});

test('same-condition retry uses retry blueprint without opening another trait choice', () => {
  assert.match(game,/saveRetryBlueprint\(/);
  assert.match(game,/retryBlueprint/);
  assert.match(game,/this\.resetRun\(retryBlueprint\.heroId,\s*retryBlueprint\.traitId,\s*retryBlueprint\)/);
  assert.match(results,/같은 조건으로 재도전/);
});

test('recovery journal is scheduled separately from fifteen-second snapshot and loaded as final fallback', () => {
  assert.match(game,/loadRunSnapshotWithJournal\(/);
  assert.match(game,/appendRecoveryCheckpoint\(/);
  assert.match(game,/nextRecoveryJournalAt\s*=\s*60/);
  assert.match(game,/this\.elapsed\s*>=\s*this\.nextRecoveryJournalAt/);
});

test('results receive compact comparison lines and build identity without a new results screen', () => {
  assert.match(game,/compareRunResult\(/);
  assert.match(game,/comparisonLines/);
  assert.match(game,/finalForm:/);
  assert.match(game,/archetype:/);
  assert.match(results,/result-comparison/);
});
