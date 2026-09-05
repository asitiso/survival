import type { PresentationQuality } from './presentation-budget.js';
import type { DamageImpactTier } from './combat-feedback.js';
import type { BossArchetype } from './boss-patterns.js';
import type { SpellId } from './spells.js';
import type { MapEvolutionStage } from './map-evolution.js';
import type { MapId } from './map-layouts.js';
import type { Vec2 } from '../core/math.js';

function qualityScale(q:PresentationQuality):number{return q==='high'?1:q==='medium'?.74:.50;}

export interface DirectionalHitVfxProfile { streakCount:number; alpha:number; length:number; width:number; ttl:number; }
export function directionalHitVfxProfile(tier:DamageImpactTier,quality:PresentationQuality):DirectionalHitVfxProfile {
  const base=tier==='critical'?{count:6,alpha:.26,length:52,width:2.6,ttl:.24}:tier==='heavy'?{count:3,alpha:.19,length:39,width:2.2,ttl:.21}:{count:1,alpha:.12,length:26,width:1.7,ttl:.18};
  const q=qualityScale(quality);
  return {streakCount:Math.max(1,Math.round(base.count*q)),alpha:Number(Math.min(.26,base.alpha*(quality==='low'?.78:quality==='medium'?.9:1)).toFixed(3)),length:Math.min(52,base.length),width:base.width,ttl:base.ttl};
}
export function directionalHitVector(source:Vec2,target:Vec2):Vec2 {
  const dx=target.x-source.x,dy=target.y-source.y,d=Math.hypot(dx,dy);
  return d<=.001?{x:0,y:-1}:{x:dx/d,y:dy/d};
}

export type SpellResidueMotion='ember-tail'|'fork-echo'|'frost-halo'|'heat-haze'|'meteor-smoke'|'void-orbit';
export interface SpellResidueProfile { motion:SpellResidueMotion; color:string; secondaryColor:string; count:number; alpha:number; ttl:number; speed:number; spread:number; }
const RESIDUE:Record<SpellId,{motion:SpellResidueMotion;color:string;secondaryColor:string;speed:number;spread:number}>={
  fireBolt:{motion:'ember-tail',color:'#ff945e',secondaryColor:'#ffd178',speed:54,spread:.28},
  chainLightning:{motion:'fork-echo',color:'#8fdcff',secondaryColor:'#d7f4ff',speed:72,spread:.58},
  frostNova:{motion:'frost-halo',color:'#a8eaff',secondaryColor:'#e7fbff',speed:38,spread:Math.PI*2},
  flameField:{motion:'heat-haze',color:'#ff775a',secondaryColor:'#ffbd75',speed:30,spread:.9},
  meteorStorm:{motion:'meteor-smoke',color:'#ff9d62',secondaryColor:'#6f6677',speed:46,spread:.46},
  blackHole:{motion:'void-orbit',color:'#a789ff',secondaryColor:'#e0d7ff',speed:42,spread:Math.PI*2},
};
export function spellResidueProfile(spellId:SpellId,level:number,quality:PresentationQuality,criticalThreat=false):SpellResidueProfile {
  const id=RESIDUE[spellId],tier=level>=10?2:level>=5?1:0,q=qualityScale(quality),threat=criticalThreat?.66:1;
  const baseCount=[3,5,8][tier]!;
  return {motion:id.motion,color:id.color,secondaryColor:id.secondaryColor,count:Math.max(1,Math.min(8,Math.round(baseCount*q*threat))),alpha:Number(Math.min(.20,[.13,.16,.20][tier]!*q*threat).toFixed(3)),ttl:[.42,.56,.72][tier]!,speed:id.speed,spread:id.spread};
}

