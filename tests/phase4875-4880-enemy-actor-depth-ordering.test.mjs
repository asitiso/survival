import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sourceUrl = new URL('../src/game/enemy-actor-depth-ordering.ts', import.meta.url);
const enemiesSource = fs.readFileSync(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');
const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');

async function loadModule() {
  assert.equal(fs.existsSync(sourceUrl), true, 'enemy actor depth-ordering presentation module must exist');
  return import('../dist/game/enemy-actor-depth-ordering.js');
}

const actor = (id, y) => ({ id, pos: { x: 100, y }, radius: 20 });

test('phase 4875 actor depth ordering is presentation-only and does not mutate source order', async () => {
  const mod = await loadModule();
  const source = [actor('front', 300), actor('back', 120), actor('mid', 220)];
  const before = source.map((entry) => entry.id);
  const ordered = mod.enemyActorDepthOrdered(source);
  assert.deepEqual(source.map((entry) => entry.id), before);
  assert.notEqual(ordered, source);
  assert.deepEqual(ordered.map((entry) => entry.id), ['back', 'mid', 'front']);
});

test('phase 4876 actor painter order runs from lower world y to higher world y', async () => {
  const mod = await loadModule();
  const ordered = mod.enemyActorDepthOrdered([
    actor('y360', 360),
    actor('y90', 90),
    actor('y240', 240),
    actor('y150', 150),
  ]);
  assert.deepEqual(ordered.map((entry) => entry.pos.y), [90, 150, 240, 360]);
});

test('phase 4877 equal-depth actors preserve original render order for deterministic overlays', async () => {
  const mod = await loadModule();
  const ordered = mod.enemyActorDepthOrdered([
    actor('a', 200),
    actor('b', 200),
    actor('c', 200),
  ]);
  assert.deepEqual(ordered.map((entry) => entry.id), ['a', 'b', 'c']);
});

test('phase 4878 malformed depth remains deterministic and cannot poison the comparator', async () => {
  const mod = await loadModule();
  const ordered = mod.enemyActorDepthOrdered([
    actor('valid-back', 80),
    actor('nan', Number.NaN),
    actor('valid-front', 260),
    actor('inf', Number.POSITIVE_INFINITY),
  ]);
  assert.deepEqual(ordered.map((entry) => entry.id), ['valid-back', 'valid-front', 'nan', 'inf']);
});

test('phase 4879 enemy renderer consumes a depth-ordered copy instead of mutating gameplay enemy storage', () => {
  assert.match(enemiesSource, /enemyActorDepthOrdered/);
  assert.match(enemiesSource, /for\s*\(const enemy of enemyActorDepthOrdered\(this\.enemies\)\)/);
  assert.doesNotMatch(enemiesSource, /this\.enemies\.sort\s*\(/);
});

test('phase 4880 terrain and hero readability contracts remain layered around the depth-ordered enemy pass', () => {
  assert.match(
    gameSource,
    /this\.enemies\.renderEnemies\([\s\S]*this\.drawEnemyDefeatBodyTransitions\(ctx\);[\s\S]*this\.drawTerrainForegroundOcclusion\(ctx\);[\s\S]*this\.drawHero\(ctx, residualMotion\);/
  );
});
