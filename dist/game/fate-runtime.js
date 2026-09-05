import { composeFateModifiers, fateCheckpointIndex } from './fate-paths.js';
export class FateRuntime {
    selected = [];
    isPending = false;
    get pending() { return this.isPending; }
    get choices() { return this.selected; }
    get modifiers() { return composeFateModifiers(this.selected); }
    update(elapsed) {
        if (this.isPending || this.selected.length >= 3)
            return false;
        if (fateCheckpointIndex(elapsed, this.selected.length) < 0)
            return false;
        this.isPending = true;
        return true;
    }
    choose(id) {
        if (!this.isPending || this.selected.length >= 3)
            return false;
        this.selected.push(id);
        this.isPending = false;
        return true;
    }
    restore(ids) {
        this.selected = ids.slice(0, 3);
        this.isPending = false;
    }
    reset() {
        this.selected = [];
        this.isPending = false;
    }
}
