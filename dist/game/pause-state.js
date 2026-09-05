export class PauseState {
    active = new Set();
    get paused() { return this.active.size > 0; }
    get reasons() { return [...this.active].sort(); }
    has(reason) { return this.active.has(reason); }
    set(reason, enabled) {
        if (enabled)
            this.active.add(reason);
        else
            this.active.delete(reason);
    }
    toggle(reason) {
        this.set(reason, !this.has(reason));
        return this.has(reason);
    }
    reset() { this.active.clear(); }
}
