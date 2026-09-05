import { distance } from '../core/math.js';
import { advanceBeaconDefense, advanceCursedAltar, advanceRiftSeal } from './objective-rules.js';
export function objectiveRewardFor(id, streak) {
    const safeStreak = Math.max(1, Math.floor(streak));
    if (id === 'riftSeal')
        return safeStreak % 2 === 0 ? [{ kind: 'shopToken', amount: 1 }] : [{ kind: 'gold', amount: 120 }];
    if (id === 'beaconDefense')
        return safeStreak % 2 === 0 ? [{ kind: 'shopToken', amount: 1 }] : [{ kind: 'potion', amount: 1 }];
    return [{ kind: 'gold', amount: 180 }, { kind: 'temporaryPower', amount: 20 }];
}
export class ObjectiveRuntime {
    active = null;
    stats = { completed: 0, failed: 0, currentStreak: 0, bestStreak: 0 };
    reset() {
        this.active = null;
        this.stats.completed = 0;
        this.stats.failed = 0;
        this.stats.currentStreak = 0;
        this.stats.bestStreak = 0;
    }
    begin(id, pos) {
        if (id === 'riftSeal')
            this.active = { id, pos: { ...pos }, progress: 0 };
        else if (id === 'beaconDefense')
            this.active = { id, pos: { ...pos }, hp: 100, timeLeft: 28 };
        else
            this.active = { id, pos: { ...pos }, activated: false, timeLeft: 22 };
    }
    activateAltar() {
        if (this.active?.id === 'cursedAltar')
            this.active.activated = true;
    }
    failActive() {
        if (!this.active)
            return { completed: false, failed: false, rewards: [], id: null };
        const id = this.active.id;
        this.active = null;
        this.stats.failed += 1;
        this.stats.currentStreak = 0;
        return { completed: false, failed: true, rewards: [], id };
    }
    update(dt, snapshot) {
        if (!this.active)
            return { completed: false, failed: false, rewards: [], id: null };
        const active = this.active;
        const inside = distance(snapshot.hero, active.pos) <= (active.id === 'beaconDefense' ? 115 : 92);
        if (active.id === 'riftSeal') {
            const next = advanceRiftSeal({ progress: active.progress }, dt, inside, snapshot.nearbyEnemies);
            active.progress = next.progress;
            if (next.complete)
                return this.complete(active.id);
            return { completed: false, failed: false, rewards: [], id: active.id };
        }
        if (active.id === 'beaconDefense') {
            const next = advanceBeaconDefense({ hp: active.hp, timeLeft: active.timeLeft }, dt, snapshot.nearbyEnemies);
            active.hp = next.hp;
            active.timeLeft = next.timeLeft;
            if (next.failed)
                return this.failActive();
            if (next.complete)
                return this.complete(active.id);
            return { completed: false, failed: false, rewards: [], id: active.id };
        }
        if (!active.activated && inside)
            active.activated = true;
        const next = advanceCursedAltar({ activated: active.activated, timeLeft: active.timeLeft }, dt);
        active.activated = next.activated;
        active.timeLeft = next.timeLeft;
        if (next.complete)
            return this.complete(active.id);
        return { completed: false, failed: false, rewards: [], id: active.id };
    }
    complete(id) {
        this.active = null;
        this.stats.completed += 1;
        this.stats.currentStreak += 1;
        this.stats.bestStreak = Math.max(this.stats.bestStreak, this.stats.currentStreak);
        return { completed: true, failed: false, rewards: objectiveRewardFor(id, this.stats.currentStreak), id };
    }
}
