import type { BossArchetype } from './boss-patterns.js';
import { BOSS_RESPONSE_ACK_SECONDS } from './boss-action-assist.js';

export const BOSS_RESPONSE_ACK_IDENTITY_IDS=['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'] as const satisfies readonly BossArchetype[];
export type BossResponseAckIdentityId=typeof BOSS_RESPONSE_ACK_IDENTITY_IDS[number];
export const BOSS_RESPONSE_ACK_IDENTITY_ATLAS={src:'./assets/ui/boss-response-ack-icons.png',columns:3,rows:2,cellSize:96,width:288,height:192} as const;
const CELL:Readonly<Record<BossResponseAckIdentityId,readonly[number,number]>>={inferno:[0,0],summoner:[1,0],juggernaut:[2,0],abyssWitch:[0,1],twinMaw:[1,1],timeEater:[2,1]};
const META:Readonly<Record<BossResponseAckIdentityId,{label:string;accent:string}>>={
  inferno:{label:'INPUT LOCK · INFERNO',accent:'#ff8a55'},
  summoner:{label:'INPUT LOCK · SUMMONER',accent:'#7cf0ad'},
  juggernaut:{label:'INPUT LOCK · JUGGERNAUT',accent:'#ffd36a'},
  abyssWitch:{label:'INPUT LOCK · ABYSS',accent:'#d383ff'},
  twinMaw:{label:'INPUT LOCK · TWIN',accent:'#ff7fb6'},
  timeEater:{label:'INPUT LOCK · TIME',accent:'#77d7ff'},
};
export interface BossResponseAckIdentityIcon{id:BossResponseAckIdentityId;label:string;accent:string;sx:number;sy:number;sw:96;sh:96;animated:false;motionAmplitude:0;acknowledgementOnly:true;successClaimed:false;responseWindowSeconds:number;textFallbackPreserved:true;loadFailureBlocksGameplay:false;}
export function bossResponseAckIdentityIcon(id:BossResponseAckIdentityId):BossResponseAckIdentityIcon{const[c,r]=CELL[id],m=META[id];return{id,label:m.label,accent:m.accent,sx:c*96,sy:r*96,sw:96,sh:96,animated:false,motionAmplitude:0,acknowledgementOnly:true,successClaimed:false,responseWindowSeconds:BOSS_RESPONSE_ACK_SECONDS,textFallbackPreserved:true,loadFailureBlocksGameplay:false};}
export function auditBossResponseAckIdentityAtlas(){const cells=new Set<string>(),outOfBounds:BossResponseAckIdentityId[]=[];for(const id of BOSS_RESPONSE_ACK_IDENTITY_IDS){const[c,r]=CELL[id];cells.add(`${c}:${r}`);if(c<0||r<0||c>=3||r>=2)outOfBounds.push(id);}const coverage=BOSS_RESPONSE_ACK_IDENTITY_IDS.length/6;return{itemCount:BOSS_RESPONSE_ACK_IDENTITY_IDS.length,coverage,uniqueCellCount:cells.size,outOfBounds,passed:coverage===1&&cells.size===6&&outOfBounds.length===0};}
