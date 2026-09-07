import { AutoCombatBrain, AUTO_CORE_SWITCH_SECONDS, AUTO_NORMAL_SWITCH_SECONDS, AUTO_TARGET_REVIEW_SECONDS, AUTO_WEAKPOINT_SWITCH_SECONDS } from './auto-combat-brain.js';
function enemy(id, x, target = 'hero') { return { id, type: 'elite', pos: { x, y: 0 }, target, hp: 100, maxHp: 100, alive: true }; }
export function auditAutoTransitionLatency() {
    const hero = { x: 0, y: 0 }, core = { x: 700, y: 0 };
    const brain = new AutoCombatBrain();
    let last = null, switches = 0, unnecessarySwitches = 0, materialFrame = -1, switchFrame = -1;
    for (let frame = 0; frame < 120; frame++) {
        const challengerX = 360 - frame * 2, one = enemy(1, 260), two = enemy(2, challengerX);
        const material = .52 * (260 - challengerX) >= 48;
        if (material && materialFrame < 0)
            materialFrame = frame;
        const chosen = brain.selectTarget([one, two], hero, core, frame / 60);
        const id = chosen?.id ?? null;
        if (last !== null && id !== last) {
            switches++;
            if (materialFrame < 0)
                unnecessarySwitches++;
            if (id === 2 && switchFrame < 0)
                switchFrame = frame;
        }
        last = id;
    }
    const materialSwitchLatencyFrames = materialFrame >= 0 && switchFrame >= 0 ? Math.max(0, switchFrame - materialFrame) : 99;
    const coreBrain = new AutoCombatBrain();
    let coreSwitch = -1, coreMaterial = 30;
    for (let frame = 0; frame < 60; frame++) {
        const one = enemy(1, 250), two = enemy(2, 430, frame >= coreMaterial ? 'core' : 'hero');
        const chosen = coreBrain.selectTarget([one, two], hero, core, frame / 60);
        if (frame >= coreMaterial && chosen?.id === 2 && coreSwitch < 0)
            coreSwitch = frame;
    }
    const coreThreatSwitchLatencyFrames = coreSwitch >= 0 ? coreSwitch - coreMaterial : 99;
    const weakBrain = new AutoCombatBrain();
    let weakLast = null, weakSwitch = -1;
    for (let frame = 0; frame < 60; frame++) {
        const nodes = [{ id: 1, pos: { x: 280, y: 20 }, hp: 60, maxHp: 100, alive: true, radius: 20 }, { id: 2, pos: { x: 330, y: -20 }, hp: frame < 30 ? 80 : 40, maxHp: 100, alive: true, radius: 20 }];
        const id = weakBrain.selectWeakpoint(10, nodes, hero, frame / 60);
        if (weakLast !== null && id !== weakLast && weakSwitch < 0)
            weakSwitch = frame;
        weakLast = id;
    }
    const weakpointSwitchLatencyFrames = weakSwitch >= 0 ? weakSwitch - 30 : 99;
    const intentionalSwitches = switches + (coreSwitch >= 0 ? 1 : 0) + (weakSwitch >= 0 ? 1 : 0);
    const maxSwitchesPerSecond = Math.max(switches / 2, coreSwitch >= 0 ? 1 : 0, weakSwitch >= 0 ? 1 : 0);
    const issues = [];
    const normalMin = Math.floor(AUTO_NORMAL_SWITCH_SECONDS * 60 * .65), normalMax = Math.ceil((AUTO_NORMAL_SWITCH_SECONDS + AUTO_TARGET_REVIEW_SECONDS * 1.6) * 60);
    const coreMin = Math.floor(AUTO_CORE_SWITCH_SECONDS * 60 * .55), coreMax = Math.ceil((AUTO_CORE_SWITCH_SECONDS + AUTO_TARGET_REVIEW_SECONDS * 1.5) * 60);
    const weakMin = Math.floor(AUTO_WEAKPOINT_SWITCH_SECONDS * 60 * .75), weakMax = Math.ceil((AUTO_WEAKPOINT_SWITCH_SECONDS + .12) * 60);
    if (unnecessarySwitches)
        issues.push('target-flicker');
    if (materialSwitchLatencyFrames < normalMin || materialSwitchLatencyFrames > normalMax)
        issues.push('material-switch-humanization');
    if (coreThreatSwitchLatencyFrames < coreMin || coreThreatSwitchLatencyFrames > coreMax)
        issues.push('core-switch-humanization');
    if (weakpointSwitchLatencyFrames < weakMin || weakpointSwitchLatencyFrames > weakMax)
        issues.push('weakpoint-switch-humanization');
    if (maxSwitchesPerSecond > 2)
        issues.push('switch-frequency');
    return { passed: issues.length === 0, targetFrames: 120, weakpointFrames: 60, intentionalSwitches, unnecessarySwitches, materialSwitchLatencyFrames, coreThreatSwitchLatencyFrames, weakpointSwitchLatencyFrames, maxSwitchesPerSecond, issues };
}
