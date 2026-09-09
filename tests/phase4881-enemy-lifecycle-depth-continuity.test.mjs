import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');

const cue = (id, y) => ({ id, death: { y } });

test('phase 4881 defeat bodies use stable presentation-only world-y ordering without mutating lifecycle storage', async () => {
  const mod = await import('../dist/game/enemy-actor-depth-ordering.js');
  assert.equal(typeof mod.stableWorldYDepthOrdered, 'function');

  const source = [cue('front', 320), cue('back', 90), cue('mid', 210)];
  const before = source.map((entry) => entry.id);
  const ordered = mod.stableWorldYDepthOrdered(source, (entry) => entry.death.y);

  assert.deepEqual(source.map((entry) => entry.id), before);
  assert.notEqual(ordered, source);
  assert.deepEqual(ordered.map((entry) => entry.id), ['back', 'mid', 'front']);
});

test('phase 4881 equal-depth defeat bodies preserve source order and malformed depths cannot poison the comparator', async () => {
  const mod = await import('../dist/game/enemy-actor-depth-ordering.js');
  const ordered = mod.stableWorldYDepthOrdered(
    [cue('a', 200), cue('b', 200), cue('nan', Number.NaN), cue('front', 350), cue('inf', Number.POSITIVE_INFINITY)],
    (entry) => entry.death.y,
  );

  assert.deepEqual(ordered.map((entry) => entry.id), ['a', 'b', 'front', 'nan', 'inf']);
});

test('phase 4881 defeat transition renderer consumes a depth-ordered copy', () => {
  assert.match(gameSource, /stableWorldYDepthOrdered\(this\.enemyDefeatBodyTransitions,\s*\(cue\)\s*=>\s*cue\.death\.y\)/);
  assert.doesNotMatch(gameSource, /this\.enemyDefeatBodyTransitions\.sort\s*\(/);
});

test('phase 4881 keeps defeat bodies behind terrain foreground and preserves protected hero post-order', () => {
  assert.match(
    gameSource,
    /this\.enemies\.renderEnemies\([\s\S]*this\.drawEnemyDefeatBodyTransitions\(ctx\);[\s\S]*this\.drawTerrainForegroundOcclusion\(ctx\);[\s\S]*this\.drawHero\(ctx, residualMotion\);/,
  );
});