export type BossPressureTier='calm'|'strained'|'desperate';
export interface BossHealthPressureProfile { tier:BossPressureTier; color:string; edgeAlpha:number; glowAlpha:number; pulseHz:number; inset:number; }
const BOSS_COLORS:Record<BossArchetype,string>={inferno:'#ff7357',summoner:'#69dca0',juggernaut:'#ffc45f',abyssWitch:'#c97cff',twinMaw:'#ff79ac',timeEater:'#66cfff'};
export function bossHealthPressureProfile(archetype:BossArchetype,hpRatio:number,quality:PresentationQuality,reducedFlash=false):BossHealthPressureProfile {
  const ratio=Math.max(0,Math.min(1,hpRatio)); const tier:BossPressureTier=ratio<=.25?'desperate':ratio<=.55?'strained':'calm';
  const q=qualityScale(quality),flash=reducedFlash?.58:1;
  const edge=(tier==='desperate'?.16:tier==='strained'?.09:.04)*q*flash;
  const glow=(tier==='desperate'?.12:tier==='strained'?.065:.025)*q*flash;
  return {tier,color:BOSS_COLORS[archetype],edgeAlpha:Number(Math.min(.16,edge).toFixed(3)),glowAlpha:Number(Math.min(.12,glow).toFixed(3)),pulseHz:tier==='desperate'?3.0:tier==='strained'?2.0:1.2,inset:tier==='desperate'?7:10};
}

export type AmbientDepthMotion='ember-drift'|'snow-parallax'|'shard-orbit';
export interface MapAmbientDepthProfile { motion:AmbientDepthMotion; secondaryColor:string; layers:number; particlesPerSecond:number; parallax:number; alpha:number; }
export function mapAmbientDepthProfile(mapId:MapId,stage:MapEvolutionStage,quality:PresentationQuality,criticalThreat=false):MapAmbientDepthProfile {
  const id=mapId==='ruinedGate'?{motion:'ember-drift' as const,color:'#ffd092',rate:4.4,parallax:.74}:mapId==='frozenFen'?{motion:'snow-parallax' as const,color:'#e5fbff',rate:5.2,parallax:.56}:{motion:'shard-orbit' as const,color:'#e3d8ff',rate:4.8,parallax:.68};
  const q=qualityScale(quality),threat=criticalThreat?.54:1,layers=Math.min(3,1+stage);
  return {motion:id.motion,secondaryColor:id.color,layers,particlesPerSecond:Number(Math.max(.6,id.rate*(1+stage*.28)*q*threat).toFixed(3)),parallax:id.parallax,alpha:Number(Math.min(.28,.22*q*threat).toFixed(3))};
}

export interface VisualPriorityPolicy { impactScale:1; telegraphScale:1; environmentScale:number; spellResidueScale:number; screenDecorationScale:number; }
export function visualPriorityPolicy(quality:PresentationQuality,criticalThreat:boolean):VisualPriorityPolicy {
  const q=quality==='high'?1:quality==='medium'?.72:.48;
  return {impactScale:1,telegraphScale:1,environmentScale:Number(Math.max(.15,q*(criticalThreat?.40:1)).toFixed(3)),spellResidueScale:Number(Math.max(.15,q*(criticalThreat?.62:1)).toFixed(3)),screenDecorationScale:Number(Math.max(.15,q*(criticalThreat?.54:1)).toFixed(3))};
}


export type HitApproachRange='melee'|'mid'|'far';
export interface HitApproachProfile { range:HitApproachRange; tailScale:number; spread:number; alphaScale:number; }
export function hitApproachProfile(source:Vec2,target:Vec2,tier:DamageImpactTier,quality:PresentationQuality):HitApproachProfile {
  const distance=Math.hypot(target.x-source.x,target.y-source.y);
  const range:HitApproachRange=distance<=36?'melee':distance<=130?'mid':'far';
  const tailScale=range==='far'?1.18:range==='mid'?1:.76;
  const spread=range==='far'?7:range==='mid'?4.6:2.8;
  const tierScale=tier==='critical'?1:tier==='heavy'?.92:.82;
  const qualityAlpha=quality==='high'?1:quality==='medium'?.86:.68;
  return {range,tailScale,spread,alphaScale:Number(Math.min(1,tierScale*qualityAlpha).toFixed(3))};
}

