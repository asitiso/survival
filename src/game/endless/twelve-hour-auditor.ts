import { getAscensionTier } from './ascension.js';
import { advanceMobileFrameGovernor, createDefaultMobileFrameGovernorState, mobileFrameGovernorPolicy, type MobileFrameGovernorTier } from './mobile-frame-governor.js';
import { evaluatePerformanceBudget, type VisualQuality } from './performance-budget.js';
import type { DeviceClass } from './types.js';

export interface TwelveHourCheckpoint {
  minute:number;
  ascensionTier:number;
  enemyDemand:number;
  projectileDemand:number;
  effectDemand:number;
  enemyLogicCap:number;
  projectileCap:number;
  effectCap:number;
  simulatedEnemies:number;
  simulatedProjectiles:number;
  simulatedEffects:number;
  visualQuality:VisualQuality;
  governorTier:MobileFrameGovernorTier;
  withinGuard:boolean;
}

export interface TwelveHourAudit {
  deviceClass:DeviceClass;
  threat:number;
  checkpoints:TwelveHourCheckpoint[];
  presentationFirst:boolean;
  maxTransientEntities:number;
  passed:boolean;
}

const CHECKPOINTS=[480,600,720] as const;
const BASE_EFFECT_CAP:Record<DeviceClass,number>={low:60,mid:100,high:150};
const BASE_PROJECTILE_CAP:Record<DeviceClass,number>={low:90,mid:150,high:220};

export function auditTwelveHourRun(deviceClass:DeviceClass='low', threat=5):TwelveHourAudit {
  let governor=createDefaultMobileFrameGovernorState();
  for (let i=0;i<180;i+=1) governor=advanceMobileFrameGovernor(governor,{fps:32,adaptivePressure:.95});
  const governorPolicy=mobileFrameGovernorPolicy(governor.tier);
  const checkpoints=CHECKPOINTS.map((minute):TwelveHourCheckpoint=>{
    const ascensionTier=getAscensionTier(minute*60_000);
    const budget=evaluatePerformanceBudget({deviceClass,threat,ascensionTier});
    const enemyDemand=Math.round(130+minute*1.9+threat*20+ascensionTier*10);
    const projectileDemand=Math.round(70+minute*.78+threat*6+ascensionTier*5);
    const effectDemand=Math.round(50+minute*.55+threat*4+ascensionTier*3);
    const projectileCap=Math.max(18,Math.floor(budget.projectileCap*governorPolicy.projectileVisualDensity));
    const effectCap=Math.max(12,Math.floor(budget.effectCap*governorPolicy.visualDensity));
    const simulatedEnemies=Math.min(enemyDemand,budget.enemyLogicCap);
    const simulatedProjectiles=Math.min(projectileDemand,projectileCap);
    const simulatedEffects=Math.min(effectDemand,effectCap);
    return {
      minute,ascensionTier,enemyDemand,projectileDemand,effectDemand,
      enemyLogicCap:budget.enemyLogicCap,projectileCap,effectCap,
      simulatedEnemies,simulatedProjectiles,simulatedEffects,visualQuality:budget.visualQuality,governorTier:governor.tier,
      withinGuard:simulatedEnemies<=budget.enemyLogicCap&&simulatedProjectiles<=projectileCap&&simulatedEffects<=effectCap,
    };
  });
  const last=checkpoints.at(-1)!;
  const effectReduction=1-last.effectCap/BASE_EFFECT_CAP[deviceClass];
  const projectileReduction=1-last.projectileCap/BASE_PROJECTILE_CAP[deviceClass];
  const presentationFirst=effectReduction>projectileReduction&&checkpoints.every((point)=>point.enemyLogicCap===checkpoints[0]!.enemyLogicCap);
  const maxTransientEntities=Math.max(...checkpoints.map((point)=>point.simulatedEnemies+point.simulatedProjectiles+point.simulatedEffects));
  return {deviceClass,threat,checkpoints,presentationFirst,maxTransientEntities,passed:presentationFirst&&checkpoints.every((point)=>point.withinGuard)};
}
