import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { mythicBossProfile } from '../dist/game/endless/mythic-boss.js';
import { mythicLastLawIdentityProfile } from '../dist/game/endless/mythic-last-law-identity.js';
import { lastLawSafeZoneLifecycle } from '../dist/game/endless/last-law-safe-zone-lifecycle.js';

const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const mythic=mythicBossProfile(7200,5,3);
const archetypes=['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'];

test('phase 2010-2014 Game loads Last Law atlas asynchronously and adds toast plus safe-lane identity without replacing text',()=>{
  assert.match(source,/MYTHIC_LAST_LAW_IDENTITY_ATLAS/);
  assert.match(source,/mythicLastLawIdentityIcon/);
  assert.match(source,/mythicLastLawIdentityAtlasImage/);
  assert.match(source,/mythicLastLawIdentityAtlasReady/);
  assert.match(source,/initializeMythicLastLawIdentityAtlas\(\)/);
  assert.match(source,/image\.decoding\s*=\s*'async'/);
  assert.match(source,/image\.src\s*=\s*MYTHIC_LAST_LAW_IDENTITY_ATLAS\.src/);
  assert.match(source,/showEventToast\(`\$\{lastLaw\.label\} · 약점 파괴로 최종 압박 완화`,\s*lastLaw\.lawId\)/);
  assert.match(source,/drawMythicLastLawToastIcon\(ctx/);
  assert.match(source,/drawMythicLastLawSafeLaneIcon\(ctx/);
  assert.match(source,/ctx\.fillText\(this\.eventToast, 800, 841\)/);
  assert.match(source,/ctx\.fillText\(`\$\{safeLane\.label\}\$\{forecastText\}\$\{timelineText\}`/);
});

test('phase 2010-2014 Last Law activation threshold, counterplay and safe-zone lifecycle stay unchanged',()=>{
  for(const archetype of archetypes){
    assert.equal(mythicLastLawIdentityProfile(mythic,archetype,.151,1).active,false);
    const active=mythicLastLawIdentityProfile(mythic,archetype,.15,1);
    const cleared=mythicLastLawIdentityProfile(mythic,archetype,.1,0);
    assert.equal(active.active,true); assert.notEqual(active.lawId,'none');
    assert.ok(cleared.bossDamageTakenMultiplier>=active.bossDamageTakenMultiplier);
    assert.ok(cleared.specialCadenceMultiplier>=active.specialCadenceMultiplier);
  }
  assert.deepEqual(lastLawSafeZoneLifecycle(false,.4),{active:false,cycleMs:9000,stableEndMs:4800,collapseEndMs:6200,collapsedEndMs:7800,reformEndMs:9000,radiusMultiplier:1});
});
