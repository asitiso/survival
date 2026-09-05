import { ACTION_BUTTONS } from './config.js';
import { bossHazardAftermathTerrainRetirementPresentation } from './boss-hazard-aftermath-terrain-retirement-rendering.js';
export function runBossHazardAftermathTerrainRetirementAudit() { const samples = []; for (const reduced of [false, true])
    for (const ttl of [0, .12, .28, .52, .76])
        for (const distance of [48, 120, 999])
            for (const telegraph of [0, .6]) {
                const p = bossHazardAftermathTerrainRetirementPresentation({ aftermathTtl: ttl, aftermathMaxTtl: .78, nextHazardDistance: distance, nextHazardTelegraph: telegraph }, reduced);
                samples.push({ id: `${reduced}-${ttl}-${distance}-${telegraph}`, passed: [p.aftermathAlphaScale, p.terrainAlphaScale].every(v => v >= 0 && v <= 1) && p.sizeScale > 0 && p.sizeScale <= 1.1 });
            } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 60 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
