import type { EnemyType } from './enemies.js';

export type EnemyCombatVfxType = Exclude<EnemyType, 'boss'>;
export type EnemyCombatVfxKind = 'hit' | 'death';

export const ENEMY_COMBAT_VFX_ATLAS = {
  src: './assets/enemies/enemy-combat-vfx.png',
  columns: 6,
  rows: 4,
  cellSize: 128,
  width: 768,
  height: 512,
} as const;

export const ENEMY_COMBAT_VFX_TYPES: readonly EnemyCombatVfxType[] = [
  'grunt', 'hound', 'brute', 'archer', 'bomber', 'shaman',
  'shieldbearer', 'assassin', 'siegeGolem', 'nullifier', 'golden', 'elite',
] as const;

const INDEX = new Map<EnemyCombatVfxType, number>(ENEMY_COMBAT_VFX_TYPES.map((type, index) => [type, index]));

export interface EnemyCombatVfxSprite {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  animated: false;
  motionAmplitude: 0;
  presentationOnly: true;
  loadFailureBlocksGameplay: false;
}

export function enemyCombatVfxSprite(type: EnemyCombatVfxType, kind: EnemyCombatVfxKind): EnemyCombatVfxSprite {
  const index = INDEX.get(type);
  if (index === undefined) throw new Error(`Unknown enemy VFX type: ${type}`);
  const column = index % 6;
  const baseRow = Math.floor(index / 6);
  const row = kind === 'hit' ? baseRow : baseRow + 2;
  return {
    sx: column * ENEMY_COMBAT_VFX_ATLAS.cellSize,
    sy: row * ENEMY_COMBAT_VFX_ATLAS.cellSize,
    sw: ENEMY_COMBAT_VFX_ATLAS.cellSize,
    sh: ENEMY_COMBAT_VFX_ATLAS.cellSize,
    animated: false,
    motionAmplitude: 0,
    presentationOnly: true,
    loadFailureBlocksGameplay: false,
  };
}

export function isEnemyCombatVfxType(type: EnemyType): type is EnemyCombatVfxType { return type !== 'boss'; }

export function auditEnemyCombatVfxAtlas() {
  const cells = new Set<string>();
  const outOfBounds: string[] = [];
  for (const type of ENEMY_COMBAT_VFX_TYPES) {
    for (const kind of ['hit', 'death'] as const) {
      const sprite = enemyCombatVfxSprite(type, kind);
      cells.add(`${sprite.sx}:${sprite.sy}`);
      if (sprite.sx < 0 || sprite.sy < 0 || sprite.sx + sprite.sw > ENEMY_COMBAT_VFX_ATLAS.width || sprite.sy + sprite.sh > ENEMY_COMBAT_VFX_ATLAS.height) outOfBounds.push(`${type}:${kind}`);
    }
  }
  const itemCount = ENEMY_COMBAT_VFX_TYPES.length * 2;
  return {
    enemyTypeCount: ENEMY_COMBAT_VFX_TYPES.length,
    itemCount,
    coverage: itemCount === 0 ? 1 : cells.size / itemCount,
    uniqueCellCount: cells.size,
    outOfBounds,
    assetSrc: ENEMY_COMBAT_VFX_ATLAS.src,
    passed: ENEMY_COMBAT_VFX_TYPES.length === 12 && cells.size === itemCount && outOfBounds.length === 0,
  };
}
