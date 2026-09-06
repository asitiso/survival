import type { Vec2 } from '../core/math.js';
export const SECONDARY_IMPACT_LABEL_CONNECTOR_MAX_LENGTH=42;
export function secondaryImpactLineageLabelConnectorPresentation(input:{anchor:Vec2;labelPos:Vec2;visible:boolean;biasApplied:boolean;settled:boolean},reducedFlash=false){
  const dx=input.anchor.x-input.labelPos.x,dy=input.anchor.y-input.labelPos.y,d=Math.hypot(dx,dy),owned=input.visible&&d>=18&&(input.biasApplied||!input.settled);
  if(!owned)return{visible:false,from:{...input.labelPos},to:{...input.labelPos},alpha:0,lineWidth:1.1,presentationOnly:true as const};
  const ux=dx/Math.max(.001,d),uy=dy/Math.max(.001,d),startInset=7,length=Math.min(SECONDARY_IMPACT_LABEL_CONNECTOR_MAX_LENGTH,Math.max(8,d-14));
  const from={x:input.labelPos.x+ux*startInset,y:input.labelPos.y+uy*startInset},to={x:from.x+ux*length,y:from.y+uy*length},baseAlpha=input.biasApplied?.34:.22;
  return{visible:true,from,to,alpha:baseAlpha*(reducedFlash?.62:1),lineWidth:input.biasApplied?1.25:1.05,presentationOnly:true as const};
}
