import { MAX_FUSIONS_PER_RUN, type FusionId } from './spell-fusions.js';

const TRIGGER_COOLDOWN = 1;

export class FusionRuntime {
  private ids: FusionId[] = [];
  private cooldowns = new Map<FusionId, number>();

  get equipped(): readonly FusionId[] { return this.ids; }

  equip(id: FusionId): boolean {
    if (this.ids.includes(id) || this.ids.length >= MAX_FUSIONS_PER_RUN) return false;
    this.ids.push(id);
    return true;
  }

  has(id: FusionId): boolean { return this.ids.includes(id); }

  update(dt: number): void {
    if (dt <= 0) return;
    for (const [id, value] of this.cooldowns) {
      const next = Math.max(0, value - dt);
      if (next <= 0) this.cooldowns.delete(id);
      else this.cooldowns.set(id, next);
    }
  }

  tryTrigger(id: FusionId): boolean {
    if (!this.ids.includes(id)) return false;
    if ((this.cooldowns.get(id) ?? 0) > 0) return false;
    this.cooldowns.set(id, TRIGGER_COOLDOWN);
    return true;
  }

  restore(ids: readonly FusionId[]): void {
    this.ids = [];
    this.cooldowns.clear();
    for (const id of ids.slice(0, MAX_FUSIONS_PER_RUN)) this.equip(id);
  }

  reset(): void {
    this.ids = [];
    this.cooldowns.clear();
  }
}
