import type { HeroId } from './hero-profiles.js';

export type HeroResponseVfxKind = 'hit' | 'perfectEvade' | 'flowBoost';
export const HERO_RESPONSE_VFX_ATLAS = { src:'./assets/heroes/hero-response-vfx.png', columns:4, rows:3, cellSize:128, width:512, height:384 } as const;
export const HERO_RESPONSE_VFX_HEROES: readonly HeroId[] = ['arkan','seria','kain','edric'] as const;
const COL:Readonly<Record<HeroId,number>>={arkan:0,seria:1,kain:2,edric:3};
const ROW:Readonly<Record<HeroResponseVfxKind,number>>={hit:0,perfectEvade:1,flowBoost:2};
export interface HeroResponseVfxSprite { sx:number;sy:number;sw:128;sh:128;presentationOnly:true;loadFailureBlocksGameplay:false; }
export function heroResponseVfxSprite(heroId:HeroId,kind:HeroResponseVfxKind):HeroResponseVfxSprite{return{sx:COL[heroId]*128,sy:ROW[kind]*128,sw:128,sh:128,presentationOnly:true,loadFailureBlocksGameplay:false};}
export function auditHeroResponseVfxAtlas(){const cells=new Set<string>(),outOfBounds:string[]=[];for(const hero of HERO_RESPONSE_VFX_HEROES)for(const kind of ['hit','perfectEvade','flowBoost'] as const){const r=heroResponseVfxSprite(hero,kind);cells.add(`${r.sx}:${r.sy}`);if(r.sx<0||r.sy<0||r.sx+r.sw>512||r.sy+r.sh>384)outOfBounds.push(`${hero}:${kind}`);}const itemCount=12;return{heroCount:4,itemCount,uniqueCellCount:cells.size,coverage:cells.size/itemCount,outOfBounds,passed:cells.size===itemCount&&outOfBounds.length===0};}
