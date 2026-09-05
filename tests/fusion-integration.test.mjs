import test from 'node:test';
import assert from 'node:assert/strict';
import { composeFusionSpellModifiers, fusionProcForCast } from '../dist/game/fusion-integration.js';

test('no fusion build leaves spell combat neutral', () => {
  const mod = composeFusionSpellModifiers([], 'arkan', 'fireBolt');
  assert.deepEqual(mod, { damageMultiplier: 1, areaMultiplier: 1, cooldownMultiplier: 1, jumpBonus: 0, pierceBonus: 0, tickMultiplier: 1, slowDurationMultiplier: 1 });
});

test('equipped fusion modifies only its component spells and remains bounded', () => {
  const fire = composeFusionSpellModifiers(['solar-detonation'], 'arkan', 'fireBolt');
  const field = composeFusionSpellModifiers(['solar-detonation'], 'arkan', 'flameField');
  const chain = composeFusionSpellModifiers(['solar-detonation'], 'arkan', 'chainLightning');
  assert.ok(fire.damageMultiplier > 1.1);
  assert.ok(field.areaMultiplier > 1.1);
  assert.equal(chain.damageMultiplier, 1);
  assert.ok(fire.damageMultiplier <= 1.28);
});

test('two fusion modifiers compose without exceeding mobile balance caps', () => {
  const mod = composeFusionSpellModifiers(['glacial-conduit', 'frostfire-cataclysm'], 'kain', 'fireBolt');
  assert.ok(mod.damageMultiplier > 1.1 && mod.damageMultiplier <= 1.32);
  assert.ok(mod.cooldownMultiplier >= 0.78);
  assert.ok(mod.pierceBonus <= 3);
});

test('fusion proc candidates are derived from cast spell without adding a new combat action', () => {
  assert.deepEqual(fusionProcForCast(['solar-detonation', 'storm-crucible'], 'flameField'), ['solar-detonation', 'storm-crucible']);
  assert.deepEqual(fusionProcForCast(['solar-detonation'], 'meteorStorm'), []);
});
