import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './config.js';
import { ELITE_AFFIXES, type EliteAffixId } from './elite-affixes.js';

export const ELITE_AFFIX_IDENTITY_IDS: readonly EliteAffixId[] = ELITE_AFFIXES;

export const ELITE_AFFIX_IDENTITY_ATLAS = {
  src: './assets/enemies/elite-affix-icons.png',
  columns: 3,
  rows: 2,
  cellSize: 96,
  width: 288,
  height: 192,
} as const;

const CELL_BY_AFFIX: Readonly<Record<EliteAffixId, readonly [column: number, row: number]>> = {
  swift: [0, 0], armored: [1, 0], regenerating: [2, 0],
  frenzied: [0, 1], commander: [1, 1], manaShield: [2, 1],
};

export interface EliteAffixIdentityIcon {
  id: EliteAffixId;
  sx: number;
  sy: number;
  sw: number;
  sh: number;
  animated: false;
  motionAmplitude: 0;
  textFallbackPreserved: true;
  loadFailureBlocksGameplay: false;
}

export interface EliteAffixIdentityRowLayout {
  iconSize: number;
  offsetsX: number[];
  worldCentersX: number[];
  worldCenterY: number;
  localCenterY: number;
}

export function eliteAffixIdentityIcon(id: EliteAffixId): EliteAffixIdentityIcon {
  const [column, row] = CELL_BY_AFFIX[id];
  return {
    id,
    sx: column * ELITE_AFFIX_IDENTITY_ATLAS.cellSize,
    sy: row * ELITE_AFFIX_IDENTITY_ATLAS.cellSize,
    sw: ELITE_AFFIX_IDENTITY_ATLAS.cellSize,
    sh: ELITE_AFFIX_IDENTITY_ATLAS.cellSize,
    animated: false,
    motionAmplitude: 0,
    textFallbackPreserved: true,
    loadFailureBlocksGameplay: false,
  };
}

const clamp = (value: number, min: number, max: number): number => Math.max(min, Math.min(max, value));

export function eliteAffixIdentityRowLayout(count: number, radius: number, world: { x: number; y: number }): EliteAffixIdentityRowLayout {
  const safeCount = count >= 2 ? 2 : 1;
  const safeRadius = Number.isFinite(radius) ? radius : 34;
  const iconSize = clamp(Math.round(safeRadius * 0.52), 16, 18);
  const gap = 3;
  const step = iconSize + gap;
  const rawOffsets = safeCount === 1 ? [0] : [-step / 2, step / 2];
  const halfRow = safeCount === 1 ? iconSize / 2 : (step + iconSize) / 2;
  const centerX = clamp(Number.isFinite(world.x) ? world.x : LOGICAL_WIDTH / 2, halfRow, LOGICAL_WIDTH - halfRow);
  const desiredY = (Number.isFinite(world.y) ? world.y : LOGICAL_HEIGHT / 2) + safeRadius + 16;
  const centerY = clamp(desiredY, iconSize / 2, LOGICAL_HEIGHT - iconSize / 2);
  return {
    iconSize,
    offsetsX: rawOffsets,
    worldCentersX: rawOffsets.map((offset) => centerX + offset),
    worldCenterY: centerY,
    localCenterY: centerY - (Number.isFinite(world.y) ? world.y : LOGICAL_HEIGHT / 2),
  };
}

export function eliteAffixIdentityEmphasis(id: EliteAffixId, hpRatio: number, manaShieldRatio: number): 0 | 1 {
  if (id === 'frenzied') return hpRatio <= 0.42 ? 1 : 0;
  if (id === 'manaShield') return manaShieldRatio > 0 ? 1 : 0;
  if (id === 'regenerating') return 1;
  return 0;
}

