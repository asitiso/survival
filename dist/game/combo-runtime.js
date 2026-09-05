const NONE = { family: 'none', name: '', tier: 0, label: '', powerMultiplier: 1, cooldownMultiplier: 1, areaMultiplier: 1 };
export class ComboRuntime {
    current = { ...NONE };
    highest = { ...NONE };
    reset() { this.current = { ...NONE }; this.highest = { ...NONE }; }
    update(combo) { this.current = { ...combo }; if (combo.tier > this.highest.tier)
        this.highest = { ...combo }; }
    get modifiers() { return { spellPowerMultiplier: Math.min(1.12, Math.max(1, this.current.powerMultiplier)), cooldownMultiplier: Math.max(0.94, Math.min(1, this.current.cooldownMultiplier)), areaMultiplier: Math.min(1.12, Math.max(1, this.current.areaMultiplier)) }; }
}
