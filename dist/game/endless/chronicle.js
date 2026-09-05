const MILESTONES = [
    { id: 'forty-five', minute: 45, title: '장기전 돌입', rewardGold: 280, coreHealPercent: .05 },
    { id: 'hour-one', minute: 60, title: '첫 시간의 증명', rewardGold: 420, coreHealPercent: .06 },
    { id: 'ninety', minute: 90, title: '끝없는 밤', rewardGold: 650, coreHealPercent: .07 },
    { id: 'hour-two', minute: 120, title: '두 시간의 성채', rewardGold: 900, coreHealPercent: .08 },
    { id: 'hour-three', minute: 180, title: '불멸의 방벽', rewardGold: 1400, coreHealPercent: .10 },
];
export function createDefaultChronicleState() { return { milestones: [] }; }
export function advanceChronicle(elapsedMs, state) {
    const minute = Math.max(0, elapsedMs) / 60_000;
    const unlocked = MILESTONES.filter((entry) => entry.minute <= minute && !state.milestones.includes(entry.id));
    if (unlocked.length === 0)
        return { state, unlocked: [] };
    return { state: { milestones: [...state.milestones, ...unlocked.map((entry) => entry.id)].slice(0, MILESTONES.length) }, unlocked };
}
export function chronicleSummary(state, limit = 3) {
    const selected = MILESTONES.filter((entry) => state.milestones.includes(entry.id)).slice(-Math.max(0, limit));
    return selected.map((entry) => `${entry.minute}분 · ${entry.title}`);
}
export function chronicleMilestones() { return MILESTONES; }
const MILESTONE_IDS = new Set(MILESTONES.map((entry) => entry.id));
export function sanitizeChronicleState(value) {
    const raw = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const milestones = Array.isArray(raw.milestones)
        ? raw.milestones.filter((id) => typeof id === 'string' && MILESTONE_IDS.has(id)).slice(0, MILESTONES.length)
        : [];
    return { milestones: [...new Set(milestones)] };
}
