const c = (v) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
export function bossAnticipationOriginLockPresentation(input, reducedMotion = false) {
    const charge = c(input.charge), recovery = c(input.recovery), stagger = c(input.stagger), handoff = c(input.handoffStrength), canHold = stagger < .45 && recovery < .55 && charge > .28 && handoff > .34;
    const forceBody = stagger >= .45 || recovery >= .7;
    const owner = forceBody ? 'body' : input.desiredOwner === 'ground-rebase' || canHold ? 'ground-rebase' : 'body', lockStrength = owner === 'ground-rebase' ? c((input.desiredOwner === 'ground-rebase' ? .62 : .34) + handoff * .34 + charge * .18 - recovery * .42 - stagger) : 0;
    const dx = Number.isFinite(input.desiredOffsetX) ? input.desiredOffsetX : 0, dy = Number.isFinite(input.desiredOffsetY) ? input.desiredOffsetY : 0, rx = Number.isFinite(input.rebaseOffsetX) ? input.rebaseOffsetX : 0, ry = Number.isFinite(input.rebaseOffsetY) ? input.rebaseOffsetY : 0;
    const blend = (reducedMotion ? .66 : 1) * lockStrength;
    return { owner, offsetX: dx + (rx - dx) * blend, offsetY: dy + (ry - dy) * blend, lockStrength, presentationOnly: true };
}
