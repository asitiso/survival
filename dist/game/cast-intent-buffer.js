export const CAST_INTENT_BUFFER_WINDOW_SECONDS = 0.20;
export const COMBAT_CAST_ACTIONS = [
    'spell1',
    'spell2',
    'spell3',
    'spell4',
    'ultimate1',
    'ultimate2',
];
export class CastIntentBuffer {
    queued = new Set();
    get size() {
        return this.queued.size;
    }
    request(action, cooldownRemaining) {
        if (cooldownRemaining <= 0)
            return 'ready';
        if (!Number.isFinite(cooldownRemaining) || cooldownRemaining > CAST_INTENT_BUFFER_WINDOW_SECONDS)
            return 'rejected';
        this.queued.add(action);
        return 'queued';
    }
    isQueued(action) {
        return this.queued.has(action);
    }
    consumeIfReady(action, cooldownRemaining) {
        if (cooldownRemaining > 0 || !this.queued.has(action))
            return false;
        this.queued.delete(action);
        return true;
    }
    clear() {
        this.queued.clear();
    }
}
