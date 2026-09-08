import test from 'node:test';
import assert from 'node:assert/strict';
import { damageNumberPresentation } from '../dist/game/damage-number-readability.js';
import { CombatFeedbackSystem } from '../dist/game/combat-feedback.js';

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

test('Phase 4389-4394 same-target packing assigns deterministic horizontal slots by tier',()=>{
  const critical=damageNumberPresentation({tier:'critical',sameTargetIndex:3});
  const heavy0=damageNumberPresentation({tier:'heavy',sameTargetIndex:0});
  const heavy1=damageNumberPresentation({tier:'heavy',sameTargetIndex:1});
  const normal0=damageNumberPresentation({tier:'normal',sameTargetIndex:0});
  const normal1=damageNumberPresentation({tier:'normal',sameTargetIndex:1});
  assert.equal(critical.offsetX,0,'critical stays centered');
  assert.notEqual(heavy0.offsetX,heavy1.offsetX,'heavy hits use distinct stable slots');
  assert.notEqual(normal0.offsetX,normal1.offsetX,'routine hits use distinct stable slots');
  assert.ok(Math.abs(normal1.offsetX)>=Math.abs(heavy1.offsetX),'normal packing may spread wider than heavy');
});

test('Phase 4389-4394 Reduced Motion compresses packing displacement without changing slot sign',()=>{
  const normal=damageNumberPresentation({tier:'normal',sameTargetIndex:2});
  const reduced=damageNumberPresentation({tier:'normal',sameTargetIndex:2,reducedMotion:true});
  assert.ok(Math.abs(reduced.offsetX)<Math.abs(normal.offsetX));
  assert.equal(Math.sign(reduced.offsetX),Math.sign(normal.offsetX));
});

test('Phase 4389-4394 CombatFeedbackSystem separates repeated hits sharing one impact anchor',()=>{
  const feedback=new CombatFeedbackSystem();
  feedback.addHit({x:100,y:100},10,'normal');
  feedback.addHit({x:100,y:100},20,'normal');
  feedback.addHit({x:100,y:100},30,'normal');
  const ctx=recordingContext();
  feedback.render(ctx,'high',{battlefieldStress:0});
  assert.equal(ctx.texts.length,3);
  assert.equal(new Set(ctx.texts.map(item=>item.x)).size,3,'same-anchor damage labels must not fully overlap');
});
