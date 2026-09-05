import test from 'node:test';
import assert from 'node:assert/strict';
import { mythicBossProfile } from '../dist/game/endless/mythic-boss.js';
import { mythicLastLawProfile } from '../dist/game/endless/mythic-last-law.js';

test('mythic last law activates only at fifteen percent hp or lower', () => {
  const mythic = mythicBossProfile(7200, 5, 3);
  assert.equal(mythic.active, true);
  assert.equal(mythicLastLawProfile(mythic, .151, 1).active, false);
  assert.equal(mythicLastLawProfile(mythic, .15, 1).active, true);
  assert.equal(mythicLastLawProfile(mythic, .01, 1).label, 'MYTHIC LAST LAW');
  assert.equal(mythicLastLawProfile({ ...mythic, active:false }, .01, 1).active, false);
});

test('last law is harsh with intact weakpoints but counterplay relieves pressure', () => {
  const mythic = mythicBossProfile(7200, 5, 3);
  const intact = mythicLastLawProfile(mythic, .1, 1);
  const cleared = mythicLastLawProfile(mythic, .1, 0);
  assert.ok(intact.specialCadenceMultiplier < cleared.specialCadenceMultiplier);
  assert.ok(intact.projectileDensityMultiplier > cleared.projectileDensityMultiplier);
  assert.ok(intact.summonCountMultiplier > cleared.summonCountMultiplier);
  assert.ok(intact.dashDistanceMultiplier > cleared.dashDistanceMultiplier);
  assert.ok(cleared.bossDamageTakenMultiplier > intact.bossDamageTakenMultiplier);
  assert.ok(cleared.rewardMultiplier >= intact.rewardMultiplier);
});

test('last law pressure and reward remain explicitly capped', () => {
  const mythic = mythicBossProfile(999999, 5, 999);
  const law = mythicLastLawProfile(mythic, 0, 1);
  assert.ok(law.specialCadenceMultiplier >= .66);
  assert.ok(law.projectileDensityMultiplier <= 1.32);
  assert.ok(law.summonCountMultiplier <= 1.2);
  assert.ok(law.dashDistanceMultiplier <= 1.22);
  assert.ok(law.bossDamageTakenMultiplier >= .84);
  assert.ok(law.rewardMultiplier <= 1.2);
});
