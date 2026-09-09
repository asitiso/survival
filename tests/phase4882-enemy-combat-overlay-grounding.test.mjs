import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');

test('phase 4882 live hit and death image overlays use stable world-y presentation ordering', () => {
  assert.match(
    gameSource,
    /for\s*\(const enemy of stableWorldYDepthOrdered\(this\.enemies\.enemies,\s*\(enemy\)\s*=>\s*enemy\.pos\.y\)\)/,
  );
  assert.match(
    gameSource,
    /for\s*\(const burst of stableWorldYDepthOrdered\(this\.enemyDeathImageBursts,\s*\(burst\)\s*=>\s*burst\.y\)\)/,
  );
});

test('phase 4882 finisher and freeze shatter overlays use stable world-y presentation ordering', () => {
  assert.match(
    gameSource,
    /for\s*\(const cue of stableWorldYDepthOrdered\(this\.enemyFinisherVfx,\s*\(cue\)\s*=>\s*cue\.y\)\)/,
  );
  assert.match(
    gameSource,
    /for\s*\(const cue of stableWorldYDepthOrdered\(this\.freezeShatterVfx,\s*\(cue\)\s*=>\s*cue\.y\)\)/,
  );
});

test('phase 4882 physical enemy overlays stay below terrain foreground while tactical warning layers remain above it', () => {
  assert.match(
    gameSource,
    /this\.enemies\.renderEnemies\([\s\S]*this\.drawEnemyDefeatBodyTransitions\(ctx\);[\s\S]*this\.drawEnemyCombatImageVfx\(ctx\);[\s\S]*this\.drawEnemyFinisherVfx\(ctx\);[\s\S]*this\.drawFreezeShatterVfx\(ctx\);[\s\S]*this\.drawTerrainForegroundOcclusion\(ctx\);[\s\S]*this\.drawElitePackApproachFormationVfx\(ctx\);[\s\S]*this\.drawGoldenGoblinEventResponseIdentity\(ctx\);[\s\S]*this\.drawBossSpecialIntentCue\(ctx\);/,
  );
});

test('phase 4882 presentation ordering never mutates lifecycle arrays with in-place sort', () => {
  assert.doesNotMatch(gameSource, /this\.(?:enemies\.enemies|enemyDeathImageBursts|enemyFinisherVfx|freezeShatterVfx)\.sort\s*\(/);
});
