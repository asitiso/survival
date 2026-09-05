import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { createBuildReplayPlan } from '../dist/domain/build-replay.js';
import { encodeBuildCapsule } from '../dist/domain/build-capsule.js';
import { replayGuidanceMapIconStyle } from '../dist/domain/build-replay-guidance.js';

const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const results=fs.readFileSync(new URL('../src/ui/results.ts',import.meta.url),'utf8');
const lobby=fs.readFileSync(new URL('../src/ui/lobby.ts',import.meta.url),'utf8');
const styles=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');

test('Phase 1941 HUD keeps map text and adds a static battlefield identity draw',()=>{
  assert.match(game,/mapName:this\.terrain\.currentLayout\.name/);
  assert.match(game,/drawBattlefieldIdentityHud\(ctx, this\.terrain\.currentLayout\.id, this\.terrain\.evolutionStage/);
  assert.match(game,/battlefieldEnvironmentSprite\(mapId, stage\)/);
});

test('Phase 1941 results preserve map text while accepting map id and stage for identity',()=>{
  assert.match(results,/mapId\?: MapId/);
  assert.match(results,/mapEvolutionStage\?: MapEvolutionStage/);
  assert.match(results,/battlefieldEnvironmentIconStyle\(result\.mapId,result\.mapEvolutionStage \?\? 0\)/);
  assert.match(results,/전장 <b>\$\{result\.map\}<\/b>/);
});

test('Phase 1942 lobby recent and resume reuse existing map data without schema additions',()=>{
  assert.match(lobby,/newest\.mapId/);
  assert.match(lobby,/mapEvolutionStage\(newest\.seconds\)/);
  assert.match(lobby,/this\.resumeSnapshot\.map\.id/);
  assert.match(lobby,/this\.resumeSnapshot\.map\.evolutionStage/);
  assert.match(styles,/\.battlefield-identity-icon/);
});

test('Phase 1942 replay exposes target map identity from the existing capsule mapId',()=>{
  const capsule=encodeBuildCapsule({version:1,heroId:'arkan',traitId:'destruction',threatLevel:3,mapId:'crystalQuarry',seed:77,finalForm:null,ascensions:[],fateChoices:[],relic:null,fusions:[],archetype:'burst',spellLevels:{fireBolt:4,chainLightning:3,frostNova:2,flameField:2,meteorStorm:1,blackHole:1}});
  const plan=createBuildReplayPlan(capsule);
  assert.ok(plan);
  const style=replayGuidanceMapIconStyle(plan);
  assert.match(style,/battlefield-environments\.png/);
  assert.match(style,/--battlefield-bg-position:0% 100%/);
});
