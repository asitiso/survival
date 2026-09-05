import { ACTION_BUTTONS } from './config.js';
import { combatAttentionPolicy, type CombatAttentionInput, type CombatAttentionPolicy } from './combat-cue-priority.js';

export interface BossCountdownAttentionSample {caseId:string;expected:string|number|boolean;actual:string|number|boolean;passed:boolean;}
export interface BossCountdownAttentionAudit {
  passed:boolean;
  samples:BossCountdownAttentionSample[];
  maxAnimatedPrimaryWarnings:number;
  countdownVisibilityRate:number;
  criticalCountdownMotionAmplitude:number;
  reducedFlashCountdownMotionAmplitude:number;
  staleCountdownReplayCount:number;
  openingPrepDuplicateMotionCount:number;
  reachableActionCount:number;
  snapshotSchemaMutation:false;
  issues:string[];
}
const add=(samples:BossCountdownAttentionSample[],caseId:string,expected:BossCountdownAttentionSample['expected'],actual:BossCountdownAttentionSample['actual'])=>samples.push({caseId,expected,actual,passed:expected===actual});
const policy=(overrides:Partial<CombatAttentionInput>):CombatAttentionPolicy=>combatAttentionPolicy({heroCritical:false,coreCritical:false,damageSeverity:null,bossSpecialTimer:99,bossCountdown:0,reducedFlash:false,...overrides});

export function auditBossCountdownAttention():BossCountdownAttentionAudit{
  const samples:BossCountdownAttentionSample[]=[];
  const precedence:[string,Partial<CombatAttentionInput>,CombatAttentionPolicy['primary']][]=[
    ['hero-over-countdown',{heroCritical:true,bossCountdown:4},'hero-critical'],
    ['core-over-countdown',{coreCritical:true,bossCountdown:4},'core-critical'],
    ['critical-damage-over-countdown',{damageSeverity:'critical',bossCountdown:4},'damage-critical'],
    ['boss-response-over-countdown',{bossSpecialTimer:.4,bossCountdown:4},'boss-response'],
    ['heavy-over-countdown',{damageSeverity:'heavy',bossCountdown:4},'damage-heavy'],
    ['countdown-over-normal',{bossCountdown:4},'boss-countdown'],
    ['normal',{bossCountdown:0},'normal'],
  ];
  for(const [id,input,expected] of precedence)add(samples,`priority-${id}`,expected,policy(input).primary);

  const countdowns=[8,4,1];
  let visible=0;
  let maxAnimatedPrimaryWarnings=0;
  for(const seconds of countdowns){const p=policy({bossCountdown:seconds});if(p.showBossCountdown)visible++;maxAnimatedPrimaryWarnings=Math.max(maxAnimatedPrimaryWarnings,Number(p.bossCountdownAnimated)+Number(p.heroWarningAnimated)+Number(p.coreWarningAnimated));add(samples,`countdown-${seconds}-visible`,true,p.showBossCountdown);}

  let criticalCountdownMotionAmplitude=0;
  for(const [id,input] of [
    ['hero',{heroCritical:true,bossCountdown:4}],
    ['core',{coreCritical:true,bossCountdown:4}],
    ['damage',{damageSeverity:'critical' as const,bossCountdown:4}],
    ['heavy',{damageSeverity:'heavy' as const,bossCountdown:4}],
  ] as const){const p=policy(input);criticalCountdownMotionAmplitude=Math.max(criticalCountdownMotionAmplitude,p.bossCountdownMotionAmplitude);add(samples,`secondary-${id}-steady`,0,p.bossCountdownMotionAmplitude);}

  let reducedFlashCountdownMotionAmplitude=0;
  for(const seconds of [8,1]){const p=policy({bossCountdown:seconds,reducedFlash:true});reducedFlashCountdownMotionAmplitude=Math.max(reducedFlashCountdownMotionAmplitude,p.bossCountdownMotionAmplitude);add(samples,`reduced-${seconds}-steady`,0,p.bossCountdownMotionAmplitude);}

  const prepPrimary=policy({bossCountdown:8});
  const prepCritical=policy({heroCritical:true,bossCountdown:8});
  const openingPrepDuplicateMotionCount=Number(prepPrimary.openingPrepAnimated&&prepPrimary.bossCountdownAnimated)+Number(prepCritical.openingPrepAnimated);
  add(samples,'prep-primary-steady',false,prepPrimary.openingPrepAnimated);
  add(samples,'prep-critical-steady',false,prepCritical.openingPrepAnimated);

  const spawned=policy({bossCountdown:0});
  const special=policy({bossCountdown:0,bossSpecialTimer:.4});
  const nextCycle=policy({bossCountdown:8,bossSpecialTimer:99});
  const staleCountdownReplayCount=Number(spawned.showBossCountdown||spawned.bossCountdownAnimated)+Number(special.showBossCountdown||special.bossCountdownAnimated);
  add(samples,'spawn-clears-countdown',false,spawned.showBossCountdown);
  add(samples,'special-takes-over','boss-response',special.primary);
  add(samples,'next-cycle-clean','boss-countdown',nextCycle.primary);

  add(samples,'animated-primary-bound',true,maxAnimatedPrimaryWarnings<=1);
  add(samples,'critical-countdown-motion',0,criticalCountdownMotionAmplitude);
  add(samples,'reduced-countdown-motion',0,reducedFlashCountdownMotionAmplitude);
  add(samples,'action-count',9,ACTION_BUTTONS.length);

  const countdownVisibilityRate=visible/countdowns.length;
  const issues:string[]=[];
  if(samples.length!==25)issues.push('sample-count');
  if(maxAnimatedPrimaryWarnings>1)issues.push('multiple-primary-warning-motion');
  if(countdownVisibilityRate!==1)issues.push('countdown-hidden');
  if(criticalCountdownMotionAmplitude!==0)issues.push('critical-countdown-motion');
  if(reducedFlashCountdownMotionAmplitude!==0)issues.push('reduced-flash-countdown-motion');
  if(staleCountdownReplayCount!==0)issues.push('stale-countdown-replay');
  if(openingPrepDuplicateMotionCount!==0)issues.push('opening-prep-duplicate-motion');
  if(ACTION_BUTTONS.length!==9)issues.push('action-count');
  if(samples.some((sample)=>!sample.passed))issues.push('sample-failure');
  return{passed:issues.length===0,samples,maxAnimatedPrimaryWarnings,countdownVisibilityRate,criticalCountdownMotionAmplitude,reducedFlashCountdownMotionAmplitude,staleCountdownReplayCount,openingPrepDuplicateMotionCount,reachableActionCount:ACTION_BUTTONS.length,snapshotSchemaMutation:false,issues};
}
