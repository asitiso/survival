import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const assetsUrl=new URL('../dist/game/endless/nemesis-adaptation-effect-identity-assets.js',import.meta.url);
const projectionUrl=new URL('../dist/game/endless/nemesis-adaptation-effect-projection.js',import.meta.url);

test('phase 2327 provides five static nemesis adaptation effect identities in one compact atlas',async()=>{
  assert.equal(fs.existsSync(assetsUrl),true,'nemesis adaptation effect identity module must exist');
  const m=await import(assetsUrl.href);
  assert.deepEqual(m.NEMESIS_ADAPTATION_EFFECT_IDENTITY_IDS,['damage-resistance','dash-distance','summon-pressure','special-cadence','mirror-affinity']);
  assert.deepEqual(m.NEMESIS_ADAPTATION_EFFECT_IDENTITY_ATLAS,{src:'./assets/ui/nemesis-adaptation-effect-icons.png',columns:3,rows:2,cellSize:96,width:288,height:192});
  const a=m.auditNemesisAdaptationEffectIdentityAtlas();assert.equal(a.coverage,1);assert.equal(a.uniqueCellCount,5);assert.deepEqual(a.outOfBounds,[]);assert.equal(a.passed,true);
  for(const id of m.NEMESIS_ADAPTATION_EFFECT_IDENTITY_IDS){const icon=m.nemesisAdaptationEffectIdentityIcon(id);assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);}
});

test('phase 2328 projects rank-sensitive authoritative nemesis encounter effects',async()=>{
  assert.equal(fs.existsSync(projectionUrl),true,'nemesis effect projection module must exist');
  const m=await import(projectionUrl.href);
  const guard=m.projectNemesisAdaptationEffect({kind:'spell_guard',rank:3});assert.equal(guard.effectId,'damage-resistance');assert.equal(guard.before,1);assert.equal(guard.after,0.895);assert.equal(guard.pressurePercent,10.5);
  const blink=m.projectNemesisAdaptationEffect({kind:'blink_hunt',rank:2});assert.equal(blink.effectId,'dash-distance');assert.equal(blink.after,1.1);assert.equal(blink.pressurePercent,10);
  const siege=m.projectNemesisAdaptationEffect({kind:'core_siege',rank:3});assert.equal(siege.effectId,'summon-pressure');assert.equal(siege.after,1.15);assert.equal(siege.pressurePercent,15);
  const rage=m.projectNemesisAdaptationEffect({kind:'enrage_clock',rank:3});assert.equal(rage.effectId,'special-cadence');assert.equal(rage.after,0.88);assert.equal(rage.pressurePercent,12);
});

test('phase 2328 mirror affinity preserves learned affinity and authoritative six percent resistance',async()=>{
  const m=await import(projectionUrl.href);const p=m.projectNemesisAdaptationEffect({kind:'mirror_affinity',rank:2,affinity:'frost'});
  assert.equal(p.effectId,'mirror-affinity');assert.equal(p.after,0.94);assert.equal(p.pressurePercent,6);assert.equal(p.affinity,'frost');assert.match(p.label,/FROST/i);
});

test('phase 2328 encounter projection exposes only the two highest-impact effects with compact hint',async()=>{
  const m=await import(projectionUrl.href);const p=m.projectNemesisAdaptationEffects([{kind:'spell_guard',rank:3},{kind:'core_siege',rank:3},{kind:'enrage_clock',rank:3}]);
  assert.equal(p.effects.length,3);assert.deepEqual(p.primaryEffects.map(v=>v.effectId),['summon-pressure','special-cadence']);
  const hint=m.nemesisAdaptationEffectHint(p,2);assert.match(hint,/소환/);assert.match(hint,/특수/);assert.ok(hint.length<=26,`hint too long: ${hint}`);
});

test('phase 2328 learning toast label preserves frozen prefix while staying compact',async()=>{
  const m=await import(projectionUrl.href);const p=m.projectNemesisAdaptationEffects([{kind:'spell_guard',rank:3},{kind:'core_siege',rank:3},{kind:'enrage_clock',rank:3}]);const label=m.nemesisAdaptationLearningToastLabel(3,p);
  assert.match(label,/^네메시스 학습 · 3개 대응 패턴/);assert.match(label,/소환/);assert.ok(label.length<=34,`learning toast too long: ${label}`);
});
