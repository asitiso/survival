import { distance } from '../core/math.js';
export function autoWeakpointAimPoint(input) {
    const target = input.target;
    if (!target)
        return null;
    if (!input.autoAim || target.type !== 'boss' || input.activeBossId !== target.id)
        return { ...target.pos };
    const maxDistance = input.maxAimDistance ?? 760;
    const live = input.nodes.filter((node) => node.alive && node.hp > 0 && distance(input.heroPos, node.pos) <= maxDistance);
    if (live.length === 0)
        return { ...target.pos };
    const primary = [...live].sort((a, b) => {
        const ar = a.hp / Math.max(1, a.maxHp), br = b.hp / Math.max(1, b.maxHp);
        if (Math.abs(ar - br) > .001)
            return ar - br;
        const ad = distance(input.heroPos, a.pos), bd = distance(input.heroPos, b.pos);
        if (Math.abs(ad - bd) > .001)
            return ad - bd;
        return a.id - b.id;
    })[0];
    return primary ? { ...primary.pos } : { ...target.pos };
}
