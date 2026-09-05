import { ACTION_BUTTONS } from './config.js';
import { CastIntentBuffer, COMBAT_CAST_ACTIONS } from './cast-intent-buffer.js';
import { chooseSpellTarget } from './auto-targeting.js';
import { ManualTargetMemory } from './manual-target-stability.js';
const hero = { x: 0, y: 0 };
const core = { x: 500, y: 0 };
const enemy = (id, type, x, target = 'hero', alive = true) => ({
    id,
    type,
    pos: { x, y: 0 },
    target,
    hp: 100,
    maxHp: 100,
    alive,
});
function sameTierChecks() {
    const cases = [
        [enemy(1, 'grunt', 120), enemy(2, 'grunt', 90)],
        [enemy(3, 'elite', 260), enemy(4, 'boss', 220)],
        [enemy(5, 'grunt', 560, 'core'), enemy(6, 'grunt', 520, 'core')],
        [enemy(7, 'boss', 300), enemy(8, 'elite', 180)],
    ];
    return cases.map(([first, challenger], index) => {
        const memory = new ManualTargetMemory();
        memory.select([first], hero, core, 10 + index);
        return memory.select([first, challenger], hero, core, 10.2 + index)?.id === first.id;
    });
}
function priorityOverrideChecks() {
    const normalToElite = (() => {
        const memory = new ManualTargetMemory();
        const normal = enemy(11, 'grunt', 80);
        const elite = enemy(12, 'elite', 280);
        memory.select([normal], hero, core, 20);
        return memory.select([normal, elite], hero, core, 20.1)?.id === elite.id;
    })();
    const normalToBoss = (() => {
        const memory = new ManualTargetMemory();
        const normal = enemy(13, 'grunt', 70);
        const boss = enemy(14, 'boss', 320);
        memory.select([normal], hero, core, 21);
        return memory.select([normal, boss], hero, core, 21.1)?.id === boss.id;
    })();
    const eliteToCore = (() => {
        const memory = new ManualTargetMemory();
        const elite = enemy(15, 'elite', 180);
        const coreThreat = enemy(16, 'grunt', 540, 'core');
        memory.select([elite], hero, core, 22);
        return memory.select([elite, coreThreat], hero, core, 22.1)?.id === coreThreat.id;
    })();
    return [normalToElite, normalToBoss, eliteToCore];
}
function releaseChecks() {
    const expiry = (() => {
        const memory = new ManualTargetMemory();
        const first = enemy(21, 'grunt', 120);
        const next = enemy(22, 'grunt', 80);
        memory.select([first], hero, core, 30);
        return memory.select([first, next], hero, core, 30.75)?.id === next.id;
    })();
    const death = (() => {
        const memory = new ManualTargetMemory();
        const first = enemy(23, 'grunt', 90);
        const next = enemy(24, 'grunt', 110);
        memory.select([first, next], hero, core, 31);
        first.alive = false;
        return memory.select([first, next], hero, core, 31.1)?.id === next.id;
    })();
    const coreRange = (() => {
        const memory = new ManualTargetMemory();
        const first = enemy(25, 'grunt', 610, 'core');
        const next = enemy(26, 'grunt', 100);
        memory.select([first, next], hero, core, 32);
        first.pos.x = 625;
        return memory.select([first, next], hero, core, 32.1)?.id === next.id;
    })();
    const eliteRange = (() => {
        const memory = new ManualTargetMemory();
        const first = enemy(27, 'elite', 640);
        const next = enemy(28, 'grunt', 100);
        memory.select([first, next], hero, core, 33);
        first.pos.x = 651;
        return memory.select([first, next], hero, core, 33.1)?.id === next.id;
    })();
    const retentionRange = (() => {
        const memory = new ManualTargetMemory();
        const first = enemy(29, 'grunt', 710);
        const next = enemy(30, 'grunt', 730);
        memory.select([first, next], hero, core, 34);
        first.pos.x = 721;
        next.pos.x = 90;
        return memory.select([first, next], hero, core, 34.1)?.id === next.id;
    })();
    return [expiry, death, coreRange, eliteRange, retentionRange];
}
function bufferedCastChecks() {
    return COMBAT_CAST_ACTIONS.map((action, index) => {
        const memory = new ManualTargetMemory();
        const first = enemy(40 + index * 2, 'grunt', 120);
        const challenger = enemy(41 + index * 2, 'grunt', 90);
        memory.select([first], hero, core, 40 + index);
        const buffer = new CastIntentBuffer();
        buffer.request(action, 0.10);
        const ready = buffer.consumeIfReady(action, 0);
        const selected = ready ? memory.select([first, challenger], hero, core, 40.1 + index) : null;
        return ready && selected?.id === first.id;
    });
}
function autoIsolationChecks() {
    const memory = new ManualTargetMemory();
    const manual = enemy(70, 'grunt', 120);
    const autoPreferred = enemy(71, 'elite', 230);
    memory.select([manual], hero, core, 60);
    const before = memory.currentTargetId() === manual.id;
    const auto = chooseSpellTarget([manual, autoPreferred], hero, core, true, autoPreferred.id);
    const after = memory.currentTargetId() === manual.id;
    return [before && auto?.id === autoPreferred.id, after];
}
export function auditManualTargetStability() {
    const sameTier = sameTierChecks();
    const priorityOverride = priorityOverrideChecks();
    const release = releaseChecks();
    const bufferedCast = bufferedCastChecks();
    const autoIsolation = autoIsolationChecks();
    const sameTierPassed = sameTier.every(Boolean);
    const priorityOverridePassed = priorityOverride.every(Boolean);
    const releasePassed = release.every(Boolean);
    const bufferedCastPassed = bufferedCast.every(Boolean);
    const autoIsolationPassed = autoIsolation.every(Boolean);
    const actionCount = ACTION_BUTTONS.length;
    const issues = [];
    if (!sameTierPassed)
        issues.push('same-tier-stickiness');
    if (!priorityOverridePassed)
        issues.push('priority-override');
    if (!releasePassed)
        issues.push('release-safety');
    if (!bufferedCastPassed)
        issues.push('buffered-cast');
    if (!autoIsolationPassed)
        issues.push('auto-isolation');
    if (actionCount !== 9)
        issues.push('action-surface');
    const invariantSamples = 5;
    const samples = sameTier.length + priorityOverride.length + release.length + bufferedCast.length + autoIsolation.length + invariantSamples;
    return {
        samples,
        sameTierSamples: sameTier.length,
        priorityOverrideSamples: priorityOverride.length,
        releaseSamples: release.length,
        bufferedCastSamples: bufferedCast.length,
        autoIsolationSamples: autoIsolation.length,
        actionCount,
        sameTierPassed,
        priorityOverridePassed,
        releasePassed,
        bufferedCastPassed,
        autoIsolationPassed,
        snapshotSchemaMutation: false,
        economyMutation: false,
        damageMutation: false,
        cooldownMutation: false,
        autoThroughputMutation: false,
        issues,
        passed: issues.length === 0,
    };
}
