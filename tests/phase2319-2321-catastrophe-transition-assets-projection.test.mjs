import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const assetsUrl=new URL('../dist/game/catastrophe-transition-identity-assets.js',import.meta.url);
const projectionUrl=new URL('../dist/game/catastrophe-transition-projection.js',import.meta.url);

test('phase 2319 provides four static catastrophe transition identities in one compact atlas',async()=>{
  assert.equal(fs.existsSync(assetsUrl),true,'catastrophe transition identity module must exist');
  const m=await import(assetsUrl.href);
  assert.deepEqual(m.CATASTROPHE_TRANSITION_IDENTITY_IDS,['helpful','harmful','mixed','transition']);
  assert.deepEqual(m.CATASTROPHE_TRANSITION_IDENTITY_ATLAS,{src:'./assets/ui/catastrophe-transition-icons.png',columns:2,rows:2,cellSize:96,width:192,height:192});
  const a=m.auditCatastropheTransitionIdentityAtlas();assert.equal(a.coverage,1);assert.equal(a.uniqueCellCount,4);assert.deepEqual(a.outOfBounds,[]);assert.equal(a.passed,true);
  for(const id of m.CATASTROPHE_TRANSITION_IDENTITY_IDS){const icon=m.catastropheTransitionIdentityIcon(id);assert.equal(icon.animated,false);assert.equal(icon.motionAmplitude,0);assert.equal(icon.textFallbackPreserved,true);assert.equal(icon.loadFailureBlocksGameplay,false);}
});

test('phase 2320 forecasts the authoritative 20 minute start and 180 second rotation only inside sixty seconds',async()=>{
  assert.equal(fs.existsSync(projectionUrl),true,'catastrophe transition projection module must exist');
  const m=await import(projectionUrl.href);
  const before=m.projectCatastropheTransitionForecast(18*60);assert.equal(before.current,null);assert.equal(before.next?.id,'goldenNight');assert.equal(before.secondsToNext,120);assert.equal(before.visible,false);
  const edge=m.projectCatastropheTransitionForecast(19*60);assert.equal(edge.next?.id,'goldenNight');assert.equal(edge.secondsToNext,60);assert.equal(edge.visible,true);
  const live=m.projectCatastropheTransitionForecast(22*60+30);assert.equal(live.current?.id,'goldenNight');assert.equal(live.next?.id,'frenzy');assert.equal(live.secondsToNext,30);assert.equal(live.visible,true);
  const early=m.projectCatastropheTransitionForecast(21*60);assert.equal(early.secondsToNext,120);assert.equal(early.visible,false);
});

test('phase 2320 derives transition outcomes from catastropheModifiers without duplicated gameplay values',async()=>{
  const m=await import(projectionUrl.href);
  const harmful=m.projectCatastropheTransitionByIds('goldenNight','frenzy');assert.equal(harmful.status,'harmful');assert.deepEqual(harmful.primaryChanges.map(v=>v.id),['gold','enemy-speed']);
  const helpful=m.projectCatastropheTransitionByIds('frenzy','arcaneSurge');assert.equal(helpful.status,'helpful');assert.ok(helpful.changes.some(v=>v.id==='cooldown'&&v.before===1&&v.after===0.82&&v.outcome==='helpful'));
  const mixed=m.projectCatastropheTransitionByIds('arcaneSurge','redMoon');assert.equal(mixed.status,'mixed');assert.ok(mixed.changes.some(v=>v.outcome==='helpful'));assert.ok(mixed.changes.some(v=>v.outcome==='harmful'));
  const wrap=m.projectCatastropheTransitionByIds('guardianGrace','goldenNight');assert.equal(wrap.status,'mixed');assert.ok(wrap.changes.some(v=>v.id==='gold'&&v.after===2));
});

test('phase 2321 keeps transition hint compact while preserving concrete before and after impact',async()=>{
  const m=await import(projectionUrl.href);
  const p=m.projectCatastropheTransitionByIds('frenzy','arcaneSurge');const hint=m.catastropheTransitionHint(p,2);
  assert.match(hint,/쿨/);assert.match(hint,/적속/);assert.ok(hint.length<=28,`hint too long: ${hint}`);
  const f=m.projectCatastropheTransitionForecast(22*60+45);assert.match(m.catastropheTransitionForecastLabel(f),/15s/);
});
