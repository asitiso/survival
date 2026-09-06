const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
export function specialistStrikeImpactSideFinishPresentation(input, reducedMotion = false, reducedFlash = false) {
    const max = Math.max(.0001, input.maxTtl), life = clamp(input.ttl / max, 0, 1), progress = 1 - life, dx = input.target.x - input.origin.x, dy = input.target.y - input.origin.y, d = Math.hypot(dx, dy) || 1, ux = dx / d, uy = dy / d, tx = -uy, ty = ux, visible = progress > .68, len = (input.type === 'siegeGolem' ? 18 : input.type === 'assassin' ? 15 : 13) * (reducedMotion ? .72 : 1), start = { x: input.target.x + ux * 1.5, y: input.target.y + uy * 1.5 }, roleBlend = clamp((progress - .68) / .12, 0, 1);
    const targetRoleX = input.type === 'assassin' ? ux * .3 + tx * .95 : input.type === 'nullifier' ? ux * .55 - tx * .7 : input.type === 'shieldbearer' ? ux * .92 + tx * .18 : ux, targetRoleY = input.type === 'assassin' ? uy * .3 + ty * .95 : input.type === 'nullifier' ? uy * .55 - ty * .7 : input.type === 'shieldbearer' ? uy * .92 + ty * .18 : uy, targetRoleMag = Math.hypot(targetRoleX, targetRoleY) || 1, roleX = ux * (1 - roleBlend) + targetRoleX / targetRoleMag * roleBlend, roleY = uy * (1 - roleBlend) + targetRoleY / targetRoleMag * roleBlend, roleMag = Math.hypot(roleX, roleY) || 1, end = { x: start.x + roleX / roleMag * len, y: start.y + roleY / roleMag * len };
    return { visible, start, end, length: len, alpha: visible ? (.18 + .46 * clamp((progress - .68) / .32, 0, 1)) * (reducedFlash ? .58 : 1) : 0, roleBlend };
}
export function specialistImpactFinishLocomotionRecoveryPresentation(input, reducedMotion = false) {
    const max = Math.max(.0001, Number.isFinite(input.maxTtl) ? input.maxTtl : .0001), progress = clamp(1 - Math.max(0, input.ttl) / max, 0, 1), startAt = reducedMotion ? .76 : .82, recoveryBlend = clamp((progress - startAt) / Math.max(.001, 1 - startAt), 0, 1);
    const fx = input.end.x - input.start.x, fy = input.end.y - input.start.y, fl = Math.hypot(fx, fy) || 1, lx = Number.isFinite(input.locomotionFacingX) ? input.locomotionFacingX : fx, ly = Number.isFinite(input.locomotionFacingY) ? input.locomotionFacingY : fy, ll = Math.hypot(lx, ly) || 1;
    const bx = fx / fl * (1 - recoveryBlend) + lx / ll * recoveryBlend, by = fy / fl * (1 - recoveryBlend) + ly / ll * recoveryBlend, bl = Math.hypot(bx, by) || 1, baseLength = fl, length = baseLength * (1 - .58 * recoveryBlend), end = { x: input.start.x + bx / bl * length, y: input.start.y + by / bl * length };
    return { owner: (recoveryBlend >= .92 ? 'locomotion' : recoveryBlend > 0 ? 'handoff' : 'finish'), start: { ...input.start }, end, length, recoveryBlend, alphaScale: 1 - .5 * recoveryBlend, presentationOnly: true };
}
export function specialistImpactRecoveryFacingHandoffPresentation(input, reducedMotion = false) {
    const sx = Number.isFinite(input.storedFacingX) ? input.storedFacingX : 1, sy = Number.isFinite(input.storedFacingY) ? input.storedFacingY : 0, sl = Math.hypot(sx, sy) || 1, cx = Number.isFinite(input.currentFacingX) ? input.currentFacingX : sx, cy = Number.isFinite(input.currentFacingY) ? input.currentFacingY : sy, cl = Math.hypot(cx, cy) || 1;
    if (!input.enemyAlive)
        return { owner: 'stored', facingX: sx / sl, facingY: sy / sl, blend: 0, presentationOnly: true };
    const raw = clamp(input.recoveryBlend, 0, 1), blend = clamp(raw * (reducedMotion ? 1.12 : 1), 0, 1), bx = sx / sl * (1 - blend) + cx / cl * blend, by = sy / sl * (1 - blend) + cy / cl * blend, bl = Math.hypot(bx, by) || 1;
    return { owner: (blend > .7 ? 'current' : blend > 0 ? 'handoff' : 'stored'), facingX: bx / bl, facingY: by / bl, blend, presentationOnly: true };
}
export function specialistImpactRecoveryDensityBudgetPresentation(input, reducedMotion = false) {
    const count = Math.max(0, Math.floor(input.activeCount)), index = Math.max(0, Math.floor(input.indexFromNewest));
    if (count <= 2)
        return { visible: true, alphaScale: 1, lengthScale: 1, capacity: count, presentationOnly: true };
    let capacity = input.type === 'siegeGolem' ? 4 : 3;
    if (input.owner === 'locomotion')
        capacity -= 1;
    if (reducedMotion)
        capacity -= 1;
    capacity = Math.max(1, capacity);
    const visible = index < capacity, alphaScale = visible ? (input.owner === 'finish' ? .9 : input.owner === 'handoff' ? .72 : .46) : 0, lengthScale = visible ? (reducedMotion ? .72 : input.owner === 'locomotion' ? .68 : .88) : 0;
    return { visible, alphaScale, lengthScale, capacity, presentationOnly: true };
}
export function specialistNextAttackAnticipationPresentation(input, reducedMotion = false, reducedFlash = false) {
    const fx = Number.isFinite(input.facingX) ? input.facingX : 1, fy = Number.isFinite(input.facingY) ? input.facingY : 0, fl = Math.hypot(fx, fy) || 1, facingX = fx / fl, facingY = fy / fl, interval = Math.max(.001, Number.isFinite(input.attackInterval) ? input.attackInterval : .001), timer = Math.max(0, Number.isFinite(input.attackTimer) ? input.attackTimer : interval), ratio = clamp(timer / interval, 0, 1), recovered = clamp(input.recoveryBlend, 0, 1) >= .82, window = input.type === 'siegeGolem' ? .28 : input.type === 'assassin' ? .22 : .24, visible = Boolean(input.inAttackRange && recovered && timer > 0 && ratio <= window), urgency = visible ? clamp(1 - ratio / window, 0, 1) : 0, baseReach = input.type === 'siegeGolem' ? 28 : input.type === 'assassin' ? 20 : input.type === 'nullifier' ? 24 : 22, reach = baseReach * (reducedMotion ? .76 : 1), alpha = visible ? (.2 + .34 * urgency) * (reducedFlash ? .58 : 1) : 0;
    return { visible, facingX, facingY, reach, alpha, urgency, owner: (visible ? 'anticipation' : 'locomotion'), presentationOnly: true };
}
export function specialistNextAttackAnticipationHandoffPresentation(input, reducedMotion = false) {
    if (!input.anticipationVisible)
        return { owner: (Math.max(input.pullback, input.lunge) > 0 ? 'attack' : 'locomotion'), alphaScale: 0, presentationOnly: true };
    const pullback = clamp(input.pullback, 0, 1), lunge = clamp(input.lunge, 0, 1), attack = Math.max(pullback, lunge), urgency = clamp(input.urgency, 0, 1);
    if (lunge >= .68)
        return { owner: 'attack', alphaScale: 0, presentationOnly: true };
    if (attack > 0) {
        const fade = clamp(1 - pullback * 1.28 - lunge * 1.5, 0, 1) * (reducedMotion ? .72 : 1);
        return { owner: 'attack', alphaScale: fade, presentationOnly: true };
    }
    return { owner: 'anticipation', alphaScale: reducedMotion ? .9 : 1, presentationOnly: true };
}
export function specialistNextAttackAnticipationDensityBudgetPresentation(input, reducedMotion = false) {
    const count = Math.max(0, Math.floor(input.activeCount)), index = Math.max(0, Math.floor(input.indexFromNewest)), urgency = clamp(input.urgency, 0, 1);
    if (count <= 2)
        return { visible: true, alphaScale: 1, reachScale: 1, capacity: count, presentationOnly: true };
    let capacity = input.type === 'siegeGolem' ? 4 : input.type === 'assassin' ? 2 : 3;
    if (urgency >= .85)
        capacity += 1;
    if (reducedMotion)
        capacity -= 1;
    capacity = Math.max(1, capacity);
    const visible = index < capacity, alphaScale = visible ? Math.min(1, .62 + .38 * urgency) : 0, reachScale = visible ? (reducedMotion ? .72 : .88) : 0;
    return { visible, alphaScale, reachScale, capacity, presentationOnly: true };
}
export function specialistAnticipationSilhouettePoseContinuityPresentation(input, reducedMotion = false) {
    const urgency = clamp(input.urgency, 0, 1), pullback = clamp(input.pullback, 0, 1), lunge = clamp(input.lunge, 0, 1), resolve = clamp(input.resolve, 0, 1), attack = Math.max(pullback, lunge);
    if (lunge >= .08)
        return { owner: 'strike', anticipationAlphaScale: 0, poseWeight: 0, widthScale: 1, heightScale: 1, lateralOffset: 0, silhouetteAlphaScale: 1, presentationOnly: true };
    if (pullback >= .08) {
        const handoff = clamp(1 - pullback * 1.45, 0, 1), poseWeight = handoff * (reducedMotion ? .55 : 1), target = input.type === 'assassin' ? { w: 1.07, h: .96, l: 2.2 } : input.type === 'siegeGolem' ? { w: 1.03, h: 1.055, l: .35 } : input.type === 'nullifier' ? { w: .985, h: 1.035, l: -1.15 } : { w: 1.045, h: 1.025, l: .25 };
        return { owner: 'windup', anticipationAlphaScale: handoff, poseWeight, widthScale: 1 + (target.w - 1) * poseWeight, heightScale: 1 + (target.h - 1) * poseWeight, lateralOffset: target.l * poseWeight, silhouetteAlphaScale: 1, presentationOnly: true };
    }
    if (resolve > .08 || !input.anticipationVisible)
        return { owner: (resolve > .08 ? 'resolve' : 'locomotion'), anticipationAlphaScale: 0, poseWeight: 0, widthScale: 1, heightScale: 1, lateralOffset: 0, silhouetteAlphaScale: 1, presentationOnly: true };
    const poseWeight = urgency * (reducedMotion ? .45 : .72), type = input.type;
    const target = type === 'assassin' ? { w: 1.07, h: .96, l: 2.2 } : type === 'siegeGolem' ? { w: 1.03, h: 1.055, l: .35 } : type === 'nullifier' ? { w: .985, h: 1.035, l: -1.15 } : { w: 1.045, h: 1.025, l: .25 };
    return { owner: 'anticipation', anticipationAlphaScale: 1, poseWeight, widthScale: 1 + (target.w - 1) * poseWeight, heightScale: 1 + (target.h - 1) * poseWeight, lateralOffset: target.l * poseWeight, silhouetteAlphaScale: .94 + .06 * urgency, presentationOnly: true };
}
export function specialistAnticipationSilhouetteHandoffPresentation(input, reducedMotion = false) {
    const pullback = clamp(input.pullback, 0, 1), lunge = clamp(input.lunge, 0, 1), resolve = clamp(input.resolve, 0, 1);
    if (lunge >= .08)
        return { owner: 'attack', previewShapeScale: 0, attackShapeScale: 1, cueAlphaScale: 0, presentationOnly: true };
    if (pullback > 0) {
        const blend = clamp(pullback / (reducedMotion ? .42 : .72), 0, 1);
        return { owner: 'handoff', previewShapeScale: 1 - blend, attackShapeScale: blend, cueAlphaScale: 1 - blend * .82, presentationOnly: true };
    }
    if (input.anticipationVisible)
        return { owner: 'preview', previewShapeScale: 1, attackShapeScale: 0, cueAlphaScale: 1, presentationOnly: true };
    return { owner: (resolve > 0 ? 'resolve' : 'locomotion'), previewShapeScale: 0, attackShapeScale: 1, cueAlphaScale: 0, presentationOnly: true };
}
export function specialistAnticipationSilhouetteDensityBudgetPresentation(input, reducedMotion = false) {
    const count = Math.max(0, Math.floor(input.activeCount)), index = Math.max(0, Math.floor(input.indexFromNewest)), urgency = clamp(input.urgency, 0, 1);
    if (input.owner === 'strike' || input.owner === 'resolve' || input.owner === 'locomotion')
        return { previewEffectStrength: 0, cueAlphaScale: input.owner === 'strike' ? 0 : 1, bodyAlphaScale: 1, capacity: 0, presentationOnly: true };
    if (count <= 2)
        return { previewEffectStrength: 1, cueAlphaScale: 1, bodyAlphaScale: 1, capacity: count, presentationOnly: true };
    let capacity = input.type === 'siegeGolem' ? 4 : input.type === 'assassin' ? 2 : 3;
    if (urgency >= .88)
        capacity += 1;
    if (input.owner === 'windup')
        capacity += 1;
    if (reducedMotion)
        capacity -= 1;
    capacity = Math.max(1, capacity);
    const visible = index < capacity, strength = visible ? Math.min(1, .58 + .42 * urgency) : 0, cueAlphaScale = visible ? Math.min(1, .64 + .36 * urgency) : 0;
    return { previewEffectStrength: strength, cueAlphaScale, bodyAlphaScale: 1, capacity, presentationOnly: true };
}
export function specialistAttackSilhouetteRecoveryTrailPresentation(input, reducedMotion = false) {
    const ax = Number.isFinite(input.attackFacingX) ? input.attackFacingX : 1, ay = Number.isFinite(input.attackFacingY) ? input.attackFacingY : 0, al = Math.hypot(ax, ay) || 1, rx = Number.isFinite(input.recoveryFacingX) ? input.recoveryFacingX : ax, ry = Number.isFinite(input.recoveryFacingY) ? input.recoveryFacingY : ay, rl = Math.hypot(rx, ry) || 1, lunge = clamp(input.lunge, 0, 1), resolve = clamp(input.resolve, 0, 1), rawBlend = clamp(Math.max(input.recoveryBlend, resolve * .82), 0, 1), blend = clamp(rawBlend * (reducedMotion ? 1.08 : 1), 0, 1);
    if (lunge > .08)
        return { owner: 'attack', facingX: ax / al, facingY: ay / al, trailAlphaScale: 1, trailDistanceScale: 1, recoveryBlend: 0, presentationOnly: true };
    if (blend <= .04)
        return { owner: 'locomotion', facingX: rx / rl, facingY: ry / rl, trailAlphaScale: 1, trailDistanceScale: 1, recoveryBlend: 0, presentationOnly: true };
    const bx = ax / al * (1 - blend) + rx / rl * blend, by = ay / al * (1 - blend) + ry / rl * blend, bl = Math.hypot(bx, by) || 1, owner = (blend >= .9 ? 'recovery' : 'handoff'), roleDistance = input.type === 'siegeGolem' ? .9 : input.type === 'assassin' ? .78 : .84, trailDistanceScale = Math.max(.42, 1 - blend * (1 - roleDistance)) * (reducedMotion ? .78 : 1), trailAlphaScale = Math.max(.42, 1 - blend * .46);
    return { owner, facingX: bx / bl, facingY: by / bl, trailAlphaScale, trailDistanceScale, recoveryBlend: blend, presentationOnly: true };
}
export function specialistRecoveryTrailSilhouetteHandoffPresentation(input, reducedMotion = false) {
    const blend = clamp(input.recoveryBlend, 0, 1);
    if (input.trailOwner === 'attack')
        return { owner: 'attack', recoveryTrailAlphaScale: 1, locomotionTrailAlphaScale: 0, presentationOnly: true };
    if (input.trailOwner === 'locomotion' || input.trailOwner === 'recovery' && blend >= .9 || input.silhouetteOwner === 'locomotion' && blend >= .88)
        return { owner: 'locomotion', recoveryTrailAlphaScale: Math.max(0, .22 * (1 - blend)), locomotionTrailAlphaScale: 1, presentationOnly: true };
    const recoveryBase = (.74 * (1 - blend) + .12) * (reducedMotion ? .72 : 1), locomotionBase = .2 + .72 * blend, total = recoveryBase + locomotionBase, scale = total > 1.18 ? 1.18 / total : 1;
    return { owner: 'handoff', recoveryTrailAlphaScale: recoveryBase * scale, locomotionTrailAlphaScale: locomotionBase * scale, presentationOnly: true };
}
export function specialistRecoveryTrailDensityBudgetPresentation(input, reducedMotion = false) {
    const count = Math.max(0, Math.floor(input.activeCount)), index = Math.max(0, Math.floor(input.indexFromNewest));
    if (input.owner === 'locomotion')
        return { effectStrength: 0, bodyAlphaScale: 1, capacity: 0, presentationOnly: true };
    if (count <= 2)
        return { effectStrength: 1, bodyAlphaScale: 1, capacity: count, presentationOnly: true };
    const baseCapacity = input.type === 'siegeGolem' ? 4 : input.type === 'assassin' ? 2 : 3, capacity = Math.max(1, baseCapacity - (reducedMotion ? 1 : 0)), visible = index < capacity;
    const blend = clamp(input.recoveryBlend, 0, 1), base = input.owner === 'attack' ? .9 : .82 - .18 * blend, effectStrength = visible ? Math.max(.58, base - index * .08) : 0;
    return { effectStrength, bodyAlphaScale: 1, capacity, presentationOnly: true };
}
export function specialistRecoveryTrailLocomotionCadencePresentation(input, reducedMotion = false) {
    const blend = clamp(input.recoveryBlend, 0, 1), motion = clamp(input.motionBlend, 0, 1), signature = clamp(input.signatureStrength, 0, 1);
    if (input.trailOwner === 'attack')
        return { owner: 'recovery', recoveryTrailAlphaScale: 1, locomotionCadenceScale: 0, presentationOnly: true };
    if (input.trailOwner === 'locomotion' || blend >= .9)
        return { owner: 'locomotion', recoveryTrailAlphaScale: .12 * (1 - blend), locomotionCadenceScale: 1, presentationOnly: true };
    if (input.trailOwner === 'recovery' && blend < .48) {
        const cadence = clamp(blend * .62 * motion * (.72 + .28 * signature), 0, .42);
        return { owner: 'recovery', recoveryTrailAlphaScale: (reducedMotion ? .72 : .92), locomotionCadenceScale: cadence, presentationOnly: true };
    }
    const t = clamp((blend - .38) / .48, 0, 1), overlapScale = reducedMotion ? .72 : 1, recovery = (1 - t) * .78 * overlapScale, cadence = clamp((.28 + .72 * t) * (.82 + .18 * motion) * (.88 + .12 * signature), 0, 1);
    return { owner: 'handoff', recoveryTrailAlphaScale: recovery, locomotionCadenceScale: cadence, presentationOnly: true };
}
export function specialistRecoveryLocomotionCadenceHandoffPresentation(input, reducedMotion = false) {
    const blend = clamp(input.recoveryBlend, 0, 1), motion = clamp(input.motionBlend, 0, 1), cadence = clamp(input.cadenceScale, 0, 1);
    if (input.owner === 'locomotion' || blend >= .9)
        return { owner: 'locomotion', trailAlphaScale: 1, signatureAlphaScale: 1, cadenceScale: 1, presentationOnly: true };
    if (input.owner === 'recovery' && blend < .48)
        return { owner: 'recovery', trailAlphaScale: reducedMotion ? .76 : 1, signatureAlphaScale: Math.min(.42, cadence * .6), cadenceScale: Math.min(.48, cadence), presentationOnly: true };
    const t = clamp((blend - .4) / .46, 0, 1), overlap = reducedMotion ? .74 : 1, trail = (.72 * (1 - t) + .28) * overlap, signature = clamp(.28 + .72 * t, 0, 1), nextCadence = clamp(Math.max(cadence, .34 + .66 * t) * (.88 + .12 * motion), 0, 1);
    return { owner: 'handoff', trailAlphaScale: trail, signatureAlphaScale: signature, cadenceScale: nextCadence, presentationOnly: true };
}
export function specialistRecoveryLocomotionCadenceDensityBudgetPresentation(input, reducedMotion = false) {
    const count = Math.max(0, Math.floor(input.activeCount)), index = Math.max(0, Math.floor(input.indexFromNewest));
    if (input.owner === 'locomotion')
        return { effectStrength: 0, bodyAlphaScale: 1, canonicalCadenceScale: 1, capacity: 0, presentationOnly: true };
    if (count <= 2)
        return { effectStrength: 1, bodyAlphaScale: 1, canonicalCadenceScale: 1, capacity: count, presentationOnly: true };
    let capacity = input.type === 'siegeGolem' ? 4 : input.type === 'assassin' ? 2 : 3;
    if (input.owner === 'recovery')
        capacity += 1;
    if (reducedMotion)
        capacity = Math.max(1, capacity - 1);
    const visible = index < capacity, effectStrength = visible ? Math.max(.58, .84 - index * .07) : 0;
    return { effectStrength, bodyAlphaScale: 1, canonicalCadenceScale: 1, capacity, presentationOnly: true };
}
export function specialistLocomotionTurnStopReattackRhythmPresentation(input, reducedMotion = false) {
    const motion = clamp(input.motionBlend, 0, 1), turn = Math.abs(clamp(input.turn, -1, 1)), recovery = clamp(input.recovery, 0, 1), readiness = clamp(input.attackReadiness, 0, 1), motionScale = reducedMotion ? .78 : 1;
    if (readiness >= .72 && recovery < .58)
        return { owner: 'reattack', cadenceScale: clamp(.68 + .32 * readiness, 0, 1), turnEmphasis: turn * .28, stopEmphasis: 0, reattackScale: clamp(.66 + .34 * readiness, 0, 1), trailDistanceScale: .86 + .14 * readiness, presentationOnly: true };
    if (recovery >= .64 || motion <= .16) {
        const stop = clamp(Math.max(recovery, 1 - motion), 0, 1);
        return { owner: 'stop', cadenceScale: clamp(.18 + .34 * motion, 0, .56), turnEmphasis: turn * .34, stopEmphasis: stop, reattackScale: 0, trailDistanceScale: (.62 + .18 * (1 - stop)) * motionScale, presentationOnly: true };
    }
    if (turn >= .58) {
        return { owner: 'turn', cadenceScale: clamp((1 - turn * .52) * (.78 + .22 * motion), .34, .74), turnEmphasis: turn, stopEmphasis: recovery * .28, reattackScale: readiness * .36, trailDistanceScale: (.72 + .2 * (1 - turn)) * motionScale, presentationOnly: true };
    }
    return { owner: 'locomotion', cadenceScale: clamp(.86 + .14 * motion, 0, 1), turnEmphasis: turn * .24, stopEmphasis: recovery * .18, reattackScale: readiness * .4, trailDistanceScale: 1, presentationOnly: true };
}
export function specialistTurnStopReattackHandoffPresentation(input, reducedMotion = false) {
    const cadence = clamp(input.cadenceScale, 0, 1), reattack = clamp(input.reattackScale, 0, 1), motion = clamp(input.motionBlend, 0, 1);
    if (input.owner === 'locomotion')
        return { owner: 'locomotion', cadenceScale: 1, turnStopScale: 0, reattackScale: 0, bodyAlphaScale: 1, presentationOnly: true };
    if (input.owner === 'turn' || input.owner === 'stop')
        return { owner: input.owner, cadenceScale: cadence, turnStopScale: (reducedMotion ? .74 : 1), reattackScale: reattack * .32, bodyAlphaScale: 1, presentationOnly: true };
    if (motion >= .84)
        return { owner: 'locomotion', cadenceScale: 1, turnStopScale: 0, reattackScale: reattack, bodyAlphaScale: 1, presentationOnly: true };
    const t = clamp(.35 + .65 * Math.max(motion, reattack), 0, 1), turnStop = (1 - t * .76) * (reducedMotion ? .68 : 1);
    return { owner: 'handoff', cadenceScale: clamp(Math.max(cadence, .48 + .52 * t), 0, 1), turnStopScale: turnStop, reattackScale: clamp(reattack, 0, 1), bodyAlphaScale: 1, presentationOnly: true };
}
export function specialistTurnStopReattackDensityBudgetPresentation(input, reducedMotion = false) {
    const count = Math.max(0, Math.floor(input.activeCount)), index = Math.max(0, Math.floor(input.indexFromNewest));
    if (input.owner === 'locomotion')
        return { effectStrength: 0, bodyAlphaScale: 1, canonicalCadenceScale: 1, capacity: 0, presentationOnly: true };
    if (count <= 2)
        return { effectStrength: 1, bodyAlphaScale: 1, canonicalCadenceScale: 1, capacity: count, presentationOnly: true };
    let capacity = input.type === 'siegeGolem' ? 4 : input.type === 'assassin' ? 2 : 3;
    if (input.owner === 'turn' || input.owner === 'stop')
        capacity += 1;
    if (reducedMotion)
        capacity = Math.max(1, capacity - 1);
    const visible = index < capacity, effectStrength = visible ? Math.max(.56, .84 - index * .07) : 0;
    return { effectStrength, bodyAlphaScale: 1, canonicalCadenceScale: 1, capacity, presentationOnly: true };
}
