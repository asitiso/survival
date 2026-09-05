import type { Vec2 } from '../core/math.js';
import { clampMagnitude } from '../core/math.js';
import { auditInputLifecycleResilience } from '../core/input-lifecycle.js';
import { applyJoystickDeadzone } from '../core/touch-controls.js';
import { softFollowJoystickBase, thumbComfortProfile } from '../core/thumb-fatigue.js';
import { joystickNeutralRecoveryProfile, shouldCatchJoystickNeutralReturn } from '../core/joystick-neutral-recovery.js';
import { ACTION_BUTTONS } from './config.js';
import { auditCombatInputReliability } from './combat-input-reliability-audit.js';
import { auditManualTargetStability } from './manual-target-stability-audit.js';
import { auditActionHoldReliability } from './action-hold-reliability-audit.js';
import { landscapeSafeAreaProfile } from './landscape-safe-area.js';
import { resolveFoldableDeadSpace } from './foldable-dead-space.js';

export interface JoystickNeutralRecoveryAudit {
  samples:number;
  cardinalReturnSamples:number;
  diagonalReturnSamples:number;
  reverseSamples:number;
  jitterSamples:number;
  foldableSamples:number;
  invariantSamples:number;
  cardinalReturnPassed:boolean;
  diagonalReturnPassed:boolean;
  reversePassed:boolean;
  jitterPassed:boolean;
  foldablePassed:boolean;
  maxResidualBeforeRecovery:number;
  maxResidualAfterRecovery:number;
  neutralRecoveryGain:number;
  maxReach:number;
  deadzone:number;
  actionCount:number;
  pointerLifecyclePassed:boolean;
  combatInputPassed:boolean;
  manualTargetPassed:boolean;
  holdReliabilityPassed:boolean;
  keyboardMovementMutation:false;
  snapshotSchemaMutation:false;
  issues:string[];
  passed:boolean;
}

interface JoystickModel { home:Vec2;base:Vec2;move:Vec2;caught:boolean; }

function step(model:JoystickModel,pointer:Vec2,recoveryEnabled=true):JoystickModel {
  const comfort=thumbComfortProfile();
  const recovery=joystickNeutralRecoveryProfile(comfort.maxReach);
  if(recoveryEnabled&&shouldCatchJoystickNeutralReturn(model.home,model.base,pointer,recovery)){
    return{home:{...pointer},base:{...pointer},move:{x:0,y:0},caught:true};
  }
  const base=softFollowJoystickBase(model.base,pointer,comfort);
  const raw={x:pointer.x-base.x,y:pointer.y-base.y};
  const normalized=applyJoystickDeadzone(clampMagnitude({x:raw.x/comfort.maxReach,y:raw.y/comfort.maxReach},1));
  return{home:model.home,base,move:normalized,caught:model.caught};
}

function magnitude(v:Vec2):number{return Math.hypot(v.x,v.y);}
function unit(x:number,y:number):Vec2{const d=Math.hypot(x,y)||1;return{x:x/d,y:y/d};}
function shifted(home:Vec2,dir:Vec2,distance:number):Vec2{return{x:home.x+dir.x*distance,y:home.y+dir.y*distance};}
function initial(home:Vec2):JoystickModel{return{home:{...home},base:{...home},move:{x:0,y:0},caught:false};}

function returnCheck(home:Vec2,dir:Vec2):{passed:boolean;baselineResidual:number;recoveredResidual:number}{
  const dragged=step(initial(home),shifted(home,dir,220),true);
  const baseline=step(dragged,home,false);
  const recovered=step(dragged,home,true);
  return{
    passed:dragged.base.x!==home.x||dragged.base.y!==home.y?recovered.caught&&magnitude(recovered.move)===0:false,
    baselineResidual:magnitude(baseline.move),
    recoveredResidual:magnitude(recovered.move),
  };
}

function reverseCheck(dir:Vec2):boolean{
  const home={x:300,y:650};
  let model=step(initial(home),shifted(home,dir,220),true);
  model=step(model,home,true);
  if(!model.caught||magnitude(model.move)!==0)return false;
  const reverse={x:-dir.x,y:-dir.y};
  model=step(model,shifted(home,reverse,70),true);
  return model.move.x*reverse.x+model.move.y*reverse.y>.5;
}

function jitterCheck(offset:Vec2):boolean{
  const home={x:280,y:680};
  let model=step(initial(home),{x:home.x+220,y:home.y},true);
  model=step(model,home,true);
  model=step(model,{x:home.x+offset.x,y:home.y+offset.y},true);
  return magnitude(model.move)===0;
}

