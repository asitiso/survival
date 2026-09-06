export const CORE_GUARD_SOURCE_HOLD_SECONDS = .18;
const classify = (source) => source === 'projectile' ? 'projectile' : source === 'contact' ? 'contact' : 'other';
export function createCoreGuardDamageSourceHysteresisState() { return { sourceClass: 'other', holdRemaining: 0, mixedPressure: false, presentationOnly: true }; }
export function advanceCoreGuardDamageSourceHysteresis(previous, incomingSource, dt) {
    const incoming = classify(incomingSource), remaining = Math.max(0, previous.holdRemaining - Math.max(0, Number.isFinite(dt) ? dt : 0));
    if (incoming === 'other')
        return { ...previous, holdRemaining: remaining, presentationOnly: true };
    if (previous.sourceClass === 'other' || previous.sourceClass === incoming)
        return { sourceClass: incoming, holdRemaining: CORE_GUARD_SOURCE_HOLD_SECONDS, mixedPressure: false, presentationOnly: true };
    if (remaining > 0)
        return { ...previous, holdRemaining: remaining, mixedPressure: true, presentationOnly: true };
    return { sourceClass: incoming, holdRemaining: CORE_GUARD_SOURCE_HOLD_SECONDS, mixedPressure: false, presentationOnly: true };
}
