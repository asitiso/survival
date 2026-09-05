import { clamp } from '../../core/math.js';
import { pickWeighted, type RngState } from './rng.js';
import type { Effect, GameplayEvent, LegacyRunView } from './types.js';

export type ContractFamily = 'slayer' | 'warden' | 'arcane' | 'hunter' | 'survivor';

export interface ContractOption {
  optionId: string;
  family: ContractFamily;
  title: string;
  description: string;
  target: number;
  durationMs: number;
}

export interface ContractOffer {
  offerId: string;
  generatedAtMs: number;
  options: readonly [ContractOption, ContractOption, ContractOption];
}

export interface ActiveContract {
  contractId: string;
  family: ContractFamily;
  startedAtMs: number;
  deadlineMs: number;
  target: number;
  progress: number;
  baselineCoreHp: number;
}

export interface ContractBoon {
  family: ContractFamily;
  expiresAtMs: number;
}

export interface ContractRuntimeState {
  nextOfferIndex: number;
  offerHistory: ContractFamily[];
  pendingOffer: ContractOffer | undefined;
  active: ActiveContract | undefined;
  completedCount: number;
  failedCount: number;
  boons: ContractBoon[];
}

export interface ContractOfferResult {
  state: ContractRuntimeState;
  offer: ContractOffer;
  rng: RngState;
}

export interface ContractAdvanceResult {
  state: ContractRuntimeState;
  effects: Effect[];
}

const FAMILIES: ContractFamily[] = ['slayer', 'warden', 'arcane', 'hunter', 'survivor'];

export function createDefaultContractState(): ContractRuntimeState {
  return {
    nextOfferIndex: 0,
    offerHistory: [],
    pendingOffer: undefined,
    active: undefined,
    completedCount: 0,
    failedCount: 0,
    boons: [],
  };
}

export function contractOfferTimeMs(index: number): number {
  if (index <= 3) return (4 + index * 5) * 60_000;
  return (19 + (index - 3) * 7) * 60_000;
}

export function shouldOfferContract(state: ContractRuntimeState, elapsedMs: number): boolean {
  if (state.active || state.pendingOffer) return false;
  return elapsedMs >= contractOfferTimeMs(state.nextOfferIndex);
}

function familyWeight(family: ContractFamily, legacy: LegacyRunView): number {
  let weight = 1;
  if (legacy.fate === 'frenzy' && (family === 'slayer' || family === 'hunter')) weight += 0.8;
  if (legacy.fate === 'gold' && family === 'hunter') weight += 0.9;
  if (legacy.fate === 'guardian' && (family === 'warden' || family === 'survivor')) weight += 0.9;
  if (legacy.spellFusionCount > 0 && family === 'arcane') weight += 0.5;
  if (legacy.threat >= 4 && family === 'warden') weight += 0.35;
  if (legacy.masteryLevel >= 10 && family === 'survivor') weight += 0.25;
  return weight;
}

function contractShape(family: ContractFamily, legacy: LegacyRunView, offerId: string): ContractOption {
  const minute = Math.floor(legacy.elapsedMs / 60_000);
  const pressure = legacy.threat + Math.floor(minute / 10);
  switch (family) {
    case 'slayer': {
      const target = Math.round(clamp(30 + pressure * 6, 30, 120));
      return { optionId: `${offerId}:slayer`, family, title: 'Slayer Contract', description: `Defeat ${target} enemies`, target, durationMs: 45_000 };
    }
    case 'warden': {
      const target = 30_000;
      return { optionId: `${offerId}:warden`, family, title: 'Warden Contract', description: 'Protect the guardian core for 30 seconds', target, durationMs: 30_000 };
    }
    case 'arcane': {
      const target = Math.round(clamp(16 + pressure * 2, 16, 40));
      return { optionId: `${offerId}:arcane`, family, title: 'Arcane Contract', description: `Cast ${target} normal spells or fusions`, target, durationMs: 40_000 };
    }
    case 'hunter': {
      const target = Math.round(clamp(3 + Math.floor(legacy.threat / 2), 3, 6));
      return { optionId: `${offerId}:hunter`, family, title: 'Hunter Contract', description: `Defeat ${target} elite-equivalent targets`, target, durationMs: 60_000 };
    }
    case 'survivor': {
      const target = 20_000;
      return { optionId: `${offerId}:survivor`, family, title: 'Survivor Contract', description: 'Avoid hero damage for 20 seconds', target, durationMs: 20_000 };
    }
  }
}

