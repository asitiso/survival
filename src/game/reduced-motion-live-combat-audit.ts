import { ACTION_BUTTONS } from './config.js';
import {
  combatAttentionPolicy,
  targetGuidanceMotionPolicy,
  secondaryCombatMotionPolicy,
  residualCombatMotionPolicy,
  type SecondaryCombatMotionOwner,
  type ResidualCombatMotionOwner,
} from './combat-cue-priority.js';
import { objectiveMarkerMotionPolicy } from './tactical-status-attention.js';
import { actionCuePresentation } from './hud-presentation.js';
import { bossPressureEnvelope } from './visual-presence.js';

export interface ReducedMotionLiveCombatSample {
  feature:string;
  context:string;
  motionAmplitude:number;
  visible:boolean;
  passed:boolean;
}

export interface ReducedMotionLiveCombatAudit {
  samples:ReducedMotionLiveCombatSample[];
  reducedMotionMaxAmplitude:number;
  flashOnlyMotionPreserved:boolean;
  steadyVisibilityRate:number;
  secondaryOwnerCoverage:number;
  residualOwnerCoverage:number;
  actionCount:number;
  snapshotSchemaMutation:false;
  issues:string[];
  passed:boolean;
}

type SettingsCase={name:string;reducedFlash:boolean;reducedMotion:boolean};
const SETTINGS:readonly SettingsCase[]=[
  {name:'normal',reducedFlash:false,reducedMotion:false},
  {name:'flash-low-motion-on',reducedFlash:true,reducedMotion:false},
  {name:'flash-on-motion-low',reducedFlash:false,reducedMotion:true},
  {name:'flash-low-motion-low',reducedFlash:true,reducedMotion:true},
];

const motionExpected=(settings:SettingsCase)=>!settings.reducedMotion;
const add=(samples:ReducedMotionLiveCombatSample[],feature:string,settings:SettingsCase,motionAmplitude:number,visible:boolean,shouldMove:boolean)=>{
  const moving=motionAmplitude>0;
  samples.push({feature,context:settings.name,motionAmplitude,visible,passed:visible&&moving===shouldMove});
};

