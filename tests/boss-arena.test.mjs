import test from 'node:test';
import assert from 'node:assert/strict';
import { BossArenaSystem } from '../dist/game/boss-arena.js';

const ctx = { bossPos: {x:800,y:420}, heroPos:{x:900,y:420}, archetype:'inferno', phase:2, variantTier:1 };

test('boss arena telegraphs hazards before they become damaging and keeps them bounded', () => {
  const arena = new BossArenaSystem(() => 0.25);
  for (let i=0;i<8;i++) arena.update(1, ctx);
  assert.ok(arena.hazards.length > 0);
  assert.ok(arena.hazards.length <= 6);
  const hazard = arena.hazards[0];
  assert.ok(hazard.telegraph >= 0);
  assert.ok(hazard.ttl > 0);
});

test('archetypes produce distinct hazard kinds and damage remains bounded', () => {
  const kinds = new Set();
  for (const archetype of ['inferno','summoner','juggernaut']) {
    const arena = new BossArenaSystem(() => 0.2);
    for (let i=0;i<7;i++) arena.update(1, {...ctx, archetype});
    kinds.add(arena.hazards[0]?.kind);
    for (const h of arena.hazards) h.telegraph = 0;
    assert.ok(arena.damageAt(arena.hazards[0]?.pos ?? ctx.heroPos, 18) <= 28);
  }
  assert.equal(kinds.size, 3);
});

test('reset removes every boss arena hazard', () => {
  const arena = new BossArenaSystem(() => 0.1);
  for (let i=0;i<7;i++) arena.update(1, ctx);
  arena.reset();
  assert.equal(arena.hazards.length, 0);
});
