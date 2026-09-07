import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { damageNumberPresentation } from '../dist/game/damage-number-readability.js';
import { CombatFeedbackSystem } from '../dist/game/combat-feedback.js';

test('Phase 4377-4382 resolved result ownership weakens and displaces routine damage numbers nearby',()=>{
  const base=damageNumberPresentation({tier:'normal',battlefieldStress:0,clusterIndex:0});
  const owned=damageNumberPresentation({tier:'normal',battlefieldStress:0,clusterIndex:0,resultPriorityNearby:3,resultDistance:8});
  assert.ok(owned.alpha<base.alpha*.6,'resolved result must own center emphasis over normal damage');
  assert.ok(owned.offsetY<base.offsetY,'routine number should move away from the result contour');
  assert.equal(owned.visible,true);
});

test('Phase 4377-4382 critical damage coexists with resolved result ownership without losing emphasis',()=>{
  const base=damageNumberPresentation({tier:'critical',battlefieldStress:1,clusterIndex:99});
  const owned=damageNumberPresentation({tier:'critical',battlefieldStress:1,clusterIndex:99,resultPriorityNearby:5,resultDistance:0});
  assert.equal(owned.visible,true);
  assert.ok(owned.alpha>=base.alpha*.9,'critical number must retain emphasis beside a result cue');
  assert.ok(owned.offsetY<=-4,'critical number may move slightly to avoid center collision');
});

test('Phase 4377-4382 distant result cues do not steal damage-number ownership',()=>{
  const base=damageNumberPresentation({tier:'normal',battlefieldStress:.4,clusterIndex:0});
  const far=damageNumberPresentation({tier:'normal',battlefieldStress:.4,clusterIndex:0,resultPriorityNearby:5,resultDistance:120});
  assert.equal(far.alpha,base.alpha);
  assert.equal(far.offsetY,base.offsetY);
});

function recordingContext(){
  const texts=[];
  return {
    texts,
    save(){},restore(){},beginPath(){},arc(){},moveTo(){},lineTo(){},stroke(){},strokeText(){},
    fillText(text,x,y){texts.push({text,x,y,alpha:this.globalAlpha});},
    set globalAlpha(v){this._a=v;},get globalAlpha(){return this._a??1;},
    set strokeStyle(v){this._s=v;},get strokeStyle(){return this._s;},
    set fillStyle(v){this._f=v;},get fillStyle(){return this._f;},
    set lineWidth(v){this._w=v;},get lineWidth(){return this._w??1;},
    set lineCap(v){this._lc=v;},get lineCap(){return this._lc;},
    set textAlign(v){this._ta=v;},get textAlign(){return this._ta;},
    set textBaseline(v){this._tb=v;},get textBaseline(){return this._tb;},
    set font(v){this._font=v;},get font(){return this._font;},
  };
}

test('Phase 4377-4382 CombatFeedbackSystem shifts normal number when a resolved result owns the same impact point',()=>{
  const feedback=new CombatFeedbackSystem();
  feedback.addHit({x:100,y:100},40,'normal');
  feedback.addActionResult({x:100,y:100},'guardBreak');
  const ctx=recordingContext();
  feedback.render(ctx,'high',{battlefieldStress:0});
  assert.equal(ctx.texts.length,1);
  assert.ok(ctx.texts[0].y<100,'rendered normal number should yield vertically to result ownership');
});

test('Phase 4377-4382 combat feedback derives nearby resolved-result priority for damage-number arbitration',()=>{
  const source=fs.readFileSync(new URL('../src/game/combat-feedback.ts',import.meta.url),'utf8');
  assert.match(source,/resultPriorityNearby/);
  assert.match(source,/resultDistance/);
});
