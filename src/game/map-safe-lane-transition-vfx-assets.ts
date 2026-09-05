import type { MapId } from './map-layouts.js';
export const MAP_SAFE_LANE_TRANSITION_VFX_MAPS=['ruinedGate','frozenFen','crystalQuarry'] as const satisfies readonly MapId[];
export const MAP_SAFE_LANE_TRANSITION_VFX_STATES=['path','arrival'] as const;
export type MapSafeLaneTransitionVfxState=typeof MAP_SAFE_LANE_TRANSITION_VFX_STATES[number];
export const MAP_SAFE_LANE_TRANSITION_VFX_ATLAS={src:'./assets/arena/map-safe-lane-transition-vfx.png',columns:3,rows:2,cellSize:128,width:384,height:256} as const;
const COL:Readonly<Record<MapId,number>>={ruinedGate:0,frozenFen:1,crystalQuarry:2};
const ROW:Readonly<Record<MapSafeLaneTransitionVfxState,number>>={path:0,arrival:1};
export function mapSafeLaneTransitionVfxSprite(mapId:MapId,state:MapSafeLaneTransitionVfxState){return{sx:COL[mapId]*128,sy:ROW[state]*128,sw:128 as const,sh:128 as const,presentationOnly:true as const,loadFailureBlocksGameplay:false as const};}
export function auditMapSafeLaneTransitionVfxAtlas(){const cells=new Set<string>(),outOfBounds:string[]=[];for(const mapId of MAP_SAFE_LANE_TRANSITION_VFX_MAPS)for(const state of MAP_SAFE_LANE_TRANSITION_VFX_STATES){const r=mapSafeLaneTransitionVfxSprite(mapId,state);cells.add(`${r.sx}:${r.sy}`);if(r.sx<0||r.sy<0||r.sx+r.sw>MAP_SAFE_LANE_TRANSITION_VFX_ATLAS.width||r.sy+r.sh>MAP_SAFE_LANE_TRANSITION_VFX_ATLAS.height)outOfBounds.push(`${mapId}:${state}`);}return{mapCount:MAP_SAFE_LANE_TRANSITION_VFX_MAPS.length,stateCount:MAP_SAFE_LANE_TRANSITION_VFX_STATES.length,itemCount:MAP_SAFE_LANE_TRANSITION_VFX_MAPS.length*MAP_SAFE_LANE_TRANSITION_VFX_STATES.length,uniqueCellCount:cells.size,outOfBounds,passed:cells.size===6&&outOfBounds.length===0};}
