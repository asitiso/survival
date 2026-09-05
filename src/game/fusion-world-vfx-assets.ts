import { FUSION_IDS, type FusionId } from './spell-fusions.js';

export const FUSION_WORLD_VFX_IDS: readonly FusionId[] = FUSION_IDS;
export const FUSION_WORLD_VFX_STATES = ['proc','aftershock'] as const;
export type FusionWorldVfxState = typeof FUSION_WORLD_VFX_STATES[number];
export const FUSION_WORLD_VFX_ATLAS = {src:'./assets/heroes/fusion-world-vfx.png',columns:6,rows:2,cellSize:128,width:768,height:256} as const;

export function fusionWorldVfxSprite(fusionId:FusionId,state:FusionWorldVfxState){
  const column=FUSION_WORLD_VFX_IDS.indexOf(fusionId),row=FUSION_WORLD_VFX_STATES.indexOf(state);if(column<0||row<0)throw new Error(`Unknown fusion world VFX: ${fusionId}:${state}`);const size=FUSION_WORLD_VFX_ATLAS.cellSize;
  return {sx:column*size,sy:row*size,sw:size,sh:size,presentationOnly:true as const,loadFailureBlocksGameplay:false as const};
}
export function auditFusionWorldVfxAtlas(){const cells=new Set<string>(),outOfBounds:string[]=[];for(const id of FUSION_WORLD_VFX_IDS)for(const state of FUSION_WORLD_VFX_STATES){const r=fusionWorldVfxSprite(id,state);cells.add(`${r.sx}:${r.sy}`);if(r.sx<0||r.sy<0||r.sx+r.sw>FUSION_WORLD_VFX_ATLAS.width||r.sy+r.sh>FUSION_WORLD_VFX_ATLAS.height)outOfBounds.push(`${id}:${state}`);}const itemCount=FUSION_WORLD_VFX_IDS.length*FUSION_WORLD_VFX_STATES.length;return{fusionCount:FUSION_WORLD_VFX_IDS.length,stateCount:FUSION_WORLD_VFX_STATES.length,itemCount,coverage:cells.size/itemCount,uniqueCellCount:cells.size,outOfBounds,passed:itemCount===12&&cells.size===itemCount&&outOfBounds.length===0};}
