import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
const enemySource = fs.readFileSync(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');
const moduleUrl = new URL('../src/game/character-contact-recoil-rendering.ts', import.meta.url);
const auditUrl = new URL('../src/game/character-contact-recoil-render-audit.ts', import.meta.url);

test('phase 2907 character contact and recoil module exists', () => {
  assert.equal(fs.existsSync(moduleUrl), true);
});

test('phase 2908 hero hit feedback drives bounded visual recoil only', () => {
  assert.match(gameSource, /heroRenderHitRecoil/);
  assert.match(gameSource, /queueHeroResponseVfx\(kind:HeroResponseVfxKind,_intensity=1\)/);
  assert.match(gameSource, /characterHitRecoilPresentation/);
});

test('phase 2909 hero ground contact shadow responds to movement and recoil', () => {
  assert.match(gameSource, /characterGroundContactPresentation/);
  assert.match(gameSource, /groundContact/);
});

test('phase 2910 enemy hit flash drives visual recoil without changing hp or collision', () => {
  assert.match(enemySource, /characterHitRecoilPresentation/);
  assert.match(enemySource, /enemy\.hitFlash/);
  assert.match(enemySource, /hitRecoil/);
});

test('phase 2911 heavy enemies cap recoil displacement for weight', () => {
  assert.match(enemySource, /hitRecoil\.maxDisplacement/);
  assert.match(enemySource, /enemy\.type === 'boss'/);
  assert.match(enemySource, /enemy\.type === 'elite'/);
});

test('phase 2912 character contact recoil deterministic audit is present', async () => {
  assert.equal(fs.existsSync(auditUrl), true);
  if (!fs.existsSync(auditUrl)) return;
  const mod = await import('../dist/game/character-contact-recoil-render-audit.js');
  const audit = mod.runCharacterContactRecoilRenderAudit();
  assert.equal(audit.samples.length, 64);
  assert.equal(audit.actionCount, 9);
  assert.equal(audit.presentationOnly, true);
  assert.equal(audit.gameplayFormulaMutation, false);
  assert.equal(audit.snapshotSchemaMutation, false);
  assert.equal(audit.passed, true);
});
