import test from 'node:test';
import assert from 'node:assert/strict';
import { openingWaveCeremony } from '../dist/game/opening-wave-ceremony.js';

test('opening ceremony creates short deterministic beats during first ten minutes',()=>{
  const first=openingWaveCeremony(30);
  assert.equal(first.beatId,'first-contact');
  assert.ok(first.spawnPulse>1);
  assert.ok(first.rewardPulse>=1);
  assert.equal(openingWaveCeremony(39).beatId,null);
  assert.equal(openingWaveCeremony(120).beatId,'pressure-rise');
  assert.equal(openingWaveCeremony(300).beatId,'elite-break');
  assert.equal(openingWaveCeremony(540).beatId,'boss-horizon');
});

test('opening ceremony is fully neutral from ten minutes onward',()=>{
  const late=openingWaveCeremony(601);
  assert.equal(late.beatId,null);
  assert.equal(late.spawnPulse,1);
  assert.equal(late.rewardPulse,1);
});
