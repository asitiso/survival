const MILESTONES = [120, 240, 360, 480, 720];
export function createDefaultRunMilestoneRecapState() { return { reachedMilestones: [], lastKills: 0, lastBosses: 0 }; }
export function sanitizeRunMilestoneRecapState(value) {
    const raw = value && typeof value === 'object' && !Array.isArray(value) ? value : {};
    const reached = [];
    if (Array.isArray(raw.reachedMilestones))
        for (const item of raw.reachedMilestones) {
            if (MILESTONES.includes(item) && !reached.includes(item))
                reached.push(item);
        }
    reached.sort((a, b) => a - b);
    const safe = (n) => Number.isFinite(Number(n)) ? Math.max(0, Math.floor(Number(n))) : 0;
    return { reachedMilestones: reached, lastKills: safe(raw.lastKills), lastBosses: safe(raw.lastBosses) };
}
function headline(killsDelta, bossesDelta, minutes) {
    const killRate = killsDelta / Math.max(1, minutes);
    if (bossesDelta >= 8)
        return '보스 압박 돌파';
    if (killRate >= 45)
        return '화력 유지';
    if (bossesDelta >= 4)
        return '안정적 보스 사냥';
    return '장기 생존 유지';
}
export function advanceRunMilestoneRecap(state, view) {
    const safe = sanitizeRunMilestoneRecapState(state);
    const elapsedMinutes = Math.max(0, view.elapsedMs) / 60_000;
    const crossed = MILESTONES.filter((minute) => minute <= elapsedMinutes && !safe.reachedMilestones.includes(minute));
    if (crossed.length === 0)
        return { state: safe, reached: null };
    const minute = crossed[crossed.length - 1];
    const previousMinute = safe.reachedMilestones[safe.reachedMilestones.length - 1] ?? 0;
    const kills = Math.max(0, Math.floor(view.kills));
    const bosses = Math.max(0, Math.floor(view.bossesDefeated));
    const killsDelta = Math.max(0, kills - safe.lastKills);
    const bossesDelta = Math.max(0, bosses - safe.lastBosses);
    return {
        state: { reachedMilestones: [...safe.reachedMilestones, ...crossed].sort((a, b) => a - b), lastKills: kills, lastBosses: bosses },
        reached: { minute, title: `RUN RECAP ${minute}분`, headline: headline(killsDelta, bossesDelta, minute - previousMinute), killsDelta, bossesDelta },
    };
}
