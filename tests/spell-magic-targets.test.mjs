import test from 'node:test';
import assert from 'node:assert/strict';
import { SpellSystem } from '../dist/game/spells.js';
import { EnemyManager } from '../dist/game/enemies.js';
import { createHero } from '../dist/game/entities.js';

test('spell world can forward magic impact into an optional tactical target sink', () => {
  const spells = new SpellSystem();
  const hero = createHero('seria');
  const enemies = new EnemyManager();
  const hits = [];
  assert.equal(spells.tryCast('spell3', { hero, enemies, magicTargets: { hitMagic: (pos, strength) => hits.push({pos,strength}) } }), true);
  assert.ok(hits.length >= 1);
  assert.ok(hits[0].strength > 1);
});

test('existing spell callers remain valid without a magic target sink', () => {
  const spells = new SpellSystem();
  const hero = createHero('arkan');
  const enemies = new EnemyManager();
  assert.doesNotThrow(() => spells.tryCast('spell3', { hero, enemies }));
});
