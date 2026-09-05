import type { HeroId } from './hero-profiles.js';

export type HeroSpellSignatureVfxChannel = 'chainLightning' | 'frostNova' | 'flameField';

export const HERO_SPELL_SIGNATURE_VFX_ATLAS = {
  src: './assets/heroes/hero-spell-signature-vfx.png',
  columns: 4,
  rows: 3,
  cellSize: 128,
  width: 512,
  height: 384,
} as const;

export const HERO_SPELL_SIGNATURE_VFX_HEROES: readonly HeroId[] = ['arkan', 'seria', 'kain', 'edric'] as const;
export const HERO_SPELL_SIGNATURE_VFX_CHANNELS: readonly HeroSpellSignatureVfxChannel[] = ['chainLightning', 'frostNova', 'flameField'] as const;

const HERO_INDEX = new Map<HeroId, number>(HERO_SPELL_SIGNATURE_VFX_HEROES.map((id, index) => [id, index]));
const CHANNEL_INDEX = new Map<HeroSpellSignatureVfxChannel, number>(HERO_SPELL_SIGNATURE_VFX_CHANNELS.map((id, index) => [id, index]));

export interface HeroSpellSignatureVfxSprite {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  presentationOnly: true;
  loadFailureBlocksGameplay: false;
}

export function heroSpellSignatureVfxSprite(heroId: HeroId, channel: HeroSpellSignatureVfxChannel): HeroSpellSignatureVfxSprite {
  const column = HERO_INDEX.get(heroId);
  const row = CHANNEL_INDEX.get(channel);
  if (column === undefined || row === undefined) throw new Error(`Unknown hero spell VFX: ${heroId}:${channel}`);
  return {
    sx: column * HERO_SPELL_SIGNATURE_VFX_ATLAS.cellSize,
    sy: row * HERO_SPELL_SIGNATURE_VFX_ATLAS.cellSize,
    sw: HERO_SPELL_SIGNATURE_VFX_ATLAS.cellSize,
    sh: HERO_SPELL_SIGNATURE_VFX_ATLAS.cellSize,
    presentationOnly: true,
    loadFailureBlocksGameplay: false,
  };
}

export function auditHeroSpellSignatureVfxAtlas() {
  const cells = new Set<string>();
  const outOfBounds: string[] = [];
  for (const heroId of HERO_SPELL_SIGNATURE_VFX_HEROES) {
    for (const channel of HERO_SPELL_SIGNATURE_VFX_CHANNELS) {
      const sprite = heroSpellSignatureVfxSprite(heroId, channel);
      cells.add(`${sprite.sx}:${sprite.sy}`);
      if (sprite.sx < 0 || sprite.sy < 0 || sprite.sx + sprite.sw > HERO_SPELL_SIGNATURE_VFX_ATLAS.width || sprite.sy + sprite.sh > HERO_SPELL_SIGNATURE_VFX_ATLAS.height) outOfBounds.push(`${heroId}:${channel}`);
    }
  }
  const itemCount = HERO_SPELL_SIGNATURE_VFX_HEROES.length * HERO_SPELL_SIGNATURE_VFX_CHANNELS.length;
  return {
    heroCount: HERO_SPELL_SIGNATURE_VFX_HEROES.length,
    channelCount: HERO_SPELL_SIGNATURE_VFX_CHANNELS.length,
    itemCount,
    coverage: itemCount === 0 ? 1 : cells.size / itemCount,
    uniqueCellCount: cells.size,
    outOfBounds,
    assetSrc: HERO_SPELL_SIGNATURE_VFX_ATLAS.src,
    passed: cells.size === itemCount && outOfBounds.length === 0,
  };
}
