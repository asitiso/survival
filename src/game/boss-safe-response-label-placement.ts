import type { Vec2 } from '../core/math.js';
export const BOSS_SAFE_RESPONSE_LABEL_SCREEN_INSET=18;
export const BOSS_SAFE_RESPONSE_LABEL_ANCHOR_CLEARANCE=56;
export type BossSafeResponseLabelSlot='above'|'right'|'left'|'below'|'hidden';
export interface BossSafeResponseLabelPlacementInput{bossPos:Vec2;bossRadius:number;heroPos:Vec2;corePos:Vec2;width:number;height:number;extraProtected?:readonly {x:number;y:number;radius:number}[];}
export interface BossSafeResponseLabelPlacement{visible:boolean;slot:BossSafeResponseLabelSlot;pos:Vec2;animated:false;motionAmplitude:0;presentationOnly:true;}
const distance=(a:Vec2,b:Vec2)=>Math.hypot(a.x-b.x,a.y-b.y);
export function bossSafeResponseLabelPlacement(input:BossSafeResponseLabelPlacementInput):BossSafeResponseLabelPlacement{
  const width=Math.max(BOSS_SAFE_RESPONSE_LABEL_SCREEN_INSET*2,input.width),height=Math.max(BOSS_SAFE_RESPONSE_LABEL_SCREEN_INSET*2,input.height),r=Math.max(0,input.bossRadius);
  const candidates:Array<{slot:Exclude<BossSafeResponseLabelSlot,'hidden'>;pos:Vec2}>=[
    {slot:'above',pos:{x:input.bossPos.x,y:input.bossPos.y-r-32}},
    {slot:'right',pos:{x:input.bossPos.x+r+58,y:input.bossPos.y-8}},
    {slot:'left',pos:{x:input.bossPos.x-r-58,y:input.bossPos.y-8}},
    {slot:'below',pos:{x:input.bossPos.x,y:input.bossPos.y+r+42}},
  ];
  const extra=input.extraProtected??[];
  const clean=(pos:Vec2)=>{
    if(pos.x<BOSS_SAFE_RESPONSE_LABEL_SCREEN_INSET||pos.x>width-BOSS_SAFE_RESPONSE_LABEL_SCREEN_INSET||pos.y<BOSS_SAFE_RESPONSE_LABEL_SCREEN_INSET||pos.y>height-BOSS_SAFE_RESPONSE_LABEL_SCREEN_INSET)return false;
    if(distance(pos,input.heroPos)<BOSS_SAFE_RESPONSE_LABEL_ANCHOR_CLEARANCE||distance(pos,input.corePos)<BOSS_SAFE_RESPONSE_LABEL_ANCHOR_CLEARANCE)return false;
    if(extra.some((anchor)=>distance(pos,anchor)<Math.max(0,anchor.radius)+18))return false;
    return true;
  };
  const selected=candidates.find((candidate)=>clean(candidate.pos));
  if(selected)return{visible:true,slot:selected.slot,pos:selected.pos,animated:false,motionAmplitude:0,presentationOnly:true};
  return{visible:false,slot:'hidden',pos:{...input.bossPos},animated:false,motionAmplitude:0,presentationOnly:true};
}
