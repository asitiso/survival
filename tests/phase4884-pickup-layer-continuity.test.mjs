import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
const pickupsSource = fs.readFileSync(new URL('../src/game/pickups.ts', import.meta.url), 'utf8');
const helperSourceUrl = new URL('../src/game/pickup-layer-ordering.ts', import.meta.url);

async function loadPickupLayerOrdering() {
  if (!fs.existsSync(helperSourceUrl)) return null;
  return import('../dist/game/pickup-layer-ordering.js');
}

test('phase 4884 pickup ground bodies use stable finite-first world-y ordering without mutating pickup storage', async () => {
  const mod = await loadPickupLayerOrdering();
  assert.ok(mod, 'pickup layer ordering helper must exist');
  const pickups = [
    { id: 'low', pos: { y: 240 } },
    { id: 'high-a', pos: { y: 120 } },
    { id: 'high-b', pos: { y: 120 } },
    { id: 'nan', pos: { y: Number.NaN } },
  ];
  const before = [...pickups];
  const ordered = mod.pickupGroundBodyOrdered(pickups);
  assert.deepEqual(ordered.map((pickup) => pickup.id), ['high-a', 'high-b', 'low', 'nan']);
  assert.deepEqual(pickups, before);
});

test('phase 4884 interaction cues merge active pickup flow and collection feedback into one stable world-y order', async () => {
  const mod = await loadPickupLayerOrdering();
  assert.ok(mod, 'pickup layer ordering helper must exist');
  const pickups = [
    { id: 'pickup-a', pos: { y: 210 } },
    { id: 'pickup-b', pos: { y: 110 } },
  ];
  const collections = [
    { id: 'collect-a', pos: { y: 160 } },
    { id: 'collect-inf', pos: { y: Number.POSITIVE_INFINITY } },
  ];
  const ordered = mod.pickupInteractionLayerCues({ pickups, collections });
  assert.deepEqual(ordered.map((cue) => `${cue.kind}:${cue.value.id}`), [
    'pickup:pickup-b',
    'collection:collect-a',
    'pickup:pickup-a',
    'collection:collect-inf',
  ]);
});

test('phase 4884 game renders pickup bodies below enemy actors and terrain foreground while interaction feedback stays above foreground', () => {
  assert.match(
    gameSource,
    /this\.pickups\.renderGroundLayer\([\s\S]*this\.enemies\.renderEnemies\([\s\S]*this\.drawTerrainForegroundOcclusion\(ctx\);[\s\S]*this\.pickups\.renderInteractionLayer\(/,
  );
  assert.doesNotMatch(gameSource, /this\.pickups\.render\(ctx,/);
});

test('phase 4884 pickup manager keeps compatibility render while splitting body and interaction ownership without duplicates', () => {
  assert.match(pickupsSource, /renderGroundLayer\s*\(/);
  assert.match(pickupsSource, /renderInteractionLayer\s*\(/);
  assert.match(
    pickupsSource,
    /render\s*\([\s\S]*this\.renderGroundLayer\([\s\S]*this\.renderInteractionLayer\(/,
  );

  const groundStart = pickupsSource.indexOf('  renderGroundLayer(');
  const interactionStart = pickupsSource.indexOf('  renderInteractionLayer(', groundStart);
  const compatibilityStart = pickupsSource.indexOf('  render(', interactionStart);
  assert.ok(groundStart >= 0 && interactionStart > groundStart && compatibilityStart > interactionStart);
  const groundSource = pickupsSource.slice(groundStart, interactionStart);
  const interactionSource = pickupsSource.slice(interactionStart, compatibilityStart);

  assert.match(groundSource, /pickupGroundBodyOrdered\(this\.pickups\)/);
  assert.doesNotMatch(groundSource, /pickupFlowVfxSprite/);
  assert.match(interactionSource, /pickupInteractionLayerCues\s*\(\{/);
  assert.match(interactionSource, /pickups:\s*this\.pickups/);
  assert.match(interactionSource, /collections:\s*this\.collectionVfx/);
  assert.doesNotMatch(interactionSource, /battlefieldInteractionSprite/);
});
