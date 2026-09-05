import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const projectionUrl=new URL('../dist/game/hero-ascension-projection.js',import.meta.url);
const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const levelup=fs.readFileSync(new URL('../src/ui/levelup.ts',import.meta.url),'utf8');
const ascension=fs.readFileSync(new URL('../src/game/endless/hero-ascension.ts',import.meta.url),'utf8');
const snapshot=fs.readFileSync(new URL('../src/game/endless/snapshot.ts',import.meta.url),'utf8');

test('phase 2249 projects actual before-to-after hero ascension modifiers through the frozen composer',async()=>{
  assert.equal(fs.existsSync(projectionUrl),true,'hero ascension projection module must exist');
  const m=await import(projectionUrl.href);
  const first=m.projectHeroAscensionSelection([], 'wildfire-doctrine');
  assert.equal(first.directionId,'expand');assert.deepEqual(first.modifierIds,['spell-power','fusion-power']);
  assert.deepEqual(first.effects.map(e=>[e.id,e.before,e.after,Math.round(e.deltaPercent)]),[['spell-power',1,1.1,10],['fusion-power',1,1.11,11]]);
  assert.match(m.heroAscensionProjectionHint(first),/마법 피해 \+10%/);assert.match(m.heroAscensionProjectionHint(first),/융합 위력 \+11%/);

  const hybrid=m.projectHeroAscensionSelection(['overcharge'],'thunder-step');
  assert.equal(hybrid.directionId,'hybrid');assert.deepEqual(hybrid.modifierIds,['spell-power','move-speed']);
  assert.ok(hybrid.effects[0].before>1);assert.equal(hybrid.effects[1].before,1);

  const focus=m.projectHeroAscensionSelection(['overcharge','tempest-loop'],'thunder-step');
  assert.equal(focus.directionId,'focus');assert.ok(focus.effects.every(e=>Math.abs(e.before-1)>1e-9));
});

test('phase 2250 hero ascension cards show build direction plus both real modifier vectors and numerical effective delta',()=>{
  assert.match(game,/openPendingHeroAscension[\s\S]*projectHeroAscensionSelection/);
  assert.match(game,/heroAscensionBuildDirectionIdentityStyle\(projection\.directionId\)/);
  assert.match(game,/projection\.modifierIds[\s\S]*heroAscensionModifierIdentityStyle/);
  assert.match(game,/secondaryIdentityStyles:[^\n]*directionStyle[^\n]*modifierStyles/);
  assert.match(game,/heroAscensionProjectionHint\(projection\)/);
  assert.match(levelup,/secondaryIdentityStyles\.slice\(0,3\)/);
});

test('phase 2251 ascension selection toast confirms actual build direction and both effect vectors without stale carryover',()=>{
  assert.match(game,/eventToastHeroAscensionProjection/);
  assert.match(game,/showDeepRunAscensionEventToast\([\s\S]*projection/);
  assert.match(game,/drawHeroAscensionProjectionToastIcons/);
  const start=game.indexOf('private showEventToast(');const end=game.indexOf('private showHeroMeterEventToast',start);const body=game.slice(start,end);
  assert.match(body,/this\.eventToastHeroAscensionProjection\s*=\s*null;/);
});

test('phase 2252 projection is presentation-only and keeps hero ascension gameplay and snapshots frozen',()=>{
  assert.match(ascension,/const MILESTONES = \[35, 50, 65\] as const/);
  assert.match(ascension,/selected: \[\.\.\.state\.selected, option\.optionId\]\.slice\(0, 3\)/);
  assert.match(ascension,/spellPowerMultiplier \*= 1\.10/);
  assert.match(ascension,/moveSpeedMultiplier \*= 1\.07/);
  assert.match(ascension,/cooldownMultiplier \*= 0\.92/);
  assert.match(ascension,/areaMultiplier \*= 1\.09/);
  assert.match(ascension,/heroDamageTakenMultiplier \*= 0\.93/);
  assert.match(ascension,/coreDamageTakenMultiplier \*= 0\.91/);
  assert.match(ascension,/fusionPowerMultiplier \*= 1\.11/);
  assert.match(ascension,/bossDamageMultiplier \*= 1\.10/);
  assert.match(ascension,/spellPowerMultiplier: clamp\(out\.spellPowerMultiplier, 1, 1\.45\)/);
  assert.match(ascension,/cooldownMultiplier: clamp\(out\.cooldownMultiplier, \.72, 1\)/);
  assert.doesNotMatch(snapshot,/heroAscensionProjection|eventToastHeroAscensionProjection|ascensionBuildDirection/);
});

test('phase 2252 corrects phoenix-cycle copy to match its actual single cooldown modifier without changing gameplay',async()=>{
  const m=await import(new URL('../dist/game/endless/hero-ascension.js',import.meta.url).href);
  const phoenix=m.heroAscensionCatalog('arkan').find(option=>option.optionId==='phoenix-cycle');
  assert.equal(phoenix?.description,'쿨타임 강화');
  const mods=m.heroAscensionModifiers(['phoenix-cycle']);
  assert.equal(mods.cooldownMultiplier,.92);assert.equal(mods.heroDamageTakenMultiplier,1);
});
