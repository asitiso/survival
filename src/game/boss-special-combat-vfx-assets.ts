import type { BossArchetype } from './boss-patterns.js';
import type { BossArenaHazardKind } from './boss-arena.js';

export type BossSpecialCombatVfxKind = 'projectile' | 'hazard';

export const BOSS_SPECIAL_COMBAT_VFX_ATLAS = {
  src: './assets/bosses/boss-special-combat-vfx.png',
  columns: 3,
  rows: 4,
  cellSize: 128,
  width: 384,
  height: 512,
} as const;

export const BOSS_SPECIAL_COMBAT_VFX_ARCHETYPES: readonly BossArchetype[] = [
  'inferno', 'summoner', 'juggernaut', 'abyssWitch', 'twinMaw', 'timeEater',
] as const;

const INDEX = new Map<BossArchetype, number>(BOSS_SPECIAL_COMBAT_VFX_ARCHETYPES.map((id, index) => [id, index]));
const HAZARD_ARCHETYPE: Readonly<Record<BossArenaHazardKind, BossArchetype>> = {
  firePool: 'inferno',
  summonSigil: 'summoner',
  shockLane: 'juggernaut',
  cursePool: 'abyssWitch',
  twinCross: 'twinMaw',
  timeZone: 'timeEater',
};

export interface BossSpecialCombatVfxSprite {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  presentationOnly: true;
  loadFailureBlocksGameplay: false;
}

function sprite(archetype: BossArchetype, kind: BossSpecialCombatVfxKind): BossSpecialCombatVfxSprite {
  const index = INDEX.get(archetype);
  if (index === undefined) throw new Error(`Unknown boss VFX archetype: ${archetype}`);
  const column = index % 3;
  const baseRow = Math.floor(index / 3);
  const row = kind === 'projectile' ? baseRow : baseRow + 2;
  return {
    sx: column * BOSS_SPECIAL_COMBAT_VFX_ATLAS.cellSize,
    sy: row * BOSS_SPECIAL_COMBAT_VFX_ATLAS.cellSize,
    sw: BOSS_SPECIAL_COMBAT_VFX_ATLAS.cellSize,
    sh: BOSS_SPECIAL_COMBAT_VFX_ATLAS.cellSize,
    presentationOnly: true,
    loadFailureBlocksGameplay: false,
  };
}

export function bossSpecialProjectileVfxSprite(archetype: BossArchetype): BossSpecialCombatVfxSprite { return sprite(archetype, 'projectile'); }
export function bossSpecialHazardVfxSprite(kind: BossArenaHazardKind): BossSpecialCombatVfxSprite { return sprite(HAZARD_ARCHETYPE[kind], 'hazard'); }

export function auditBossSpecialCombatVfxAtlas() {
  const cells = new Set<string>();
  const outOfBounds: string[] = [];
  for (const archetype of BOSS_SPECIAL_COMBAT_VFX_ARCHETYPES) {
    for (const kind of ['projectile', 'hazard'] as const) {
      const item = sprite(archetype, kind);
      cells.add(`${item.sx}:${item.sy}`);
      if (item.sx < 0 || item.sy < 0 || item.sx + item.sw > BOSS_SPECIAL_COMBAT_VFX_ATLAS.width || item.sy + item.sh > BOSS_SPECIAL_COMBAT_VFX_ATLAS.height) outOfBounds.push(`${archetype}:${kind}`);
    }
  }
  const itemCount = BOSS_SPECIAL_COMBAT_VFX_ARCHETYPES.length * 2;
  return {
    archetypeCount: BOSS_SPECIAL_COMBAT_VFX_ARCHETYPES.length,
    itemCount,
    coverage: itemCount === 0 ? 1 : cells.size / itemCount,
    uniqueCellCount: cells.size,
    outOfBounds,
    assetSrc: BOSS_SPECIAL_COMBAT_VFX_ATLAS.src,
    passed: BOSS_SPECIAL_COMBAT_VFX_ARCHETYPES.length === 6 && cells.size === itemCount && outOfBounds.length === 0,
  };
}
