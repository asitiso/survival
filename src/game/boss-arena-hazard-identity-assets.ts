import type { BossArenaHazardKind } from './boss-arena.js';

export const BOSS_ARENA_HAZARD_IDENTITY_IDS=['firePool','summonSigil','shockLane','cursePool','twinCross','timeZone'] as const satisfies readonly BossArenaHazardKind[];
export type BossArenaHazardIdentityId=typeof BOSS_ARENA_HAZARD_IDENTITY_IDS[number];
const CELL:Readonly<Record<BossArenaHazardIdentityId,readonly[number,number]>>={firePool:[0,0],summonSigil:[1,0],shockLane:[2,0],cursePool:[0,1],twinCross:[1,1],timeZone:[2,1]};
const META:Readonly<Record<BossArenaHazardIdentityId,{label:string;accent:string}>>={
  firePool:{label:'화염 장판',accent:'#ff6748'},summonSigil:{label:'소환 진',accent:'#78e9a6'},shockLane:{label:'충격 통로',accent:'#ffd463'},cursePool:{label:'저주 지대',accent:'#cf78ff'},twinCross:{label:'쌍아귀 십자',accent:'#ff75aa'},timeZone:{label:'시간 지대',accent:'#66cbff'},
};
export interface BossArenaHazardIdentityIcon{kind:BossArenaHazardIdentityId;label:string;accent:string;sx:number;sy:number;sw:96;sh:96;animated:false;motionAmplitude:0;primaryTelegraphIdentitySupported:true;activeHazardIdentitySuppressed:true;maxVisibleIcons:1;textFallbackPreserved:true;loadFailureBlocksGameplay:false;}
export const BOSS_ARENA_HAZARD_IDENTITY_ATLAS={src:'./assets/bosses/boss-arena-hazard-icons.png',columns:3,rows:2,cellSize:96,width:288,height:192} as const;
export function bossArenaHazardIdentityIcon(kind:BossArenaHazardIdentityId):BossArenaHazardIdentityIcon{const[c,r]=CELL[kind],m=META[kind];return{kind,label:m.label,accent:m.accent,sx:c*96,sy:r*96,sw:96,sh:96,animated:false,motionAmplitude:0,primaryTelegraphIdentitySupported:true,activeHazardIdentitySuppressed:true,maxVisibleIcons:1,textFallbackPreserved:true,loadFailureBlocksGameplay:false};}
export function auditBossArenaHazardIdentityAtlas(){const icons=BOSS_ARENA_HAZARD_IDENTITY_IDS.map(bossArenaHazardIdentityIcon);const outOfBounds=icons.filter(i=>i.sx<0||i.sy<0||i.sx+i.sw>BOSS_ARENA_HAZARD_IDENTITY_ATLAS.width||i.sy+i.sh>BOSS_ARENA_HAZARD_IDENTITY_ATLAS.height).map(i=>i.kind);const uniqueCellCount=new Set(icons.map(i=>`${i.sx}:${i.sy}`)).size;const coverage=icons.length/6;return{coverage,uniqueCellCount,outOfBounds,passed:coverage===1&&uniqueCellCount===6&&outOfBounds.length===0};}
