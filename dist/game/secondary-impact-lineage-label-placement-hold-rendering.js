import { SECONDARY_IMPACT_LABEL_PRIMARY_CLEARANCE, SECONDARY_IMPACT_LABEL_SCREEN_INSET, SECONDARY_IMPACT_LABEL_SECONDARY_CLEARANCE } from './secondary-impact-lineage-label-placement-rendering.js';
export const SECONDARY_IMPACT_LABEL_PLACEMENT_HOLD_SECONDS = .14;
export const SECONDARY_IMPACT_LABEL_PLACEMENT_MEMORY_SECONDS = .42;
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const clear = (pos, blockers, occupied, width, height) => pos.x >= SECONDARY_IMPACT_LABEL_SCREEN_INSET && pos.x <= width - SECONDARY_IMPACT_LABEL_SCREEN_INSET && pos.y >= SECONDARY_IMPACT_LABEL_SCREEN_INSET && pos.y <= height - SECONDARY_IMPACT_LABEL_SCREEN_INSET && blockers.every(b => distance(pos, b) >= SECONDARY_IMPACT_LABEL_PRIMARY_CLEARANCE) && occupied.every(b => distance(pos, b) >= SECONDARY_IMPACT_LABEL_SECONDARY_CLEARANCE);
export function advanceSecondaryImpactLineageLabelPlacementHold(memory, dt) { const delta = Math.max(0, Number.isFinite(dt) ? dt : 0); return memory.map(e => ({ ...e, pos: { ...e.pos }, holdRemaining: Math.max(0, e.holdRemaining - delta), memoryRemaining: e.memoryRemaining - delta })).filter(e => e.memoryRemaining > 0); }
export function secondaryImpactLineageHeldPlacement(memory, lineageKey, fallback, blockers, occupied, width, height) {
    const existing = memory.find(e => e.lineageKey === lineageKey);
    if (!fallback.visible) {
        return { placement: { visible: false, pos: { ...fallback.pos }, presentationOnly: true }, memory: memory.filter(e => e.lineageKey !== lineageKey).map(e => ({ ...e, pos: { ...e.pos } })) };
    }
    if (existing && existing.holdRemaining > 0 && clear(existing.pos, blockers, occupied, width, height))
        return { placement: { visible: true, pos: { ...existing.pos }, presentationOnly: true }, memory: memory.map(e => ({ ...e, pos: { ...e.pos } })) };
    if (!clear(fallback.pos, blockers, occupied, width, height))
        return { placement: { visible: false, pos: { ...fallback.pos }, presentationOnly: true }, memory: memory.filter(e => e.lineageKey !== lineageKey).map(e => ({ ...e, pos: { ...e.pos } })) };
    const next = { lineageKey, pos: { ...fallback.pos }, holdRemaining: SECONDARY_IMPACT_LABEL_PLACEMENT_HOLD_SECONDS, memoryRemaining: SECONDARY_IMPACT_LABEL_PLACEMENT_MEMORY_SECONDS, presentationOnly: true };
    return { placement: { visible: true, pos: { ...fallback.pos }, presentationOnly: true }, memory: [...memory.filter(e => e.lineageKey !== lineageKey).map(e => ({ ...e, pos: { ...e.pos } })), next] };
}
