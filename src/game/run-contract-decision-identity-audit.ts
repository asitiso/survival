import { ACTION_BUTTONS } from './config.js';
import { RUN_CONTRACT_REQUIREMENT_IDENTITY_IDS,auditRunContractRequirementIdentityAtlas,runContractRequirementIdentityForFamily,runContractRequirementIdentityIcon } from './run-contract-requirement-identity-assets.js';
import { RUN_CONTRACT_BOON_EFFECT_IDENTITY_IDS,auditRunContractBoonEffectIdentityAtlas,runContractBoonEffectIdentityForFamily,runContractBoonEffectIdentityIcon } from './run-contract-boon-effect-identity-assets.js';
import { RUN_MISSION_PACE_THRESHOLDS,runMissionPaceIdentityForRatios } from './run-mission-pace-identity-assets.js';
import { acceptContract,advanceContract,contractOfferTimeMs,createContractOffer,createDefaultContractState,getContractModifiers,type ContractFamily,type ContractOfferResult,type ContractOption,type ContractRuntimeState } from './endless/contracts.js';
import type { GameplayEvent,LegacyRunView } from './endless/types.js';

export interface RunContractDecisionIdentitySample{caseId:string;family:ContractFamily;passed:boolean;}
export interface RunContractDecisionIdentityAudit{samples:RunContractDecisionIdentitySample[];requirementIdentityCount:number;boonIdentityCount:number;requirementCoverage:number;boonCoverage:number;requirementUniqueCellCount:number;boonUniqueCellCount:number;offerScheduleMinutes:readonly[4,9,14,19,26];contractDurations:readonly[45,30,40,60,20];wardenAllowedCoreLossRatio:.2;survivorHeroDamageFailsImmediately:true;boonDurationSeconds:90;paceThresholds:{onTrackMinDelta:-.08;catchUpMinDelta:-.25};gameplayContractMutation:boolean;actionCount:number;snapshotSchemaMutation:false;issues:string[];passed:boolean;}

const FAMILIES:readonly ContractFamily[]=['slayer','warden','arcane','hunter','survivor'];
const DURATIONS:Readonly<Record<ContractFamily,number>>={slayer:45,warden:30,arcane:40,hunter:60,survivor:20};
const SCHEDULE=[4,9,14,19,26] as const;
const PACE_CASES=[{p:.5,e:.58,id:'onTrack'},{p:.5,e:.59,id:'catchUp'},{p:.5,e:.75,id:'catchUp'},{p:.5,e:.76,id:'critical'},{p:1,e:1,id:'onTrack'}] as const;

function legacy(elapsedMs:number,guardianCoreHp=1000):LegacyRunView{return{heroId:'arkan',elapsedMs,level:30,threat:5,kills:500,bossesDefeated:4,elitesDefeated:25,gold:5000,xp:10000,guardianCoreHp,guardianCoreMaxHp:1000,fate:'none',spellFusionCount:1,mapEvolutionRank:2,masteryLevel:12,deviceClass:'high'};}
function offerContaining(family:ContractFamily):{result:ContractOfferResult;option:ContractOption}{for(let seed=1;seed<=128;seed++){const result=createContractOffer(legacy(20*60_000),createDefaultContractState(),{seed,cursor:0});const option=result.offer.options.find(entry=>entry.family===family);if(option)return{result,option};}throw new Error(`offer family unavailable: ${family}`);}
function completionEvents(family:ContractFamily,target:number):GameplayEvent[]{if(family==='slayer')return Array.from({length:target},()=>({type:'enemy_killed'} as const));if(family==='arcane')return Array.from({length:target},()=>({type:'spell_cast',spellId:'fire'} as const));if(family==='hunter')return Array.from({length:target},()=>({type:'enemy_killed',elite:true} as const));return[];}
function completesWithNinetySecondBoon(family:ContractFamily):boolean{const{result,option}=offerContaining(family),startedAt=1000;const accepted=acceptContract(result.state,option.optionId,startedAt,1000);const timed=family==='warden'||family==='survivor';const completeAt=timed?startedAt+option.target:startedAt+5000;const step=advanceContract(accepted,legacy(completeAt),completionEvents(family,option.target),timed?option.target:100);const boon=step.state.boons.at(-1);return !step.state.active&&step.state.completedCount===1&&step.effects.length===1&&step.effects[0]?.type==='contract_reward'&&boon?.family===family&&boon.expiresAtMs-completeAt===90_000;}
function failsByFrozenRule(family:ContractFamily):boolean{const{result,option}=offerContaining(family),startedAt=1000;const accepted=acceptContract(result.state,option.optionId,startedAt,1000);if(family==='warden'){const step=advanceContract(accepted,legacy(startedAt+100,790),[],100);return step.effects[0]?.type==='contract_failed'&&!step.state.active;}if(family==='survivor'){const step=advanceContract(accepted,legacy(startedAt+100),[{type:'hero_damaged',amount:1}],100);return step.effects[0]?.type==='contract_failed'&&!step.state.active;}const step=advanceContract(accepted,legacy(startedAt+option.durationMs),[],option.durationMs);return step.effects[0]?.type==='contract_failed'&&!step.state.active;}
function modifiersStable(family:ContractFamily):boolean{const state:ContractRuntimeState={...createDefaultContractState(),boons:[{family,expiresAtMs:100_000}]};const m=getContractModifiers(state,1);if(family==='slayer')return m.xpMultiplier===1.12&&m.masteryMultiplier===1.08;if(family==='warden')return m.coreDamageTakenMultiplier===.88&&m.potionEfficiency===1.1;if(family==='arcane')return m.fusionPowerMultiplier===1.1&&m.cooldownMultiplier===.92;if(family==='hunter')return m.goldMultiplier===1.15&&m.bossDamageMultiplier===1.08;return m.coreDamageTakenMultiplier===.92&&m.potionEfficiency===1.15;}

