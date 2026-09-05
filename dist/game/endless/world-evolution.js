import { clamp } from '../../core/math.js';
import { nextFloat, pickWeighted } from './rng.js';
const EVOLVABLE = ['stormfront', 'ruins', 'mana_bloom', 'blood_moon', 'sanctuary'];
export function createDefaultWorldState() {
    return { current: 'calm', evolutionCount: 0, lastEvolutionAtMs: 0, nodes: [] };
}
export function shouldEvolveWorld(state, elapsedMs) {
    return elapsedMs >= (state.evolutionCount + 1) * 8 * 60_000;
}
function worldWeight(world, legacy) {
    let weight = 1;
    if (legacy.fate === 'guardian' && world === 'sanctuary')
        weight += 1;
    if (legacy.fate === 'guardian' && world === 'ruins')
        weight += 0.5;
    if (legacy.fate === 'frenzy' && world === 'blood_moon')
        weight += 1;
    if (legacy.fate === 'gold' && world === 'blood_moon')
        weight += 0.6;
    if (legacy.spellFusionCount > 0 && world === 'mana_bloom')
        weight += 0.75;
    if (legacy.threat >= 4 && world === 'stormfront')
        weight += 0.4;
    return weight;
}
function nodePlan(world) {
    switch (world) {
        case 'stormfront': return { kind: 'safe_corridor', count: 1, radius: 0.25, ttlMs: 45_000 };
        case 'ruins': return { kind: 'barricade', count: 2, radius: 0.12, ttlMs: 80_000 };
        case 'mana_bloom': return { kind: 'mana_well', count: 2, radius: 0.1, ttlMs: 60_000 };
        case 'blood_moon': return { kind: 'volatile_zone', count: 2, radius: 0.14, ttlMs: 55_000 };
        case 'sanctuary': return { kind: 'sanctuary_zone', count: 2, radius: 0.13, ttlMs: 65_000 };
    }
}
function makeNodes(world, elapsedMs, evolutionCount, rng) {
    const plan = nodePlan(world);
    const nodes = [];
    let nextRng = rng;
    for (let i = 0; i < plan.count; i += 1) {
        const rx = nextFloat(nextRng);
        nextRng = rx.state;
        const ry = nextFloat(nextRng);
        nextRng = ry.state;
        nodes.push({
            nodeId: `world-${evolutionCount + 1}-${world}-${i + 1}`,
            kind: plan.kind,
            x: clamp(0.08 + rx.value * 0.84, 0, 1),
            y: clamp(0.08 + ry.value * 0.84, 0, 1),
            radius: plan.radius,
            expiresAtMs: elapsedMs + plan.ttlMs,
        });
    }
    return { nodes, rng: nextRng };
}
export function evolveWorld(legacy, state, rng) {
    const candidates = EVOLVABLE.filter((world) => world !== state.current);
    const picked = pickWeighted(candidates.map((world) => ({ value: world, weight: worldWeight(world, legacy) })), rng);
    const nodeResult = makeNodes(picked.value, legacy.elapsedMs, state.evolutionCount, picked.state);
    const nextState = {
        current: picked.value,
        evolutionCount: state.evolutionCount + 1,
        lastEvolutionAtMs: legacy.elapsedMs,
        nodes: nodeResult.nodes,
    };
    const effects = [
        { type: 'world_evolved', world: picked.value },
        ...nodeResult.nodes.map((node) => ({
            type: 'spawn_field_node', nodeId: node.nodeId, kind: node.kind,
            x: node.x, y: node.y, radius: node.radius, expiresAtMs: node.expiresAtMs,
        })),
    ];
    return { state: nextState, rng: nodeResult.rng, effects };
}
export function getWorldModifiers(world, threat) {
    const t = clamp(threat, 0, 5);
    const base = {
        spawnMultiplier: 1,
        projectileMultiplier: 1,
        eliteMultiplier: 1,
        goldMultiplier: 1,
        masteryMultiplier: 1,
        coreRecoveryMultiplier: 1,
        normalSpellCadenceMultiplier: 1,
        siegePressureMultiplier: 1,
    };
    switch (world) {
        case 'calm': return base;
        case 'stormfront': return { ...base, spawnMultiplier: clamp(1.03 + t * 0.015, 0.8, 1.35), projectileMultiplier: clamp(1.1 + t * 0.02, 0.8, 1.35) };
        case 'ruins': return { ...base, spawnMultiplier: 0.96, eliteMultiplier: clamp(1.03 + t * 0.02, 0.8, 1.4), siegePressureMultiplier: clamp(1.12 + t * 0.025, 0.8, 1.4) };
        case 'mana_bloom': return { ...base, spawnMultiplier: 1.02, normalSpellCadenceMultiplier: 0.9, masteryMultiplier: clamp(1.08 + t * 0.01, 0.8, 1.4) };
        case 'blood_moon': return { ...base, spawnMultiplier: clamp(1.08 + t * 0.025, 0.8, 1.35), eliteMultiplier: clamp(1.12 + t * 0.03, 0.8, 1.4), goldMultiplier: clamp(1.12 + t * 0.025, 0.8, 1.4), masteryMultiplier: clamp(1.08 + t * 0.02, 0.8, 1.4) };
        case 'sanctuary': return { ...base, spawnMultiplier: 0.92, projectileMultiplier: 0.94, coreRecoveryMultiplier: clamp(1.2 + t * 0.03, 0.8, 1.5) };
    }
}
export function pruneExpiredNodes(state, elapsedMs) {
    return { ...state, nodes: state.nodes.filter((node) => node.expiresAtMs > elapsedMs) };
}
export function consumeFieldNode(state, nodeId) {
    const consumed = state.nodes.find((node) => node.nodeId === nodeId);
    if (!consumed)
        return { state, consumed: undefined };
    return { state: { ...state, nodes: state.nodes.filter((node) => node.nodeId !== nodeId) }, consumed };
}
