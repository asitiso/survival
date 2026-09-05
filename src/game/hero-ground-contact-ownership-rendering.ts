export type HeroGroundContactOwner='neutral'|'locomotion'|'cast'|'evade'|'ultimate';
export interface HeroGroundContactOwnershipInput{movement:number;cast:number;evade:number;ultimate:number;actionOffsetX:number;actionOffsetY:number;lift:number;}
export interface HeroGroundContactOwnershipPresentation{owner:HeroGroundContactOwner;locomotionGroundScale:number;actionFollowScale:number;shadowOffsetX:number;shadowOffsetY:number;widthScale:number;heightScale:number;alphaScale:number;}
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(b,v));
export function heroGroundContactOwnershipPresentation(input:HeroGroundContactOwnershipInput,reducedMotion=false):HeroGroundContactOwnershipPresentation{
  const movement=clamp(input.movement,0,1),cast=clamp(input.cast,0,1),evade=clamp(input.evade,0,1),ultimate=clamp(input.ultimate,0,1),lift=clamp(input.lift,0,12);
  let owner:HeroGroundContactOwner='neutral';
  if(ultimate>=.42)owner='ultimate';else if(evade>=.48)owner='evade';else if(cast>=.32)owner='cast';else if(movement>=.08)owner='locomotion';
  let locomotionGroundScale=1,actionFollowScale=.34,widthScale=1,heightScale=1,alphaScale=1,maxX=2.6,maxY=2.1;
  if(owner==='locomotion'){locomotionGroundScale=1;actionFollowScale=.58;maxX=2.4;maxY=1.8;}
  else if(owner==='cast'){locomotionGroundScale=.58;actionFollowScale=.36;maxX=3.1;maxY=2;}
  else if(owner==='evade'){locomotionGroundScale=.42;actionFollowScale=.18;alphaScale=.9;maxX=2.2;maxY=1.7;}
  else if(owner==='ultimate'){locomotionGroundScale=.28;actionFollowScale=.12;maxX=1.8;maxY=1.5;}
  const liftWeight=clamp(lift/10,0,1);
  if(owner==='ultimate'){widthScale=1-liftWeight*.15;heightScale=1-liftWeight*.22;alphaScale*=1-liftWeight*.34;}
  else if(owner==='cast'){widthScale=1-liftWeight*.055;heightScale=1-liftWeight*.08;alphaScale*=1-liftWeight*.1;}
  else if(owner==='evade'){widthScale=1-liftWeight*.04;heightScale=1-liftWeight*.06;alphaScale*=1-liftWeight*.08;}
  if(reducedMotion){locomotionGroundScale*=.82;actionFollowScale*=.62;maxX*=.72;maxY*=.72;widthScale=1+(widthScale-1)*.7;heightScale=1+(heightScale-1)*.7;alphaScale=Math.max(.62,alphaScale*.92);}
  const shadowOffsetX=clamp((Number.isFinite(input.actionOffsetX)?input.actionOffsetX:0)*actionFollowScale,-maxX,maxX);
  const shadowOffsetY=clamp((Number.isFinite(input.actionOffsetY)?input.actionOffsetY:0)*actionFollowScale,-maxY,maxY);
  return{owner,locomotionGroundScale:clamp(locomotionGroundScale,0,1),actionFollowScale:clamp(actionFollowScale,0,1),shadowOffsetX,shadowOffsetY,widthScale:clamp(widthScale,.72,1.08),heightScale:clamp(heightScale,.68,1.08),alphaScale:clamp(alphaScale,.5,1)};
}
