const HERO_IDS = ['arkan', 'seria', 'kain', 'edric'];
const TRAIT_IDS = ['destruction', 'rapidCasting', 'goldSense', 'guardianOath', 'infernalPact', 'glacialFocus', 'stormPursuit', 'bastionVow'];
const MAP_IDS = ['ruinedGate', 'frozenFen', 'crystalQuarry'];
const FINAL_FORMS = ['solar-sovereign', 'phoenix-lord', 'volcanic-archon', 'absolute-empress', 'winter-warden', 'crystal-oracle', 'thunder-tyrant', 'tempest-runner', 'storm-oracle', 'radiant-king', 'oath-guardian', 'light-pilgrim'];
const ASCENSIONS = [
    'wildfire-doctrine', 'ash-step', 'solar-collapse', 'cinder-heart', 'eruption-chain', 'phoenix-cycle', 'absolute-zero', 'frozen-time', 'crystal-echo', 'glacier-step', 'whiteout', 'winter-covenant',
    'storm-circuit', 'thunder-step', 'overcharge', 'sky-breaker', 'static-shell', 'tempest-loop', 'holy-bastion', 'vow-of-light', 'judgment-bell', 'pilgrim-step', 'radiant-wall', 'last-oath',
];
const FATES = ['frenzy', 'golden', 'guardian'];
const RELICS = ['abyss-eye', 'chrono-shard', 'guardian-heart', 'ember-crown', 'winter-heart', 'storm-core', 'oath-seal', 'inferno-heart', 'summoner-sigil', 'juggernaut-core', 'phoenix-brand', 'zero-crystal', 'storm-crown', 'citadel-sigil'];
const FUSIONS = ['solar-detonation', 'storm-crucible', 'frostfire-cataclysm', 'thunder-singularity', 'glacial-conduit', 'cataclysmic-domain'];
const ARCHETYPES = ['burst', 'cycle', 'domain', 'fortress'];
const SPELL_IDS = ['fireBolt', 'chainLightning', 'frostNova', 'flameField', 'meteorStorm', 'blackHole'];
function object(value) { return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {}; }
function boundedInt(value, min, max, fallback) { const n = Number(value); return Number.isFinite(n) ? Math.max(min, Math.min(max, Math.floor(n))) : fallback; }
function includes(items, value) { return typeof value === 'string' && items.includes(value); }
function uniqueFrom(items, value, limit) { return Array.isArray(value) ? value.filter((id) => includes(items, id)).filter((id, index, array) => array.indexOf(id) === index).slice(0, limit) : []; }
export function sanitizeBuildCapsulePayload(raw) {
    const r = object(raw);
    const levels = object(r.spellLevels);
    const spellLevels = {};
    for (const id of SPELL_IDS)
        spellLevels[id] = boundedInt(levels[id], 1, 10, 1);
    return {
        version: 1,
        heroId: (includes(HERO_IDS, r.heroId) ? r.heroId : 'arkan'),
        traitId: r.traitId === null ? null : (includes(TRAIT_IDS, r.traitId) ? r.traitId : null),
        threatLevel: boundedInt(r.threatLevel, 0, 5, 0),
        mapId: (includes(MAP_IDS, r.mapId) ? r.mapId : 'ruinedGate'),
        seed: boundedInt(r.seed, 0, 0xffff_ffff, 0) >>> 0,
        finalForm: (includes(FINAL_FORMS, r.finalForm) ? r.finalForm : null),
        ascensions: uniqueFrom(ASCENSIONS, r.ascensions, 3),
        fateChoices: uniqueFrom(FATES, r.fateChoices, 3),
        relic: (includes(RELICS, r.relic) ? r.relic : null),
        fusions: uniqueFrom(FUSIONS, r.fusions, 2),
        archetype: (includes(ARCHETYPES, r.archetype) ? r.archetype : 'burst'),
        spellLevels,
    };
}
function checksum(input) { let hash = 0x811c9dc5; for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
} return hash.toString(36).toUpperCase().padStart(7, '0'); }
function indexToken(items, value) { return value === null ? 'z' : Math.max(0, items.indexOf(value)).toString(36); }
function listToken(items, values) { return values.length ? values.map((value) => indexToken(items, value)).join('') : '_'; }
function decodeIndex(items, token, nullable = false) { if (nullable && token === 'z')
    return null; const index = parseInt(token, 36); return Number.isInteger(index) && index >= 0 && index < items.length ? items[index] : undefined; }
