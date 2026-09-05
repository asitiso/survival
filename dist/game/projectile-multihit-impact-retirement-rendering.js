import { projectileImpactEntryOffset } from './projectile-impact-arrival-handoff-rendering.js';
export function projectileMultiHitImpactHandoff(input, reducedMotion = false) {
    const firstImpact = Math.max(0, Math.floor(input.priorImpactCount)) === 0;
    const entryOffset = firstImpact ? projectileImpactEntryOffset(input.launchOffset, input.launchTtl, input.launchMaxTtl, reducedMotion) : { x: 0, y: 0 };
    const hasCarry = Math.hypot(entryOffset.x, entryOffset.y) > .0001;
    return { entryOffset, impactOwner: (hasCarry ? 'arrival' : 'canonical'), retireLaunchOwner: firstImpact, nextTrailOwner: (input.continues ? 'canonical' : 'retired'), presentationOnly: true };
}