function blockedFamily(history: readonly ContractFamily[]): ContractFamily | undefined {
  const recent = history.slice(-3);
  for (const family of FAMILIES) {
    const count = recent.filter((entry) => entry === family).length;
    if (count >= 2) return family;
  }
  return undefined;
}

export function createContractOffer(
  legacy: LegacyRunView,
  state: ContractRuntimeState,
  rng: RngState,
): ContractOfferResult {
  const offerId = `contract-offer-${state.nextOfferIndex + 1}`;
  const blocked = blockedFamily(state.offerHistory);
  const remaining = FAMILIES.filter((family) => family !== blocked);
  const chosen: ContractFamily[] = [];
  let nextRng = rng;

  while (chosen.length < 3) {
    const pick = pickWeighted(
      remaining
        .filter((family) => !chosen.includes(family))
        .map((family) => ({ value: family, weight: familyWeight(family, legacy) })),
      nextRng,
    );
    chosen.push(pick.value);
    nextRng = pick.state;
  }

  const options = chosen.map((family) => contractShape(family, legacy, offerId)) as unknown as readonly [ContractOption, ContractOption, ContractOption];
  const offer: ContractOffer = { offerId, generatedAtMs: legacy.elapsedMs, options };
  return {
    offer,
    rng: nextRng,
    state: {
      ...state,
      nextOfferIndex: state.nextOfferIndex + 1,
      pendingOffer: offer,
    },
  };
}

export function acceptContract(
  state: ContractRuntimeState,
  optionId: string,
  startedAtMs: number,
  guardianCoreHp: number,
): ContractRuntimeState {
  const offer = state.pendingOffer;
  if (!offer) throw new Error('No pending contract offer');
  const option = offer.options.find((entry) => entry.optionId === optionId);
  if (!option) throw new Error(`Unknown contract option: ${optionId}`);
  return {
    ...state,
    pendingOffer: undefined,
    offerHistory: [...state.offerHistory, option.family].slice(-12),
    active: {
      contractId: option.optionId,
      family: option.family,
      startedAtMs,
      deadlineMs: startedAtMs + option.durationMs,
      target: option.target,
      progress: 0,
      baselineCoreHp: guardianCoreHp,
    },
  };
}

function rewardFor(family: ContractFamily): Effect {
  switch (family) {
    case 'slayer': return { type: 'contract_reward', xpMultiplier: 1.12, masteryMultiplier: 1.08 };
    case 'warden': return { type: 'contract_reward', shieldPercent: 0.15, potionEfficiency: 1.1 };
    case 'arcane': return { type: 'contract_reward', fusionPowerMultiplier: 1.1, cooldownMultiplier: 0.92 };
    case 'hunter': return { type: 'contract_reward', goldMultiplier: 1.15, bossDamageMultiplier: 1.08 };
    case 'survivor': return { type: 'contract_reward', shieldPercent: 0.1, potionEfficiency: 1.15 };
  }
}

function failContract(state: ContractRuntimeState, family: ContractFamily): ContractAdvanceResult {
  return {
    state: { ...state, active: undefined, failedCount: state.failedCount + 1 },
    effects: [{ type: 'contract_failed', family }],
  };
}

function completeContract(state: ContractRuntimeState, family: ContractFamily, completedAtMs: number): ContractAdvanceResult {
  return {
    state: { ...state, active: undefined, completedCount: state.completedCount + 1, boons: [...state.boons, { family, expiresAtMs: completedAtMs + 90_000 }].slice(-4) },
    effects: [rewardFor(family)],
  };
}

