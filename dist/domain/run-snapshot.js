import { FUSION_IDS } from '../game/spell-fusions.js';
import { restoreExtension, serializeExtension } from '../game/endless/snapshot.js';
import { decodeBuildCapsule } from './build-capsule.js';
import { MAX_RUN_DURATION_SECONDS } from './run-duration.js';
const KEY = 'arcane-last-stand.run-snapshot';
const BACKUP_KEY = 'arcane-last-stand.run-snapshot.backup';
const HERO_IDS = new Set(['arkan', 'seria', 'kain', 'edric']);
const TRAIT_IDS = new Set(['destruction', 'rapidCasting', 'goldSense', 'guardianOath', 'infernalPact', 'glacialFocus', 'stormPursuit', 'bastionVow']);
const RELIC_IDS = new Set(['abyss-eye', 'chrono-shard', 'guardian-heart', 'ember-crown', 'winter-heart', 'storm-core', 'oath-seal', 'inferno-heart', 'summoner-sigil', 'juggernaut-core', 'phoenix-brand', 'zero-crystal', 'storm-crown', 'citadel-sigil']);
const FATE_IDS = new Set(['frenzy', 'golden', 'guardian']);
const MAP_IDS = new Set(['ruinedGate', 'frozenFen', 'crystalQuarry']);
const SPELL_IDS = ['fireBolt', 'chainLightning', 'frostNova', 'flameField', 'meteorStorm', 'blackHole'];
function num(value, min, max) {
    const n = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(n))
        return min;
    return Math.min(max, Math.max(min, n));
}
function int(value, min, max) { return Math.floor(num(value, min, max)); }
function record(value) { return typeof value === 'object' && value !== null ? value : {}; }
function sanitizeItem(raw) {
    if (raw === null || raw === undefined)
        return null;
    const o = record(raw);
    const kind = o.kind === 'weapon' || o.kind === 'armor' ? o.kind : null;
    if (!kind || typeof o.id !== 'string' || typeof o.name !== 'string')
        return null;
    return { id: o.id.slice(0, 64), kind, name: o.name.slice(0, 64), rank: int(o.rank, 1, 5), power: num(o.power, 0, 1000), legendary: o.legendary === true };
}
export function sanitizeRunSnapshot(raw) {
    const o = record(raw);
    if (o.version !== 1)
        return null;
    if (!HERO_IDS.has(o.heroId))
        return null;
    const traitId = o.traitId === null ? null : TRAIT_IDS.has(o.traitId) ? o.traitId : null;
    const hero = record(o.hero);
    const spells = record(o.spellLevels);
    const equipment = record(o.equipment);
    const map = record(o.map);
    const progression = record(o.progression);
    if (!MAP_IDS.has(map.id))
        return null;
    const spellLevels = {};
    for (const id of SPELL_IDS)
        spellLevels[id] = int(spells[id], 1, 10);
    const fusions = Array.isArray(o.fusions) ? o.fusions.filter((id) => FUSION_IDS.includes(id)).slice(0, 2) : [];
    const fateChoices = Array.isArray(o.fateChoices) ? o.fateChoices.filter((id) => FATE_IDS.has(id)).slice(0, 3) : [];
    const relic = o.relic === null ? null : RELIC_IDS.has(o.relic) ? o.relic : null;
    const safe = {
        version: 1,
        savedAt: int(o.savedAt, 0, Number.MAX_SAFE_INTEGER),
        heroId: o.heroId,
        traitId,
        threatLevel: int(o.threatLevel, 0, 5),
        elapsed: num(o.elapsed, 0, MAX_RUN_DURATION_SECONDS),
        hero: {
            level: int(hero.level, 1, 999), xp: num(hero.xp, 0, 1e9), xpNext: num(hero.xpNext, 1, 1e9),
            hp: num(hero.hp, 0, 1e6), maxHp: num(hero.maxHp, 1, 1e6), coins: int(hero.coins, 0, 1e9), kills: int(hero.kills, 0, 1e8),
        },
        coreHp: num(o.coreHp, 0, 1e6),
        spellLevels,
        equipment: {
            coins: int(equipment.coins, 0, 1e9), weapon: sanitizeItem(equipment.weapon), armor: sanitizeItem(equipment.armor), healingPotions: int(equipment.healingPotions, 0, 99),
        },
        relic,
        fusions: [...new Set(fusions)].slice(0, 2),
        fateChoices: fateChoices.slice(0, 3),
        map: { id: map.id, evolutionStage: int(map.evolutionStage, 0, 2) },
        progression: { bossesKilled: int(progression.bossesKilled, 0, 999), goldEarned: int(progression.goldEarned, 0, 1e9), shopTokens: int(progression.shopTokens, 0, 99) },
        ...(typeof o.endless === 'string'
            ? { endless: serializeExtension(restoreExtension(o.endless.length <= 24_000 ? o.endless : '')) }
            : {}),
        ...(typeof o.replayCapsule === 'string' && o.replayCapsule.length <= 160 && decodeBuildCapsule(o.replayCapsule)
            ? { replayCapsule: o.replayCapsule }
            : {}),
    };
    return safe;
}
function parseStoredRunSnapshot(raw) {
    if (raw === null)
        return null;
    try {
        return sanitizeRunSnapshot(JSON.parse(raw));
    }
    catch {
        return null;
    }
}
export function saveRunSnapshot(storage, snapshot) {
    const safe = sanitizeRunSnapshot(snapshot);
    if (!safe)
        return;
    let previousRaw = null;
    try {
        previousRaw = storage.getItem(KEY);
    }
    catch { /* primary write can still succeed */ }
    if (parseStoredRunSnapshot(previousRaw)) {
        try {
            storage.setItem(BACKUP_KEY, previousRaw);
        }
        catch { /* backup is best-effort */ }
    }
    try {
        storage.setItem(KEY, JSON.stringify(safe));
    }
    catch { /* keep the previous valid checkpoint */ }
}
export function loadRunSnapshot(storage) {
    let primary = null;
    try {
        primary = parseStoredRunSnapshot(storage.getItem(KEY));
    }
    catch { /* isolate primary read failure */ }
    if (primary)
        return primary;
    try {
        return parseStoredRunSnapshot(storage.getItem(BACKUP_KEY));
    }
    catch {
        return null;
    }
}
export function clearRunSnapshot(storage) {
    try {
        storage.removeItem(KEY);
    }
    catch { /* isolate primary removal failure */ }
    try {
        storage.removeItem(BACKUP_KEY);
    }
    catch { /* optional */ }
}
