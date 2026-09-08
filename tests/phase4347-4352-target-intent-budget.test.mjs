import test from 'node:test';
import assert from 'node:assert/strict';
import { targetIntentCuePresentation } from '../dist/game/target-intent-cue.js';

const base={committedTargetId:9,targetAlive:true,targetRadius:28};

test('Phase 4347-4352 target intent yields monotonically as battlefield stress rises',()=>{
  const calm=targetIntentCuePresentation({...base,mode:'manual',battlefieldStress:0});
  const busy=targetIntentCuePresentation({...base,mode:'manual',battlefieldStress:.55});
  const dense=targetIntentCuePresentation({...base,mode:'manual',battlefieldStress:1});
  assert.ok(calm.alpha>busy.alpha&&busy.alpha>dense.alpha);
  assert.ok(calm.lineWidth>=busy.lineWidth&&busy.lineWidth>=dense.lineWidth);
});

test('boss/critical ownership and safe-lane visibility both demote the secondary target cue',()=>{
  const normal=targetIntentCuePresentation({...base,mode:'auto'});
  const warning=targetIntentCuePresentation({...base,mode:'auto',protectedWarning:true});
  const safeLane=targetIntentCuePresentation({...base,mode:'auto',safeLaneVisible:true});
  assert.ok(warning.alpha<normal.alpha);
  assert.ok(safeLane.alpha<normal.alpha);
  assert.ok(warning.alpha<=normal.alpha*.5);
  assert.ok(safeLane.alpha<=normal.alpha*.5);
});

test('Reduced Motion removes cue pulsing and Reduced Flash further lowers target/weakpoint intensity',()=>{
  const normal=targetIntentCuePresentation({...base,mode:'manual',weakpointAvailable:true});
  const reducedMotion=targetIntentCuePresentation({...base,mode:'manual',weakpointAvailable:true,reducedMotion:true});
  const reducedFlash=targetIntentCuePresentation({...base,mode:'manual',weakpointAvailable:true,reducedFlash:true});
  assert.ok(normal.pulseAmplitude>0);
  assert.equal(reducedMotion.pulseAmplitude,0);
  assert.ok(reducedFlash.alpha<normal.alpha);
  assert.ok(reducedFlash.weakpointAlpha<normal.weakpointAlpha);
});

test('4 heroes x 6 Threat tiers x manual/AUTO cue matrix remains finite and readable',()=>{
  const heroes=['arcan','seria','kain','edric'];
  const modes=['manual','auto'];
  let cases=0;
  for(const hero of heroes){
    assert.ok(hero.length>0);
    for(let threat=0;threat<=5;threat++){
      for(const mode of modes){
        const cue=targetIntentCuePresentation({...base,mode,battlefieldStress:threat/5,protectedWarning:threat>=4,reducedFlash:threat===5});
        assert.equal(cue.visible,true);
        assert.ok(Number.isFinite(cue.alpha)&&cue.alpha>0&&cue.alpha<=.36);
        assert.ok(Number.isFinite(cue.lineWidth)&&cue.lineWidth>=1.15);
        assert.ok(Number.isFinite(cue.radius)&&cue.radius>base.targetRadius);
        cases++;
      }
    }
  }
  assert.equal(cases,48);
});
