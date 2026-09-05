import { ACTION_BUTTONS } from './config.js';
import { advanceSecondaryImpactClusterIdentityHold, createSecondaryImpactClusterIdentityHoldState, secondaryImpactClusterIdentityFor } from './secondary-impact-cluster-identity-hold-rendering.js';
export function runSecondaryImpactClusterIdentityHoldAudit() { const samples = []; for (let n = 1; n <= 8; n++)
    for (const dt of [.016, .08, .24]) {
        let s = createSecondaryImpactClusterIdentityHoldState();
        s = advanceSecondaryImpactClusterIdentityHold(s, Array.from({ length: n }, (_, i) => ({ pos: { x: 192 + (i % 3) * 7, y: 192 + Math.floor(i / 3) * 7 } })), .016);
        s = advanceSecondaryImpactClusterIdentityHold(s, [{ pos: { x: 196, y: 196 } }], dt);
        const p = secondaryImpactClusterIdentityFor(s, { x: 196, y: 196 });
        samples.push({ id: `${n}-${dt}`, passed: p.key.length > 0 && p.heldCount >= 1 && p.heldCount <= 8 && p.holdTtl >= 0 && p.holdTtl <= .18 });
    } return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false, newAtlasCount: 0, passed: samples.length === 24 && samples.every(s => s.passed) && ACTION_BUTTONS.length === 9 }; }
