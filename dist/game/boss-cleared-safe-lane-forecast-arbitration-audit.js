import { ACTION_BUTTONS } from './config.js';
import { bossClearedSafeLaneForecastTarget } from './boss-cleared-safe-lane-forecast-arbitration-rendering.js';
export function runBossClearedSafeLaneForecastArbitrationAudit() { const samples = []; for (const reduced of [false, true])
    for (const urgency of [.24, .46, .72, 1])
        for (const transitionMs of [600, 2400]) {
            const p = bossClearedSafeLaneForecastTarget({ currentTarget: { x: 500, y: 310 }, currentConfidence: .78, nextTarget: { x: 410, y: 430 }, forecastUrgency: urgency, transitionMs }, reduced);
            samples.push({ id: `${reduced}-${urgency}-${transitionMs}`, passed: p.confidence >= 0 && p.confidence <= 1 && Boolean(p.target) });
        } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 16 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
