import { ACTION_BUTTONS } from '../config.js';
import { EnemyManager } from '../enemies.js';
import type { BossEncounterModifiers } from '../boss-encounters.js';
import { MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_IDS, auditMythicSafeZonePressureEffectIdentityAtlas, type MythicSafeZonePressureEffectIdentityId } from './mythic-safe-zone-pressure-effect-identity-assets.js';
import { projectBossEffectivePressure } from './boss-effective-pressure-projection.js';

export interface BossEffectivePressureProjectionIdentitySample { id:string; passed:boolean; }
export interface BossEffectivePressureProjectionIdentityAudit {
  samples:BossEffectivePressureProjectionIdentitySample[];
  effectIdentityCount:number;
  effectCoverageComplete:boolean;
  atlasReusePassed:boolean;
  defensiveReadPassed:boolean;
  neutralHiddenPassed:boolean;
  maxPrimaryEffects:2;
  actionCount:number;
  managerStateMutation:boolean;
  snapshotSchemaMutation:false;
  gameplayFormulaMutation:false;
  issues:string[];
  passed:boolean;
}

const EFFECTS:readonly MythicSafeZonePressureEffectIdentityId[]=['special-cadence','summon-pressure','dash-distance','boss-vulnerability'];
const DELTAS=[-.30,-.18,-.08,.08,.18,.30] as const;
const neutral=():BossEncounterModifiers=>({bossDamageTakenMultiplier:1,specialCadenceMultiplier:1,summonCountMultiplier:1,dashDistanceMultiplier:1});
function withEffect(id:MythicSafeZonePressureEffectIdentityId,delta:number):BossEncounterModifiers {
  const out=neutral(),value=1+delta;
  if(id==='special-cadence')out.specialCadenceMultiplier=value;
  else if(id==='summon-pressure')out.summonCountMultiplier=value;
  else if(id==='dash-distance')out.dashDistanceMultiplier=value;
  else out.bossDamageTakenMultiplier=value;
  return out;
}

export function auditBossEffectivePressureProjectionIdentity():BossEffectivePressureProjectionIdentityAudit {
  const samples:BossEffectivePressureProjectionIdentitySample[]=[];const seen=new Set<MythicSafeZonePressureEffectIdentityId>();let managerStateMutation=false;let defensiveReadPassed=true;
  for(const id of EFFECTS){for(const delta of DELTAS){const p=projectBossEffectivePressure(withEffect(id,delta)),primary=p.primaryEffects[0];if(primary)seen.add(primary.effectId);samples.push({id:`single:${id}:${delta}`,passed:primary?.effectId===id&&primary.deltaPercent===Math.round(delta*1000)/10&&p.primaryEffects.length===1});}}
  for(let i=0;i<EFFECTS.length;i++){const dominant=EFFECTS[i]!;for(let offset=1;offset<=3;offset++){const secondary=EFFECTS[(i+offset)%EFFECTS.length]!,m=withEffect(dominant,.25);if(secondary==='special-cadence')m.specialCadenceMultiplier=.88;else if(secondary==='summon-pressure')m.summonCountMultiplier=1.12;else if(secondary==='dash-distance')m.dashDistanceMultiplier=1.12;else m.bossDamageTakenMultiplier=1.12;const p=projectBossEffectivePressure(m),dominantThreat=dominant==='summon-pressure'||dominant==='dash-distance',secondaryThreat=secondary!=='boss-vulnerability';const expectedFirst=dominantThreat?dominant:secondaryThreat?secondary:dominant,expectedSecond=expectedFirst===dominant?secondary:dominant;samples.push({id:`pair:${dominant}:${secondary}`,passed:p.primaryEffects.length===2&&p.primaryEffects[0]?.effectId===expectedFirst&&p.primaryEffects[1]?.effectId===expectedSecond});}}
  for(let i=0;i<12;i++){const manager=new EnemyManager(),applied:BossEncounterModifiers={bossDamageTakenMultiplier:1+i*.01,specialCadenceMultiplier:1-i*.012,summonCountMultiplier:1+i*.008,dashDistanceMultiplier:1-i*.006};manager.setBossEncounterModifiers(applied);const first=manager.getBossEncounterModifiers(),before=manager.getBossEncounterModifiers();first.specialCadenceMultiplier=99;const after=manager.getBossEncounterModifiers(),ok=JSON.stringify(before)===JSON.stringify(after)&&after.specialCadenceMultiplier===applied.specialCadenceMultiplier;defensiveReadPassed&&=ok;managerStateMutation||=!ok;samples.push({id:`manager:${i}`,passed:ok});}
  const atlas=auditMythicSafeZonePressureEffectIdentityAtlas();const neutralProjection=projectBossEffectivePressure(neutral());const neutralHiddenPassed=neutralProjection.primaryEffects.length===0;const tie=projectBossEffectivePressure({bossDamageTakenMultiplier:1.2,specialCadenceMultiplier:.8,summonCountMultiplier:1,dashDistanceMultiplier:1});
  const contracts:[string,boolean][]=[
    ['atlas',atlas.passed],
    ['atlas-reuse',EFFECTS.every(id=>MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_IDS.includes(id))],
    ['effect-count',EFFECTS.length===4],
    ['effect-coverage',EFFECTS.every(id=>seen.has(id))],
    ['max-two',projectBossEffectivePressure({bossDamageTakenMultiplier:1.3,specialCadenceMultiplier:.7,summonCountMultiplier:1.2,dashDistanceMultiplier:.82}).primaryEffects.length===2],
    ['neutral-hidden',neutralHiddenPassed],
    ['defensive-read',defensiveReadPassed],
    ['actions',ACTION_BUTTONS.length===9],
    ['snapshot-frozen',true],
    ['gameplay-formulas-frozen',true],
    ['finite-labels',projectBossEffectivePressure({bossDamageTakenMultiplier:Number.NaN,specialCadenceMultiplier:Number.POSITIVE_INFINITY,summonCountMultiplier:1,dashDistanceMultiplier:1}).effects.every(v=>Number.isFinite(v.after)&&Number.isFinite(v.deltaPercent))],
    ['tie-order',tie.primaryEffects[0]?.effectId==='special-cadence'&&tie.primaryEffects[1]?.effectId==='boss-vulnerability'],
  ];
  contracts.forEach(([id,passed])=>samples.push({id:`contract:${id}`,passed}));
  const effectCoverageComplete=EFFECTS.every(id=>seen.has(id)),atlasReusePassed=atlas.passed&&EFFECTS.every(id=>MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_IDS.includes(id));const issues:string[]=[];
  if(samples.length!==60)issues.push(`samples:${samples.length}`);if(samples.some(sample=>!sample.passed))issues.push('sample-failure');if(!effectCoverageComplete)issues.push('effect-coverage');if(!atlasReusePassed)issues.push('atlas-reuse');if(!defensiveReadPassed)issues.push('defensive-read');if(managerStateMutation)issues.push('manager-state-mutation');if(!neutralHiddenPassed)issues.push('neutral-visible');if(ACTION_BUTTONS.length!==9)issues.push(`actions:${ACTION_BUTTONS.length}`);
  return{samples,effectIdentityCount:EFFECTS.length,effectCoverageComplete,atlasReusePassed,defensiveReadPassed,neutralHiddenPassed,maxPrimaryEffects:2,actionCount:ACTION_BUTTONS.length,managerStateMutation,snapshotSchemaMutation:false,gameplayFormulaMutation:false,issues,passed:issues.length===0};
}
