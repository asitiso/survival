export type FieldEventId = 'goldenGoblin' | 'supplyDrop' | 'manaStorm' | 'goldenNight' | 'eliteRush';

export interface FieldEventSpec {
  id: FieldEventId;
  name: string;
  description: string;
  duration: number;
  accent: string;
}

export interface ActiveFieldEvent extends FieldEventSpec {
  remaining: number;
  startedAt: number;
}

export interface FieldEventTransition {
  started: ActiveFieldEvent | null;
  ended: ActiveFieldEvent | null;
}

export interface FieldEventModifiers {
  cooldownMultiplier: number;
  spawnPressureMultiplier: number;
  eliteIntervalMultiplier: number;
  goldMultiplier: number;
}

export const FIELD_EVENT_SPECS: Readonly<Record<FieldEventId, FieldEventSpec>> = {
  goldenGoblin: {
    id: 'goldenGoblin', name: '황금 고블린', description: '도망치기 전에 처치하면 대량의 금화를 얻습니다.', duration: 22, accent: '#ffd85d',
  },
  supplyDrop: {
    id: 'supplyDrop', name: '보급 상자', description: '위험한 위치에 떨어진 상자에 접근해 무료 보급품을 확보하세요.', duration: 30, accent: '#75d7ff',
  },
  manaStorm: {
    id: 'manaStorm', name: '마력 폭풍', description: '마법 쿨타임이 크게 줄지만 적도 더 거세게 밀려옵니다.', duration: 25, accent: '#b894ff',
  },
  goldenNight: {
    id: 'goldenNight', name: '황금의 밤', description: '금화가 두 배로 쏟아지고 정예 출현도 빨라집니다.', duration: 30, accent: '#f3d36b',
  },
  eliteRush: {
    id: 'eliteRush', name: '정예 습격', description: '정예병이 한꺼번에 밀려옵니다. 궁극기 타이밍을 잡으세요.', duration: 14, accent: '#ff7d69',
  },
} as const;

const EVENT_ORDER = Object.freeze(Object.keys(FIELD_EVENT_SPECS) as FieldEventId[]);
const FIRST_EVENT_AT = 75;
const MIN_BETWEEN_EVENTS = 85;
const EVENT_INTERVAL_VARIANCE = 35;
const BOSS_SAFETY_WINDOW = 12;

export function fieldEventModifiers(active: ActiveFieldEvent | null): FieldEventModifiers {
  if (!active) {
    return { cooldownMultiplier: 1, spawnPressureMultiplier: 1, eliteIntervalMultiplier: 1, goldMultiplier: 1 };
  }
  switch (active.id) {
    case 'manaStorm':
      return { cooldownMultiplier: 0.68, spawnPressureMultiplier: 1.5, eliteIntervalMultiplier: 1, goldMultiplier: 1 };
    case 'goldenNight':
      return { cooldownMultiplier: 1, spawnPressureMultiplier: 1.08, eliteIntervalMultiplier: 0.72, goldMultiplier: 2 };
    case 'eliteRush':
      return { cooldownMultiplier: 1, spawnPressureMultiplier: 1.35, eliteIntervalMultiplier: 0.42, goldMultiplier: 1 };
    default:
      return { cooldownMultiplier: 1, spawnPressureMultiplier: 1, eliteIntervalMultiplier: 1, goldMultiplier: 1 };
  }
}

export class FieldEventDirector {
  active: ActiveFieldEvent | null = null;
  private nextAt = FIRST_EVENT_AT;
  private lastEventId: FieldEventId | null = null;

  constructor(private readonly rng: () => number = Math.random) {}

  get nextEventAt(): number { return this.nextAt; }

  reset(): void {
    this.active = null;
    this.nextAt = FIRST_EVENT_AT;
    this.lastEventId = null;
  }

  update(dt: number, elapsed: number, bossCountdown: number): FieldEventTransition {
    if (this.active) {
      this.active.remaining -= Math.max(0, dt);
      if (this.active.remaining <= 0) {
        const ended = this.active;
        this.finish(ended, elapsed);
        return { started: null, ended };
      }
      return { started: null, ended: null };
    }

    if (elapsed < this.nextAt || bossCountdown <= BOSS_SAFETY_WINDOW) return { started: null, ended: null };
    const started = this.start(elapsed);
    return { started, ended: null };
  }

  completeActive(elapsed: number): ActiveFieldEvent | null {
    if (!this.active) return null;
    const ended = this.active;
    this.finish(ended, elapsed);
    return ended;
  }

  private start(elapsed: number): ActiveFieldEvent {
    let index = Math.min(EVENT_ORDER.length - 1, Math.floor(this.rng() * EVENT_ORDER.length));
    if (EVENT_ORDER[index] === this.lastEventId) index = (index + 1) % EVENT_ORDER.length;
    const spec = FIELD_EVENT_SPECS[EVENT_ORDER[index]!];
    this.active = { ...spec, remaining: spec.duration, startedAt: elapsed };
    return this.active;
  }

  private finish(event: ActiveFieldEvent, elapsed: number): void {
    this.lastEventId = event.id;
    this.active = null;
    const delay = MIN_BETWEEN_EVENTS + Math.max(0, Math.min(1, this.rng())) * EVENT_INTERVAL_VARIANCE;
    this.nextAt = elapsed + delay;
  }
}

export function fieldEventArenaPosition(rng: () => number = Math.random): { x: number; y: number } {
  const rx = Math.max(0, Math.min(1, rng()));
  const ry = Math.max(0, Math.min(1, rng()));
  return { x: 250 + rx * 1100, y: 180 + ry * 580 };
}

export function eliteRushCount(danger: number): number {
  return Math.min(12, 6 + Math.floor(Math.max(0, danger - 1) / 2));
}
