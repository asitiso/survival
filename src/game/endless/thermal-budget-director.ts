import { clamp } from '../../core/math.js';
import type { DeviceClass } from './types.js';
import type { MobileFrameGovernorTier } from './mobile-frame-governor.js';

export type ThermalTier='cool'|'warm'|'hot';
export interface ThermalBudgetInput{
  elapsedSeconds:number;
  fps:number;
  adaptivePressure:number;
  frameGovernorTier:MobileFrameGovernorTier;
  deviceClass:DeviceClass;
}
export interface ThermalBudgetPolicy{
  tier:ThermalTier;
  pressure:number;
  visualDensityMultiplier:number;
  particleCapMultiplier:number;
  trailCapMultiplier:number;
  audioVoiceMultiplier:number;
  telegraphMultiplier:1;
  enemyLogicMultiplier:1;
}
export interface ThermalAuditDevice{
  deviceClass:DeviceClass;
  samples:ThermalBudgetPolicy[];
  logicPreserved:boolean;
  telegraphsPreserved:boolean;
  presentationFirst:boolean;
}
export interface ThermalBudgetAudit{devices:ThermalAuditDevice[];passed:boolean;}

function fpsPressure(fps:number):number{
  if(fps>=56)return 0;
  if(fps>=50)return .1;
  if(fps>=44)return .22;
  if(fps>=38)return .38;
  return .55;
}
function elapsedPressure(seconds:number):number{
  if(seconds<1800)return 0;
  if(seconds<7200)return .04;
  if(seconds<14400)return .08;
  if(seconds<28800)return .12;
  return .16;
}
const DEVICE_PRESSURE:Record<DeviceClass,number>={low:.16,mid:.08,high:0};
const GOVERNOR_PRESSURE:Record<MobileFrameGovernorTier,number>={full:0,reduced:.12,minimal:.24};

export function thermalBudgetPolicy(input:ThermalBudgetInput):ThermalBudgetPolicy{
  const fps=clamp(Number.isFinite(input.fps)?input.fps:60,1,120);
  const adaptive=clamp(Number.isFinite(input.adaptivePressure)?input.adaptivePressure:0,0,1);
  const seconds=Math.max(0,Number.isFinite(input.elapsedSeconds)?input.elapsedSeconds:0);
  const pressure=clamp(fpsPressure(fps)+adaptive*.35+DEVICE_PRESSURE[input.deviceClass]+GOVERNOR_PRESSURE[input.frameGovernorTier]+elapsedPressure(seconds),0,1);
  const tier:ThermalTier=pressure>=.76?'hot':pressure>=.36?'warm':'cool';
  if(tier==='hot')return{tier,pressure,visualDensityMultiplier:.72,particleCapMultiplier:.62,trailCapMultiplier:.56,audioVoiceMultiplier:.72,telegraphMultiplier:1,enemyLogicMultiplier:1};
  if(tier==='warm')return{tier,pressure,visualDensityMultiplier:.88,particleCapMultiplier:.82,trailCapMultiplier:.78,audioVoiceMultiplier:.88,telegraphMultiplier:1,enemyLogicMultiplier:1};
  return{tier,pressure,visualDensityMultiplier:1,particleCapMultiplier:1,trailCapMultiplier:1,audioVoiceMultiplier:1,telegraphMultiplier:1,enemyLogicMultiplier:1};
}

export function auditThermalBudget():ThermalBudgetAudit{
  const devices=(['low','mid','high'] as const).map((deviceClass):ThermalAuditDevice=>{
    const fps=deviceClass==='low'?34:deviceClass==='mid'?42:50;
    const samples=[1800,7200,28800].map((elapsedSeconds)=>thermalBudgetPolicy({elapsedSeconds,fps,adaptivePressure:.88,frameGovernorTier:elapsedSeconds>=7200?'minimal':'reduced',deviceClass}));
    const logicPreserved=samples.every((sample)=>sample.enemyLogicMultiplier===1);
    const telegraphsPreserved=samples.every((sample)=>sample.telegraphMultiplier===1);
    const presentationFirst=samples.some((sample)=>sample.particleCapMultiplier<1&&sample.trailCapMultiplier<1)&&samples.every((sample)=>sample.visualDensityMultiplier<=1&&sample.audioVoiceMultiplier<=1);
    return{deviceClass,samples,logicPreserved,telegraphsPreserved,presentationFirst};
  });
  return{devices,passed:devices.every((device)=>device.logicPreserved&&device.telegraphsPreserved&&device.presentationFirst)};
}
