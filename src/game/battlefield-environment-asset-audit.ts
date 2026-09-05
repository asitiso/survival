import { ACTION_BUTTONS } from './config.js';
import {
  BATTLEFIELD_ENVIRONMENT_ATLAS,
  BATTLEFIELD_ENVIRONMENT_MAP_IDS,
  auditBattlefieldEnvironmentAtlas,
  battlefieldEnvironmentIconStyle,
  battlefieldEnvironmentSprite,
} from './battlefield-environment-assets.js';
import type { MapEvolutionStage } from './map-evolution.js';

export type BattlefieldEnvironmentSurface='combat'|'hud'|'result'|'lobby-resume'|'replay';
export interface BattlefieldEnvironmentAssetSample{
  mapId:typeof BATTLEFIELD_ENVIRONMENT_MAP_IDS[number];
  stage:MapEvolutionStage;
  surface:BattlefieldEnvironmentSurface;
  atlasMatch:boolean;
  visible:boolean;
  motionAmplitude:number;
  textFallbackPreserved:boolean;
  imageLoadFailureNonBlocking:boolean;
  passed:boolean;
}
export interface BattlefieldEnvironmentAssetAudit{
  samples:BattlefieldEnvironmentAssetSample[];
  coverage:number;
  uniqueCellCount:number;
  outOfBounds:string[];
  assetSrc:string;
  surfaceCoverage:number;
  motionAmplitude:number;
  textFallbackPreserved:boolean;
  imageLoadFailureNonBlocking:boolean;
  actionCount:number;
  snapshotSchemaMutation:false;
  issues:string[];
  passed:boolean;
}

export function auditBattlefieldEnvironmentAssets():BattlefieldEnvironmentAssetAudit{
  const atlas=auditBattlefieldEnvironmentAtlas();
  const surfaces:readonly BattlefieldEnvironmentSurface[]=['combat','hud','result','lobby-resume','replay'];
  const stages:readonly MapEvolutionStage[]=[0,1,2];
  const samples:BattlefieldEnvironmentAssetSample[]=[];
  for(const mapId of BATTLEFIELD_ENVIRONMENT_MAP_IDS){
    for(const stage of stages){
      const sprite=battlefieldEnvironmentSprite(mapId,stage);
      const style=battlefieldEnvironmentIconStyle(mapId,stage);
      for(const surface of surfaces){
        const atlasMatch=sprite.atlasSrc===BATTLEFIELD_ENVIRONMENT_ATLAS.src&&style.includes('battlefield-environments.png');
        const textFallbackPreserved=sprite.textFallbackPreserved;
        const imageLoadFailureNonBlocking=!sprite.loadFailureBlocksGameplay;
        const passed=atlasMatch&&sprite.motionAmplitude===0&&textFallbackPreserved&&imageLoadFailureNonBlocking;
        samples.push({mapId,stage,surface,atlasMatch,visible:true,motionAmplitude:sprite.motionAmplitude,textFallbackPreserved,imageLoadFailureNonBlocking,passed});
      }
    }
  }
  const issues:string[]=[];
  if(samples.length!==45)issues.push(`samples:${samples.length}`);
  if(atlas.coverage!==1||atlas.uniqueCellCount!==9||atlas.outOfBounds.length)issues.push('atlas');
  if(samples.some(sample=>!sample.passed))issues.push('surface');
  const surfaceCoverage=surfaces.filter(surface=>BATTLEFIELD_ENVIRONMENT_MAP_IDS.every(mapId=>stages.every(stage=>samples.some(sample=>sample.mapId===mapId&&sample.stage===stage&&sample.surface===surface&&sample.passed)))).length/surfaces.length;
  const motionAmplitude=Math.max(...samples.map(sample=>sample.motionAmplitude));
  const textFallbackPreserved=samples.every(sample=>sample.textFallbackPreserved);
  const imageLoadFailureNonBlocking=samples.every(sample=>sample.imageLoadFailureNonBlocking);
  const actionCount=ACTION_BUTTONS.length;
  if(surfaceCoverage!==1)issues.push('surface-coverage');
  if(motionAmplitude!==0)issues.push('motion');
  if(!textFallbackPreserved)issues.push('fallback');
  if(!imageLoadFailureNonBlocking)issues.push('load-failure');
  if(actionCount!==9)issues.push(`actions:${actionCount}`);
  return{samples,coverage:atlas.coverage,uniqueCellCount:atlas.uniqueCellCount,outOfBounds:[...atlas.outOfBounds],assetSrc:atlas.assetSrc,surfaceCoverage,motionAmplitude,textFallbackPreserved,imageLoadFailureNonBlocking,actionCount,snapshotSchemaMutation:false,issues,passed:issues.length===0};
}
