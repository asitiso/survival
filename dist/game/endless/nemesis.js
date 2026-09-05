import { clamp } from '../../core/math.js';
const ORDER = ['core_siege', 'enrage_clock', 'blink_hunt', 'spell_guard', 'mirror_affinity'];
export function createDefaultNemesisState() {
    return { profiles: {} };
}
function emptyProfile(bossId) {
    return {
        bossId,
        encounters: 0,
        marks: { spell_guard: 0, blink_hunt: 0, core_siege: 0, enrage_clock: 0, mirror_affinity: 0 },
        affinityTotals: {},
        mirrorAffinity: undefined,
        longestEncounterMs: 0,
        totalCoreDamage: 0,
        defeats: 0,
    };
}
function highestAffinity(totals) {
    let best;
    let bestValue = -1;
    for (const [affinity, raw] of Object.entries(totals).sort(([a], [b]) => a.localeCompare(b))) {
        const value = Number.isFinite(raw) ? Math.max(0, raw) : 0;
        if (value > bestValue) {
            best = affinity;
            bestValue = value;
        }
    }
    return bestValue > 0 ? best : undefined;
}
export function recordBossEncounter(state, summary) {
    const previous = state.profiles[summary.bossId] ?? emptyProfile(summary.bossId);
    const marks = { ...previous.marks };
    if (summary.durationMs >= 45_000)
        marks.spell_guard += 1;
    if (summary.durationMs >= 75_000)
        marks.enrage_clock += 1;
    if (summary.coreDamage >= 150)
        marks.core_siege += 1;
    if (summary.heroDefeated)
        marks.blink_hunt += 2;
    const affinityTotals = { ...previous.affinityTotals };
    for (const [affinity, raw] of Object.entries(summary.affinityDamage ?? {})) {
        affinityTotals[affinity] = (affinityTotals[affinity] ?? 0) + Math.max(0, Number.isFinite(raw) ? raw : 0);
    }
    const mirrorAffinity = highestAffinity(affinityTotals);
    if (mirrorAffinity)
        marks.mirror_affinity += 1;
    for (const kind of ORDER)
        marks[kind] = clamp(marks[kind], 0, 9);
    const profile = {
        bossId: summary.bossId,
        encounters: previous.encounters + 1,
        marks,
        affinityTotals,
        mirrorAffinity,
        longestEncounterMs: Math.max(previous.longestEncounterMs, Math.max(0, summary.durationMs)),
        totalCoreDamage: previous.totalCoreDamage + Math.max(0, summary.coreDamage),
        defeats: previous.defeats + (summary.heroDefeated ? 1 : 0),
    };
    const nextState = { profiles: { ...state.profiles, [summary.bossId]: profile } };
    return {
        state: nextState,
        effects: [{ type: 'nemesis_updated', bossId: summary.bossId, adaptations: getBossAdaptations(nextState, summary.bossId).map((entry) => entry.kind) }],
    };
}
export function getBossAdaptations(state, bossId) {
    const profile = state.profiles[bossId];
    if (!profile)
        return [];
    return ORDER
        .map((kind, index) => ({ kind, score: profile.marks[kind], index }))
        .filter((entry) => entry.score > 0)
        .sort((a, b) => b.score - a.score || a.index - b.index)
        .slice(0, 3)
        .map((entry) => {
        const base = { kind: entry.kind, rank: Math.min(3, Math.ceil(entry.score / 2)) };
        if (entry.kind === 'mirror_affinity' && profile.mirrorAffinity)
            return { ...base, affinity: profile.mirrorAffinity };
        return base;
    });
}
