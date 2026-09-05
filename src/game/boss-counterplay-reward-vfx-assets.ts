import type { BossArchetype } from './boss-patterns.js';
export const BOSS_COUNTERPLAY_REWARD_VFX_ARCHETYPES=['inferno','summoner','juggernaut','abyssWitch','twinMaw','timeEater'] as const satisfies readonly BossArchetype[];
export const BOSS_COUNTERPLAY_REWARD_VFX_STATES=['burst','aura'] as const;
export type BossCounterplayRewardVfxState=typeof BOSS_COUNTERPLAY_REWARD_VFX_STATES[number];
export const BOSS_COUNTERPLAY_REWARD_VFX_ATLAS={src:'./assets/bosses/boss-counterplay-reward-vfx.png',columns:6,rows:2,cellSize:128,width:768,height:256} as const;
const COL:Readonly<Record<BossArchetype,number>>={inferno:0,summoner:1,juggernaut:2,abyssWitch:3,twinMaw:4,timeEater:5};
const ROW:Readonly<Record<BossCounterplayRewardVfxState,number>>={burst:0,aura:1};
export function bossCounterplayRewardVfxSprite(archetype:BossArchetype,state:BossCounterplayRewardVfxState){return{sx:COL[archetype]*128,sy:ROW[state]*128,sw:128 as const,sh:128 as const,presentationOnly:true as const,loadFailureBlocksGameplay:false as const};}
export function auditBossCounterplayRewardVfxAtlas(){const cells=new Set<string>(),outOfBounds:string[]=[];for(const archetype of BOSS_COUNTERPLAY_REWARD_VFX_ARCHETYPES)for(const state of BOSS_COUNTERPLAY_REWARD_VFX_STATES){const r=bossCounterplayRewardVfxSprite(archetype,state);cells.add(`${r.sx}:${r.sy}`);if(r.sx<0||r.sy<0||r.sx+r.sw>768||r.sy+r.sh>256)outOfBounds.push(`${archetype}:${state}`);}return{archetypeCount:6,stateCount:2,itemCount:12,uniqueCellCount:cells.size,outOfBounds,passed:cells.size===12&&outOfBounds.length===0};}
