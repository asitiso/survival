import { adaptiveQuality } from './presentation-budget.js';
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
];
export function nextPresentationQuality(current, fps, particleLoad) {
    return adaptiveQuality(current, fps, particleLoad);
}
export function criticalCuePolicy(quality) {
    return { telegraphs: true, bossWarnings: true, hud: true, decorativeDensity: quality === 'high' ? 1 : quality === 'medium' ? 0.68 : 0.38 };
}
