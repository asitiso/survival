import type { Vec2 } from '../core/math.js';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './config.js';
import type { EnemyType } from './enemies.js';
import { enemyImpactVfxDescriptor } from './enemy-presentation.js';
import type { PresentationQuality } from './presentation-budget.js';
import { directionalHitVfxProfile, directionalHitVector, hitApproachProfile, directionalImpactRecoilProfile } from './visual-presence.js';
import { actionResultMinimumGap, actionResultPresentation, type ActionResultKind, type ActionResultPresentationInput } from './action-result-readability.js';
import { damageNumberPresentation } from './damage-number-readability.js';
import { defenseResponsePresentation, type DefenseResponseKind } from './defense-response-readability.js';

export type DamageImpactTier = 'normal' | 'heavy' | 'critical';
export type ImpactKind = 'awakened' | 'final' | 'ultimate' | 'bossHit' | 'eliteKill';

export type CameraPressureKind = 'meteor' | 'vortex' | 'bossPhase2' | 'bossPhase3' | 'bossEnter' | 'bossDeath' | 'killChain';
export interface CameraPressureProfile { scaleOffset:number; duration:number; }
const CAMERA_PRESSURE: Record<CameraPressureKind,CameraPressureProfile> = {
  meteor:{scaleOffset:0.024,duration:0.24},
  vortex:{scaleOffset:-0.018,duration:0.30},
  bossPhase2:{scaleOffset:0.012,duration:0.20},
  bossPhase3:{scaleOffset:0.022,duration:0.28},
  bossEnter:{scaleOffset:0.014,duration:0.24},
  bossDeath:{scaleOffset:0.028,duration:0.32},
  killChain:{scaleOffset:0.008,duration:0.16},
};
export function cameraPressureProfile(kind:CameraPressureKind):CameraPressureProfile { return {...CAMERA_PRESSURE[kind]}; }

export type KillChainVfxTier = 1|2|3;
export interface KillChainVfxProfile { tier:KillChainVfxTier; label:string; color:string; rayCount:number; pulseAlpha:number; shake:number; }
export interface KillChainVfxCue extends KillChainVfxProfile { count:number; }
export function killChainVfxProfile(tier:KillChainVfxTier):KillChainVfxProfile {
  if(tier===3)return{tier,label:'ARCANE BREAK',color:'#ffe47a',rayCount:12,pulseAlpha:0.24,shake:5.2};
  if(tier===2)return{tier,label:'ARCANE SURGE',color:'#9fe6ff',rayCount:8,pulseAlpha:0.18,shake:3.8};
  return{tier,label:'ARCANE RUSH',color:'#ccb9ff',rayCount:4,pulseAlpha:0.12,shake:2.4};
}
export class KillChainVfxTracker {
  private count=0;
  private lastKillAt=-Infinity;
  private emittedTier=0;
  reset():void { this.count=0; this.lastKillAt=-Infinity; this.emittedTier=0; }
  record(nowSeconds:number):KillChainVfxCue|null {
    const now=Number.isFinite(nowSeconds)?nowSeconds:0;
    if(now<this.lastKillAt || now-this.lastKillAt>0.85){ this.count=0; this.emittedTier=0; }
    this.lastKillAt=now;
    this.count=Math.min(99,this.count+1);
    const tier:0|KillChainVfxTier=this.count>=28?3:this.count>=14?2:this.count>=6?1:0;
    if(tier===0 || tier<=this.emittedTier)return null;
    this.emittedTier=tier;
    return {...killChainVfxProfile(tier),count:this.count};
  }
}

interface HitCue {
  kind: 'hit';
  pos: Vec2;
  amount: number;
  ttl: number;
  maxTtl: number;
  tier: DamageImpactTier;
  enemyType?: EnemyType | undefined;
  source?: Vec2 | undefined;
  targetId?: number | undefined;
  anchorPos: Vec2;
}
interface KillCue { kind: 'kill'; pos: Vec2; ttl: number; maxTtl: number; boss: boolean; }
interface ImpactCue { kind: 'impact'; pos: Vec2; ttl: number; maxTtl: number; impactKind: ImpactKind; }
interface ResultCue { kind:'result'; pos:Vec2; ttl:number; maxTtl:number; resultKind:ActionResultKind; source?:Vec2; }
interface DefenseResponseCue { pos:Vec2; ttl:number; maxTtl:number; responseKind:DefenseResponseKind; source?:Vec2; }
interface HealingResponseCue { pos:Vec2; ttl:number; maxTtl:number; response:HealingResponseAccounting; sourceKind:HealingResponseSource; source?:Vec2; targetId?:number; targetType?:EnemyType; }
type Cue = HitCue | KillCue | ImpactCue;

export function impactTierForDamage(amount: number, maxHp: number): DamageImpactTier {
  const ratio = Math.max(0, amount) / Math.max(1, maxHp);
  if (ratio >= 0.32) return 'critical';
  if (ratio >= 0.12) return 'heavy';
  return 'normal';
}

