import { ACTION_BUTTONS } from '../config.js';
import { createDefaultWorldState, evolveWorld, getWorldModifiers, shouldEvolveWorld, type FieldNodeKind, type WorldRuntimeState } from './world-evolution.js';
import type { LegacyRunView } from './types.js';
import { WORLD_EVOLUTION_IDENTITY_IDS,auditWorldEvolutionIdentityAtlas,worldEvolutionIdentityIcon,type WorldEvolutionIdentityId } from './world-evolution-identity-assets.js';

export interface WorldEvolutionIdentityAssetSample{caseId:string;id?:WorldEvolutionIdentityId;passed:boolean;}
export interface WorldEvolutionIdentityAssetAudit{
  samples:WorldEvolutionIdentityAssetSample[];worldCount:number;coverage:number;uniqueCellCount:number;outOfBounds:WorldEvolutionIdentityId[];
  toastCoverage:number;activeRecallCoverage:number;fallbackCoverage:number;maxVisibleRecallIcons:1;textFallbackPreserved:boolean;imageLoadFailureNonBlocking:boolean;iconMotionAmplitude:number;
  evolutionTimingMutation:boolean;weightedPickMutation:boolean;nodeContractMutation:boolean;modifierContractMutation:boolean;actionCount:number;snapshotSchemaMutation:false;issues:string[];passed:boolean;
}

const LEGACY_BASE:LegacyRunView={heroId:'arkan',elapsedMs:8*60_000,level:30,threat:5,kills:500,bossesDefeated:6,elitesDefeated:40,gold:5000,xp:10000,guardianCoreHp:900,guardianCoreMaxHp:1000,fate:'none',spellFusionCount:0,mapEvolutionRank:0,masteryLevel:10,deviceClass:'high'};
const expectedNode:Readonly<Record<WorldEvolutionIdentityId,{kind:FieldNodeKind;count:number;radius:number;ttlMs:number}>>={
  stormfront:{kind:'safe_corridor',count:1,radius:.25,ttlMs:45_000},
  ruins:{kind:'barricade',count:2,radius:.12,ttlMs:80_000},
  mana_bloom:{kind:'mana_well',count:2,radius:.10,ttlMs:60_000},
  blood_moon:{kind:'volatile_zone',count:2,radius:.14,ttlMs:55_000},
  sanctuary:{kind:'sanctuary_zone',count:2,radius:.13,ttlMs:65_000},
};
const expectedSeed:Readonly<Record<WorldEvolutionIdentityId,number>>={stormfront:2,ruins:4,mana_bloom:3,blood_moon:1,sanctuary:6};
function close(a:number,b:number):boolean{return Math.abs(a-b)<1e-9;}
function modifiersEqual(actual:ReturnType<typeof getWorldModifiers>,expected:ReturnType<typeof getWorldModifiers>):boolean{return Object.keys(expected).every(key=>close(actual[key as keyof typeof actual],expected[key as keyof typeof expected]));}
function expectedModifierContract():boolean{
  return modifiersEqual(getWorldModifiers('stormfront',5),{spawnMultiplier:1.105,projectileMultiplier:1.2,eliteMultiplier:1,goldMultiplier:1,masteryMultiplier:1,coreRecoveryMultiplier:1,normalSpellCadenceMultiplier:1,siegePressureMultiplier:1})
    &&modifiersEqual(getWorldModifiers('ruins',5),{spawnMultiplier:.96,projectileMultiplier:1,eliteMultiplier:1.13,goldMultiplier:1,masteryMultiplier:1,coreRecoveryMultiplier:1,normalSpellCadenceMultiplier:1,siegePressureMultiplier:1.245})
    &&modifiersEqual(getWorldModifiers('mana_bloom',5),{spawnMultiplier:1.02,projectileMultiplier:1,eliteMultiplier:1,goldMultiplier:1,masteryMultiplier:1.13,coreRecoveryMultiplier:1,normalSpellCadenceMultiplier:.9,siegePressureMultiplier:1})
    &&modifiersEqual(getWorldModifiers('blood_moon',5),{spawnMultiplier:1.205,projectileMultiplier:1,eliteMultiplier:1.27,goldMultiplier:1.245,masteryMultiplier:1.18,coreRecoveryMultiplier:1,normalSpellCadenceMultiplier:1,siegePressureMultiplier:1})
    &&modifiersEqual(getWorldModifiers('sanctuary',5),{spawnMultiplier:.92,projectileMultiplier:.94,eliteMultiplier:1,goldMultiplier:1,masteryMultiplier:1,coreRecoveryMultiplier:1.35,normalSpellCadenceMultiplier:1,siegePressureMultiplier:1});
}
function timingContract():boolean{
  const base=createDefaultWorldState();
  if(shouldEvolveWorld(base,8*60_000-1)||!shouldEvolveWorld(base,8*60_000))return false;
  const once:WorldRuntimeState={...base,evolutionCount:1,lastEvolutionAtMs:8*60_000,current:'stormfront'};
  return !shouldEvolveWorld(once,16*60_000-1)&&shouldEvolveWorld(once,16*60_000);
}
function weightedPickContract():boolean{
  for(const id of WORLD_EVOLUTION_IDENTITY_IDS){const result=evolveWorld(LEGACY_BASE,createDefaultWorldState(),{seed:expectedSeed[id],cursor:0});if(result.state.current!==id)return false;}
  const guardian=evolveWorld({...LEGACY_BASE,fate:'guardian'},createDefaultWorldState(),{seed:42,cursor:0});
  const fusion=evolveWorld({...LEGACY_BASE,spellFusionCount:2},createDefaultWorldState(),{seed:42,cursor:0});
  if(guardian.state.current!=='blood_moon'||fusion.state.current!=='mana_bloom')return false;
  const noRepeatState:{current:'mana_bloom';evolutionCount:number;lastEvolutionAtMs:number;nodes:[]}={current:'mana_bloom',evolutionCount:1,lastEvolutionAtMs:8*60_000,nodes:[]};
  return evolveWorld({...LEGACY_BASE,elapsedMs:16*60_000},noRepeatState,{seed:42,cursor:0}).state.current!=='mana_bloom';
}
function nodeContract():boolean{
  for(const id of WORLD_EVOLUTION_IDENTITY_IDS){
    const result=evolveWorld(LEGACY_BASE,createDefaultWorldState(),{seed:expectedSeed[id],cursor:0}); const plan=expectedNode[id];
    if(result.state.current!==id||result.state.nodes.length!==plan.count)return false;
    if(!result.state.nodes.every(node=>node.kind===plan.kind&&close(node.radius,plan.radius)&&node.expiresAtMs-LEGACY_BASE.elapsedMs===plan.ttlMs))return false;
  }
  return true;
}

