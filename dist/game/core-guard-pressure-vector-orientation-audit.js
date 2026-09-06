import { ACTION_BUTTONS } from './config.js';
import { coreGuardPressureVectorOrientationPresentation } from './core-guard-pressure-vector-orientation-rendering.js';
export function runCoreGuardPressureVectorOrientationAudit() { const samples = []; for (const vector of [{ x: 1, y: 0 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 0, y: -1 }, { x: 1, y: 1 }, { x: -1, y: 1 }, { x: 1, y: -1 }, { x: -1, y: -1 }]) {
    const p = coreGuardPressureVectorOrientationPresentation({ pressureVector: vector });
    samples.push({ id: `${vector.x}:${vector.y}`, passed: p.hasVector && Number.isFinite(p.projectileLineAngle) && !p.contactFullRing && p.contactArcEnd > p.contactArcStart });
} for (const vector of [undefined, { x: 0, y: 0 }, { x: Number.NaN, y: 1 }]) {
    const p = coreGuardPressureVectorOrientationPresentation({ pressureVector: vector });
    samples.push({ id: `fallback-${samples.length}`, passed: !p.hasVector && p.contactFullRing && p.orientationConfidence === 0 });
} return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 11 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
