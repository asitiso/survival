import { ACTION_BUTTONS } from './config.js';
import {
  acceptContract, advanceContract, contractOfferTimeMs, createContractOffer, createDefaultContractState, getContractModifiers,
  type ActiveContract, type ContractFamily, type ContractRuntimeState,
} from './endless/contracts.js';
import { createDefaultExtensionState, restoreExtension, serializeExtension } from './endless/snapshot.js';
import type { LegacyRunView } from './endless/types.js';
import { RUN_CONTRACT_RECALL_IDS, activeRunContractBoonRecall, auditRunContractBoonRecallAtlas, runContractRecallIcon } from './run-contract-boon-recall-assets.js';

export interface RunContractBoonRecallAssetSample{caseId:string;family?:ContractFamily;passed:boolean;}
export interface RunContractBoonRecallAssetAudit{
  samples:RunContractBoonRecallAssetSample[];contractCount:number;coverage:number;uniqueCellCount:number;outOfBounds:ContractFamily[];
  acceptToastCoverage:number;successToastCoverage:number;failureToastCoverage:number;activeBoonCoverage:number;fallbackCoverage:number;countdownCoverage:number;maxVisibleBoonIcons:1;
  textFallbackPreserved:boolean;imageLoadFailureNonBlocking:boolean;iconMotionAmplitude:number;
  offerScheduleMutation:boolean;offerChoiceMutation:boolean;failureContractMutation:boolean;boonDurationMutation:boolean;modifierContractMutation:boolean;expiryContractMutation:boolean;
  actionCount:number;snapshotSchemaMutation:boolean;issues:string[];passed:boolean;
}

const legacy=(elapsedMs:number,overrides:Partial<LegacyRunView>={}):LegacyRunView=>({
  heroId:'arkan',elapsedMs,level:30,threat:5,kills:500,bossesDefeated:5,elitesDefeated:20,gold:1000,xp:10000,guardianCoreHp:1000,guardianCoreMaxHp:1000,
  fate:'frenzy',spellFusionCount:2,mapEvolutionRank:2,masteryLevel:20,deviceClass:'high',...overrides,
});
const same=(a:unknown,b:unknown)=>JSON.stringify(a)===JSON.stringify(b);
const active=(family:ContractFamily,overrides:Partial<ActiveContract>={}):ActiveContract=>({contractId:`audit:${family}`,family,startedAtMs:240_000,deadlineMs:300_000,target:1,progress:0,baselineCoreHp:1000,...overrides});

