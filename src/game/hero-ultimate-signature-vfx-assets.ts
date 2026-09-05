import type { HeroId } from './hero-profiles.js';

export const HERO_ULTIMATE_SIGNATURE_VFX_ATLAS = {
  src: './assets/heroes/hero-ultimate-signature-vfx.png',
  columns: 4,
  rows: 2,
  cellSize: 128,
  width: 512,
  height: 256,
} as const;

export const HERO_ULTIMATE_SIGNATURE_VFX_HEROES: readonly HeroId[] = ['arkan','seria','kain','edric'] as const;
export type HeroUltimateSignatureVfxChannel = 'meteorStorm'|'blackHole';
export interface HeroUltimateSignatureVfxRect { sx:number; sy:number; sw:number; sh:number; }

export function heroUltimateSignatureVfxSprite(heroId:HeroId,channel:HeroUltimateSignatureVfxChannel):HeroUltimateSignatureVfxRect{
  const column=HERO_ULTIMATE_SIGNATURE_VFX_HEROES.indexOf(heroId),row=channel==='meteorStorm'?0:1,size=HERO_ULTIMATE_SIGNATURE_VFX_ATLAS.cellSize;
  return {sx:column*size,sy:row*size,sw:size,sh:size};
}

export function auditHeroUltimateSignatureVfxAtlas(){
  const cells=new Set<string>(),outOfBounds:string[]=[];
  for(const heroId of HERO_ULTIMATE_SIGNATURE_VFX_HEROES)for(const channel of ['meteorStorm','blackHole'] as const){
    const r=heroUltimateSignatureVfxSprite(heroId,channel);cells.add(`${r.sx}:${r.sy}`);
    if(r.sx<0||r.sy<0||r.sx+r.sw>HERO_ULTIMATE_SIGNATURE_VFX_ATLAS.width||r.sy+r.sh>HERO_ULTIMATE_SIGNATURE_VFX_ATLAS.height)outOfBounds.push(`${heroId}:${channel}`);
  }
  return {heroCount:HERO_ULTIMATE_SIGNATURE_VFX_HEROES.length,channelCount:2,itemCount:8,coverage:cells.size/8,uniqueCellCount:cells.size,outOfBounds,passed:cells.size===8&&outOfBounds.length===0};
}
