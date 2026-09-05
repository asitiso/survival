const PROFILE_KEY = 'arcane-last-stand.meta-profile';
const LEGACY_SHARDS_KEY = 'arcane-last-stand.shards';
const COSTS = [15, 25, 40, 60, 85];
const CAPS = { vitality: 5, power: 5, bankroll: 5, magnet: 4 };
function safeInteger(value, min, max) {
    const numeric = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(numeric))
        return min;
    return Math.min(max, Math.max(min, Math.floor(numeric)));
}
export function defaultMetaProfile() {
    return { version: 1, shards: 0, upgrades: { vitality: 0, power: 0, bankroll: 0, magnet: 0 } };
}
function sanitizeProfile(raw) {
    const source = typeof raw === 'object' && raw !== null ? raw : {};
    const upgradesRaw = typeof source.upgrades === 'object' && source.upgrades !== null
        ? source.upgrades
        : {};
    return {
        version: 1,
        shards: safeInteger(source.shards, 0, Number.MAX_SAFE_INTEGER),
        upgrades: {
            vitality: safeInteger(upgradesRaw.vitality, 0, CAPS.vitality),
            power: safeInteger(upgradesRaw.power, 0, CAPS.power),
            bankroll: safeInteger(upgradesRaw.bankroll, 0, CAPS.bankroll),
            magnet: safeInteger(upgradesRaw.magnet, 0, CAPS.magnet),
        },
    };
}
export function saveMetaProfile(storage, profile) {
    try {
        storage.setItem(PROFILE_KEY, JSON.stringify(sanitizeProfile(profile)));
    }
    catch {
        // Storage is optional. Gameplay must keep working in sandbox/privacy modes.
    }
}
export function loadMetaProfile(storage) {
    try {
        const raw = storage.getItem(PROFILE_KEY);
        if (raw !== null) {
            try {
                return sanitizeProfile(JSON.parse(raw));
            }
            catch {
                return defaultMetaProfile();
            }
        }
        const legacyRaw = storage.getItem(LEGACY_SHARDS_KEY);
        const legacyShards = safeInteger(legacyRaw, 0, Number.MAX_SAFE_INTEGER);
        const migrated = { ...defaultMetaProfile(), shards: legacyShards };
        saveMetaProfile(storage, migrated);
        return migrated;
    }
    catch {
        return defaultMetaProfile();
    }
}
export function metaUpgradeCost(id, currentLevel) {
    const safeLevel = safeInteger(currentLevel, 0, CAPS[id]);
    if (safeLevel >= CAPS[id])
        return null;
    return COSTS[safeLevel] ?? null;
}
export function purchaseMetaUpgrade(profile, id) {
    const safe = sanitizeProfile(profile);
    const level = safe.upgrades[id];
    const cost = metaUpgradeCost(id, level);
    if (cost === null)
        return { ok: false, profile: safe, message: '최대 단계' };
    if (safe.shards < cost)
        return { ok: false, profile: safe, message: '마력석 부족' };
    return {
        ok: true,
        profile: {
            ...safe,
            shards: safe.shards - cost,
            upgrades: { ...safe.upgrades, [id]: level + 1 },
        },
        message: `${id} ${level + 1}단계`,
    };
}
export function metaBonuses(profile) {
    const safe = sanitizeProfile(profile);
    return {
        maxHpMultiplier: 1 + safe.upgrades.vitality * 0.03,
        spellPowerMultiplier: 1 + safe.upgrades.power * 0.02,
        startingGold: safe.upgrades.bankroll * 50,
        pickupRadiusMultiplier: 1 + safe.upgrades.magnet * 0.08,
    };
}