export function advanceContract(
  state: ContractRuntimeState,
  legacy: LegacyRunView,
  events: readonly GameplayEvent[],
  deltaMs: number,
): ContractAdvanceResult {
  const working: ContractRuntimeState = { ...state, boons: state.boons.filter((boon) => boon.expiresAtMs > legacy.elapsedMs) };
  const active = working.active;
  if (!active) return { state: working, effects: [] };

  if (active.family === 'survivor' && events.some((event) => event.type === 'hero_damaged')) {
    return failContract(working, active.family);
  }

  if (active.family === 'warden') {
    const allowedLoss = Math.max(1, active.baselineCoreHp * 0.2);
    if (active.baselineCoreHp - legacy.guardianCoreHp > allowedLoss) return failContract(working, active.family);
  }

  let increment = 0;
  for (const event of events) {
    if (active.family === 'slayer' && event.type === 'enemy_killed') increment += 1;
    if (active.family === 'arcane' && event.type === 'spell_cast') increment += event.fusion ? 2 : 1;
    if (active.family === 'hunter' && event.type === 'enemy_killed' && event.elite) increment += 1;
    if (active.family === 'hunter' && event.type === 'boss_defeated') increment += 3;
  }
  if (active.family === 'survivor' || active.family === 'warden') increment += Math.max(0, deltaMs);

  const progress = clamp(active.progress + increment, 0, active.target);
  const next: ContractRuntimeState = { ...working, active: { ...active, progress } };
  if (progress >= active.target) return completeContract(next, active.family, legacy.elapsedMs);
  if (legacy.elapsedMs >= active.deadlineMs) return failContract(next, active.family);
  return { state: next, effects: [] };
}


const CONTRACT_HUD_LABELS:Record<ContractFamily,string>={slayer:'SLAYER',warden:'WARDEN',arcane:'ARCANE',hunter:'HUNTER',survivor:'SURVIVOR'};

export function contractHudLine(state:ContractRuntimeState):string{
  const active=state.active;if(!active)return'';
  const label=CONTRACT_HUD_LABELS[active.family];
  if(active.family==='warden'||active.family==='survivor')return `CONTRACT · ${label} ${Math.min(Math.floor(active.target/1000),Math.floor(active.progress/1000))}/${Math.floor(active.target/1000)}s`;
  return `CONTRACT · ${label} ${Math.min(active.target,Math.floor(active.progress))}/${active.target}`;
}


export interface ContractModifiers {
  xpMultiplier: number;
  masteryMultiplier: number;
  goldMultiplier: number;
  coreDamageTakenMultiplier: number;
  cooldownMultiplier: number;
  bossDamageMultiplier: number;
  fusionPowerMultiplier: number;
  potionEfficiency: number;
}

export function getContractModifiers(state: ContractRuntimeState, elapsedMs: number): ContractModifiers {
  const out: ContractModifiers = { xpMultiplier: 1, masteryMultiplier: 1, goldMultiplier: 1, coreDamageTakenMultiplier: 1, cooldownMultiplier: 1, bossDamageMultiplier: 1, fusionPowerMultiplier: 1, potionEfficiency: 1 };
  for (const boon of state.boons) {
    if (boon.expiresAtMs <= elapsedMs) continue;
    if (boon.family === 'slayer') { out.xpMultiplier *= 1.12; out.masteryMultiplier *= 1.08; }
    else if (boon.family === 'warden') { out.coreDamageTakenMultiplier *= 0.88; out.potionEfficiency *= 1.1; }
    else if (boon.family === 'arcane') { out.fusionPowerMultiplier *= 1.1; out.cooldownMultiplier *= 0.92; }
    else if (boon.family === 'hunter') { out.goldMultiplier *= 1.15; out.bossDamageMultiplier *= 1.08; }
    else if (boon.family === 'survivor') { out.coreDamageTakenMultiplier *= 0.92; out.potionEfficiency *= 1.15; }
  }
  return {
    xpMultiplier: clamp(out.xpMultiplier, 1, 1.3), masteryMultiplier: clamp(out.masteryMultiplier, 1, 1.25), goldMultiplier: clamp(out.goldMultiplier, 1, 1.35),
    coreDamageTakenMultiplier: clamp(out.coreDamageTakenMultiplier, 0.72, 1), cooldownMultiplier: clamp(out.cooldownMultiplier, 0.8, 1), bossDamageMultiplier: clamp(out.bossDamageMultiplier, 1, 1.2),
    fusionPowerMultiplier: clamp(out.fusionPowerMultiplier, 1, 1.25), potionEfficiency: clamp(out.potionEfficiency, 1, 1.35),
  };
}
