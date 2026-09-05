import { distance, type Vec2 } from '../core/math.js';
import type { BattlefieldObjectiveId } from './battlefield-objectives.js';
import { advanceBeaconDefense, advanceCursedAltar, advanceRiftSeal } from './objective-rules.js';

export type ObjectiveReward =
  | { kind: 'gold'; amount: number }
  | { kind: 'shopToken'; amount: number }
  | { kind: 'potion'; amount: number }
  | { kind: 'temporaryPower'; amount: number };

export interface ObjectiveRunStats {
  completed: number;
  failed: number;
  currentStreak: number;
  bestStreak: number;
}

interface RuntimeBase { id: BattlefieldObjectiveId; pos: Vec2; }
interface RiftRuntime extends RuntimeBase { id: 'riftSeal'; progress: number; }
interface BeaconRuntime extends RuntimeBase { id: 'beaconDefense'; hp: number; timeLeft: number; }
interface AltarRuntime extends RuntimeBase { id: 'cursedAltar'; activated: boolean; timeLeft: number; }
export type ActiveObjectiveRuntime = RiftRuntime | BeaconRuntime | AltarRuntime;

export interface ObjectiveRuntimeSnapshot {
  hero: Vec2;
  nearbyEnemies: number;
}

export interface ObjectiveRuntimeTransition {
  completed: boolean;
  failed: boolean;
  rewards: ObjectiveReward[];
  id: BattlefieldObjectiveId | null;
}

export function objectiveRewardFor(id: BattlefieldObjectiveId, streak: number): ObjectiveReward[] {
  const safeStreak = Math.max(1, Math.floor(streak));
  if (id === 'riftSeal') return safeStreak % 2 === 0 ? [{ kind: 'shopToken', amount: 1 }] : [{ kind: 'gold', amount: 120 }];
  if (id === 'beaconDefense') return safeStreak % 2 === 0 ? [{ kind: 'shopToken', amount: 1 }] : [{ kind: 'potion', amount: 1 }];
  return [{ kind: 'gold', amount: 180 }, { kind: 'temporaryPower', amount: 20 }];
}

export class ObjectiveRuntime {
  active: ActiveObjectiveRuntime | null = null;
  readonly stats: ObjectiveRunStats = { completed: 0, failed: 0, currentStreak: 0, bestStreak: 0 };

  reset(): void {
    this.active = null;
    this.stats.completed = 0;
    this.stats.failed = 0;
    this.stats.currentStreak = 0;
    this.stats.bestStreak = 0;
  }

  begin(id: BattlefieldObjectiveId, pos: Vec2): void {
    if (id === 'riftSeal') this.active = { id, pos: { ...pos }, progress: 0 };
    else if (id === 'beaconDefense') this.active = { id, pos: { ...pos }, hp: 100, timeLeft: 28 };
    else this.active = { id, pos: { ...pos }, activated: false, timeLeft: 22 };
  }

  activateAltar(): void {
    if (this.active?.id === 'cursedAltar') this.active.activated = true;
  }

  failActive(): ObjectiveRuntimeTransition {
    if (!this.active) return { completed: false, failed: false, rewards: [], id: null };
    const id = this.active.id;
    this.active = null;
    this.stats.failed += 1;
    this.stats.currentStreak = 0;
    return { completed: false, failed: true, rewards: [], id };
  }

  update(dt: number, snapshot: ObjectiveRuntimeSnapshot): ObjectiveRuntimeTransition {
    if (!this.active) return { completed: false, failed: false, rewards: [], id: null };
    const active = this.active;
    const inside = distance(snapshot.hero, active.pos) <= (active.id === 'beaconDefense' ? 115 : 92);

    if (active.id === 'riftSeal') {
      const next = advanceRiftSeal({ progress: active.progress }, dt, inside, snapshot.nearbyEnemies);
      active.progress = next.progress;
      if (next.complete) return this.complete(active.id);
      return { completed: false, failed: false, rewards: [], id: active.id };
    }

    if (active.id === 'beaconDefense') {
      const next = advanceBeaconDefense({ hp: active.hp, timeLeft: active.timeLeft }, dt, snapshot.nearbyEnemies);
      active.hp = next.hp;
      active.timeLeft = next.timeLeft;
      if (next.failed) return this.failActive();
      if (next.complete) return this.complete(active.id);
      return { completed: false, failed: false, rewards: [], id: active.id };
    }

    if (!active.activated && inside) active.activated = true;
    const next = advanceCursedAltar({ activated: active.activated, timeLeft: active.timeLeft }, dt);
    active.activated = next.activated;
    active.timeLeft = next.timeLeft;
    if (next.complete) return this.complete(active.id);
    return { completed: false, failed: false, rewards: [], id: active.id };
  }

  private complete(id: BattlefieldObjectiveId): ObjectiveRuntimeTransition {
    this.active = null;
    this.stats.completed += 1;
    this.stats.currentStreak += 1;
    this.stats.bestStreak = Math.max(this.stats.bestStreak, this.stats.currentStreak);
    return { completed: true, failed: false, rewards: objectiveRewardFor(id, this.stats.currentStreak), id };
  }
}
