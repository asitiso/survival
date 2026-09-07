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

test('Phase 4395-4400 damage number avoids a nearby resolved result in the opposite direction',()=>{
  const owned=damageNumberPresentation({
    tier:'normal',resultPriorityNearby:4,resultDistance:18,
    resultVectorX:-18,resultVectorY:0,
  });
  assert.ok(owned.offsetX<0,'damage label should move away from a result cue sitting to its right');
});

test('Phase 4395-4400 co-located result uses incoming source direction while critical displacement stays minimal',()=>{
  const normal=damageNumberPresentation({
    tier:'normal',resultPriorityNearby:4,resultDistance:0,
    sourceVectorX:60,sourceVectorY:0,
  });
  const critical=damageNumberPresentation({
    tier:'critical',resultPriorityNearby:4,resultDistance:0,
    sourceVectorX:60,sourceVectorY:0,
  });
  assert.ok(normal.offsetX>0,'number should continue away from the incoming source connector');
  assert.ok(Math.abs(critical.offsetX)<Math.abs(normal.offsetX),'critical should move less than routine damage');
});

test('Phase 4395-4400 CombatFeedbackSystem keeps source causality when a result owns the same impact center',()=>{
  const feedback=new CombatFeedbackSystem();
  feedback.addHit({x:100,y:100},40,'normal',undefined,{x:40,y:100},7);
  feedback.addActionResult({x:100,y:100},'guardBreak',{x:40,y:100});
  const ctx=recordingContext();
  feedback.render(ctx,'high',{battlefieldStress:0});
  assert.equal(ctx.texts.length,1);
  assert.ok(ctx.texts[0].x>100,'co-located number should move past the impact in the source-to-impact direction');
});
