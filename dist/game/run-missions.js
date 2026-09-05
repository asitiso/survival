const FIRST_MISSION_AT = 105;
const MIN_DELAY = 80;
const DELAY_VARIANCE = 30;
const BOSS_SAFETY_WINDOW = 12;
const ORDER = ['massacre', 'eliteHunt', 'goldRush'];
const COPY = {
    massacre: {
        name: '섬멸 명령', description: '제한시간 안에 적을 대량 처치하세요.', accent: '#ff8269', duration: 30,
        reward: { kind: 'shopToken', amount: 1 },
    },
    eliteHunt: {
        name: '정예 사냥', description: '정예병을 집중적으로 처치하세요.', accent: '#f4c867', duration: 40,
        reward: { kind: 'gold', amount: 320 },
    },
    goldRush: {
        name: '전장 수금', description: '금화를 빠르게 확보하세요.', accent: '#ffd85d', duration: 35,
        reward: { kind: 'potion', amount: 1 },
    },
};
export function missionTargetForDanger(id, danger) {
    const d = Math.max(1, Math.floor(danger));
    if (id === 'massacre')
        return Math.min(120, 45 + (d - 1) * 5);
    if (id === 'eliteHunt')
        return Math.min(5, 3 + Math.floor((d - 1) / 5));
    return Math.min(900, 450 + (d - 1) * 45);
}
export function missionProgress(mission, snapshot) {
    if (mission.id === 'massacre')
        return Math.max(0, snapshot.kills - mission.startKills);
    if (mission.id === 'eliteHunt')
        return Math.max(0, snapshot.eliteKills - mission.startEliteKills);
    return Math.max(0, snapshot.goldEarned - mission.startGold);
}
export class RunMissionDirector {
    rng;
    active = null;
    nextAt = FIRST_MISSION_AT;
    lastId = null;
    constructor(rng = Math.random) {
        this.rng = rng;
    }
    get nextMissionAt() { return this.nextAt; }
    reset() {
        this.active = null;
        this.nextAt = FIRST_MISSION_AT;
        this.lastId = null;
    }
    update(dt, elapsed, snapshot, bossCountdown) {
        if (this.active) {
            this.active.remaining = Math.max(0, this.active.remaining - Math.max(0, dt));
            if (missionProgress(this.active, snapshot) >= this.active.target) {
                const completed = this.active;
                this.finish(completed, elapsed);
                return { started: null, completed, failed: null };
            }
            if (this.active.remaining <= 0) {
                const failed = this.active;
                this.finish(failed, elapsed);
                return { started: null, completed: null, failed };
            }
            return { started: null, completed: null, failed: null };
        }
        if (elapsed < this.nextAt || bossCountdown <= BOSS_SAFETY_WINDOW) {
            return { started: null, completed: null, failed: null };
        }
        const started = this.start(snapshot);
        return { started, completed: null, failed: null };
    }
    start(snapshot) {
        let index = Math.min(ORDER.length - 1, Math.max(0, Math.floor(this.rng() * ORDER.length)));
        if (ORDER[index] === this.lastId)
            index = (index + 1) % ORDER.length;
        const id = ORDER[index];
        const copy = COPY[id];
        this.active = {
            id,
            name: copy.name,
            description: copy.description,
            accent: copy.accent,
            duration: copy.duration,
            remaining: copy.duration,
            target: missionTargetForDanger(id, snapshot.danger),
            startKills: snapshot.kills,
            startEliteKills: snapshot.eliteKills,
            startGold: snapshot.goldEarned,
            reward: { ...copy.reward },
        };
        return this.active;
    }
    finish(mission, elapsed) {
        this.lastId = mission.id;
        this.active = null;
        const roll = Math.max(0, Math.min(1, this.rng()));
        this.nextAt = elapsed + MIN_DELAY + roll * DELAY_VARIANCE;
    }
}
