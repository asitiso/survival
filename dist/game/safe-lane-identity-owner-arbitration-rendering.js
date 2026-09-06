export function safeLaneIdentityOwnerArbitrationPresentation(input) {
    let owner = 'none';
    if (input.attentionOwner === 'combat')
        owner = 'combat';
    else if (input.lawActive && input.lawIdAvailable)
        owner = 'law';
    else if (input.directionVisible)
        owner = 'direction';
    else if (input.mythic)
        owner = 'geometry';
    return { owner, showLawIcon: owner === 'law', showDirectionIcon: owner === 'direction', showGeometryIcon: owner === 'geometry', presentationOnly: true };
}
