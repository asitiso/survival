function fnv1a(input, seed) {
    let hash = seed >>> 0;
    for (let i = 0; i < input.length; i += 1) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash >>> 0;
}
function block(value) {
    return value.toString(36).toUpperCase().padStart(7, '0').slice(-4);
}
export function buildRunFingerprint(input) {
    const canonical = [
        input.heroId,
        `T${Math.max(0, Math.min(5, Math.floor(input.threat)))}`,
        `M${Math.floor(Math.max(0, input.elapsedSeconds) / 60)}`,
        input.relicId ?? '-',
        [...input.fusions].sort().join(','),
        [...input.fateChoices].sort().join(','),
        [...input.heroAscensions].sort().join(','),
        [...input.chronicle].sort().join(','),
    ].join('|');
    const a = fnv1a(canonical, 0x811c9dc5);
    const b = fnv1a([...canonical].reverse().join(''), 0x9e3779b9);
    return `ARC-${block(a)}-${block(b)}`;
}
