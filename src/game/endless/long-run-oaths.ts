import { clamp } from '../../core/math.js';
import type { Effect, GameplayEvent, LegacyRunView } from './types.js';

export type LongRunOathKind = 'slayer' | 'elite_hunt' | 'boss_hunt' | 'arcane_flow' | 'core_guard' | 'endure';
export type LongRunOathBoonKind = 'prosperity' | 'power' | 'guard' | 'boss';

export interface ActiveLongRunOath {
  id: string;
  milestone: number;
  kind: LongRunOathKind;
  title: string;
  startedAtMs: number;
  deadlineMs: number;
  target: number;
  progress: number;
  baselineCoreHp: number;
  coreDamage: number;
}

export interface LongRunOathBoon {
  kind: LongRunOathBoonKind;
  expiresAtMs: number;
}

export interface LongRunOathState {
  completedMilestones: number[];
  failedMilestones: number[];
  expiredMilestones: number[];
  history: LongRunOathKind[];
  active: ActiveLongRunOath | null;
  boon: LongRunOathBoon | null;
}

export interface LongRunOathModifiers {
  goldMultiplier: number;
  spellPowerMultiplier: number;
  coreDamageTakenMultiplier: number;
  bossDamageMultiplier: number;
}

export interface AdvanceLongRunOathResult { state: LongRunOathState; effects: Effect[]; }

export const LONG_RUN_OATH_MILESTONES = [120,150,180,240,300,360] as const;
const KINDS: LongRunOathKind[] = ['slayer','elite_hunt','boss_hunt','arcane_flow','core_guard','endure'];
const TITLES: Record<LongRunOathKind,string> = {
  slayer:'소탕 서약', elite_hunt:'정예 사냥 서약', boss_hunt:'군주 사냥 서약', arcane_flow:'영창 서약', core_guard:'수호 서약', endure:'불굴 서약',
};

export function createDefaultLongRunOathState(): LongRunOathState {
  return { completedMilestones:[], failedMilestones:[], expiredMilestones:[], history:[], active:null, boon:null };
}

function isResolved(state: LongRunOathState, milestone: number): boolean {
  return state.completedMilestones.includes(milestone) || state.failedMilestones.includes(milestone) || state.expiredMilestones.includes(milestone);
}

function selectKind(milestone: number, seed: number, history: readonly LongRunOathKind[]): LongRunOathKind {
  const index = LONG_RUN_OATH_MILESTONES.indexOf(milestone as (typeof LONG_RUN_OATH_MILESTONES)[number]);
  const start = Math.abs((seed >>> 0) + Math.max(0,index) * 7) % KINDS.length;
  const recent = history.slice(-2);
  for (let offset=0; offset<KINDS.length; offset += 1) {
    const kind = KINDS[(start + offset) % KINDS.length]!;
    if (!recent.includes(kind)) return kind;
  }
  return KINDS[start]!;
}

function targetFor(kind: LongRunOathKind, milestone: number): number {
  if (kind === 'slayer') return Math.min(420, 140 + Math.floor(milestone / 2));
  if (kind === 'elite_hunt') return Math.min(40, 12 + Math.floor(milestone / 18));
  if (kind === 'boss_hunt') return milestone >= 300 ? 3 : 2;
  if (kind === 'arcane_flow') return Math.min(180, 70 + Math.floor(milestone / 4));
  if (kind === 'core_guard') return 240_000;
  return 300_000;
}

function deadlineFor(kind: LongRunOathKind, milestone: number): number {
  const start = milestone * 60_000;
  if (kind === 'core_guard') return start + 240_000;
  if (kind === 'endure') return start + 300_000;
  const next = LONG_RUN_OATH_MILESTONES.find((minute) => minute > milestone);
  return (next ?? milestone + 60) * 60_000;
}

function createActive(milestone: number, seed: number, history: readonly LongRunOathKind[], coreHp: number): ActiveLongRunOath {
  const kind = selectKind(milestone, seed, history);
  return {
    id:`oath-${milestone}-${kind}`,
    milestone,
    kind,
    title:TITLES[kind],
    startedAtMs:milestone * 60_000,
    deadlineMs:deadlineFor(kind,milestone),
    target:targetFor(kind,milestone),
    progress:0,
    baselineCoreHp:Math.max(1,coreHp),
    coreDamage:0,
  };
}

function eventProgress(kind: LongRunOathKind, event: GameplayEvent): number {
  if (kind === 'slayer' && event.type === 'enemy_killed') return 1;
  if (kind === 'elite_hunt' && event.type === 'enemy_killed' && event.elite) return 1;
  if (kind === 'boss_hunt' && event.type === 'boss_defeated') return 1;
  if (kind === 'arcane_flow' && event.type === 'spell_cast') return event.fusion ? 2 : 1;
  return 0;
}

function boonFor(kind: LongRunOathKind): LongRunOathBoonKind {
  if (kind === 'slayer' || kind === 'arcane_flow') return 'power';
  if (kind === 'elite_hunt') return 'prosperity';
  if (kind === 'boss_hunt') return 'boss';
  return 'guard';
}

function rewardFor(milestone: number): { gold:number; heal:number } {
  return { gold:Math.min(2400, 450 + milestone * 4), heal:clamp(.06 + milestone / 6000, .06, .12) };
}

