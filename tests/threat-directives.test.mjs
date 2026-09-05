import test from 'node:test';
import assert from 'node:assert/strict';
import { threatDirectiveAt, threatDirectiveModifiers } from '../dist/game/threat-directives.js';
import { selectRegularEnemyType } from '../dist/game/enemies.js';

test('threat directives begin at eight minutes and rotate every two minutes', () => {
  assert.equal(threatDirectiveAt(479), null);
  assert.equal(threatDirectiveAt(480).id, 'swarmFront');
  assert.equal(threatDirectiveAt(599).id, 'swarmFront');
  assert.equal(threatDirectiveAt(600).id, 'ironMarch');
  assert.equal(threatDirectiveAt(720).id, 'artilleryLine');
  assert.equal(threatDirectiveAt(840).id, 'hexConvoy');
  assert.equal(threatDirectiveAt(960).id, 'swarmFront');
});

test('four directives expose materially different spawn pressure and composition weights', () => {
  const swarm = threatDirectiveModifiers(threatDirectiveAt(480));
  const iron = threatDirectiveModifiers(threatDirectiveAt(600));
  const artillery = threatDirectiveModifiers(threatDirectiveAt(720));
  const hex = threatDirectiveModifiers(threatDirectiveAt(840));

  assert.ok(swarm.spawnPressureMultiplier > 1.15);
  assert.ok(swarm.regularWeights.hound > swarm.regularWeights.brute);
  assert.ok(iron.regularWeights.brute > iron.regularWeights.hound * 3);
  assert.ok(iron.eliteIntervalMultiplier < 0.8);
  assert.ok(artillery.regularWeights.archer > 2);
  assert.ok(artillery.regularWeights.bomber >= 2);
  assert.ok(hex.regularWeights.shaman >= 3);
  assert.ok(hex.regularWeights.brute > 1);
});

test('weighted regular selection produces different tactical enemy identities from the same roll', () => {
  const swarm = threatDirectiveModifiers(threatDirectiveAt(480));
  const iron = threatDirectiveModifiers(threatDirectiveAt(600));
  const artillery = threatDirectiveModifiers(threatDirectiveAt(720));
  const hex = threatDirectiveModifiers(threatDirectiveAt(840));
  const rolls = [0.18, 0.42, 0.68, 0.88];
  const swarmTypes = rolls.map((r) => selectRegularEnemyType(500, r, swarm.regularWeights));
  const ironTypes = rolls.map((r) => selectRegularEnemyType(620, r, iron.regularWeights));
  const artilleryTypes = rolls.map((r) => selectRegularEnemyType(740, r, artillery.regularWeights));
  const hexTypes = rolls.map((r) => selectRegularEnemyType(860, r, hex.regularWeights));
  assert.notDeepEqual(swarmTypes, ironTypes);
  assert.notDeepEqual(ironTypes, artilleryTypes);
  assert.ok(artilleryTypes.includes('archer') || artilleryTypes.includes('bomber'));
  assert.ok(hexTypes.includes('shaman'));
});

test('early game selection stays on the original readable unlock curve without directive weights', () => {
  assert.equal(selectRegularEnemyType(20, 0.1), 'grunt');
  assert.equal(selectRegularEnemyType(60, 0.1), 'hound');
  assert.equal(selectRegularEnemyType(100, 0.25), 'bomber');
  assert.equal(selectRegularEnemyType(130, 0.40), 'brute');
});