export type SpellEchoShape='line-echo'|'fork-echo'|'halo-echo'|'field-echo'|'drop-echo'|'orbit-echo';
export interface SpellEchoContinuityProfile { shape:SpellEchoShape; color:string; secondary:string; echoCount:number; alpha:number; ttl:number; length:number; spacing:number; }
const SPELL_ECHO:Record<SpellId,{shape:SpellEchoShape;color:string;secondary:string;length:number;spacing:number}>={
  fireBolt:{shape:'line-echo',color:'#ff9a62',secondary:'#ffd47d',length:78,spacing:12},
  chainLightning:{shape:'fork-echo',color:'#8edcff',secondary:'#e1f8ff',length:88,spacing:10},
  frostNova:{shape:'halo-echo',color:'#abefff',secondary:'#eefcff',length:68,spacing:9},
  flameField:{shape:'field-echo',color:'#ff7b5f',secondary:'#ffc17d',length:72,spacing:11},
  meteorStorm:{shape:'drop-echo',color:'#ff9e62',secondary:'#6f6677',length:96,spacing:14},
  blackHole:{shape:'orbit-echo',color:'#a98aff',secondary:'#e0d8ff',length:82,spacing:10},
};
export function spellEchoContinuityProfile(spellId:SpellId,level:number,quality:PresentationQuality,criticalThreat=false):SpellEchoContinuityProfile {
  const base=SPELL_ECHO[spellId],tier=level>=10?2:level>=5?1:0;
  const q=qualityScale(quality),threat=criticalThreat?.58:1;
  const echoCount=Math.max(1,Math.min(5,Math.round([2,3,5][tier]!*q*threat)));
  return {shape:base.shape,color:base.color,secondary:base.secondary,echoCount,alpha:Number(Math.min(.18,[.11,.145,.18][tier]!*q*threat).toFixed(3)),ttl:[.22,.28,.34][tier]!,length:Math.min(96,base.length*(1+tier*.06)),spacing:base.spacing};
}

export interface BossPressureTransitionProfile { tier:Exclude<BossPressureTier,'calm'>; color:string; alpha:number; rayCount:number; ttl:number; radius:number; }
export function bossPressureTransitionProfile(archetype:BossArchetype,fromRatio:number,toRatio:number,quality:PresentationQuality,reducedFlash=false):BossPressureTransitionProfile|null {
  const from=Math.max(0,Math.min(1,fromRatio)),to=Math.max(0,Math.min(1,toRatio));
  let tier:Exclude<BossPressureTier,'calm'>|null=null;
  if(from>.25&&to<=.25)tier='desperate'; else if(from>.55&&to<=.55)tier='strained';
  if(!tier)return null;
  const q=qualityScale(quality),flash=reducedFlash?.56:1,desperate=tier==='desperate';
  return {tier,color:BOSS_COLORS[archetype],alpha:Number(Math.min(.18,(desperate?.18:.12)*q*flash).toFixed(3)),rayCount:Math.max(2,Math.min(8,Math.round((desperate?8:5)*q))),ttl:desperate?.38:.30,radius:desperate?190:150};
}

export type MapCombatReactionMotion='gust'|'frost-lift'|'resonance';
export interface MapCombatReactionProfile { motion:MapCombatReactionMotion; color:string; accent:string; particleCount:number; alpha:number; ttl:number; speed:number; }
const SPELL_REACTION_ACCENT:Record<SpellId,string>={fireBolt:'#ff9a60',chainLightning:'#8fdcff',frostNova:'#b5efff',flameField:'#ff775b',meteorStorm:'#ffc078',blackHole:'#ae94ff'};
export function mapCombatReactionProfile(mapId:MapId,spellId:SpellId,quality:PresentationQuality,criticalThreat=false):MapCombatReactionProfile {
  const map=mapId==='ruinedGate'?{motion:'gust' as const,color:'#d99b67',speed:78}:mapId==='frozenFen'?{motion:'frost-lift' as const,color:'#d9f7ff',speed:62}:{motion:'resonance' as const,color:'#d6c8ff',speed:88};
  const q=qualityScale(quality),threat=criticalThreat?.52:1,base=spellId==='meteorStorm'||spellId==='blackHole'?6:spellId==='flameField'||spellId==='frostNova'?5:4;
  return {motion:map.motion,color:map.color,accent:SPELL_REACTION_ACCENT[spellId],particleCount:Math.max(1,Math.min(6,Math.round(base*q*threat))),alpha:Number(Math.min(.18,.16*q*threat).toFixed(3)),ttl:spellId==='meteorStorm'?.48:.38,speed:Math.min(92,map.speed)};
}

