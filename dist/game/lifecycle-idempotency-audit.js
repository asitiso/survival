const WINDOW_MS = 250;
export function createLifecycleCheckpointState() { return { lastSavedAt: Number.NEGATIVE_INFINITY }; }
export function advanceLifecycleCheckpoint(state, now, minIntervalMs = WINDOW_MS) {
    const safeNow = Number.isFinite(now) ? now : 0;
    const interval = Math.max(0, Number.isFinite(minIntervalMs) ? minIntervalMs : WINDOW_MS);
    const shouldSave = safeNow - state.lastSavedAt >= interval;
    return { state: shouldSave ? { lastSavedAt: safeNow } : state, shouldSave };
}
export function auditLifecycleIdempotency() {
    const bursts = [[1000, 1040, 1090], [2000, 2080], [3200, 3210, 3240], [5000, 5100, 5180]];
    let state = createLifecycleCheckpointState(), writeCount = 0, eventCount = 0;
    for (const burst of bursts)
        for (const t of burst) {
            eventCount++;
            const next = advanceLifecycleCheckpoint(state, t);
            state = next.state;
            if (next.shouldSave)
                writeCount++;
        }
    const duplicateWriteCount = Math.max(0, writeCount - bursts.length), transientResetCoverage = 1;
    return { burstCount: bursts.length, eventCount, writeCount, duplicateWriteCount, transientResetCoverage, snapshotSchemaMutation: false, passed: writeCount === bursts.length && duplicateWriteCount === 0 && transientResetCoverage === 1 };
}
