import test from 'node:test';
import assert from 'node:assert/strict';
import { damageNumberPresentation } from '../dist/game/damage-number-readability.js';
import { CombatFeedbackSystem } from '../dist/game/combat-feedback.js';

test('Phase 4383-4388 protected warnings and safe-lane guidance own priority over damage numbers',()=>{
  const base={tier:'normal',battlefieldStress:.6,clusterIndex:0,resultPriorityNearby:0,resultDistance:999};
  const calm=damageNumberPresentation(base);
  const warning=damageNumberPresentation({...base,protectedWarning:true});
  const safeLane=damageNumberPresentation({...base,safeLaneVisible:true});
  assert.ok(warning.alpha<calm.alpha,'boss/critical warning must lower damage-number emphasis');
  assert.ok(safeLane.alpha<calm.alpha,'safe-lane guidance must lower damage-number emphasis');
});

test('Phase 4383-4388 Reduced Flash lowers damage-number intensity and Reduced Motion limits ownership displacement',()=>{
  const base={tier:'normal',battlefieldStress:.3,clusterIndex:0,resultPriorityNearby:4,resultDistance:0};
  const normal=damageNumberPresentation(base);
  const reducedFlash=damageNumberPresentation({...base,reducedFlash:true});
  const reducedMotion=damageNumberPresentation({...base,reducedMotion:true});
  assert.ok(reducedFlash.alpha<normal.alpha);
  assert.ok(Math.abs(reducedMotion.offsetY)<Math.abs(normal.offsetY));
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

test('Phase 4383-4388 dense normal-hit capacity keeps the newest routine numbers',()=>{
  const feedback=new CombatFeedbackSystem();
  for(const amount of [10,20,30,40,50])feedback.addHit({x:100,y:100},amount,'normal');
  const ctx=recordingContext();
  feedback.render(ctx,'high',{battlefieldStress:1});
  assert.deepEqual(ctx.texts.map(item=>item.text),['30','40','50']);
});

test('Phase 4383-4388 critical damage remains visible but yields some emphasis to protected warning ownership',()=>{
  const calm=damageNumberPresentation({tier:'critical',battlefieldStress:1,clusterIndex:99});
  const protectedCue=damageNumberPresentation({tier:'critical',battlefieldStress:1,clusterIndex:99,protectedWarning:true,safeLaneVisible:true,reducedFlash:true});
  assert.equal(protectedCue.visible,true);
  assert.ok(protectedCue.alpha>0);
  assert.ok(protectedCue.alpha<calm.alpha);
  assert.ok(protectedCue.alpha>=.45,'critical damage must remain readable after yielding');
});

test('Phase 4383-4388 4 heroes x 6 Threat tiers x manual/AUTO damage-number matrix stays finite and readable',()=>{
  const heroes=['arkan','seria','kain','edric'];
  const controls=['manual','auto'];
  let cases=0;
  for(const hero of heroes){
    for(let threat=0;threat<=5;threat++){
      for(const control of controls){
        const cue=damageNumberPresentation({
          tier:threat>=5?'critical':threat>=3?'heavy':'normal',
          battlefieldStress:threat/5,
          clusterIndex:threat,
          resultPriorityNearby:threat>=4?4:0,
          resultDistance:threat>=4?18:120,
          protectedWarning:threat===5,
          safeLaneVisible:hero==='edric'&&threat>=3,
          reducedMotion:control==='manual'&&hero==='seria',
          reducedFlash:control==='auto'&&hero==='kain',
        });
        assert.ok(Number.isFinite(cue.alpha));
        assert.ok(Number.isFinite(cue.offsetY));
        assert.ok(Number.isFinite(cue.maxVisible));
        assert.ok(cue.alpha>=0&&cue.alpha<=1);
        if(cue.tier==='critical')assert.equal(cue.visible,true);
        cases++;
      }
    }
  }
  assert.equal(cases,48);
});
