import { ACTION_BUTTONS } from './config.js';
import { residualCombatMotionPolicy, type CombatAttentionPrimary, type ResidualCombatMotionInput, type ResidualCombatMotionOwner } from './combat-cue-priority.js';
import { screenEffectScale } from './presentation-runtime.js';

export interface ResidualCombatMotionAuditSample {
  feature:string;
  context:string;
  animatedOwners:number;
  maxAmplitude:number;
  passed:boolean;
}

export interface ResidualCombatMotionAudit {
  samples:ResidualCombatMotionAuditSample[];
  maxAnimatedResidualOwners:number;
  reducedFlashMotionAmplitude:number;
  suppressedCombatMotionAmplitude:number;
  screenEffectReducedFlashScaleDelta:number;
  actionCount:number;
  snapshotSchemaMutation:false;
  issues:string[];
  passed:boolean;
}

const FEATURES:readonly Exclude<ResidualCombatMotionOwner,'none'>[]=[
  'black-hole-vortex','terrain-crystal','golden-enemy','bomber-body','final-form-flow',
];
const CONTEXTS:readonly {name:string;combatPrimary:CombatAttentionPrimary;reducedFlash:boolean;secondaryOwner:ResidualCombatMotionInput['secondaryOwner']}[]=[
  {name:'normal',combatPrimary:'normal',reducedFlash:false,secondaryOwner:'none'},
  {name:'reduced-flash',combatPrimary:'normal',reducedFlash:true,secondaryOwner:'none'},
  {name:'hero-critical',combatPrimary:'hero-critical',reducedFlash:false,secondaryOwner:'none'},
  {name:'core-critical',combatPrimary:'core-critical',reducedFlash:false,secondaryOwner:'none'},
  {name:'damage-critical',combatPrimary:'damage-critical',reducedFlash:false,secondaryOwner:'none'},
  {name:'boss-response',combatPrimary:'boss-response',reducedFlash:false,secondaryOwner:'none'},
  {name:'damage-heavy',combatPrimary:'damage-heavy',reducedFlash:false,secondaryOwner:'none'},
  {name:'secondary-field-node',combatPrimary:'normal',reducedFlash:false,secondaryOwner:'field-node'},
];
function inputFor(feature:Exclude<ResidualCombatMotionOwner,'none'>,context:(typeof CONTEXTS)[number]):ResidualCombatMotionInput{
  return{
    combatPrimary:context.combatPrimary,reducedFlash:context.reducedFlash,secondaryOwner:context.secondaryOwner,
    hasBlackHole:feature==='black-hole-vortex',hasTerrainCrystal:feature==='terrain-crystal',hasGoldenEnemy:feature==='golden-enemy',
    hasBomber:feature==='bomber-body',finalFormFlowActive:feature==='final-form-flow',
  };
}
function amplitudes(p:ReturnType<typeof residualCombatMotionPolicy>):number[]{
  return[p.blackHoleMotionAmplitude,p.terrainCrystalMotionAmplitude,p.goldenEnemyMotionAmplitude,p.bomberBodyMotionAmplitude,p.finalFormFlowMotionAmplitude];
}

export function auditResidualCombatMotion():ResidualCombatMotionAudit{
  const samples:ResidualCombatMotionAuditSample[]=[];
  for(const feature of FEATURES){
    for(const context of CONTEXTS){
      const p=residualCombatMotionPolicy(inputFor(feature,context));
      const values=amplitudes(p); const animatedOwners=values.filter((v)=>v>0).length; const maxAmplitude=Math.max(0,...values);
      const expected=context.name==='normal'?feature:'none';
      samples.push({feature,context:context.name,animatedOwners,maxAmplitude,passed:p.owner===expected&&animatedOwners<=(expected==='none'?0:1)});
    }
  }
  for(const kind of ['shockwave','pulse'] as const){
    for(const progress of [0,.33,.66,1]){
      const scale=screenEffectScale(kind,progress,true);
      samples.push({feature:`screen-${kind}`,context:`reduced-${progress}`,animatedOwners:0,maxAmplitude:Math.abs(scale-1),passed:scale===1});
    }
  }
  const maxAnimatedResidualOwners=Math.max(0,...samples.map((s)=>s.animatedOwners));
  const reducedFlashMotionAmplitude=Math.max(0,...samples.filter((s)=>s.context==='reduced-flash').map((s)=>s.maxAmplitude));
  const suppressedCombatMotionAmplitude=Math.max(0,...samples.filter((s)=>['hero-critical','core-critical','damage-critical','boss-response','damage-heavy','secondary-field-node'].includes(s.context)).map((s)=>s.maxAmplitude));
  const reducedScales=['shockwave','pulse','glow'].flatMap((kind)=>[0,.25,.5,.75,1].map((progress)=>screenEffectScale(kind as 'shockwave'|'pulse'|'glow',progress,true)));
  const screenEffectReducedFlashScaleDelta=Math.max(...reducedScales)-Math.min(...reducedScales);
  const actionCount=ACTION_BUTTONS.length;
  const issues:string[]=[];
  if(samples.length!==48)issues.push(`samples:${samples.length}`);
  if(samples.some((s)=>!s.passed))issues.push('sample-policy');
  if(maxAnimatedResidualOwners>1)issues.push(`owners:${maxAnimatedResidualOwners}`);
  if(reducedFlashMotionAmplitude!==0)issues.push(`reduced:${reducedFlashMotionAmplitude}`);
  if(suppressedCombatMotionAmplitude!==0)issues.push(`suppressed:${suppressedCombatMotionAmplitude}`);
  if(screenEffectReducedFlashScaleDelta!==0)issues.push(`screen-scale:${screenEffectReducedFlashScaleDelta}`);
  if(actionCount!==9)issues.push(`actions:${actionCount}`);
  return{samples,maxAnimatedResidualOwners,reducedFlashMotionAmplitude,suppressedCombatMotionAmplitude,screenEffectReducedFlashScaleDelta,actionCount,snapshotSchemaMutation:false,issues,passed:issues.length===0};
}
