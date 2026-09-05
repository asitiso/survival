import type { HeroId } from './hero-profiles.js';

export const HERO_BATTLE_SPRITE_ATLAS = {
  src: './assets/heroes/hero-battle-sprites.png',
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

const SIZE_SCALE: Readonly<Record<HeroId, number>> = {
  arkan: 4.95,
  seria: 4.9,
  kain: 4.9,
  edric: 5.1,
};

export interface HeroBattleSpriteRect { sx: number; sy: number; sw: number; sh: number; }
export interface HeroBattleSpritePresentation {
  visible: boolean;
  animated: false;
  motionAmplitude: 0;
  drawSize: number;
  fallbackBodyVisible: true;
}

export function heroBattleSpriteRect(heroId: HeroId): HeroBattleSpriteRect {
  const [column, row] = CELL_BY_HERO[heroId];
  return {
    sx: column * HERO_BATTLE_SPRITE_ATLAS.cellSize,
    sy: row * HERO_BATTLE_SPRITE_ATLAS.cellSize,
    sw: HERO_BATTLE_SPRITE_ATLAS.cellSize,
    sh: HERO_BATTLE_SPRITE_ATLAS.cellSize,
  };
}

export function heroBattleSpritePresentation(heroId: HeroId, radius: number, atlasReady: boolean): HeroBattleSpritePresentation {
  const safeRadius = Math.max(18, Math.min(28, Number.isFinite(radius) ? radius : 23));
  return {
    visible: atlasReady,
    animated: false,
    motionAmplitude: 0,
    drawSize: Math.round(safeRadius * SIZE_SCALE[heroId]),
    fallbackBodyVisible: true,
  };
}

export interface HeroBattleSpriteAtlasAudit {
  heroCount: number;
  coverage: number;
  uniqueCellCount: number;
  missing: HeroId[];
  outOfBounds: HeroId[];
}

export function auditHeroBattleSpriteAtlas(heroIds: readonly HeroId[]): HeroBattleSpriteAtlasAudit {
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
    if (column < 0 || row < 0 || column >= HERO_BATTLE_SPRITE_ATLAS.columns || row >= HERO_BATTLE_SPRITE_ATLAS.rows) outOfBounds.push(heroId);
  }
  return {
    heroCount: heroIds.length,
    coverage: heroIds.length === 0 ? 1 : (heroIds.length - missing.length) / heroIds.length,
    uniqueCellCount: cells.size,
    missing,
    outOfBounds,
  };
}
