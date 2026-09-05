import { createBrowserSessionStorage } from '../domain/resilient-storage.js';
const STORAGE_KEY = 'arcane-last-stand.presentation';
const DEFAULT_STORAGE = createBrowserSessionStorage();
export function defaultPresentationSettings(prefersReducedMotion = false) {
    return { quality: 'high', reducedFlash: prefersReducedMotion, reducedShake: prefersReducedMotion, reducedMotion: prefersReducedMotion, haptics: true };
}
function systemPrefersReducedMotion() {
    try {
        return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    catch {
        return false;
    }
}
export function sanitizePresentationSettings(value) {
    if (!value || typeof value !== 'object')
        return defaultPresentationSettings();
    const v = value;
    const qualityOk = v.quality === 'high' || v.quality === 'medium' || v.quality === 'low';
    if (!qualityOk || typeof v.reducedFlash !== 'boolean' || typeof v.reducedShake !== 'boolean' || typeof v.haptics !== 'boolean')
        return defaultPresentationSettings();
    const reducedMotion = typeof v.reducedMotion === 'boolean' ? v.reducedMotion : v.reducedFlash === true && v.reducedShake === true;
    return { quality: v.quality, reducedFlash: v.reducedFlash, reducedShake: v.reducedShake, reducedMotion, haptics: v.haptics };
}
export function cosmeticMotionScale(settingsOrReducedMotion) {
    const reducedMotion = typeof settingsOrReducedMotion === 'boolean' ? settingsOrReducedMotion : settingsOrReducedMotion.reducedMotion;
    return reducedMotion ? 0 : 1;
}
export function cosmeticMotionVelocity(value, reducedMotion) {
    return reducedMotion ? 0 : value;
}
export function applyPresentationSettings(cue, settings) {
    return {
        alpha: settings.reducedFlash ? Math.min(0.58, cue.alpha) : cue.alpha,
        shake: settings.reducedShake ? Number((cue.shake * 0.4).toFixed(4)) : cue.shake,
        haptic: settings.haptics && cue.haptic,
    };
}
export function loadPresentationSettings(storage = DEFAULT_STORAGE, prefersReducedMotion = systemPrefersReducedMotion()) {
    if (!storage)
        return defaultPresentationSettings(prefersReducedMotion);
    try {
        const raw = storage.getItem(STORAGE_KEY);
        return raw ? sanitizePresentationSettings(JSON.parse(raw)) : defaultPresentationSettings(prefersReducedMotion);
    }
    catch {
        return defaultPresentationSettings(prefersReducedMotion);
    }
}
export function savePresentationSettings(settings, storage = DEFAULT_STORAGE) {
    if (!storage)
        return;
    try {
        storage.setItem(STORAGE_KEY, JSON.stringify(sanitizePresentationSettings(settings)));
    }
    catch { /* storage unavailable */ }
}
