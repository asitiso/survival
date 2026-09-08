import type { EliteAffixCueLanePresentation } from './elite-affix-cue-lanes.js';

export interface EliteAffixResponseLaneSnapshot {
  offsetX: number;
  offsetY: number;
  motionScale: number;
  sourceAlphaScale: number;
  importantEvent: boolean;
}

export interface EliteAffixResponseLanePresentationInput {
  battlefieldStress: number;
  higherPriorityCue: boolean;
  reducedMotion: boolean;
  reducedFlash: boolean;
}

export interface EliteAffixResponseLanePresentation {
  offsetX: number;
  offsetY: number;
  motionScale: number;
  alphaScale: number;
}

export interface EliteAffixResponseRenderPresentationInput extends EliteAffixResponseLanePresentationInput {
  liveVisible: boolean;
  liveResponseAlphaScale: number;
}

export interface EliteAffixResponseRenderPresentation extends EliteAffixResponseLanePresentation {
  visible: boolean;
  importantEvent: boolean;
}

export type EliteAffixResponseTargetKind = 'hero' | 'core';

export interface EliteAffixResponseTargetState {
  targetPos?: { x: number; y: number } | undefined;
  targetKind?: EliteAffixResponseTargetKind | undefined;
}

export interface EliteAffixResponseLifetimeState {
  ttl: number;
  maxTtl: number;
}

export interface EliteAffixResponseDuplicateCandidate {
  ttl: number;
  importantEvent?: boolean | undefined;
}

export interface EliteAffixResponseDuplicateResolution {
  ownerIndex: number;
  dropIndexes: number[];
  importantEvent: boolean;
}

const DEFAULT_RESPONSE_LIFETIME = 0.42;

function clamp01(value: number, fallback = 0): number {
  const finite = Number.isFinite(value) ? value : fallback;
  return Math.max(0, Math.min(1, finite));
}

