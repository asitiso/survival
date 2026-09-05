import type { Vec2 } from './math.js';
import { softFollowJoystickBase, thumbComfortProfile } from './thumb-fatigue.js';

export interface ThumbFatigueAudit {
  paths:number;
  samples:number;
  fixedAverageReach:number;
  softFollowAverageReach:number;
  reachBurdenReduction:number;
  maxSoftReach:number;
  maxAnchorShift:number;
  maxReach:number;
  issues:string[];
  passed:boolean;
}

function d(a:Vec2,b:Vec2):number{return Math.hypot(a.x-b.x,a.y-b.y);}

export function thumbFatigueAudit():ThumbFatigueAudit{
  const profile=thumbComfortProfile();
  const origin:Vec2={x:180,y:720};
  const angles=[0,Math.PI/2,Math.PI,-Math.PI/2];
  let samples=0,fixedTotal=0,softTotal=0,fixedBurden=0,softBurden=0,maxSoftReach=0,maxAnchorShift=0;
  for(const angle of angles){
    let base={...origin};
    for(let i=0;i<24;i++){
      const radius=40+(120*i/23);
      const pointer={x:origin.x+Math.cos(angle)*radius,y:origin.y+Math.sin(angle)*radius};
      base=softFollowJoystickBase(base,pointer,profile);
      const fixedReach=d(origin,pointer),softReach=d(base,pointer);
      samples+=1;fixedTotal+=fixedReach;softTotal+=softReach;
      fixedBurden+=Math.max(0,fixedReach-profile.softFollowStart);
      softBurden+=Math.max(0,softReach-profile.softFollowStart);
      maxSoftReach=Math.max(maxSoftReach,softReach);
      maxAnchorShift=Math.max(maxAnchorShift,d(origin,base));
    }
  }
  const reduction=fixedBurden<=0?0:1-softBurden/fixedBurden;
  const issues:string[]=[];
  if(reduction<.25)issues.push('insufficient-reach-relief');
  if(maxSoftReach>profile.maxReach+.001)issues.push('comfort-radius-exceeded');
  if(maxAnchorShift>96)issues.push('anchor-drift');
  return{
    paths:angles.length,samples,
    fixedAverageReach:fixedTotal/Math.max(1,samples),
    softFollowAverageReach:softTotal/Math.max(1,samples),
    reachBurdenReduction:reduction,maxSoftReach,maxAnchorShift,maxReach:profile.maxReach,
    issues,passed:issues.length===0,
  };
}
