const DEFINITIONS = {
    riftSeal: { id: 'riftSeal', name: '균열 봉인', description: '룬 안에 머물러 균열을 닫으세요.', duration: 34, accent: '#9b8cff' },
    beaconDefense: { id: 'beaconDefense', name: '비콘 방어', description: '마력 비콘을 끝까지 지키세요.', duration: 28, accent: '#75d7ff' },
    cursedAltar: { id: 'cursedAltar', name: '저주 제단', description: '저주를 받아들이고 폭주를 버티세요.', duration: 22, accent: '#ff6f91' },
};
const IDS = Object.keys(DEFINITIONS);
export function objectiveDefinition(id) {
    return DEFINITIONS[id];
}
export class BattlefieldObjectiveDirector {
    rng;
    active = null;
    nextObjectiveAt = 150;
    lastId = null;
    constructor(rng = Math.random) {
        this.rng = rng;
    }
    reset() {
        this.active = null;
        this.nextObjectiveAt = 150;
        this.lastId = null;
    }
    update(dt, elapsed, bossCountdown) {
        const transition = { started: null, ended: null };
        if (this.active) {
            this.active.remaining = Math.max(0, this.active.remaining - Math.max(0, dt));
            if (this.active.remaining <= 0) {
                transition.ended = { ...this.active };
                this.finish(elapsed);
            }
            return transition;
        }
        if (elapsed < this.nextObjectiveAt || (bossCountdown > 0 && bossCountdown <= 12))
            return transition;
        const candidates = IDS.filter((id) => id !== this.lastId);
        const roll = Math.max(0, Math.min(0.999999, this.rng()));
        const id = candidates[Math.floor(roll * candidates.length)] ?? candidates[0] ?? 'riftSeal';
        const def = objectiveDefinition(id);
        this.active = { ...def, startedAt: elapsed, remaining: def.duration };
        transition.started = { ...this.active };
        return transition;
    }
    completeActive(elapsed) {
        if (!this.active)
            return null;
        const completed = { ...this.active };
        this.finish(elapsed);
        return completed;
    }
    finish(elapsed) {
        if (this.active)
            this.lastId = this.active.id;
        this.active = null;
        const roll = Math.max(0, Math.min(1, this.rng()));
        this.nextObjectiveAt = elapsed + 85 + roll * 30;
    }
}
