export type BattlefieldGameplayPropKind =
  | 'runeStone'
  | 'arcaneCrystal'
  | 'woodBarricade'
  | 'blueBrazier'
  | 'supplyCrate'
  | 'bones';

export const BATTLEFIELD_GAMEPLAY_ART = {
  backdrop: {
    src: './assets/arena/battlefield-gameplay-backdrop.svg',
    width: 1600,
    height: 900,
  },
  props: {
    src: './assets/arena/battlefield-gameplay-props.svg',
    columns: 3,
    rows: 2,
    cellSize: 192,
    width: 576,
    height: 384,
  },
} as const;

export interface BattlefieldDecorationAnchor {
  kind: BattlefieldGameplayPropKind;
  x: number;
  y: number;
  size: number;
  mirror?: boolean;
}

export const BATTLEFIELD_DECORATION_ANCHORS: readonly BattlefieldDecorationAnchor[] = [
  { kind: 'runeStone', x: 0.095, y: 0.15, size: 118 },
  { kind: 'arcaneCrystal', x: 0.895, y: 0.155, size: 126 },
  { kind: 'woodBarricade', x: 0.075, y: 0.77, size: 128 },
  { kind: 'blueBrazier', x: 0.91, y: 0.77, size: 112 },
  { kind: 'supplyCrate', x: 0.16, y: 0.88, size: 104 },
  { kind: 'bones', x: 0.84, y: 0.89, size: 108, mirror: true },
] as const;

const PROP_CELL: Readonly<Record<BattlefieldGameplayPropKind, readonly [number, number]>> = {
  runeStone: [0, 0],
  arcaneCrystal: [1, 0],
  woodBarricade: [2, 0],
  blueBrazier: [0, 1],
  supplyCrate: [1, 1],
  bones: [2, 1],
};

export interface BattlefieldGameplayPropSprite {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export function battlefieldGameplayPropSprite(kind: BattlefieldGameplayPropKind): BattlefieldGameplayPropSprite {
  const [column, row] = PROP_CELL[kind];
  const cell = BATTLEFIELD_GAMEPLAY_ART.props.cellSize;
  return { sx: column * cell, sy: row * cell, sw: cell, sh: cell };
}

export interface BattlefieldGameplayArtProfile {
  backdropAlpha: number;
  propAlpha: number;
  backdropSaturation: number;
  vignetteAlpha: number;
}

export function battlefieldGameplayArtProfile(reducedFlash: boolean, criticalThreat: boolean): BattlefieldGameplayArtProfile {
  const backdropAlpha = criticalThreat ? 0.20 : 0.34;
  const propAlpha = criticalThreat ? 0.48 : 0.72;
  return {
    backdropAlpha: reducedFlash ? Math.min(backdropAlpha, criticalThreat ? 0.18 : 0.30) : backdropAlpha,
    propAlpha: reducedFlash ? Math.min(propAlpha, criticalThreat ? 0.44 : 0.66) : propAlpha,
    backdropSaturation: criticalThreat ? 0.76 : 0.9,
    vignetteAlpha: criticalThreat ? 0.16 : 0.10,
  };
}
