const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, Number.isFinite(v) ? v : 0));
export function characterMotionLayerBudgetPresentation(kind, input, reducedMotion = false) {
    const attack = clamp(input.attack), recovery = clamp(input.recovery), hit = clamp(input.hit), special = clamp(input.special), raw = attack + recovery + hit + special;
    if (raw <= .02)
        return { owner: 'neutral', attackScale: 1, recoveryScale: 1, hitScale: 1, specialScale: 1, totalLoad: 0, presentationOnly: true };
    const scores = [{ owner: 'attack', score: attack }, { owner: 'recovery', score: recovery * .86 }, { owner: 'hit', score: hit * (kind === 'boss' ? 1.08 : 1.04) }, { owner: 'special', score: special * 1.22 }];
    const owner = (special >= .35 ? 'special' : scores.sort((a, b) => b.score - a.score || a.owner.localeCompare(b.owner))[0].owner);
    if (raw <= 1.05) {
        return { owner, attackScale: 1, recoveryScale: 1, hitScale: 1, specialScale: 1, totalLoad: raw, presentationOnly: true };
    }
    const tight = reducedMotion;
    let attackScale = 1, recoveryScale = 1, hitScale = 1, specialScale = 1;
    if (owner === 'special') {
        attackScale = tight ? .3 : .4;
        recoveryScale = tight ? .24 : .32;
        hitScale = tight ? .42 : .5;
    }
    else if (owner === 'hit') {
        attackScale = tight ? .32 : .48;
        recoveryScale = tight ? .3 : .42;
        specialScale = tight ? .62 : .74;
    }
    else if (owner === 'attack') {
        recoveryScale = tight ? .32 : .46;
        hitScale = tight ? .48 : .64;
        specialScale = tight ? .6 : .72;
    }
    else if (owner === 'recovery') {
        attackScale = tight ? .34 : .5;
        hitScale = tight ? .5 : .68;
        specialScale = tight ? .62 : .74;
    }
    const totalLoad = attack * attackScale + recovery * recoveryScale + hit * hitScale + special * specialScale;
    return { owner, attackScale, recoveryScale, hitScale, specialScale, totalLoad, presentationOnly: true };
}
