import { clamp, type Vec2 } from '../../core/math.js';
import { mythicArenaHazardContact } from './mythic-arena-collision.js';
import type { MythicArenaGeometryShape } from './mythic-arena-geometry.js';

export interface ArenaDodgeHazard { id:number; pos:Vec2; radius:number; damage:number; telegraph:number; ttl:number; geometryShape?:MythicArenaGeometryShape; angle?:number; length?:number; }
export interface ArenaDodgeArm { hazardId:number; enteredAtMs:number; shape:MythicArenaGeometryShape; }
export interface ArenaDodgeTracker { armed:readonly ArenaDodgeArm[]; resolvedIds:readonly number[]; }
export interface ArenaDodgeReward { hazardId:number; label:'PERFECT EVADE'; flowRetentionMs:number; signatureCharge:number; moveSpeedMultiplier:number; evadeBoostMs:number; }

export function createArenaDodgeTracker():ArenaDodgeTracker{return{armed:[],resolvedIds:[]};}

export function arenaDodgeRewardForShape(shape:MythicArenaGeometryShape,hazardId:number):ArenaDodgeReward{
  const difficulty=shape==='clock'?1:shape==='cross'?.9:shape==='corridor'||shape==='orbit'?.8:shape==='pockets'?.68:.6;
  return{
    hazardId,label:'PERFECT EVADE',
    flowRetentionMs:Math.round(clamp(650+difficulty*420,650,1200)),
    signatureCharge:clamp(1.4+difficulty*1.8,1.4,4),
    moveSpeedMultiplier:clamp(1.025+difficulty*.025,1.025,1.06),
    evadeBoostMs:Math.round(clamp(720+difficulty*360,720,1200)),
  };
}

export function advanceArenaDodgeTracker(state:ArenaDodgeTracker,hazards:readonly ArenaDodgeHazard[],heroPos:Vec2,heroRadius:number,nowMs:number):{state:ArenaDodgeTracker;reward:ArenaDodgeReward|null}{
  const now=Math.max(0,Number.isFinite(nowMs)?nowMs:0),activeIds=new Set(hazards.map((h)=>h.id));
  const armed=new Map<number,ArenaDodgeArm>(state.armed.filter((x)=>activeIds.has(x.hazardId)).map((x)=>[x.hazardId,x]));
  const resolved=new Set(state.resolvedIds.filter((id)=>activeIds.has(id)));
  let reward:ArenaDodgeReward|null=null;
  for(const hazard of hazards){
    if(!hazard.geometryShape||resolved.has(hazard.id))continue;
    const contact=mythicArenaHazardContact(hazard,heroPos,heroRadius);
    const arm=armed.get(hazard.id);
    if(hazard.telegraph<=0){ if(arm){armed.delete(hazard.id);resolved.add(hazard.id);} continue; }
    if(contact.hit){ if(!arm)armed.set(hazard.id,{hazardId:hazard.id,enteredAtMs:now,shape:hazard.geometryShape}); continue; }
    if(arm&&now-arm.enteredAtMs>=80&&hazard.telegraph>=.08){
      reward??=arenaDodgeRewardForShape(arm.shape,hazard.id); armed.delete(hazard.id); resolved.add(hazard.id);
    }
  }
  return{state:{armed:[...armed.values()].slice(-12),resolvedIds:[...resolved].slice(-24)},reward};
}
