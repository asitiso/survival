import { clamp } from '../../core/math.js';
import type { HeroAscensionModifiers } from './hero-ascension.js';
import type { GameplayEvent } from './types.js';

export type BuildArchetype = 'burst' | 'cycle' | 'domain' | 'fortress';

export interface BuildOverdriveState {
  charge: number;
  activeUntilMs: number;
  activations: number;
}

export interface OverdriveModifiers {
  active: boolean;
  spellPowerMultiplier: number;
  cooldownMultiplier: number;
  areaMultiplier: number;
  heroDamageTakenMultiplier: number;
  coreDamageTakenMultiplier: number;
  bossDamageMultiplier: number;
  fusionPowerMultiplier: number;
}

export function createDefaultOverdriveState(): BuildOverdriveState { return { charge:0, activeUntilMs:0, activations:0 }; }

export function resolveBuildArchetype(mods: Pick<HeroAscensionModifiers,'spellPowerMultiplier'|'cooldownMultiplier'|'areaMultiplier'|'heroDamageTakenMultiplier'|'coreDamageTakenMultiplier'|'fusionPowerMultiplier'|'bossDamageMultiplier'>): BuildArchetype {
  const scores: Record<BuildArchetype, number> = {
    burst: Math.max(0, mods.spellPowerMultiplier-1)*1.15 + Math.max(0,mods.bossDamageMultiplier-1)*1.2 + Math.max(0,mods.fusionPowerMultiplier-1)*.45,
    cycle: Math.max(0,1-mods.cooldownMultiplier)*1.65 + Math.max(0,mods.fusionPowerMultiplier-1)*.3,
    domain: Math.max(0,mods.areaMultiplier-1)*1.55 + Math.max(0,mods.spellPowerMultiplier-1)*.35,
    fortress: Math.max(0,1-mods.heroDamageTakenMultiplier)*1.15 + Math.max(0,1-mods.coreDamageTakenMultiplier)*1.35,
  };
  const order: BuildArchetype[] = ['burst','cycle','domain','fortress'];
  return order.reduce((best, id) => scores[id] > scores[best] ? id : best, order[0]!);
}

function chargeForEvent(event: GameplayEvent): number {
  if (event.type === 'spell_cast') return event.fusion ? 5 : 2;
  if (event.type === 'enemy_killed') return event.elite ? 3 : 1;
  if (event.type === 'boss_defeated') return 20;
  return 0;
}

export function advanceBuildOverdrive(state: BuildOverdriveState, events: readonly GameplayEvent[], elapsedMs: number): BuildOverdriveState {
  const now = Math.max(0, elapsedMs);
  const active = state.activeUntilMs > now;
  if (active) return { charge: clamp(state.charge,0,100), activeUntilMs: state.activeUntilMs, activations: Math.max(0,Math.floor(state.activations)) };
  let charge = state.activeUntilMs > 0 && state.activeUntilMs <= now ? 0 : clamp(state.charge,0,100);
  for (const event of events) charge = clamp(charge + chargeForEvent(event), 0, 100);
  if (charge >= 100) return { charge:0, activeUntilMs: now + 12_000, activations: Math.max(0,Math.floor(state.activations)) + 1 };
  return { charge, activeUntilMs: state.activeUntilMs <= now ? 0 : state.activeUntilMs, activations: Math.max(0,Math.floor(state.activations)) };
}

export function overdriveModifiers(state: BuildOverdriveState, archetype: BuildArchetype, elapsedMs: number): OverdriveModifiers {
  const active = state.activeUntilMs > Math.max(0, elapsedMs);
  const out: OverdriveModifiers = { active, spellPowerMultiplier:1, cooldownMultiplier:1, areaMultiplier:1, heroDamageTakenMultiplier:1, coreDamageTakenMultiplier:1, bossDamageMultiplier:1, fusionPowerMultiplier:1 };
  if (!active) return out;
  if (archetype === 'burst') { out.spellPowerMultiplier=1.2; out.bossDamageMultiplier=1.18; out.fusionPowerMultiplier=1.08; }
  else if (archetype === 'cycle') { out.cooldownMultiplier=.8; out.fusionPowerMultiplier=1.12; }
  else if (archetype === 'domain') { out.areaMultiplier=1.22; out.spellPowerMultiplier=1.1; }
  else { out.heroDamageTakenMultiplier=.84; out.coreDamageTakenMultiplier=.82; out.spellPowerMultiplier=1.06; }
  return {
    active:true,
    spellPowerMultiplier:clamp(out.spellPowerMultiplier,1,1.22),
    cooldownMultiplier:clamp(out.cooldownMultiplier,.78,1),
    areaMultiplier:clamp(out.areaMultiplier,1,1.25),
    heroDamageTakenMultiplier:clamp(out.heroDamageTakenMultiplier,.82,1),
    coreDamageTakenMultiplier:clamp(out.coreDamageTakenMultiplier,.8,1),
    bossDamageMultiplier:clamp(out.bossDamageMultiplier,1,1.2),
    fusionPowerMultiplier:clamp(out.fusionPowerMultiplier,1,1.18),
  };
}
