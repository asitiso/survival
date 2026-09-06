export function safeLaneCombatAttentionBudgetPresentation(input, reducedFlash = false) {
    const critical = input.coreCritical ? 'core' : input.heroCritical ? 'hero' : 'none';
    let primaryAlphaScale = 1, bridgeAlphaScale = 1, arrivalAlphaScale = 1, detailVisible = true, directionVisible = true, identityOwner = 'navigation';
    if (input.lawActive) {
        primaryAlphaScale = .78;
        bridgeAlphaScale = .38;
        arrivalAlphaScale = .72;
        detailVisible = false;
        directionVisible = false;
        identityOwner = 'law';
    }
    if (critical === 'hero') {
        primaryAlphaScale = Math.min(primaryAlphaScale, .72);
        bridgeAlphaScale = Math.min(bridgeAlphaScale, .46);
        arrivalAlphaScale = Math.min(arrivalAlphaScale, .74);
        detailVisible = false;
        directionVisible = false;
        if (!input.lawActive)
            identityOwner = 'combat';
    }
    if (critical === 'core') {
        primaryAlphaScale = Math.min(primaryAlphaScale, .64);
        bridgeAlphaScale = Math.min(bridgeAlphaScale, .34);
        arrivalAlphaScale = Math.min(arrivalAlphaScale, .64);
        detailVisible = false;
        directionVisible = false;
        if (!input.lawActive)
            identityOwner = 'combat';
    }
    if (reducedFlash) {
        primaryAlphaScale *= .9;
        bridgeAlphaScale *= .82;
        arrivalAlphaScale *= .86;
    }
    return { critical, primaryAlphaScale, bridgeAlphaScale, arrivalAlphaScale, detailVisible, directionVisible, identityOwner, presentationOnly: true };
}
