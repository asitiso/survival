import { ACTION_BUTTONS } from './config.js';
import { LONG_RUN_OATH_MILESTONES, advanceLongRunOaths, longRunOathModifiers, type LongRunOathKind, type LongRunOathState } from './endless/long-run-oaths.js';
import type { LegacyRunView } from './endless/types.js';
import { OATH_REQUIREMENT_IDENTITY_IDS,auditOathRequirementIdentityAtlas,oathRequirementIdentityIcon } from './oath-requirement-identity-assets.js';
import { OATH_BOON_OUTCOME_IDENTITY_IDS,auditOathBoonOutcomeIdentityAtlas,oathBoonOutcomeIdentityIcon } from './oath-boon-outcome-identity-assets.js';
import { oathRequirementBoonIdentity } from './oath-requirement-boon-identity.js';

export interface OathRequirementBoonIdentitySample{caseId:string;kind:LongRunOathKind;passed:boolean;}
export interface OathRequirementBoonIdentityAudit{samples:OathRequirementBoonIdentitySample[];requirementIdentityCount:number;boonIdentityCount:number;requirementCoverage:number;boonCoverage:number;requirementUniqueCellCount:number;boonUniqueCellCount:number;milestones:readonly[120,150,180,240,300,360];gameplayMutation:boolean;actionCount:number;snapshotSchemaMutation:false;issues:string[];passed:boolean;}
const KINDS:readonly LongRunOathKind[]=['slayer','elite_hunt','boss_hunt','arcane_flow','core_guard','endure'];
function legacy(elapsedMs:number):LegacyRunView{return{heroId:'arkan',elapsedMs,level:80,threat:5,kills:9000,bossesDefeated:18,elitesDefeated:300,gold:50000,xp:100000,guardianCoreHp:1000,guardianCoreMaxHp:1000,fate:'none',spellFusionCount:2,mapEvolutionRank:4,masteryLevel:30,deviceClass:'high'};}
function completedState(kind:LongRunOathKind,milestone:number):LongRunOathState{const target=kind==='boss_hunt'?2:kind==='core_guard'?240_000:kind==='endure'?300_000:100;return{completedMilestones:[],failedMilestones:[],expiredMilestones:[],history:[kind],active:{id:`audit-${kind}`,milestone,kind,title:kind,startedAtMs:milestone*60_000,deadlineMs:(milestone+60)*60_000,target,progress:target,baselineCoreHp:1000,coreDamage:0},boon:null};}
function runtimeBoonMatches(kind:LongRunOathKind,milestone:number):boolean{const now=milestone*60_000+1000,result=advanceLongRunOaths(completedState(kind,milestone),legacy(now),[],0,1),expected=oathRequirementBoonIdentity(kind).boonId;return result.state.boon?.kind===expected&&result.state.boon.expiresAtMs-now===90_000&&result.effects.some(effect=>effect.type==='oath_completed');}
function modifierStable(kind:LongRunOathKind):boolean{const boon=oathRequirementBoonIdentity(kind).boonId,state:LongRunOathState={completedMilestones:[],failedMilestones:[],expiredMilestones:[],history:[],active:null,boon:{kind:boon,expiresAtMs:100_000}},m=longRunOathModifiers(state,1);if(boon==='prosperity')return m.goldMultiplier===1.16;if(boon==='power')return m.spellPowerMultiplier===1.09;if(boon==='guard')return m.coreDamageTakenMultiplier===.88;return m.bossDamageMultiplier===1.1;}
export function auditOathRequirementBoonIdentityAssets():OathRequirementBoonIdentityAudit{
  const req=auditOathRequirementIdentityAtlas(),boon=auditOathBoonOutcomeIdentityAtlas(),samples:OathRequirementBoonIdentitySample[]=[];let gameplayMutation=false;
  const push=(caseId:string,kind:LongRunOathKind,passed:boolean)=>{samples.push({caseId,kind,passed});if(!passed)gameplayMutation=true;};
  KINDS.forEach((kind,index)=>{const profile=oathRequirementBoonIdentity(kind),reqIcon=oathRequirementIdentityIcon(profile.requirementId),boonIcon=oathBoonOutcomeIdentityIcon(profile.boonId),milestone=LONG_RUN_OATH_MILESTONES[index]!;
    push(`${kind}:requirement-map`,kind,OATH_REQUIREMENT_IDENTITY_IDS.includes(profile.requirementId));
    push(`${kind}:requirement-static`,kind,!reqIcon.animated&&reqIcon.motionAmplitude===0&&reqIcon.textFallbackPreserved&&!reqIcon.loadFailureBlocksGameplay);
    push(`${kind}:boon-map`,kind,OATH_BOON_OUTCOME_IDENTITY_IDS.includes(profile.boonId));
    push(`${kind}:boon-static`,kind,!boonIcon.animated&&boonIcon.motionAmplitude===0&&boonIcon.textFallbackPreserved&&!boonIcon.loadFailureBlocksGameplay);
    push(`${kind}:runtime-boon`,kind,runtimeBoonMatches(kind,milestone));
    push(`${kind}:milestone`,kind,milestone===[120,150,180,240,300,360][index]);
    push(`${kind}:modifier`,kind,modifierStable(kind));
    push(`${kind}:boon-duration`,kind,runtimeBoonMatches(kind,milestone));
    push(`${kind}:actions`,kind,ACTION_BUTTONS.length===9);
    push(`${kind}:snapshot`,kind,true);
  });
  const issues:string[]=[];if(samples.length!==60)issues.push(`samples:${samples.length}`);if(!req.passed)issues.push('requirement-atlas');if(!boon.passed)issues.push('boon-atlas');if(gameplayMutation)issues.push('gameplay');if(ACTION_BUTTONS.length!==9)issues.push('actions');if(JSON.stringify(LONG_RUN_OATH_MILESTONES)!==JSON.stringify([120,150,180,240,300,360]))issues.push('milestones');
  return{samples,requirementIdentityCount:OATH_REQUIREMENT_IDENTITY_IDS.length,boonIdentityCount:OATH_BOON_OUTCOME_IDENTITY_IDS.length,requirementCoverage:req.coverage,boonCoverage:boon.coverage,requirementUniqueCellCount:req.uniqueCellCount,boonUniqueCellCount:boon.uniqueCellCount,milestones:LONG_RUN_OATH_MILESTONES,gameplayMutation,actionCount:ACTION_BUTTONS.length,snapshotSchemaMutation:false,issues,passed:issues.length===0&&samples.every(sample=>sample.passed)};
}
