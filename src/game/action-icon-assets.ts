import type { ActionId } from './config.js';

export const ACTION_ICON_ATLAS = {
  src: './assets/ui/action-icons.png',
  columns: 3,
  rows: 3,
  cellSize: 128,
  width: 384,
  height: 384,
} as const;

const CELL_BY_ACTION: Readonly<Record<ActionId, readonly [column: number, row: number]>> = {
  spell1: [0, 0],
  ultimate1: [1, 0],
  spell2: [2, 0],
  spell4: [0, 1],
  auto: [1, 1],
  ultimate2: [2, 1],
  spell3: [0, 2],
  shop: [1, 2],
  potion: [2, 2],
};

export interface ActionIconSprite {
  sx: number;
  sy: number;
  sw: number;
  sh: number;
}

export interface ActionIconPresentation {
  visible: boolean;
  animated: false;
  motionAmplitude: 0;
  iconSize: number;
  iconOffsetY: number;
  labelOffsetY: number;
  secondaryOffsetY: number;
}

export function actionIconSprite(actionId: ActionId): ActionIconSprite {
  const [column, row] = CELL_BY_ACTION[actionId];
  return {
    sx: column * ACTION_ICON_ATLAS.cellSize,
    sy: row * ACTION_ICON_ATLAS.cellSize,
    sw: ACTION_ICON_ATLAS.cellSize,
    sh: ACTION_ICON_ATLAS.cellSize,
  };
}

export function actionIconPresentation(radius: number, atlasReady: boolean): ActionIconPresentation {
  if (!atlasReady) {
    return {
      visible: false,
      animated: false,
      motionAmplitude: 0,
      iconSize: 0,
      iconOffsetY: 0,
      labelOffsetY: -4,
      secondaryOffsetY: 17,
    };
  }
  const safeRadius = Math.max(32, Math.min(72, Number.isFinite(radius) ? radius : 48));
  return {
    visible: true,
    animated: false,
    motionAmplitude: 0,
    iconSize: Math.round(safeRadius * 0.78),
    iconOffsetY: -Math.round(safeRadius * 0.24),
    labelOffsetY: Math.round(safeRadius * 0.34),
    secondaryOffsetY: Math.round(safeRadius * 0.62),
  };
}

export interface ActionIconAtlasAudit {
  actionCount: number;
  coverage: number;
  uniqueCellCount: number;
  missing: ActionId[];
  outOfBounds: ActionId[];
}

export function auditActionIconAtlas(actionIds: readonly ActionId[]): ActionIconAtlasAudit {
  const missing: ActionId[] = [];
  const outOfBounds: ActionId[] = [];
  const cells = new Set<string>();
  for (const actionId of actionIds) {
    const cell = CELL_BY_ACTION[actionId];
    if (!cell) {
      missing.push(actionId);
      continue;
    }
    const [column, row] = cell;
    cells.add(`${column}:${row}`);
    if (column < 0 || row < 0 || column >= ACTION_ICON_ATLAS.columns || row >= ACTION_ICON_ATLAS.rows) outOfBounds.push(actionId);
  }
  return {
    actionCount: actionIds.length,
    coverage: actionIds.length === 0 ? 1 : (actionIds.length - missing.length) / actionIds.length,
    uniqueCellCount: cells.size,
    missing,
    outOfBounds,
  };
}
