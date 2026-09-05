export interface HeroCastCadenceState { chain:number; bridge:number; pulse:number; }
export interface HeroCastCadencePresentation {
  chain:number;
  continuity:number;
  castBlend:number;
  recoverBlend:number;
  neutralReturn:number;
  chainLead:number;
  bodyScale:number;
  overlayAlphaBoost:number;
}

const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));

export function advanceHeroCastCadenceState(previous:HeroCastCadenceState|undefined,castTriggered:boolean,dt:number,reducedMotion=false):HeroCastCadenceState{
  const prev=previous??{chain:0,bridge:0,pulse:0};
  const safeDt=clamp(Number.isFinite(dt)?dt:0,0,.1);
  if(castTriggered){
    const chained=prev.bridge>.12;
    return{chain:chained?Math.min(4,Math.max(2,prev.chain+1)):1,bridge:1,pulse:1};
  }
  const bridgeWindow=reducedMotion?.30:.40;
  const bridge=Math.max(0,prev.bridge-safeDt/bridgeWindow);
  const pulse=Math.max(0,prev.pulse-safeDt/(reducedMotion?.16:.22));
  return{chain:bridge>0?prev.chain:0,bridge,pulse};
}

export function heroCastCadencePresentation(state:HeroCastCadenceState|undefined,cast:number,recover:number,speed:number,reducedMotion=false):HeroCastCadencePresentation{
  const s=state??{chain:0,bridge:0,pulse:0};
  const rawCast=clamp(cast,0,1),rawRecover=clamp(recover,0,1),move=clamp(speed,0,1);
  const chain=Math.max(0,Math.floor(s.chain));
  const chainWeight=clamp((chain-1)/2,0,1)*clamp(s.bridge,0,1);
  const continuity=chain>1?clamp(s.bridge,0,1):0;
  const castBlend=Math.max(rawCast,continuity*(.76+clamp(s.pulse,0,1)*.18));
  const recoverBlend=rawRecover*(1-continuity*.72);
  const neutralReturn=clamp((1-castBlend)*(1-continuity*.82)+recoverBlend*.28,0,1);
  const motionScale=reducedMotion?.38:1;
  const chainLead=clamp((.45+move*2.85)*chainWeight*motionScale,0,3.8);
  const bodyScale=1+chainWeight*.026*motionScale;
  const overlayAlphaBoost=chainWeight*(reducedMotion?.06:.14);
  return{chain,continuity,castBlend,recoverBlend,neutralReturn,chainLead,bodyScale,overlayAlphaBoost};
}
