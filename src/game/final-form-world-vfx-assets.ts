import type { HeroFinalFormId } from './endless/final-form.js';

export const FINAL_FORM_WORLD_VFX_IDS: readonly HeroFinalFormId[] = [
  'solar-sovereign','phoenix-lord','volcanic-archon',
  'absolute-empress','winter-warden','crystal-oracle',
  'thunder-tyrant','tempest-runner','storm-oracle',
  'radiant-king','oath-guardian','light-pilgrim',
] as const;
export const FINAL_FORM_WORLD_VFX_STATES = ['signature','flow'] as const;
export type FinalFormWorldVfxState = typeof FINAL_FORM_WORLD_VFX_STATES[number];

export const FINAL_FORM_WORLD_VFX_ATLAS = {
  src:'./assets/heroes/final-form-world-vfx.png', columns:6, rows:4, cellSize:128, width:768, height:512,
} as const;

export function finalFormWorldVfxSprite(formId:HeroFinalFormId,state:FinalFormWorldVfxState){
  const formIndex=FINAL_FORM_WORLD_VFX_IDS.indexOf(formId),stateIndex=FINAL_FORM_WORLD_VFX_STATES.indexOf(state);
  if(formIndex<0||stateIndex<0)throw new Error(`Unknown final form world VFX: ${formId}:${state}`);
  const index=formIndex*2+stateIndex,column=index%FINAL_FORM_WORLD_VFX_ATLAS.columns,row=Math.floor(index/FINAL_FORM_WORLD_VFX_ATLAS.columns),size=FINAL_FORM_WORLD_VFX_ATLAS.cellSize;
  return {sx:column*size,sy:row*size,sw:size,sh:size,presentationOnly:true as const,loadFailureBlocksGameplay:false as const};
}

export function auditFinalFormWorldVfxAtlas(){
  const cells=new Set<string>(),outOfBounds:string[]=[];
  for(const formId of FINAL_FORM_WORLD_VFX_IDS)for(const state of FINAL_FORM_WORLD_VFX_STATES){const r=finalFormWorldVfxSprite(formId,state);cells.add(`${r.sx}:${r.sy}`);if(r.sx<0||r.sy<0||r.sx+r.sw>FINAL_FORM_WORLD_VFX_ATLAS.width||r.sy+r.sh>FINAL_FORM_WORLD_VFX_ATLAS.height)outOfBounds.push(`${formId}:${state}`);}
  const itemCount=FINAL_FORM_WORLD_VFX_IDS.length*FINAL_FORM_WORLD_VFX_STATES.length;
  return {formCount:FINAL_FORM_WORLD_VFX_IDS.length,stateCount:FINAL_FORM_WORLD_VFX_STATES.length,itemCount,coverage:cells.size/itemCount,uniqueCellCount:cells.size,outOfBounds,passed:itemCount===24&&cells.size===itemCount&&outOfBounds.length===0};
}
