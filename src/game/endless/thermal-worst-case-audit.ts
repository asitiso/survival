import { longRunComfortPolicy } from './long-run-comfort.js';
import { mobileFrameGovernorPolicy } from './mobile-frame-governor.js';
import { thermalBudgetPolicy, type ThermalTier } from './thermal-budget-director.js';
import { thermalPolicyForEffectiveTier } from './thermal-recovery-hysteresis.js';
import type { DeviceClass } from './types.js';

export interface ThermalWorstCaseCheckpoint {
  deviceClass:DeviceClass;
  hours:number;
  thermalTier:ThermalTier;
  particleCap:number;
  trailCap:number;
  telegraphCap:number;
  visualDensity:number;
  projectileVisualDensity:number;
  audioVoiceMultiplier:number;
  enemyLogicMultiplier:number;
}
export interface ThermalWorstCaseAudit {
  checkpoints:ThermalWorstCaseCheckpoint[];
  logicPreserved:boolean;
  telegraphsPreserved:boolean;
  vfxBudgetsBounded:boolean;
  longRunDegradesPresentationFirst:boolean;
  passed:boolean;
}
const DEVICES=['low','mid','high'] as const satisfies readonly DeviceClass[];
const HOURS=[2,8,12] as const;
const FPS:Record<DeviceClass,number>={low:26,mid:32,high:38};
function round(value:number):number{return Math.round(value*10000)/10000;}

export function thermalWorstCaseCheckpoints():ThermalWorstCaseCheckpoint[]{
  const governor=mobileFrameGovernorPolicy('minimal');
  const checkpoints:ThermalWorstCaseCheckpoint[]=[];
  for(const deviceClass of DEVICES){
    for(const hours of HOURS){
      const elapsedSeconds=hours*3600;
      const comfort=longRunComfortPolicy(elapsedSeconds);
      const desired=thermalBudgetPolicy({elapsedSeconds,fps:FPS[deviceClass],adaptivePressure:.95,frameGovernorTier:'minimal',deviceClass});
      const thermal=thermalPolicyForEffectiveTier(desired,'hot');
      checkpoints.push({
        deviceClass,
        hours,
        thermalTier:thermal.tier,
        particleCap:Math.max(48,Math.round(governor.particleCap*comfort.vfxDensity*thermal.particleCapMultiplier)),
        trailCap:Math.max(20,Math.round(governor.trailCap*comfort.vfxDensity*thermal.trailCapMultiplier)),
        telegraphCap:governor.telegraphCap,
        visualDensity:round(governor.visualDensity*comfort.vfxDensity*thermal.visualDensityMultiplier),
        projectileVisualDensity:round(governor.projectileVisualDensity*comfort.vfxDensity*thermal.visualDensityMultiplier),
        audioVoiceMultiplier:thermal.audioVoiceMultiplier,
        enemyLogicMultiplier:thermal.enemyLogicMultiplier,
      });
    }
  }
  return checkpoints;
}
export function auditThermalWorstCase():ThermalWorstCaseAudit{
  const checkpoints=thermalWorstCaseCheckpoints();
  const governor=mobileFrameGovernorPolicy('minimal');
  const logicPreserved=checkpoints.every((point)=>point.enemyLogicMultiplier===1);
  const telegraphsPreserved=checkpoints.every((point)=>point.telegraphCap===24);
  const vfxBudgetsBounded=checkpoints.every((point)=>point.particleCap>=48&&point.particleCap<=governor.particleCap&&point.trailCap>=20&&point.trailCap<=governor.trailCap&&point.visualDensity>0&&point.visualDensity<=1&&point.projectileVisualDensity>0&&point.projectileVisualDensity<=1);
  let longRunDegradesPresentationFirst=true;
  let sawDecorativeReduction=false;
  for(const deviceClass of DEVICES){
    const group=checkpoints.filter((point)=>point.deviceClass===deviceClass).sort((a,b)=>a.hours-b.hours);
    if(group[2]!.visualDensity>group[0]!.visualDensity||group[2]!.projectileVisualDensity>group[0]!.projectileVisualDensity)longRunDegradesPresentationFirst=false;
    if(group[2]!.visualDensity<group[0]!.visualDensity||group[2]!.projectileVisualDensity<group[0]!.projectileVisualDensity)sawDecorativeReduction=true;
  }
  longRunDegradesPresentationFirst=longRunDegradesPresentationFirst&&sawDecorativeReduction&&logicPreserved&&telegraphsPreserved;
  return{checkpoints,logicPreserved,telegraphsPreserved,vfxBudgetsBounded,longRunDegradesPresentationFirst,passed:logicPreserved&&telegraphsPreserved&&vfxBudgetsBounded&&longRunDegradesPresentationFirst};
}
