import type { Vec2 } from '../core/math.js';
import { EnemyManager, type Enemy } from './enemies.js';
import type { EliteAffixId } from './elite-affixes.js';
import type { EliteAffixCueEventKind } from './elite-affix-cue-arbitration.js';
import { eliteAffixCueLanePresentation } from './elite-affix-cue-lanes.js';
import {
  captureEliteAffixResponseLaneSnapshot,
  eliteAffixResponseCueOrigin,
  retainEliteAffixResponseLaneSnapshot,
  type EliteAffixResponseLaneSnapshot,
} from './elite-affix-response-lane.js';

interface RuntimeResponseCue {
  pos: Vec2;
  enemyId: number;
  affixId: EliteAffixId;
  targetPos?: Vec2;
  targetKind?: 'hero' | 'core';
  ttl: number;
  maxTtl: number;
  responseBasePos?: Vec2;
  importantEvent?: boolean;
  laneSnapshot?: EliteAffixResponseLaneSnapshot;
}

interface RuntimeEnemyManagerState {
  enemies: Enemy[];
  eliteAffixResponseVfx: RuntimeResponseCue[];
}

type QueueResponseVfx = (
  enemy: Enemy,
  affixId: EliteAffixId,
  eventKind?: EliteAffixCueEventKind,
  targetPos?: Vec2,
) => void;

type RuntimePrototype = {
  queueEliteAffixResponseVfx: QueueResponseVfx;
  renderEnemies: EnemyManager['renderEnemies'];
};

let installed = false;

function finiteStress(value: unknown): number {
  return Math.max(0, Math.min(1, typeof value === 'number' && Number.isFinite(value) ? value : 0));
}

function laneForEnemy(
  enemy: Enemy | undefined,
  battlefieldStress: number,
  higherPriorityCue: boolean,
  reducedMotion: boolean,
  reducedFlash: boolean,
) {
  return eliteAffixCueLanePresentation(enemy?.eliteAffixCueLane, {
    enemyRadius: enemy?.radius ?? 1,
    battlefieldStress,
    higherPriorityCue,
    reducedMotion,
    reducedFlash,
  });
}

function importantFromSource(enemy: Enemy | undefined, cue: RuntimeResponseCue): boolean {
  const ownership = enemy?.eliteAffixCueOwnership;
  return Boolean(
    ownership?.owner === cue.affixId &&
    ownership.eventPriority === 3 &&
    (ownership.holdTtl > 0 || ownership.releaseTtl > 0),
  );
}

export function installEliteAffixResponseLaneRuntime(): void {
  if (installed) return;
  installed = true;

  const prototype = EnemyManager.prototype as unknown as RuntimePrototype;
  const originalQueue = prototype.queueEliteAffixResponseVfx;
  const originalRender = prototype.renderEnemies;

  prototype.queueEliteAffixResponseVfx = function queueEliteAffixResponseVfxWithSnapshot(
    this: EnemyManager,
    enemy: Enemy,
    affixId: EliteAffixId,
    eventKind: EliteAffixCueEventKind = 'response',
    targetPos?: Vec2,
  ): void {
    originalQueue.call(this, enemy, affixId, eventKind, targetPos);
    const state = this as unknown as RuntimeEnemyManagerState;
    const cue = [...state.eliteAffixResponseVfx]
      .reverse()
      .find((candidate) => candidate.enemyId === enemy.id && candidate.affixId === affixId && candidate.ttl > 0);
    if (!cue) return;
    cue.responseBasePos ??= { ...cue.pos };
    cue.importantEvent = Boolean(cue.importantEvent || eventKind !== 'response');
  };

  prototype.renderEnemies = function renderEnemiesWithFrozenResponseLane(
    this: EnemyManager,
    ...args: Parameters<EnemyManager['renderEnemies']>
  ): void {
    const state = this as unknown as RuntimeEnemyManagerState;
    const reducedFlash = Boolean(args.at(-3));
    const reducedMotion = Boolean(args.at(-2));
    const hazardPressure = finiteStress(args.at(-1));
    const activeAffixEliteCount = state.enemies.filter(
      (enemy) => enemy.alive && enemy.type === 'elite' && Boolean(enemy.eliteAffixes?.length),
    ).length;
    const battlefieldStress = Math.max(hazardPressure, Math.min(1, Math.max(0, activeAffixEliteCount - 3) / 5));
    const higherPriorityCue = hazardPressure >= 0.72;
    const restore: Array<{ cue: RuntimeResponseCue; pos: Vec2 }> = [];

    for (const cue of state.eliteAffixResponseVfx) {
      const sourceEnemy = state.enemies.find((candidate) => candidate.id === cue.enemyId && candidate.alive);
      cue.responseBasePos ??= { ...cue.pos };
      const liveLane = laneForEnemy(sourceEnemy, battlefieldStress, higherPriorityCue, reducedMotion, reducedFlash);
      const importantEvent = Boolean(cue.importantEvent || importantFromSource(sourceEnemy, cue));
      const candidate = captureEliteAffixResponseLaneSnapshot(sourceEnemy ? liveLane : undefined, importantEvent);
      cue.laneSnapshot = retainEliteAffixResponseLaneSnapshot(cue.laneSnapshot, candidate) ?? candidate;
      const frozenOrigin = eliteAffixResponseCueOrigin(cue.responseBasePos, cue.laneSnapshot);
      restore.push({ cue, pos: cue.pos });
      cue.pos = {
        x: frozenOrigin.x - liveLane.offsetX,
        y: frozenOrigin.y - liveLane.offsetY,
      };
    }

    try {
      originalRender.apply(this, args);
    } finally {
      for (const entry of restore) entry.cue.pos = entry.pos;
    }
  };
}

installEliteAffixResponseLaneRuntime();
