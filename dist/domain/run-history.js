import { decodeBuildCapsule } from './build-capsule.js';
import { MAX_RUN_DURATION_SECONDS } from './run-duration.js';
const KEY = 'arcane-last-stand.run-history.v1';
const HERO_IDS = new Set(['arkan', 'seria', 'kain', 'edric']);
const MAP_IDS = new Set(['ruinedGate', 'frozenFen', 'crystalQuarry']);
const ARCHETYPES = new Set(['burst', 'cycle', 'domain', 'fortress']);
const FINAL_FORMS = new Set(['solar-sovereign', 'phoenix-lord', 'volcanic-archon', 'absolute-empress', 'winter-warden', 'crystal-oracle', 'thunder-tyrant', 'tempest-runner', 'storm-oracle', 'radiant-king', 'oath-guardian', 'light-pilgrim']);
function safeEntry(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw))
        return null;
    const r = raw;
    if (typeof r.runCode !== 'string' || !r.runCode.startsWith('ARC-') || !HERO_IDS.has(r.heroId))
        return null;
    const seconds = Number(r.seconds), threat = Number(r.threat), score = Number(r.score);
    if (![seconds, threat, score].every(Number.isFinite))
        return null;
    return { runCode: r.runCode.slice(0, 24), heroId: r.heroId, seconds: Math.max(0, Math.min(MAX_RUN_DURATION_SECONDS, seconds)), threat: Math.max(0, Math.min(5, Math.floor(threat))), score: Math.max(0, Math.floor(score)),
        ...(MAP_IDS.has(r.mapId) ? { mapId: r.mapId } : {}),
        ...(Number.isFinite(Number(r.bosses)) ? { bosses: Math.max(0, Math.min(999, Math.floor(Number(r.bosses)))) } : {}),
        ...(ARCHETYPES.has(r.archetype) ? { archetype: r.archetype } : {}),
        ...(FINAL_FORMS.has(r.finalForm) ? { finalForm: r.finalForm } : {}),
        ...(typeof r.buildCapsule === 'string' && decodeBuildCapsule(r.buildCapsule) ? { buildCapsule: r.buildCapsule } : {}), };
}
export function loadRunHistory(storage) {
    try {
        const raw = storage.getItem(KEY);
        if (!raw)
            return [];
        const parsed = JSON.parse(raw);
        if (!Array.isArray(parsed))
            return [];
        return parsed.map(safeEntry).filter((v) => Boolean(v)).slice(0, 5);
    }
    catch {
        return [];
    }
}
export function appendRunHistory(storage, entry) {
    const safe = safeEntry(entry);
    if (!safe)
        return loadRunHistory(storage);
    const next = [safe, ...loadRunHistory(storage).filter((item) => item.runCode !== safe.runCode)].slice(0, 5);
    try {
        storage.setItem(KEY, JSON.stringify(next));
    }
    catch { /* optional */ }
    return next;
}