export type ReadabilityThreat='normal'|'danger'|'critical';
export interface VisualReadabilityBudget { telegraphScale:1; impactScale:1; hitDirectionScale:1; spellEchoScale:number; environmentReactionScale:number; bossPressureScale:number; screenDecorationScale:number; }
export function visualReadabilityBudget(quality:PresentationQuality,threat:ReadabilityThreat):VisualReadabilityBudget {
  const q=quality==='high'?1:quality==='medium'?.72:.48;
  const danger=threat==='danger',critical=threat==='critical';
  const env=critical?.30:danger?.56:1, echo=critical?.56:danger?.76:1, boss=critical?.68:danger?.84:1, screen=critical?.44:danger?.68:1;
  const bounded=(value:number,min=.15)=>Number(Math.max(min,Math.min(1,q*value)).toFixed(3));
  return {telegraphScale:1,impactScale:1,hitDirectionScale:1,spellEchoScale:bounded(echo),environmentReactionScale:bounded(env),bossPressureScale:bounded(boss,.22),screenDecorationScale:bounded(screen)};
}

export interface DirectionalImpactRecoilProfile { range:HitApproachRange; offset:Vec2; magnitude:number; duration:number; }
export function directionalImpactRecoilProfile(source:Vec2,target:Vec2,tier:DamageImpactTier,quality:PresentationQuality):DirectionalImpactRecoilProfile {
  const approach=hitApproachProfile(source,target,tier,quality),dir=directionalHitVector(source,target);
  const tierMagnitude=tier==='critical'?2.7:tier==='heavy'?1.7:.72;
  const rangeScale=approach.range==='far'?1.08:approach.range==='mid'?1:.78;
  const q=quality==='high'?1:quality==='medium'?.82:.62;
  const magnitude=Number(Math.min(3,tierMagnitude*rangeScale*q).toFixed(3));
  const duration=tier==='critical'?.15:tier==='heavy'?.12:.09;
  return {range:approach.range,offset:{x:Number((dir.x*magnitude).toFixed(3)),y:Number((dir.y*magnitude).toFixed(3))},magnitude,duration};
}

export type SpellEchoCadence='snap'|'fork-step'|'halo-bloom'|'field-linger'|'impact-drop'|'orbit-decay';
export interface SpellEchoCadenceProfile { cadence:SpellEchoCadence; delayStep:number; alphaScales:number[]; ttlScales:number[]; }
const SPELL_CADENCE:Record<SpellId,{cadence:SpellEchoCadence;delay:number}>={
  fireBolt:{cadence:'snap',delay:.018},chainLightning:{cadence:'fork-step',delay:.026},frostNova:{cadence:'halo-bloom',delay:.034},flameField:{cadence:'field-linger',delay:.042},meteorStorm:{cadence:'impact-drop',delay:.050},blackHole:{cadence:'orbit-decay',delay:.046},
};
export function spellEchoCadenceProfile(spellId:SpellId,level:number,quality:PresentationQuality,criticalThreat=false):SpellEchoCadenceProfile {
  const base=SPELL_CADENCE[spellId],tier=level>=10?2:level>=5?1:0,q=qualityScale(quality),threat=criticalThreat?.68:1;
  const count=Math.max(1,Math.min(5,Math.round([2,3,5][tier]!*q*threat)));
  const alphaBase=[1,.84,.70,.56,.42],ttlBase=[1,.90,.80,.70,.60];
  return {cadence:base.cadence,delayStep:Number(Math.min(.055,base.delay*(criticalThreat?.72:1)).toFixed(3)),alphaScales:alphaBase.slice(0,count),ttlScales:ttlBase.slice(0,count)};
}

export interface BossPressureEnvelope { edgeScale:number; glowScale:number; lineWidthScale:number; }
const BOSS_PHASE_OFFSET:Record<BossArchetype,number>={inferno:.12,summoner:.92,juggernaut:1.72,abyssWitch:2.46,twinMaw:3.18,timeEater:4.02};
export function bossPressureEnvelope(archetype:BossArchetype,hpRatio:number,elapsed:number,quality:PresentationQuality,reducedFlash=false,reducedMotion=false):BossPressureEnvelope {
  const ratio=Math.max(0,Math.min(1,hpRatio)),tier:BossPressureTier=ratio<=.25?'desperate':ratio<=.55?'strained':'calm';
  if(reducedMotion)return{edgeScale:1,glowScale:1,lineWidthScale:1};
  const hz=tier==='desperate'?2.35:tier==='strained'?1.7:1.05;
  const baseAmp=tier==='desperate'?.24:tier==='strained'?.16:.09;
  const q=quality==='high'?1:quality==='medium'?.88:.76,amp=baseAmp*q*(reducedFlash?.44:1);
  const phase=BOSS_PHASE_OFFSET[archetype]; const wave=.5+.5*Math.sin(Math.max(0,elapsed)*Math.PI*2*hz+phase);
  const edgeScale=Number(Math.max(.68,Math.min(1,1-amp*(1-wave))).toFixed(3));
  const glowScale=Number(Math.max(.62,Math.min(1,1-amp*1.18*(1-wave))).toFixed(3));
  const lineWidthScale=Number(Math.max(.9,Math.min(1.12,.96+wave*.10)).toFixed(3));
  return {edgeScale,glowScale,lineWidthScale};
}

