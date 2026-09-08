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

test('Phase 4401-4406 edge packing keeps final damage-number anchor inside viewport margins',()=>{
  const left=damageNumberPresentation({tier:'normal',sameTargetIndex:2,anchorX:5,anchorY:100,viewportWidth:200,viewportHeight:120});
  const right=damageNumberPresentation({tier:'normal',sameTargetIndex:1,anchorX:195,anchorY:100,viewportWidth:200,viewportHeight:120});
  const top=damageNumberPresentation({tier:'normal',resultPriorityNearby:4,resultDistance:0,anchorX:100,anchorY:3,viewportWidth:200,viewportHeight:120});
  assert.ok(5+left.offsetX>=18,'left edge label must be clamped inward');
  assert.ok(195+right.offsetX<=182,'right edge label must be clamped inward');
  assert.ok(3+top.offsetY>=22,'top edge label must be clamped below safe text margin');
});

test('Phase 4401-4406 dense neighboring targets gain deterministic vertical separation',()=>{
  const first=damageNumberPresentation({tier:'normal',denseNeighborIndex:0,battlefieldStress:.4});
  const second=damageNumberPresentation({tier:'normal',denseNeighborIndex:1,battlefieldStress:.4});
  const third=damageNumberPresentation({tier:'normal',denseNeighborIndex:2,battlefieldStress:.4});
  assert.equal(first.offsetY,0);
  assert.notEqual(second.offsetY,third.offsetY);
  assert.notEqual(second.offsetY,0);
});

test('Phase 4401-4406 Reduced Motion compresses dense-neighbor movement while stress retains the existing capacity budget',()=>{
  const normal=damageNumberPresentation({tier:'normal',denseNeighborIndex:2,battlefieldStress:1,clusterIndex:0});
  const reduced=damageNumberPresentation({tier:'normal',denseNeighborIndex:2,battlefieldStress:1,clusterIndex:0,reducedMotion:true});
  assert.ok(Math.abs(reduced.offsetY)<Math.abs(normal.offsetY));
  assert.ok(normal.maxVisible<=3,'maximum stress should keep the existing tight normal-number capacity');
});

test('Phase 4401-4406 CombatFeedbackSystem separates different nearby targets without hiding critical ownership',()=>{
  const feedback=new CombatFeedbackSystem();
  feedback.addHit({x:100,y:100},10,'normal',undefined,undefined,1);
  feedback.addHit({x:100,y:100},20,'normal',undefined,undefined,2);
  feedback.addHit({x:100,y:100},90,'critical',undefined,undefined,3);
  const ctx=recordingContext();
  feedback.render(ctx,'high',{battlefieldStress:.7,reducedMotion:false,reducedFlash:false});
  assert.equal(ctx.texts.length,3);
  assert.equal(new Set(ctx.texts.map(item=>`${item.x.toFixed(2)}:${item.y.toFixed(2)}`)).size,3);
  assert.ok(ctx.texts.some(item=>item.text.endsWith('!')),'critical damage must remain visible');
});

test('Phase 4401-4406 4 heroes x 6 Threat tiers x manual/AUTO packing matrix remains finite and edge-safe',()=>{
  const heroes=['arkan','seria','kain','edric'];
  const controls=['manual','auto'];
  let cases=0;
  for(const hero of heroes){
    for(let threat=0;threat<=5;threat++){
      for(const control of controls){
        const anchorX=(threat%2===0)?8:1592;
        const cue=damageNumberPresentation({
          tier:threat>=5?'critical':threat>=3?'heavy':'normal',
          battlefieldStress:threat/5,
          clusterIndex:Math.min(2,threat),
          sameTargetIndex:threat%4,
          denseNeighborIndex:threat%3,
          anchorX,anchorY:hero==='seria'?12:450,
          viewportWidth:1600,viewportHeight:900,
          protectedWarning:threat===5,
          safeLaneVisible:hero==='edric'&&threat>=3,
          reducedMotion:control==='manual'&&hero==='seria',
          reducedFlash:control==='auto'&&hero==='kain',
        });
        assert.ok(Number.isFinite(cue.offsetX)&&Number.isFinite(cue.offsetY));
        assert.ok(Number.isFinite(cue.alpha));
        if(cue.visible){
          assert.ok(anchorX+cue.offsetX>=18&&anchorX+cue.offsetX<=1582);
        }
        if(cue.tier==='critical')assert.equal(cue.visible,true);
        cases++;
      }
    }
  }
  assert.equal(cases,48);
});
