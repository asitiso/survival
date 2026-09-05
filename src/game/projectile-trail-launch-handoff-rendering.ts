import type { Vec2 } from '../core/math.js';
export interface ProjectileTrailLaunchHandoffInput{gameplayPos:Vec2;velocity:Vec2;launchOffset?:Vec2|undefined;launchTtl?:number|undefined;launchMaxTtl?:number|undefined;radius:number}
export interface ProjectileTrailLaunchHandoffPresentation{owner:'launch'|'canonical';head:Vec2;tail:Vec2;residueOrigin:Vec2;length:number;alpha:number}
const clamp=(v:number,min:number,max:number)=>Math.max(min,Math.min(max,v));
export function projectileTrailLaunchHandoffPresentation(input:ProjectileTrailLaunchHandoffInput,reducedMotion=false):ProjectileTrailLaunchHandoffPresentation{
 const maxTtl=Math.max(.0001,Number.isFinite(input.launchMaxTtl??0)?input.launchMaxTtl??0:0),ttl=Math.max(0,Number.isFinite(input.launchTtl??0)?input.launchTtl??0:0);
 const launchWeight=input.launchOffset&&ttl>0?clamp(ttl/maxTtl,0,1)**2:0;
 const head={x:input.gameplayPos.x+(input.launchOffset?.x??0)*launchWeight,y:input.gameplayPos.y+(input.launchOffset?.y??0)*launchWeight};
 const speed=Math.hypot(input.velocity.x,input.velocity.y),dir=speed>.0001?{x:input.velocity.x/speed,y:input.velocity.y/speed}:{x:1,y:0};
 const base=clamp(Math.max(0,input.radius)*1.15+speed*.026,10,34),length=base*(reducedMotion?.68:1);
 const tail={x:head.x-dir.x*length,y:head.y-dir.y*length};
 return{owner:launchWeight>0?'launch':'canonical',head,tail,residueOrigin:{...tail},length,alpha:(.34+.34*Math.min(1,speed/360))*(reducedMotion?.72:1)};
}