export type EliteAffixCueReason = 'passive' | 'response' | 'threshold-enter' | 'actual-strike' | 'shield-break';
export interface EliteAffixCueCandidate { id: EliteAffixId; reason: EliteAffixCueReason; }
export interface EliteAffixPrimaryPresentationOwner extends EliteAffixCueCandidate { priority: number; }
const ELITE_AFFIX_CUE_PRIORITY: Readonly<Record<EliteAffixCueReason, number>> = {
  passive: 1,
  response: 2,
  'threshold-enter': 3,
  'actual-strike': 4,
  'shield-break': 5,
};
export function eliteAffixPrimaryPresentationOwner(candidates: readonly EliteAffixCueCandidate[]): EliteAffixPrimaryPresentationOwner | undefined {
  let owner: EliteAffixPrimaryPresentationOwner | undefined;
  for (const candidate of candidates) {
    const priority = ELITE_AFFIX_CUE_PRIORITY[candidate.reason];
    if (!owner || priority > owner.priority) owner = { ...candidate, priority };
  }
  return owner;
}

export type SwiftCadencePhase = 'approach' | 'ready' | 'strike' | 'recovery';
export interface SwiftCadenceLifecycleState { phase: SwiftCadencePhase; active: boolean; transitionTtl: number; }
export interface SwiftCadenceLifecycleInput { inAttackRange: boolean; attackTimer: number; attackInterval: number; struck: boolean; dt: number; }
export interface SwiftCadencePresentation { alpha: number; chevronLength: number; lineWidth: number; motionScale: number; }

export function advanceSwiftCadenceLifecycle(previous: SwiftCadenceLifecycleState | undefined, input: SwiftCadenceLifecycleInput): SwiftCadenceLifecycleState {
  const step = Math.max(0, Number.isFinite(input.dt) ? input.dt : 0);
  const interval = Math.max(0.001, Number.isFinite(input.attackInterval) ? input.attackInterval : 1);
  const timer = Math.max(0, Number.isFinite(input.attackTimer) ? input.attackTimer : interval);
  if (input.struck) return { phase: 'strike', active: true, transitionTtl: 0.10 };
  if (previous?.phase === 'strike') {
    const transitionTtl = Math.max(0, previous.transitionTtl - step);
    if (transitionTtl > 0) return { phase: 'strike', active: true, transitionTtl };
    return { phase: 'recovery', active: true, transitionTtl: 0.14 };
  }
  if (previous?.phase === 'recovery') {
    const transitionTtl = Math.max(0, previous.transitionTtl - step);
    if (transitionTtl > 0) return { phase: 'recovery', active: true, transitionTtl };
  }
  const readyThreshold = Math.min(0.18, interval * 0.30);
  if (input.inAttackRange && timer <= readyThreshold) return { phase: 'ready', active: true, transitionTtl: 0 };
  return { phase: 'approach', active: false, transitionTtl: 0 };
}

export function swiftCadencePresentation(state: SwiftCadenceLifecycleState | undefined, reducedMotion = false, reducedFlash = false): SwiftCadencePresentation {
  if (!state) return { alpha: 0, chevronLength: 0, lineWidth: 0, motionScale: 0 };
  let alpha = state.phase === 'strike' ? 0.64 : state.phase === 'ready' ? 0.34 : state.phase === 'recovery' ? 0.24 : 0.18;
  if (reducedFlash) alpha *= 0.62;
  const chevronLength = state.phase === 'strike' ? 18 : state.phase === 'ready' ? 13 : state.phase === 'recovery' ? 9 : 7;
  const lineWidth = state.phase === 'strike' ? 2.4 : state.phase === 'ready' ? 2 : 1.5;
  const motionScale = reducedMotion ? 0 : state.phase === 'strike' ? 1 : state.phase === 'ready' ? 0.65 : state.phase === 'recovery' ? 0.35 : 0.45;
  return { alpha, chevronLength, lineWidth, motionScale };
}

