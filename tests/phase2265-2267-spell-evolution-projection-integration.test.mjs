import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const projectionUrl=new URL('../dist/game/spell-evolution-selection-projection.js',import.meta.url);
const evolutionUrl=new URL('../dist/game/spell-evolutions.js',import.meta.url);
const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const levelup=fs.readFileSync(new URL('../src/ui/levelup.ts',import.meta.url),'utf8');
const snapshot=fs.readFileSync(new URL('../src/game/endless/snapshot.ts',import.meta.url),'utf8');

test('phase 2265 projects real level four-to-five evolution deltas through the frozen spellEvolution composer',async()=>{
  assert.equal(fs.existsSync(projectionUrl),true,'spell evolution projection module must exist');
  const m=await import(projectionUrl.href);const evo=await import(evolutionUrl.href);
  const p=m.projectSpellEvolutionSelection('arkan','fireBolt',4);
  assert.ok(p);assert.equal(p.tierDeltaId,'awaken');assert.equal(p.before.tier,0);assert.equal(p.after.tier,1);
  assert.deepEqual(p.after,evo.spellEvolution('arkan','fireBolt',5));
  assert.deepEqual(p.modifierIds.slice(0,2),['damage','projectile']);
  assert.match(m.spellEvolutionProjectionHint(p),/^1차 진화 실효 · 피해 \+13\.4% · 투사체 \+1$/);
});

test('phase 2265 projects final evolution and returns null outside exact next-tier boundaries',async()=>{
  const m=await import(projectionUrl.href);
  const final=m.projectSpellEvolutionSelection('seria','frostNova',9);assert.ok(final);assert.equal(final.tierDeltaId,'final');assert.equal(final.before.tier,1);assert.equal(final.after.tier,2);assert.ok(final.modifierIds.length>=1&&final.modifierIds.length<=2);assert.match(m.spellEvolutionProjectionHint(final),/^최종 진화 실효 · /);
  assert.equal(m.projectSpellEvolutionSelection('arkan','fireBolt',3),null);assert.equal(m.projectSpellEvolutionSelection('arkan','fireBolt',5),null);assert.equal(m.projectSpellEvolutionSelection('arkan','fireBolt',10),null);
});

test('phase 2266 level-up and boss growth cards add tier plus real modifier helpers without changing the generic three-icon contract',()=>{
  assert.match(game,/openNextBossReward[\s\S]*projectSpellEvolutionSelection/);
  assert.match(game,/openNextLevelUp[\s\S]*projectSpellEvolutionSelection/);
  assert.match(game,/spellEvolutionTierDeltaIdentityStyle\(projection\.tierDeltaId\)/);
  assert.match(game,/projection\.modifierIds[\s\S]*spellEvolutionModifierIdentityStyle/);
  assert.match(game,/secondaryIdentityStyles:[^\n]*tierStyle[^\n]*modifierStyles/);
  assert.match(game,/spellEvolutionProjectionHint\(projection\)/);
  assert.match(levelup,/secondaryIdentityStyles\.slice\(0,3\)/);
  assert.doesNotMatch(game,/projectSpellEvolutionSelection[\s\S]{0,900}secondaryIdentityLimit:\s*[45]/);
});

test('phase 2267 successful evolution toast reuses the real projection and clears it before unrelated notifications',()=>{
  assert.match(game,/eventToastSpellEvolutionProjection/);assert.match(game,/showSpellEvolutionEventToast\([\s\S]*projection/);assert.match(game,/drawSpellEvolutionProjectionToastIcons/);
  assert.match(game,/hideSpellEvolutionProjectionIdentity[\s\S]*bossSpecialTimer\s*<=\s*1\.2/);
  const start=game.indexOf('private showEventToast(');const end=game.indexOf('private showHeroMeterEventToast',start);const body=game.slice(start,end);assert.match(body,/this\.eventToastSpellEvolutionProjection\s*=\s*null;/);
  assert.match(game,/notifySpellEvolutionIfChanged[\s\S]*projectSpellEvolutionSelection/);
});

test('phase 2267 projection remains presentation-only and keeps spell evolution gameplay and snapshots frozen',()=>{
  const evolutions=fs.readFileSync(new URL('../src/game/spell-evolutions.ts',import.meta.url),'utf8');
  assert.match(evolutions,/if \(value >= 10\) return 2;/);assert.match(evolutions,/if \(value >= 5\) return 1;/);
  assert.match(evolutions,/profile\.damageMultiplier = tier === 1 \? 1\.08 : 1\.18/);assert.match(evolutions,/profile\.cooldownMultiplier = tier === 1 \? 0\.95 : 0\.84/);assert.match(evolutions,/profile\.slowDurationMultiplier = tier === 2 \? 1\.30 : 1\.15/);
  assert.doesNotMatch(snapshot,/spellEvolutionProjection|eventToastSpellEvolutionProjection|spellEvolutionModifier/);
});
