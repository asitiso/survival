import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const pickupSource = fs.readFileSync(new URL('../src/game/pickups.ts', import.meta.url), 'utf8');
const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');

function indexOfOrFail(source, needle, label) {
  const index = source.indexOf(needle);
  assert.notEqual(index, -1, `missing ${label}`);
  return index;
}

function sliceMethod(source, startNeedle, endNeedle) {
  const start = indexOfOrFail(source, startNeedle, startNeedle);
  const end = indexOfOrFail(source, endNeedle, endNeedle);
  assert.ok(end > start, `${endNeedle} must follow ${startNeedle}`);
  return source.slice(start, end);
}

test('phase 4884 splits pickup physical bodies from interaction feedback', () => {
  assert.match(pickupSource, /renderGroundLayer\s*\(/);
  assert.match(pickupSource, /renderInteractionLayer\s*\(/);

  const ground = sliceMethod(pickupSource, '  renderGroundLayer(', '  renderInteractionLayer(');
  assert.match(ground, /battlefieldInteractionSprite\('pickup', pickup\.kind\)/);
  assert.doesNotMatch(ground, /pickupFlowVfxSprite/);
  assert.doesNotMatch(ground, /collectionVfx/);

  const interaction = sliceMethod(pickupSource, '  renderInteractionLayer(', '  render(');
  assert.match(interaction, /pickupFlowVfxSprite\(pickup\.kind,pickup\.flowState\)/);
  assert.match(interaction, /this\.collectionVfx/);
  assert.doesNotMatch(interaction, /battlefieldInteractionSprite/);
});

test('phase 4884 keeps pickup ground ordering stable without mutating lifecycle storage', () => {
  assert.match(pickupSource, /stableWorldYDepthOrdered/);
  assert.match(pickupSource, /stableWorldYDepthOrdered\(this\.pickups,\s*\(pickup\)\s*=>\s*pickup\.pos\.y\)/);
  assert.doesNotMatch(pickupSource, /this\.pickups\.sort\s*\(/);
  assert.doesNotMatch(pickupSource, /this\.collectionVfx\.sort\s*\(/);
});

test('phase 4884 game render pipeline places pickup bodies below actors and pickup feedback above terrain foreground', () => {
  const spellGround = indexOfOrFail(gameSource, 'this.spells.renderGroundLayer(ctx', 'persistent spell ground pass');
  const pickupGround = indexOfOrFail(gameSource, 'this.pickups.renderGroundLayer(ctx', 'pickup ground pass');
  const enemyActors = indexOfOrFail(gameSource, 'this.enemies.renderEnemies(ctx', 'enemy actor pass');
  const terrainForeground = indexOfOrFail(gameSource, 'this.drawTerrainForegroundOcclusion(ctx);', 'terrain foreground pass');
  const spellReadability = indexOfOrFail(gameSource, 'this.spells.renderPersistentReadabilityLayer(ctx', 'persistent spell readability pass');
  const pickupInteraction = indexOfOrFail(gameSource, 'this.pickups.renderInteractionLayer(ctx', 'pickup interaction pass');
  const tacticalOverlay = indexOfOrFail(gameSource, 'this.drawElitePackApproachFormationVfx(ctx);', 'higher-priority tactical overlay');

  assert.ok(spellGround < pickupGround);
  assert.ok(pickupGround < enemyActors);
  assert.ok(enemyActors < terrainForeground);
  assert.ok(terrainForeground < spellReadability);
  assert.ok(spellReadability < pickupInteraction);
  assert.ok(pickupInteraction < tacticalOverlay);
  assert.doesNotMatch(gameSource, /this\.pickups\.render\(ctx/);
});

test('phase 4884 preserves legacy PickupManager.render compatibility and pickup gameplay formulas', () => {
  const legacyRender = sliceMethod(pickupSource, '  render(', '  private queueCollectionVfx(');
  assert.match(legacyRender, /this\.renderGroundLayer\(/);
  assert.match(legacyRender, /this\.renderInteractionLayer\(/);

  assert.match(pickupSource, /Math\.max\(2000, basePickupRange\)/);
  assert.match(pickupSource, /pickup\.age > 4 \? Math\.max\(520, basePickupRange\) : basePickupRange/);
  assert.match(pickupSource, /const speed = 280 \+ Math\.max\(0, magnetRange - d\) \* 2\.2/);
  assert.match(pickupSource, /hero\.radius \+ pickup\.radius \+ 6/);
});