function cloneState(state: LongRunOathState): LongRunOathState {
  return {
    completedMilestones:[...state.completedMilestones], failedMilestones:[...state.failedMilestones], expiredMilestones:[...state.expiredMilestones], history:[...state.history],
    active:state.active ? { ...state.active } : null,
    boon:state.boon ? { ...state.boon } : null,
  };
}

function markOlderSkipped(state: LongRunOathState, milestone: number): void {
  for (const old of LONG_RUN_OATH_MILESTONES) {
    if (old >= milestone) break;
    if (!isResolved(state,old)) state.expiredMilestones.push(old);
  }
}

function startLatestEligible(state: LongRunOathState, legacy: LegacyRunView, seed: number, effects: Effect[]): void {
  if (state.active) return;
  const reached = LONG_RUN_OATH_MILESTONES.filter((minute) => legacy.elapsedMs >= minute * 60_000 && !isResolved(state,minute));
  const milestone = reached.at(-1);
  if (milestone === undefined) return;
  markOlderSkipped(state,milestone);
  const active = createActive(milestone,seed,state.history,legacy.guardianCoreHp);
  state.active = active;
  state.history = [...state.history,active.kind].slice(-6);
  effects.push({ type:'oath_started', milestone, title:active.title, target:active.target });
}

export function advanceLongRunOaths(
  inputState: LongRunOathState,
  legacy: LegacyRunView,
  events: readonly GameplayEvent[],
  deltaMs: number,
  seed: number,
): AdvanceLongRunOathResult {
  const state = cloneState(inputState);
  const effects: Effect[] = [];
  const now = Math.max(0,legacy.elapsedMs);
  if (state.boon && state.boon.expiresAtMs <= now) state.boon = null;

  if (state.active) {
    markOlderSkipped(state,state.active.milestone);
    const active = { ...state.active };
    for (const event of events) {
      active.progress += eventProgress(active.kind,event);
      if (event.type === 'core_damaged') active.coreDamage += Math.max(0,event.amount);
    }
    if (active.kind === 'core_guard' || active.kind === 'endure') active.progress += Math.max(0,deltaMs);
    state.active = active;

    const coreFailed = active.kind === 'core_guard' && active.coreDamage > active.baselineCoreHp * .12;
    const timedFailed = (active.kind === 'core_guard' || active.kind === 'endure') && now > active.deadlineMs && active.progress < active.target;
    const nonTimedExpired = active.kind !== 'core_guard' && active.kind !== 'endure' && now >= active.deadlineMs && active.progress < active.target;
    const completed = active.progress >= active.target;

    if (completed) {
      state.active = null;
      if (!state.completedMilestones.includes(active.milestone)) state.completedMilestones.push(active.milestone);
      const reward = rewardFor(active.milestone);
      state.boon = { kind:boonFor(active.kind), expiresAtMs:now + 90_000 };
      effects.push({ type:'oath_completed', milestone:active.milestone, title:active.title, rewardGold:reward.gold, coreHealPercent:reward.heal });
    } else if (coreFailed || timedFailed) {
      state.active = null;
      if (!state.failedMilestones.includes(active.milestone)) state.failedMilestones.push(active.milestone);
      effects.push({ type:'oath_failed', milestone:active.milestone, title:active.title });
    } else if (nonTimedExpired) {
      state.active = null;
      if (!state.expiredMilestones.includes(active.milestone)) state.expiredMilestones.push(active.milestone);
      effects.push({ type:'oath_expired', milestone:active.milestone, title:active.title });
    }
  }

  startLatestEligible(state,legacy,seed,effects);
  return { state,effects };
}

export function longRunOathModifiers(state: LongRunOathState, elapsedMs: number): LongRunOathModifiers {
  const boon = state.boon && state.boon.expiresAtMs > Math.max(0,elapsedMs) ? state.boon.kind : null;
  const out:LongRunOathModifiers={goldMultiplier:1,spellPowerMultiplier:1,coreDamageTakenMultiplier:1,bossDamageMultiplier:1};
  if (boon === 'prosperity') out.goldMultiplier=1.16;
  else if (boon === 'power') out.spellPowerMultiplier=1.09;
  else if (boon === 'guard') out.coreDamageTakenMultiplier=.88;
  else if (boon === 'boss') out.bossDamageMultiplier=1.1;
  return {
    goldMultiplier:clamp(out.goldMultiplier,1,1.18), spellPowerMultiplier:clamp(out.spellPowerMultiplier,1,1.1),
    coreDamageTakenMultiplier:clamp(out.coreDamageTakenMultiplier,.86,1), bossDamageMultiplier:clamp(out.bossDamageMultiplier,1,1.1),
  };
}

export function oathHudLine(state: LongRunOathState, _elapsedMs: number): string {
  const active=state.active;
  if (!active) return '';
  if (active.kind === 'core_guard' || active.kind === 'endure') {
    return `서약 · ${active.title} ${Math.min(active.target,Math.floor(active.progress/1000))}/${Math.floor(active.target/1000)}s`;
  }
  return `서약 · ${active.title} ${Math.min(active.target,Math.floor(active.progress))}/${active.target}`;
}
