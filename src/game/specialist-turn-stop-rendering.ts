import type { SpecialistEnemyType } from './enemy-specialists.js';
import type { EnemyMotionRenderState } from './enemy-motion-rendering.js';
import type { SpecialistLocomotionSignatureState } from './specialist-locomotion-signature-rendering.js';

export interface SpecialistTurnStopPresentation{
  kind:SpecialistEnemyType;
  turn:number;
  stop:number;
  exit:number;
  bracePivot:number;
  directionRetention:number;
  groundAnchor:number;
  offsetX:number;
  offsetY:number;
  rotation:number;
  scaleX:number;
  scaleY:number;
}
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
const defaultMotion:EnemyMotionRenderState={motionBlend:0,stride:0,facingX:1,facingY:0,turn:0,recovery:0};
const defaultSignature:SpecialistLocomotionSignatureState={arrival:0,brace:0,plant:0};

export function specialistTurnStopPresentation(
  type:SpecialistEnemyType,
  motion:EnemyMotionRenderState|undefined,
  signature:SpecialistLocomotionSignatureState|undefined,
  reducedMotion=false,
):SpecialistTurnStopPresentation{
  const m=motion??defaultMotion,s=signature??defaultSignature;
  const turn=clamp(m.turn,-1,1),stop=clamp(m.recovery,0,1),move=clamp(m.motionBlend,0,1);
  const len=Math.hypot(m.facingX,m.facingY)||1,fx=m.facingX/len,fy=m.facingY/len;
  const motionScale=reducedMotion?.38:1;
  let exit=0,bracePivot=0,directionRetention=0,groundAnchor=0,forward=0,side=0,down=0,rotation=0,scaleX=1,scaleY=1;
  if(type==='assassin'){
    exit=clamp(s.arrival,0,1)*(.58+.42*move);
    directionRetention=clamp(exit*(.7+.3*(1-Math.min(1,Math.abs(turn)))),0,1);
    forward=exit*(2.8+move*1.4);
    side=turn*(1.2+exit*1.8);
    rotation=turn*.17+(fy-fx*.15)*exit*.065;
    scaleX=1+exit*.028;
    scaleY=1-exit*.022;
  }else if(type==='shieldbearer'){
    const brace=clamp(s.brace,0,1);
    bracePivot=brace*clamp(Math.abs(turn)*.82+stop*.42,0,1);
    groundAnchor=clamp(brace*.68+stop*.52,0,1);
    side=turn*(1.1+bracePivot*1.2);
    down=groundAnchor*1.35;
    rotation=turn*(.065+.035*bracePivot);
    scaleX=1+groundAnchor*.045+bracePivot*.025;
    scaleY=1-groundAnchor*.035;
  }else if(type==='siegeGolem'){
    groundAnchor=clamp(stop*.88+clamp(s.plant,0,1)*.36,0,1);
    down=groundAnchor*2.7;
    forward=-stop*.65;
    rotation=turn*.035*(1-stop*.72);
    scaleX=1+groundAnchor*.032;
    scaleY=1-groundAnchor*.045;
  }else{
    groundAnchor=stop*.18;
    down=stop*.55;
    side=turn*.55;
    rotation=turn*.055;
    scaleX=1+stop*.008;
    scaleY=1-stop*.006;
  }
  const offsetX=(fx*forward-fy*side)*motionScale;
  const offsetY=(fy*forward+fx*side*.18+down)*motionScale;
  return{kind:type,turn,stop,exit,bracePivot,directionRetention,groundAnchor,offsetX,offsetY,rotation:rotation*motionScale,scaleX:1+(scaleX-1)*motionScale,scaleY:1+(scaleY-1)*motionScale};
}
