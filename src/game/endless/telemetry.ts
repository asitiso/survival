import { clamp } from '../../core/math.js';
import type { GameplayEvent } from './types.js';

export interface TelemetryState {
  spellCasts: number;
  fusionCasts: number;
  heroDamage: number;
  coreDamage: number;
  bossEncounters: number;
  bossDurationMs: number;
  contractCompleted: number;
  contractFailed: number;
  pauseCount: number;
  resumeCount: number;
  framePressureSamples: number[];
}

export function createDefaultTelemetryState(): TelemetryState {
  return {
    spellCasts: 0,
    fusionCasts: 0,
    heroDamage: 0,
    coreDamage: 0,
    bossEncounters: 0,
    bossDurationMs: 0,
    contractCompleted: 0,
    contractFailed: 0,
    pauseCount: 0,
    resumeCount: 0,
    framePressureSamples: [],
  };
}

export function recordTelemetryEvent(state: TelemetryState, event: GameplayEvent): TelemetryState {
  switch (event.type) {
    case 'spell_cast':
      return {
        ...state,
        spellCasts: state.spellCasts + 1,
        fusionCasts: state.fusionCasts + (event.fusion ? 1 : 0),
      };
    case 'hero_damaged':
      return { ...state, heroDamage: state.heroDamage + Math.max(0, event.amount) };
    case 'core_damaged':
      return { ...state, coreDamage: state.coreDamage + Math.max(0, event.amount) };
    case 'boss_defeated':
    case 'boss_encounter_end':
      return {
        ...state,
        bossEncounters: state.bossEncounters + 1,
        bossDurationMs: state.bossDurationMs + Math.max(0, event.durationMs),
      };
    case 'pause':
      return { ...state, pauseCount: state.pauseCount + 1 };
    case 'resume':
      return { ...state, resumeCount: state.resumeCount + 1 };
    case 'frame_pressure': {
      const sample = clamp(event.frameMs, 0, 250);
      return { ...state, framePressureSamples: [...state.framePressureSamples, sample].slice(-12) };
    }
    default:
      return state;
  }
}

export function recordContractTelemetry(state: TelemetryState, outcome: 'completed' | 'failed'): TelemetryState {
  return outcome === 'completed'
    ? { ...state, contractCompleted: state.contractCompleted + 1 }
    : { ...state, contractFailed: state.contractFailed + 1 };
}
