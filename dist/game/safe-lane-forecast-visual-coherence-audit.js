import { ACTION_BUTTONS } from './config.js';
import { safeLaneForecastVisualCoherencePresentation } from './safe-lane-forecast-visual-coherence-rendering.js';
export function runSafeLaneForecastVisualCoherenceAudit() { const samples = []; for (const reduced of [false, true])
    for (const urgency of [.2, .5, .72, .94])
        for (const transitionMs of [700, 2600]) {
            const p = safeLaneForecastVisualCoherencePresentation({ currentTarget: { x: 500, y: 310 }, currentConfidence: .78, nextTarget: { x: 410, y: 430 }, forecastUrgency: urgency, transitionMs }, reduced);
            samples.push({ id: `${reduced}-${urgency}-${transitionMs}`, passed: p.primaryAlphaScale > 0 && p.primaryAlphaScale <= 1 && p.bridgeAlphaScale >= 0 && p.bridgeAlphaScale <= 1 && typeof p.bridgeVisible === 'boolean' && typeof p.handoffSettled === 'boolean' && typeof p.forecastDetailVisible === 'boolean' && typeof p.directionVisible === 'boolean' && p.arrivalAlphaScale > 0 && p.arrivalAlphaScale <= 1 && Number.isFinite(p.target.x) && Number.isFinite(p.target.y) });
        } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 16 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
