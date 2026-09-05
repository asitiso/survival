export interface HeroCastOrientationInput {
  facingX: number;
  facingY: number;
  speed: number;
  turn: number;
  cast: number;
  recover: number;
}

export interface HeroCastOrientationPresentation {
  overlayAngle: number;
  castFocus: number;
  locomotionLead: number;
  leadX: number;
  leadY: number;
  turnAnticipation: number;
  recoverReturn: number;
  bodyRotation: number;
  bodyScaleX: number;
  bodyScaleY: number;
}

const clamp = (value:number,min:number,max:number)=>Math.max(min,Math.min(max,value));

export function heroCastOrientationPresentation(input:HeroCastOrientationInput,reducedMotion=false):HeroCastOrientationPresentation{
  const len=Math.hypot(input.facingX,input.facingY)||1;
  const fx=input.facingX/len, fy=input.facingY/len;
  const speed=clamp(input.speed,0,1);
  const cast=clamp(input.cast,0,1);
  const recover=clamp(input.recover,0,1);
  const motionScale=reducedMotion?0.38:1;
  const castFocus=cast*(0.86+0.14*(1-speed));
  const locomotionLead=speed*(1-cast*0.42)*motionScale*4.6;
  const turnAnticipation=clamp(input.turn,-1,1)*0.12*motionScale*(1-cast*0.55)*(1-recover*0.45);
  const recoverReturn=recover*(1-speed*0.35);
  const castLead=cast*motionScale*(2.4+speed*1.6);
  const lead=locomotionLead+castLead;
  return{
    overlayAngle:Math.atan2(fy,fx),
    castFocus,
    locomotionLead,
    leadX:fx*lead+fy*turnAnticipation*7,
    leadY:fy*lead-fx*turnAnticipation*4-recoverReturn*0.65,
    turnAnticipation,
    recoverReturn,
    bodyRotation:turnAnticipation+cast*0.045*motionScale-recoverReturn*0.035*motionScale,
    bodyScaleX:1+cast*0.018*motionScale+speed*0.012*motionScale,
    bodyScaleY:1-cast*0.014*motionScale+recoverReturn*0.012*motionScale,
  };
}
