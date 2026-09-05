import { isSpecialistIntentType } from './specialist-intent-identity-assets.js';
export function autoTargetIndicator(target, _heroPos, _corePos) {
    if (!target || !target.alive)
        return null;
    const label = target.target === 'core' ? 'AUTO · CORE' : target.type === 'boss' ? 'AUTO · BOSS' : target.type === 'elite' ? 'AUTO · ELITE' : ['bomber', 'nullifier', 'assassin', 'siegeGolem'].includes(target.type) ? 'AUTO · THREAT' : 'AUTO';
    const urgency = target.target === 'core' || target.type === 'boss' ? 1 : target.type === 'elite' ? .82 : .62;
    return { label, accent: target.target === 'core' ? '#ff7a7a' : target.type === 'boss' ? '#ffd36d' : '#8fe9ff', radius: Math.max(24, Math.min(96, target.type === 'boss' ? 72 : target.type === 'elite' ? 48 : 36)), urgency, specialistIntent: isSpecialistIntentType(target.type) ? target.type : null };
}
export function primaryWeakpointNode(nodes, heroPos) {
    const live = nodes.filter((node) => node.alive && node.hp > 0);
    if (live.length === 0)
        return null;
    return [...live].sort((a, b) => {
        const ar = a.hp / Math.max(1, a.maxHp), br = b.hp / Math.max(1, b.maxHp);
        if (Math.abs(ar - br) > .001)
            return ar - br;
        const ad = Math.hypot(a.pos.x - heroPos.x, a.pos.y - heroPos.y), bd = Math.hypot(b.pos.x - heroPos.x, b.pos.y - heroPos.y);
        if (Math.abs(ad - bd) > .001)
            return ad - bd;
        return a.id - b.id;
    })[0] ?? null;
}
export function weakpointIndicator(node, primary = true) {
    if (!node.alive || node.hp <= 0)
        return null;
    const hpRatio = Math.max(0, Math.min(1, node.hp / Math.max(1, node.maxHp)));
    const urgency = .55 + (1 - hpRatio) * .45;
    return { label: primary ? '약점' : '', accent: '#ffd76a', radius: Math.min(52, node.radius + (primary ? 14 : 10)), urgency: primary ? urgency : Math.max(.3, urgency * .68), specialistIntent: null };
}
