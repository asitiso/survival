import type { MapId } from './map-layouts.js';
import type { SpellId } from './spells.js';

export const BATTLEFIELD_PROP_VFX_ATLAS = {
  src: './assets/arena/battlefield-props-vfx.png',
  columns: 3,
  rows: 4,
  cellSize: 128,
  width: 384,
  height: 512,
} as const;

export type BattlefieldPropKind = 'wall' | 'crystal';
export type BattlefieldPropVfxId = SpellId;

const WALL_CELL_BY_MAP: Readonly<Record<MapId, readonly [column: number, row: number]>> = {
  ruinedGate: [0, 0],
  frozenFen: [1, 0],
  crystalQuarry: [2, 0],
};

const CRYSTAL_CELL_BY_MAP: Readonly<Record<MapId, readonly [column: number, row: number]>> = {
  ruinedGate: [0, 1],
  frozenFen: [1, 1],
  crystalQuarry: [2, 1],
};

const VFX_CELL_BY_ID: Readonly<Record<BattlefieldPropVfxId, readonly [column: number, row: number]>> = {
  fireBolt: [0, 2],
  chainLightning: [1, 2],
  frostNova: [2, 2],
  flameField: [0, 3],
  meteorStorm: [1, 3],
  blackHole: [2, 3],
};

export interface BattlefieldPropVfxRect { sx: number; sy: number; sw: number; sh: number; }

function cellRect(column: number, row: number): BattlefieldPropVfxRect {
  return {
    sx: column * BATTLEFIELD_PROP_VFX_ATLAS.cellSize,
    sy: row * BATTLEFIELD_PROP_VFX_ATLAS.cellSize,
    sw: BATTLEFIELD_PROP_VFX_ATLAS.cellSize,
    sh: BATTLEFIELD_PROP_VFX_ATLAS.cellSize,
  };
}

export function battlefieldPropSprite(mapId: MapId, kind: BattlefieldPropKind): BattlefieldPropVfxRect {
  const [column, row] = kind === 'wall' ? WALL_CELL_BY_MAP[mapId] : CRYSTAL_CELL_BY_MAP[mapId];
  return cellRect(column, row);
}

export function battlefieldSpellVfxSprite(id: BattlefieldPropVfxId): BattlefieldPropVfxRect {
  const [column, row] = VFX_CELL_BY_ID[id];
  return cellRect(column, row);
}

export function auditBattlefieldPropVfxAtlas() {
  const cells = new Set<string>();
  const outOfBounds: string[] = [];
  for (const mapId of Object.keys(WALL_CELL_BY_MAP) as MapId[]) {
    for (const kind of ['wall', 'crystal'] as const) {
      const sprite = battlefieldPropSprite(mapId, kind);
      cells.add(`${sprite.sx}:${sprite.sy}`);
      if (sprite.sx < 0 || sprite.sy < 0 || sprite.sx + sprite.sw > BATTLEFIELD_PROP_VFX_ATLAS.width || sprite.sy + sprite.sh > BATTLEFIELD_PROP_VFX_ATLAS.height) outOfBounds.push(`${kind}:${mapId}`);
    }
  }
  for (const id of Object.keys(VFX_CELL_BY_ID) as BattlefieldPropVfxId[]) {
    const sprite = battlefieldSpellVfxSprite(id);
    cells.add(`${sprite.sx}:${sprite.sy}`);
    if (sprite.sx < 0 || sprite.sy < 0 || sprite.sx + sprite.sw > BATTLEFIELD_PROP_VFX_ATLAS.width || sprite.sy + sprite.sh > BATTLEFIELD_PROP_VFX_ATLAS.height) outOfBounds.push(`vfx:${id}`);
  }
  const itemCount = 12;
  return {
    itemCount,
    coverage: cells.size / itemCount,
    uniqueCellCount: cells.size,
    outOfBounds,
    assetSrc: BATTLEFIELD_PROP_VFX_ATLAS.src,
    passed: cells.size === itemCount && outOfBounds.length === 0,
  };
}
