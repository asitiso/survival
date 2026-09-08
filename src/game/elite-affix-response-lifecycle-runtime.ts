import type { Vec2 } from '../core/math.js';
import { EnemyManager, type Enemy } from './enemies.js';
import type { EliteAffixId } from './elite-affixes.js';
import type { EliteAffixCueEventKind } from './elite-affix-cue-arbitration.js';
import {
  eliteAffixResponseDuplicateResolution,
  eliteAffixResponseLifeRatio,
  refreshEliteAffixResponseLifetime,
  type EliteAffixResponseLaneSnapshot,
} from './elite-affix-response-lane.js';
import './elite-affix-response-lane-runtime.js';

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

function finiteTarget(target: Vec2 | undefined): target is Vec2 {
  return Boolean(target && Number.isFinite(target.x) && Number.isFinite(target.y));
}

export function installEliteAffixResponseLifecycleRuntime(): void {
  if (installed) return;
  installed = true;

  const prototype = EnemyManager.prototype as unknown as RuntimePrototype;
  const originalQueue = prototype.queueEliteAffixResponseVfx;
  const originalRender = prototype.renderEnemies;

  prototype.queueEliteAffixResponseVfx = function queueEliteAffixResponseVfxWithLifecycle(
    this: EnemyManager,
    enemy: Enemy,
    affixId: EliteAffixId,
    eventKind: EliteAffixCueEventKind = 'response',
    targetPos?: Vec2,
  ): void {
    originalQueue.call(this, enemy, affixId, eventKind, targetPos);
    const state = this as unknown as RuntimeEnemyManagerState;
    const matching = state.eliteAffixResponseVfx
      .map((cue, index) => ({ cue, index }))
      .filter(({ cue }) => cue.enemyId === enemy.id && cue.affixId === affixId);
    const resolution = eliteAffixResponseDuplicateResolution(
      matching.map(({ cue }) => ({ ttl: cue.ttl, importantEvent: cue.importantEvent })),
    );
    if (resolution.ownerIndex < 0) return;

    const ownerEntry = matching[resolution.ownerIndex];
    if (!ownerEntry) return;
    const cue = ownerEntry.cue;
    const dropIndexes = resolution.dropIndexes
      .map((index) => matching[index]?.index)
      .filter((index): index is number => index !== undefined);

    for (const duplicateIndex of resolution.dropIndexes) {
      const duplicate = matching[duplicateIndex]?.cue;
      if (!duplicate) continue;
      cue.importantEvent = Boolean(cue.importantEvent || duplicate.importantEvent);
      if (!cue.laneSnapshot && duplicate.laneSnapshot) cue.laneSnapshot = { ...duplicate.laneSnapshot };
      if (!cue.targetKind && duplicate.targetKind) cue.targetKind = duplicate.targetKind;
      if (!finiteTarget(cue.targetPos) && finiteTarget(duplicate.targetPos)) cue.targetPos = { ...duplicate.targetPos };
    }

    if (dropIndexes.length > 0) {
      const dropSet = new Set(dropIndexes);
      state.eliteAffixResponseVfx = state.eliteAffixResponseVfx.filter((_, index) => !dropSet.has(index));
    }

    cue.importantEvent = Boolean(cue.importantEvent || resolution.importantEvent);
    const importantEvent = eventKind !== 'response';
    const lifetime = refreshEliteAffixResponseLifetime(
      { ttl: cue.ttl, maxTtl: cue.maxTtl },
      importantEvent,
    );
    cue.ttl = lifetime.ttl;
    cue.maxTtl = lifetime.maxTtl;
  };

  prototype.renderEnemies = function renderEnemiesWithNormalizedResponseLifetime(
    this: EnemyManager,
    ...args: Parameters<EnemyManager['renderEnemies']>
  ): void {
    const state = this as unknown as RuntimeEnemyManagerState;
    for (const cue of state.eliteAffixResponseVfx) {
      const normalized = refreshEliteAffixResponseLifetime(
        { ttl: cue.ttl, maxTtl: cue.maxTtl },
        false,
      );
      cue.maxTtl = normalized.maxTtl;
      cue.ttl = eliteAffixResponseLifeRatio(normalized.ttl, normalized.maxTtl) * normalized.maxTtl;
    }
    originalRender.apply(this, args);
  };
}

installEliteAffixResponseLifecycleRuntime();
