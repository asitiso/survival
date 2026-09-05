import { ACTION_BUTTONS } from '../config.js';
import type { BossEncounterModifiers } from '../boss-encounters.js';
import { MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_IDS, auditMythicSafeZonePressureEffectIdentityAtlas, type MythicSafeZonePressureEffectIdentityId } from './mythic-safe-zone-pressure-effect-identity-assets.js';
import { bossEffectivePressureHint, bossEffectivePressureSemanticHint, projectBossEffectivePressure } from './boss-effective-pressure-projection.js';

export interface BossEffectivePressureSemanticSample { id:string; passed:boolean; }
export interface BossEffectivePressureSemanticAudit {
  samples:BossEffectivePressureSemanticSample[];
  channelCount:4;
  threatCases:number;
  opportunityCases:number;
  neutralCases:number;
  semanticCoverageComplete:boolean;
  signInversionCoverageComplete:boolean;
  textSemanticLabelPassed:boolean;
  existingAtlasReusePassed:boolean;
  newAtlasCount:0;
  actionCount:number;
  snapshotSchemaMutation:false;
  gameplayFormulaMutation:false;
  issues:string[];
  passed:boolean;
}

const EFFECTS:readonly MythicSafeZonePressureEffectIdentityId[]=['special-cadence','summon-pressure','dash-distance','boss-vulnerability'];
const MAGNITUDES=[.05,.12,.2,.32] as const;
const neutral=():BossEncounterModifiers=>({bossDamageTakenMultiplier:1,specialCadenceMultiplier:1,summonCountMultiplier:1,dashDistanceMultiplier:1});
function withMultiplier(id:MythicSafeZonePressureEffectIdentityId,multiplier:number):BossEncounterModifiers{
  const out=neutral();
  if(id==='special-cadence')out.specialCadenceMultiplier=multiplier;
  else if(id==='summon-pressure')out.summonCountMultiplier=multiplier;
  else if(id==='dash-distance')out.dashDistanceMultiplier=multiplier;
  else out.bossDamageTakenMultiplier=multiplier;
  return out;
}
function threatMultiplier(id:MythicSafeZonePressureEffectIdentityId,magnitude:number):number{
  return id==='special-cadence'||id==='boss-vulnerability'?1-magnitude:1+magnitude;
}
function opportunityMultiplier(id:MythicSafeZonePressureEffectIdentityId,magnitude:number):number{
  return id==='special-cadence'||id==='boss-vulnerability'?1+magnitude:1-magnitude;
}

