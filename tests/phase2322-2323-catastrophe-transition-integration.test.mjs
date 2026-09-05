import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('phase 2322 Game loads transition atlas and places sixty-second forecast beside existing catastrophe status without a new HUD row',()=>{
  assert.match(source,/CATASTROPHE_TRANSITION_IDENTITY_ATLAS/);assert.match(source,/catastropheTransitionIdentityIcon/);assert.match(source,/initializeCatastropheTransitionIdentityAtlas\(\)/);
  assert.match(source,/catastropheTransitionIdentityAtlasImage/);assert.match(source,/catastropheTransitionIdentityAtlasReady/);assert.match(source,/image\.src\s*=\s*CATASTROPHE_TRANSITION_IDENTITY_ATLAS\.src/);
  assert.match(source,/drawCatastropheTransitionForecast\(ctx,this\.elapsed/);assert.match(source,/projection\.visible/);assert.match(source,/safeArea\.aspectClass!==['"]foldable['"]/);
  assert.match(source,/drawCatastropheStatusIcon\(ctx/,'existing catastrophe icon must remain');
});

test('phase 2322 forecast helper is suppressed under critical combat attention and uses only transition plus outcome identities',()=>{
  assert.match(source,/hideCatastropheTransitionIdentity\(\)/);assert.match(source,/heroCritical\|\|coreCritical\|\|bossSpecialTimer<=1\.2/);
  assert.match(source,/catastropheTransitionIdentityIcon\(['"]transition['"]\)/);assert.match(source,/catastropheTransitionIdentityIcon\(projection\.status\)/);
});

test('phase 2323 catastrophe banner preserves frozen name and description text while adding authoritative transition helper',()=>{
  assert.match(source,/ctx\.fillText\(this\.catastrophe\.name, 800, 387\)/);assert.match(source,/ctx\.fillText\(this\.catastrophe\.description, 800, 420\)/);
  assert.match(source,/catastropheTransitionHint\(projection,2\)/);assert.match(source,/catastropheBannerTransitionProjection/);
  assert.match(source,/projectCatastropheTransition\(previous,next\)/);
});

test('phase 2323 transition presentation state resets on new run and never mutates catastrophe gameplay state',()=>{
  assert.match(source,/this\.catastropheBannerTransitionProjection\s*=\s*null/);
  const domain=fs.readFileSync(new URL('../src/domain/catastrophe.ts',import.meta.url),'utf8');
  assert.match(domain,/if \(seconds < 1200\) return null/);assert.match(domain,/\/ 180\) % ROTATION\.length/);assert.match(domain,/goldMultiplier: 2/);assert.match(domain,/enemySpeedMultiplier: 1\.22/);assert.match(domain,/cooldownMultiplier: 0\.82/);
});
