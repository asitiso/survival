import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
const moduleUrl = new URL('../src/game/hero-kinematic-rendering.ts', import.meta.url);
const auditUrl = new URL('../src/game/hero-kinematic-render-audit.ts', import.meta.url);

test('phase 2895 hero kinematic render module exists', () => {
  assert.equal(fs.existsSync(moduleUrl), true);
});

test('phase 2896 hero movement tracks acceleration and deceleration presentation state', () => {
  assert.match(gameSource, /heroRenderKinematicState/);
  assert.match(gameSource, /advanceHeroKinematicRenderState/);
});

test('phase 2897 hero draw consumes acceleration lean and turn anticipation', () => {
  assert.match(gameSource, /accelerationLean/);
  assert.match(gameSource, /turnAnticipation/);
  assert.match(gameSource, /decelerationSettle/);
});

test('phase 2898 movement to cast transition suppresses excess lean during cast focus', () => {
  assert.match(gameSource, /castBlend/);
  assert.match(gameSource, /kinematicPresentation/);
  assert.match(gameSource, /castFocus/);
});

test('phase 2899 hero kinematic render remains reduced-motion aware', () => {
  assert.match(gameSource, /heroKinematicRenderPresentation/);
  assert.match(gameSource, /this\.presentationSettings\.reducedMotion/);
});

test('phase 2900 hero kinematic deterministic audit is present', async () => {
  assert.equal(fs.existsSync(auditUrl), true);
  if (!fs.existsSync(auditUrl)) return;
  const mod = await import('../dist/game/hero-kinematic-render-audit.js');
  const audit = mod.runHeroKinematicRenderAudit();
  assert.equal(audit.samples.length, 48);
  assert.equal(audit.actionCount, 9);
  assert.equal(audit.presentationOnly, true);
  assert.equal(audit.gameplayFormulaMutation, false);
  assert.equal(audit.snapshotSchemaMutation, false);
  assert.equal(audit.passed, true);
});
