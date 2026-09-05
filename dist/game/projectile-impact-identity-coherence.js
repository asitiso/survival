import { PROJECTILE_IMPACT_LABEL_ANCHOR_DIRECTION_COSINE_MIN, projectileImpactLabelAnchorDirectionCompatible } from './projectile-impact-label-anchor-hold.js';
export const PROJECTILE_IMPACT_SHARED_IDENTITY_MEMORY_SECONDS = .34;
export const PROJECTILE_IMPACT_SHARED_IDENTITY_MATCH_RADIUS = 72;
export const PROJECTILE_IMPACT_SHARED_IDENTITY_DIRECTION_COSINE_MIN = PROJECTILE_IMPACT_LABEL_ANCHOR_DIRECTION_COSINE_MIN;
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const directionCompatible = (a, b) => projectileImpactLabelAnchorDirectionCompatible(a, b);
export function projectileImpactSplitMergeLineagePairComparator(a, b) {
    return a.distance - b.distance || b.clusterCount - a.clusterCount || a.memoryIdentityId - b.memoryIdentityId || a.clusterImpactX - b.clusterImpactX || a.clusterImpactY - b.clusterImpactY || a.memoryIndex - b.memoryIndex || a.clusterIndex - b.clusterIndex;
}
function assignment(memory, clusters) {
    const pairs = [];
    for (let memoryIndex = 0; memoryIndex < memory.length; memoryIndex++) {
        const entry = memory[memoryIndex];
        for (let clusterIndex = 0; clusterIndex < clusters.length; clusterIndex++) {
            const cluster = clusters[clusterIndex];
            if (entry.sourceClass !== cluster.sourceClass || !directionCompatible(entry.incoming, cluster.incoming))
                continue;
            const d = distance(entry.pos, cluster.impact);
            if (d <= PROJECTILE_IMPACT_SHARED_IDENTITY_MATCH_RADIUS)
                pairs.push({ memoryIndex, clusterIndex, distance: d, clusterCount: cluster.count, memoryIdentityId: entry.identityId, clusterImpactX: cluster.impact.x, clusterImpactY: cluster.impact.y });
        }
    }
    pairs.sort(projectileImpactSplitMergeLineagePairComparator);
    const usedMemory = new Set(), usedClusters = new Set(), result = Array(clusters.length).fill(null);
    for (const pair of pairs) {
        if (usedMemory.has(pair.memoryIndex) || usedClusters.has(pair.clusterIndex))
            continue;
        usedMemory.add(pair.memoryIndex);
        usedClusters.add(pair.clusterIndex);
        result[pair.clusterIndex] = pair.memoryIndex;
    }
    return result;
}
export function projectileImpactPartialRetiredIdentityIds(memory, matchedMemoryIndexes) {
    const active = new Set(matchedMemoryIndexes.filter((index) => index !== null));
    return [...new Set(memory.filter((_, index) => !active.has(index)).map((entry) => entry.identityId))];
}
export function updateProjectileImpactIdentityCoherence(previous, clusters, dt) {
    const delta = Math.max(0, Number.isFinite(dt) ? dt : 0);
    if (clusters.length === 0) {
        const retiredIdentityIds = [...new Set(previous.map((entry) => entry.identityId))];
        return { memory: [], keys: [], presentationOnly: true, gameplayMutation: false, retiredIdentityIds };
    }
    const working = previous.map((entry) => ({ ...entry, pos: { ...entry.pos }, incoming: { ...entry.incoming }, memoryRemaining: entry.memoryRemaining - delta })).filter((entry) => entry.memoryRemaining > 0);
    const matched = assignment(working, clusters);
    const retiredIdentityIds = projectileImpactPartialRetiredIdentityIds(working, matched);
    let nextIdentity = previous.reduce((max, entry) => Math.max(max, entry.identityId), 0) + 1;
    const memory = [];
    const keys = [];
    for (let clusterIndex = 0; clusterIndex < clusters.length; clusterIndex++) {
        const cluster = clusters[clusterIndex], best = matched[clusterIndex];
        if (best == null) {
            const entry = { identityId: nextIdentity++, sourceClass: cluster.sourceClass, pos: { ...cluster.impact }, incoming: { ...cluster.incoming }, memoryRemaining: PROJECTILE_IMPACT_SHARED_IDENTITY_MEMORY_SECONDS, presentationOnly: true };
            memory.push(entry);
            keys.push(entry.identityId);
            continue;
        }
        const previousEntry = working[best];
        const entry = { ...previousEntry, pos: { x: previousEntry.pos.x * .7 + cluster.impact.x * .3, y: previousEntry.pos.y * .7 + cluster.impact.y * .3 }, incoming: { ...cluster.incoming }, memoryRemaining: PROJECTILE_IMPACT_SHARED_IDENTITY_MEMORY_SECONDS, presentationOnly: true };
        memory.push(entry);
        keys.push(entry.identityId);
    }
    return { memory, keys, presentationOnly: true, gameplayMutation: false, retiredIdentityIds };
}
export function projectileImpactIdentityKeys(memory, clusters) {
    return assignment(memory, clusters).map((memoryIndex) => memoryIndex === null ? null : memory[memoryIndex].identityId);
}
