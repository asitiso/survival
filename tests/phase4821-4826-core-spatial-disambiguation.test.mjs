import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const linkage = await import('../dist/game/attack-outcome-linkage.js').catch(() => null);
const presentation = await import('../dist/game/enemy-presentation.js').catch(() => null);

function linkageApi() {
  assert.ok(linkage, 'attack-outcome-linkage module must exist');
  return linkage;
}

function presentationApi() {
  assert.ok(presentation, 'enemy-presentation module must exist');
  return presentation;
}

function intent(enemyId, target, source, x, y, enemyType = 'bomber') {
  return {
    key: `${enemyId}:${enemyType}:${target}:${source}`,
    enemyId,
    enemyType,
    target,
    source,
    origin: { x, y },
  };
}

test('phase 4821 boss and bomber attack intents snapshot their rendered world origin', () => {
  const { enemyThreatTelegraph } = presentationApi();
  const boss = enemyThreatTelegraph({ id: 41, type: 'boss', radius: 30, target: 'core', pos: { x: 510, y: 220 } });
  const bomber = enemyThreatTelegraph({ id: 42, type: 'bomber', radius: 18, target: 'core', specialTimer: 0.6, pos: { x: 430, y: 260 } });
  assert.deepEqual(boss?.attackIntent?.origin, { x: 510, y: 220 });
  assert.deepEqual(bomber?.attackIntent?.origin, { x: 430, y: 260 });
});

test('phase 4822 multiple same-source core warnings resolve only the clearly nearest attack origin', () => {
  const { replaceRenderedAttackIntents, consumeRenderedAttackOutcomeNear } = linkageApi();
  replaceRenderedAttackIntents([
    intent(51, 'core', 'explosion', 100, 100),
    intent(52, 'core', 'explosion', 260, 100),
  ]);
  const matched = consumeRenderedAttackOutcomeNear('core', 'explosion', { x: 112, y: 104 });
  assert.equal(matched?.enemyId, 51);
});

test('phase 4823 spatial attribution refuses to guess when the two closest candidates are inside the ambiguity margin', () => {
  const { replaceRenderedAttackIntents, consumeRenderedAttackOutcomeNear } = linkageApi();
  replaceRenderedAttackIntents([
    intent(61, 'core', 'explosion', 100, 100),
    intent(62, 'core', 'explosion', 120, 100),
  ]);
  const matched = consumeRenderedAttackOutcomeNear('core', 'explosion', { x: 110, y: 100 });
  assert.equal(matched, null);
});

test('phase 4824 stale, wrong-target, and wrong-source warnings cannot win spatial attribution', () => {
  const { replaceRenderedAttackIntents, consumeRenderedAttackOutcomeNear } = linkageApi();
  replaceRenderedAttackIntents([
    intent(71, 'hero', 'explosion', 100, 100),
    intent(72, 'core', 'contact', 100, 100, 'boss'),
    intent(73, 'core', 'explosion', 300, 300),
  ]);
  replaceRenderedAttackIntents([
    intent(74, 'core', 'explosion', 106, 100),
    intent(71, 'hero', 'explosion', 100, 100),
    intent(72, 'core', 'contact', 100, 100, 'boss'),
  ]);
  const matched = consumeRenderedAttackOutcomeNear('core', 'explosion', { x: 104, y: 100 });
  assert.equal(matched?.enemyId, 74);
});

test('phase 4825 a spatially resolved intent is consumed once and cannot leak into the next damage result', () => {
  const { replaceRenderedAttackIntents, consumeRenderedAttackOutcomeNear } = linkageApi();
  replaceRenderedAttackIntents([
    intent(81, 'core', 'explosion', 100, 100),
    intent(82, 'core', 'explosion', 300, 100),
  ]);
  const first = consumeRenderedAttackOutcomeNear('core', 'explosion', { x: 102, y: 100 });
  const second = consumeRenderedAttackOutcomeNear('core', 'explosion', { x: 102, y: 100 });
  assert.equal(first?.enemyId, 81);
  assert.equal(second?.enemyId, 82, 'the consumed nearest intent must be gone; only the remaining rendered warning may resolve');
});

test('phase 4826 core damage passes its real origin into attribution while preserving the existing resolution handoff path', () => {
  const coreAttributionSource = readFileSync(new URL('../src/game/core-attack-outcome-attribution.ts', import.meta.url), 'utf8');
  const gameSource = readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
  const enemyPresentationSource = readFileSync(new URL('../src/game/enemy-presentation.ts', import.meta.url), 'utf8');
  assert.match(coreAttributionSource, /consumeRenderedAttackOutcomeNear/);
  assert.match(gameSource, /consumeCoreAttackAttribution\(source,origin\)/);
  assert.match(gameSource, /recordAttackResolutionHandoff/);
  assert.match(enemyPresentationSource, /origin:\{x:enemy\.pos\.x,y:enemy\.pos\.y\}/);
});
