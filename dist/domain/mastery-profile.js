const STORAGE_KEY = 'arcane-last-stand.mastery-profile';
export const MASTERY_MAX_LEVEL = 20;
const HERO_IDS = ['arkan', 'seria', 'kain', 'edric'];
function safeInteger(value, min, max) {
    const numeric = typeof value === 'number' ? value : Number(value);
    if (!Number.isFinite(numeric))
        return min;
    return Math.min(max, Math.max(min, Math.floor(numeric)));
}
export function masteryXpNeeded(level) {
    const safe = safeInteger(level, 1, MASTERY_MAX_LEVEL);
    if (safe >= MASTERY_MAX_LEVEL)
        return 0;
    return Math.floor(72 + safe * 30 + Math.pow(safe, 1.32) * 12);
}
export function defaultMasteryProfile() {
    return {
        version: 1,
        heroes: {
            arkan: { level: 1, xp: 0 },
            seria: { level: 1, xp: 0 },
            kain: { level: 1, xp: 0 },
            edric: { level: 1, xp: 0 },
        },
    };
}
function sanitizeHeroProgress(raw) {
    const source = typeof raw === 'object' && raw !== null ? raw : {};
    const level = safeInteger(source.level, 1, MASTERY_MAX_LEVEL);
    if (level >= MASTERY_MAX_LEVEL)
        return { level: MASTERY_MAX_LEVEL, xp: 0 };
    const needed = masteryXpNeeded(level);
    const xp = safeInteger(source.xp, 0, Math.max(0, needed - 1));
    return { level, xp };
}
export function sanitizeMasteryProfile(raw) {
    const source = typeof raw === 'object' && raw !== null ? raw : {};
    const heroesRaw = typeof source.heroes === 'object' && source.heroes !== null
        ? source.heroes
        : {};
    const profile = defaultMasteryProfile();
    for (const heroId of HERO_IDS)
        profile.heroes[heroId] = sanitizeHeroProgress(heroesRaw[heroId]);
    return profile;
}
export function loadMasteryProfile(storage) {
    try {
        const raw = storage.getItem(STORAGE_KEY);
        if (raw === null)
            return defaultMasteryProfile();
        try {
            return sanitizeMasteryProfile(JSON.parse(raw));
        }
        catch {
            return defaultMasteryProfile();
        }
    }
    catch {
        return defaultMasteryProfile();
    }
}
export function saveMasteryProfile(storage, profile) {
    try {
        storage.setItem(STORAGE_KEY, JSON.stringify(sanitizeMasteryProfile(profile)));
    }
    catch {
        // Persistence is optional in privacy/sandbox modes.
    }
}
export function grantMasteryXp(profile, heroId, amount) {
    const safe = sanitizeMasteryProfile(profile);
    const current = { ...safe.heroes[heroId] };
    let remaining = Number.isFinite(amount) ? Math.max(0, Math.floor(amount)) : 0;
    let level = current.level;
    let xp = current.xp;
    while (remaining > 0 && level < MASTERY_MAX_LEVEL) {
        const needed = masteryXpNeeded(level);
        const gap = Math.max(1, needed - xp);
        if (remaining < gap) {
            xp += remaining;
            remaining = 0;
            break;
        }
        remaining -= gap;
        level += 1;
        xp = 0;
    }
    if (level >= MASTERY_MAX_LEVEL) {
        level = MASTERY_MAX_LEVEL;
        xp = 0;
    }
    return {
        version: 1,
        heroes: {
            ...safe.heroes,
            [heroId]: { level, xp },
        },
    };
}
