import type { Vec2 } from '../core/math.js';
import type { PresentationQuality } from './presentation-budget.js';
import { projectileImpactSourceContinuity, type ProjectileImpactSourceClass } from './projectile-impact-source-continuity.js';

export interface ProjectileImpactClusterInput { impact: Vec2; incoming: Vec2; sourceClass: ProjectileImpactSourceClass; }
export interface ProjectileImpactCluster {
  sourceClass: ProjectileImpactSourceClass;
  impact: Vec2;
  incoming: Vec2;
  count: number;
  start: Vec2;
  end: Vec2;
  alpha: number;
  accent: string;
  animated: false;
  motionAmplitude: 0;
}

export function projectileImpactClusterLimit(quality: PresentationQuality): number { return quality === 'high' ? 4 : quality === 'medium' ? 3 : 2; }

function normalized(v: Vec2): Vec2 | null {
  const length=Math.hypot(v.x,v.y); if(length<1e-6)return null; return{x:v.x/length,y:v.y/length};
}
function directionCompatible(a:Vec2,b:Vec2):boolean{
  const na=normalized(a),nb=normalized(b); if(!na||!nb)return false; return na.x*nb.x+na.y*nb.y>=0.58;
}

export function projectileImpactClusters(input:{impacts:readonly ProjectileImpactClusterInput[];quality:PresentationQuality;reducedFlash:boolean;}):ProjectileImpactCluster[]{
  const groups:Array<{sourceClass:ProjectileImpactSourceClass;sumX:number;sumY:number;sumVx:number;sumVy:number;count:number}> = [];
  for(const impact of input.impacts){
    if(!normalized(impact.incoming))continue;
    let best=-1,bestDistance=Infinity;
    for(let i=0;i<groups.length;i++){
      const g=groups[i]!; if(g.sourceClass!==impact.sourceClass)continue;
      const center={x:g.sumX/g.count,y:g.sumY/g.count},avgIncoming={x:g.sumVx/g.count,y:g.sumVy/g.count};
      const d=Math.hypot(impact.impact.x-center.x,impact.impact.y-center.y);
      if(d<=58&&directionCompatible(avgIncoming,impact.incoming)&&d<bestDistance){best=i;bestDistance=d;}
    }
    if(best>=0){const g=groups[best]!;g.sumX+=impact.impact.x;g.sumY+=impact.impact.y;g.sumVx+=impact.incoming.x;g.sumVy+=impact.incoming.y;g.count++;}
    else groups.push({sourceClass:impact.sourceClass,sumX:impact.impact.x,sumY:impact.impact.y,sumVx:impact.incoming.x,sumVy:impact.incoming.y,count:1});
  }
  const rank=(sourceClass:ProjectileImpactSourceClass)=>sourceClass==='boss'?1:0;
  return groups.sort((a,b)=>rank(b.sourceClass)-rank(a.sourceClass)||b.count-a.count)
    .slice(0,projectileImpactClusterLimit(input.quality))
    .map((g)=>{
      const impact={x:g.sumX/g.count,y:g.sumY/g.count},incoming={x:g.sumVx/g.count,y:g.sumVy/g.count};
      const segment=projectileImpactSourceContinuity({impact,incoming,sourceClass:g.sourceClass,quality:input.quality,reducedFlash:input.reducedFlash});
      if(!segment)return null;
      return{sourceClass:g.sourceClass,impact,incoming,count:g.count,start:segment.start,end:segment.end,alpha:segment.alpha,accent:segment.accent,animated:false as const,motionAmplitude:0 as const};
    }).filter((value):value is ProjectileImpactCluster=>value!==null);
}
