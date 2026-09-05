import { ACTION_BUTTONS } from './config.js';
import { updateProjectileImpactIdentityCoherence } from './projectile-impact-identity-coherence.js';
import { retireProjectileImpactCountHoldIdentities, updateProjectileImpactCountHold } from './projectile-impact-count-hold.js';
import { retireProjectileImpactLabelAnchorIdentities, updateProjectileImpactLabelAnchorHold } from './projectile-impact-label-anchor-hold.js';
const cluster = (x, count = 4) => ({ impact: { x, y: 300 }, incoming: { x: 180, y: 0 }, count, sourceClass: 'archer', start: { x: x - 30, y: 300 }, end: { x, y: 300 }, alpha: .5, accent: '#fff', animated: false, motionAmplitude: 0 });
const placement = (x) => ({ clusterIndex: 0, sourceClass: 'archer', pos: { x, y: 250 }, visible: true, animated: false, motionAmplitude: 0 });
export function runProjectileImpactPartialIdentityRetirementAudit() {
    const samples = [];
    let passed = true;
    for (let i = 0; i < 64; i++) {
        const offset = i % 7, initial = [cluster(300 + offset, 5), cluster(520 + offset, 4)];
        let identity = updateProjectileImpactIdentityCoherence([], initial, .016);
        let counts = updateProjectileImpactCountHold([], initial, .016, identity.keys);
        let anchors = updateProjectileImpactLabelAnchorHold([], initial, [placement(300 + offset), placement(520 + offset)], .016, identity.keys);
        const gone = identity.keys[0], stay = identity.keys[1];
        const active = [cluster(524 + offset, 2)];
        identity = updateProjectileImpactIdentityCoherence(identity.memory, active, .016);
        counts = retireProjectileImpactCountHoldIdentities(counts, identity.retiredIdentityIds);
        anchors = retireProjectileImpactLabelAnchorIdentities(anchors, identity.retiredIdentityIds);
        const retired = identity.retiredIdentityIds.length === 1 && identity.retiredIdentityIds[0] === gone, kept = identity.keys[0] === stay && !counts.some((entry) => entry.identityId === gone) && counts.some((entry) => entry.identityId === stay) && !anchors.some((entry) => entry.identityId === gone) && anchors.some((entry) => entry.identityId === stay);
        const ok = retired && kept && identity.presentationOnly && identity.gameplayMutation === false;
        passed &&= ok;
        samples.push(`${i}:${retired ? 1 : 0}:${kept ? 1 : 0}`);
    }
    return { passed, samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, gameplayFormulaMutation: false, snapshotSchemaMutation: false };
}
