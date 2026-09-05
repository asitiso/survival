import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const projectionUrl=new URL('../dist/game/generic-upgrade-effective-projection.js',import.meta.url);
const entitiesUrl=new URL('../dist/game/entities.js',import.meta.url);
const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const upgrades=fs.readFileSync(new URL('../src/game/upgrades.ts',import.meta.url),'utf8');
const snapshot=fs.readFileSync(new URL('../src/game/endless/snapshot.ts',import.meta.url),'utf8');

test('phase 2289 projects full generic stat gain through the frozen applyUpgrade implementation',async()=>{
  assert.equal(fs.existsSync(projectionUrl),true,'generic upgrade projection module must exist');
  const m=await import(projectionUrl.href);const {createHero}=await import(entitiesUrl.href);
  const hero=createHero('arkan');const before=hero.spellPower;
  const p=m.projectGenericUpgradeEffectiveGain(hero,'spellPower');
  assert.equal(p.statusId,'full');assert.equal(p.before,before);assert.equal(p.after,before*1.12);assert.equal(p.delta,p.after-p.before);
  assert.equal(m.genericUpgradeEffectiveGainHint(p),'실효 · 마법 화력 1.080×→1.210× (+12.0%)');
  assert.equal(hero.spellPower,before,'projection must not mutate the live hero');
});

test('phase 2289 reports diminished cooldown gain when the 0.55 floor truncates the nominal six percent',async()=>{
  const m=await import(projectionUrl.href);const {createHero}=await import(entitiesUrl.href);const hero=createHero('arkan');hero.cooldownMultiplier=.56;
  const p=m.projectGenericUpgradeEffectiveGain(hero,'cooldown');
  assert.equal(p.statusId,'diminished');assert.equal(p.before,.56);assert.equal(p.after,.55);assert.ok(p.effectivePercent>1.7&&p.effectivePercent<1.9);
  assert.equal(m.genericUpgradeEffectiveGainHint(p),'감소 효율 · 재사용시간 0.560×→0.550× (-1.8%)');
});

test('phase 2290 reports capped cooldown truthfully and preserves other fixed generic upgrades',async()=>{
  const m=await import(projectionUrl.href);const {createHero}=await import(entitiesUrl.href);const hero=createHero('arkan');hero.cooldownMultiplier=.55;
  const capped=m.projectGenericUpgradeEffectiveGain(hero,'cooldown');assert.equal(capped.statusId,'capped');assert.equal(capped.after,.55);assert.equal(capped.effectivePercent,0);assert.equal(m.genericUpgradeEffectiveGainHint(capped),'상한 도달 · 재사용시간 0.550× 유지');
  const hp=m.projectGenericUpgradeEffectiveGain(hero,'maxHp');assert.equal(hp.statusId,'full');assert.equal(hp.before,240);assert.equal(hp.after,282);assert.equal(hp.secondaryDelta,42);
  const pickup=m.projectGenericUpgradeEffectiveGain(hero,'pickupRadius');assert.equal(pickup.after,138);
});

test('phase 2291 level-up cards add real effective gain only for generic stats while spell evolution projection retains precedence',()=>{
  assert.match(game,/openNextLevelUp[\s\S]*projectGenericUpgradeEffectiveGain/);
  assert.match(game,/genericUpgradeGainStatusIdentityStyle\(projection\.statusId\)/);
  assert.match(game,/genericUpgradeEffectiveGainHint\(projection\)/);
  assert.match(game,/if\s*\(choice\.id in this\.spells\.levels\)[\s\S]*projectSpellEvolutionSelection/);
  assert.match(game,/secondaryIdentityStyles:\s*\[statusStyle\]/);
  assert.doesNotMatch(game,/projectGenericUpgradeEffectiveGain[\s\S]{0,900}secondaryIdentityLimit:\s*[45]/);
});

test('phase 2291 is presentation-only and freezes generic upgrade values, cooldown floor, choices, actions and snapshots',()=>{
  assert.match(upgrades,/hero\.maxHp \+= 42/);assert.match(upgrades,/hero\.speed \*= 1\.075/);assert.match(upgrades,/hero\.spellPower \*= 1\.12/);assert.match(upgrades,/Math\.max\(0\.55, hero\.cooldownMultiplier \* 0\.94\)/);assert.match(upgrades,/hero\.pickupRadius \+= 28/);
  assert.match(upgrades,/while \(result\.length < 3/);
  assert.doesNotMatch(snapshot,/genericUpgradeEffective|gainStatus|effectiveGainProjection/);
});
