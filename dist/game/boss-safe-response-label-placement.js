export const BOSS_SAFE_RESPONSE_LABEL_SCREEN_INSET = 18;
export const BOSS_SAFE_RESPONSE_LABEL_ANCHOR_CLEARANCE = 56;
const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
export function bossSafeResponseLabelPlacement(input) {
    const width = Math.max(BOSS_SAFE_RESPONSE_LABEL_SCREEN_INSET * 2, input.width), height = Math.max(BOSS_SAFE_RESPONSE_LABEL_SCREEN_INSET * 2, input.height), r = Math.max(0, input.bossRadius);
    const candidates = [
        { slot: 'above', pos: { x: input.bossPos.x, y: input.bossPos.y - r - 32 } },
        { slot: 'right', pos: { x: input.bossPos.x + r + 58, y: input.bossPos.y - 8 } },
        { slot: 'left', pos: { x: input.bossPos.x - r - 58, y: input.bossPos.y - 8 } },
        { slot: 'below', pos: { x: input.bossPos.x, y: input.bossPos.y + r + 42 } },
    ];
    const extra = input.extraProtected ?? [];
    const clean = (pos) => {
        if (pos.x < BOSS_SAFE_RESPONSE_LABEL_SCREEN_INSET || pos.x > width - BOSS_SAFE_RESPONSE_LABEL_SCREEN_INSET || pos.y < BOSS_SAFE_RESPONSE_LABEL_SCREEN_INSET || pos.y > height - BOSS_SAFE_RESPONSE_LABEL_SCREEN_INSET)
            return false;
        if (distance(pos, input.heroPos) < BOSS_SAFE_RESPONSE_LABEL_ANCHOR_CLEARANCE || distance(pos, input.corePos) < BOSS_SAFE_RESPONSE_LABEL_ANCHOR_CLEARANCE)
            return false;
        if (extra.some((anchor) => distance(pos, anchor) < Math.max(0, anchor.radius) + 18))
            return false;
        return true;
    };
    const selected = candidates.find((candidate) => clean(candidate.pos));
    if (selected)
        return { visible: true, slot: selected.slot, pos: selected.pos, animated: false, motionAmplitude: 0, presentationOnly: true };
    return { visible: false, slot: 'hidden', pos: { ...input.bossPos }, animated: false, motionAmplitude: 0, presentationOnly: true };
}
