import { ACTION_BUTTONS } from './config.js';
import { updateProjectileImpactIdentityCoherence } from './projectile-impact-identity-coherence.js';
import { projectileImpactHeldCount, updateProjectileImpactCountHold } from './projectile-impact-count-hold.js';
import { projectileImpactAnchoredPlacements, updateProjectileImpactLabelAnchorHold } from './projectile-impact-label-anchor-hold.js';
const cluster = (x, y, count) => ({ impact: { x, y }, incoming: { x: 180, y: 0 }, count, sourceClass: 'archer', start: { x: x - 30, y }, end: { x, y }, alpha: .5, accent: '#fff', animated: false, motionAmplitude: 0 });
const placement = (index, x, y) => ({ clusterIndex: index, sourceClass: 'archer', pos: { x, y }, visible: true, animated: false, motionAmplitude: 0 });
export function runProjectileImpactCountAnchorIdentityCoherenceAudit() {
    const samples = [];
    let passed = true;
    for (let i = 0; i < 64; i++) {
        const offset = i % 5, a = cluster(300 + offset, 300, 5), b = cluster(338 + offset, 300, 2);
        let identity = updateProjectileImpactIdentityCoherence([], [a, b], .016);
        let counts = updateProjectileImpactCountHold([], [a, b], .016, identity.keys);
        let anchors = updateProjectileImpactLabelAnchorHold([], [a, b], [placement(0, 300 + offset, 250), placement(1, 338 + offset, 250)], .016, identity.keys);
        const movedA = cluster(327 + offset, 300, 1), movedB = cluster(344 + offset, 300, 1);
        identity = updateProjectileImpactIdentityCoherence(identity.memory, [movedA, movedB], .04);
        counts = updateProjectileImpactCountHold(counts, [movedA, movedB], .04, identity.keys);
        const heldA = projectileImpactHeldCount(counts, movedA, identity.keys[0] ?? null), heldB = projectileImpactHeldCount(counts, movedB, identity.keys[1] ?? null);
        const displayA = { ...movedA, count: heldA }, displayB = { ...movedB, count: heldB };
        anchors = updateProjectileImpactLabelAnchorHold(anchors, [displayA, displayB], [placement(0, 327 + offset, 248), placement(1, 344 + offset, 248)], .04, identity.keys);
        const placed = projectileImpactAnchoredPlacements(anchors, [displayA, displayB], [placement(0, 327 + offset, 248), placement(1, 344 + offset, 248)], identity.keys);
        const coherent = heldA === 5 && placed[0]?.pos.x === 300 + offset && counts[0]?.identityId === anchors[0]?.identityId;
        const ok = coherent && identity.presentationOnly && identity.gameplayMutation === false;
        passed &&= ok;
        samples.push(`${i}:${identity.keys.join(',')}:${heldA}:${heldB}:${placed[0]?.pos.x}`);
    }
    return { passed, samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false };
}
