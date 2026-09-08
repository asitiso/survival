import test from 'node:test';
import assert from 'node:assert/strict';
import * as feedbackModule from '../dist/game/combat-feedback.js';
import fs from 'node:fs';

const feedbackSource=fs.readFileSync(new URL('../src/game/combat-feedback.ts',import.meta.url),'utf8');
const enemySource=fs.readFileSync(new URL('../src/game/enemies.ts',import.meta.url),'utf8');

test('phase 4485 exports commander aura presentation with a wide source boundary and target connector',()=>{
  assert.equal(typeof feedbackModule.commanderAuraPresentation,'function');
  const visual=feedbackModule.commanderAuraPresentation({battlefieldStress:0,priorityTarget:false});
  assert.ok(visual.boundaryRadius>=190);
  assert.ok(visual.connectorAlpha>0);
  assert.ok(visual.chevronAlpha>0);
});

test('phase 4486 reduced motion removes commander direction pulse and reduced flash lowers alpha',()=>{
  assert.equal(typeof feedbackModule.commanderAuraPresentation,'function');
  const normal=feedbackModule.commanderAuraPresentation({battlefieldStress:.2,priorityTarget:true});
  const reduced=feedbackModule.commanderAuraPresentation({battlefieldStress:.2,priorityTarget:true,reducedMotion:true,reducedFlash:true});
  assert.equal(reduced.pulse,0);
  assert.ok(reduced.connectorAlpha<normal.connectorAlpha);
  assert.ok(reduced.boundaryAlpha<normal.boundaryAlpha);
});

test('phase 4487 combat feedback keeps commander aura cues bounded and refreshes owner-target pairs',()=>{
  const feedback=new feedbackModule.CombatFeedbackSystem();
  assert.equal(typeof feedback.addCommanderAuraResponse,'function');
  feedback.addCommanderAuraResponse({x:100,y:100},{x:180,y:100},1,20,'grunt','hero');
  feedback.addCommanderAuraResponse({x:101,y:100},{x:181,y:100},1,20,'grunt','hero');
  assert.equal(feedback.commanderAuraCount,1);
  for(let i=0;i<30;i++)feedback.addCommanderAuraResponse({x:100,y:100},{x:220+i,y:120},1,100+i,'grunt','hero');
  assert.ok(feedback.commanderAuraCount<=20);
});

test('phase 4488 command aura gameplay owner feeds source and target into commander presentation',()=>{
  assert.match(enemySource,/addCommanderAuraResponse\?\.\(candidate\.pos,enemy\.pos,candidate\.id,enemy\.id,enemy\.type,enemy\.target\)/);
});

test('phase 4489 commander rendering includes source boundary, connector, and target chevron canvas paths',()=>{
  assert.match(feedbackSource,/commanderAuraCues/);
  assert.match(feedbackSource,/boundaryRadius/);
  assert.match(feedbackSource,/connectorAlpha/);
  assert.match(feedbackSource,/chevronAlpha/);
});
