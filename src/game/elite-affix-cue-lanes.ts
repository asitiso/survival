export type EliteAffixCueLane = -2 | -1 | 0 | 1 | 2;

export interface EliteAffixCueLaneAllocationInput {
  enemyId: number;
  priorityIndex: number;
  activeEliteCount: number;
  priorityTarget: boolean;
  activeAttack: boolean;
  importantEvent: boolean;
  battlefieldStress: number;
}

export interface EliteAffixCueLaneState {
  lane: EliteAffixCueLane;
  holdTtl: number;
  releaseTtl: number;
}

export interface AdvanceEliteAffixCueLaneInput {
  desiredLane: EliteAffixCueLane;
  dt: number;
  importantEvent: boolean;
}

export interface EliteAffixCueLanePresentationInput {
  enemyRadius: number;
  battlefieldStress: number;
  higherPriorityCue: boolean;
  reducedMotion: boolean;
  reducedFlash: boolean;
}

export interface EliteAffixCueLanePresentation {
  lane: EliteAffixCueLane;
  offsetX: number;
  offsetY: number;
  motionScale: number;
  alphaScale: number;
}

const ROUTINE_HOLD_SECONDS = 0.12;
const ROUTINE_RELEASE_SECONDS = 0.08;
const IMPORTANT_HOLD_SECONDS = 0.16;
const IMPORTANT_RELEASE_SECONDS = 0.10;
const LANE_PATTERN: readonly EliteAffixCueLane[] = [0, -1, 1, -2, 2];

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

function finiteFloor(value: number, fallback = 0): number {
  return Math.max(0, Math.floor(Number.isFinite(value) ? value : fallback));
}

function normalizeLane(value: number): EliteAffixCueLane {
  if (value <= -2) return -2;
  if (value === -1) return -1;
  if (value === 1) return 1;
  if (value >= 2) return 2;
  return 0;
}

export function eliteAffixCueLaneSlotCount(activeEliteCount: number, battlefieldStress: number): 1 | 3 | 5 {
  const active = Math.max(1, finiteFloor(activeEliteCount, 1));
  if (active <= 1) return 1;
  const stress = clamp01(battlefieldStress);
  if (active >= 6 || stress >= 0.72) return 3;
  return 5;
}

export function eliteAffixCueDesiredLane(input: EliteAffixCueLaneAllocationInput): EliteAffixCueLane {
  const slots = eliteAffixCueLaneSlotCount(input.activeEliteCount, input.battlefieldStress);
  if (slots === 1) return 0;

  const priorityIndex = finiteFloor(input.priorityIndex);
  if (priorityIndex < slots) return LANE_PATTERN[priorityIndex] ?? 0;

  if (input.priorityTarget || input.activeAttack || input.importantEvent) {
    const sideSlots = slots - 1;
    const stableSeed = finiteFloor(Math.abs(input.enemyId)) + priorityIndex;
    const foldedIndex = 1 + (stableSeed % sideSlots);
    return LANE_PATTERN[foldedIndex] ?? 0;
  }

  return 0;
}

function progressLaneState(previous: EliteAffixCueLaneState, dt: number): EliteAffixCueLaneState {
  const step = Math.max(0, Number.isFinite(dt) ? dt : 0);
  if (step === 0) return previous;
  const holdConsumed = Math.min(previous.holdTtl, step);
  const holdTtl = Math.max(0, previous.holdTtl - holdConsumed);
  const releaseStep = Math.max(0, step - holdConsumed);
  const releaseTtl = Math.max(0, previous.releaseTtl - releaseStep);
  return { ...previous, holdTtl, releaseTtl };
}

export function advanceEliteAffixCueLane(
  previous: EliteAffixCueLaneState | undefined,
  input: AdvanceEliteAffixCueLaneInput,
): EliteAffixCueLaneState {
  const desiredLane = normalizeLane(input.desiredLane);
  if (!previous) {
    return {
      lane: desiredLane,
      holdTtl: input.importantEvent ? IMPORTANT_HOLD_SECONDS : ROUTINE_HOLD_SECONDS,
      releaseTtl: input.importantEvent ? IMPORTANT_RELEASE_SECONDS : ROUTINE_RELEASE_SECONDS,
    };
  }

  const progressed = progressLaneState(previous, input.dt);
  if (progressed.lane === desiredLane) return progressed;

  if (input.importantEvent) {
    return {
      lane: desiredLane,
      holdTtl: IMPORTANT_HOLD_SECONDS,
      releaseTtl: IMPORTANT_RELEASE_SECONDS,
    };
  }

  if (progressed.holdTtl > 0 || progressed.releaseTtl > 0) return progressed;
  return {
    lane: desiredLane,
    holdTtl: ROUTINE_HOLD_SECONDS,
    releaseTtl: ROUTINE_RELEASE_SECONDS,
  };
}

export function eliteAffixCueLanePresentation(
  state: EliteAffixCueLaneState | undefined,
  input: EliteAffixCueLanePresentationInput,
): EliteAffixCueLanePresentation {
  const lane = state?.lane ?? 0;
  const stress = clamp01(input.battlefieldStress);
  const radius = Math.max(1, Number.isFinite(input.enemyRadius) ? input.enemyRadius : 1);
  const baseOffset = Math.max(6, Math.min(16, radius * 0.52));
  const densityScale = Math.max(0.40, 1 - stress * 0.52);
  const priorityScale = input.higherPriorityCue ? 0.68 : 1;
  const offset = baseOffset * densityScale * priorityScale;
  const sign = lane < 0 ? -1 : lane > 0 ? 1 : 0;
  const magnitude = Math.abs(lane);

  return {
    lane,
    offsetX: magnitude >= 2 ? sign * offset * 0.18 : 0,
    offsetY: lane * offset,
    motionScale: input.reducedMotion ? 0 : (input.higherPriorityCue ? 0.45 : Math.max(0.30, 1 - stress * 0.45)),
    alphaScale: input.reducedFlash ? 0.72 : 1,
  };
}
