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
  importantEvent: boolean;
  releaseFromLane?: EliteAffixCueLane;
  settleFloor?: number;
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
const ROUTINE_SETTLE_SECONDS = ROUTINE_HOLD_SECONDS + ROUTINE_RELEASE_SECONDS;
const ROUTINE_SETTLE_FLOOR = 0.32;
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

export function eliteAffixCueStableStress(battlefieldStress: number): number {
  const stress = clamp01(battlefieldStress);
  if (stress < 0.24) return 0.12;
  if (stress < 0.48) return 0.36;
  if (stress < 0.72) return 0.60;
  if (stress < 0.90) return 0.81;
  return 1;
}

export function eliteAffixCueLaneOffsetVector(lane: EliteAffixCueLane, offset: number, settleScale: number): { x: number; y: number } {
  const distance = Math.max(0, Number.isFinite(offset) ? offset : 0) * clamp01(settleScale);
  if (lane === 0 || distance === 0) return { x: 0, y: 0 };
  const sign = lane < 0 ? -1 : 1;
  if (Math.abs(lane) === 1) return { x: 0, y: sign * distance };
  return { x: sign * distance * 0.42, y: sign * distance * 1.42 };
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

function withoutTransientLaneState(state: EliteAffixCueLaneState): EliteAffixCueLaneState {
  if (state.releaseFromLane === undefined && state.settleFloor === undefined) return state;
  const { releaseFromLane: _releaseFromLane, settleFloor: _settleFloor, ...rest } = state;
  return rest;
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
      importantEvent: input.importantEvent,
    };
  }

  const progressed = progressLaneState(previous, input.dt);

  if (!input.importantEvent && progressed.lane === 0 && desiredLane !== 0 && progressed.releaseFromLane === desiredLane) {
    const releaseContinuity = clamp01((progressed.holdTtl + progressed.releaseTtl) / ROUTINE_SETTLE_SECONDS);
    return {
      lane: desiredLane,
      holdTtl: ROUTINE_HOLD_SECONDS,
      releaseTtl: ROUTINE_RELEASE_SECONDS,
      importantEvent: false,
      settleFloor: Math.max(ROUTINE_SETTLE_FLOOR, releaseContinuity),
    };
  }

  if (progressed.lane === desiredLane) {
    if (progressed.holdTtl <= 0 && progressed.releaseTtl <= 0) {
      const released = withoutTransientLaneState(progressed);
      if (!input.importantEvent && released.importantEvent) return { ...released, importantEvent: false };
      return released;
    }
    return progressed;
  }

  if (input.importantEvent) {
    return {
      lane: desiredLane,
      holdTtl: IMPORTANT_HOLD_SECONDS,
      releaseTtl: IMPORTANT_RELEASE_SECONDS,
      importantEvent: true,
    };
  }

  if (progressed.holdTtl > 0 || progressed.releaseTtl > 0) return progressed;
  const releaseFromLane = desiredLane === 0 && progressed.lane !== 0 ? progressed.lane : undefined;
  return {
    lane: desiredLane,
    holdTtl: ROUTINE_HOLD_SECONDS,
    releaseTtl: ROUTINE_RELEASE_SECONDS,
    importantEvent: false,
    ...(releaseFromLane !== undefined ? { releaseFromLane } : {}),
  };
}

export function eliteAffixCueLanePresentation(
  state: EliteAffixCueLaneState | undefined,
  input: EliteAffixCueLanePresentationInput,
): EliteAffixCueLanePresentation {
  const lane = state?.lane ?? 0;
  const stress = eliteAffixCueStableStress(input.battlefieldStress);
  const radius = Math.max(1, Number.isFinite(input.enemyRadius) ? input.enemyRadius : 1);
  const baseOffset = Math.max(6, Math.min(16, radius * 0.52));
  const densityScale = Math.max(0.40, 1 - stress * 0.52);
  const priorityScale = input.higherPriorityCue ? 0.68 : 1;
  const offset = baseOffset * densityScale * priorityScale;
  const routineTimeRemaining = Math.max(0, (state?.holdTtl ?? 0) + (state?.releaseTtl ?? 0));
  const routineProgress = clamp01(1 - routineTimeRemaining / ROUTINE_SETTLE_SECONDS);
  const releasingToCenter = lane === 0 && state?.releaseFromLane !== undefined && state.releaseFromLane !== 0;
  const presentationLane = releasingToCenter ? state.releaseFromLane! : lane;
  const routineFloor = Math.max(ROUTINE_SETTLE_FLOOR, clamp01(state?.settleFloor ?? ROUTINE_SETTLE_FLOOR));
  const settleScale = releasingToCenter
    ? 1 - routineProgress
    : state?.importantEvent
      ? 1
      : routineFloor + (1 - routineFloor) * routineProgress;
  const vector = eliteAffixCueLaneOffsetVector(presentationLane, offset, settleScale);

  return {
    lane,
    offsetX: vector.x,
    offsetY: vector.y,
    motionScale: input.reducedMotion ? 0 : (input.higherPriorityCue ? 0.45 : Math.max(0.30, 1 - stress * 0.45)),
    alphaScale: input.reducedFlash ? 0.72 : 1,
  };
}
