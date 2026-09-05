export const DECISION_TRANSITION_BARRIER_MS = 160;
export function nextDecisionKind(state) {
    if (state.fate)
        return 'fate';
    if (state.heroAscension)
        return 'heroAscension';
    if (state.runContract)
        return 'runContract';
    if (state.bossRewardCount > 0)
        return 'bossReward';
    if (state.levelUpCount > 0)
        return 'levelUp';
    return null;
}
export class DecisionPickGuard {
    generation = 0;
    activeGeneration = 0;
    consumedGeneration = 0;
    blockedUntilMs = 0;
    render(nowMs, transition) {
        const generation = ++this.generation;
        this.activeGeneration = generation;
        this.consumedGeneration = 0;
        if (transition)
            this.blockedUntilMs = Math.max(this.blockedUntilMs, nowMs + DECISION_TRANSITION_BARRIER_MS);
        return generation;
    }
    accept(generation, nowMs) {
        if (generation !== this.activeGeneration || generation === this.consumedGeneration || nowMs < this.blockedUntilMs)
            return false;
        this.consumedGeneration = generation;
        return true;
    }
    resetTransient(nowMs) {
        this.generation += 1;
        this.activeGeneration = 0;
        this.consumedGeneration = 0;
        this.blockedUntilMs = Math.max(this.blockedUntilMs, nowMs + DECISION_TRANSITION_BARRIER_MS);
    }
}
