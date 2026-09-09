import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const sourceUrl = new URL('../src/game/critical-threat-occlusion-arbitration.ts', import.meta.url);
const gameSource = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');

async function loadModule() {
  assert.equal(fs.existsSync(sourceUrl), true, 'critical threat occlusion arbitration module must exist');
  return import('../dist/game/critical-threat-occlusion-arbitration.js');
}

const input = (threatClass, overrides = {}) => ({
  threatClass,
  overlap: 1,
  ...overrides,
});

test('phase 4863 critical threat occlusion arbitration exists and stays presentation-only', async () => {
  const mod = await loadModule();
  const p = mod.criticalThreatOcclusionArbitrationPresentation(input('none'));
  assert.equal(p.presentationOnly, true);
  assert.equal(typeof p.capAlphaScale, 'number');
  assert.equal(typeof p.edgeAlphaScale, 'number');
  assert.equal('offsetX' in p, false);
  assert.equal('offsetY' in p, false);
});

test('phase 4864 boss elite and specialist threats progressively reclaim silhouette visibility', async () => {
  const mod = await loadModule();
  const none = mod.criticalThreatOcclusionArbitrationPresentation(input('none'));
  const specialist = mod.criticalThreatOcclusionArbitrationPresentation(input('specialist'));
  const elite = mod.criticalThreatOcclusionArbitrationPresentation(input('elite'));
  const boss = mod.criticalThreatOcclusionArbitrationPresentation(input('boss'));
  assert.equal(none.capAlphaScale, 1);
  assert.ok(specialist.capAlphaScale < none.capAlphaScale);
  assert.ok(elite.capAlphaScale < specialist.capAlphaScale);
  assert.ok(boss.capAlphaScale < elite.capAlphaScale);
});

test('phase 4865 arbitration scales smoothly with actual cap overlap and does nothing when separated', async () => {
  const mod = await loadModule();
  const clear = mod.criticalThreatOcclusionArbitrationPresentation(input('boss', { overlap: 0 }));
  const partial = mod.criticalThreatOcclusionArbitrationPresentation(input('boss', { overlap: 0.5 }));
  const full = mod.criticalThreatOcclusionArbitrationPresentation(input('boss', { overlap: 1 }));
  assert.equal(clear.capAlphaScale, 1);
  assert.equal(clear.edgeAlphaScale, 1);
  assert.ok(partial.capAlphaScale < clear.capAlphaScale && partial.capAlphaScale > full.capAlphaScale);
  assert.ok(partial.edgeAlphaScale < clear.edgeAlphaScale && partial.edgeAlphaScale > full.edgeAlphaScale);
});

test('phase 4866 critical arbitration preserves wall edge depth more strongly than opaque cap coverage', async () => {
  const mod = await loadModule();
  for (const threatClass of ['specialist', 'elite', 'boss']) {
    const p = mod.criticalThreatOcclusionArbitrationPresentation(input(threatClass));
    assert.ok(p.edgeAlphaScale > p.capAlphaScale);
    assert.ok(p.edgeAlphaScale >= 0.85);
    assert.ok(p.capAlphaScale >= 0.5);
  }
});

test('phase 4867 overlap input is finite bounded and never creates gameplay displacement', async () => {
  const mod = await loadModule();
  for (const overlap of [Number.NaN, -4, 0, 0.4, 1, 8]) {
    const p = mod.criticalThreatOcclusionArbitrationPresentation(input('boss', { overlap }));
    assert.ok(Number.isFinite(p.capAlphaScale));
    assert.ok(Number.isFinite(p.edgeAlphaScale));
    assert.ok(p.capAlphaScale >= 0.5 && p.capAlphaScale <= 1);
    assert.ok(p.edgeAlphaScale >= 0.85 && p.edgeAlphaScale <= 1);
    assert.equal('position' in p, false);
  }
});

test('phase 4868 foreground wall pass arbitrates only critical enemy overlap without changing gameplay positions', () => {
  assert.match(gameSource, /criticalThreatOcclusionArbitrationPresentation/);
  assert.match(gameSource, /enemy\.type\s*===\s*'boss'/);
  assert.match(gameSource, /enemy\.type\s*===\s*'elite'/);
  assert.match(gameSource, /shieldbearer|assassin|siegeGolem|nullifier/);
  assert.match(gameSource, /capAlphaScale/);
  assert.match(gameSource, /edgeAlphaScale/);
  assert.doesNotMatch(gameSource, /criticalThreatOcclusion[^\n]*enemy\.pos\s*=/);
  assert.doesNotMatch(gameSource, /criticalThreatOcclusion[^\n]*wall\.(?:x|y|w|h)\s*=/);
});
