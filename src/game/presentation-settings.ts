import { createBrowserSessionStorage } from '../domain/resilient-storage.js';
import type { SnapshotStorage } from '../domain/run-snapshot.js';
import type { PresentationQuality } from './presentation-budget.js';

export interface PresentationSettings {
  quality: PresentationQuality;
  reducedFlash: boolean;
  reducedShake: boolean;
  reducedMotion: boolean;
  haptics: boolean;
}

export interface PresentationCueSettingsInput { alpha: number; shake: number; haptic: boolean; }

const STORAGE_KEY = 'arcane-last-stand.presentation';
const DEFAULT_STORAGE = createBrowserSessionStorage();

export function defaultPresentationSettings(prefersReducedMotion = false): PresentationSettings {
  return { quality: 'high', reducedFlash: prefersReducedMotion, reducedShake: prefersReducedMotion, reducedMotion: prefersReducedMotion, haptics: true };
}

function systemPrefersReducedMotion(): boolean {
  try { return typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
  catch { return false; }
}

export function sanitizePresentationSettings(value: unknown): PresentationSettings {
  if (!value || typeof value !== 'object') return defaultPresentationSettings();
  const v = value as Record<string, unknown>;
  const qualityOk = v.quality === 'high' || v.quality === 'medium' || v.quality === 'low';
  if (!qualityOk || typeof v.reducedFlash !== 'boolean' || typeof v.reducedShake !== 'boolean' || typeof v.haptics !== 'boolean') return defaultPresentationSettings();
  const reducedMotion = typeof v.reducedMotion === 'boolean' ? v.reducedMotion : v.reducedFlash === true && v.reducedShake === true;
  return { quality: v.quality as PresentationQuality, reducedFlash: v.reducedFlash, reducedShake: v.reducedShake, reducedMotion, haptics: v.haptics };
}

export function cosmeticMotionScale(settingsOrReducedMotion: Pick<PresentationSettings,'reducedMotion'> | boolean): number {
  const reducedMotion = typeof settingsOrReducedMotion === 'boolean' ? settingsOrReducedMotion : settingsOrReducedMotion.reducedMotion;
  return reducedMotion ? 0 : 1;
}

export function cosmeticMotionVelocity(value:number,reducedMotion:boolean):number {
  return reducedMotion ? 0 : value;
}

export function applyPresentationSettings(cue: PresentationCueSettingsInput, settings: PresentationSettings): PresentationCueSettingsInput {
  return {
    alpha: settings.reducedFlash ? Math.min(0.58, cue.alpha) : cue.alpha,
    shake: settings.reducedShake ? Number((cue.shake * 0.4).toFixed(4)) : cue.shake,
    haptic: settings.haptics && cue.haptic,
  };
}

export function loadPresentationSettings(storage: Pick<SnapshotStorage, 'getItem'> | null = DEFAULT_STORAGE, prefersReducedMotion = systemPrefersReducedMotion()): PresentationSettings {
  if (!storage) return defaultPresentationSettings(prefersReducedMotion);
  try {
    const raw = storage.getItem(STORAGE_KEY);
    return raw ? sanitizePresentationSettings(JSON.parse(raw)) : defaultPresentationSettings(prefersReducedMotion);
  } catch { return defaultPresentationSettings(prefersReducedMotion); }
}

export function savePresentationSettings(settings: PresentationSettings, storage: Pick<SnapshotStorage, 'setItem'> | null = DEFAULT_STORAGE): void {
  if (!storage) return;
  try { storage.setItem(STORAGE_KEY, JSON.stringify(sanitizePresentationSettings(settings))); } catch { /* storage unavailable */ }
}
