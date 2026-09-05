import type { BossEncounterModifiers } from './boss-encounters.js';
import type { BossArchetype } from './boss-patterns.js';

export const BOSS_COUNTERPLAY_BENEFIT_IDENTITY_IDS=['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'] as const satisfies readonly BossArchetype[];
export type BossCounterplayBenefitIdentityId=typeof BOSS_COUNTERPLAY_BENEFIT_IDENTITY_IDS[number];
export const BOSS_COUNTERPLAY_BENEFIT_IDENTITY_ATLAS={src:'./assets/bosses/boss-counterplay-benefit-icons.png',columns:3,rows:2,cellSize:96,width:288,height:192} as const;
const CELL:Readonly<Record<BossCounterplayBenefitIdentityId,readonly[number,number]>>={inferno:[0,0],summoner:[1,0],juggernaut:[2,0],abyssWitch:[0,1],twinMaw:[1,1],timeEater:[2,1]};
const META:Readonly<Record<BossCounterplayBenefitIdentityId,{label:string;accent:string;benefit:'vulnerability'|'summonSuppression'|'chargeWeakened'|'curseRelief'|'mawCollapse'|'timeRelief'}>>={
  inferno:{label:'VULNERABLE',accent:'#ff9a62',benefit:'vulnerability'},
  summoner:{label:'SUMMONS SUPPRESSED',accent:'#7ff0b2',benefit:'summonSuppression'},
  juggernaut:{label:'CHARGE WEAKENED',accent:'#ffd978',benefit:'chargeWeakened'},
  abyssWitch:{label:'CURSE RELIEF',accent:'#d995ff',benefit:'curseRelief'},
  twinMaw:{label:'MAW COLLAPSE',accent:'#ff8bbb',benefit:'mawCollapse'},
  timeEater:{label:'TIME PRESSURE RELIEF',accent:'#83ddff',benefit:'timeRelief'},
};
export interface BossCounterplayBenefitIdentityIcon{archetype:BossCounterplayBenefitIdentityId;label:string;accent:string;benefit:typeof META[BossCounterplayBenefitIdentityId]['benefit'];sx:number;sy:number;sw:96;sh:96;animated:false;motionAmplitude:0;persistentRecallIdentitySupported:true;textFallbackPreserved:true;loadFailureBlocksGameplay:false;}
export function bossCounterplayBenefitIdentityIcon(archetype:BossCounterplayBenefitIdentityId):BossCounterplayBenefitIdentityIcon{const[c,r]=CELL[archetype],m=META[archetype];return{archetype,label:m.label,accent:m.accent,benefit:m.benefit,sx:c*96,sy:r*96,sw:96,sh:96,animated:false,motionAmplitude:0,persistentRecallIdentitySupported:true,textFallbackPreserved:true,loadFailureBlocksGameplay:false};}
export function bossCounterplayBenefitActive(archetype:BossArchetype,m:BossEncounterModifiers):boolean{
  if(archetype==='inferno')return m.bossDamageTakenMultiplier>1.0001;
  if(archetype==='summoner')return m.specialCadenceMultiplier>1.0001&&m.summonCountMultiplier<.9999;
  if(archetype==='juggernaut')return m.bossDamageTakenMultiplier>1.0001&&m.dashDistanceMultiplier<.9999;
  if(archetype==='abyssWitch')return m.bossDamageTakenMultiplier>1.0001&&m.specialCadenceMultiplier>1.0001;
  if(archetype==='twinMaw')return m.bossDamageTakenMultiplier>1.0001;
  return m.bossDamageTakenMultiplier>1.0001&&m.specialCadenceMultiplier>1.0001;
}
export function auditBossCounterplayBenefitIdentityAtlas(){const cells=new Set<string>(),outOfBounds:BossCounterplayBenefitIdentityId[]=[];for(const id of BOSS_COUNTERPLAY_BENEFIT_IDENTITY_IDS){const[c,r]=CELL[id];cells.add(`${c}:${r}`);if(c<0||r<0||c>=3||r>=2)outOfBounds.push(id);}const coverage=BOSS_COUNTERPLAY_BENEFIT_IDENTITY_IDS.length/6;return{itemCount:6,coverage,uniqueCellCount:cells.size,outOfBounds,passed:coverage===1&&cells.size===6&&outOfBounds.length===0};}
