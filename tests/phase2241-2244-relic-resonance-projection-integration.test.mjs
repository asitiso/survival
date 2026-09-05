import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const projectionUrl=new URL('../dist/game/relic-resonance-projection.js',import.meta.url);
const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const resonance=fs.readFileSync(new URL('../src/game/endless/relic-resonance.ts',import.meta.url),'utf8');
const snapshot=fs.readFileSync(new URL('../src/game/endless/snapshot.ts',import.meta.url),'utf8');

test('phase 2241 projects real current-to-candidate resonance tier impact without mutating gameplay',async()=>{
  assert.equal(fs.existsSync(projectionUrl),true,'relic resonance projection module must exist');
  const m=await import(projectionUrl.href);
  const base={heroId:'arkan',fusionCount:1,fateChoiceCount:1,ascensionSelections:0};
  const up=m.projectRelicResonance('abyss-eye','ember-crown',base);
  assert.equal(up.before.score,2.5);assert.equal(up.before.tier,0);assert.equal(up.after.score,3.5);assert.equal(up.after.tier,1);assert.equal(up.impactId,'tier-up');assert.equal(up.tierId,'tier1');
  const down=m.projectRelicResonance('ember-crown','abyss-eye',base);
  assert.equal(down.before.tier,1);assert.equal(down.after.tier,0);assert.equal(down.impactId,'tier-down');assert.equal(down.tierId,'dormant');
  const steady=m.projectRelicResonance('abyss-eye','chrono-shard',base);
  assert.equal(steady.before.tier,0);assert.equal(steady.after.tier,0);assert.equal(steady.impactId,'steady');assert.equal(steady.scoreDelta,0);
});

test('phase 2241 next-tier progress derives from the existing 3 6 9 thresholds',async()=>{
  const m=await import(projectionUrl.href);
  assert.deepEqual(m.relicResonanceNextTierProgress({score:2.5,tier:0}),{tier:0,from:0,target:3,score:2.5,ratio:2.5/3,complete:false});
  assert.deepEqual(m.relicResonanceNextTierProgress({score:4.5,tier:1}),{tier:1,from:3,target:6,score:4.5,ratio:.5,complete:false});
  assert.deepEqual(m.relicResonanceNextTierProgress({score:7.5,tier:2}),{tier:2,from:6,target:9,score:7.5,ratio:.5,complete:false});
  assert.deepEqual(m.relicResonanceNextTierProgress({score:12,tier:3}),{tier:3,from:9,target:9,score:12,ratio:1,complete:true});
});

test('phase 2242 boss reward relic cards show actual projected impact plus projected tier as secondary identities',()=>{
  assert.match(game,/choice\.kind === 'relic'[\s\S]*projectRelicResonance/);
  assert.match(game,/relicResonanceImpactIdentityStyle\(projection\.impactId\)/);
  assert.match(game,/relicResonanceTierIdentityStyle\(projection\.tierId\)/);
  assert.match(game,/secondaryIdentityStyles:\s*\[impactStyle,tierStyle\]/);
  assert.match(game,/공명[^`]*\$\{projection\.after\.score/);
});

test('phase 2243 build identity strip adds only a derived next-tier progress frame around the existing relic icon',()=>{
  assert.match(game,/drawRelicResonanceProgressFrame/);
  assert.match(game,/relicResonanceNextTierProgress\(resonance\)/);
  assert.match(game,/i===0&&this\.activeRelic[\s\S]*drawRelicResonanceProgressFrame/);
  assert.doesNotMatch(snapshot,/relicResonanceProgress|projectedRelicResonance|eventToastRelicProjection/);
});

test('phase 2244 relic equip confirmation closes the prediction with actual resulting impact and tier helpers',()=>{
  assert.match(game,/eventToastRelicProjection/);
  assert.match(game,/choice\.kind === 'relic'[\s\S]*const projection=projectRelicResonance[\s\S]*this\.activeRelic = choice\.relicId[\s\S]*eventToastRelicProjection/);
  assert.match(game,/drawRelicResonanceProjectionToastIcons/);
  assert.match(game,/hideRelicResonanceProjectionIdentity/);
  assert.match(game,/bossSpecialTimer\s*<=\s*1\.2/);
});


test('phase 2244 clears relic projection identity before any later unrelated event toast',()=>{
  const start=game.indexOf('private showEventToast(');const end=game.indexOf('private showHeroMeterEventToast',start);const body=game.slice(start,end);
  assert.match(body,/this\.eventToastRelicProjection\s*=\s*null;/);
});

test('phase 2241-2244 keeps the original relic resonance formula modifiers actions and schema frozen',()=>{
  assert.match(resonance,/fusionCount\)\*1\.5 \+ Math\.max\(0,input\.fateChoiceCount\) \+ Math\.max\(0,input\.ascensionSelections\) \+ affinity/);
  assert.match(resonance,/score >= 9 \? 3 : score >= 6 \? 2 : score >= 3 \? 1 : 0/);
  assert.match(resonance,/spellPowerMultiplier: clamp\(1 \+ power \* \.05/);
  assert.match(resonance,/cooldownMultiplier: clamp\(1 - power \* \.03/);
  assert.match(resonance,/areaMultiplier: clamp\(1 \+ power \* \.035/);
  assert.match(resonance,/goldMultiplier: clamp\(1 \+ power \* \.04/);
  assert.match(resonance,/coreDamageTakenMultiplier: clamp\(1 - power \* \.025/);
});
