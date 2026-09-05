import { HERO_PROFILES, heroProfile } from './hero-profiles.js';
import { heroSpellIdentity } from './hero-spells.js';
const SPELLS = ['fireBolt', 'chainLightning', 'frostNova', 'flameField', 'meteorStorm', 'blackHole'];
function clamp(value, min, max) { return Math.max(min, Math.min(max, value)); }
function round(value) { return Math.round(value * 10000) / 10000; }
function spellDamageValue(heroId, spellId) {
    const identity = heroSpellIdentity(heroId, spellId);
    if (spellId === 'fireBolt')
        return identity.damageMultiplier * (1 + identity.splashDamageMultiplier * .30) * (1 + identity.pierceBonus * .05);
    if (spellId === 'chainLightning')
        return identity.damageMultiplier * (1 + identity.chainJumpBonus * .04);
    if (spellId === 'frostNova')
        return identity.novaDamageMultiplier * Math.sqrt(identity.areaMultiplier);
    if (spellId === 'flameField')
        return identity.fieldDamageMultiplier * identity.fieldTickMultiplier * Math.sqrt(identity.areaMultiplier);
    if (spellId === 'meteorStorm')
        return identity.meteorDamageMultiplier / Math.max(.5, identity.meteorDelayMultiplier) * Math.sqrt(identity.areaMultiplier);
    return identity.holeDamageMultiplier * identity.holeTickMultiplier * Math.sqrt(identity.areaMultiplier);
}
function heroControlIndex(heroId) {
    let control = 1;
    for (const spellId of SPELLS) {
        const identity = heroSpellIdentity(heroId, spellId);
        control += (1 - identity.projectileSlowFactor) * identity.projectileSlowDuration * .12;
        control += (1 - identity.chainSlowFactor) * identity.chainSlowDuration * .10;
        control += (1 - identity.fieldSlowFactor) * identity.fieldSlowDuration * .12;
        control += (1 - identity.meteorSlowFactor) * identity.meteorSlowDuration * .08;
        control += (1 - identity.holeSlowFactor) * identity.holeSlowDuration * .10;
        control += identity.knockback / 130 * .10;
        control += Math.max(0, identity.areaMultiplier - 1) * .40;
    }
    return clamp(control, 1, 1.35);
}
export function heroReleaseModel(heroId) {
    const profile = heroProfile(heroId);
    const averageSpellValue = SPELLS.reduce((sum, spellId) => sum + spellDamageValue(heroId, spellId), 0) / SPELLS.length;
    const offenseIndex = profile.spellPower / Math.max(.5, profile.cooldownMultiplier) * averageSpellValue;
    const controlIndex = heroControlIndex(heroId);
    const survivalIndex = Math.pow(profile.baseHp / 240, .55) * Math.pow(profile.baseSpeed / 285, .25) * Math.pow(controlIndex, .50);
    const field = heroSpellIdentity(heroId, 'flameField');
    const nova = heroSpellIdentity(heroId, 'frostNova');
    const coreGuardIndex = Math.pow(profile.baseHp / 240, .22) * Math.pow(controlIndex, .50) * (field.fieldAtCore ? 1.15 : 1) * (1 + nova.knockback / 500);
    const compositeIndex = Math.pow(offenseIndex, .48) * Math.pow(survivalIndex, .32) * Math.pow(coreGuardIndex, .20);
    return {
        heroId,
        offenseIndex: round(offenseIndex),
        controlIndex: round(controlIndex),
        survivalIndex: round(survivalIndex),
        coreGuardIndex: round(coreGuardIndex),
        compositeIndex: round(compositeIndex),
    };
}
export function allHeroReleaseModels() { return HERO_PROFILES.map((hero) => heroReleaseModel(hero.id)); }
