const MILESTONES = [90, 180, 300, 480, 720];
export function createDefaultRunCheckpointState() {
    return { reachedMilestones: [] };
}
export function sanitizeRunCheckpointState(value) {
    const raw = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const reached = [];
    if (Array.isArray(raw.reachedMilestones)) {
        for (const item of raw.reachedMilestones) {
            if (MILESTONES.includes(item) && !reached.includes(item))
                reached.push(item);
        }
    }
    reached.sort((a, b) => a - b);
    return { reachedMilestones: reached.slice(0, MILESTONES.length) };
}
export function advanceRunCheckpoints(state, elapsedMs) {
    const safe = sanitizeRunCheckpointState(state);
    const elapsedMinutes = Math.max(0, elapsedMs) / 60_000;
    const crossed = MILESTONES.filter((minute) => minute <= elapsedMinutes && !safe.reachedMilestones.includes(minute));
    if (crossed.length === 0)
        return { state: safe, reached: null };
    const reachedMilestones = [...safe.reachedMilestones, ...crossed].sort((a, b) => a - b);
    const minute = crossed[crossed.length - 1];
    return { state: { reachedMilestones }, reached: { minute, title: `CHECKPOINT ${minute}분` } };
}
