import type { Vec2 } from '../core/math.js';
export const CORE_GUARD_PRESSURE_VECTOR_HOLD_SECONDS=.16;
export interface CoreGuardPressureVectorHysteresisState{vector:Vec2|null;holdRemaining:number;presentationOnly:true;}
export function createCoreGuardPressureVectorHysteresisState():CoreGuardPressureVectorHysteresisState{return{vector:null,holdRemaining:0,presentationOnly:true};}
function normalized(v:Vec2|undefined):Vec2|null{if(!v||!Number.isFinite(v.x)||!Number.isFinite(v.y))return null;const d=Math.hypot(v.x,v.y);return d>.001?{x:v.x/d,y:v.y/d}:null;}
function blend(a:Vec2,b:Vec2,k:number):Vec2{const x=a.x*(1-k)+b.x*k,y=a.y*(1-k)+b.y*k,d=Math.hypot(x,y);return d>.001?{x:x/d,y:y/d}:{...b};}
export function advanceCoreGuardPressureVectorHysteresis(previous:CoreGuardPressureVectorHysteresisState,incoming:Vec2|undefined,dt:number,reducedMotion=false):CoreGuardPressureVectorHysteresisState{
  const next=normalized(incoming),delta=Math.max(0,Number.isFinite(dt)?dt:0),hold=Math.max(0,previous.holdRemaining-delta);
  if(!next)return{vector:previous.vector?{...previous.vector}:null,holdRemaining:hold,presentationOnly:true};
  if(!previous.vector||reducedMotion)return{vector:next,holdRemaining:CORE_GUARD_PRESSURE_VECTOR_HOLD_SECONDS,presentationOnly:true};
  const dot=previous.vector.x*next.x+previous.vector.y*next.y;
  if(hold>0&&dot<.35)return{vector:{...previous.vector},holdRemaining:hold,presentationOnly:true};
  if(hold<=0)return{vector:next,holdRemaining:CORE_GUARD_PRESSURE_VECTOR_HOLD_SECONDS,presentationOnly:true};
  return{vector:blend(previous.vector,next,.28),holdRemaining:Math.max(hold,CORE_GUARD_PRESSURE_VECTOR_HOLD_SECONDS*.42),presentationOnly:true};
}
