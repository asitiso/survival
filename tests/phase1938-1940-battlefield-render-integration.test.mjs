import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const terrain=fs.readFileSync(new URL('../src/game/terrain.ts',import.meta.url),'utf8');

test('Phase 1938 arena keeps gradient fallback before optional battlefield raster overlay',()=>{
  assert.match(game,/BATTLEFIELD_ENVIRONMENT_ATLAS/);
  assert.match(game,/battlefieldEnvironmentSprite/);
  assert.match(game,/private battlefieldEnvironmentAtlasImage: HTMLImageElement \| null = null;/);
  assert.match(game,/private battlefieldEnvironmentAtlasReady = false;/);
  assert.match(game,/image\.onerror = \(\) => \{ this\.battlefieldEnvironmentAtlasReady = false; \}/);
  const drawArena=game.slice(game.indexOf('private drawArena('),game.indexOf('private drawCore('));
  const fallback=drawArena.indexOf('ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT)');
  const ready=drawArena.indexOf('this.battlefieldEnvironmentAtlasReady');
  const draw=drawArena.indexOf('ctx.drawImage(');
  assert.ok(fallback>=0 && ready>fallback && draw>ready);
});

test('Phase 1939 arena stage identity reads existing terrain evolution state and stays static',()=>{
  const drawArena=game.slice(game.indexOf('private drawArena('),game.indexOf('private drawCore('));
  assert.match(drawArena,/battlefieldEnvironmentSprite\(this\.terrain\.currentLayout\.id, this\.terrain\.evolutionStage\)/);
  assert.doesNotMatch(drawArena,/requestAnimationFrame|setInterval|environmentParallax|battlefieldPulse/);
});

test('Phase 1940 terrain renderer consumes presentation-only map material without changing geometry loops',()=>{
  assert.match(terrain,/battlefieldTerrainMaterial\(this\.currentLayout\.id\)/);
  assert.match(terrain,/for \(const pool of this\.pools\)/);
  assert.match(terrain,/for \(const wall of this\.walls\)/);
  assert.match(terrain,/for \(const crystal of this\.crystals\)/);
});
