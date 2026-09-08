import { distance, type Vec2 } from '../core/math.js';
import { EnemyManager, type Enemy } from './enemies.js';
import type { EliteAffixId } from './elite-affixes.js';
import { eliteAffixCueLayerPresentation, type EliteAffixCueEventKind } from './elite-affix-cue-arbitration.js';
import { eliteAffixCueLanePresentation } from './elite-affix-cue-lanes.js';
import { eliteAffixLifecycleVfxSprite } from './elite-affix-lifecycle-vfx-assets.js';
import { swiftStrikeOwnershipPresentation } from './elite-affix-identity-assets.js';
import {
  eliteAffixResponseCrossAffixOwnership,
  eliteAffixResponseCrossAffixPresentation,
} from './elite-affix-response-arbitration.js';
import {
  advanceEliteAffixResponseCrossAffixHandoff,
  eliteAffixResponseCrossAffixHandoffHoldActive,
  eliteAffixResponseCrossAffixHandoffRole,
  eliteAffixResponseCrossAffixOutgoingPresent,
  type EliteAffixResponseCrossAffixHandoffRole,
  type EliteAffixResponseCrossAffixHandoffState,
} from './elite-affix-response-handoff.js';
import {
  captureEliteAffixResponseLaneSnapshot,
  eliteAffixResponseCueOrigin,
  eliteAffixResponseLifeRatio,
  eliteAffixResponseRenderPresentation,
  promoteEliteAffixResponseLaneSnapshot,
  refreshEliteAffixResponseTarget,
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

interface CrossAffixDecision {
  primary: boolean;
  primaryImportant: boolean;
  handoffRole: EliteAffixResponseCrossAffixHandoffRole;
  handoffProgress: number;
  handoffHasOutgoing: boolean;
}

let installed = false;
const crossAffixOwner = new WeakMap<
  RuntimeEnemyManagerState,
  Map<number, EliteAffixResponseCrossAffixHandoffState>
>();

function finiteStress(value: unknown): number {
  return Math.max(0, Math.min(1, typeof value === 'number' && Number.isFinite(value) ? value : 0));
}

function finiteTarget(target: Vec2 | undefined): target is Vec2 {
  return Boolean(target && Number.isFinite(target.x) && Number.isFinite(target.y));
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

function responseLayerFor(
  cue: RuntimeResponseCue,
  sourceEnemy: Enemy | undefined,
  activeAffixElites: Enemy[],
  priorityRank: Map<Enemy, number>,
  heroPos: Vec2 | null,
  corePos: Vec2 | null,
  battlefieldStress: number,
  higherPriorityCue: boolean,
  reducedMotion: boolean,
  reducedFlash: boolean,
) {
  if (!sourceEnemy) {
    return eliteAffixCueLayerPresentation(undefined, cue.affixId, {
      activeEliteCount: activeAffixElites.length,
      indexFromPriority: activeAffixElites.length,
      priorityTarget: false,
      activeAttack: false,
      higherPriorityCue,
      battlefieldStress,
      reducedMotion,
      reducedFlash,
    });
  }

  const target = sourceEnemy.target === 'core' ? corePos : heroPos;
  const distanceToTarget = target ? distance(sourceEnemy.pos, target) : 9999;
  const activeAttack = sourceEnemy.swiftCadencePresentation?.phase === 'strike' ||
    (sourceEnemy.attackResolveMotion?.resolve ?? 0) > 0.12 ||
    (sourceEnemy.attackTimer > 0 && sourceEnemy.attackTimer <= Math.min(0.18, sourceEnemy.attackInterval * 0.3));

  return eliteAffixCueLayerPresentation(sourceEnemy.eliteAffixCueOwnership, cue.affixId, {
    activeEliteCount: activeAffixElites.length,
    indexFromPriority: priorityRank.get(sourceEnemy) ?? activeAffixElites.length,
    priorityTarget: sourceEnemy.target === 'core' || distanceToTarget <= 120 || sourceEnemy.hitFlash > 0,
    activeAttack,
    higherPriorityCue,
    battlefieldStress,
    reducedMotion,
    reducedFlash,
  });
}

function crossAffixResponseDecisions(
  cues: RuntimeResponseCue[],
  state: RuntimeEnemyManagerState,
): Map<RuntimeResponseCue, CrossAffixDecision> {
  let ownerByEnemy = crossAffixOwner.get(state);
  if (!ownerByEnemy) {
    ownerByEnemy = new Map<number, EliteAffixResponseCrossAffixHandoffState>();
    crossAffixOwner.set(state, ownerByEnemy);
  }

  const groups = new Map<number, RuntimeResponseCue[]>();
  for (const cue of cues) {
    if (!Number.isFinite(cue.ttl) || cue.ttl <= 0) continue;
    const group = groups.get(cue.enemyId);
    if (group) group.push(cue);
    else groups.set(cue.enemyId, [cue]);
  }

  for (const enemyId of [...ownerByEnemy.keys()]) {
    if (!groups.has(enemyId)) ownerByEnemy.delete(enemyId);
  }

  const decisions = new Map<RuntimeResponseCue, CrossAffixDecision>();
  for (const [enemyId, group] of groups) {
    const sourceEnemy = state.enemies.find((candidate) => candidate.id === enemyId && candidate.alive);
    const previousState = ownerByEnemy.get(enemyId);
    const previousOwner = previousState?.ownerAffixId ?? null;
    const previousCue = previousOwner
      ? [...group].reverse().find((candidate) => candidate.affixId === previousOwner && Number.isFinite(candidate.ttl) && candidate.ttl > 0)
      : undefined;
    const holdActive = previousCue
      ? eliteAffixResponseLifeRatio(previousCue.ttl, previousCue.maxTtl) >= 0.80 ||
        eliteAffixResponseCrossAffixHandoffHoldActive(previousState, true)
      : false;
    const ownership = eliteAffixResponseCrossAffixOwnership(
      group.map((cue) => ({
        affixId: cue.affixId,
        importantEvent: Boolean(cue.laneSnapshot?.importantEvent || cue.importantEvent),
        ttl: cue.ttl,
        maxTtl: cue.maxTtl,
        livePrimary: sourceEnemy?.eliteAffixCueOwnership?.owner === cue.affixId,
      })),
      previousOwner,
      holdActive,
    );

    if (!ownership.primaryAffixId || ownership.primaryIndex < 0) {
      ownerByEnemy.delete(enemyId);
      continue;
    }

    const primaryCue = group[ownership.primaryIndex]!;
    const handoffState = advanceEliteAffixResponseCrossAffixHandoff(
      previousState,
      ownership.primaryAffixId,
      ownership.primaryImportant,
      primaryCue.ttl,
    );
    ownerByEnemy.set(enemyId, handoffState);
    const handoffHasOutgoing = eliteAffixResponseCrossAffixOutgoingPresent(
      handoffState,
      group.map((cue) => cue.affixId),
    );

    for (let index = 0; index < group.length; index += 1) {
      const cue = group[index]!;
      const primary = index === ownership.primaryIndex;
      decisions.set(cue, {
        primary,
        primaryImportant: ownership.primaryImportant,
        handoffRole: eliteAffixResponseCrossAffixHandoffRole(handoffState, cue.affixId, primary),
        handoffProgress: handoffState.progress,
        handoffHasOutgoing,
      });
    }
  }

  return decisions;
}

function renderFrozenEliteAffixResponses(
  ctx: CanvasRenderingContext2D,
  cues: RuntimeResponseCue[],
  state: RuntimeEnemyManagerState,
  args: Parameters<EnemyManager['renderEnemies']>,
  battlefieldStress: number,
  higherPriorityCue: boolean,
  reducedMotion: boolean,
  reducedFlash: boolean,
): void {
  const atlasImage = args[21] as CanvasImageSource | null | undefined;
  const atlasReady = Boolean(args[22]);
  if (!atlasReady || !atlasImage) return;

  const heroPos = (args[10] ?? null) as Vec2 | null;
  const corePos = (args[25] ?? null) as Vec2 | null;
  const activeAffixElites = state.enemies.filter(
    (enemy) => enemy.alive && enemy.type === 'elite' && Boolean(enemy.eliteAffixes?.length),
  );
  const score = (enemy: Enemy): number => {
    const target = enemy.target === 'core' ? corePos : heroPos;
    const distanceToTarget = target ? distance(enemy.pos, target) : 9999;
    const activeAttack = enemy.swiftCadencePresentation?.phase === 'strike' ||
      (enemy.attackResolveMotion?.resolve ?? 0) > 0.12 ||
      (enemy.attackTimer > 0 && enemy.attackTimer <= Math.min(0.18, enemy.attackInterval * 0.3));
    return (enemy.target === 'core' ? 5 : 0) +
      (distanceToTarget <= 120 ? 4 : 0) +
      (enemy.hitFlash > 0 ? 3 : 0) +
      (activeAttack ? 2 : 0);
  };
  const priority = [...activeAffixElites].sort((a, b) => score(b) - score(a) || a.id - b.id);
  const priorityRank = new Map(priority.map((enemy, index) => [enemy, index]));
  const crossDecisions = crossAffixResponseDecisions(cues, state);

  for (const cue of cues) {
    const sourceEnemy = state.enemies.find((candidate) => candidate.id === cue.enemyId && candidate.alive);
    const responseLayer = responseLayerFor(
      cue,
      sourceEnemy,
      activeAffixElites,
      priorityRank,
      heroPos,
      corePos,
      battlefieldStress,
      higherPriorityCue,
      reducedMotion,
      reducedFlash,
    );
    const responsePresentation = eliteAffixResponseRenderPresentation(cue.laneSnapshot, {
      liveVisible: responseLayer.visible,
      liveResponseAlphaScale: responseLayer.responseAlphaScale,
      battlefieldStress,
      higherPriorityCue,
      reducedMotion,
      reducedFlash,
    });
    const crossDecision = crossDecisions.get(cue) ?? {
      primary: true,
      primaryImportant: responsePresentation.importantEvent,
      handoffRole: 'none' as EliteAffixResponseCrossAffixHandoffRole,
      handoffProgress: 1,
      handoffHasOutgoing: true,
    };
    const crossPresentation = eliteAffixResponseCrossAffixPresentation({
      primary: crossDecision.primary,
      importantEvent: responsePresentation.importantEvent,
      primaryImportant: crossDecision.primaryImportant,
      baseVisible: responsePresentation.visible,
      baseAlphaScale: responsePresentation.alphaScale,
      battlefieldStress,
      higherPriorityCue,
      reducedFlash,
      handoffRole: crossDecision.handoffRole,
      handoffProgress: crossDecision.handoffProgress,
      handoffHasOutgoing: crossDecision.handoffHasOutgoing,
    });
    if (!crossPresentation.visible) continue;

    const responseCuePos = eliteAffixResponseCueOrigin(cue.responseBasePos ?? cue.pos, cue.laneSnapshot);
    const sprite = eliteAffixLifecycleVfxSprite(cue.affixId, 'response');
    const t = eliteAffixResponseLifeRatio(cue.ttl, cue.maxTtl);
    const size = 92 + (1 - t) * 22;
    ctx.save();
    ctx.globalAlpha = Math.min(reducedFlash ? 0.48 : 0.88, t) * crossPresentation.alphaScale;
    ctx.drawImage(
      atlasImage,
      sprite.sx,
      sprite.sy,
      sprite.sw,
      sprite.sh,
      responseCuePos.x - size / 2,
      responseCuePos.y - size / 2,
      size,
      size,
    );
    ctx.restore();

    if (cue.affixId !== 'swift' || !finiteTarget(cue.targetPos) || !cue.targetKind) continue;
    const ownership = swiftStrikeOwnershipPresentation({
      actualStrike: true,
      targetKind: cue.targetKind,
      distanceToTarget: distance(responseCuePos, cue.targetPos),
      recentlyHit: (sourceEnemy?.hitFlash ?? 0) > 0,
      battlefieldStress: finiteStress(args.at(-1)),
      reducedMotion,
      reducedFlash,
    });
    if (!ownership.visible) continue;

    const dx = cue.targetPos.x - responseCuePos.x;
    const dy = cue.targetPos.y - responseCuePos.y;
    const magnitude = Math.hypot(dx, dy) || 1;
    const nx = dx / magnitude;
    const ny = dy / magnitude;
    const travel = Math.min(72, Math.max(30, magnitude * 0.55));
    const endX = responseCuePos.x + nx * travel;
    const endY = responseCuePos.y + ny * travel;
    const perpX = -ny;
    const perpY = nx;
    const wing = 6 * ownership.chevronScale;
    ctx.save();
    ctx.globalAlpha = ownership.connectorAlpha * t * crossPresentation.alphaScale;
    ctx.strokeStyle = '#9edfff';
    ctx.lineWidth = 2 * ownership.priorityScale;
    ctx.beginPath();
    ctx.moveTo(responseCuePos.x + nx * 10, responseCuePos.y + ny * 10);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - nx * 7 + perpX * wing, endY - ny * 7 + perpY * wing);
    ctx.moveTo(endX, endY);
    ctx.lineTo(endX - nx * 7 - perpX * wing, endY - ny * 7 - perpY * wing);
    ctx.stroke();
    ctx.restore();
  }
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
    const importantEvent = eventKind !== 'response';
    cue.importantEvent = Boolean(cue.importantEvent || importantEvent);
    const refreshed = refreshEliteAffixResponseTarget(
      { targetPos: cue.targetPos, targetKind: cue.targetKind },
      { targetPos, targetKind: enemy.target },
      importantEvent,
    );
    if (refreshed.targetPos && refreshed.targetKind) {
      cue.targetPos = { ...refreshed.targetPos };
      cue.targetKind = refreshed.targetKind;
    }
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
    const battlefieldStress = Math.max(
      hazardPressure,
      Math.min(1, Math.max(0, activeAffixEliteCount - 3) / 5),
    );
    const higherPriorityCue = hazardPressure >= 0.72;
    const responseCues = state.eliteAffixResponseVfx;

    for (const cue of responseCues) {
      const sourceEnemy = state.enemies.find((candidate) => candidate.id === cue.enemyId && candidate.alive);
      cue.responseBasePos ??= { ...cue.pos };
      const liveLane = laneForEnemy(sourceEnemy, battlefieldStress, higherPriorityCue, reducedMotion, reducedFlash);
      const importantEvent = Boolean(cue.importantEvent || importantFromSource(sourceEnemy, cue));
      const candidate = sourceEnemy
        ? captureEliteAffixResponseLaneSnapshot(liveLane, importantEvent)
        : undefined;
      const retained = retainEliteAffixResponseLaneSnapshot(cue.laneSnapshot, candidate);
      cue.laneSnapshot = promoteEliteAffixResponseLaneSnapshot(retained, candidate, importantEvent);
    }

    state.eliteAffixResponseVfx = [];
    try {
      originalRender.apply(this, args);
    } finally {
      state.eliteAffixResponseVfx = responseCues;
    }

    const ctx = args[0] as CanvasRenderingContext2D;
    renderFrozenEliteAffixResponses(
      ctx,
      responseCues,
      state,
      args,
      battlefieldStress,
      higherPriorityCue,
      reducedMotion,
      reducedFlash,
    );
  };
}

installEliteAffixResponseLaneRuntime();
