import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './config.js';
import type { Vec2 } from '../core/math.js';
import type { LandscapeSafeAreaProfile, LandscapeSafeRect } from './landscape-safe-area.js';

export type FoldableThumbIntent='left'|'right'|'neutral';
export interface FoldableThumbZones { enabled:boolean;left:LandscapeSafeRect;right:LandscapeSafeRect;neutral:LandscapeSafeRect; }
function inside(p:Vec2,r:LandscapeSafeRect):boolean{return p.x>=r.x&&p.x<=r.x+r.width&&p.y>=r.y&&p.y<=r.y+r.height;}
export function foldableThumbZones(safe:LandscapeSafeAreaProfile):FoldableThumbZones{
  if(safe.aspectClass!=='foldable'||!safe.hingeExclusion)return{enabled:false,left:{x:0,y:0,width:0,height:0},right:{x:0,y:0,width:0,height:0},neutral:{x:0,y:0,width:LOGICAL_WIDTH,height:LOGICAL_HEIGHT}};
  const hinge=safe.hingeExclusion,gap=24,y=360,height=LOGICAL_HEIGHT-y;
  const leftX=safe.leftInset,leftRight=Math.max(leftX,hinge.x-gap);
  const rightX=Math.min(LOGICAL_WIDTH-safe.rightInset,hinge.x+hinge.width+gap),rightEdge=LOGICAL_WIDTH-safe.rightInset;
  return{
    enabled:true,
    left:{x:leftX,y,width:Math.max(0,leftRight-leftX),height},
    right:{x:rightX,y,width:Math.max(0,rightEdge-rightX),height},
    neutral:{x:leftRight,y,width:Math.max(hinge.width+gap*2,rightX-leftRight),height},
  };
}
export function foldableThumbIntent(point:Vec2,safe:LandscapeSafeAreaProfile):FoldableThumbIntent{
  const zones=foldableThumbZones(safe);if(!zones.enabled)return'neutral';
  if(inside(point,zones.left))return'left';
  if(inside(point,zones.right))return'right';
  return'neutral';
}
