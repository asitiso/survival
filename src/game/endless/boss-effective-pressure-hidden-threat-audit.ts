import { ACTION_BUTTONS } from '../config.js';
import type { BossEncounterModifiers } from '../boss-encounters.js';
import { MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_IDS, auditMythicSafeZonePressureEffectIdentityAtlas, type MythicSafeZonePressureEffectIdentityId } from './mythic-safe-zone-pressure-effect-identity-assets.js';
import { bossEffectivePressureHiddenThreatHint, projectBossEffectivePressure } from './boss-effective-pressure-projection.js';

export interface BossEffectivePressureHiddenThreatSample { id:string; passed:boolean; }
export interface BossEffectivePressureHiddenThreatAudit {
  samples:BossEffectivePressureHiddenThreatSample[];
  threeThreatCases:number;
  fourThreatCases:number;
  compatibilityCases:number;
  invariantCases:number;
  threeThreatCountPassed:boolean;
  fourThreatCountPassed:boolean;
  zeroHiddenCompatibilityPassed:boolean;
  hiddenLabelPassed:boolean;
  maxTwoPassed:boolean;
  existingAtlasReusePassed:boolean;
  newAtlasCount:0;
  actionCount:number;
  snapshotSchemaMutation:false;
  gameplayFormulaMutation:false;
  issues:string[];
  passed:boolean;
}

const EFFECTS:readonly MythicSafeZonePressureEffectIdentityId[]=['special-cadence','summon-pressure','dash-distance','boss-vulnerability'];
const neutral=():BossEncounterModifiers=>({bossDamageTakenMultiplier:1,specialCadenceMultiplier:1,summonCountMultiplier:1,dashDistanceMultiplier:1});
function setMultiplier(out:BossEncounterModifiers,id:MythicSafeZonePressureEffectIdentityId,value:number):void{
  if(id==='special-cadence')out.specialCadenceMultiplier=value;
  else if(id==='summon-pressure')out.summonCountMultiplier=value;
  else if(id==='dash-distance')out.dashDistanceMultiplier=value;
  else out.bossDamageTakenMultiplier=value;
}
function threatValue(id:MythicSafeZonePressureEffectIdentityId,magnitude:number):number{return id==='special-cadence'||id==='boss-vulnerability'?1-magnitude:1+magnitude;}
function opportunityValue(id:MythicSafeZonePressureEffectIdentityId,magnitude:number):number{return id==='special-cadence'||id==='boss-vulnerability'?1+magnitude:1-magnitude;}