export type MapAmbientFlow='updraft'|'crosswind'|'orbital';
export interface MapAmbientFlowProfile { flow:MapAmbientFlow; x:number; y:number; speedScale:number; turbulence:number; depthScale:number; }
export function mapAmbientFlowProfile(mapId:MapId,stage:MapEvolutionStage,elapsed:number,criticalThreat=false):MapAmbientFlowProfile {
  const t=Math.max(0,Number.isFinite(elapsed)?elapsed:0),depthScale=Math.min(1.18,1+stage*.09),threat=criticalThreat?.72:1;
  if(mapId==='ruinedGate'){
    const x=Math.sin(t*.83)*.26,y=-Math.max(.58,.82+Math.cos(t*.47)*.12); return{flow:'updraft',x:Number(x.toFixed(3)),y:Number(y.toFixed(3)),speedScale:Number(Math.min(1.15,(.92+stage*.07)*threat).toFixed(3)),turbulence:Number(Math.min(.28,.18*(1+stage*.08)*(criticalThreat?.52:1)).toFixed(3)),depthScale};
  }
  if(mapId==='frozenFen'){
    const x=.72+Math.sin(t*.39)*.18,y=Math.cos(t*.61)*.16; return{flow:'crosswind',x:Number(Math.min(1,x).toFixed(3)),y:Number(y.toFixed(3)),speedScale:Number(Math.min(1.15,(.88+stage*.08)*threat).toFixed(3)),turbulence:Number(Math.min(.28,.22*(1+stage*.06)*(criticalThreat?.52:1)).toFixed(3)),depthScale};
  }
  const a=t*.54; return{flow:'orbital',x:Number((Math.cos(a)*.72).toFixed(3)),y:Number((Math.sin(a)*.72).toFixed(3)),speedScale:Number(Math.min(1.15,(.94+stage*.075)*threat).toFixed(3)),turbulence:Number(Math.min(.28,.26*(1+stage*.04)*(criticalThreat?.52:1)).toFixed(3)),depthScale};
}

export type VisualFocusBossTier='none'|BossPressureTier;
export interface VisualFocusBudget { telegraphScale:1; impactScale:1; hitDirectionScale:1; environmentScale:number; spellEchoScale:number; bossPressureScale:number; screenDecorationScale:number; screenEffectCap:number; }
export function visualFocusBudget(quality:PresentationQuality,threat:ReadabilityThreat,bossTier:VisualFocusBossTier):VisualFocusBudget {
  const q=quality==='high'?1:quality==='medium'?.72:.48;
  const danger=threat==='danger',critical=threat==='critical',desperate=bossTier==='desperate',strained=bossTier==='strained';
  const env=(critical?.30:danger?.55:1)*(desperate?.78:strained?.90:1);
  const echo=(critical?.56:danger?.76:1)*(desperate?.88:strained?.95:1);
  const boss=(critical?.72:danger?.86:1)*(desperate?1:strained?.96:.9);
  const screen=(critical?.42:danger?.66:1)*(desperate?.82:strained?.92:1);
  const bounded=(v:number,min=.15)=>Number(Math.max(min,Math.min(1,q*v)).toFixed(3));
  const baseCap=quality==='high'?4:quality==='medium'?3:2,screenEffectCap=Math.max(1,baseCap-(critical?1:0));
  return{telegraphScale:1,impactScale:1,hitDirectionScale:1,environmentScale:bounded(env),spellEchoScale:bounded(echo),bossPressureScale:bounded(boss,.25),screenDecorationScale:bounded(screen),screenEffectCap};
}
