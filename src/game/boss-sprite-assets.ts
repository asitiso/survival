import type { BossArchetype } from './boss-patterns.js';

export const BOSS_SPRITE_ARCHETYPES: readonly BossArchetype[] = [
  'inferno', 'summoner', 'juggernaut',
  'abyssWitch', 'twinMaw', 'timeEater',
] as const;

export const BOSS_SPRITE_ATLAS = {
  src: './assets/bosses/boss-sprites.png',
  columns: 3,
  rows: 2,
  cellSize: 256,
  width: 768,
  height: 512,
} as const;

const CELL_BY_ARCHETYPE: Readonly<Record<BossArchetype, readonly [column: number, row: number]>> = {
  inferno: [0, 0],
  summoner: [1, 0],
  juggernaut: [2, 0],
  abyssWitch: [0, 1],
  twinMaw: [1, 1],
  timeEater: [2, 1],
};

const SIZE_SCALE: Readonly<Record<BossArchetype, number>> = {
  inferno: 2.44,
  summoner: 2.34,
  juggernaut: 2.5,
  abyssWitch: 2.38,
  twinMaw: 2.42,
  timeEater: 2.38,
};

export interface BossSpriteRect { sx: number; sy: number; sw: number; sh: number; }
export interface BossSpritePresentation {
  visible: boolean;
  animated: false;
  motionAmplitude: 0;
  drawSize: number;
  fallbackBodyVisible: true;
}

export function bossSpriteRect(archetype: BossArchetype): BossSpriteRect {
  const [column, row] = CELL_BY_ARCHETYPE[archetype];
  return {
    sx: column * BOSS_SPRITE_ATLAS.cellSize,
    sy: row * BOSS_SPRITE_ATLAS.cellSize,
    sw: BOSS_SPRITE_ATLAS.cellSize,
    sh: BOSS_SPRITE_ATLAS.cellSize,
  };
}

export function bossSpritePresentation(archetype: BossArchetype, radius: number, atlasReady: boolean): BossSpritePresentation {
  const safeRadius = Math.max(44, Math.min(72, Number.isFinite(radius) ? radius : 58));
  return {
    visible: atlasReady,
    animated: false,
    motionAmplitude: 0,
    drawSize: Math.round(safeRadius * SIZE_SCALE[archetype]),
    fallbackBodyVisible: true,
  };
}

export interface BossSpriteAtlasAudit {
  archetypeCount: number;
  coverage: number;
  uniqueCellCount: number;
  missing: BossArchetype[];
  outOfBounds: BossArchetype[];
}

export function auditBossSpriteAtlas(archetypes: readonly BossArchetype[]): BossSpriteAtlasAudit {
  const missing: BossArchetype[] = [];
  const outOfBounds: BossArchetype[] = [];
  const cells = new Set<string>();
  for (const archetype of archetypes) {
    const cell = CELL_BY_ARCHETYPE[archetype];
    if (!cell) { missing.push(archetype); continue; }
    const [column, row] = cell;
    cells.add(`${column}:${row}`);
    if (column < 0 || row < 0 || column >= BOSS_SPRITE_ATLAS.columns || row >= BOSS_SPRITE_ATLAS.rows) outOfBounds.push(archetype);
  }
  return {
    archetypeCount: archetypes.length,
    coverage: archetypes.length === 0 ? 1 : (archetypes.length - missing.length) / archetypes.length,
    uniqueCellCount: cells.size,
    missing,
    outOfBounds,
  };
}
