import { composeFateModifiers, fateCheckpointIndex, type FateModifiers, type FatePathId } from './fate-paths.js';

export class FateRuntime {
  private selected: FatePathId[] = [];
  private isPending = false;

  get pending(): boolean { return this.isPending; }
  get choices(): readonly FatePathId[] { return this.selected; }
  get modifiers(): FateModifiers { return composeFateModifiers(this.selected); }

  update(elapsed: number): boolean {
    if (this.isPending || this.selected.length >= 3) return false;
    if (fateCheckpointIndex(elapsed, this.selected.length) < 0) return false;
    this.isPending = true;
    return true;
  }

  choose(id: FatePathId): boolean {
    if (!this.isPending || this.selected.length >= 3) return false;
    this.selected.push(id);
    this.isPending = false;
    return true;
  }

  restore(ids: readonly FatePathId[]): void {
    this.selected = ids.slice(0, 3);
    this.isPending = false;
  }

  reset(): void {
    this.selected = [];
    this.isPending = false;
  }
}
