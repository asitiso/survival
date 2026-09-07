import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as readability from '../dist/game/freeze-status-readability.js';

const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

function step(state,input,dt=.08,reducedMotion=false){
  return readability.advanceFreezeStatusLifecycle(state,input,dt,reducedMotion);
}

test('Phase 4437-4442 source handoff preserves lifecycle alpha instead of restarting the cue',()=>{
  let state=readability.createFreezeStatusLifecycleState();
  for(let i=0;i<4;i++)state=step(state,{active:true,targetAlpha:.68,targetSizeScale:1,source:'frost'});
  const before=state.alpha;
  state=step(state,{active:true,targetAlpha:.58,targetSizeScale:.94,source:'gravity'},.016,false);
  assert.equal(state.source,'gravity');
  assert.ok(state.alpha>before-.08,'source handoff should not disappear and restart');
  assert.ok(state.sourceBlend>0&&state.sourceBlend<1,'new semantic ownership should ease in');
  const firstBlend=state.sourceBlend;
  state=step(state,{active:true,targetAlpha:.58,targetSizeScale:.94,source:'gravity'},.08,false);
  assert.ok(state.sourceBlend>firstBlend);
});

test('Phase 4437-4442 same-source reapplication does not reset source handoff progress and Reduced Motion still removes pulse',()=>{
  let state=readability.createFreezeStatusLifecycleState();
  state=step(state,{active:true,targetAlpha:.5,targetSizeScale:.9,source:'terrain'},.1,true);
  const blend=state.sourceBlend;
  state=step(state,{active:true,targetAlpha:.7,targetSizeScale:1,source:'terrain'},.016,true);
  assert.equal(state.source,'terrain');
  assert.ok(state.sourceBlend>=blend);
  assert.equal(state.pulseScale,0);
});

test('Phase 4437-4442 visual freeze shatter is frost-only while legacy undefined provenance stays compatible',()=>{
  assert.equal(typeof readability.slowDeathUsesFreezeShatter,'function');
  assert.equal(readability.slowDeathUsesFreezeShatter('frost'),true);
  assert.equal(readability.slowDeathUsesFreezeShatter('gravity'),false);
  assert.equal(readability.slowDeathUsesFreezeShatter('terrain'),false);
  assert.equal(readability.slowDeathUsesFreezeShatter('impact'),false);
  assert.equal(readability.slowDeathUsesFreezeShatter('generic'),false);
  assert.equal(readability.slowDeathUsesFreezeShatter(undefined),true);
});

test('Phase 4437-4442 game gates visual shatter by slow source but preserves Seria wasSlowed gameplay trigger',()=>{
  assert.match(game,/slowDeathUsesFreezeShatter\(death\.slowSource\)/);
  assert.match(game,/this\.hero\.profileId === 'seria' && death\.wasSlowed/);
  assert.match(game,/triggerSeriaShatter\(death\)/);
});

test('Phase 4437-4442 hero x threat x control x source overlap remains finite',()=>{
  const heroes=['arkan','seria','kain','edric'], sources=['frost','gravity','terrain','impact','generic'];
  let cases=0;
  for(const hero of heroes)for(let threat=0;threat<=5;threat++)for(const control of ['manual','auto']){
    let state=readability.createFreezeStatusLifecycleState();
    const first=sources[(threat+heroes.indexOf(hero))%sources.length];
    const second=sources[(threat+heroes.indexOf(hero)+1)%sources.length];
    state=step(state,{active:true,targetAlpha:.35+threat*.06,targetSizeScale:.8+threat*.025,source:first},.016,control==='manual'&&hero==='seria');
    state=step(state,{active:true,targetAlpha:.4+threat*.05,targetSizeScale:.82+threat*.02,source:second},.016,control==='manual'&&hero==='seria');
    assert.ok(Number.isFinite(state.alpha)&&Number.isFinite(state.sourceBlend));
    assert.ok(state.alpha>=0&&state.alpha<=1);
    assert.ok(state.sourceBlend>=0&&state.sourceBlend<=1);
    cases++;
  }
  assert.equal(cases,48);
});
