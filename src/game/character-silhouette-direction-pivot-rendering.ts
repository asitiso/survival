import type { CharacterSilhouetteDirectionOwnerPresentation } from './character-silhouette-direction-owner-rendering.js';
const unit=(x:number,y:number)=>{const l=Math.hypot(x,y)||1;return{x:x/l,y:y/l};};
const delta=(a:number,b:number)=>Math.atan2(Math.sin(b-a),Math.cos(b-a));
export function characterSilhouetteDirectionPivotPresentation(input:{locomotion:{x:number;y:number};owned:CharacterSilhouetteDirectionOwnerPresentation;turn:number},reducedMotion=false){
  const locomotion=unit(input.locomotion.x,input.locomotion.y),owned=unit(input.owned.facingX,input.owned.facingY);
  if(input.owned.owner==='locomotion')return{owner:input.owned.owner,facingX:locomotion.x,facingY:locomotion.y,pivotWeight:0,trailDistanceScale:input.owned.trailDistanceScale,presentationOnly:true as const};
  const turn=Math.max(0,Math.min(1,Number.isFinite(input.turn)?Math.abs(input.turn):0)),base=input.owned.owner==='hit'?.86:input.owned.owner==='special'?.74:input.owned.owner==='attack'?.68:.52,pivotWeight=reducedMotion?1:Math.max(.42,base-turn*.08),from=Math.atan2(locomotion.y,locomotion.x),to=Math.atan2(owned.y,owned.x),a=from+delta(from,to)*pivotWeight;
  return{owner:input.owned.owner,facingX:Math.cos(a),facingY:Math.sin(a),pivotWeight,trailDistanceScale:input.owned.trailDistanceScale,presentationOnly:true as const};
}
