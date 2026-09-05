import type { HeroId } from './hero-profiles.js';

export const HERO_PORTRAIT_ATLAS = {
  src: './assets/ui/hero-portraits.png',
  columns: 2,
  rows: 2,
  cellSize: 256,
  width: 512,
  height: 512,
} as const;

const CELL_BY_HERO: Readonly<Record<HeroId, readonly [column: number, row: number]>> = {
  arkan: [0, 0],
  seria: [1, 0],
  kain: [0, 1],
  edric: [1, 1],
};

export interface HeroPortraitSprite {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export interface HeroPortraitPresentation {
  visible: boolean;
  animated: false;
  motionAmplitude: 0;
  backgroundX: '0%' | '100%';
  backgroundY: '0%' | '100%';
  fallbackOrbVisible: true;
}

export function heroPortraitSprite(heroId: HeroId): HeroPortraitSprite {
  const [column, row] = CELL_BY_HERO[heroId];
  return {
    sx: column * HERO_PORTRAIT_ATLAS.cellSize,
    sy: row * HERO_PORTRAIT_ATLAS.cellSize,
    sw: HERO_PORTRAIT_ATLAS.cellSize,
    sh: HERO_PORTRAIT_ATLAS.cellSize,
  };
}

export function heroPortraitPresentation(heroId: HeroId, atlasReady: boolean): HeroPortraitPresentation {
  const [column, row] = CELL_BY_HERO[heroId];
  return {
    visible: atlasReady,
    animated: false,
    motionAmplitude: 0,
    backgroundX: column === 0 ? '0%' : '100%',
    backgroundY: row === 0 ? '0%' : '100%',
    fallbackOrbVisible: true,
  };
}

export interface HeroPortraitAtlasAudit {
  heroCount: number;
  coverage: number;
  uniqueCellCount: number;
  missing: HeroId[];
  outOfBounds: HeroId[];
}

export function auditHeroPortraitAtlas(heroIds: readonly HeroId[]): HeroPortraitAtlasAudit {
  const missing: HeroId[] = [];
  const outOfBounds: HeroId[] = [];
  const cells = new Set<string>();
  for (const heroId of heroIds) {
    const cell = CELL_BY_HERO[heroId];
    if (!cell) {
      missing.push(heroId);
      continue;
    }
    const [column, row] = cell;
    cells.add(`${column}:${row}`);
    if (column < 0 || row < 0 || column >= HERO_PORTRAIT_ATLAS.columns || row >= HERO_PORTRAIT_ATLAS.rows) outOfBounds.push(heroId);
  }
  return {
    heroCount: heroIds.length,
    coverage: heroIds.length === 0 ? 1 : (heroIds.length - missing.length) / heroIds.length,
    uniqueCellCount: cells.size,
    missing,
    outOfBounds,
  };
}