export interface CombatImpactVisual { fontSize: number; rayCount: number; ringRadius: number; weight: number; }
export function combatImpactVisual(tier: DamageImpactTier): CombatImpactVisual {
  if (tier === 'critical') return { fontSize: 26, rayCount: 8, ringRadius: 34, weight: 900 };
  if (tier === 'heavy') return { fontSize: 21, rayCount: 4, ringRadius: 24, weight: 850 };
  return { fontSize: 17, rayCount: 0, ringRadius: 16, weight: 800 };
}

export interface DefenseResponseAccounting { incoming:number; guardBlocked:number; shieldAbsorbed:number; hpIncoming:number; hpApplied:number; mitigation:number; multiplier:number; guardBroken:boolean; shieldBroken:boolean; armored:boolean; bossMultiplier:number; }
export interface HealingResponseAccounting { requestedHeal:number; hpRestored:number; overheal:number; }
export type HealingResponseSource='regenerating'|'shaman';
export interface HealingResponsePresentationInput {
  sourceKind:HealingResponseSource;
  battlefieldStress?:number;
  priorityTarget?:boolean;
  protectedWarning?:boolean;
  safeLaneVisible?:boolean;
  reducedFlash?:boolean;
  reducedMotion?:boolean;
}
export interface HealingResponsePresentation { alpha:number; connectorAlpha:number; radius:number; lineWidth:number; pulse:number; }
export interface HealingDamageArbitrationInput { sourceKind:HealingResponseSource; recentDamageTier:DamageImpactTier|null; resolvedResultNearby:boolean; defenseBreakNearby:boolean; clusterIndex:number; battlefieldStress?:number; reducedMotion?:boolean; reducedFlash?:boolean; }
export interface HealingDamageArbitrationPresentation { numberVisible:boolean; numberAlpha:number; numberOffsetX:number; numberOffsetY:number; returnCueAlpha:number; }
export function healingDamageArbitrationPresentation(input:HealingDamageArbitrationInput):HealingDamageArbitrationPresentation {
  const stress=Math.max(0,Math.min(1,input.battlefieldStress??0));
  const shaman=input.sourceKind==='shaman';
  const routineCapacity=Math.max(1,Math.round(4-stress*3));
  let numberVisible=shaman||Math.max(0,input.clusterIndex)<routineCapacity;
  let numberAlpha=(shaman?.68:.46)*(1-stress*(shaman?.18:.44));
  const recent=!!input.recentDamageTier;
  if(input.recentDamageTier==='critical')numberAlpha*=.56;
  if(input.defenseBreakNearby)numberAlpha*=.52;
  if(input.resolvedResultNearby){numberAlpha*=shaman?.46:.22;if(!shaman)numberVisible=false;}
  if(input.reducedFlash)numberAlpha*=.68;
  if(!numberVisible)numberAlpha=0;
  const displacement=input.reducedMotion?10:18;
  return {numberVisible,numberAlpha:Math.max(0,Math.min(.78,numberAlpha)),numberOffsetX:recent?(input.reducedMotion?4:7):0,numberOffsetY:recent?displacement:12,returnCueAlpha:recent?(input.reducedFlash?.10:.18):0};
}
export function healingResponsePresentation(input:HealingResponsePresentationInput):HealingResponsePresentation {
  const stress=Math.max(0,Math.min(1,input.battlefieldStress??0));
  const shaman=input.sourceKind==='shaman';
  let alpha=shaman?.42:.24;
  alpha*=shaman?1-stress*.30:1-stress*.58;
  if(input.priorityTarget)alpha*=1.35;
  if(input.protectedWarning)alpha*=shaman?.68:.42;
  if(input.safeLaneVisible)alpha*=shaman?.76:.58;
  if(input.reducedFlash)alpha*=.68;
  if(input.priorityTarget)alpha=Math.max(.16,alpha);
  alpha=Math.max(.035,Math.min(.62,alpha));
  const connectorAlpha=shaman?Math.min(.34,alpha*.82):0;
  return {alpha,connectorAlpha,radius:shaman?20:18,lineWidth:shaman?1.7:1.4,pulse:input.reducedMotion?0:(shaman?2.8:1.8)};
}

export interface CombatFeedbackSink {
  addHit(pos: Vec2, amount: number, tier?: boolean | DamageImpactTier, enemyType?:EnemyType, source?:Vec2, targetId?:number): void;
  tagLatestHitTarget?(targetId:number):void;
  addKill(pos: Vec2, boss?: boolean): void;
  addImpact(pos: Vec2, kind: ImpactKind): void;
  addActionResult?(pos:Vec2, kind:ActionResultKind, source?:Vec2):void;
  addDefenseResponse?(pos:Vec2, response:DefenseResponseAccounting, source?:Vec2):void;
  addHealingResponse?(pos:Vec2, response:HealingResponseAccounting, sourceKind:HealingResponseSource, source?:Vec2, targetId?:number, targetType?:EnemyType):void;
}

