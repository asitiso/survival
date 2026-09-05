import { adaptiveQuality, type PresentationQuality } from './presentation-budget.js';

export const PRESENTATION_LAYER_ORDER = [
  'terrain',
  'enemies',
  'friendly-spells',
  'friendly-decoration',
  'screen-effects',
  'enemy-projectiles',
  'danger-telegraphs',
  'hero',
  'hud',
] as const;

export function nextPresentationQuality(current: PresentationQuality, fps: number, particleLoad: number): PresentationQuality {
  return adaptiveQuality(current, fps, particleLoad);
}

export function criticalCuePolicy(quality: PresentationQuality): { telegraphs: true; bossWarnings: true; hud: true; decorativeDensity: number } {
  return { telegraphs: true, bossWarnings: true, hud: true, decorativeDensity: quality === 'high' ? 1 : quality === 'medium' ? 0.68 : 0.38 };
}
