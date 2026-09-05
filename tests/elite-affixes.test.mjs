import test from 'node:test';
import assert from 'node:assert/strict';
import { ELITE_AFFIXES, eliteAffixCount, selectEliteAffixes, eliteAffixModifiers, eliteAffixLabel } from '../dist/game/elite-affixes.js';

test('six elite affixes exist with short readable labels', () => {
  assert.equal(ELITE_AFFIXES.length, 6);
  assert.equal(new Set(ELITE_AFFIXES).size, 6);
  for (const id of ELITE_AFFIXES) assert.ok(eliteAffixLabel(id).length <= 5);
});

test('early elites get one affix and dangerous late elites get two distinct affixes', () => {
  assert.equal(eliteAffixCount(2), 1);
  assert.equal(eliteAffixCount(8), 2);
  assert.equal(selectEliteAffixes(2, () => 0.1).length, 1);
  const late = selectEliteAffixes(9, (() => { let n = 0; return () => [0.1,0.7][n++ % 2]; })());
  assert.equal(late.length, 2);
  assert.notEqual(late[0], late[1]);
});

test('affixes change different combat channels rather than all being hp multipliers', () => {
  const swift = eliteAffixModifiers(['swift']);
  const armored = eliteAffixModifiers(['armored']);
  const regen = eliteAffixModifiers(['regenerating']);
  const frenzy = eliteAffixModifiers(['frenzied']);
  const commander = eliteAffixModifiers(['commander']);
  const shield = eliteAffixModifiers(['manaShield']);
  assert.ok(swift.speedMultiplier > 1.2 && swift.attackIntervalMultiplier < 1);
  assert.ok(armored.damageTakenMultiplier < 0.8);
  assert.ok(regen.regenPerSecondRatio > 0);
  assert.ok(frenzy.lowHpDamageMultiplier > 1.4);
  assert.ok(commander.commandAuraMultiplier > 1.1);
  assert.ok(shield.shieldRatio >= 0.3);
});