function foldableChecks():boolean[]{
  const safe=landscapeSafeAreaProfile(2208,1840);
  if(safe.aspectClass!=='foldable'||!safe.hingeExclusion)return[false,false,false,false];
  const h=safe.hingeExclusion;
  const nearHinge={x:h.x-20,y:620};
  const recovered=resolveFoldableDeadSpace(nearHinge,safe,ACTION_BUTTONS);
  const homes:Vec2[]=[
    recovered.joystickOrigin??{x:safe.joystickMaxX,y:620},
    {x:safe.joystickMinX,y:safe.joystickMinY},
    {x:safe.joystickMinX,y:safe.joystickMaxY},
    {x:safe.joystickMaxX,y:safe.joystickMaxY},
  ];
  const dirs=[unit(-1,0),unit(1,1),unit(1,-1),unit(-1,-1)];
  return homes.map((home,index)=>{
    const check=returnCheck(home,dirs[index]!);
    const hingeOk=index!==0||(recovered.recovered&&recovered.intent==='left'&&Boolean(recovered.joystickOrigin));
    return hingeOk&&check.passed;
  });
}

export function auditJoystickNeutralRecovery():JoystickNeutralRecoveryAudit{
  const cardinals=[unit(1,0),unit(-1,0),unit(0,1),unit(0,-1)].map((dir)=>returnCheck({x:300,y:650},dir));
  const diagonals=[unit(1,1),unit(-1,1),unit(1,-1),unit(-1,-1)].map((dir)=>returnCheck({x:300,y:650},dir));
  const reverses=[unit(1,0),unit(-1,0),unit(0,1),unit(0,-1)].map(reverseCheck);
  const jitters=[{x:8,y:0},{x:-8,y:0},{x:0,y:8},{x:0,y:-8}].map(jitterCheck);
  const foldable=foldableChecks();
  const lifecycle=auditInputLifecycleResilience();
  const combat=auditCombatInputReliability();
  const manual=auditManualTargetStability();
  const hold=auditActionHoldReliability();
  const actionCount=ACTION_BUTTONS.length;
  const invariantChecks=[actionCount===9,lifecycle.passed&&lifecycle.multitouchIsolation,combat.passed,manual.passed,hold.passed];
  const allReturns=[...cardinals,...diagonals];
  const maxResidualBeforeRecovery=Math.max(...allReturns.map((entry)=>entry.baselineResidual));
  const maxResidualAfterRecovery=Math.max(...allReturns.map((entry)=>entry.recoveredResidual));
  const neutralRecoveryGain=maxResidualBeforeRecovery-maxResidualAfterRecovery;
  const cardinalReturnPassed=cardinals.every((entry)=>entry.passed);
  const diagonalReturnPassed=diagonals.every((entry)=>entry.passed);
  const reversePassed=reverses.every(Boolean);
  const jitterPassed=jitters.every(Boolean);
  const foldablePassed=foldable.every(Boolean);
  const issues:string[]=[];
  if(!cardinalReturnPassed)issues.push('cardinal-neutral-return');
  if(!diagonalReturnPassed)issues.push('diagonal-neutral-return');
  if(!reversePassed)issues.push('reverse-direction');
  if(!jitterPassed)issues.push('neutral-jitter');
  if(!foldablePassed)issues.push('foldable-neutral-return');
  if(maxResidualBeforeRecovery<.99||maxResidualAfterRecovery!==0)issues.push('residual-recovery');
  if(!invariantChecks.every(Boolean))issues.push('frozen-invariants');
  const profile=thumbComfortProfile();
  const samples=cardinals.length+diagonals.length+reverses.length+jitters.length+foldable.length+invariantChecks.length;
  return{
    samples,
    cardinalReturnSamples:cardinals.length,
    diagonalReturnSamples:diagonals.length,
    reverseSamples:reverses.length,
    jitterSamples:jitters.length,
    foldableSamples:foldable.length,
    invariantSamples:invariantChecks.length,
    cardinalReturnPassed,
    diagonalReturnPassed,
    reversePassed,
    jitterPassed,
    foldablePassed,
    maxResidualBeforeRecovery,
    maxResidualAfterRecovery,
    neutralRecoveryGain,
    maxReach:profile.maxReach,
    deadzone:.12,
    actionCount,
    pointerLifecyclePassed:lifecycle.passed,
    combatInputPassed:combat.passed,
    manualTargetPassed:manual.passed,
    holdReliabilityPassed:hold.passed,
    keyboardMovementMutation:false,
    snapshotSchemaMutation:false,
    issues,
    passed:issues.length===0,
  };
}