export function auditRunContractBoonRecallAssets():RunContractBoonRecallAssetAudit{
  const atlas=auditRunContractBoonRecallAtlas();const samples:RunContractBoonRecallAssetSample[]=[];
  const push=(caseId:string,passed:boolean,family?:ContractFamily):void=>{samples.push({caseId,passed,...(family?{family}:{})});};
  const acceptCoverage=new Set<ContractFamily>(),successCoverage=new Set<ContractFamily>(),failureCoverage=new Set<ContractFamily>(),activeCoverage=new Set<ContractFamily>(),fallbackCoverageSet=new Set<ContractFamily>(),countdownCoverageSet=new Set<ContractFamily>();
  let textFallbackPreserved=true,imageLoadFailureNonBlocking=true,iconMotionAmplitude=0;

  for(const family of RUN_CONTRACT_RECALL_IDS){
    const icon=runContractRecallIcon(family);const recall=activeRunContractBoonRecall([{family,expiresAtMs:190_000}],100_001);
    const body=icon.sx>=0&&icon.sy>=0&&icon.sx+icon.sw<=672&&icon.sy+icon.sh<=480;
    push(`${family}:body`,body,family);
    push(`${family}:atlas-reuse`,icon.atlasSrc==='./assets/ui/deep-run-decision-icons.png',family);
    push(`${family}:accept-toast`,icon.acceptToastIdentitySupported,family);
    push(`${family}:success-toast`,icon.outcomeToastIdentitySupported,family);
    push(`${family}:failure-toast`,icon.outcomeToastIdentitySupported,family);
    push(`${family}:active-boon`,icon.activeBoonIdentitySupported&&recall?.family===family,family);
    push(`${family}:fallback`,icon.textFallbackPreserved,family);
    push(`${family}:non-blocking`,!icon.loadFailureBlocksGameplay,family);
    push(`${family}:static`,!icon.animated&&icon.motionAmplitude===0,family);
    push(`${family}:countdown`,recall?.remainingSeconds===90&&activeRunContractBoonRecall([{family,expiresAtMs:190_000}],190_000)===null,family);
    if(icon.acceptToastIdentitySupported)acceptCoverage.add(family);if(icon.outcomeToastIdentitySupported){successCoverage.add(family);failureCoverage.add(family);}if(icon.activeBoonIdentitySupported)activeCoverage.add(family);if(icon.textFallbackPreserved)fallbackCoverageSet.add(family);if(recall?.remainingSeconds===90)countdownCoverageSet.add(family);
    textFallbackPreserved&&=icon.textFallbackPreserved;imageLoadFailureNonBlocking&&=!icon.loadFailureBlocksGameplay;iconMotionAmplitude=Math.max(iconMotionAmplitude,icon.motionAmplitude);
  }

  const scheduleOk=same([0,1,2,3,4,5].map(contractOfferTimeMs),[4,9,14,19,26,33].map(m=>m*60_000));push('contract:offer-schedule',scheduleOk);
  const offered=createContractOffer(legacy(240_000),createDefaultContractState(),{seed:29,cursor:0});
  const threeChoiceOk=offered.offer.options.length===3&&new Set(offered.offer.options.map(option=>option.family)).size===3;push('contract:three-unique-options',threeChoiceOk);
  const blockedOffer=createContractOffer(legacy(240_000),{...createDefaultContractState(),offerHistory:['slayer','slayer','warden']},{seed:11,cursor:0});
  const blockedOk=blockedOffer.offer.options.every(option=>option.family!=='slayer');push('contract:recent-family-block',blockedOk);

  const wardenBase:ContractRuntimeState={...createDefaultContractState(),active:active('warden',{target:30_000,deadlineMs:270_000,baselineCoreHp:1000})};
  const wardenSafe=advanceContract(wardenBase,legacy(250_000,{guardianCoreHp:800}),[],10_000);const wardenFail=advanceContract(wardenBase,legacy(250_000,{guardianCoreHp:799}),[],10_000);
  const wardenOk=Boolean(wardenSafe.state.active)&&!wardenSafe.effects.some(effect=>effect.type==='contract_failed')&&!wardenFail.state.active&&wardenFail.effects.some(effect=>effect.type==='contract_failed');push('contract:warden-20pct-core-loss',wardenOk);
  const survivorBase:ContractRuntimeState={...createDefaultContractState(),active:active('survivor',{target:20_000,deadlineMs:260_000})};
  const survivorFail=advanceContract(survivorBase,legacy(245_000),[{type:'hero_damaged',amount:1}],1_000);const survivorOk=!survivorFail.state.active&&survivorFail.effects.some(effect=>effect.type==='contract_failed');push('contract:survivor-no-hit',survivorOk);

  const slayerOption={optionId:'audit-offer:slayer',family:'slayer' as const,title:'Slayer Contract',description:'Defeat 1 enemy',target:1,durationMs:45_000};
  const accepted=acceptContract({...createDefaultContractState(),pendingOffer:{offerId:'audit-offer',generatedAtMs:240_000,options:[slayerOption,{...slayerOption,optionId:'audit-offer:warden',family:'warden',title:'Warden Contract'},{...slayerOption,optionId:'audit-offer:arcane',family:'arcane',title:'Arcane Contract'}]}},slayerOption.optionId,240_000,1000);
  const completed=advanceContract(accepted,legacy(250_000),[{type:'enemy_killed'}],10_000);const boon=completed.state.boons.at(-1);
  const boonDurationOk=boon?.family==='slayer'&&boon.expiresAtMs===340_000;push('contract:boon-90s',boonDurationOk);

  const modifierOk=
    same(getContractModifiers({...createDefaultContractState(),boons:[{family:'slayer',expiresAtMs:1000}]},0),{xpMultiplier:1.12,masteryMultiplier:1.08,goldMultiplier:1,coreDamageTakenMultiplier:1,cooldownMultiplier:1,bossDamageMultiplier:1,fusionPowerMultiplier:1,potionEfficiency:1})&&
    same(getContractModifiers({...createDefaultContractState(),boons:[{family:'warden',expiresAtMs:1000}]},0),{xpMultiplier:1,masteryMultiplier:1,goldMultiplier:1,coreDamageTakenMultiplier:.88,cooldownMultiplier:1,bossDamageMultiplier:1,fusionPowerMultiplier:1,potionEfficiency:1.1})&&
    same(getContractModifiers({...createDefaultContractState(),boons:[{family:'arcane',expiresAtMs:1000}]},0),{xpMultiplier:1,masteryMultiplier:1,goldMultiplier:1,coreDamageTakenMultiplier:1,cooldownMultiplier:.92,bossDamageMultiplier:1,fusionPowerMultiplier:1.1,potionEfficiency:1})&&
    same(getContractModifiers({...createDefaultContractState(),boons:[{family:'hunter',expiresAtMs:1000}]},0),{xpMultiplier:1,masteryMultiplier:1,goldMultiplier:1.15,coreDamageTakenMultiplier:1,cooldownMultiplier:1,bossDamageMultiplier:1.08,fusionPowerMultiplier:1,potionEfficiency:1})&&
    same(getContractModifiers({...createDefaultContractState(),boons:[{family:'survivor',expiresAtMs:1000}]},0),{xpMultiplier:1,masteryMultiplier:1,goldMultiplier:1,coreDamageTakenMultiplier:.92,cooldownMultiplier:1,bossDamageMultiplier:1,fusionPowerMultiplier:1,potionEfficiency:1.15});
  push('contract:boon-modifiers',modifierOk);
  const expired=advanceContract(completed.state,legacy(340_000),[],1);const expiryOk=expired.state.boons.length===0&&same(getContractModifiers(expired.state,340_000),{xpMultiplier:1,masteryMultiplier:1,goldMultiplier:1,coreDamageTakenMultiplier:1,cooldownMultiplier:1,bossDamageMultiplier:1,fusionPowerMultiplier:1,potionEfficiency:1});push('contract:boon-expiry',expiryOk);
  const latestOnly=activeRunContractBoonRecall([{family:'slayer',expiresAtMs:180_000},{family:'hunter',expiresAtMs:190_000}],100_000)?.family==='hunter';push('presentation:max-one-active-boon',latestOnly);

  const extension=createDefaultExtensionState(17);extension.contracts={...createDefaultContractState(),boons:[{family:'arcane',expiresAtMs:999_999}]};
  const restored=restoreExtension(serializeExtension(extension),1);const snapshotRoundTrip=restored.contracts.boons.length===1&&restored.contracts.boons[0]?.family==='arcane'&&restored.contracts.boons[0]?.expiresAtMs===999_999;
  const actionCount=ACTION_BUTTONS.length,snapshotSchemaMutation=!snapshotRoundTrip;push('contract:actions-snapshot',actionCount===9&&snapshotRoundTrip);

  const acceptToastCoverage=acceptCoverage.size/5,successToastCoverage=successCoverage.size/5,failureToastCoverage=failureCoverage.size/5,activeBoonCoverage=activeCoverage.size/5,fallbackCoverage=fallbackCoverageSet.size/5,countdownCoverage=countdownCoverageSet.size/5;
  const offerScheduleMutation=!scheduleOk,offerChoiceMutation=!(threeChoiceOk&&blockedOk),failureContractMutation=!(wardenOk&&survivorOk),boonDurationMutation=!boonDurationOk,modifierContractMutation=!modifierOk,expiryContractMutation=!expiryOk;
  const issues:string[]=[];
  if(samples.length!==60)issues.push(`samples:${samples.length}`);if(!atlas.passed)issues.push('atlas');if(acceptToastCoverage!==1)issues.push('accept-toast-coverage');if(successToastCoverage!==1)issues.push('success-toast-coverage');if(failureToastCoverage!==1)issues.push('failure-toast-coverage');if(activeBoonCoverage!==1)issues.push('active-boon-coverage');if(fallbackCoverage!==1)issues.push('fallback-coverage');if(countdownCoverage!==1)issues.push('countdown-coverage');
  if(!textFallbackPreserved)issues.push('text-fallback');if(!imageLoadFailureNonBlocking)issues.push('blocking');if(iconMotionAmplitude!==0)issues.push('motion');if(offerScheduleMutation)issues.push('offer-schedule-mutation');if(offerChoiceMutation)issues.push('offer-choice-mutation');if(failureContractMutation)issues.push('failure-contract-mutation');if(boonDurationMutation)issues.push('boon-duration-mutation');if(modifierContractMutation)issues.push('modifier-contract-mutation');if(expiryContractMutation)issues.push('expiry-contract-mutation');if(actionCount!==9)issues.push(`actions:${actionCount}`);if(snapshotSchemaMutation)issues.push('snapshot-schema-mutation');if(samples.some(sample=>!sample.passed))issues.push('sample-failure');
  return{samples,contractCount:5,coverage:atlas.coverage,uniqueCellCount:atlas.uniqueCellCount,outOfBounds:[...atlas.outOfBounds],acceptToastCoverage,successToastCoverage,failureToastCoverage,activeBoonCoverage,fallbackCoverage,countdownCoverage,maxVisibleBoonIcons:1,textFallbackPreserved,imageLoadFailureNonBlocking,iconMotionAmplitude,offerScheduleMutation,offerChoiceMutation,failureContractMutation,boonDurationMutation,modifierContractMutation,expiryContractMutation,actionCount,snapshotSchemaMutation,issues,passed:issues.length===0};
}
