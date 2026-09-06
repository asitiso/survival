const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export function bossHazardLifecycleOwnerPresentation(input, reducedFlash = false) { const telegraph = Math.max(0, input.telegraph), ttl = Math.max(0, input.ttl), after = Math.max(0, input.aftermathTtl), afterMax = Math.max(.0001, input.aftermathMaxTtl); if (after > 0 && ttl <= 0) {
    const sustain = clamp(after / afterMax, 0, 1);
    return { owner: 'aftermath', telegraphAlphaScale: 0, activeAlphaScale: 0, aftermathAlphaScale: sustain * (reducedFlash ? .62 : 1), presentationOnly: true };
} if (telegraph > 0 && ttl > 0)
    return { owner: 'telegraph', telegraphAlphaScale: 1, activeAlphaScale: 0, aftermathAlphaScale: 0, presentationOnly: true }; if (ttl > 0)
    return { owner: 'active', telegraphAlphaScale: 0, activeAlphaScale: 1, aftermathAlphaScale: 0, presentationOnly: true }; return { owner: 'retired', telegraphAlphaScale: 0, activeAlphaScale: 0, aftermathAlphaScale: 0, presentationOnly: true }; }
export function bossHazardEndAftermathOwnershipPresentation(input, reducedMotion = false, reducedFlash = false) {
    const max = Math.max(.0001, Number.isFinite(input.aftermathMaxTtl) ? input.aftermathMaxTtl : .0001), ttl = Math.max(0, Number.isFinite(input.aftermathTtl) ? input.aftermathTtl : 0);
    if (ttl <= 0)
        return { owner: 'retired', aftermathAlphaScale: 0, sizeScale: 1, presentationOnly: true };
    const progress = clamp(1 - ttl / max, 0, 1), handoffEnd = reducedMotion ? .12 : .18, fadeStart = reducedMotion ? .72 : .78;
    let owner = 'aftermath', alpha = 1;
    if (progress < handoffEnd) {
        owner = 'handoff';
        alpha = .42 + .58 * clamp(progress / handoffEnd, 0, 1);
    }
    else if (progress > fadeStart)
        alpha = clamp((1 - progress) / Math.max(.001, 1 - fadeStart), 0, 1);
    alpha *= reducedFlash ? .68 : 1;
    return { owner, aftermathAlphaScale: alpha, sizeScale: owner === 'handoff' ? .94 + .06 * clamp(progress / handoffEnd, 0, 1) : 1, presentationOnly: true };
}
export function bossHazardAftermathOwnerArbitrationPresentation(input, reducedFlash = false) {
    const endAlpha = clamp(input.endAlpha, 0, 1), after = clamp(input.aftermathAlpha, 0, 1), terrain = clamp(input.terrainAlpha, 0, 1), flashScale = reducedFlash ? .72 : 1;
    if (input.endOwner === 'retired' || input.terrainOwner === 'retired' && after <= 0 && terrain <= 0)
        return { owner: 'retired', aftermathAlphaScale: 0, terrainAlphaScale: 0, presentationOnly: true };
    if (input.endOwner === 'handoff')
        return { owner: 'handoff', aftermathAlphaScale: endAlpha * Math.max(.35, after) * flashScale, terrainAlphaScale: 0, presentationOnly: true };
    if (input.terrainOwner === 'terrain' && terrain > 0)
        return { owner: 'terrain', aftermathAlphaScale: Math.min(.24, endAlpha * after) * flashScale, terrainAlphaScale: terrain * flashScale, presentationOnly: true };
    return { owner: 'aftermath', aftermathAlphaScale: endAlpha * Math.max(after, .6) * flashScale, terrainAlphaScale: 0, presentationOnly: true };
}
export function bossHazardAftermathDensityBudgetPresentation(input, reducedMotion = false) {
    const count = Math.max(0, Math.floor(input.activeCount)), index = Math.max(0, Math.floor(input.indexFromNewest));
    if (input.owner === 'retired')
        return { visible: false, alphaScale: 0, sizeScale: 1, capacity: 0, presentationOnly: true };
    if (count <= 2)
        return { visible: true, alphaScale: 1, sizeScale: 1, capacity: count, presentationOnly: true };
    let capacity = input.owner === 'handoff' ? 5 : input.owner === 'aftermath' ? 4 : 2;
    if (reducedMotion)
        capacity -= 1;
    capacity = Math.max(1, capacity);
    const visible = index < capacity, alphaScale = visible ? (input.owner === 'handoff' ? .88 : input.owner === 'aftermath' ? .72 : .48) : 0, sizeScale = visible ? (reducedMotion ? .94 : 1) : 1;
    return { visible, alphaScale, sizeScale, capacity, presentationOnly: true };
}
export function bossHazardRespawnGroundCoherencePresentation(input, reducedFlash = false) {
    const memoryLife = clamp(input.memoryLife, 0, 1), distance = Number.isFinite(input.nextHazardDistance) ? Math.max(0, input.nextHazardDistance) : 999, radius = Math.max(24, Number.isFinite(input.nextHazardRadius) ? input.nextHazardRadius : 60), telegraph = Math.max(0, Number.isFinite(input.nextHazardTelegraph) ? input.nextHazardTelegraph : 0), near = distance <= Math.max(96, radius * 1.5), urgent = telegraph > 0 && telegraph <= .18;
    if (!near || telegraph <= 0)
        return { owner: 'memory', memoryAlphaScale: input.aftermathActive ? .28 : 1, aftermathAlphaScale: input.aftermathActive ? .72 : 1, telegraphAlphaScale: 1, presentationOnly: true };
    if (urgent)
        return { owner: 'spawn', memoryAlphaScale: 0, aftermathAlphaScale: .08, telegraphAlphaScale: 1, presentationOnly: true };
    const proximity = clamp(1 - distance / Math.max(1, radius * 1.5), 0, 1), handoff = clamp(.42 + proximity * .38 + (1 - memoryLife) * .16, 0, 1), flashScale = reducedFlash ? .82 : 1;
    return { owner: 'handoff', memoryAlphaScale: (input.aftermathActive ? .22 : 1 - handoff * .82) * flashScale, aftermathAlphaScale: (input.aftermathActive ? .38 : .62) * (1 - handoff * .45) * flashScale, telegraphAlphaScale: Math.max(.72, 1 - handoff * .18), presentationOnly: true };
}
export function bossHazardRespawnGroundHandoffPresentation(input, reducedFlash = false) {
    const memoryLife = clamp(input.memoryLife, 0, 1), telegraph = Math.max(0, Number.isFinite(input.nextHazardTelegraph) ? input.nextHazardTelegraph : 0);
    if (input.coherenceOwner === 'memory')
        return { owner: 'memory', memoryAlphaScale: 1, aftermathAlphaScale: 1, telegraphAlphaScale: 1, presentationOnly: true };
    if (input.coherenceOwner === 'spawn')
        return { owner: 'spawn', memoryAlphaScale: 0, aftermathAlphaScale: .08, telegraphAlphaScale: 1, presentationOnly: true };
    const urgency = clamp(1 - telegraph / .9, 0, 1), blend = clamp(.28 + urgency * .62 + (1 - memoryLife) * .10, 0, 1), flashScale = reducedFlash ? .9 : 1;
    return { owner: 'handoff', memoryAlphaScale: (1 - blend) * flashScale, aftermathAlphaScale: (1 - blend * .72) * flashScale, telegraphAlphaScale: .74 + .26 * blend, presentationOnly: true };
}
export function bossHazardRespawnGroundDensityBudgetPresentation(input, reducedMotion = false) {
    const count = Math.max(0, Math.floor(input.activeTransitionCount)), index = Math.max(0, Math.floor(input.indexFromNewest));
    if (input.owner === 'memory')
        return { transitionVisible: true, memoryAlphaScale: 1, aftermathAlphaScale: 1, telegraphAlphaScale: 1, capacity: count, presentationOnly: true };
    if (input.owner === 'spawn')
        return { transitionVisible: false, memoryAlphaScale: 0, aftermathAlphaScale: 0, telegraphAlphaScale: 1, capacity: 0, presentationOnly: true };
    if (count <= 2)
        return { transitionVisible: true, memoryAlphaScale: 1, aftermathAlphaScale: 1, telegraphAlphaScale: 1, capacity: count, presentationOnly: true };
    let capacity = reducedMotion ? 2 : 3;
    capacity = Math.max(1, capacity);
    const transitionVisible = index < capacity;
    return { transitionVisible, memoryAlphaScale: transitionVisible ? .72 : 0, aftermathAlphaScale: transitionVisible ? .68 : 0, telegraphAlphaScale: 1, capacity, presentationOnly: true };
}
export function bossHazardRespawnMaterializationOwnershipPresentation(input, reducedFlash = false) {
    const progress = clamp(Number.isFinite(input.footprintProgress) ? input.footprintProgress : 1, 0, 1), flashScale = reducedFlash ? .82 : 1;
    if (input.activationOwner === 'retired' || input.footprintOwner === 'retired')
        return { owner: 'retired', memoryAlphaScale: 0, footprintAlphaScale: 0, telegraphAlphaScale: 0, activeAlphaScale: 0, presentationOnly: true };
    if (input.activationOwner === 'active')
        return { owner: 'active', memoryAlphaScale: 0, footprintAlphaScale: 0, telegraphAlphaScale: 0, activeAlphaScale: 1, presentationOnly: true };
    if (input.activationOwner === 'activation')
        return { owner: 'activation', memoryAlphaScale: 0, footprintAlphaScale: 0, telegraphAlphaScale: 0, activeAlphaScale: (.64 + .28 * progress) * flashScale, presentationOnly: true };
    if (input.footprintOwner === 'footprint') {
        const memory = input.respawnOwner === 'memory' ? .46 : input.respawnOwner === 'handoff' ? .22 : .08;
        return { owner: 'footprint', memoryAlphaScale: memory * flashScale, footprintAlphaScale: (.72 + .28 * (1 - progress)) * flashScale, telegraphAlphaScale: .76 + .24 * progress, activeAlphaScale: 0, presentationOnly: true };
    }
    return { owner: 'telegraph', memoryAlphaScale: (input.respawnOwner === 'memory' ? .28 : input.respawnOwner === 'handoff' ? .12 : 0) * flashScale, footprintAlphaScale: 0, telegraphAlphaScale: 1, activeAlphaScale: 0, presentationOnly: true };
}
export function bossHazardRespawnMaterializationSettlePresentation(input, reducedFlash = false) {
    if (input.ttl <= 0 || input.owner === 'retired')
        return { owner: 'retired', materializationAlphaScale: 0, persistentAlphaScale: 0, presentationOnly: true };
    if (input.owner === 'footprint')
        return { owner: 'footprint', materializationAlphaScale: reducedFlash ? .72 : 1, persistentAlphaScale: 0, presentationOnly: true };
    if (input.owner === 'telegraph')
        return { owner: 'telegraph', materializationAlphaScale: reducedFlash ? .78 : 1, persistentAlphaScale: 0, presentationOnly: true };
    if (input.owner === 'active')
        return { owner: 'active', materializationAlphaScale: 0, persistentAlphaScale: 1, presentationOnly: true };
    const max = Math.max(.0001, Number.isFinite(input.activationMaxTtl) ? input.activationMaxTtl : .0001), left = Math.max(0, Number.isFinite(input.activationTtl) ? input.activationTtl : 0), progress = clamp(1 - left / max, 0, 1), flashScale = reducedFlash ? .86 : 1;
    return { owner: 'activation', materializationAlphaScale: (1 - progress) * .58 * flashScale, persistentAlphaScale: (.54 + .4 * progress) * flashScale, presentationOnly: true };
}
export function bossHazardRespawnMaterializationDensityBudgetPresentation(input, reducedMotion = false) {
    const count = Math.max(0, Math.floor(input.activeCount)), index = Math.max(0, Math.floor(input.indexFromNewest));
    if (input.owner === 'active' || input.owner === 'telegraph' || input.owner === 'retired')
        return { effectStrength: 0, telegraphAlphaScale: 1, persistentAlphaScale: 1, capacity: 0, presentationOnly: true };
    if (count <= 2)
        return { effectStrength: 1, telegraphAlphaScale: 1, persistentAlphaScale: 1, capacity: count, presentationOnly: true };
    let capacity = input.owner === 'activation' ? 4 : 3;
    if (reducedMotion)
        capacity = Math.max(1, capacity - 1);
    const visible = index < capacity, effectStrength = visible ? Math.max(.58, (input.owner === 'activation' ? .86 : .78) - index * .08) : 0;
    return { effectStrength, telegraphAlphaScale: 1, persistentAlphaScale: 1, capacity, presentationOnly: true };
}
export function bossHazardPersistentExpirationGroundStatePresentation(input, reducedMotion = false, reducedFlash = false) {
    const afterMax = Math.max(.0001, Number.isFinite(input.aftermathMaxTtl) ? input.aftermathMaxTtl : .0001), after = Math.max(0, Number.isFinite(input.aftermathTtl) ? input.aftermathTtl : 0), memoryMax = Math.max(.0001, Number.isFinite(input.memoryMaxTtl) ? input.memoryMaxTtl : .0001), memory = Math.max(0, Number.isFinite(input.memoryTtl) ? input.memoryTtl : 0);
    if (after <= 0 && memory <= 0)
        return { owner: 'retired', aftermathAlphaScale: 0, groundAlphaScale: 0, groundRadiusScale: 1, presentationOnly: true };
    if (after <= 0)
        return { owner: 'ground', aftermathAlphaScale: 0, groundAlphaScale: 1, groundRadiusScale: 1, presentationOnly: true };
    const afterLife = clamp(after / afterMax, 0, 1), afterProgress = 1 - afterLife, memoryLife = clamp(memory / memoryMax, 0, 1), flashScale = reducedFlash ? .72 : 1;
    const handoffStart = reducedMotion ? .26 : .34;
    if (afterProgress < handoffStart)
        return { owner: 'expiration', aftermathAlphaScale: flashScale, groundAlphaScale: 0, groundRadiusScale: .96 + .04 * afterProgress / handoffStart, presentationOnly: true };
    const t = clamp((afterProgress - handoffStart) / Math.max(.001, 1 - handoffStart), 0, 1), afterAlpha = (1 - t * .82) * flashScale, groundAlpha = clamp((.18 + .82 * t) * (.72 + .28 * memoryLife), 0, 1);
    return { owner: 'handoff', aftermathAlphaScale: afterAlpha, groundAlphaScale: groundAlpha, groundRadiusScale: .98 + .04 * t, presentationOnly: true };
}
export function bossHazardExpirationGroundStateHandoffPresentation(input, reducedMotion = false, reducedFlash = false) {
    const after = clamp(input.aftermathLife, 0, 1), memory = clamp(input.memoryLife, 0, 1), flashScale = reducedFlash ? .78 : 1;
    if (input.owner === 'retired')
        return { owner: 'retired', aftermathAlphaScale: 0, groundAlphaScale: 0, presentationOnly: true };
    if (input.owner === 'ground')
        return { owner: 'ground', aftermathAlphaScale: 0, groundAlphaScale: 1, presentationOnly: true };
    if (input.owner === 'expiration')
        return { owner: 'expiration', aftermathAlphaScale: flashScale, groundAlphaScale: 0, presentationOnly: true };
    const t = clamp((1 - after) * (reducedMotion ? 1.18 : 1), 0, 1), aftermath = (1 - t * .78) * flashScale, ground = clamp((.22 + .78 * t) * (.78 + .22 * memory), 0, 1), sum = aftermath + ground, scale = sum > 1.3 ? 1.3 / sum : 1;
    return { owner: 'handoff', aftermathAlphaScale: aftermath * scale, groundAlphaScale: ground * scale, presentationOnly: true };
}
export function bossHazardExpirationGroundStateDensityBudgetPresentation(input, reducedMotion = false) {
    const count = Math.max(0, Math.floor(input.activeCount)), index = Math.max(0, Math.floor(input.indexFromNewest));
    if (input.owner === 'ground' || input.owner === 'retired')
        return { effectStrength: 0, aftermathAlphaScale: 0, groundAlphaScale: 1, capacity: 0, presentationOnly: true };
    if (count <= 2)
        return { effectStrength: 1, aftermathAlphaScale: 1, groundAlphaScale: 1, capacity: count, presentationOnly: true };
    let capacity = input.owner === 'expiration' ? 4 : 3;
    if (reducedMotion)
        capacity = Math.max(1, capacity - 1);
    const visible = index < capacity, effectStrength = visible ? Math.max(.58, .84 - index * .08) : 0;
    return { effectStrength, aftermathAlphaScale: effectStrength, groundAlphaScale: 1, capacity, presentationOnly: true };
}
export function bossClearedGroundSafeLaneRecoveryCoherencePresentation(input, reducedMotion = false) {
    const memory = clamp(input.memoryLife, 0, 1), confidence = clamp(input.safeLaneConfidence, 0, 1);
    if (!input.nearLane || memory <= .02)
        return { owner: 'safe-lane', groundAlphaScale: input.nearLane ? 0 : 1, safeLaneAlphaScale: 1, pathRecoveryScale: 1, presentationOnly: true };
    if (memory >= .58) {
        const lane = (input.hazardOccluded ? .34 : .42) * (.72 + .28 * confidence);
        return { owner: 'ground', groundAlphaScale: 1, safeLaneAlphaScale: lane, pathRecoveryScale: lane, presentationOnly: true };
    }
    const t = clamp((.58 - memory) / .5, 0, 1), lane = clamp((.42 + .58 * t) * (.76 + .24 * confidence), 0, 1);
    const occlusion = input.hazardOccluded ? .55 : 1;
    return { owner: 'handoff', groundAlphaScale: clamp(1 - t * .72, 0, 1), safeLaneAlphaScale: lane * occlusion, pathRecoveryScale: (reducedMotion ? .86 : 1) * lane * occlusion, presentationOnly: true };
}
export function bossClearedGroundSafeLaneRecoveryHandoffPresentation(input, reducedMotion = false) {
    const memory = clamp(input.memoryLife, 0, 1), confidence = clamp(input.safeLaneConfidence, 0, 1), occ = input.hazardOccluded ? .58 : 1;
    if (input.owner === 'safe-lane')
        return { owner: 'safe-lane', groundAlphaScale: 0, safeLaneAlphaScale: 1, pathRecoveryScale: 1, presentationOnly: true };
    if (input.owner === 'ground')
        return { owner: 'ground', groundAlphaScale: 1, safeLaneAlphaScale: (.32 + .14 * confidence) * occ, pathRecoveryScale: (.38 + .12 * confidence) * occ, presentationOnly: true };
    const t = clamp(1 - memory, 0, 1), ground = .72 * (1 - t) + .18, lane = (.42 + .58 * t) * (.78 + .22 * confidence) * occ, total = ground + lane, scale = total > 1.4 ? 1.4 / total : 1;
    return { owner: 'handoff', groundAlphaScale: ground * scale, safeLaneAlphaScale: lane * scale, pathRecoveryScale: lane * scale * (reducedMotion ? .88 : 1), presentationOnly: true };
}
export function bossClearedGroundSafeLaneRecoveryDensityBudgetPresentation(input, reducedMotion = false) {
    const count = Math.max(0, Math.floor(input.activeCount)), index = Math.max(0, Math.floor(input.indexFromNewest));
    if (input.owner === 'safe-lane')
        return { effectStrength: 0, safeLaneAlphaScale: 1, groundTransitionAlphaScale: 0, capacity: 0, presentationOnly: true };
    if (count <= 2)
        return { effectStrength: 1, safeLaneAlphaScale: 1, groundTransitionAlphaScale: 1, capacity: count, presentationOnly: true };
    let capacity = input.owner === 'ground' ? 4 : 3;
    if (reducedMotion)
        capacity = Math.max(1, capacity - 1);
    const visible = index < capacity, effectStrength = visible ? Math.max(.56, .84 - index * .08) : 0;
    return { effectStrength, safeLaneAlphaScale: 1, groundTransitionAlphaScale: effectStrength, capacity, presentationOnly: true };
}
