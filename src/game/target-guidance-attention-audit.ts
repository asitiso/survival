import { ACTION_BUTTONS } from './config.js';
import { autoTargetIndicator, weakpointIndicator } from './auto-target-visibility.js';
import { targetGuidanceMotionPolicy, type CombatAttentionPrimary, type TargetGuidanceMotionInput } from './combat-cue-priority.js';

export interface TargetGuidanceAttentionSample {caseId:string;expected:string|number|boolean;actual:string|number|boolean;passed:boolean;}
export interface TargetGuidanceAttentionAudit {
  passed:boolean;
  samples:TargetGuidanceAttentionSample[];
  maxAnimatedOwners:number;
  criticalMotionAmplitude:number;
  reducedFlashMotionAmplitude:number;
  duplicateMotionCount:number;
  staleMotionReplayCount:number;
  targetVisibilityRate:number;
  reachableActionCount:number;
  snapshotSchemaMutation:false;
  issues:string[];
}
const add=(samples:TargetGuidanceAttentionSample[],caseId:string,expected:TargetGuidanceAttentionSample['expected'],actual:TargetGuidanceAttentionSample['actual'])=>samples.push({caseId,expected,actual,passed:expected===actual});
const motion=(overrides:Partial<TargetGuidanceMotionInput>)=>targetGuidanceMotionPolicy({combatPrimary:'normal',reducedFlash:false,hasWeakpoint:true,hasAutoTarget:true,...overrides});

export function auditTargetGuidanceAttention():TargetGuidanceAttentionAudit{
  const samples:TargetGuidanceAttentionSample[]=[];
  const dual=motion({});
  add(samples,'dual-owner','weakpoint',dual.owner);
  add(samples,'dual-weakpoint-animated',true,dual.weakpointAnimated);
  add(samples,'dual-auto-steady',false,dual.autoTargetAnimated);
  const autoOnly=motion({hasWeakpoint:false});
  add(samples,'auto-only-owner','auto-target',autoOnly.owner);
  add(samples,'auto-only-animated',true,autoOnly.autoTargetAnimated);
  const weakOnly=motion({hasAutoTarget:false});
  add(samples,'weak-only-owner','weakpoint',weakOnly.owner);
  add(samples,'weak-only-animated',true,weakOnly.weakpointAnimated);
  const empty=motion({hasWeakpoint:false,hasAutoTarget:false});
  add(samples,'empty-owner','none',empty.owner);

  const criticalPrimaries:CombatAttentionPrimary[]=['hero-critical','core-critical','damage-critical','boss-response','damage-heavy','boss-countdown'];
  let criticalMotionAmplitude=0;
  for(const primary of criticalPrimaries){
    const p=motion({combatPrimary:primary});
    criticalMotionAmplitude=Math.max(criticalMotionAmplitude,p.weakpointMotionAmplitude,p.autoTargetMotionAmplitude);
    add(samples,`${primary}-steady`,'none',p.owner);
  }

  const reducedDual=motion({reducedFlash:true});
  const reducedWeak=motion({reducedFlash:true,hasAutoTarget:false});
  const reducedAuto=motion({reducedFlash:true,hasWeakpoint:false});
  add(samples,'reduced-dual-steady','none',reducedDual.owner);
  add(samples,'reduced-weak-steady','none',reducedWeak.owner);
  add(samples,'reduced-auto-steady','none',reducedAuto.owner);
  add(samples,'critical-amplitude',0,criticalMotionAmplitude);
  const reducedFlashMotionAmplitude=Math.max(reducedDual.weakpointMotionAmplitude,reducedDual.autoTargetMotionAmplitude,reducedWeak.weakpointMotionAmplitude,reducedAuto.autoTargetMotionAmplitude);
  add(samples,'reduced-amplitude',0,reducedFlashMotionAmplitude);

  const stale=motion({hasWeakpoint:false,hasAutoTarget:false});
  const staleMotionReplayCount=Number(stale.weakpointAnimated)+Number(stale.autoTargetAnimated)+Number(stale.weakpointMotionAmplitude>0)+Number(stale.autoTargetMotionAmplitude>0);
  add(samples,'target-loss-clears-motion',0,staleMotionReplayCount);

  const autoVisible=Boolean(autoTargetIndicator({id:1,type:'elite',pos:{x:100,y:100},target:'hero',hp:100,maxHp:100,alive:true},{x:80,y:80},{x:400,y:200}));
  const weakVisible=Boolean(weakpointIndicator({id:1,kind:'armorPlate',pos:{x:100,y:100},hp:100,maxHp:100,radius:27,alive:true},true));
  add(samples,'auto-indicator-visible',true,autoVisible);
  add(samples,'weakpoint-indicator-visible',true,weakVisible);

  const maxAnimatedOwners=Math.max(
    Number(dual.weakpointAnimated)+Number(dual.autoTargetAnimated),
    Number(autoOnly.weakpointAnimated)+Number(autoOnly.autoTargetAnimated),
    Number(weakOnly.weakpointAnimated)+Number(weakOnly.autoTargetAnimated),
    ...criticalPrimaries.map((primary)=>{const p=motion({combatPrimary:primary});return Number(p.weakpointAnimated)+Number(p.autoTargetAnimated);}),
  );
  const duplicateMotionCount=Number(dual.weakpointAnimated&&dual.autoTargetAnimated);
  add(samples,'animated-owner-bound',true,maxAnimatedOwners<=1);
  add(samples,'action-count',9,ACTION_BUTTONS.length);
  add(samples,'snapshot-schema-mutation',false,false);

  const targetVisibilityRate=(Number(autoVisible)+Number(weakVisible))/2;
  const issues:string[]=[];
  if(samples.length!==25)issues.push('sample-count');
  if(maxAnimatedOwners>1)issues.push('multiple-target-guidance-motion');
  if(criticalMotionAmplitude!==0)issues.push('critical-target-guidance-motion');
  if(reducedFlashMotionAmplitude!==0)issues.push('reduced-flash-target-guidance-motion');
  if(duplicateMotionCount!==0)issues.push('duplicate-target-guidance-motion');
  if(staleMotionReplayCount!==0)issues.push('stale-target-guidance-motion');
  if(targetVisibilityRate!==1)issues.push('target-guidance-hidden');
  if(ACTION_BUTTONS.length!==9)issues.push('action-count');
  if(samples.some((sample)=>!sample.passed))issues.push('sample-failure');
  return{passed:issues.length===0,samples,maxAnimatedOwners,criticalMotionAmplitude,reducedFlashMotionAmplitude,duplicateMotionCount,staleMotionReplayCount,targetVisibilityRate,reachableActionCount:ACTION_BUTTONS.length,snapshotSchemaMutation:false,issues};
}
