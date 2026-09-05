import test from 'node:test';
import assert from 'node:assert/strict';

import { mythicBossProfile } from '../dist/game/endless/mythic-boss.js';
import { mythicPhaseProfile } from '../dist/game/endless/mythic-phases.js';

function activeMythic() {
  const profile = mythicBossProfile(3700, 5, 3);
  assert.equal(profile.active, true);
  return profile;
}

test('phase 48 mythic health thresholds create exactly three readable phases', () => {
  const mythic = activeMythic();
  assert.equal(mythicPhaseProfile(mythic, .9, 1).phase, 1);
  assert.equal(mythicPhaseProfile(mythic, .7, 1).phase, 1);
  assert.equal(mythicPhaseProfile(mythic, .699, 1).phase, 2);
  assert.equal(mythicPhaseProfile(mythic, .35, 1).phase, 2);
  assert.equal(mythicPhaseProfile(mythic, .349, 1).phase, 3);
});

test('phase 49 mythic channels rotate priority by phase without adding a fourth channel', () => {
  const mythic = activeMythic();
  const p1 = mythicPhaseProfile(mythic, .9, 1);
  const p2 = mythicPhaseProfile(mythic, .5, 1);
  const p3 = mythicPhaseProfile(mythic, .2, 1);
  assert.equal(p1.channels.length, 3);
  assert.equal(new Set(p1.channels).size, 3);
  assert.deepEqual(p2.channels, [p1.channels[1],p1.channels[2],p1.channels[0]]);
  assert.deepEqual(p3.channels, [p1.channels[2],p1.channels[0],p1.channels[1]]);
});

test('phase 50 later mythic phases escalate cadence and summon pressure inside hard caps', () => {
  const mythic = activeMythic();
  const p1 = mythicPhaseProfile(mythic, .9, 1);
  const p3 = mythicPhaseProfile(mythic, .2, 1);
  assert.ok(p3.specialCadenceMultiplier < p1.specialCadenceMultiplier);
  assert.ok(p3.summonCountMultiplier > p1.summonCountMultiplier);
  assert.ok(p3.specialCadenceMultiplier >= .78);
  assert.ok(p3.summonCountMultiplier <= 1.18);
  assert.ok(p3.dashDistanceMultiplier <= 1.16);
});

test('phase 51 destroying weakpoints creates a real relief window without trivializing mythic', () => {
  const mythic = activeMythic();
  const intact = mythicPhaseProfile(mythic, .2, 1);
  const broken = mythicPhaseProfile(mythic, .2, 0);
  assert.ok(broken.bossDamageTakenMultiplier > intact.bossDamageTakenMultiplier);
  assert.ok(broken.specialCadenceMultiplier > intact.specialCadenceMultiplier);
  assert.ok(broken.summonCountMultiplier < intact.summonCountMultiplier);
  assert.ok(broken.bossDamageTakenMultiplier <= 1.15);
  assert.ok(broken.specialCadenceMultiplier <= 1.2);
  assert.ok(broken.summonCountMultiplier >= .82);
});

test('phase 52 non-mythic profile remains neutral', () => {
  const normal = mythicBossProfile(1000, 2, 3);
  const phase = mythicPhaseProfile(normal, .2, 0);
  assert.equal(phase.phase, 0);
  assert.deepEqual(phase.channels, []);
  assert.equal(phase.bossDamageTakenMultiplier, 1);
  assert.equal(phase.specialCadenceMultiplier, 1);
  assert.equal(phase.summonCountMultiplier, 1);
});
