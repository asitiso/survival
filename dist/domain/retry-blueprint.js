const KEY = 'arcane-last-stand.retry-blueprint.v1';
const HERO_IDS = new Set(['arkan', 'seria', 'kain', 'edric']);
const TRAIT_IDS = new Set(['destruction', 'rapidCasting', 'goldSense', 'guardianOath', 'infernalPact', 'glacialFocus', 'stormPursuit', 'bastionVow']);
const MAP_IDS = new Set(['ruinedGate', 'frozenFen', 'crystalQuarry']);
export function sanitizeRetryBlueprint(raw) {
    if (!raw || typeof raw !== 'object' || Array.isArray(raw))
        return null;
    const r = raw;
    if (!HERO_IDS.has(r.heroId) || !MAP_IDS.has(r.mapId))
        return null;
    const traitId = r.traitId === null ? null : TRAIT_IDS.has(r.traitId) ? r.traitId : undefined;
    if (traitId === undefined)
        return null;
    const threat = Number(r.threatLevel), seed = Number(r.seed);
    if (!Number.isFinite(threat) || threat < 0 || threat > 5 || !Number.isFinite(seed) || seed < 0 || seed > 0xffff_ffff)
        return null;
    return { version: 1, heroId: r.heroId, traitId, threatLevel: Math.floor(threat), mapId: r.mapId, seed: Math.floor(seed) >>> 0 };
}
export function saveRetryBlueprint(storage, blueprint) {
    try {
        const safe = sanitizeRetryBlueprint(blueprint);
        if (safe)
            storage.setItem(KEY, JSON.stringify(safe));
    }
    catch { /* optional persistence */ }
}
export function loadRetryBlueprint(storage) {
    try {
        const raw = storage.getItem(KEY);
        return raw ? sanitizeRetryBlueprint(JSON.parse(raw)) : null;
    }
    catch {
        return null;
    }
}
export function clearRetryBlueprint(storage) { try {
    storage.removeItem(KEY);
}
catch { /* optional */ } }
