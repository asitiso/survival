import test from 'node:test';
import assert from 'node:assert/strict';
import { objectiveAnchors, chooseObjectiveAnchor, advanceRiftSeal, advanceBeaconDefense, advanceCursedAltar } from '../dist/game/objective-rules.js';

test('every map and evolution stage exposes three safe objective anchors', () => {
  for (const map of ['ruinedGate','frozenFen','crystalQuarry']) {
    for (const stage of [0,1,2]) {
      const anchors = objectiveAnchors(map, stage);
      assert.equal(anchors.length, 3);
      for (const p of anchors) {
        assert.ok(p.x >= 260 && p.x <= 1340);
        assert.ok(p.y >= 180 && p.y <= 750);
        assert.ok(Math.hypot(p.x - 800, p.y - 450) >= 180);
      }
    }
  }
});

test('anchor chooser favors repositioning away from current hero location', () => {
  const anchors = objectiveAnchors('ruinedGate', 1);
  const hero = { x: anchors[0].x + 5, y: anchors[0].y + 5 };
  const chosen = chooseObjectiveAnchor('ruinedGate', 1, hero);
  const chosenDistance = Math.hypot(chosen.x - hero.x, chosen.y - hero.y);
  const closestDistance = Math.hypot(anchors[0].x - hero.x, anchors[0].y - hero.y);
  assert.ok(chosenDistance > closestDistance + 200);
});

test('rift seal progress rewards staying inside and decays only gently outside', () => {
  assert.deepEqual(advanceRiftSeal({ progress: 0 }, 1, true, 0), { progress: 18, complete: false });
  assert.equal(advanceRiftSeal({ progress: 95 }, 1, true, 2).complete, true);
  assert.equal(advanceRiftSeal({ progress: 50 }, 1, false, 0).progress, 46);
  assert.ok(advanceRiftSeal({ progress: 50 }, 1, true, 8).progress < 68);
});

test('beacon defense drains hp from nearby enemies and completes on surviving timer', () => {
  const next = advanceBeaconDefense({ hp: 100, timeLeft: 28 }, 1, 3);
  assert.equal(next.hp, 91);
  assert.equal(next.timeLeft, 27);
  assert.equal(next.complete, false);
  const done = advanceBeaconDefense({ hp: 40, timeLeft: 0.5 }, 1, 0);
  assert.equal(done.complete, true);
  const failed = advanceBeaconDefense({ hp: 5, timeLeft: 10 }, 1, 3);
  assert.equal(failed.failed, true);
});

test('cursed altar waits for activation then completes after a bounded survival timer', () => {
  assert.equal(advanceCursedAltar({ activated: false, timeLeft: 22 }, 5).timeLeft, 22);
  const active = advanceCursedAltar({ activated: true, timeLeft: 22 }, 1);
  assert.equal(active.timeLeft, 21);
  assert.equal(active.complete, false);
  assert.equal(advanceCursedAltar({ activated: true, timeLeft: 0.5 }, 1).complete, true);
});