function finite(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

function finiteTarget(
  target: EliteAffixResponseTargetState | undefined,
): { targetPos: { x: number; y: number }; targetKind: EliteAffixResponseTargetKind } | undefined {
  if (!target?.targetPos) return undefined;
  if (!Number.isFinite(target.targetPos.x) || !Number.isFinite(target.targetPos.y)) return undefined;
  if (target.targetKind !== 'hero' && target.targetKind !== 'core') return undefined;
  return {
    targetPos: { x: target.targetPos.x, y: target.targetPos.y },
    targetKind: target.targetKind,
  };
}

function responseMaxLifetime(maxTtl: number): number {
  return Number.isFinite(maxTtl) && maxTtl > 0 ? maxTtl : DEFAULT_RESPONSE_LIFETIME;
}

export function captureEliteAffixResponseLaneSnapshot(
  presentation: EliteAffixCueLanePresentation | undefined,
  importantEvent: boolean,
): EliteAffixResponseLaneSnapshot {
  if (!presentation) {
    return {
      offsetX: 0,
      offsetY: 0,
      motionScale: 0,
      sourceAlphaScale: 1,
      importantEvent,
    };
  }

  return {
    offsetX: finite(presentation.offsetX),
    offsetY: finite(presentation.offsetY),
    motionScale: clamp01(presentation.motionScale),
    sourceAlphaScale: clamp01(presentation.alphaScale, 1),
    importantEvent,
  };
}

export function retainEliteAffixResponseLaneSnapshot(
  existing: EliteAffixResponseLaneSnapshot | undefined,
  candidate: EliteAffixResponseLaneSnapshot | undefined,
): EliteAffixResponseLaneSnapshot | undefined {
  return existing ?? candidate;
}

export function promoteEliteAffixResponseLaneSnapshot(
  existing: EliteAffixResponseLaneSnapshot | undefined,
  candidate: EliteAffixResponseLaneSnapshot | undefined,
  importantEvent: boolean,
): EliteAffixResponseLaneSnapshot {
  const important = Boolean(existing?.importantEvent || candidate?.importantEvent || importantEvent);
  if (!existing) {
    const seed = candidate ?? captureEliteAffixResponseLaneSnapshot(undefined, important);
    return {
      offsetX: finite(seed.offsetX),
      offsetY: finite(seed.offsetY),
      motionScale: clamp01(seed.motionScale),
      sourceAlphaScale: clamp01(seed.sourceAlphaScale, 1),
      importantEvent: important,
    };
  }

  const existingAlpha = clamp01(existing.sourceAlphaScale, 1);
  const candidateAlpha = candidate && Number.isFinite(candidate.sourceAlphaScale)
    ? clamp01(candidate.sourceAlphaScale)
    : existingAlpha;
  const canRecoverAlpha = Boolean(importantEvent || candidate?.importantEvent);

  return {
    offsetX: finite(existing.offsetX),
    offsetY: finite(existing.offsetY),
    motionScale: clamp01(existing.motionScale),
    sourceAlphaScale: canRecoverAlpha ? Math.max(existingAlpha, candidateAlpha) : existingAlpha,
    importantEvent: important,
  };
}

export function eliteAffixResponseLanePresentation(
  snapshot: EliteAffixResponseLaneSnapshot | undefined,
  input: EliteAffixResponseLanePresentationInput,
): EliteAffixResponseLanePresentation {
  const stable = snapshot ?? captureEliteAffixResponseLaneSnapshot(undefined, false);
  const stress = clamp01(input.battlefieldStress);
  const densityAlpha = stable.importantEvent
    ? Math.max(0.82, 1 - stress * 0.12)
    : Math.max(0.52, 1 - stress * 0.40);
  const priorityAlpha = input.higherPriorityCue
    ? (stable.importantEvent ? 0.94 : 0.74)
    : 1;
  const responseBudget = densityAlpha * priorityAlpha;
  const alphaScale = Math.min(stable.sourceAlphaScale, responseBudget);

  return {
    offsetX: finite(stable.offsetX),
    offsetY: finite(stable.offsetY),
    motionScale: input.reducedMotion ? 0 : clamp01(stable.motionScale),
    alphaScale: input.reducedFlash ? Math.min(0.72, alphaScale) : alphaScale,
  };
}

export function eliteAffixResponseRenderPresentation(
  snapshot: EliteAffixResponseLaneSnapshot | undefined,
  input: EliteAffixResponseRenderPresentationInput,
): EliteAffixResponseRenderPresentation {
  const lanePresentation = eliteAffixResponseLanePresentation(snapshot, input);
  const importantEvent = Boolean(snapshot?.importantEvent);
  const liveAlpha = clamp01(input.liveResponseAlphaScale, 0);
  let alphaScale = importantEvent
    ? lanePresentation.alphaScale
    : Math.min(lanePresentation.alphaScale, liveAlpha);
  if (input.reducedFlash) alphaScale = Math.min(0.72, alphaScale);

  return {
    ...lanePresentation,
    visible: importantEvent ? true : Boolean(input.liveVisible),
    importantEvent,
    alphaScale: clamp01(alphaScale),
  };
}

export function refreshEliteAffixResponseTarget(
  existing: EliteAffixResponseTargetState = {},
  candidate: EliteAffixResponseTargetState = {},
  importantEvent: boolean,
): EliteAffixResponseTargetState {
  const retained = finiteTarget(existing);
  if (!importantEvent) return retained ?? {};
  const refreshed = finiteTarget(candidate);
  return refreshed ?? retained ?? {};
}

export function refreshEliteAffixResponseLifetime(
  existing: EliteAffixResponseLifetimeState,
  importantEvent: boolean,
): EliteAffixResponseLifetimeState {
  const maxTtl = responseMaxLifetime(existing.maxTtl);
  const ttl = Math.max(0, Math.min(maxTtl, Number.isFinite(existing.ttl) ? existing.ttl : 0));
  return {
    ttl: importantEvent ? maxTtl : ttl,
    maxTtl,
  };
}

export function eliteAffixResponseLifeRatio(ttl: number, maxTtl: number): number {
  const safeMaxTtl = responseMaxLifetime(maxTtl);
  const safeTtl = Number.isFinite(ttl) ? ttl : 0;
  return clamp01(safeTtl / safeMaxTtl);
}

export function eliteAffixResponseDuplicateResolution(
  candidates: readonly EliteAffixResponseDuplicateCandidate[],
): EliteAffixResponseDuplicateResolution {
  const activeIndexes: number[] = [];
  for (let index = 0; index < candidates.length; index += 1) {
    const ttl = candidates[index]?.ttl;
    if (typeof ttl === 'number' && Number.isFinite(ttl) && ttl > 0) activeIndexes.push(index);
  }
  if (activeIndexes.length === 0) {
    return { ownerIndex: -1, dropIndexes: [], importantEvent: false };
  }
  const ownerIndex = activeIndexes[activeIndexes.length - 1]!;
  const dropIndexes = activeIndexes.slice(0, -1);
  const importantEvent = activeIndexes.some((index) => Boolean(candidates[index]?.importantEvent));
  return { ownerIndex, dropIndexes, importantEvent };
}

export function eliteAffixResponseCueOrigin(
  cuePosition: { x: number; y: number },
  snapshot: Pick<EliteAffixResponseLaneSnapshot, 'offsetX' | 'offsetY'> | undefined,
): { x: number; y: number } {
  return {
    x: finite(cuePosition.x) + finite(snapshot?.offsetX ?? 0),
    y: finite(cuePosition.y) + finite(snapshot?.offsetY ?? 0),
  };
}
