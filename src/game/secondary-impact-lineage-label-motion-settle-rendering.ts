import type { Vec2 } from '../core/math.js';
export const SECONDARY_IMPACT_LABEL_MAX_RENDER_STEP=12;
export const SECONDARY_IMPACT_LABEL_RENDER_SNAP_DISTANCE=4;
export interface SecondaryImpactLineageLabelMotionEntry{lineageKey:string;pos:Vec2;presentationOnly:true;}
export function secondaryImpactLineageLabelMotionSettle(memory:readonly SecondaryImpactLineageLabelMotionEntry[],lineageKey:string,target:Vec2,visible:boolean,reducedMotion=false){
  const existing=memory.find(e=>e.lineageKey===lineageKey);
  if(!visible)return{presentation:{visible:false,pos:{...target},settled:true,presentationOnly:true as const},memory:memory.filter(e=>e.lineageKey!==lineageKey).map(e=>({...e,pos:{...e.pos}}))};
  let pos={...target},settled=true;
  if(existing&&!reducedMotion){const dx=target.x-existing.pos.x,dy=target.y-existing.pos.y,d=Math.hypot(dx,dy);if(d>SECONDARY_IMPACT_LABEL_RENDER_SNAP_DISTANCE){const step=Math.min(SECONDARY_IMPACT_LABEL_MAX_RENDER_STEP,d),k=step/Math.max(.001,d);pos={x:existing.pos.x+dx*k,y:existing.pos.y+dy*k};settled=step>=d-1e-9;}}
  const next:SecondaryImpactLineageLabelMotionEntry={lineageKey,pos:{...pos},presentationOnly:true};
  return{presentation:{visible:true,pos:{...pos},settled,presentationOnly:true as const},memory:[...memory.filter(e=>e.lineageKey!==lineageKey).map(e=>({...e,pos:{...e.pos}})),next]};
}
