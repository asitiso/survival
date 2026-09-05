import { ELITE_AFFIXES, type EliteAffixId } from './elite-affixes.js';

export const ELITE_AFFIX_LIFECYCLE_VFX_AFFIXES: readonly EliteAffixId[] = ELITE_AFFIXES;
export const ELITE_AFFIX_LIFECYCLE_VFX_STATES = ['active','response'] as const;
export type EliteAffixLifecycleVfxState = typeof ELITE_AFFIX_LIFECYCLE_VFX_STATES[number];

export const ELITE_AFFIX_LIFECYCLE_VFX_ATLAS = {
  src: './assets/enemies/elite-affix-lifecycle-vfx.png',
  columns: 6,
  rows: 2,
  cellSize: 128,
  width: 768,
  height: 256,
} as const;

export interface EliteAffixLifecycleVfxSprite {
  sx:number; sy:number; sw:number; sh:number;
  presentationOnly:true;
  loadFailureBlocksGameplay:false;
}

export function eliteAffixLifecycleVfxSprite(affixId:EliteAffixId,state:EliteAffixLifecycleVfxState):EliteAffixLifecycleVfxSprite{
  const column=ELITE_AFFIX_LIFECYCLE_VFX_AFFIXES.indexOf(affixId);
  const row=ELITE_AFFIX_LIFECYCLE_VFX_STATES.indexOf(state);
  if(column<0||row<0)throw new Error(`Unknown elite affix lifecycle VFX: ${affixId}:${state}`);
  const size=ELITE_AFFIX_LIFECYCLE_VFX_ATLAS.cellSize;
  return {sx:column*size,sy:row*size,sw:size,sh:size,presentationOnly:true,loadFailureBlocksGameplay:false};
}

export function auditEliteAffixLifecycleVfxAtlas(){
  const cells=new Set<string>(),outOfBounds:string[]=[];
  for(const affixId of ELITE_AFFIX_LIFECYCLE_VFX_AFFIXES)for(const state of ELITE_AFFIX_LIFECYCLE_VFX_STATES){
    const r=eliteAffixLifecycleVfxSprite(affixId,state);cells.add(`${r.sx}:${r.sy}`);
    if(r.sx<0||r.sy<0||r.sx+r.sw>ELITE_AFFIX_LIFECYCLE_VFX_ATLAS.width||r.sy+r.sh>ELITE_AFFIX_LIFECYCLE_VFX_ATLAS.height)outOfBounds.push(`${affixId}:${state}`);
  }
  const itemCount=ELITE_AFFIX_LIFECYCLE_VFX_AFFIXES.length*ELITE_AFFIX_LIFECYCLE_VFX_STATES.length;
  return {affixCount:ELITE_AFFIX_LIFECYCLE_VFX_AFFIXES.length,stateCount:ELITE_AFFIX_LIFECYCLE_VFX_STATES.length,itemCount,coverage:cells.size/itemCount,uniqueCellCount:cells.size,outOfBounds,passed:itemCount===12&&cells.size===itemCount&&outOfBounds.length===0};
}