export interface SwiftStrikeOwnershipInput {
  actualStrike: boolean;
  targetKind: 'hero' | 'core';
  distanceToTarget: number;
  recentlyHit: boolean;
  battlefieldStress: number;
  reducedMotion: boolean;
  reducedFlash: boolean;
}
export interface SwiftStrikeOwnershipPresentation {
  visible: boolean;
  connectorAlpha: number;
  chevronScale: number;
  priorityScale: number;
  motionScale: number;
}
export function swiftStrikeOwnershipPresentation(input: SwiftStrikeOwnershipInput): SwiftStrikeOwnershipPresentation {
  if (!input.actualStrike) return { visible: false, connectorAlpha: 0, chevronScale: 0, priorityScale: 0, motionScale: 0 };
  const stress = clamp(Number.isFinite(input.battlefieldStress) ? input.battlefieldStress : 0, 0, 1);
  const distanceToTarget = Math.max(0, Number.isFinite(input.distanceToTarget) ? input.distanceToTarget : 9999);
  const coreNear = input.targetKind === 'core' && distanceToTarget <= 120;
  const priorityScale = coreNear ? 1 : input.recentlyHit ? 0.94 : Math.max(0.68, 1 - stress * 0.22);
  let connectorAlpha = (coreNear ? 0.66 : 0.56) * priorityScale;
  if (input.reducedFlash) connectorAlpha *= 0.62;
  const chevronScale = (coreNear ? 1 : 0.88) * Math.max(0.72, 1 - stress * 0.18);
  return { visible: true, connectorAlpha, chevronScale, priorityScale, motionScale: input.reducedMotion ? 0 : 1 };
}

export interface SwiftCadenceDensityInput {
  activeCount: number;
  indexFromPriority: number;
  priorityTarget?: boolean;
  higherPriorityCue?: boolean;
  battlefieldStress?: number;
  reducedMotion?: boolean;
  reducedFlash?: boolean;
}
export interface SwiftCadenceDensityPresentation {
  visible: boolean;
  alphaScale: number;
  motionScale: number;
}
export function swiftCadenceDensityPresentation(state: SwiftCadenceLifecycleState | undefined, input: SwiftCadenceDensityInput): SwiftCadenceDensityPresentation {
  if (!state) return { visible: false, alphaScale: 0, motionScale: 0 };
  const stress = clamp(Number.isFinite(input.battlefieldStress) ? (input.battlefieldStress ?? 0) : 0, 0, 1);
  const priority = Boolean(input.priorityTarget) || state.phase === 'strike';
  const capacity = Math.max(1, Math.round(4 - stress * 3));
  let visible = priority || Math.max(0, input.indexFromPriority) < capacity;
  if (input.higherPriorityCue && state.phase !== 'strike') visible = false;
  let alphaScale = priority ? Math.max(0.68, 1 - stress * 0.18) : visible ? Math.max(0.38, 1 - stress * 0.55) : 0.16;
  if (input.higherPriorityCue && state.phase === 'strike') alphaScale = Math.min(0.42, alphaScale * 0.48);
  if (input.reducedFlash) alphaScale *= 0.68;
  return { visible, alphaScale, motionScale: input.reducedMotion ? 0 : visible ? 1 : 0.2 };
}

export type FrenziedThresholdPhase = 'inactive' | 'entered' | 'active' | 'released';
export interface FrenziedThresholdLifecycleState { phase:FrenziedThresholdPhase; active:boolean; transitionTtl:number; }
export interface FrenziedThresholdPresentation { alpha:number; radiusOffset:number; lineWidth:number; pulse:number; }
export interface FrenziedThresholdDensityInput { activeCount:number; indexFromPriority:number; priorityTarget?:boolean; battlefieldStress?:number; reducedMotion?:boolean; reducedFlash?:boolean; }
export interface FrenziedThresholdDensityPresentation { visible:boolean; alphaScale:number; pulseScale:number; }
export function frenziedThresholdDensityPresentation(state:FrenziedThresholdLifecycleState|undefined,input:FrenziedThresholdDensityInput):FrenziedThresholdDensityPresentation {
  if(!state||state.phase==='inactive')return {visible:false,alphaScale:0,pulseScale:0};
  const stress=Math.max(0,Math.min(1,input.battlefieldStress??0));
  const priority=!!input.priorityTarget;
  const capacity=Math.max(1,Math.round(4-stress*3));
  const visible=priority||Math.max(0,input.indexFromPriority)<capacity||state.phase==='entered';
  let alphaScale=priority?Math.max(.72,1-stress*.18):visible?Math.max(.42,1-stress*.48):.18;
  if(state.phase==='released')alphaScale*=.64;
  if(input.reducedFlash)alphaScale*=.72;
  return {visible,alphaScale,pulseScale:input.reducedMotion?0:(visible?1:.22)};
}

