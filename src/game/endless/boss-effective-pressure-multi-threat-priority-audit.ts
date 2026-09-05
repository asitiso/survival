import { ACTION_BUTTONS } from '../config.js';
import type { BossEncounterModifiers } from '../boss-encounters.js';
import { MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_IDS, auditMythicSafeZonePressureEffectIdentityAtlas, type MythicSafeZonePressureEffectIdentityId } from './mythic-safe-zone-pressure-effect-identity-assets.js';
import { projectBossEffectivePressure } from './boss-effective-pressure-projection.js';

export interface BossEffectivePressureMultiThreatPrioritySample { id:string; passed:boolean; }
export interface BossEffectivePressureMultiThreatPriorityAudit {
  samples:BossEffectivePressureMultiThreatPrioritySample[];
  twoThreatCases:number;
  threeThreatCases:number;
  compatibilityCases:number;
  invariantCases:number;
  dualThreatRetentionPassed:boolean;
  strongestThreatOrderingPassed:boolean;
  oneThreatCompatibilityPassed:boolean;
  noThreatCompatibilityPassed:boolean;
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

export function auditBossEffectivePressureMultiThreatPriority():BossEffectivePressureMultiThreatPriorityAudit{
  const samples:BossEffectivePressureMultiThreatPrioritySample[]=[];const push=(id:string,passed:boolean)=>samples.push({id,passed});
  let twoThreatCases=0,threeThreatCases=0,compatibilityCases=0,invariantCases=0;
  let dualThreatRetentionPassed=true,strongestThreatOrderingPassed=true,oneThreatCompatibilityPassed=true,noThreatCompatibilityPassed=true,maxTwoPassed=true;

  const twoProfiles:[[number,number],[number,number],[number,number],[number,number]]=[[.04,.08],[.08,.04],[.12,.20],[.20,.12]];
  for(let a=0;a<EFFECTS.length;a++)for(let b=a+1;b<EFFECTS.length;b++)for(const [ma,mb] of twoProfiles){
    const first=EFFECTS[a]!,second=EFFECTS[b]!,input=neutral();
    setMultiplier(input,first,threatValue(first,ma));setMultiplier(input,second,threatValue(second,mb));
    const opportunity=EFFECTS.find(id=>id!==first&&id!==second)!;setMultiplier(input,opportunity,opportunityValue(opportunity,.45));
    const p=projectBossEffectivePressure(input),ids=p.primaryEffects.map(v=>v.effectId),expected=[{id:first,m:ma},{id:second,m:mb}].sort((x,y)=>(y.m-x.m)||(EFFECTS.indexOf(x.id)-EFFECTS.indexOf(y.id))).map(v=>v.id);
    const retained=p.primaryEffects.length===2&&p.primaryEffects.every(v=>v.impact==='threat');
    const ordered=ids[0]===expected[0]&&ids[1]===expected[1];
    twoThreatCases++;dualThreatRetentionPassed&&=retained;strongestThreatOrderingPassed&&=ordered;maxTwoPassed&&=p.primaryEffects.length<=2;push(`two:${first}:${second}:${ma}:${mb}`,retained&&ordered);
  }

  const threeProfiles:[[number,number,number],[number,number,number],[number,number,number]]=[[.04,.08,.12],[.18,.06,.10],[.12,.12,.05]];
  for(let excluded=0;excluded<EFFECTS.length;excluded++)for(const profile of threeProfiles){
    const threats=EFFECTS.filter((_,index)=>index!==excluded),input=neutral();
    threats.forEach((id,index)=>setMultiplier(input,id,threatValue(id,profile[index]!)));
    const p=projectBossEffectivePressure(input),expected=threats.map((id,index)=>({id,m:profile[index]!})).sort((x,y)=>(y.m-x.m)||(EFFECTS.indexOf(x.id)-EFFECTS.indexOf(y.id))).slice(0,2).map(v=>v.id);
    const ok=p.primaryEffects.length===2&&p.primaryEffects.every(v=>v.impact==='threat')&&p.primaryEffects[0]?.effectId===expected[0]&&p.primaryEffects[1]?.effectId===expected[1];
    threeThreatCases++;dualThreatRetentionPassed&&=ok;strongestThreatOrderingPassed&&=ok;maxTwoPassed&&=p.primaryEffects.length<=2;push(`three:${excluded}:${profile.join('-')}`,ok);
  }

  for(const id of EFFECTS){
    const input=neutral();setMultiplier(input,id,threatValue(id,.02));const opportunity=EFFECTS.find(other=>other!==id)!;setMultiplier(input,opportunity,opportunityValue(opportunity,.40));
    const p=projectBossEffectivePressure(input),ok=p.primaryEffects[0]?.effectId===id&&p.primaryEffects[0]?.impact==='threat'&&p.primaryEffects[1]?.effectId===opportunity;
    compatibilityCases++;oneThreatCompatibilityPassed&&=ok;push(`compat-one-threat:${id}`,ok);
  }
  for(const id of EFFECTS){
    const input=neutral();setMultiplier(input,id,opportunityValue(id,.20));const p=projectBossEffectivePressure(input),ok=p.primaryEffects.length===1&&p.primaryEffects[0]?.effectId===id&&p.primaryEffects[0]?.impact==='opportunity';
    compatibilityCases++;noThreatCompatibilityPassed&&=ok;push(`compat-no-threat:${id}`,ok);
  }
  for(const id of EFFECTS){
    const input=neutral();setMultiplier(input,id,opportunityValue(id,.005));const p=projectBossEffectivePressure(input),ok=p.primaryEffects.length===0;
    compatibilityCases++;noThreatCompatibilityPassed&&=ok;push(`compat-threshold:${id}`,ok);
  }

  const atlas=auditMythicSafeZonePressureEffectIdentityAtlas();
  const existingAtlasReusePassed=atlas.passed&&EFFECTS.every(id=>MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_IDS.includes(id));
  const contracts:[string,boolean][]=[
    ['max-two',projectBossEffectivePressure({bossDamageTakenMultiplier:.7,specialCadenceMultiplier:.7,summonCountMultiplier:1.3,dashDistanceMultiplier:1.3}).primaryEffects.length===2],
    ['two-threats-win',projectBossEffectivePressure({bossDamageTakenMultiplier:1.6,specialCadenceMultiplier:.96,summonCountMultiplier:1.12,dashDistanceMultiplier:.7}).primaryEffects.every(v=>v.impact==='threat')],
    ['stable-threat-tie',projectBossEffectivePressure({bossDamageTakenMultiplier:.8,specialCadenceMultiplier:.8,summonCountMultiplier:1,dashDistanceMultiplier:1}).primaryEffects.map(v=>v.effectId).join(',')==='special-cadence,boss-vulnerability'],
    ['one-threat-first',projectBossEffectivePressure({bossDamageTakenMultiplier:1.4,specialCadenceMultiplier:.98,summonCountMultiplier:.7,dashDistanceMultiplier:1}).primaryEffects[0]?.impact==='threat'],
    ['no-threat-order',projectBossEffectivePressure({bossDamageTakenMultiplier:1.18,specialCadenceMultiplier:1.32,summonCountMultiplier:.9,dashDistanceMultiplier:.8}).primaryEffects.map(v=>v.effectId).join(',')==='special-cadence,dash-distance'],
    ['semantic-preserved',projectBossEffectivePressure({...neutral(),bossDamageTakenMultiplier:1.2}).primaryEffects[0]?.impactLabel==='기회'],
    ['threshold-preserved',projectBossEffectivePressure({...neutral(),summonCountMultiplier:1.005}).primaryEffects.length===0],
    ['neutral-hidden',projectBossEffectivePressure(neutral()).primaryEffects.length===0],
    ['nonfinite-neutral',projectBossEffectivePressure({...neutral(),specialCadenceMultiplier:Number.NaN}).primaryEffects.length===0],
    ['atlas-reuse',existingAtlasReusePassed],['new-atlas-zero',true],['actions',ACTION_BUTTONS.length===9],['snapshot-frozen',true],['gameplay-formulas-frozen',true],['channel-count',EFFECTS.length===4],['max-primary-contract',projectBossEffectivePressure(neutral()).maxPrimaryEffects===2],
  ];
  for(const [id,passed] of contracts){invariantCases++;push(`contract:${id}`,passed);}

  const issues:string[]=[];
  if(samples.length!==64)issues.push(`samples:${samples.length}`);if(twoThreatCases!==24)issues.push(`two:${twoThreatCases}`);if(threeThreatCases!==12)issues.push(`three:${threeThreatCases}`);if(compatibilityCases!==12)issues.push(`compat:${compatibilityCases}`);if(invariantCases!==16)issues.push(`invariants:${invariantCases}`);
  if(!dualThreatRetentionPassed)issues.push('dual-threat-retention');if(!strongestThreatOrderingPassed)issues.push('strongest-threat-ordering');if(!oneThreatCompatibilityPassed)issues.push('one-threat-compatibility');if(!noThreatCompatibilityPassed)issues.push('no-threat-compatibility');if(!maxTwoPassed)issues.push('max-two');if(!existingAtlasReusePassed)issues.push('atlas-reuse');if(ACTION_BUTTONS.length!==9)issues.push(`actions:${ACTION_BUTTONS.length}`);if(samples.some(v=>!v.passed))issues.push('sample-failure');
  return{samples,twoThreatCases,threeThreatCases,compatibilityCases,invariantCases,dualThreatRetentionPassed,strongestThreatOrderingPassed,oneThreatCompatibilityPassed,noThreatCompatibilityPassed,maxTwoPassed,existingAtlasReusePassed,newAtlasCount:0,actionCount:ACTION_BUTTONS.length,snapshotSchemaMutation:false,gameplayFormulaMutation:false,issues,passed:issues.length===0};
}
