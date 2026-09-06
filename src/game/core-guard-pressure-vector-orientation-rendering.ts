import type { Vec2 } from '../core/math.js';

const finiteVector=(v:Vec2|undefined):v is Vec2=>Boolean(v&&Number.isFinite(v.x)&&Number.isFinite(v.y)&&Math.hypot(v.x,v.y)>.001);
const normalizeAngle=(value:number):number=>{const tau=Math.PI*2;let n=value%tau;if(n<0)n+=tau;return n;};

export interface CoreGuardPressureVectorOrientationInput{pressureVector?:Vec2|undefined;}
export function coreGuardPressureVectorOrientationPresentation(input:CoreGuardPressureVectorOrientationInput){
  if(!finiteVector(input.pressureVector))return{hasVector:false,pressureAngle:0,projectileLineAngle:0,contactArcCenter:Math.PI,contactArcStart:0,contactArcEnd:Math.PI*2,contactFullRing:true,orientationConfidence:0,presentationOnly:true as const};
  const pressureAngle=Math.atan2(input.pressureVector.y,input.pressureVector.x);
  const projectileLineAngle=pressureAngle+Math.PI/2;
  const contactArcCenter=normalizeAngle(pressureAngle+Math.PI),halfArc=.86;
  return{hasVector:true,pressureAngle,projectileLineAngle,contactArcCenter,contactArcStart:contactArcCenter-halfArc,contactArcEnd:contactArcCenter+halfArc,contactFullRing:false,orientationConfidence:1,presentationOnly:true as const};
}
