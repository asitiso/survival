import { clampThreatLevel } from './threat-level.js';
import { decodeBuildCapsule } from './build-capsule.js';
const KEY = 'arcane-last-stand.run-records';
function safeInt(value) { return Math.max(0, Math.floor(Number.isFinite(value) ? value : 0)); }
function key(heroId, mapId, threatLevel) { return `${heroId}|${mapId}|${clampThreatLevel(threatLevel)}`; }
export function calculateRunScore(input) {
    const seconds = safeInt(input.seconds);
    const kills = safeInt(input.kills);
    const bosses = safeInt(input.bosses);
    const danger = Math.max(1, safeInt(input.danger));
    const threat = clampThreatLevel(input.threatLevel);
    const tacticalBonus = Math.min(12000, safeInt(input.tacticalBonus ?? 0));
    return seconds * 3 + kills * 2 + bosses * 950 + Math.max(0, danger - 1) * 180 + threat * 700 + tacticalBonus;
}
export function defaultRunRecords() { return { version: 1, bests: {}, recent: [] }; }
function summary(input) {
    const clean = {
        heroId: input.heroId,
        mapId: input.mapId,
        threatLevel: clampThreatLevel(input.threatLevel),
        seconds: safeInt(input.seconds),
        kills: safeInt(input.kills),
        bosses: safeInt(input.bosses),
        danger: Math.max(1, safeInt(input.danger)),
        ...(safeInt(input.tacticalBonus ?? 0) > 0 ? { tacticalBonus: Math.min(12000, safeInt(input.tacticalBonus ?? 0)) } : {}),
        ...(typeof input.buildCapsule === 'string' && decodeBuildCapsule(input.buildCapsule) ? { buildCapsule: input.buildCapsule } : {}),
    };
    return { ...clean, threatLevel: clampThreatLevel(clean.threatLevel), score: calculateRunScore(clean) };
}
export function recordRun(state, input) {
    const nextSummary = summary(input);
    const recordKey = key(nextSummary.heroId, nextSummary.mapId, nextSummary.threatLevel);
    const previous = state.bests[recordKey];
    const newRecord = !previous || nextSummary.score > previous.score;
    const bests = newRecord ? { ...state.bests, [recordKey]: nextSummary } : { ...state.bests };
    return {
        state: { version: 1, bests, recent: [nextSummary, ...state.recent].slice(0, 10) },
        summary: nextSummary,
        newRecord,
    };
}
export function bestRecordFor(state, heroId, mapId, threatLevel) {
    return state.bests[key(heroId, mapId, threatLevel)] ?? null;
}
function isHero(value) { return value === 'arkan' || value === 'seria' || value === 'kain' || value === 'edric'; }
function isMap(value) { return value === 'ruinedGate' || value === 'frozenFen' || value === 'crystalQuarry'; }
function sanitizeSummary(raw) {
    if (typeof raw !== 'object' || raw === null)
        return null;
    const source = raw;
    if (!isHero(source.heroId) || !isMap(source.mapId))
        return null;
    return summary({
        heroId: source.heroId,
        mapId: source.mapId,
        threatLevel: Number(source.threatLevel ?? 0),
        seconds: Number(source.seconds ?? 0),
        kills: Number(source.kills ?? 0),
        bosses: Number(source.bosses ?? 0),
        danger: Number(source.danger ?? 1),
        tacticalBonus: Number(source.tacticalBonus ?? 0),
        ...(typeof source.buildCapsule === 'string' ? { buildCapsule: source.buildCapsule } : {}),
    });
}
export function loadRunRecords(storage) {
    try {
        const raw = storage.getItem(KEY);
        if (raw === null)
            return defaultRunRecords();
        const parsed = JSON.parse(raw);
        const recentRaw = Array.isArray(parsed.recent) ? parsed.recent : [];
        const recent = recentRaw.map(sanitizeSummary).filter((item) => item !== null).slice(0, 10);
        const bests = {};
        const bestRaw = typeof parsed.bests === 'object' && parsed.bests !== null ? parsed.bests : {};
        for (const value of Object.values(bestRaw)) {
            const item = sanitizeSummary(value);
            if (item)
                bests[key(item.heroId, item.mapId, item.threatLevel)] = item;
        }
        return { version: 1, bests, recent };
    }
    catch {
        return defaultRunRecords();
    }
}
export function saveRunRecords(storage, state) {
    try {
        storage.setItem(KEY, JSON.stringify({ version: 1, bests: state.bests, recent: state.recent.slice(0, 10) }));
    }
    catch { /* optional persistence */ }
}
