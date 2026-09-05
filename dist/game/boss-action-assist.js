export const BOSS_ASSIST_CUE_MEMORY_SECONDS = .45;
export const BOSS_RESPONSE_ACK_SECONDS = .40;
const RESPONSE = {
    inferno: ['ultimate2', 'spell4', 'spell3'], summoner: ['spell4', 'ultimate1', 'spell2'], juggernaut: ['spell3', 'ultimate2', 'spell1'], abyssWitch: ['ultimate2', 'spell3', 'spell4'], twinMaw: ['ultimate1', 'spell4', 'spell3'], timeEater: ['spell3', 'ultimate2', 'spell2'],
};
export function bossResponseActions(archetype) { return RESPONSE[archetype]; }
export function bossActionAssist(input) {
    if (!Number.isFinite(input.specialTimer) || input.specialTimer < 0 || input.specialTimer > 1.05)
        return null;
    if (input.hpRatio <= .34 && input.potions > 0 && input.readyActions.has('potion'))
        return { actionId: 'potion', label: '특수기 전 회복', accent: '#79e7a9' };
    if (input.cycleAcknowledged || input.acknowledged)
        return null;
    const cueAge = input.previousCueAge ?? Infinity;
    if (input.previousCue && input.previousArchetype === input.archetype && Number.isFinite(cueAge) && cueAge >= 0 && cueAge <= BOSS_ASSIST_CUE_MEMORY_SECONDS && (input.readyActions.has(input.previousCue.actionId) || input.queuedActions?.has(input.previousCue.actionId)))
        return input.previousCue;
    const action = RESPONSE[input.archetype].find((id) => input.readyActions.has(id));
    return action ? { actionId: action, label: '특수기 대응', accent: '#ffe17a' } : null;
}
