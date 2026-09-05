import test from 'node:test';
import assert from 'node:assert/strict';
import { directorSnapshot } from '../dist/domain/director.js';
import { xpNeededForLevel } from '../dist/domain/progression.js';
import { SHOP_FIRST_TOKEN_AT, SHOP_TOKEN_INTERVAL } from '../dist/domain/economy.js';
import { ACTION_BUTTONS, ACTION_TOUCH_SCALE, LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../dist/game/config.js';
import { generateShopOffers } from '../dist/game/shop-data.js';

test('early combat fills the arena quickly without exceeding the mobile cap', () => {
  const opening = directorSnapshot(0);
  const twoMinutes = directorSnapshot(120);
  assert.ok(opening.spawnInterval <= 0.70);
  assert.ok(opening.enemyBudget >= 60);
  assert.ok(twoMinutes.spawnBurst >= 2);
  assert.ok(twoMinutes.enemyBudget <= 320);
});

test('level curve keeps midgame upgrades frequent enough for a spell-spam run', () => {
  assert.ok(xpNeededForLevel(10) <= 200);
  assert.ok(xpNeededForLevel(30) <= 750);
  assert.ok(xpNeededForLevel(60) <= 1700);
});

test('first shop arrives in the first minute and returns often', () => {
  assert.ok(SHOP_FIRST_TOKEN_AT <= 45);
  assert.ok(SHOP_TOKEN_INTERVAL <= 90);
});

test('first shop prices allow a meaningful purchase instead of a dead visit', () => {
  const offers = generateShopOffers(() => 0.5);
  const equipment = offers.filter((offer) => offer.kind !== 'potion');
  const potions = offers.filter((offer) => offer.kind === 'potion');
  assert.ok(Math.min(...equipment.map((offer) => offer.price)) <= 240);
  assert.ok(Math.max(...potions.map((offer) => offer.price)) <= 80);
});

test('mobile action buttons stay fully on-screen and have forgiving touch targets', () => {
  assert.ok(ACTION_TOUCH_SCALE >= 1.25);
  for (const button of ACTION_BUTTONS) {
    assert.ok(button.x - button.radius >= 0, `${button.id} clips left`);
    assert.ok(button.x + button.radius <= LOGICAL_WIDTH, `${button.id} clips right`);
    assert.ok(button.y - button.radius >= 0, `${button.id} clips top`);
    assert.ok(button.y + button.radius <= LOGICAL_HEIGHT, `${button.id} clips bottom`);
  }
});


test('landscape controls expose one global auto-cast assist instead of four separate toggles', () => {
  const autos = ACTION_BUTTONS.filter((button) => button.id === 'auto');
  assert.equal(autos.length, 1);
  assert.ok(autos[0].radius >= 40);
});
