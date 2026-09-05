function legendaryWeapon(state, id) {
    return state.weapon?.legendary === true && state.weapon.id === id;
}
function legendaryArmor(state, id) {
    return state.armor?.legendary === true && state.armor.id === id;
}
export class LegendaryEffectController {
    arcaneKills = 0;
    chronoKills = 0;
    blastKills = 0;
    blastPrimed = false;
    arcaneSurge = 0;
    chronoRush = 0;
    immortalGuard = 0;
    immortalCooldown = 0;
    galeCharge = 0;
    galeRush = 0;
    magnetTimer = 22;
    wallGuard = 0;
    wallCooldown = 0;
    reset() {
        this.arcaneKills = 0;
        this.chronoKills = 0;
        this.blastKills = 0;
        this.blastPrimed = false;
        this.arcaneSurge = 0;
        this.chronoRush = 0;
        this.immortalGuard = 0;
        this.immortalCooldown = 0;
        this.galeCharge = 0;
        this.galeRush = 0;
        this.magnetTimer = 22;
        this.wallGuard = 0;
        this.wallCooldown = 0;
    }
    get modifiers() {
        return {
            spellPowerMultiplier: this.arcaneSurge > 0 ? 1.30 : 1,
            cooldownMultiplier: (this.chronoRush > 0 ? 0.78 : 1) * (this.galeRush > 0 ? 0.88 : 1),
            moveSpeedMultiplier: this.galeRush > 0 ? 1.18 : 1,
            heroDamageTakenMultiplier: this.immortalGuard > 0 ? 0.65 : 1,
            coreDamageTakenMultiplier: this.wallGuard > 0 ? 0.75 : 1,
        };
    }
    onKill(type, equipment) {
        const procs = [];
        if (legendaryWeapon(equipment, 'arcane-staff')) {
            this.arcaneKills += 1;
            if (this.arcaneKills >= 20) {
                this.arcaneKills = 0;
                this.arcaneSurge = 4;
            }
        }
        if (legendaryWeapon(equipment, 'rapid-wand')) {
            this.chronoKills += 1;
            if (this.chronoKills >= 35) {
                this.chronoKills = 0;
                this.chronoRush = 5;
            }
        }
        if (legendaryWeapon(equipment, 'blast-rod') && type !== 'boss') {
            if (this.blastPrimed) {
                this.blastPrimed = false;
                procs.push({ type: 'nova', radius: 170 });
            }
            this.blastKills += 1;
            if (this.blastKills >= 18) {
                this.blastKills = 0;
                this.blastPrimed = true;
            }
        }
        if (legendaryWeapon(equipment, 'golden-wand')) {
            if (type === 'elite')
                procs.push({ type: 'bonusGold', amount: 90 });
            if (type === 'boss')
                procs.push({ type: 'bonusGold', amount: 280 });
        }
        return procs;
    }
    update(dt, equipment, status) {
        const delta = Math.max(0, dt);
        const procs = [];
        this.arcaneSurge = Math.max(0, this.arcaneSurge - delta);
        this.chronoRush = Math.max(0, this.chronoRush - delta);
        this.immortalGuard = Math.max(0, this.immortalGuard - delta);
        this.immortalCooldown = Math.max(0, this.immortalCooldown - delta);
        this.wallGuard = Math.max(0, this.wallGuard - delta);
        this.wallCooldown = Math.max(0, this.wallCooldown - delta);
        if (this.galeRush > 0) {
            this.galeRush = Math.max(0, this.galeRush - delta);
            this.galeCharge = 0;
        }
        else if (legendaryArmor(equipment, 'gale-cloak') && status.moving) {
            this.galeCharge += delta;
            if (this.galeCharge >= 3) {
                this.galeCharge = 0;
                this.galeRush = 4;
            }
        }
        else {
            this.galeCharge = 0;
        }
        if (legendaryArmor(equipment, 'iron-robe') && status.heroHpRatio <= 0.35 && this.immortalCooldown <= 0) {
            this.immortalGuard = 6;
            this.immortalCooldown = 32;
        }
        if (legendaryArmor(equipment, 'guardian-plate') && status.coreHpRatio < 0.50 && this.wallCooldown <= 0) {
            this.wallGuard = 8;
            this.wallCooldown = 45;
            procs.push({ type: 'coreHeal', fraction: 0.10 });
        }
        if (legendaryArmor(equipment, 'magnet-cloak')) {
            this.magnetTimer -= delta;
            if (this.magnetTimer <= 0) {
                this.magnetTimer += 22;
                procs.push({ type: 'magnet', duration: 3 });
            }
        }
        else {
            this.magnetTimer = 22;
        }
        return procs;
    }
}
