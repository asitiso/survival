import { dangerTierForSeconds } from './progression.js';
export function directorSnapshot(seconds) {
    const time = Math.max(0, seconds);
    const danger = dangerTierForSeconds(time);
    return {
        danger,
        spawnInterval: Math.max(0.10, 0.66 / (1 + time / 300)),
        enemyBudget: Math.min(320, Math.floor(50 + danger * 14 + Math.sqrt(time) * 3.0)),
        spawnBurst: time < 90 ? 1 : time < 360 ? 2 : 3,
        hpMultiplier: 1 + (danger - 1) * 0.16 + time / 1800,
        damageMultiplier: 1 + (danger - 1) * 0.10 + time / 2700,
        eliteInterval: Math.max(18, 70 - danger * 2.6),
        bossInterval: Math.max(150, 240 - Math.min(60, danger * 3)),
    };
}