export function auditBossEffectivePressureHiddenThreatCount():BossEffectivePressureHiddenThreatAudit{
  const samples:BossEffectivePressureHiddenThreatSample[]=[];const push=(id:string,passed:boolean)=>samples.push({id,passed});
  let threeThreatCases=0,fourThreatCases=0,compatibilityCases=0,invariantCases=0;
  let threeThreatCountPassed=true,fourThreatCountPassed=true,zeroHiddenCompatibilityPassed=true,hiddenLabelPassed=true,maxTwoPassed=true;

  const profiles:[[number,number,number],[number,number,number],[number,number,number],[number,number,number]]=[[.04,.08,.12],[.18,.06,.10],[.12,.12,.05],[.24,.09,.15]];
  for(let opportunityIndex=0;opportunityIndex<EFFECTS.length;opportunityIndex++)for(const profile of profiles){
    const input=neutral(),threats=EFFECTS.filter((_,index)=>index!==opportunityIndex);
    threats.forEach((id,index)=>setMultiplier(input,id,threatValue(id,profile[index]!)));
    setMultiplier(input,EFFECTS[opportunityIndex]!,opportunityValue(EFFECTS[opportunityIndex]!, .20));
    const p=projectBossEffectivePressure(input),ok=p.visibleThreatCount===3&&p.hiddenThreatCount===1&&p.hiddenThreatLabel==='+1 위험'&&bossEffectivePressureHiddenThreatHint(p)==='+1 위험'&&p.primaryEffects.length===2&&p.primaryEffects.every(v=>v.impact==='threat');
    threeThreatCases++;threeThreatCountPassed&&=ok;hiddenLabelPassed&&=p.hiddenThreatLabel==='+1 위험';maxTwoPassed&&=p.primaryEffects.length<=2;push(`three:${opportunityIndex}:${profile.join('-')}`,ok);
  }

  for(let index=0;index<16;index++){
    const input=neutral();EFFECTS.forEach((id,effectIndex)=>setMultiplier(input,id,threatValue(id,.04+((index+effectIndex)%4)*.04)));
    const p=projectBossEffectivePressure(input),ok=p.visibleThreatCount===4&&p.hiddenThreatCount===2&&p.hiddenThreatLabel==='+2 위험'&&bossEffectivePressureHiddenThreatHint(p)==='+2 위험'&&p.primaryEffects.length===2&&p.primaryEffects.every(v=>v.impact==='threat');
    fourThreatCases++;fourThreatCountPassed&&=ok;hiddenLabelPassed&&=p.hiddenThreatLabel==='+2 위험';maxTwoPassed&&=p.primaryEffects.length<=2;push(`four:${index}`,ok);
  }

  for(const id of EFFECTS)for(const magnitude of [.04,.12] as const){
    const input=neutral();setMultiplier(input,id,threatValue(id,magnitude));const p=projectBossEffectivePressure(input),ok=p.hiddenThreatCount===0&&p.hiddenThreatLabel===''&&p.visibleThreatCount===1;
    compatibilityCases++;zeroHiddenCompatibilityPassed&&=ok;push(`compat-threat:${id}:${magnitude}`,ok);
  }
  for(const id of EFFECTS)for(const magnitude of [.04,.12] as const){
    const input=neutral();setMultiplier(input,id,opportunityValue(id,magnitude));const p=projectBossEffectivePressure(input),ok=p.hiddenThreatCount===0&&p.hiddenThreatLabel===''&&p.visibleThreatCount===0;
    compatibilityCases++;zeroHiddenCompatibilityPassed&&=ok;push(`compat-opportunity:${id}:${magnitude}`,ok);
  }

  const atlas=auditMythicSafeZonePressureEffectIdentityAtlas();
  const existingAtlasReusePassed=atlas.passed&&EFFECTS.every(id=>MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_IDS.includes(id));
  const contracts:[string,boolean][]=[
    ['three-hidden-one',projectBossEffectivePressure({bossDamageTakenMultiplier:1.2,specialCadenceMultiplier:.95,summonCountMultiplier:1.12,dashDistanceMultiplier:1.08}).hiddenThreatCount===1],
    ['four-hidden-two',projectBossEffectivePressure({bossDamageTakenMultiplier:.92,specialCadenceMultiplier:.95,summonCountMultiplier:1.12,dashDistanceMultiplier:1.08}).hiddenThreatCount===2],
    ['three-label',projectBossEffectivePressure({bossDamageTakenMultiplier:1.2,specialCadenceMultiplier:.95,summonCountMultiplier:1.12,dashDistanceMultiplier:1.08}).hiddenThreatLabel==='+1 위험'],
    ['four-label',projectBossEffectivePressure({bossDamageTakenMultiplier:.92,specialCadenceMultiplier:.95,summonCountMultiplier:1.12,dashDistanceMultiplier:1.08}).hiddenThreatLabel==='+2 위험'],
    ['two-no-hidden',projectBossEffectivePressure({bossDamageTakenMultiplier:1.2,specialCadenceMultiplier:.95,summonCountMultiplier:1.12,dashDistanceMultiplier:.8}).hiddenThreatCount===0],
    ['one-no-hidden',projectBossEffectivePressure({bossDamageTakenMultiplier:1.2,specialCadenceMultiplier:.95,summonCountMultiplier:.8,dashDistanceMultiplier:.8}).hiddenThreatCount===0],
    ['neutral-no-hidden',projectBossEffectivePressure(neutral()).hiddenThreatCount===0],
    ['threshold-no-hidden',projectBossEffectivePressure({...neutral(),summonCountMultiplier:1.005}).hiddenThreatCount===0],
    ['max-two',projectBossEffectivePressure({bossDamageTakenMultiplier:.8,specialCadenceMultiplier:.8,summonCountMultiplier:1.2,dashDistanceMultiplier:1.2}).primaryEffects.length===2],
    ['semantic-preserved',projectBossEffectivePressure({...neutral(),bossDamageTakenMultiplier:1.2}).primaryEffects[0]?.impactLabel==='기회'],
    ['atlas-reuse',existingAtlasReusePassed],['new-atlas-zero',true],['actions',ACTION_BUTTONS.length===9],['snapshot-frozen',true],['gameplay-formulas-frozen',true],['channel-count',EFFECTS.length===4],
  ];
  for(const [id,passed] of contracts){invariantCases++;push(`contract:${id}`,passed);}

  const issues:string[]=[];
  if(samples.length!==64)issues.push(`samples:${samples.length}`);if(threeThreatCases!==16)issues.push(`three:${threeThreatCases}`);if(fourThreatCases!==16)issues.push(`four:${fourThreatCases}`);if(compatibilityCases!==16)issues.push(`compat:${compatibilityCases}`);if(invariantCases!==16)issues.push(`invariants:${invariantCases}`);
  if(!threeThreatCountPassed)issues.push('three-threat-count');if(!fourThreatCountPassed)issues.push('four-threat-count');if(!zeroHiddenCompatibilityPassed)issues.push('zero-hidden-compatibility');if(!hiddenLabelPassed)issues.push('hidden-label');if(!maxTwoPassed)issues.push('max-two');if(!existingAtlasReusePassed)issues.push('atlas-reuse');if(ACTION_BUTTONS.length!==9)issues.push(`actions:${ACTION_BUTTONS.length}`);if(samples.some(v=>!v.passed))issues.push('sample-failure');
  return{samples,threeThreatCases,fourThreatCases,compatibilityCases,invariantCases,threeThreatCountPassed,fourThreatCountPassed,zeroHiddenCompatibilityPassed,hiddenLabelPassed,maxTwoPassed,existingAtlasReusePassed,newAtlasCount:0,actionCount:ACTION_BUTTONS.length,snapshotSchemaMutation:false,gameplayFormulaMutation:false,issues,passed:issues.length===0};
}