const IMPACT_SHAKE: Record<ImpactKind, number> = { awakened: 2.4, final: 6.2, ultimate: 7.4, bossHit: 9.2, eliteKill: 4.8 };
const RESULT_COLOR:Record<ActionResultKind,string>={normalHit:'#eef5ff',weakpointHit:'#9fe8ff',guardBreak:'#b8ddff',weakpointBreak:'#ffe49a',bossStagger:'#ffd06e',enemyKill:'#fff0b8'};
export type ActionResultRenderContext=Omit<ActionResultPresentationInput,'kind'|'sourceDistance'>;

export class CombatFeedbackSystem implements CombatFeedbackSink {
  private cues: Cue[] = [];
  private shake = 0;
  private shakePhase = 0;
  private impactVisualCooldown = 0;
  private cameraPressureOffset = 0;
  private cameraPressureTtl = 0;
  private cameraPressureMaxTtl = 0;
  private directionalRecoil: Vec2 = { x: 0, y: 0 };
  private directionalRecoilTtl = 0;
  private directionalRecoilMaxTtl = 0;
  private resultCues:ResultCue[]=[];
  private defenseResponseCues:DefenseResponseCue[]=[];
  private healingResponseCues:HealingResponseCue[]=[];
  private resultCooldowns=new Map<ActionResultKind,number>();

  get activeCount(): number { return this.cues.length+this.resultCues.length+this.defenseResponseCues.length+this.healingResponseCues.length; }
  get defenseResponseCount():number{return this.defenseResponseCues.length;}
  get healingResponseCount():number{return this.healingResponseCues.length;}
  get shakeIntensity(): number { return this.shake; }
  get cameraScaleOffset(): number {
    if(this.cameraPressureTtl<=0 || this.cameraPressureMaxTtl<=0)return 0;
    const ratio=Math.max(0,Math.min(1,this.cameraPressureTtl/this.cameraPressureMaxTtl));
    return this.cameraPressureOffset*ratio;
  }
  get hitEnemyTypeCounts(): Partial<Record<EnemyType,number>> { const counts:Partial<Record<EnemyType,number>>={}; for(const cue of this.cues) if(cue.kind==='hit'&&cue.enemyType) counts[cue.enemyType]=(counts[cue.enemyType]??0)+1; return counts; }
  get hitTierCounts(): Record<DamageImpactTier, number> {
    const counts: Record<DamageImpactTier, number> = { normal: 0, heavy: 0, critical: 0 };
    for (const cue of this.cues) if (cue.kind === 'hit') counts[cue.tier] += 1;
    return counts;
  }
  get cameraOffset(): Vec2 {
    const shakeOffset=this.shake<=0?{x:0,y:0}:{ x: Math.sin(this.shakePhase * 51 + 0.7) * this.shake, y: Math.cos(this.shakePhase * 43 + 1.3) * this.shake * 0.72 };
    const recoilRatio=this.directionalRecoilTtl>0&&this.directionalRecoilMaxTtl>0?Math.max(0,Math.min(1,this.directionalRecoilTtl/this.directionalRecoilMaxTtl)):0;
    return {x:shakeOffset.x+this.directionalRecoil.x*recoilRatio,y:shakeOffset.y+this.directionalRecoil.y*recoilRatio};
  }

  reset(): void { this.cues = []; this.resultCues=[]; this.defenseResponseCues=[]; this.healingResponseCues=[]; this.resultCooldowns.clear(); this.shake = 0; this.shakePhase = 0; this.impactVisualCooldown = 0; this.cameraPressureOffset=0; this.cameraPressureTtl=0; this.cameraPressureMaxTtl=0; this.directionalRecoil={x:0,y:0}; this.directionalRecoilTtl=0; this.directionalRecoilMaxTtl=0; }

  addHit(pos: Vec2, amount: number, tier: boolean | DamageImpactTier = 'normal', enemyType?:EnemyType, source?:Vec2, targetId?:number): void {
    const resolved: DamageImpactTier = typeof tier === 'boolean' ? (tier ? 'critical' : 'normal') : tier;
    this.cues.push({ kind: 'hit', pos: { ...pos }, anchorPos:{...pos}, amount, ttl: 0.46, maxTtl: 0.46, tier: resolved, ...(enemyType?{enemyType}:{}), ...(source?{source:{...source}}:{}), ...(targetId!==undefined?{targetId}:{}) });
    if(source&&resolved!=='normal'){const recoil=directionalImpactRecoilProfile(source,pos,resolved,'medium'); if(recoil.magnitude>=Math.hypot(this.directionalRecoil.x,this.directionalRecoil.y)){this.directionalRecoil={...recoil.offset};this.directionalRecoilTtl=recoil.duration;this.directionalRecoilMaxTtl=recoil.duration;}}
    this.trim();
  }

  tagLatestHitTarget(targetId:number):void {
    if(!Number.isFinite(targetId))return;
    for(let index=this.cues.length-1;index>=0;index--){
      const cue=this.cues[index];
      if(cue?.kind!=='hit')continue;
      cue.targetId=targetId;
      return;
    }
  }

