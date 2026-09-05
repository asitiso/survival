import type { Vec2 } from '../core/math.js';
export type ProjectileThreatLevel='watch'|'danger'|'critical';
export interface ProjectileThreatInput{pos:Vec2;visualPos?:Vec2|undefined;vel:Vec2;radius:number;damage:number;target:'hero'|'core';}
export interface ProjectileThreatCue{index:number;target:'hero'|'core';level:ProjectileThreatLevel;timeToImpact:number;score:number;accent:string;radiusBoost:number;trailLength:number;}
function round2(v:number):number{return Math.round(v*100)/100;}
export function dangerProjectileCues(projectiles:readonly ProjectileThreatInput[],heroPos:Vec2,corePos:Vec2,limit=6):ProjectileThreatCue[]{
  const cues:ProjectileThreatCue[]=[];
  for(let index=0;index<projectiles.length;index++){
    const p=projectiles[index]!;const targetPos=p.target==='core'?corePos:heroPos;const threatPos=p.visualPos??p.pos;
    const speed=Math.hypot(p.vel.x,p.vel.y);if(speed<1)continue;
    const nx=p.vel.x/speed,ny=p.vel.y/speed,rx=targetPos.x-threatPos.x,ry=targetPos.y-threatPos.y;
    const along=rx*nx+ry*ny;if(along<=0)continue;
    const perpendicular=Math.abs(rx*ny-ry*nx);
    const targetRadius=p.target==='core'?48:23;
    const hitWidth=Math.max(20,p.radius+targetRadius+8);if(perpendicular>hitWidth)continue;
    const time=along/speed;if(time>1.45)continue;
    const damagePressure=Math.max(0,Math.min(1,p.damage/30));
    const urgency=Math.max(0,1-time/1.45);
    const score=urgency*100+damagePressure*38+(p.target==='core'?12:0);
    const level:ProjectileThreatLevel=time<=.55||p.damage>=24?'critical':time<=1.0||p.damage>=16?'danger':'watch';
    cues.push({index,target:p.target,level,timeToImpact:round2(time),score:round2(score),accent:level==='critical'?'#ff5f70':level==='danger'?'#ffb45f':'#ffd98a',radiusBoost:level==='critical'?12:level==='danger'?8:5,trailLength:level==='critical'?38:level==='danger'?28:18});
  }
  return cues.sort((a,b)=>b.score-a.score||a.timeToImpact-b.timeToImpact||a.index-b.index).slice(0,Math.max(0,limit));
}