export function advanceFrenziedThresholdLifecycle(previous:FrenziedThresholdLifecycleState|undefined,hpRatio:number,dt:number):FrenziedThresholdLifecycleState {
  const active=Number.isFinite(hpRatio)&&hpRatio<=0.42;
  const step=Math.max(0,Number.isFinite(dt)?dt:0);
  if(active){
    if(!previous?.active)return {phase:'entered',active:true,transitionTtl:.10};
    if(previous.phase==='entered'){
      const transitionTtl=Math.max(0,previous.transitionTtl-step);
      return transitionTtl>0?{phase:'entered',active:true,transitionTtl}:{phase:'active',active:true,transitionTtl:0};
    }
    return {phase:'active',active:true,transitionTtl:0};
  }
  if(previous?.active)return {phase:'released',active:false,transitionTtl:.16};
  if(previous?.phase==='released'){
    const transitionTtl=Math.max(0,previous.transitionTtl-step);
    return transitionTtl>0?{phase:'released',active:false,transitionTtl}:{phase:'inactive',active:false,transitionTtl:0};
  }
  return {phase:'inactive',active:false,transitionTtl:0};
}

export function frenziedThresholdPresentation(state:FrenziedThresholdLifecycleState|undefined,reducedMotion=false,reducedFlash=false):FrenziedThresholdPresentation {
  if(!state||state.phase==='inactive')return {alpha:0,radiusOffset:8,lineWidth:0,pulse:0};
  let alpha=state.phase==='entered'?.58:state.phase==='active'?.34:.24;
  if(state.phase==='released')alpha*=Math.max(.2,Math.min(1,state.transitionTtl/.16));
  if(reducedFlash)alpha*=.62;
  return {alpha,radiusOffset:state.phase==='entered'?13:10,lineWidth:state.phase==='entered'?2.2:1.6,pulse:reducedMotion?0:(state.phase==='entered'?3.2:state.phase==='active'?1.8:.8)};
}

export interface EliteAffixIdentityAtlasAudit {
  itemCount: number;
  coverage: number;
  uniqueCellCount: number;
  outOfBounds: EliteAffixId[];
  passed: boolean;
}

export function auditEliteAffixIdentityAtlas(): EliteAffixIdentityAtlasAudit {
  const cells = new Set<string>();
  const outOfBounds: EliteAffixId[] = [];
  for (const id of ELITE_AFFIX_IDENTITY_IDS) {
    const [column, row] = CELL_BY_AFFIX[id];
    cells.add(`${column}:${row}`);
    if (column < 0 || row < 0 || column >= ELITE_AFFIX_IDENTITY_ATLAS.columns || row >= ELITE_AFFIX_IDENTITY_ATLAS.rows) outOfBounds.push(id);
  }
  const coverage = ELITE_AFFIX_IDENTITY_IDS.length === 6 ? 1 : ELITE_AFFIX_IDENTITY_IDS.length / 6;
  return {
    itemCount: ELITE_AFFIX_IDENTITY_IDS.length,
    coverage,
    uniqueCellCount: cells.size,
    outOfBounds,
    passed: coverage === 1 && cells.size === 6 && outOfBounds.length === 0,
  };
}