  addKill(pos: Vec2, boss = false): void {
    this.cues.push({ kind: 'kill', pos: { ...pos }, ttl: boss ? 0.95 : 0.62, maxTtl: boss ? 0.95 : 0.62, boss });
    if (boss) this.addShake(14);
    this.trim();
  }

  addCameraPressure(kind:CameraPressureKind):void {
    const profile=cameraPressureProfile(kind);
    this.cameraPressureOffset=profile.scaleOffset;
    this.cameraPressureTtl=profile.duration;
    this.cameraPressureMaxTtl=profile.duration;
    if(kind==='killChain')this.addShake(killChainVfxProfile(1).shake);
  }

  addImpact(pos: Vec2, kind: ImpactKind): void {
    this.addShake(IMPACT_SHAKE[kind]);
    const bypassThrottle = kind === 'bossHit' || kind === 'eliteKill';
    if (this.impactVisualCooldown > 0 && !bypassThrottle) return;
    const ttl = kind === 'bossHit' ? 0.48 : kind === 'final' || kind === 'ultimate' ? 0.40 : 0.32;
    this.cues.push({ kind: 'impact', pos: { ...pos }, ttl, maxTtl: ttl, impactKind: kind });
    this.impactVisualCooldown = kind === 'final' || kind === 'ultimate' ? 0.07 : 0.045;
    this.trim();
  }


  addHealingResponse(pos:Vec2,response:HealingResponseAccounting,sourceKind:HealingResponseSource,source?:Vec2,targetId?:number,targetType?:EnemyType):void {
    if(!(response.hpRestored>0))return;
    const maxTtl=sourceKind==='shaman'?.34:.26;
    this.healingResponseCues.push({pos:{...pos},response:{...response},sourceKind,ttl:maxTtl,maxTtl,...(source?{source:{...source}}:{}),...(targetId!==undefined?{targetId}:{}),...(targetType?{targetType}:{})});
    if(this.healingResponseCues.length>18)this.healingResponseCues.splice(0,this.healingResponseCues.length-18);
  }

  addDefenseResponse(pos:Vec2,response:DefenseResponseAccounting,source?:Vec2):void {
    let responseKind:DefenseResponseKind|null=null;
    if(response.guardBlocked>0)responseKind=response.guardBroken?'guardBreak':'guard';
    else if(response.shieldAbsorbed>0)responseKind=response.shieldBroken?'shieldBreak':'shield';
    else if(response.armored&&response.mitigation>0)responseKind='armor';
    if(!responseKind)return;
    const ttl=responseKind==='guardBreak'||responseKind==='shieldBreak'?.30:.22;
    this.defenseResponseCues.push({pos:{...pos},responseKind,ttl,maxTtl:ttl,...(source?{source:{...source}}:{})});
    if(this.defenseResponseCues.length>16)this.defenseResponseCues.splice(0,this.defenseResponseCues.length-16);
  }

  addActionResult(pos:Vec2,kind:ActionResultKind,source?:Vec2):void {
    if((this.resultCooldowns.get(kind)??0)>0)return;
    const ttl=kind==='normalHit'?0.16:kind==='weakpointHit'?0.20:0.28;
    this.resultCues.push({kind:'result',pos:{...pos},resultKind:kind,ttl,maxTtl:ttl,...(source?{source:{...source}}:{})});
    if(this.resultCues.length>18)this.resultCues.splice(0,this.resultCues.length-18);
    this.resultCooldowns.set(kind,actionResultMinimumGap(kind));
  }

  hasActionResultNear(pos:Vec2,radius:number):boolean {
    const safeRadius=Math.max(0,Number.isFinite(radius)?radius:0);
    return this.resultCues.some((cue)=>Math.hypot(cue.pos.x-pos.x,cue.pos.y-pos.y)<=safeRadius);
  }

  update(dt: number): void {
    this.shakePhase += dt;
    this.shake = Math.max(0, this.shake - dt * 20);
    this.impactVisualCooldown = Math.max(0, this.impactVisualCooldown - dt);
    this.cameraPressureTtl=Math.max(0,this.cameraPressureTtl-dt);
    if(this.cameraPressureTtl<=0){this.cameraPressureOffset=0;this.cameraPressureMaxTtl=0;}
    this.directionalRecoilTtl=Math.max(0,this.directionalRecoilTtl-dt);
    if(this.directionalRecoilTtl<=0){this.directionalRecoil={x:0,y:0};this.directionalRecoilMaxTtl=0;}
    for(const [kind,remaining] of this.resultCooldowns){const next=Math.max(0,remaining-dt);if(next<=0)this.resultCooldowns.delete(kind);else this.resultCooldowns.set(kind,next);}
    for(const cue of this.resultCues)cue.ttl-=dt;
    this.resultCues=this.resultCues.filter((cue)=>cue.ttl>0);
    for(const cue of this.defenseResponseCues)cue.ttl-=dt;
    this.defenseResponseCues=this.defenseResponseCues.filter((cue)=>cue.ttl>0);
    for(const cue of this.healingResponseCues)cue.ttl-=dt;
    this.healingResponseCues=this.healingResponseCues.filter((cue)=>cue.ttl>0);
    for (const cue of this.cues) {
      cue.ttl -= dt;
      if (cue.kind === 'hit') cue.pos.y -= dt * (cue.tier === 'critical' ? 82 : cue.tier === 'heavy' ? 68 : 56);
    }
    this.cues = this.cues.filter((cue) => cue.ttl > 0);
  }

