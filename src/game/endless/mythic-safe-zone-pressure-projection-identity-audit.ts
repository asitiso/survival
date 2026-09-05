import { ACTION_BUTTONS } from '../config.js';
import type { BossArchetype } from '../boss-patterns.js';
import { mythicSafeZoneState, type MythicSafeZonePhase } from './mythic-safe-zone.js';
import { mythicSafeZonePressure } from './mythic-safe-zone-pressure.js';
import { MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_IDS,auditMythicSafeZonePressureEffectIdentityAtlas,mythicSafeZonePressureEffectIdentityIcon } from './mythic-safe-zone-pressure-effect-identity-assets.js';
import { mythicSafeZonePressureEffectHint, projectMythicSafeZonePressureEffects } from './mythic-safe-zone-pressure-projection.js';

const ARCHETYPES:readonly BossArchetype[]=['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'];
const PHASES:readonly {phase:MythicSafeZonePhase;ms:number}[]=[{phase:'stable',ms:1000},{phase:'collapse',ms:5200},{phase:'collapsed',ms:7000},{phase:'reform',ms:8400}];
const RATIOS= [0,.5,1] as const;
const close=(a:number,b:number):boolean=>Math.abs(a-b)<.0006;
const rounded=(v:number):number=>Math.round((v+Number.EPSILON)*1000)/1000;

export function auditMythicSafeZonePressureProjectionIdentityAssets(){
  const samples:{id:string;passed:boolean}[]=[],issues:string[]=[],atlas=auditMythicSafeZonePressureEffectIdentityAtlas();
  const archetypeCoverage=new Set<BossArchetype>(),phaseCoverage=new Set<MythicSafeZonePhase>(),ratioCoverage=new Set<number>(),identityCoverage=new Set<string>();
  for(const archetype of ARCHETYPES)for(const entry of PHASES)for(const ratio of RATIOS){
    const zone=mythicSafeZoneState(archetype,entry.ms,1600,900,ratio),authoritative=mythicSafeZonePressure(archetype,zone,ratio),projection=projectMythicSafeZonePressureEffects(archetype,zone,ratio);
    archetypeCoverage.add(archetype);phaseCoverage.add(zone.phase);ratioCoverage.add(ratio);for(const effect of projection.effects)identityCoverage.add(effect.effectId);
    const cadence=projection.effects.find(effect=>effect.effectId==='special-cadence')!;
    const summon=projection.effects.find(effect=>effect.effectId==='summon-pressure')!;
    const dash=projection.effects.find(effect=>effect.effectId==='dash-distance')!;
    const vulnerability=projection.effects.find(effect=>effect.effectId==='boss-vulnerability')!;
    const valuesOk=close(cadence.after,rounded(authoritative.specialCadenceMultiplier))&&close(summon.after,rounded(authoritative.summonCountMultiplier))&&close(dash.after,rounded(authoritative.dashDistanceMultiplier))&&close(vulnerability.after,rounded(authoritative.bossDamageTakenMultiplier));
    samples.push({id:`${archetype}:${entry.phase}:r${ratio}:projection`,passed:zone.phase===entry.phase&&projection.phase===entry.phase&&projection.destroyedWeakpointRatio===ratio&&valuesOk&&projection.primaryEffects.length===2&&projection.effects.length===4});
  }
  for(const id of MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_IDS){const icon=mythicSafeZonePressureEffectIdentityIcon(id);samples.push({id:`identity:${id}:static`,passed:icon.animated===false&&icon.motionAmplitude===0});samples.push({id:`identity:${id}:safe`,passed:icon.safeZoneHelperSupported&&icon.maxVisibleHelperIcons===2&&icon.textFallbackPreserved&&!icon.loadFailureBlocksGameplay});}
  const collapsed=projectMythicSafeZonePressureEffects('inferno',mythicSafeZoneState('inferno',7000,1600,900,0),0);
  const stable=projectMythicSafeZonePressureEffects('inferno',mythicSafeZoneState('inferno',1000,1600,900,0),0);
  const rawSummoner=projectMythicSafeZonePressureEffects('summoner',mythicSafeZoneState('summoner',7000,1600,900,0),0);
  const clearSummoner=projectMythicSafeZonePressureEffects('summoner',mythicSafeZoneState('summoner',7000,1600,900,1),1);
  const neutral=projectMythicSafeZonePressureEffects('inferno',null,0);
  const rawCadence=rawSummoner.effects.find(effect=>effect.effectId==='special-cadence')!;
  const clearCadence=clearSummoner.effects.find(effect=>effect.effectId==='special-cadence')!;
  const rawSummon=rawSummoner.effects.find(effect=>effect.effectId==='summon-pressure')!;
  const clearSummon=clearSummoner.effects.find(effect=>effect.effectId==='summon-pressure')!;
  const invariants=[
    atlas.passed,ACTION_BUTTONS.length===9,collapsed.maxPrimaryEffects===2,
    collapsed.primaryEffects[0]?.effectId==='special-cadence'&&collapsed.primaryEffects[1]?.effectId==='summon-pressure',
    collapsed.effects.find(effect=>effect.effectId==='special-cadence')?.label==='특수주기 -19.6%',stable.effects.find(effect=>effect.effectId==='special-cadence')!.deltaPercent>0,
    clearCadence.after>rawCadence.after,clearSummon.after<rawSummon.after,
    PHASES.length===4,ARCHETYPES.length===6,RATIOS.length===3,MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_IDS.length===4,
    MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_IDS.every(id=>!mythicSafeZonePressureEffectIdentityIcon(id).animated),
    MYTHIC_SAFE_ZONE_PRESSURE_EFFECT_IDENTITY_IDS.every(id=>mythicSafeZonePressureEffectIdentityIcon(id).textFallbackPreserved),
    neutral.effects.every(effect=>effect.deltaPercent===0),mythicSafeZonePressureEffectHint(collapsed,2).length<=27,
  ];
  invariants.forEach((passed,index)=>samples.push({id:`invariant:${index}`,passed}));
  for(const sample of samples)if(!sample.passed)issues.push(sample.id);
  const archetypeCoverageComplete=archetypeCoverage.size===6,phaseCoverageComplete=phaseCoverage.size===4,destroyedRatioCoverageComplete=ratioCoverage.size===3,identityCoverageComplete=identityCoverage.size===4;
  if(!archetypeCoverageComplete)issues.push('archetype-coverage');if(!phaseCoverageComplete)issues.push('phase-coverage');if(!destroyedRatioCoverageComplete)issues.push('ratio-coverage');if(!identityCoverageComplete)issues.push('identity-coverage');if(samples.length!==96)issues.push(`sample-count:${samples.length}`);
  return {passed:issues.length===0,samples,archetypeCount:6,phaseCount:4,destroyedRatioCount:3,identityCount:4,archetypeCoverageComplete,phaseCoverageComplete,destroyedRatioCoverageComplete,identityCoverageComplete,maxPrimaryEffects:2,actionCount:ACTION_BUTTONS.length,snapshotSchemaMutation:false,gameplayMutation:false,issues};
}
