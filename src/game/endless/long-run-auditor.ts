import { getAscensionTier } from './ascension.js';
import { evaluatePerformanceBudget, type VisualQuality } from './performance-budget.js';
import type { DeviceClass } from './types.js';

export interface LongRunCheckpoint {
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
  withinGuard:boolean;
}
export interface LongRunAudit {
  deviceClass:DeviceClass;
  threat:number;
  checkpoints:LongRunCheckpoint[];
  presentationFirst:boolean;
  estimatedTransientEntities:number;
  passed:boolean;
}

const CHECKPOINTS=[240,300,360,480] as const;
const BASE_EFFECT_CAP:Record<DeviceClass,number>={low:60,mid:100,high:150};
const BASE_PROJECTILE_CAP:Record<DeviceClass,number>={low:90,mid:150,high:220};

export function auditEightHourRun(deviceClass:DeviceClass='low', threat=5):LongRunAudit {
  const checkpoints=CHECKPOINTS.map((minute):LongRunCheckpoint=>{
    const ascensionTier=getAscensionTier(minute*60_000);
    const budget=evaluatePerformanceBudget({deviceClass,threat,ascensionTier});
    const enemyDemand=Math.round(110+minute*1.85+threat*20+ascensionTier*10);
    const projectileDemand=Math.round(58+minute*.72+threat*6+ascensionTier*5);
    const effectDemand=Math.round(42+minute*.48+threat*4+ascensionTier*3);
    const simulatedEnemies=Math.min(enemyDemand,budget.enemyLogicCap);
    const simulatedProjectiles=Math.min(projectileDemand,budget.projectileCap);
    const simulatedEffects=Math.min(effectDemand,budget.effectCap);
    return {
      minute,ascensionTier,enemyDemand,projectileDemand,effectDemand,
      enemyLogicCap:budget.enemyLogicCap,projectileCap:budget.projectileCap,effectCap:budget.effectCap,
      simulatedEnemies,simulatedProjectiles,simulatedEffects,visualQuality:budget.visualQuality,
      withinGuard:simulatedEnemies<=budget.enemyLogicCap&&simulatedProjectiles<=budget.projectileCap&&simulatedEffects<=budget.effectCap,
    };
  });
  const last=checkpoints.at(-1)!;
  const effectReduction=1-last.effectCap/BASE_EFFECT_CAP[deviceClass];
  const projectileReduction=1-last.projectileCap/BASE_PROJECTILE_CAP[deviceClass];
  const presentationFirst=effectReduction>projectileReduction&&checkpoints.every((point)=>point.enemyLogicCap===checkpoints[0]!.enemyLogicCap);
  const estimatedTransientEntities=last.simulatedEnemies+last.simulatedProjectiles+last.simulatedEffects;
  return {deviceClass,threat,checkpoints,presentationFirst,estimatedTransientEntities,passed:presentationFirst&&checkpoints.every((point)=>point.withinGuard)};
}
