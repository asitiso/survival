import type { Vec2 } from '../core/math.js';
export interface CoreGuardDirectionalStackCue{id:number;ttl:number;maxTtl:number;pressureVector?:Vec2|undefined;}
function normalized(v:Vec2|undefined):Vec2|null{if(!v||!Number.isFinite(v.x)||!Number.isFinite(v.y))return null;const d=Math.hypot(v.x,v.y);return d>.001?{x:v.x/d,y:v.y/d}:null;}
export function coreGuardDirectionalStackOwnership(cues:readonly CoreGuardDirectionalStackCue[],reducedFlash=false){
  const directional=cues.map(c=>({cue:c,vector:normalized(c.pressureVector),life:Math.max(0,c.ttl)/Math.max(.001,c.maxTtl)})).filter(e=>e.vector!==null);
  if(directional.length===0)return{primaryId:null,entries:cues.map(c=>({id:c.id,accentAlphaScale:1,directional:false,presentationOnly:true as const})),presentationOnly:true as const};
  directional.sort((a,b)=>b.life-a.life||b.cue.id-a.cue.id);const primary=directional[0]!,pv=primary.vector!;
  const entries=cues.map(c=>{const v=normalized(c.pressureVector);if(!v)return{id:c.id,accentAlphaScale:1,directional:false,presentationOnly:true as const};if(c.id===primary.cue.id)return{id:c.id,accentAlphaScale:1,directional:true,presentationOnly:true as const};const dot=v.x*pv.x+v.y*pv.y;let accentAlphaScale=dot>=.72?.86:dot>=0?.64:.38;if(reducedFlash)accentAlphaScale*=.82;return{id:c.id,accentAlphaScale,directional:true,presentationOnly:true as const};});
  return{primaryId:primary.cue.id,entries,presentationOnly:true as const};
}
