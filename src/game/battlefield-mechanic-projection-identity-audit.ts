import { ACTION_BUTTONS } from './config.js';
import { MAP_LAYOUTS } from './map-layouts.js';
import { mapEvolutionStage } from './map-evolution.js';
import { auditBattlefieldMechanicIdentityAtlas, battlefieldMechanicIdentityIcon, BATTLEFIELD_MECHANIC_IDS, BATTLEFIELD_STAGE_IDS, type BattlefieldMechanicIdentityId } from './battlefield-mechanic-identity-assets.js';
import { projectBattlefieldEvolutionImpact, projectBattlefieldMechanics } from './battlefield-mechanic-projection.js';

export function auditBattlefieldMechanicProjectionIdentityAssets(){
  const samples:{id:string;passed:boolean}[]=[],issues:string[]=[],dominantMechanicsCovered=new Set<BattlefieldMechanicIdentityId>(),atlas=auditBattlefieldMechanicIdentityAtlas();let evolutionTransitionsCovered=0;
  for(const map of MAP_LAYOUTS){for(const stage of [0,1,2] as const){const p=projectBattlefieldMechanics(map.id,stage);dominantMechanicsCovered.add(p.dominantMechanic);const icon=battlefieldMechanicIdentityIcon(p.dominantMechanic),stageIcon=battlefieldMechanicIdentityIcon(p.stageIdentity);const checks=[BATTLEFIELD_MECHANIC_IDS.includes(p.dominantMechanic),BATTLEFIELD_STAGE_IDS.includes(p.stageIdentity),icon.animated===false&&stageIcon.animated===false,p.metrics.wallCount>=0&&p.metrics.slowCount>=0&&p.metrics.crystalCount>=0,Object.values(p.scores).every(Number.isFinite)];checks.forEach((passed,index)=>samples.push({id:`${map.id}:${stage}:${index}`,passed}));}}
  for(const map of MAP_LAYOUTS){for(const stage of [1,2] as const){const p=projectBattlefieldEvolutionImpact(map.id,stage),passed=p.changes.length>0&&p.changes.length<=2&&p.previousStage===stage-1;samples.push({id:`transition:${map.id}:${stage}`,passed});if(passed)evolutionTransitionsCovered++;}}
  const invariants=[atlas.passed,mapEvolutionStage(479.999)===0,mapEvolutionStage(480)===1,mapEvolutionStage(959.999)===1,mapEvolutionStage(960)===2,ACTION_BUTTONS.length===9,MAP_LAYOUTS.length===3,BATTLEFIELD_MECHANIC_IDS.length===3,BATTLEFIELD_STAGE_IDS.length===3];invariants.forEach((passed,index)=>samples.push({id:`invariant:${index}`,passed}));
  for(const sample of samples)if(!sample.passed)issues.push(sample.id);
  const mechanicCoverageComplete=dominantMechanicsCovered.size===3,stageCoverageComplete=BATTLEFIELD_STAGE_IDS.every(id=>[0,1,2].some(stage=>projectBattlefieldMechanics('ruinedGate',stage as 0|1|2).stageIdentity===id));if(!mechanicCoverageComplete)issues.push('mechanic-coverage');if(!stageCoverageComplete)issues.push('stage-coverage');if(samples.length!==60)issues.push(`sample-count:${samples.length}`);
  return{passed:issues.length===0,samples,runtimeProjectionSamples:45,mapCount:MAP_LAYOUTS.length,mechanicIdentityCount:BATTLEFIELD_MECHANIC_IDS.length,stageIdentityCount:BATTLEFIELD_STAGE_IDS.length,dominantMechanicsCovered:[...dominantMechanicsCovered],mechanicCoverageComplete,stageCoverageComplete,evolutionTransitionsCovered,actionCount:ACTION_BUTTONS.length,snapshotSchemaMutation:false,gameplayMutation:false,issues};
}
