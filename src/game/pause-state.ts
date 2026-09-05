export type ExternalPauseReason = 'manual' | 'visibility';

export class PauseState {
  private readonly active = new Set<ExternalPauseReason>();

  get paused(): boolean { return this.active.size > 0; }
  get reasons(): ExternalPauseReason[] { return [...this.active].sort(); }

  has(reason: ExternalPauseReason): boolean { return this.active.has(reason); }

  set(reason: ExternalPauseReason, enabled: boolean): void {
    if (enabled) this.active.add(reason);
    else this.active.delete(reason);
  }

  toggle(reason: ExternalPauseReason): boolean {
    this.set(reason, !this.has(reason));
    return this.has(reason);
  }

  reset(): void { this.active.clear(); }
}
