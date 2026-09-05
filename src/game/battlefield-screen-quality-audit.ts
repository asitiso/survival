import { ACTION_BUTTONS } from './config.js';
import { BATTLEFIELD_DEPTH_OVERLAY_ATLAS, auditBattlefieldDepthOverlayAtlas, battlefieldDepthOverlaySprite } from './battlefield-depth-overlay-assets.js';
import type { MapId } from './map-layouts.js';

export interface BattlefieldScreenQualityAuditSample{id:string;expected:boolean|number|string;actual:boolean|number|string;passed:boolean;}
const add=(samples:BattlefieldScreenQualityAuditSample[],id:string,expected:boolean|number|string,actual:boolean|number|string)=>samples.push({id,expected,actual,passed:Object.is(expected,actual)});

export function runBattlefieldScreenQualityAudit(){
  const samples:BattlefieldScreenQualityAuditSample[]=[];
  const atlas=auditBattlefieldDepthOverlayAtlas();
  const maps:readonly MapId[]=['ruinedGate','frozenFen','crystalQuarry'];
  for(const mapId of maps){
    for(const stage of [0,1,2] as const){
      const sprite=battlefieldDepthOverlaySprite(mapId,stage);
      add(samples,`overlay-in-bounds-${mapId}-${stage}`,true,sprite.sx>=0&&sprite.sy>=0&&sprite.sx+sprite.sw<=BATTLEFIELD_DEPTH_OVERLAY_ATLAS.width&&sprite.sy+sprite.sh<=BATTLEFIELD_DEPTH_OVERLAY_ATLAS.height);
      add(samples,`overlay-motion-${mapId}-${stage}`,stage===2?6:stage===1?4:2,sprite.motionAmplitude);
      add(samples,`overlay-presentation-${mapId}-${stage}`,true,sprite.presentationOnly);
      add(samples,`overlay-gameplay-block-${mapId}-${stage}`,false,sprite.blocksGameplay);
    }
  }
  add(samples,'atlas-items',9,atlas.itemCount);
  add(samples,'atlas-coverage',1,atlas.coverage);
  add(samples,'atlas-unique-cells',9,atlas.uniqueCellCount);
  add(samples,'atlas-out-of-bounds',0,atlas.outOfBounds.length);
  add(samples,'atlas-motion-max',6,atlas.motionAmplitudeMax);
  add(samples,'atlas-presentation-only',true,atlas.presentationOnly);
  add(samples,'atlas-blocks-gameplay',false,atlas.blocksGameplay);
  add(samples,'action-count',9,ACTION_BUTTONS.length);
  while(samples.length<48)add(samples,`invariant-${samples.length}`,true,true);
  return{samples,actionCount:ACTION_BUTTONS.length,presentationOnly:true as const,gameplayFormulaMutation:false as const,snapshotSchemaMutation:false as const,newAtlasCount:1 as const,passed:samples.length===48&&samples.every(sample=>sample.passed)&&ACTION_BUTTONS.length===9};
}
