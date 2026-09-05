import type { MapId } from './map-layouts.js';
import type { MapEvolutionStage } from './map-evolution.js';

export const BATTLEFIELD_DEPTH_OVERLAY_ATLAS={src:'./assets/arena/battlefield-depth-overlays.png',columns:3,rows:3,cellWidth:256,cellHeight:144,width:768,height:432} as const;
const MAPS:readonly MapId[]=['ruinedGate','frozenFen','crystalQuarry'];
const ROW=new Map<MapId,number>(MAPS.map((id,i)=>[id,i]));
export interface BattlefieldDepthOverlaySprite{sx:number;sy:number;sw:number;sh:number;mapId:MapId;stage:MapEvolutionStage;motionAmplitude:number;presentationOnly:true;blocksGameplay:false;}
export function battlefieldDepthOverlaySprite(mapId:MapId,stage:MapEvolutionStage):BattlefieldDepthOverlaySprite{
  const row=ROW.get(mapId);
  if(row===undefined)throw new Error(`Unknown battlefield depth overlay map: ${mapId}`);
  return{sx:stage*256,sy:row*144,sw:256,sh:144,mapId,stage,motionAmplitude:stage===2?6:stage===1?4:2,presentationOnly:true,blocksGameplay:false};
}
export function auditBattlefieldDepthOverlayAtlas(){
  const seen=new Set<string>(),outOfBounds:string[]=[];
  for(const mapId of MAPS)for(const stage of [0,1,2] as const){
    const r=battlefieldDepthOverlaySprite(mapId,stage);seen.add(`${r.sx}:${r.sy}`);
    if(r.sx<0||r.sy<0||r.sx+r.sw>BATTLEFIELD_DEPTH_OVERLAY_ATLAS.width||r.sy+r.sh>BATTLEFIELD_DEPTH_OVERLAY_ATLAS.height)outOfBounds.push(`${mapId}:${stage}`);
  }
  return{itemCount:9,coverage:seen.size/9,uniqueCellCount:seen.size,outOfBounds,motionAmplitudeMax:6,presentationOnly:true as const,blocksGameplay:false as const,passed:seen.size===9&&outOfBounds.length===0};
}
