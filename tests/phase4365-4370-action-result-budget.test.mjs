import test from 'node:test';
import assert from 'node:assert/strict';
import { actionResultPresentation } from '../dist/game/action-result-readability.js';

const base={kind:'weakpointBreak',battlefieldStress:0,protectedWarning:false,safeLaneVisible:false,reducedMotion:false,reducedFlash:false,sourceDistance:180};

test('Phase 4365-4370 result confirmation yields to density, protected warnings and safe-lane ownership',()=>{
  const calm=actionResultPresentation(base);
  const dense=actionResultPresentation({...base,battlefieldStress:1});
  const warning=actionResultPresentation({...base,protectedWarning:true});
  const safeLane=actionResultPresentation({...base,safeLaneVisible:true});
  assert.ok(calm.alpha>dense.alpha,'dense battle must lower resolved-result alpha');
  assert.ok(calm.lineWidth>dense.lineWidth,'dense battle must thin resolved-result strokes');
  assert.ok(warning.alpha<calm.alpha,'critical/boss warnings must own visual priority');
  assert.ok(safeLane.alpha<calm.alpha,'safe-lane guidance must own visual priority');
  assert.ok(warning.connectorAlpha<calm.connectorAlpha);
});

test('Reduced Motion removes result pulse while Reduced Flash lowers flash-bearing intensity',()=>{
  const normal=actionResultPresentation({...base,kind:'bossStagger'});
  const reducedMotion=actionResultPresentation({...base,kind:'bossStagger',reducedMotion:true});
  const reducedFlash=actionResultPresentation({...base,kind:'bossStagger',reducedFlash:true});
  assert.ok(normal.pulseAmplitude>0);
  assert.equal(reducedMotion.pulseAmplitude,0);
  assert.ok(reducedFlash.alpha<normal.alpha);
  assert.ok(reducedFlash.rayCount<normal.rayCount);
  assert.ok(reducedFlash.connectorAlpha<=normal.connectorAlpha);
});

test('resolved breaks, staggers and kills remain visible even at maximum battlefield pressure',()=>{
  for(const kind of ['guardBreak','weakpointBreak','bossStagger','enemyKill']){
    const cue=actionResultPresentation({kind,battlefieldStress:1,protectedWarning:true,safeLaneVisible:true,reducedMotion:true,reducedFlash:true,sourceDistance:200});
    assert.equal(cue.visible,true,`${kind} must remain available`);
    assert.ok(cue.alpha>=0.055,`${kind} must retain a readable minimum alpha`);
    assert.ok(cue.radius>=18);
    assert.ok(Number.isFinite(cue.lineWidth)&&cue.lineWidth>0);
  }
});

test('4 heroes x 6 Threat tiers x manual/AUTO conditions keep meaningful result presentation finite',()=>{
  const heroes=['arkan','seria','kain','edric'];
  const controls=['manual','auto'];
  let cases=0;
  for(const hero of heroes){
    for(let threat=0;threat<=5;threat++){
      for(const control of controls){
        const cue=actionResultPresentation({
          kind:threat>=4?'bossStagger':'weakpointBreak',
          battlefieldStress:threat/5,
          protectedWarning:threat>=5,
          safeLaneVisible:threat>=3&&hero==='edric',
          reducedMotion:control==='manual'&&hero==='seria',
          reducedFlash:control==='auto'&&hero==='kain',
          sourceDistance:70+threat*24,
        });
        for(const value of [cue.alpha,cue.radius,cue.lineWidth,cue.connectorAlpha,cue.pulseAmplitude]) assert.ok(Number.isFinite(value));
        assert.equal(cue.visible,true);
        assert.ok(cue.alpha>0);
        cases++;
      }
    }
  }
  assert.equal(cases,48);
});
