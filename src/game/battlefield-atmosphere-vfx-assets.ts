import type { MapId } from './map-layouts.js';
import type { MapEvolutionStage } from './map-evolution.js';

export const BATTLEFIELD_ATMOSPHERE_VFX_ATLAS={src:'./assets/arena/battlefield-atmosphere-vfx.png',columns:3,rows:3,cellWidth:256,cellHeight:144,width:768,height:432} as const;
const MAPS:readonly MapId[]=['ruinedGate','frozenFen','crystalQuarry'];
const ROW=new Map<MapId,number>(MAPS.map((id,i)=>[id,i]));
export function battlefieldAtmosphereVfxSprite(mapId:MapId,stage:MapEvolutionStage){const row=ROW.get(mapId);if(row===undefined)throw new Error(`Unknown battlefield atmosphere map: ${mapId}`);return{sx:stage*256,sy:row*144,sw:256,sh:144,mapId,stage};}
export function auditBattlefieldAtmosphereVfxAtlas(){const seen=new Set<string>(),outOfBounds:string[]=[];for(const mapId of MAPS)for(const stage of [0,1,2] as const){const r=battlefieldAtmosphereVfxSprite(mapId,stage);seen.add(`${r.sx}:${r.sy}`);if(r.sx<0||r.sy<0||r.sx+r.sw>768||r.sy+r.sh>432)outOfBounds.push(`${mapId}:${stage}`);}return{itemCount:9,coverage:seen.size/9,uniqueCellCount:seen.size,outOfBounds,passed:seen.size===9&&outOfBounds.length===0};}