  render(ctx: CanvasRenderingContext2D, quality:PresentationQuality='high', resultContext:ActionResultRenderContext={}): void {
    let remainingRoutineHealingNumbers=this.healingResponseCues.reduce((count,cue)=>count+(cue.sourceKind==='regenerating'?1:0),0);
    for(const cue of this.healingResponseCues){
      const ratio=Math.max(0,Math.min(1,cue.ttl/Math.max(.001,cue.maxTtl)));
      const matchingHit=cue.targetId!==undefined?this.cues.find((candidate)=>candidate.kind==='hit'&&candidate.targetId===cue.targetId&&candidate.ttl>0):undefined;
      const recentTarget=!!matchingHit;
      const priorityType=cue.targetType==='boss'||cue.targetType==='elite'||cue.targetType==='shaman'||cue.targetType==='shieldbearer'||cue.targetType==='assassin'||cue.targetType==='siegeGolem'||cue.targetType==='nullifier';
      const visual=healingResponsePresentation({sourceKind:cue.sourceKind,priorityTarget:recentTarget||priorityType,...(resultContext.battlefieldStress!==undefined?{battlefieldStress:resultContext.battlefieldStress}:{}),...(resultContext.protectedWarning!==undefined?{protectedWarning:resultContext.protectedWarning}:{}),...(resultContext.safeLaneVisible!==undefined?{safeLaneVisible:resultContext.safeLaneVisible}:{}),...(resultContext.reducedFlash!==undefined?{reducedFlash:resultContext.reducedFlash}:{}),...(resultContext.reducedMotion!==undefined?{reducedMotion:resultContext.reducedMotion}:{})});
      if(cue.sourceKind==='regenerating')remainingRoutineHealingNumbers-=1;
      const resolvedResultNearby=this.resultCues.some((candidate)=>Math.hypot(candidate.pos.x-cue.pos.x,candidate.pos.y-cue.pos.y)<=38&&actionResultPresentation({...resultContext,kind:candidate.resultKind,sourceDistance:0}).priority>=2);
      const defenseBreakNearby=this.defenseResponseCues.some((candidate)=>(candidate.responseKind==='guardBreak'||candidate.responseKind==='shieldBreak')&&Math.hypot(candidate.pos.x-cue.pos.x,candidate.pos.y-cue.pos.y)<=38);
      const arbitration=healingDamageArbitrationPresentation({sourceKind:cue.sourceKind,recentDamageTier:matchingHit&&matchingHit.kind==='hit'?matchingHit.tier:null,resolvedResultNearby,defenseBreakNearby,clusterIndex:cue.sourceKind==='regenerating'?remainingRoutineHealingNumbers:0,...(resultContext.battlefieldStress!==undefined?{battlefieldStress:resultContext.battlefieldStress}:{}),...(resultContext.reducedFlash!==undefined?{reducedFlash:resultContext.reducedFlash}:{}),...(resultContext.reducedMotion!==undefined?{reducedMotion:resultContext.reducedMotion}:{})});
      const progress=1-ratio,pulse=Math.sin(progress*Math.PI)*visual.pulse,radius=visual.radius+progress*2+pulse;
      ctx.save();ctx.strokeStyle=cue.sourceKind==='shaman'?'#91f7b4':'#79dea0';ctx.lineCap='round';
      if(cue.sourceKind==='shaman'&&cue.source&&visual.connectorAlpha>0){
        const dx=cue.pos.x-cue.source.x,dy=cue.pos.y-cue.source.y,d=Math.hypot(dx,dy);
        if(d>1){const ux=dx/d,uy=dy/d;ctx.globalAlpha=ratio*visual.connectorAlpha;ctx.lineWidth=Math.max(.8,visual.lineWidth*.72);ctx.beginPath();ctx.moveTo(cue.source.x+ux*Math.min(18,d*.18),cue.source.y+uy*Math.min(18,d*.18));ctx.lineTo(cue.pos.x-ux*Math.min(radius+4,d*.22),cue.pos.y-uy*Math.min(radius+4,d*.22));ctx.stroke();}
      }
      if(arbitration.returnCueAlpha>0&&matchingHit&&matchingHit.kind==='hit'){
        ctx.globalAlpha=ratio*arbitration.returnCueAlpha;ctx.lineWidth=1.1;ctx.beginPath();ctx.moveTo(cue.pos.x-6,cue.pos.y+10);ctx.lineTo(cue.pos.x+5,cue.pos.y+15);ctx.stroke();
      }
      ctx.globalAlpha=ratio*visual.alpha;ctx.lineWidth=visual.lineWidth;ctx.beginPath();ctx.arc(cue.pos.x,cue.pos.y+3,radius,0,Math.PI*2);ctx.stroke();
      if(arbitration.numberVisible){
        const text=`+${Math.max(1,Math.round(cue.response.hpRestored)).toLocaleString()}`;
        const textX=cue.pos.x+arbitration.numberOffsetX,textY=cue.pos.y+arbitration.numberOffsetY;
        ctx.globalAlpha=Math.min(1,ratio*1.5)*arbitration.numberAlpha;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font=`800 ${cue.sourceKind==='shaman'?15:13}px system-ui`;ctx.lineWidth=3;ctx.strokeStyle='rgba(4,12,8,.72)';ctx.fillStyle=cue.sourceKind==='shaman'?'#b8ffd0':'#9df0ba';ctx.strokeText(text,textX,textY);ctx.fillText(text,textX,textY);
      }
      ctx.restore();
    }
    for(const cue of this.defenseResponseCues){
      const ratio=Math.max(0,Math.min(1,cue.ttl/Math.max(.001,cue.maxTtl)));
      const visual=defenseResponsePresentation({kind:cue.responseKind,...(resultContext.battlefieldStress!==undefined?{battlefieldStress:resultContext.battlefieldStress}:{}),...(resultContext.protectedWarning!==undefined?{protectedWarning:resultContext.protectedWarning}:{}),...(resultContext.safeLaneVisible!==undefined?{safeLaneVisible:resultContext.safeLaneVisible}:{}),...(resultContext.reducedFlash!==undefined?{reducedFlash:resultContext.reducedFlash}:{}),...(resultContext.reducedMotion!==undefined?{reducedMotion:resultContext.reducedMotion}:{})});
      const progress=1-ratio,pulse=Math.sin(progress*Math.PI)*visual.pulse,r=visual.radius+pulse;
      ctx.save();ctx.globalAlpha=ratio*visual.alpha;ctx.lineWidth=visual.lineWidth;ctx.strokeStyle=cue.responseKind.startsWith('guard')?'#8fffd3':cue.responseKind.startsWith('shield')?'#9fcaff':'#d6c9ad';
      if(cue.responseKind==='armor'){ctx.beginPath();ctx.arc(cue.pos.x,cue.pos.y+5,r,-.05*Math.PI,.95*Math.PI);ctx.stroke();}
      else if(cue.responseKind.startsWith('guard')){const a=cue.source?Math.atan2(cue.pos.y-cue.source.y,cue.pos.x-cue.source.x):Math.PI;ctx.beginPath();ctx.arc(cue.pos.x,cue.pos.y,r,a-.8,a+.8);ctx.stroke();if(cue.responseKind==='guardBreak'){ctx.beginPath();ctx.arc(cue.pos.x,cue.pos.y,r+5,a-.55,a+.55);ctx.stroke();}}
      else {ctx.beginPath();ctx.arc(cue.pos.x,cue.pos.y,r,0,Math.PI*2);ctx.stroke();if(cue.responseKind==='shieldBreak'){ctx.beginPath();ctx.arc(cue.pos.x,cue.pos.y,r+5,-.7,.7);ctx.stroke();}}
      ctx.restore();
    }
    let remainingRoutineDamageNumbers=this.cues.reduce((count,cue)=>count+(cue.kind==='hit'&&cue.tier==='normal'?1:0),0);
    for (let cueIndex=0;cueIndex<this.cues.length;cueIndex++) {
      const cue=this.cues[cueIndex]!;
      const ratio = Math.max(0, cue.ttl / cue.maxTtl);
      if (cue.kind === 'hit') {
        const visual = combatImpactVisual(cue.tier);
        const identity=cue.enemyType?enemyImpactVfxDescriptor(cue.enemyType,cue.tier):null;
        const rayCount=identity?Math.max(visual.rayCount,identity.rayCount):visual.rayCount;
        const directional=directionalHitVfxProfile(cue.tier,quality);
        ctx.save();
        if(cue.source){
          const dir=directionalHitVector(cue.source,cue.pos),perp={x:-dir.y,y:dir.x};
          const approach=hitApproachProfile(cue.source,cue.pos,cue.tier,quality);
          ctx.globalAlpha=ratio*directional.alpha*approach.alphaScale; ctx.strokeStyle=identity?.color ?? '#dff3ff'; ctx.lineWidth=directional.width; ctx.lineCap='round';
          for(let i=0;i<directional.streakCount;i++){const o=(i-(directional.streakCount-1)/2)*approach.spread; const tail=directional.length*approach.tailScale*(.78+(i%3)*.11); ctx.beginPath(); ctx.moveTo(cue.pos.x-dir.x*tail+perp.x*o,cue.pos.y-dir.y*tail+perp.y*o); ctx.lineTo(cue.pos.x-dir.x*5+perp.x*o*.35,cue.pos.y-dir.y*5+perp.y*o*.35); ctx.stroke();}
        }
        if (rayCount > 0) {
          ctx.globalAlpha = ratio * (cue.tier === 'critical' ? 0.58 : 0.36);
          ctx.strokeStyle = identity?.color ?? (cue.tier === 'critical' ? '#ffe16d' : '#d9efff');
          ctx.lineWidth = cue.tier === 'critical' ? 2.8 : 2;
          for (let i = 0; i < rayCount; i++) {
            const a = Math.PI * 2 * i / rayCount;
            const inner = visual.ringRadius * 0.55, outer = visual.ringRadius * (1.15 + (1 - ratio) * 0.45);
            ctx.beginPath(); ctx.moveTo(cue.pos.x + Math.cos(a) * inner, cue.pos.y + Math.sin(a) * inner); ctx.lineTo(cue.pos.x + Math.cos(a) * outer, cue.pos.y + Math.sin(a) * outer); ctx.stroke();
          }
          ctx.globalAlpha = ratio * (identity?.glowAlpha ?? 0.42); ctx.beginPath(); ctx.arc(cue.pos.x, cue.pos.y, Math.max(visual.ringRadius,identity?.ringRadius??0) * (1.15 - ratio * 0.25), 0, Math.PI * 2); ctx.stroke();
        }
        let resultPriorityNearby=0,resultDistance=Number.POSITIVE_INFINITY;
        let nearestResultCue:ResultCue|undefined;
        for(const resultCue of this.resultCues){
          const priority=actionResultPresentation({...resultContext,kind:resultCue.resultKind,sourceDistance:0}).priority;
          if(priority<2)continue;
          const d=Math.hypot(cue.pos.x-resultCue.pos.x,cue.pos.y-resultCue.pos.y);
          if(d<resultDistance||(d===resultDistance&&priority>resultPriorityNearby)){resultDistance=d;resultPriorityNearby=priority;nearestResultCue=resultCue;}
        }
        if(cue.tier==='normal')remainingRoutineDamageNumbers-=1;
        const clusterIndex=cue.tier==='normal'?remainingRoutineDamageNumbers:0;
        const nearbyCriticalReserved=cue.tier!=='critical'&&this.cues.some((other,otherIndex)=>{
          if(otherIndex===cueIndex||other.kind!=='hit'||other.tier!=='critical')return false;
          const sameTarget=cue.targetId!==undefined&&other.targetId!==undefined
            ?cue.targetId===other.targetId
            :Math.hypot(cue.anchorPos.x-other.anchorPos.x,cue.anchorPos.y-other.anchorPos.y)<=18;
          return !sameTarget&&Math.hypot(cue.anchorPos.x-other.anchorPos.x,cue.anchorPos.y-other.anchorPos.y)<=34;
        });
        let sameTargetIndex=0,denseNeighborIndex=nearbyCriticalReserved?1:0;
        for(let previousIndex=0;previousIndex<cueIndex;previousIndex++){
          const previous=this.cues[previousIndex];
          if(!previous||previous.kind!=='hit')continue;
          const sameTarget=cue.targetId!==undefined&&previous.targetId!==undefined
            ?cue.targetId===previous.targetId
            :Math.hypot(cue.anchorPos.x-previous.anchorPos.x,cue.anchorPos.y-previous.anchorPos.y)<=18;
          if(sameTarget){sameTargetIndex+=1;continue;}
          const anchorDistance=Math.hypot(cue.anchorPos.x-previous.anchorPos.x,cue.anchorPos.y-previous.anchorPos.y);
          if(anchorDistance<=34&&previous.tier!=='critical')denseNeighborIndex+=1;
        }
        const damageNumber=damageNumberPresentation({
          sameTargetIndex,
          denseNeighborIndex,
          anchorX:cue.pos.x,anchorY:cue.pos.y,viewportWidth:LOGICAL_WIDTH,viewportHeight:LOGICAL_HEIGHT,
          tier:cue.tier,
          clusterIndex,
          ...(resultContext.battlefieldStress!==undefined?{battlefieldStress:resultContext.battlefieldStress}:{}),
          ...(resultContext.protectedWarning!==undefined?{protectedWarning:resultContext.protectedWarning}:{}),
          ...(resultContext.safeLaneVisible!==undefined?{safeLaneVisible:resultContext.safeLaneVisible}:{}),
          ...(resultContext.reducedMotion!==undefined?{reducedMotion:resultContext.reducedMotion}:{}),
          ...(resultContext.reducedFlash!==undefined?{reducedFlash:resultContext.reducedFlash}:{}),
          ...(resultPriorityNearby>=2?{resultPriorityNearby,resultDistance}:{}),
          ...(nearestResultCue?{resultVectorX:cue.pos.x-nearestResultCue.pos.x,resultVectorY:cue.pos.y-nearestResultCue.pos.y}:{}),
          ...((cue.source??nearestResultCue?.source)?{
            sourceVectorX:cue.pos.x-(cue.source??nearestResultCue!.source!).x,
            sourceVectorY:cue.pos.y-(cue.source??nearestResultCue!.source!).y,
          }:{})
        });
        if(damageNumber.visible){
          ctx.globalAlpha = Math.min(1, ratio * 1.65)*damageNumber.alpha;
          ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
          ctx.font = `${visual.weight} ${visual.fontSize}px system-ui`;
          ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(4,8,14,.78)';
          ctx.fillStyle = cue.tier === 'critical' ? '#ffe16d' : cue.tier === 'heavy' ? '#d9efff' : '#f3f7ff';
          const text = `${Math.max(1, Math.round(cue.amount)).toLocaleString()}${cue.tier === 'critical' ? '!' : ''}`;
          const textY=cue.pos.y+damageNumber.offsetY;
          const textX=cue.pos.x+damageNumber.offsetX;
          ctx.strokeText(text, textX, textY); ctx.fillText(text, textX, textY);
        }
        ctx.restore();
      } else if (cue.kind === 'kill') {
        const progress = 1 - ratio; const radius = (cue.boss ? 42 : 24) + progress * (cue.boss ? 78 : 38);
        ctx.save(); ctx.globalAlpha = ratio * (cue.boss ? 0.92 : 0.58); ctx.strokeStyle = cue.boss ? '#ffd66c' : '#d7f4ff'; ctx.lineWidth = cue.boss ? 7 : 3;
        ctx.beginPath(); ctx.arc(cue.pos.x, cue.pos.y, radius, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      } else {
        const progress = 1 - ratio; const radius = 18 + progress * (cue.impactKind === 'bossHit' ? 78 : cue.impactKind === 'final' || cue.impactKind === 'ultimate' ? 58 : 42);
        const color = cue.impactKind === 'bossHit' ? '#ffcf63' : cue.impactKind === 'eliteKill' ? '#ffe37c' : cue.impactKind === 'final' ? '#fff0a6' : cue.impactKind === 'ultimate' ? '#e2a5ff' : '#bdeeff';
        ctx.save(); ctx.globalAlpha = ratio * 0.78; ctx.strokeStyle = color; ctx.lineWidth = cue.impactKind === 'bossHit' ? 7 : cue.impactKind === 'final' || cue.impactKind === 'ultimate' ? 5 : 3;
        ctx.beginPath(); ctx.arc(cue.pos.x, cue.pos.y, radius, 0, Math.PI * 2); ctx.stroke(); ctx.restore();
      }
    }
    for(const cue of this.resultCues){
      const ratio=Math.max(0,Math.min(1,cue.ttl/Math.max(.001,cue.maxTtl)));
      const sourceDistance=cue.source?Math.hypot(cue.pos.x-cue.source.x,cue.pos.y-cue.source.y):0;
      const visual=actionResultPresentation({...resultContext,kind:cue.resultKind,sourceDistance});
      if(!visual.visible)continue;
      const color=RESULT_COLOR[cue.resultKind];
      ctx.save();
      ctx.strokeStyle=color;
      ctx.lineCap='round';
      if(cue.source&&visual.connectorAlpha>0&&sourceDistance>1){
        const dx=cue.pos.x-cue.source.x,dy=cue.pos.y-cue.source.y,inv=1/sourceDistance,ux=dx*inv,uy=dy*inv;
        const connectorLength=Math.min(96,Math.max(18,sourceDistance-visual.radius));
        ctx.globalAlpha=ratio*visual.connectorAlpha;
        ctx.lineWidth=Math.max(.7,visual.lineWidth*.58);
        ctx.beginPath();
        ctx.moveTo(cue.pos.x-ux*connectorLength,cue.pos.y-uy*connectorLength);
        ctx.lineTo(cue.pos.x-ux*Math.max(4,visual.radius*.62),cue.pos.y-uy*Math.max(4,visual.radius*.62));
        ctx.stroke();
      }
      const progress=1-ratio;
      const pulse=visual.pulseAmplitude>0?Math.sin(progress*Math.PI)*visual.pulseAmplitude:0;
      const radius=visual.radius+progress*3+pulse;
      ctx.globalAlpha=ratio*visual.alpha;
      ctx.lineWidth=visual.lineWidth;
      ctx.beginPath();ctx.arc(cue.pos.x,cue.pos.y,radius,0,Math.PI*2);ctx.stroke();
      if(visual.rayCount>0){
        ctx.globalAlpha=ratio*visual.alpha*.76;
        ctx.lineWidth=Math.max(.72,visual.lineWidth*.72);
        for(let i=0;i<visual.rayCount;i++){
          const a=Math.PI*2*i/visual.rayCount,inner=radius+3,outer=radius+7+progress*5;
          ctx.beginPath();ctx.moveTo(cue.pos.x+Math.cos(a)*inner,cue.pos.y+Math.sin(a)*inner);ctx.lineTo(cue.pos.x+Math.cos(a)*outer,cue.pos.y+Math.sin(a)*outer);ctx.stroke();
        }
      }
      ctx.restore();
    }
  }

  private addShake(value: number): void { this.shake = Math.min(16, Math.max(this.shake, value)); }
  private trim(): void { if (this.cues.length > 96) this.cues.splice(0, this.cues.length - 96); }
}
