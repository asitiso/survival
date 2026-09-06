import type { Vec2 } from '../core/math.js';
import { SECONDARY_IMPACT_LABEL_PRIMARY_CLEARANCE, SECONDARY_IMPACT_LABEL_SCREEN_INSET, SECONDARY_IMPACT_LABEL_SECONDARY_CLEARANCE } from './secondary-impact-lineage-label-placement-rendering.js';
export const SECONDARY_IMPACT_LABEL_PLACEMENT_HOLD_SECONDS=.14;
export const SECONDARY_IMPACT_LABEL_PLACEMENT_MEMORY_SECONDS=.42;
export interface SecondaryImpactLineageLabelPlacementHoldEntry{lineageKey:string;pos:Vec2;holdRemaining:number;memoryRemaining:number;presentationOnly:true;}
export interface SecondaryImpactLabelPlacementLike{visible:boolean;pos:Vec2;presentationOnly:true;}
const distance=(a:Vec2,b:Vec2)=>Math.hypot(a.x-b.x,a.y-b.y);
const clear=(pos:Vec2,blockers:readonly Vec2[],occupied:readonly Vec2[],width:number,height:number)=>pos.x>=SECONDARY_IMPACT_LABEL_SCREEN_INSET&&pos.x<=width-SECONDARY_IMPACT_LABEL_SCREEN_INSET&&pos.y>=SECONDARY_IMPACT_LABEL_SCREEN_INSET&&pos.y<=height-SECONDARY_IMPACT_LABEL_SCREEN_INSET&&blockers.every(b=>distance(pos,b)>=SECONDARY_IMPACT_LABEL_PRIMARY_CLEARANCE)&&occupied.every(b=>distance(pos,b)>=SECONDARY_IMPACT_LABEL_SECONDARY_CLEARANCE);
export function advanceSecondaryImpactLineageLabelPlacementHold(memory:readonly SecondaryImpactLineageLabelPlacementHoldEntry[],dt:number):SecondaryImpactLineageLabelPlacementHoldEntry[]{const delta=Math.max(0,Number.isFinite(dt)?dt:0);return memory.map(e=>({...e,pos:{...e.pos},holdRemaining:Math.max(0,e.holdRemaining-delta),memoryRemaining:e.memoryRemaining-delta})).filter(e=>e.memoryRemaining>0);}
export function secondaryImpactLineageHeldPlacement(memory:readonly SecondaryImpactLineageLabelPlacementHoldEntry[],lineageKey:string,fallback:SecondaryImpactLabelPlacementLike,blockers:readonly Vec2[],occupied:readonly Vec2[],width:number,height:number){
  const existing=memory.find(e=>e.lineageKey===lineageKey);
  if(!fallback.visible){return{placement:{visible:false,pos:{...fallback.pos},presentationOnly:true as const},memory:memory.filter(e=>e.lineageKey!==lineageKey).map(e=>({...e,pos:{...e.pos}}))};}
  if(existing&&existing.holdRemaining>0&&clear(existing.pos,blockers,occupied,width,height))return{placement:{visible:true,pos:{...existing.pos},presentationOnly:true as const},memory:memory.map(e=>({...e,pos:{...e.pos}}))};
  if(!clear(fallback.pos,blockers,occupied,width,height))return{placement:{visible:false,pos:{...fallback.pos},presentationOnly:true as const},memory:memory.filter(e=>e.lineageKey!==lineageKey).map(e=>({...e,pos:{...e.pos}}))};
  const next={lineageKey,pos:{...fallback.pos},holdRemaining:SECONDARY_IMPACT_LABEL_PLACEMENT_HOLD_SECONDS,memoryRemaining:SECONDARY_IMPACT_LABEL_PLACEMENT_MEMORY_SECONDS,presentationOnly:true as const};
  return{placement:{visible:true,pos:{...fallback.pos},presentationOnly:true as const},memory:[...memory.filter(e=>e.lineageKey!==lineageKey).map(e=>({...e,pos:{...e.pos}})),next]};
}