export function auditWorldEvolutionIdentityAssets():WorldEvolutionIdentityAssetAudit{
  const atlas=auditWorldEvolutionIdentityAtlas();const samples:WorldEvolutionIdentityAssetSample[]=[];
  const push=(caseId:string,passed:boolean,id?:WorldEvolutionIdentityId):void=>{samples.push({caseId,passed,...(id?{id}:{})});};
  const toast=new Set<WorldEvolutionIdentityId>(),recall=new Set<WorldEvolutionIdentityId>(),fallback=new Set<WorldEvolutionIdentityId>();
  const timingOk=timingContract(),weightedOk=weightedPickContract(),nodeOk=nodeContract(),modifierOk=expectedModifierContract();
  let textFallbackPreserved=true,imageLoadFailureNonBlocking=true,iconMotionAmplitude=0;
  for(const id of WORLD_EVOLUTION_IDENTITY_IDS){
    const icon=worldEvolutionIdentityIcon(id);const body=icon.sx>=0&&icon.sy>=0&&icon.sx+icon.sw<=288&&icon.sy+icon.sh<=192;
    push(`${id}:body`,body,id);
    push(`${id}:toast`,icon.evolutionToastIdentitySupported,id);if(icon.evolutionToastIdentitySupported)toast.add(id);
    push(`${id}:recall`,icon.persistentRecallIdentitySupported,id);if(icon.persistentRecallIdentitySupported)recall.add(id);
    push(`${id}:fallback`,icon.textFallbackPreserved,id);if(icon.textFallbackPreserved)fallback.add(id);
    push(`${id}:non-blocking`,!icon.loadFailureBlocksGameplay,id);
    push(`${id}:static`,!icon.animated&&icon.motionAmplitude===0,id);
    push(`${id}:max-one`,icon.maxVisibleRecallIcons===1,id);
    push(`${id}:timing-contract`,timingOk,id);
    push(`${id}:weighted-pick`,weightedOk,id);
    push(`${id}:node-contract`,nodeOk,id);
    push(`${id}:modifier-contract`,modifierOk,id);
    push(`${id}:actions-schema`,ACTION_BUTTONS.length===9,id);
    textFallbackPreserved&&=icon.textFallbackPreserved;imageLoadFailureNonBlocking&&=!icon.loadFailureBlocksGameplay;iconMotionAmplitude=Math.max(iconMotionAmplitude,icon.motionAmplitude);
  }
  const toastCoverage=toast.size/5,activeRecallCoverage=recall.size/5,fallbackCoverage=fallback.size/5,actionCount=ACTION_BUTTONS.length;
  const evolutionTimingMutation=!timingOk,weightedPickMutation=!weightedOk,nodeContractMutation=!nodeOk,modifierContractMutation=!modifierOk;
  const issues:string[]=[];
  if(samples.length!==60)issues.push(`samples:${samples.length}`);if(!atlas.passed)issues.push('atlas');if(toastCoverage!==1)issues.push('toast-coverage');if(activeRecallCoverage!==1)issues.push('recall-coverage');if(fallbackCoverage!==1)issues.push('fallback-coverage');
  if(!textFallbackPreserved)issues.push('text-fallback');if(!imageLoadFailureNonBlocking)issues.push('blocking');if(iconMotionAmplitude!==0)issues.push('motion');if(evolutionTimingMutation)issues.push('timing-mutation');if(weightedPickMutation)issues.push('weighted-pick-mutation');if(nodeContractMutation)issues.push('node-contract-mutation');if(modifierContractMutation)issues.push('modifier-contract-mutation');if(actionCount!==9)issues.push(`actions:${actionCount}`);if(samples.some(sample=>!sample.passed))issues.push('sample-failure');
  return{samples,worldCount:5,coverage:atlas.coverage,uniqueCellCount:atlas.uniqueCellCount,outOfBounds:[...atlas.outOfBounds],toastCoverage,activeRecallCoverage,fallbackCoverage,maxVisibleRecallIcons:1,textFallbackPreserved,imageLoadFailureNonBlocking,iconMotionAmplitude,evolutionTimingMutation,weightedPickMutation,nodeContractMutation,modifierContractMutation,actionCount,snapshotSchemaMutation:false,issues,passed:issues.length===0};
}
