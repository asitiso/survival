export type BattlefieldObjectiveId = 'riftSeal' | 'beaconDefense' | 'cursedAltar';

export interface BattlefieldObjectiveDefinition {
  id: BattlefieldObjectiveId;
  name: string;
  description: string;
  duration: number;
  accent: string;
}

export interface ActiveBattlefieldObjective extends BattlefieldObjectiveDefinition {
  startedAt: number;
  remaining: number;
}

export interface ObjectiveTransition {
  started: ActiveBattlefieldObjective | null;
  ended: ActiveBattlefieldObjective | null;
}

const DEFINITIONS: Record<BattlefieldObjectiveId, BattlefieldObjectiveDefinition> = {
  riftSeal: { id: 'riftSeal', name: '균열 봉인', description: '룬 안에 머물러 균열을 닫으세요.', duration: 34, accent: '#9b8cff' },
  beaconDefense: { id: 'beaconDefense', name: '비콘 방어', description: '마력 비콘을 끝까지 지키세요.', duration: 28, accent: '#75d7ff' },
  cursedAltar: { id: 'cursedAltar', name: '저주 제단', description: '저주를 받아들이고 폭주를 버티세요.', duration: 22, accent: '#ff6f91' },
};

const IDS = Object.keys(DEFINITIONS) as BattlefieldObjectiveId[];

export function objectiveDefinition(id: BattlefieldObjectiveId): BattlefieldObjectiveDefinition {
  return DEFINITIONS[id];
}

export class BattlefieldObjectiveDirector {
  active: ActiveBattlefieldObjective | null = null;
  nextObjectiveAt = 150;
  private lastId: BattlefieldObjectiveId | null = null;

  constructor(private readonly rng: () => number = Math.random) {}

  reset(): void {
    this.active = null;
    this.nextObjectiveAt = 150;
    this.lastId = null;
  }

  update(dt: number, elapsed: number, bossCountdown: number): ObjectiveTransition {
    const transition: ObjectiveTransition = { started: null, ended: null };
    if (this.active) {
      this.active.remaining = Math.max(0, this.active.remaining - Math.max(0, dt));
      if (this.active.remaining <= 0) {
        transition.ended = { ...this.active };
        this.finish(elapsed);
      }
      return transition;
    }

    if (elapsed < this.nextObjectiveAt || (bossCountdown > 0 && bossCountdown <= 12)) return transition;
    const candidates = IDS.filter((id) => id !== this.lastId);
    const roll = Math.max(0, Math.min(0.999999, this.rng()));
    const id = candidates[Math.floor(roll * candidates.length)] ?? candidates[0] ?? 'riftSeal';
    const def = objectiveDefinition(id);
    this.active = { ...def, startedAt: elapsed, remaining: def.duration };
    transition.started = { ...this.active };
    return transition;
  }

  completeActive(elapsed: number): ActiveBattlefieldObjective | null {
    if (!this.active) return null;
    const completed = { ...this.active };
    this.finish(elapsed);
    return completed;
  }

  private finish(elapsed: number): void {
    if (this.active) this.lastId = this.active.id;
    this.active = null;
    const roll = Math.max(0, Math.min(1, this.rng()));
    this.nextObjectiveAt = elapsed + 85 + roll * 30;
  }
}
