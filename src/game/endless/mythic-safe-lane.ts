import { clamp, distance, type Vec2 } from '../../core/math.js';
import { mythicArenaHazardContact } from './mythic-arena-collision.js';
import type { ArenaDodgeHazard } from './arena-dodge-reward.js';

export interface MythicSafeLaneHint { label:'SAFE LANE'; target:Vec2; confidence:number; score:number; }
export interface MythicSafeLanePreference { target:Vec2; radius:number; weight:number; }

function candidateScore(hazards:readonly ArenaDodgeHazard[],point:Vec2,heroRadius:number,preferred:MythicSafeLanePreference|null):number{
  let score=0;
  for(const hazard of hazards){
    if(!hazard.geometryShape)continue;
    const contact=mythicArenaHazardContact(hazard,point,heroRadius);
    if(contact.hit)return -1_000_000-contact.penetration;
    const d=distance(point,hazard.pos);
    score+=Math.min(40,d*.04);
    if(hazard.geometryShape==='ring'){
      const inner=hazard.radius*.58-heroRadius;
      if(d<inner)score+=70+(inner-d)*.12;
      else if(d>hazard.radius+heroRadius)score+=12;
    }
  }
  if(preferred){const d=distance(point,preferred.target);if(d<=preferred.radius)score+=Math.max(0,preferred.weight)*(1-d/Math.max(1,preferred.radius));}
  return score;
}

export function mythicSafeLaneHint(hazards:readonly ArenaDodgeHazard[],heroPos:Vec2,heroRadius:number,width:number,height:number,preferred:MythicSafeLanePreference|null=null):MythicSafeLaneHint|null{
  const relevant=hazards.filter((h)=>Boolean(h.geometryShape));
  if(relevant.length===0)return null;
  const w=Math.max(320,width),h=Math.max(240,height),step=132;
  const candidates:Vec2[]=[];
  for(let i=0;i<16;i++){
    const a=-Math.PI/2+i*Math.PI*2/16;
    candidates.push({x:clamp(heroPos.x+Math.cos(a)*step,56,w-56),y:clamp(heroPos.y+Math.sin(a)*step,96,h-56)});
  }
  for(const hazard of relevant){
    if(hazard.geometryShape==='ring')candidates.push({x:clamp(hazard.pos.x,56,w-56),y:clamp(hazard.pos.y,96,h-56)});
  }
  if(preferred)candidates.push({x:clamp(preferred.target.x,56,w-56),y:clamp(preferred.target.y,96,h-56)});
  let best=candidates[0]!,bestScore=Number.NEGATIVE_INFINITY;
  let worst=Number.POSITIVE_INFINITY;
  for(const point of candidates){const score=candidateScore(relevant,point,heroRadius,preferred);if(score>bestScore){best=point;bestScore=score;}worst=Math.min(worst,score);}
  const spread=Math.max(1,bestScore-worst);
  return{label:'SAFE LANE',target:best,confidence:clamp(.35+spread/220,.35,1),score:bestScore};
}
