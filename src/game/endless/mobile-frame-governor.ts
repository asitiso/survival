import { clamp } from '../../core/math.js';

export type MobileFrameGovernorTier = 'full' | 'reduced' | 'minimal';

export interface MobileFrameGovernorState {
  tier: MobileFrameGovernorTier;
  stressFrames: number;
  recoveryFrames: number;
  transitions: number;
}

export interface MobileFrameSample {
  fps: number;
  adaptivePressure: number;
}

export interface MobileFrameGovernorPolicy {
  visualDensity: number;
  projectileVisualDensity: number;
  maxQuality: 'high' | 'medium' | 'low';
  particleCap: number;
  trailCap: number;
  telegraphCap: number;
}


const STRESS_FRAMES = 90;
const RECOVERY_FRAMES = 240;

export function createDefaultMobileFrameGovernorState(): MobileFrameGovernorState {
  return { tier: 'full', stressFrames: 0, recoveryFrames: 0, transitions: 0 };
}

function nextLower(tier: MobileFrameGovernorTier): MobileFrameGovernorTier {
  return tier === 'full' ? 'reduced' : 'minimal';
}

function nextHigher(tier: MobileFrameGovernorTier): MobileFrameGovernorTier {
  return tier === 'minimal' ? 'reduced' : 'full';
}

export function advanceMobileFrameGovernor(state: MobileFrameGovernorState, sample: MobileFrameSample): MobileFrameGovernorState {
  const fps = clamp(Number.isFinite(sample.fps) ? sample.fps : 60, 1, 120);
  const pressure = clamp(Number.isFinite(sample.adaptivePressure) ? sample.adaptivePressure : 0, 0, 1);
  const stressed = fps < 46 || pressure >= .78;
  const recovered = fps >= 55 && pressure <= .45;

  if (stressed) {
    const stressFrames = Math.min(STRESS_FRAMES, Math.max(0, state.stressFrames) + 1);
    if (stressFrames >= STRESS_FRAMES && state.tier !== 'minimal') {
      return { tier: nextLower(state.tier), stressFrames: 0, recoveryFrames: 0, transitions: state.transitions + 1 };
    }
    return { ...state, stressFrames, recoveryFrames: 0 };
  }

  if (recovered) {
    const recoveryFrames = Math.min(RECOVERY_FRAMES, Math.max(0, state.recoveryFrames) + 1);
    if (recoveryFrames >= RECOVERY_FRAMES && state.tier !== 'full') {
      return { tier: nextHigher(state.tier), stressFrames: 0, recoveryFrames: 0, transitions: state.transitions + 1 };
    }
    return { ...state, stressFrames: 0, recoveryFrames };
  }

  return {
    ...state,
    stressFrames: Math.max(0, state.stressFrames - 2),
    recoveryFrames: Math.max(0, state.recoveryFrames - 2),
  };
}

export function mobileFrameGovernorPolicy(tier: MobileFrameGovernorTier): MobileFrameGovernorPolicy {
  if (tier === 'minimal') return { visualDensity: .48, projectileVisualDensity: .42, maxQuality: 'low', particleCap:64, trailCap:28, telegraphCap:24 };
  if (tier === 'reduced') return { visualDensity: .72, projectileVisualDensity: .68, maxQuality: 'medium', particleCap:112, trailCap:48, telegraphCap:24 };
  return { visualDensity: 1, projectileVisualDensity: 1, maxQuality: 'high', particleCap:180, trailCap:72, telegraphCap:24 };
}
