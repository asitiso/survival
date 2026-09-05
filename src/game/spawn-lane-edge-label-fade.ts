export const SPAWN_LANE_EDGE_LABEL_FADE_SECONDS=.24;
export interface SpawnLaneEdgeLabelFadeInput{count:number;alpha:number;remainingTtl?:number;}
export interface SpawnLaneEdgeLabelFadeResult{visible:boolean;labelAlpha:number;presentationOnly:true;gameplayMutation:false;}
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
export function spawnLaneEdgeLabelFade(input:SpawnLaneEdgeLabelFadeInput):SpawnLaneEdgeLabelFadeResult{
  const alpha=clamp(Number.isFinite(input.alpha)?input.alpha:0,0,1);
  const ttl=input.remainingTtl===undefined?Infinity:(Number.isFinite(input.remainingTtl)?input.remainingTtl:0);
  if(input.count<=1||ttl<=0||alpha<=0)return{visible:false,labelAlpha:0,presentationOnly:true,gameplayMutation:false};
  const factor=ttl>=SPAWN_LANE_EDGE_LABEL_FADE_SECONDS?1:clamp(ttl/SPAWN_LANE_EDGE_LABEL_FADE_SECONDS,0,1);
  const labelAlpha=alpha*factor;
  return{visible:labelAlpha>0.01,labelAlpha,presentationOnly:true,gameplayMutation:false};
}
