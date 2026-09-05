import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const projectionUrl=new URL('../dist/game/fusion-selection-projection.js',import.meta.url);
const composerUrl=new URL('../dist/game/fusion-integration.js',import.meta.url);
const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const levelup=fs.readFileSync(new URL('../src/ui/levelup.ts',import.meta.url),'utf8');
const fusions=fs.readFileSync(new URL('../src/game/spell-fusions.ts',import.meta.url),'utf8');
const snapshot=fs.readFileSync(new URL('../src/game/endless/snapshot.ts',import.meta.url),'utf8');

test('phase 2257 projects fusion components and actual before-to-after composer output',async()=>{
  assert.equal(fs.existsSync(projectionUrl),true,'fusion projection module must exist');
  const m=await import(projectionUrl.href);const composer=await import(composerUrl.href);
  const p=m.projectFusionSelection([], 'solar-detonation','arkan');
  assert.deepEqual(p.components,['fireBolt','flameField']);assert.equal(p.relationId,'fresh');assert.deepEqual(p.modifierIds.slice(0,2),['damage','area']);
  for(const spellId of p.components){assert.deepEqual(p.afterBySpell[spellId],composer.composeFusionSpellModifiers(['solar-detonation'],'arkan',spellId));}
  assert.match(m.fusionProjectionHint(p),/피해 \+22\.7%/);assert.match(m.fusionProjectionHint(p),/범위 \+17\.4%/);
});

test('phase 2257 linked projection represents one shared component and never invents full overlap',async()=>{
  const m=await import(projectionUrl.href);
  const linked=m.projectFusionSelection(['solar-detonation'],'storm-crucible','arkan');
  assert.equal(linked.relationId,'linked');assert.deepEqual(linked.sharedComponents,['flameField']);assert.equal(linked.sharedComponents.length,1);
  const fresh=m.projectFusionSelection(['solar-detonation'],'thunder-singularity','arkan');assert.equal(fresh.relationId,'fresh');assert.deepEqual(fresh.sharedComponents,[]);
});

test('phase 2258 fusion reward cards reuse spell identities and alone request five decision helpers',()=>{
  assert.match(game,/choice\.kind === 'fusion'[\s\S]*projectFusionSelection/);
  assert.match(game,/heroAbilitySecondaryIdentityStyle\(this\.hero\.profileId/);
  assert.match(game,/fusionComponentRelationIdentityStyle\(projection\.relationId\)/);
  assert.match(game,/projection\.modifierIds[\s\S]*fusionModifierIdentityStyle/);
  assert.match(game,/secondaryIdentityLimit:\s*5/);
  assert.match(game,/fusionProjectionHint\(projection\)/);
});

test('phase 2258 keeps the generic secondary-identity cap at three and scopes the five-icon exception per choice',()=>{
  assert.match(levelup,/secondaryIdentityLimit\?:\s*number/);
  assert.match(levelup,/const secondaryIdentityLimit=choice\.secondaryIdentityLimit\?\?3/);
  assert.match(levelup,/secondaryIdentityStyles\.slice\(0,secondaryIdentityLimit\)/);
  assert.doesNotMatch(levelup,/secondaryIdentityStyles\.slice\(0,5\)/);
  assert.match(game,/openPendingHeroAscension[\s\S]*secondaryIdentityStyles:[^\n]*directionStyle[^\n]*modifierStyles/);
  assert.doesNotMatch(game,/openPendingHeroAscension[\s\S]{0,800}secondaryIdentityLimit:\s*5/);
});

test('phase 2259 equip confirmation is attention-safe, clears stale projection state, and leaves fusion gameplay frozen',()=>{
  assert.match(game,/eventToastFusionProjection/);assert.match(game,/showFusionProjectionEventToast/);assert.match(game,/drawFusionProjectionToastIcons/);
  assert.match(game,/hideFusionProjectionIdentity[\s\S]*bossSpecialTimer\s*<=\s*1\.2/);
  const start=game.indexOf('private showEventToast(');const end=game.indexOf('private showHeroMeterEventToast',start);const body=game.slice(start,end);assert.match(body,/this\.eventToastFusionProjection\s*=\s*null;/);
  assert.match(fusions,/export const MAX_FUSIONS_PER_RUN = 2/);assert.match(fusions,/\(levels\[a\] \?\? 0\) >= 10 && \(levels\[b\] \?\? 0\) >= 10/);
  assert.match(fusions,/damageMultiplier: 1\.08/);assert.match(fusions,/Math\.min\(1\.24, base\.damageMultiplier \* 1\.04\)/);
  assert.doesNotMatch(snapshot,/fusionProjection|eventToastFusionProjection|fusionComponentRelation/);
});
