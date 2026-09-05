import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const lobbySource=fs.readFileSync(new URL('../src/ui/lobby.ts',import.meta.url),'utf8');
const resultsSource=fs.readFileSync(new URL('../src/ui/results.ts',import.meta.url),'utf8');
const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('phase 1881 lobby mastery recent run and resume reuse hero portraits with text fallback',async()=>{
  const mod=await import('../dist/game/lobby-result-identity-assets.js');
  for(const heroId of ['arkan','seria','kain','edric']){
    const p=mod.lobbyHeroIdentity(heroId);
    assert.equal(p.atlasSrc,'./assets/ui/hero-portraits.png');
    assert.equal(p.motionAmplitude,0);
    assert.equal(p.textFallbackPreserved,true);
  }
  assert.match(lobbySource,/lobbyHeroIdentity/);
  assert.match(lobbySource,/lobby-mastery-portrait/);
  assert.match(lobbySource,/lobby-recent-portrait/);
  assert.match(lobbySource,/lobby-resume-portrait/);
});

test('phase 1882 meta upgrade cards reuse existing growth and shop icon atlases',async()=>{
  const mod=await import('../dist/game/lobby-result-identity-assets.js');
  const expected={vitality:'./assets/ui/growth-choice-icons.png',power:'./assets/ui/growth-choice-icons.png',bankroll:'./assets/ui/shop-items.png',magnet:'./assets/ui/growth-choice-icons.png'};
  for(const [id,atlas] of Object.entries(expected))assert.equal(mod.metaUpgradeIdentity(id).atlasSrc,atlas);
  assert.match(lobbySource,/metaUpgradeIdentity/);
  assert.match(lobbySource,/lobby-upgrade-icon/);
});

test('phase 1883 results use stable visual anchors while run code and build capsule stay textual',async()=>{
  const mod=await import('../dist/game/lobby-result-identity-assets.js');
  for(const id of ['kills','level','gold','bosses','shards','relic','mastery']){
    const icon=mod.resultStatIdentity(id);
    assert.equal(icon.visible,true);
    assert.equal(icon.motionAmplitude,0);
  }
  assert.match(resultsSource,/result-stat-icon/);
  assert.match(resultsSource,/resultHeroIdentity/);
  assert.match(resultsSource,/RUN CODE <b>/);
  assert.match(resultsSource,/BUILD CAPSULE <b>/);
  assert.match(gameSource,/heroId: this\.hero\.profileId/);
});
