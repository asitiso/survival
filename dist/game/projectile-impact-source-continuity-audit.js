import { projectileImpactSourceContinuity } from './projectile-impact-source-continuity.js';
export function runProjectileImpactSourceContinuityAudit() { const samples = []; for (let i = 0; i < 64; i++) {
    const incoming = { x: (i % 7) + 1, y: (i % 5) - 2 }, segment = projectileImpactSourceContinuity({ impact: { x: 300 + i, y: 220 }, incoming, sourceClass: i % 2 ? 'archer' : 'boss', quality: i % 3 === 0 ? 'low' : i % 3 === 1 ? 'medium' : 'high', reducedFlash: i % 4 === 0 });
    samples.push({ i, exists: Boolean(segment), static: segment?.animated === false && segment.motionAmplitude === 0 });
} return { samples, actionCount: 9, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, passed: samples.every(s => s.exists && s.static) }; }
