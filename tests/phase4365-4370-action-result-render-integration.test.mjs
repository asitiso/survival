import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { CombatFeedbackSystem } from '../dist/game/combat-feedback.js';

function recordingContext(){
  const ops=[];
  return {
    ops,
    save(){ops.push('save');}, restore(){ops.push('restore');}, beginPath(){ops.push('beginPath');},
    arc(){ops.push('arc');}, moveTo(){ops.push('moveTo');}, lineTo(){ops.push('lineTo');}, stroke(){ops.push('stroke');},
    set globalAlpha(value){this._globalAlpha=value;}, get globalAlpha(){return this._globalAlpha??1;},
    set strokeStyle(value){this._strokeStyle=value;}, get strokeStyle(){return this._strokeStyle;},
    set lineWidth(value){this._lineWidth=value;}, get lineWidth(){return this._lineWidth??1;},
    set lineCap(value){this._lineCap=value;}, get lineCap(){return this._lineCap;},
  };
}

test('Phase 4365-4370 CombatFeedbackSystem renders resolved result contour and distant source connector',()=>{
  const feedback=new CombatFeedbackSystem();
  feedback.addActionResult({x:260,y:180},'weakpointBreak',{x:80,y:180});
  const ctx=recordingContext();
  feedback.render(ctx,'high',{battlefieldStress:0,protectedWarning:false,safeLaneVisible:false,reducedMotion:false,reducedFlash:false});
  assert.ok(ctx.ops.includes('arc'),'resolved result needs an impact contour');
  assert.ok(ctx.ops.includes('lineTo'),'distant source ownership needs a connector');
  assert.ok(ctx.ops.includes('stroke'));
});

test('Phase 4365-4370 game wires live battlefield pressure and accessibility state into result rendering',()=>{
  const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.match(game,/this\.feedback\.render\(ctx,this\.presentation\.quality,\{/);
  assert.match(game,/battlefieldStress/);
  assert.match(game,/protectedWarning/);
  assert.match(game,/safeLaneVisible/);
  assert.match(game,/reducedMotion/);
  assert.match(game,/reducedFlash/);
});
