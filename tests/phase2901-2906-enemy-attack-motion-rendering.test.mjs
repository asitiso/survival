import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const enemySource = fs.readFileSync(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');
const moduleUrl = new URL('../src/game/enemy-attack-motion-rendering.ts', import.meta.url);
const auditUrl = new URL('../src/game/enemy-attack-motion-render-audit.ts', import.meta.url);

test('phase 2901 enemy attack motion module exists', () => {
  assert.equal(fs.existsSync(moduleUrl), true);
});

test('phase 2902 enemy render derives attack anticipation from canonical attack timer', () => {
  assert.match(enemySource, /enemyAttackMotionPresentation/);
  assert.match(enemySource, /enemy\.attackTimer/);
  assert.match(enemySource, /enemy\.attackInterval/);
});

test('phase 2903 melee attack motion applies bounded pullback then lunge', () => {
  assert.match(enemySource, /attackMotion\.pullback/);
  assert.match(enemySource, /attackMotion\.lunge/);
});

test('phase 2904 ranged enemies rotate visual body toward target without changing AI', () => {
  assert.match(enemySource, /attackMotion\.facingAngle/);
  assert.match(enemySource, /attackMotion\.rangedAim/);
});

test('phase 2905 enemy attack motion keeps boss and elite displacement bounded', () => {
  assert.match(enemySource, /attackMotion\.weight/);
  assert.match(enemySource, /attackMotion\.maxDisplacement/);
});

test('phase 2906 enemy attack motion deterministic audit is present', async () => {
  assert.equal(fs.existsSync(auditUrl), true);
  if (!fs.existsSync(auditUrl)) return;
  const mod = await import('../dist/game/enemy-attack-motion-render-audit.js');
  const audit = mod.runEnemyAttackMotionRenderAudit();
  assert.equal(audit.samples.length, 64);
  assert.equal(audit.actionCount, 9);
  assert.equal(audit.presentationOnly, true);
  assert.equal(audit.gameplayFormulaMutation, false);
  assert.equal(audit.snapshotSchemaMutation, false);
  assert.equal(audit.passed, true);
});