export function auditReducedMotionLiveCombat():ReducedMotionLiveCombatAudit{
  const samples:ReducedMotionLiveCombatSample[]=[];

  for(const settings of SETTINGS){
    const hero=combatAttentionPolicy({heroCritical:true,coreCritical:false,damageSeverity:null,bossSpecialTimer:99,bossCountdown:0,...settings});
    add(samples,'hero-critical',settings,hero.criticalMotionAmplitude,hero.showHeroWarning,motionExpected(settings));

    const core=combatAttentionPolicy({heroCritical:false,coreCritical:true,damageSeverity:null,bossSpecialTimer:99,bossCountdown:0,...settings});
    add(samples,'core-critical',settings,core.criticalMotionAmplitude,core.showCoreWarning,motionExpected(settings));

    const criticalDamage=combatAttentionPolicy({heroCritical:false,coreCritical:false,damageSeverity:'critical',bossSpecialTimer:99,bossCountdown:0,...settings});
    add(samples,'damage-critical',settings,0,criticalDamage.primary==='damage-critical',false);

    const heavyDamage=combatAttentionPolicy({heroCritical:false,coreCritical:false,damageSeverity:'heavy',bossSpecialTimer:99,bossCountdown:0,...settings});
    add(samples,'damage-heavy',settings,0,heavyDamage.primary==='damage-heavy',false);

    const response=combatAttentionPolicy({heroCritical:false,coreCritical:false,damageSeverity:null,bossSpecialTimer:.4,bossCountdown:0,...settings});
    add(samples,'boss-response-primary',settings,0,response.primary==='boss-response'&&response.showBossAssistRing,false);

    const countdown=combatAttentionPolicy({heroCritical:false,coreCritical:false,damageSeverity:null,bossSpecialTimer:99,bossCountdown:4,...settings});
    add(samples,'boss-countdown',settings,countdown.bossCountdownMotionAmplitude,countdown.showBossCountdown,motionExpected(settings));

    const prep=combatAttentionPolicy({heroCritical:false,coreCritical:false,damageSeverity:null,bossSpecialTimer:99,bossCountdown:10,...settings});
    add(samples,'opening-prep',settings,prep.openingPrepAnimated?.05:0,prep.showOpeningPrepLabel,motionExpected(settings));

    const auto=targetGuidanceMotionPolicy({combatPrimary:'normal',hasWeakpoint:false,hasAutoTarget:true,...settings});
    add(samples,'auto-target',settings,auto.autoTargetMotionAmplitude,true,motionExpected(settings));

    const weak=targetGuidanceMotionPolicy({combatPrimary:'normal',hasWeakpoint:true,hasAutoTarget:true,...settings});
    add(samples,'weakpoint',settings,weak.weakpointMotionAmplitude,true,motionExpected(settings));

    const objective=objectiveMarkerMotionPolicy({combatPrimary:'normal',active:true,...settings});
    add(samples,'objective',settings,objective.motionAmplitude,true,motionExpected(settings));

    const secondary=secondaryCombatMotionPolicy({combatPrimary:'normal',hasBossHazard:true,hasPriorityThreat:true,hasSupplyCrate:true,hasFieldNode:true,hasFreezeStatus:true,coreVisible:true,...settings});
    const secondaryAmp=Math.max(secondary.bossHazardMotionAmplitude,secondary.priorityThreatMotionAmplitude,secondary.supplyCrateMotionAmplitude,secondary.fieldNodeMotionAmplitude,secondary.freezeStatusMotionAmplitude,secondary.coreAmbientMotionAmplitude);
    add(samples,'secondary-policy',settings,secondaryAmp,true,motionExpected(settings));

    const residual=residualCombatMotionPolicy({combatPrimary:'normal',secondaryOwner:'none',hasBlackHole:true,hasTerrainCrystal:true,hasGoldenEnemy:true,hasBomber:true,finalFormFlowActive:true,...settings});
    const residualAmp=Math.max(residual.blackHoleMotionAmplitude,residual.terrainCrystalMotionAmplitude,residual.goldenEnemyMotionAmplitude,residual.bomberBodyMotionAmplitude,residual.finalFormFlowMotionAmplitude);
    add(samples,'residual-policy',settings,residualAmp,true,motionExpected(settings));

    const assist=actionCuePresentation({assistActive:true,queued:false,readyPulseRequested:false,readyPulseActive:false,...settings});
    add(samples,'boss-assist',settings,assist.motionAmplitude,assist.outerCue==='assist'&&assist.showAssistLabel,motionExpected(settings));

    const ready=actionCuePresentation({assistActive:false,queued:false,readyPulseRequested:true,readyPulseActive:true,...settings});
    add(samples,'ultimate-ready',settings,ready.motionAmplitude,ready.outerCue==='ready',motionExpected(settings));

    const pressureA=bossPressureEnvelope('timeEater',.18,.1,'high',settings.reducedFlash,settings.reducedMotion);
    const pressureB=bossPressureEnvelope('timeEater',.18,.3,'high',settings.reducedFlash,settings.reducedMotion);
    const pressureAmp=Math.max(Math.abs(pressureA.edgeScale-pressureB.edgeScale),Math.abs(pressureA.glowScale-pressureB.glowScale),Math.abs(pressureA.lineWidthScale-pressureB.lineWidthScale));
    add(samples,'boss-pressure',settings,pressureAmp,pressureA.edgeScale>0&&pressureA.glowScale>0,motionExpected(settings));
  }

  const secondaryOwners:readonly Exclude<SecondaryCombatMotionOwner,'none'>[]=['boss-hazard','priority-threat','supply-crate','field-node','freeze-status','core-ambient'];
  const secondaryAmplitudes=(owner:Exclude<SecondaryCombatMotionOwner,'none'>,reducedMotion:boolean)=>{
    const p=secondaryCombatMotionPolicy({combatPrimary:'normal',reducedFlash:false,reducedMotion,hasBossHazard:owner==='boss-hazard',hasPriorityThreat:owner==='priority-threat',hasSupplyCrate:owner==='supply-crate',hasFieldNode:owner==='field-node',hasFreezeStatus:owner==='freeze-status',coreVisible:owner==='core-ambient'});
    return Math.max(p.bossHazardMotionAmplitude,p.priorityThreatMotionAmplitude,p.supplyCrateMotionAmplitude,p.fieldNodeMotionAmplitude,p.freezeStatusMotionAmplitude,p.coreAmbientMotionAmplitude);
  };
  for(const owner of secondaryOwners){
    const normalSettings:SettingsCase={name:'owner-motion-on',reducedFlash:false,reducedMotion:false};
    add(samples,`secondary-${owner}`,normalSettings,secondaryAmplitudes(owner,false),true,true);
  }
  for(const owner of secondaryOwners){
    const reducedSettings:SettingsCase={name:'owner-motion-low',reducedFlash:false,reducedMotion:true};
    add(samples,`secondary-${owner}`,reducedSettings,secondaryAmplitudes(owner,true),true,false);
  }

  const residualOwners:readonly Exclude<ResidualCombatMotionOwner,'none'>[]=['black-hole-vortex','terrain-crystal','golden-enemy','bomber-body','final-form-flow'];
  const residualAmplitude=(owner:Exclude<ResidualCombatMotionOwner,'none'>,reducedMotion:boolean)=>{
    const p=residualCombatMotionPolicy({combatPrimary:'normal',reducedFlash:false,reducedMotion,secondaryOwner:'none',hasBlackHole:owner==='black-hole-vortex',hasTerrainCrystal:owner==='terrain-crystal',hasGoldenEnemy:owner==='golden-enemy',hasBomber:owner==='bomber-body',finalFormFlowActive:owner==='final-form-flow'});
    return Math.max(p.blackHoleMotionAmplitude,p.terrainCrystalMotionAmplitude,p.goldenEnemyMotionAmplitude,p.bomberBodyMotionAmplitude,p.finalFormFlowMotionAmplitude);
  };
  for(const owner of residualOwners){
    const normalSettings:SettingsCase={name:'owner-motion-on',reducedFlash:false,reducedMotion:false};
    add(samples,`residual-${owner}`,normalSettings,residualAmplitude(owner,false),true,true);
  }
  for(const owner of ['black-hole-vortex','terrain-crystal','final-form-flow'] as const){
    const reducedSettings:SettingsCase={name:'owner-motion-low',reducedFlash:false,reducedMotion:true};
    add(samples,`residual-${owner}`,reducedSettings,residualAmplitude(owner,true),true,false);
  }

  const reducedSamples=samples.filter((sample)=>sample.context.includes('motion-low'));
  const reducedMotionMaxAmplitude=Math.max(0,...reducedSamples.map((sample)=>sample.motionAmplitude));
  const flashOnlyMotionFeatures=['hero-critical','core-critical','boss-countdown','opening-prep','auto-target','weakpoint','objective','secondary-policy','residual-policy','boss-assist','ultimate-ready','boss-pressure'];
  const flashOnly=samples.filter((sample)=>sample.context==='flash-low-motion-on'&&flashOnlyMotionFeatures.includes(sample.feature));
  const flashOnlyMotionPreserved=flashOnly.length===flashOnlyMotionFeatures.length&&flashOnly.every((sample)=>sample.motionAmplitude>0);
  const steadyVisibilityRate=reducedSamples.length===0?1:reducedSamples.filter((sample)=>sample.visible).length/reducedSamples.length;
  const secondaryOwnerCoverage=secondaryOwners.filter((owner)=>secondaryAmplitudes(owner,false)>0&&secondaryAmplitudes(owner,true)===0).length/secondaryOwners.length;
  const residualOwnerCoverage=residualOwners.filter((owner)=>residualAmplitude(owner,false)>0).length/residualOwners.length;
  const actionCount=ACTION_BUTTONS.length;
  const issues:string[]=[];
  if(samples.length!==80)issues.push(`samples:${samples.length}`);
  if(samples.some((sample)=>!sample.passed))issues.push('sample-policy');
  if(reducedMotionMaxAmplitude!==0)issues.push(`motion-low:${reducedMotionMaxAmplitude}`);
  if(!flashOnlyMotionPreserved)issues.push('flash-motion-independence');
  if(steadyVisibilityRate!==1)issues.push(`visibility:${steadyVisibilityRate}`);
  if(secondaryOwnerCoverage!==1)issues.push(`secondary:${secondaryOwnerCoverage}`);
  if(residualOwnerCoverage!==1)issues.push(`residual:${residualOwnerCoverage}`);
  if(actionCount!==9)issues.push(`actions:${actionCount}`);
  return{samples,reducedMotionMaxAmplitude,flashOnlyMotionPreserved,steadyVisibilityRate,secondaryOwnerCoverage,residualOwnerCoverage,actionCount,snapshotSchemaMutation:false,issues,passed:issues.length===0};
}
