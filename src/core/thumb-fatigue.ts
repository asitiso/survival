import type { Vec2 } from './math.js';
export interface ThumbComfortProfile{softFollowStart:number;maxReach:number;}
export function thumbComfortProfile():ThumbComfortProfile{return{softFollowStart:72,maxReach:92};}
export function softFollowJoystickBase(base:Vec2,pointer:Vec2,profile:ThumbComfortProfile=thumbComfortProfile()):Vec2{
  const dx=pointer.x-base.x,dy=pointer.y-base.y,d=Math.hypot(dx,dy);
  if(d<=profile.softFollowStart||d<=Number.EPSILON)return{...base};
  const desired=Math.min(profile.maxReach,Math.max(profile.softFollowStart,profile.maxReach));
  const shift=Math.max(0,d-desired);
  if(shift<=0)return{...base};
  return{x:base.x+dx/d*shift,y:base.y+dy/d*shift};
}
