const c = (v, min = 0, max = 1) => Math.max(min, Math.min(max, v));
export function specialistSilhouetteCrowdBudgetPresentation(input, reducedMotion = false) {
    const count = Math.max(0, Math.floor(input.specialistCount)), hit = c(input.hit);
    let density = count <= 3 ? 1 : Math.max(.48, 1 - (count - 3) * .08);
    if (input.owner === 'strike')
        density = Math.min(1, density + .08);
    else if (input.owner === 'resolve')
        density = Math.max(.4, density - .1);
    else if (input.owner === 'windup')
        density = Math.max(.46, density - .04);
    else if (input.owner === 'hit')
        density *= .46;
    density *= 1 - hit * (input.owner === 'hit' ? .25 : .12);
    let trailScale = count <= 2 ? 1 : Math.max(.42, density - .08), shapeScale = count <= 3 ? 1 : Math.max(.62, .82 + density * .18);
    if (input.owner === 'hit')
        shapeScale *= .72;
    if (reducedMotion) {
        trailScale = Math.min(trailScale, .5);
        shapeScale = Math.min(shapeScale, .78);
    }
    return { alphaScale: c(density), trailScale: c(trailScale), shapeScale: c(shapeScale, .4, 1), presentationOnly: true };
}
