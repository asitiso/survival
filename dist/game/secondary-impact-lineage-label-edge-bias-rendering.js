import { SECONDARY_IMPACT_LABEL_PRIMARY_CLEARANCE, SECONDARY_IMPACT_LABEL_SCREEN_INSET, SECONDARY_IMPACT_LABEL_SECONDARY_CLEARANCE } from './secondary-impact-lineage-label-placement-rendering.js';
export const SECONDARY_IMPACT_LABEL_EDGE_BIAS_ZONE = 64;
export const SECONDARY_IMPACT_LABEL_EDGE_BIAS_MAX_SHIFT = 14;
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y), clamp = (v, min, max) => Math.max(min, Math.min(max, v));
function axisBias(value, max) { if (value < SECONDARY_IMPACT_LABEL_EDGE_BIAS_ZONE)
    return SECONDARY_IMPACT_LABEL_EDGE_BIAS_MAX_SHIFT * (1 - value / SECONDARY_IMPACT_LABEL_EDGE_BIAS_ZONE); if (value > max - SECONDARY_IMPACT_LABEL_EDGE_BIAS_ZONE)
    return -SECONDARY_IMPACT_LABEL_EDGE_BIAS_MAX_SHIFT * (1 - (max - value) / SECONDARY_IMPACT_LABEL_EDGE_BIAS_ZONE); return 0; }
export function secondaryImpactLineageLabelEdgeBias(input) {
    const width = Math.max(SECONDARY_IMPACT_LABEL_SCREEN_INSET * 2 + 1, input.width), height = Math.max(SECONDARY_IMPACT_LABEL_SCREEN_INSET * 2 + 1, input.height), dx = axisBias(input.pos.x, width), dy = axisBias(input.pos.y, height);
    if (Math.abs(dx) < .001 && Math.abs(dy) < .001)
        return { pos: { ...input.pos }, biasApplied: false, presentationOnly: true };
    const candidate = { x: clamp(input.pos.x + dx, SECONDARY_IMPACT_LABEL_SCREEN_INSET, width - SECONDARY_IMPACT_LABEL_SCREEN_INSET), y: clamp(input.pos.y + dy, SECONDARY_IMPACT_LABEL_SCREEN_INSET, height - SECONDARY_IMPACT_LABEL_SCREEN_INSET) };
    const primaryClear = input.blockers.every(b => distance(candidate, b) >= SECONDARY_IMPACT_LABEL_PRIMARY_CLEARANCE), secondaryClear = input.occupied.every(b => distance(candidate, b) >= SECONDARY_IMPACT_LABEL_SECONDARY_CLEARANCE);
    return primaryClear && secondaryClear ? { pos: candidate, biasApplied: true, presentationOnly: true } : { pos: { ...input.pos }, biasApplied: false, presentationOnly: true };
}