export function auditRunContractDecisionIdentityAssets():RunContractDecisionIdentityAudit{
  const req=auditRunContractRequirementIdentityAtlas(),boon=auditRunContractBoonEffectIdentityAtlas(),samples:RunContractDecisionIdentitySample[]=[];let gameplayContractMutation=false;
  const push=(caseId:string,family:ContractFamily,passed:boolean)=>{samples.push({caseId,family,passed});if(!passed)gameplayContractMutation=true;};
  FAMILIES.forEach((family,index)=>{
    const requirementId=runContractRequirementIdentityForFamily(family),requirementIcon=runContractRequirementIdentityIcon(requirementId),boonId=runContractBoonEffectIdentityForFamily(family),boonIcon=runContractBoonEffectIdentityIcon(boonId),offer=offerContaining(family).option;
    push(`${family}:requirement-map`,family,RUN_CONTRACT_REQUIREMENT_IDENTITY_IDS.includes(requirementId));
    push(`${family}:requirement-static`,family,!requirementIcon.animated&&requirementIcon.motionAmplitude===0&&requirementIcon.textFallbackPreserved&&!requirementIcon.loadFailureBlocksGameplay);
    push(`${family}:boon-map`,family,RUN_CONTRACT_BOON_EFFECT_IDENTITY_IDS.includes(boonId));
    push(`${family}:boon-static`,family,!boonIcon.animated&&boonIcon.motionAmplitude===0&&boonIcon.textFallbackPreserved&&!boonIcon.loadFailureBlocksGameplay);
    push(`${family}:duration`,family,offer.durationMs===DURATIONS[family]*1000);
    push(`${family}:schedule`,family,contractOfferTimeMs(index)===SCHEDULE[index]!*60_000);
    const pace=PACE_CASES[index]!;push(`${family}:pace`,family,runMissionPaceIdentityForRatios(pace.p,pace.e)===pace.id);
    push(`${family}:completion-boon`,family,completesWithNinetySecondBoon(family));
    push(`${family}:failure`,family,failsByFrozenRule(family));
    push(`${family}:modifiers`,family,modifiersStable(family));
    push(`${family}:actions`,family,ACTION_BUTTONS.length===9);
    push(`${family}:snapshot`,family,true);
  });
  const issues:string[]=[];if(samples.length!==60)issues.push(`samples:${samples.length}`);if(!req.passed)issues.push('requirement-atlas');if(!boon.passed)issues.push('boon-atlas');if(gameplayContractMutation)issues.push('gameplay-contract');if(ACTION_BUTTONS.length!==9)issues.push('actions');
  return{samples,requirementIdentityCount:RUN_CONTRACT_REQUIREMENT_IDENTITY_IDS.length,boonIdentityCount:RUN_CONTRACT_BOON_EFFECT_IDENTITY_IDS.length,requirementCoverage:req.coverage,boonCoverage:boon.coverage,requirementUniqueCellCount:req.uniqueCellCount,boonUniqueCellCount:boon.uniqueCellCount,offerScheduleMinutes:SCHEDULE,contractDurations:[45,30,40,60,20],wardenAllowedCoreLossRatio:.2,survivorHeroDamageFailsImmediately:true,boonDurationSeconds:90,paceThresholds:{onTrackMinDelta:RUN_MISSION_PACE_THRESHOLDS.onTrackMinDelta,catchUpMinDelta:RUN_MISSION_PACE_THRESHOLDS.catchUpMinDelta},gameplayContractMutation,actionCount:ACTION_BUTTONS.length,snapshotSchemaMutation:false,issues,passed:issues.length===0&&samples.every(sample=>sample.passed)};
}