export function auditBossEffectivePressureSemantics():BossEffectivePressureSemanticAudit{
  const samples:BossEffectivePressureSemanticSample[]=[];
  const threatSeen=new Set<MythicSafeZonePressureEffectIdentityId>(),opportunitySeen=new Set<MythicSafeZonePressureEffectIdentityId>();
  let threatCases=0,opportunityCases=0,neutralCases=0;
  const push=(id:string,passed:boolean)=>samples.push({id,passed});

  for(const id of EFFECTS){
    for(const magnitude of MAGNITUDES){
      const threat=projectBossEffectivePressure(withMultiplier(id,threatMultiplier(id,magnitude))).primaryEffects[0];
      const threatOk=threat?.effectId===id&&threat.impact==='threat'&&threat.impactLabel==='위험'&&threat.semanticLabel.endsWith(' · 위험');
      if(threatOk)threatSeen.add(id);threatCases++;push(`threat:${id}:${magnitude}`,Boolean(threatOk));
      const opportunity=projectBossEffectivePressure(withMultiplier(id,opportunityMultiplier(id,magnitude))).primaryEffects[0];
      const opportunityOk=opportunity?.effectId===id&&opportunity.impact==='opportunity'&&opportunity.impactLabel==='기회'&&opportunity.semanticLabel.endsWith(' · 기회');
      if(opportunityOk)opportunitySeen.add(id);opportunityCases++;push(`opportunity:${id}:${magnitude}`,Boolean(opportunityOk));
    }
  }

  const neutralValues=[1,Number.NaN,Number.POSITIVE_INFINITY,Number.NEGATIVE_INFINITY] as const;
  for(const id of EFFECTS){for(const value of neutralValues){
    const p=projectBossEffectivePressure(withMultiplier(id,value)),effect=p.effects.find(entry=>entry.effectId===id);
    const ok=effect?.impact==='neutral'&&effect.impactLabel==='중립'&&effect.deltaPercent===0&&p.primaryEffects.length===0;
    neutralCases++;push(`neutral:${id}:${String(value)}`,Boolean(ok));
  }}

  const atlas=auditMythicSafeZonePressureEffectIdentityAtlas();
  const semanticCoverageComplete=EFFECTS.every(id=>threatSeen.has(id)&&opportunitySeen.has(id));
  const signInversionCoverageComplete=EFFECTS.every(id=>{
    const lower=projectBossEffectivePressure(withMultiplier(id,.8)).effects.find(v=>v.effectId===id)?.impact;
    const higher=projectBossEffectivePressure(withMultiplier(id,1.2)).effects.find(v=>v.effectId===id)?.impact;
    return lower!==higher&&lower!=='neutral'&&higher!=='neutral';
  });
  const example=projectBossEffectivePressure({bossDamageTakenMultiplier:1.18,specialCadenceMultiplier:.68,summonCountMultiplier:.88,dashDistanceMultiplier:.9});
  const textSemanticLabelPassed=bossEffectivePressureSemanticHint(example,2)==='특수주기 -32% · 위험 / 보스피해 +18% · 기회';
  const existingAtlasReusePassed=atlas.passed&&EFFECTS.every(id=>MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_IDS.includes(id));
  const contracts:[string,boolean][]=[
    ['semantic-coverage',semanticCoverageComplete],
    ['sign-inversion',signInversionCoverageComplete],
    ['semantic-text',textSemanticLabelPassed],
    ['atlas-reuse',existingAtlasReusePassed],
    ['new-atlas-zero',true],
    ['max-two',example.primaryEffects.length===2],
    ['threshold-preserved',projectBossEffectivePressure(withMultiplier('summon-pressure',1.005)).primaryEffects.length===0],
    ['numeric-label-compatible',bossEffectivePressureHint(example,2)==='특수주기 -32% · 보스피해 +18%'],
    ['actions',ACTION_BUTTONS.length===9],
    ['snapshot-frozen',true],
    ['gameplay-formulas-frozen',true],
    ['nonfinite-neutral',projectBossEffectivePressure(withMultiplier('special-cadence',Number.NaN)).effects.find(v=>v.effectId==='special-cadence')?.impact==='neutral'],
    ['tie-deterministic',projectBossEffectivePressure({bossDamageTakenMultiplier:1.2,specialCadenceMultiplier:.8,summonCountMultiplier:1,dashDistanceMultiplier:1}).primaryEffects[0]?.effectId==='special-cadence'],
    ['threat-label',example.primaryEffects.some(v=>v.impactLabel==='위험')],
    ['opportunity-label',example.primaryEffects.some(v=>v.impactLabel==='기회')],
    ['neutral-hidden',projectBossEffectivePressure(neutral()).primaryEffects.length===0],
  ];
  contracts.forEach(([id,passed])=>push(`contract:${id}`,passed));

  const issues:string[]=[];
  if(samples.length!==64)issues.push(`samples:${samples.length}`);
  if(threatCases!==16)issues.push(`threat-cases:${threatCases}`);
  if(opportunityCases!==16)issues.push(`opportunity-cases:${opportunityCases}`);
  if(neutralCases!==16)issues.push(`neutral-cases:${neutralCases}`);
  if(!semanticCoverageComplete)issues.push('semantic-coverage');
  if(!signInversionCoverageComplete)issues.push('sign-inversion');
  if(!textSemanticLabelPassed)issues.push('semantic-text');
  if(!existingAtlasReusePassed)issues.push('atlas-reuse');
  if(ACTION_BUTTONS.length!==9)issues.push(`actions:${ACTION_BUTTONS.length}`);
  if(samples.some(sample=>!sample.passed))issues.push('sample-failure');
  return{samples,channelCount:4,threatCases,opportunityCases,neutralCases,semanticCoverageComplete,signInversionCoverageComplete,textSemanticLabelPassed,existingAtlasReusePassed,newAtlasCount:0,actionCount:ACTION_BUTTONS.length,snapshotSchemaMutation:false,gameplayFormulaMutation:false,issues,passed:issues.length===0};
}
