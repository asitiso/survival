function mix(seed, cursor) {
    let x = (seed ^ Math.imul(cursor + 1, 0x9e3779b9)) >>> 0;
    x ^= x >>> 16;
    x = Math.imul(x, 0x7feb352d) >>> 0;
    x ^= x >>> 15;
    x = Math.imul(x, 0x846ca68b) >>> 0;
    x ^= x >>> 16;
    return x >>> 0;
}
export function nextFloat(state) {
    const bits = mix(state.seed >>> 0, state.cursor >>> 0);
    return {
        value: bits / 0x1_0000_0000,
        state: { seed: state.seed >>> 0, cursor: state.cursor + 1 },
    };
}
export function pickWeighted(items, state) {
    const eligible = items.filter((item) => Number.isFinite(item.weight) && item.weight > 0);
    if (eligible.length === 0)
        throw new Error('pickWeighted requires at least one positive weight');
    const total = eligible.reduce((sum, item) => sum + item.weight, 0);
    const random = nextFloat(state);
    let target = random.value * total;
    for (const item of eligible) {
        target -= item.weight;
        if (target < 0)
            return { value: item.value, state: random.state };
    }
    return { value: eligible[eligible.length - 1].value, state: random.state };
}
