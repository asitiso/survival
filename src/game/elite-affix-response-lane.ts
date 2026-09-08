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

function clamp01(value: number, fallback = 0): number {
  const finite = Number.isFinite(value) ? value : fallback;
  return Math.max(0, Math.min(1, finite));
}

function finite(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
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

export function eliteAffixResponseCueOrigin(
  cuePosition: { x: number; y: number },
  snapshot: Pick<EliteAffixResponseLaneSnapshot, 'offsetX' | 'offsetY'> | undefined,
): { x: number; y: number } {
  return {
    x: finite(cuePosition.x) + finite(snapshot?.offsetX ?? 0),
    y: finite(cuePosition.y) + finite(snapshot?.offsetY ?? 0),
  };
}
