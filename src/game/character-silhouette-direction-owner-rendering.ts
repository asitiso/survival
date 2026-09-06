export type CharacterSilhouetteDirectionOwner='locomotion'|'attack'|'recovery'|'hit'|'special';
export interface CharacterSilhouetteDirectionOwnerInput{kind:'specialist'|'boss';locomotion:{x:number;y:number};target:{x:number;y:number};hitDirection:{x:number;y:number};attack:number;recovery:number;hit:number;special:number;}
export interface CharacterSilhouetteDirectionOwnerPresentation{owner:CharacterSilhouetteDirectionOwner;facingX:number;facingY:number;trailDistanceScale:number;presentationOnly:true;}
const clamp=(v:number)=>Math.max(0,Math.min(1,Number.isFinite(v)?v:0));
const unit=(x:number,y:number,fx=1,fy=0)=>{const len=Math.hypot(x,y);if(len>.0001)return{x:x/len,y:y/len};const f=Math.hypot(fx,fy)||1;return{x:fx/f,y:fy/f};};
export function characterSilhouetteDirectionOwnerPresentation(input:CharacterSilhouetteDirectionOwnerInput,reducedMotion=false):CharacterSilhouetteDirectionOwnerPresentation{
  const locomotion=unit(input.locomotion.x,input.locomotion.y),target=unit(input.target.x,input.target.y,locomotion.x,locomotion.y),hitDirection=unit(input.hitDirection.x,input.hitDirection.y,-locomotion.x,-locomotion.y),attack=clamp(input.attack),recovery=clamp(input.recovery),hit=clamp(input.hit),special=clamp(input.special);
  let owner:CharacterSilhouetteDirectionOwner='locomotion',facing=locomotion;
  if(hit>.22){owner='hit';facing=hitDirection;}else if(input.kind==='boss'&&special>.24){owner='special';facing=target;}else if(attack>.18){owner='attack';facing=target;}else if(recovery>.16){owner='recovery';facing=target;}
  const trailDistanceScale=(reducedMotion?.68:1)*(owner==='hit'?.84:owner==='special'?.92:owner==='recovery'?.9:1);
  return{owner,facingX:facing.x,facingY:facing.y,trailDistanceScale,presentationOnly:true};
}
