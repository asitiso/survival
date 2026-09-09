import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sourceUrl = new URL('../src/game/actor-grounding-depth-separation.ts', import.meta.url);
const enemiesSource = fs.readFileSync(new URL('../src/game/enemies.ts', import.meta.url), 'utf8');

async function loadModule() {
  assert.equal(fs.existsSync(sourceUrl), true, 'actor grounding depth separation module must exist');
  if (!fs.existsSync(sourceUrl)) return null;
  return import('../dist/game/actor-grounding-depth-separation.js');
}

const input = (actorClass, overrides = {}) => ({
  actorClass,
  battlefieldStress: 0.2,
  reducedMotion: false,
  reducedFlash: false,
  ...overrides,
});

test('phase 4851 actor grounding depth presentation module exists and stays presentation-only', async () => {
  const mod = await loadModule();
  if (!mod) return;
  const p = mod.actorGroundingDepthPresentation(input('regular'));
  assert.equal(p.presentationOnly, true);
  assert.equal(typeof p.shadowAlphaScale, 'number');
  assert.equal(typeof p.shadowWidthScale, 'number');
  assert.equal(typeof p.shadowHeightScale, 'number');
  assert.equal(typeof p.contactPulseScale, 'number');
});

test('phase 4852 boss elite and heavy actors read more grounded while agile shadows stay restrained', async () => {
  const mod = await loadModule();
  if (!mod) return;
  const regular = mod.actorGroundingDepthPresentation(input('regular'));
  const agile = mod.actorGroundingDepthPresentation(input('agile'));
  const heavy = mod.actorGroundingDepthPresentation(input('heavy'));
  const elite = mod.actorGroundingDepthPresentation(input('elite'));
  const boss = mod.actorGroundingDepthPresentation(input('boss'));
  assert.ok(boss.shadowAlphaScale > elite.shadowAlphaScale);
  assert.ok(elite.shadowAlphaScale > regular.shadowAlphaScale);
  assert.ok(heavy.shadowAlphaScale > regular.shadowAlphaScale);
  assert.ok(agile.shadowWidthScale <= regular.shadowWidthScale);
  assert.ok(boss.shadowWidthScale > regular.shadowWidthScale);
});

test('phase 4853 dense battlefield pressure suppresses decorative contact pulse before essential grounding shadow', async () => {
  const mod = await loadModule();
  if (!mod) return;
  const open = mod.actorGroundingDepthPresentation(input('regular', { battlefieldStress: 0 }));
  const dense = mod.actorGroundingDepthPresentation(input('regular', { battlefieldStress: 1 }));
  assert.ok(dense.contactPulseScale < open.contactPulseScale * 0.5);
  assert.ok(dense.shadowAlphaScale >= open.shadowAlphaScale * 0.8);
  assert.ok(dense.shadowWidthScale >= open.shadowWidthScale * 0.9);
});

test('phase 4854 reduced motion and reduced flash calm contact activity without erasing static grounding', async () => {
  const mod = await loadModule();
  if (!mod) return;
  const normal = mod.actorGroundingDepthPresentation(input('elite'));
  const reduced = mod.actorGroundingDepthPresentation(input('elite', { reducedMotion: true, reducedFlash: true }));
  assert.ok(reduced.contactPulseScale < normal.contactPulseScale * 0.5);
  assert.equal(reduced.shadowAlphaScale, normal.shadowAlphaScale);
  assert.equal(reduced.shadowWidthScale, normal.shadowWidthScale);
  assert.equal(reduced.shadowHeightScale, normal.shadowHeightScale);
});

test('phase 4855 grounding output remains bounded and never introduces gameplay displacement', async () => {
  const mod = await loadModule();
  if (!mod) return;
  for (const actorClass of ['agile', 'regular', 'heavy', 'elite', 'boss']) {
    for (const battlefieldStress of [0, 0.5, 1, Number.NaN]) {
      const p = mod.actorGroundingDepthPresentation(input(actorClass, { battlefieldStress }));
      assert.ok(p.shadowAlphaScale >= 0.7 && p.shadowAlphaScale <= 1.35);
      assert.ok(p.shadowWidthScale >= 0.8 && p.shadowWidthScale <= 1.3);
      assert.ok(p.shadowHeightScale >= 0.75 && p.shadowHeightScale <= 1.2);
      assert.ok(p.contactPulseScale >= 0 && p.contactPulseScale <= 1);
      assert.equal('offsetX' in p, false);
      assert.equal('offsetY' in p, false);
    }
  }
});

test('phase 4856 enemy renderer consumes grounding depth presentation without extending Game render APIs', () => {
  assert.match(enemiesSource, /actorGroundingDepthPresentation/);
  assert.match(enemiesSource, /actorGrounding\.shadowAlphaScale/);
  assert.match(enemiesSource, /actorGrounding\.shadowWidthScale/);
  assert.match(enemiesSource, /actorGrounding\.shadowHeightScale/);
  assert.match(enemiesSource, /actorGrounding\.contactPulseScale/);
  assert.doesNotMatch(enemiesSource, /actorGrounding[^\n]*enemy\.pos\s*=/);
});
