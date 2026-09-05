import { advanceMobileFrameGovernor, createDefaultMobileFrameGovernorState, mobileFrameGovernorPolicy } from './endless/mobile-frame-governor.js';
import { evaluatePerformanceBudget } from './endless/performance-budget.js';
import { auditThermalWorstCase } from './endless/thermal-worst-case-audit.js';
export interface LowEndStressResult{fps:number;pressure:number;frames:number;framesToMinimal:number;finalTier:'full'|'reduced'|'minimal';enemyLogicMultiplier:number;}
export function simulateLowEndStress(fps:number,pressure:number,frames:number):LowEndStressResult{let state=createDefaultMobileFrameGovernorState(),framesToMinimal=0;for(let i=1;i<=frames;i++){state=advanceMobileFrameGovernor(state,{fps,adaptivePressure:pressure});if(state.tier==='minimal'&&framesToMinimal===0)framesToMinimal=i;}return{fps,pressure,frames,framesToMinimal,finalTier:state.tier,enemyLogicMultiplier:1};}
export interface LowEndReleasePerformanceAudit{samples:number;maxFramesToMinimal:number;shortSpikeDowngrades:number;recoveryFramesRequired:number;hysteresisPreserved:boolean;telegraphCap:number;telegraphsPreserved:boolean;maxParticleCap:number;maxTrailCap:number;enemyLogicCap:number;projectileCap:number;effectCap:number;passed:boolean;}
export function auditLowEndReleasePerformance():LowEndReleasePerformanceAudit{
  const profiles=[[24,.95],[30,.95],[38,.82],[42,.8],[28,.88],[35,.9]] as const;const stress=profiles.map(([fps,p])=>simulateLowEndStress(fps,p,180));
  let spike=createDefaultMobileFrameGovernorState();for(let i=0;i<45;i++)spike=advanceMobileFrameGovernor(spike,{fps:34,adaptivePressure:.92});
  let recovered=stress[0]!.finalTier==='minimal'?(()=>{let s=createDefaultMobileFrameGovernorState();for(let i=0;i<180;i++)s=advanceMobileFrameGovernor(s,{fps:30,adaptivePressure:.95});let frames=0;while(s.tier==='minimal'&&frames<600){s=advanceMobileFrameGovernor(s,{fps:60,adaptivePressure:.15});frames++;}return frames;})():0;
  const policy=mobileFrameGovernorPolicy('minimal'),budget=evaluatePerformanceBudget({deviceClass:'low',threat:5,ascensionTier:10}),thermal=auditThermalWorstCase();
  const maxFramesToMinimal=Math.max(...stress.map(s=>s.framesToMinimal||999)),shortSpikeDowngrades=spike.tier==='full'?0:1,hysteresisPreserved=recovered>=240;
  const passed=stress.every(s=>s.finalTier==='minimal'&&s.framesToMinimal>0&&s.framesToMinimal<=180)&&shortSpikeDowngrades===0&&hysteresisPreserved&&policy.telegraphCap===24&&thermal.telegraphsPreserved&&budget.enemyLogicCap===220&&budget.projectileCap<=90&&budget.effectCap<=60;
  return{samples:stress.length,maxFramesToMinimal,shortSpikeDowngrades,recoveryFramesRequired:recovered,hysteresisPreserved,telegraphCap:policy.telegraphCap,telegraphsPreserved:thermal.telegraphsPreserved,maxParticleCap:policy.particleCap,maxTrailCap:policy.trailCap,enemyLogicCap:budget.enemyLogicCap,projectileCap:budget.projectileCap,effectCap:budget.effectCap,passed};
}
