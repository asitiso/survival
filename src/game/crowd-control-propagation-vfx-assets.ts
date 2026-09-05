import type { HeroId } from './hero-profiles.js';
export const CROWD_CONTROL_PROPAGATION_VFX_HEROES=['arkan','seria','kain','edric'] as const satisfies readonly HeroId[];
export const CROWD_CONTROL_PROPAGATION_VFX_KINDS=['chainLightning','frostNova','blackHole'] as const;
export type CrowdControlPropagationVfxKind=typeof CROWD_CONTROL_PROPAGATION_VFX_KINDS[number];
export const CROWD_CONTROL_PROPAGATION_VFX_ATLAS={src:'./assets/heroes/crowd-control-propagation-vfx.png',columns:4,rows:3,cellSize:128,width:512,height:384} as const;
const COL:Readonly<Record<HeroId,number>>={arkan:0,seria:1,kain:2,edric:3};
const ROW:Readonly<Record<CrowdControlPropagationVfxKind,number>>={chainLightning:0,frostNova:1,blackHole:2};
export function crowdControlPropagationVfxSprite(heroId:HeroId,kind:CrowdControlPropagationVfxKind){return{sx:COL[heroId]*128,sy:ROW[kind]*128,sw:128 as const,sh:128 as const,presentationOnly:true as const,loadFailureBlocksGameplay:false as const};}
export function auditCrowdControlPropagationVfxAtlas(){const cells=new Set<string>(),outOfBounds:string[]=[];for(const hero of CROWD_CONTROL_PROPAGATION_VFX_HEROES)for(const kind of CROWD_CONTROL_PROPAGATION_VFX_KINDS){const r=crowdControlPropagationVfxSprite(hero,kind);cells.add(`${r.sx}:${r.sy}`);if(r.sx<0||r.sy<0||r.sx+r.sw>512||r.sy+r.sh>384)outOfBounds.push(`${hero}:${kind}`);}return{heroCount:4,kindCount:3,itemCount:12,uniqueCellCount:cells.size,outOfBounds,passed:cells.size===12&&outOfBounds.length===0};}
