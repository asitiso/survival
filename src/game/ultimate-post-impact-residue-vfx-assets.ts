import type { HeroId } from './hero-profiles.js';
export const ULTIMATE_POST_IMPACT_RESIDUE_VFX_HEROES=['arkan','seria','kain','edric'] as const satisfies readonly HeroId[];
export const ULTIMATE_POST_IMPACT_RESIDUE_VFX_KINDS=['meteorStorm','blackHole'] as const;
export type UltimatePostImpactResidueVfxKind=typeof ULTIMATE_POST_IMPACT_RESIDUE_VFX_KINDS[number];
export const ULTIMATE_POST_IMPACT_RESIDUE_VFX_ATLAS={src:'./assets/heroes/ultimate-post-impact-residue-vfx.png',columns:4,rows:2,cellSize:128,width:512,height:256} as const;
const COL:Readonly<Record<HeroId,number>>={arkan:0,seria:1,kain:2,edric:3};
const ROW:Readonly<Record<UltimatePostImpactResidueVfxKind,number>>={meteorStorm:0,blackHole:1};
export function ultimatePostImpactResidueVfxSprite(heroId:HeroId,kind:UltimatePostImpactResidueVfxKind){return{sx:COL[heroId]*128,sy:ROW[kind]*128,sw:128 as const,sh:128 as const,presentationOnly:true as const,loadFailureBlocksGameplay:false as const};}
export function auditUltimatePostImpactResidueVfxAtlas(){const cells=new Set<string>(),outOfBounds:string[]=[];for(const heroId of ULTIMATE_POST_IMPACT_RESIDUE_VFX_HEROES)for(const kind of ULTIMATE_POST_IMPACT_RESIDUE_VFX_KINDS){const r=ultimatePostImpactResidueVfxSprite(heroId,kind);cells.add(`${r.sx}:${r.sy}`);if(r.sx<0||r.sy<0||r.sx+r.sw>ULTIMATE_POST_IMPACT_RESIDUE_VFX_ATLAS.width||r.sy+r.sh>ULTIMATE_POST_IMPACT_RESIDUE_VFX_ATLAS.height)outOfBounds.push(`${heroId}:${kind}`);}return{heroCount:ULTIMATE_POST_IMPACT_RESIDUE_VFX_HEROES.length,kindCount:ULTIMATE_POST_IMPACT_RESIDUE_VFX_KINDS.length,itemCount:ULTIMATE_POST_IMPACT_RESIDUE_VFX_HEROES.length*ULTIMATE_POST_IMPACT_RESIDUE_VFX_KINDS.length,uniqueCellCount:cells.size,outOfBounds,passed:cells.size===8&&outOfBounds.length===0};}