function decodeList(items, token, limit) { if (token === '_')
    return []; if (token.length > limit)
    return null; const out = []; for (const char of token) {
    const value = decodeIndex(items, char);
    if (value === undefined || value === null || out.includes(value))
        return null;
    out.push(value);
} return out; }
export function encodeBuildCapsule(payload) {
    const safe = sanitizeBuildCapsulePayload(payload);
    const levels = SPELL_IDS.map((id) => safe.spellLevels[id].toString(36).toUpperCase()).join('');
    const body = [
        indexToken(HERO_IDS, safe.heroId), indexToken(TRAIT_IDS, safe.traitId), safe.threatLevel.toString(36), indexToken(MAP_IDS, safe.mapId), safe.seed.toString(36),
        indexToken(FINAL_FORMS, safe.finalForm), listToken(ASCENSIONS, safe.ascensions), listToken(FATES, safe.fateChoices), indexToken(RELICS, safe.relic), listToken(FUSIONS, safe.fusions), indexToken(ARCHETYPES, safe.archetype), levels,
    ].join('-');
    return `BLD1.${body}.${checksum(body)}`;
}
export function decodeBuildCapsule(code) {
    try {
        const outer = code.split('.');
        if (outer.length !== 3 || outer[0] !== 'BLD1')
            return null;
        const body = outer[1] ?? '';
        if (checksum(body) !== outer[2])
            return null;
        const parts = body.split('-');
        if (parts.length !== 12)
            return null;
        const heroId = decodeIndex(HERO_IDS, parts[0] ?? '');
        const traitId = decodeIndex(TRAIT_IDS, parts[1] ?? '', true);
        const threat = parseInt(parts[2] ?? '', 36);
        const mapId = decodeIndex(MAP_IDS, parts[3] ?? '');
        const seed = parseInt(parts[4] ?? '', 36);
        const finalForm = decodeIndex(FINAL_FORMS, parts[5] ?? '', true);
        const ascensions = decodeList(ASCENSIONS, parts[6] ?? '', 3);
        const fateChoices = decodeList(FATES, parts[7] ?? '', 3);
        const relic = decodeIndex(RELICS, parts[8] ?? '', true);
        const fusions = decodeList(FUSIONS, parts[9] ?? '', 2);
        const archetype = decodeIndex(ARCHETYPES, parts[10] ?? '');
        const levels = parts[11] ?? '';
        if (heroId === undefined || heroId === null || traitId === undefined || !Number.isInteger(threat) || threat < 0 || threat > 5 || mapId === undefined || mapId === null || !Number.isInteger(seed) || seed < 0 || seed > 0xffff_ffff || finalForm === undefined || ascensions === null || fateChoices === null || relic === undefined || fusions === null || archetype === undefined || archetype === null || levels.length !== SPELL_IDS.length)
            return null;
        const spellLevels = {};
        for (let i = 0; i < SPELL_IDS.length; i += 1) {
            const level = parseInt(levels[i] ?? '', 36);
            if (!Number.isInteger(level) || level < 1 || level > 10)
                return null;
            spellLevels[SPELL_IDS[i]] = level;
        }
        const payload = { version: 1, heroId: heroId, traitId: traitId, threatLevel: threat, mapId: mapId, seed: seed >>> 0, finalForm: finalForm, ascensions: ascensions, fateChoices: fateChoices, relic: relic, fusions: fusions, archetype: archetype, spellLevels };
        return encodeBuildCapsule(payload) === code ? payload : null;
    }
    catch {
        return null;
    }
}
