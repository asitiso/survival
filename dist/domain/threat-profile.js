import { clampThreatLevel } from './threat-level.js';
const KEY = 'arcane-last-stand.threat-profile';
export function defaultThreatProfile() {
    return { version: 1, unlocked: 0, selected: 0 };
}
function sanitize(raw) {
    const source = typeof raw === 'object' && raw !== null ? raw : {};
    const unlocked = clampThreatLevel(Number(source.unlocked ?? 0));
    const selected = Math.min(unlocked, clampThreatLevel(Number(source.selected ?? 0)));
    return { version: 1, unlocked, selected };
}
export function loadThreatProfile(storage) {
    try {
        const raw = storage.getItem(KEY);
        if (raw === null)
            return defaultThreatProfile();
        return sanitize(JSON.parse(raw));
    }
    catch {
        return defaultThreatProfile();
    }
}
export function saveThreatProfile(storage, profile) {
    try {
        storage.setItem(KEY, JSON.stringify(sanitize(profile)));
    }
    catch { /* optional persistence */ }
}
export function selectThreatLevel(profile, requested) {
    const safe = sanitize(profile);
    return { ...safe, selected: Math.min(safe.unlocked, clampThreatLevel(requested)) };
}
export function unlockThreatLevel(profile, requestedUnlocked) {
    const safe = sanitize(profile);
    const unlocked = Math.max(safe.unlocked, clampThreatLevel(requestedUnlocked));
    return { ...safe, unlocked, selected: Math.min(unlocked, safe.selected) };
}
