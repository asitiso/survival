import { ACTION_BUTTONS } from './config.js';
import { SYNERGY_IDENTITY_IDS, auditSynergyIdentityAtlas, synergyIdentityIcon } from './synergy-identity-assets.js';
import { activeSynergies, synergyModifiers } from './synergies.js';
import { LegendaryEffectController } from './legendary-effects.js';
import { LEGENDARY_AWAKENING_ITEM_IDS, activeLegendaryAwakeningRecall, auditLegendaryAwakeningReuse, legendaryProcIdentity } from './legendary-awakening-recall.js';
const close = (a, b) => Math.abs(a - b) < 1e-9;
const item = (id, kind) => ({ id, kind, name: id, rank: 5, power: .1, legendary: true });
const equip = (weapon = null, armor = null) => ({ coins: 0, weapon, armor, healingPotions: 1 });
function synergyContractOk() {
    const cases = [
        [{ heroId: 'arkan', traitId: null, relicId: 'abyss-eye', equipment: equip(item('arcane-staff', 'weapon')) }, 'forbidden-arcana'],
        [{ heroId: 'seria', traitId: null, relicId: 'chrono-shard', equipment: equip(item('rapid-wand', 'weapon')) }, 'broken-time'],
        [{ heroId: 'edric', traitId: null, relicId: 'guardian-heart', equipment: equip(null, item('guardian-plate', 'armor')) }, 'last-bastion'],
        [{ heroId: 'arkan', traitId: 'destruction', relicId: null, equipment: equip(item('blast-rod', 'weapon')) }, 'starbreaker'],
        [{ heroId: 'arkan', traitId: 'goldSense', relicId: null, equipment: equip(item('golden-wand', 'weapon')) }, 'golden-fever'],
        [{ heroId: 'arkan', traitId: 'rapidCasting', relicId: null, equipment: equip(item('rapid-wand', 'weapon')) }, 'overclock'],
        [{ heroId: 'arkan', traitId: null, relicId: 'ember-crown', equipment: equip(item('arcane-staff', 'weapon')) }, 'ember-dominion'],
        [{ heroId: 'seria', traitId: null, relicId: 'winter-heart', equipment: equip(item('blast-rod', 'weapon')) }, 'winter-dominion'],
        [{ heroId: 'kain', traitId: null, relicId: 'storm-core', equipment: equip(item('rapid-wand', 'weapon')) }, 'storm-dominion'],
        [{ heroId: 'edric', traitId: null, relicId: 'oath-seal', equipment: equip(null, item('guardian-plate', 'armor')) }, 'oath-dominion'],
    ];
    if (!cases.every(([build, id]) => activeSynergies(build).some(s => s.id === id)))
        return false;
    const m = synergyModifiers(cases[0][0]);
    return close(m.spellPowerMultiplier, 1.16) && close(m.heroDamageTakenMultiplier, 1.05);
}
function legendaryContractOk() {
    const arc = new LegendaryEffectController(), arcEq = equip(item('arcane-staff', 'weapon'));
    for (let i = 0; i < 20; i++)
        arc.onKill('grunt', arcEq);
    if (!close(arc.modifiers.spellPowerMultiplier, 1.3))
        return false;
    arc.update(4, arcEq, { heroHpRatio: 1, coreHpRatio: 1, moving: false });
    if (!close(arc.modifiers.spellPowerMultiplier, 1))
        return false;
    const rapid = new LegendaryEffectController(), rapidEq = equip(item('rapid-wand', 'weapon'));
    for (let i = 0; i < 35; i++)
        rapid.onKill('grunt', rapidEq);
    if (!close(rapid.modifiers.cooldownMultiplier, .78))
        return false;
    const blast = new LegendaryEffectController(), blastEq = equip(item('blast-rod', 'weapon'));
    let p = blast.onKill('grunt', blastEq);
    for (let i = 1; i < 19; i++)
        p = blast.onKill('grunt', blastEq);
    if (p[0]?.type !== 'nova' || p[0].radius !== 170)
        return false;
    const gale = new LegendaryEffectController(), galeEq = equip(null, item('gale-cloak', 'armor'));
    gale.update(3, galeEq, { heroHpRatio: 1, coreHpRatio: 1, moving: true });
    if (!close(gale.modifiers.moveSpeedMultiplier, 1.18) || !close(gale.modifiers.cooldownMultiplier, .88))
        return false;
    const iron = new LegendaryEffectController(), ironEq = equip(null, item('iron-robe', 'armor'));
    iron.update(.1, ironEq, { heroHpRatio: .35, coreHpRatio: 1, moving: false });
    if (!close(iron.modifiers.heroDamageTakenMultiplier, .65))
        return false;
    const wall = new LegendaryEffectController(), wallEq = equip(null, item('guardian-plate', 'armor'));
    const wp = wall.update(.1, wallEq, { heroHpRatio: 1, coreHpRatio: .49, moving: false });
    if (wp[0]?.type !== 'coreHeal' || !close(wall.modifiers.coreDamageTakenMultiplier, .75))
        return false;
    return true;
}
export function auditSynergyLegendaryIdentityAssets() {
    const samples = [];
    const push = (caseId, passed) => samples.push({ caseId, passed });
    const sa = auditSynergyIdentityAtlas(), la = auditLegendaryAwakeningReuse();
    let textFallbackPreserved = true, imageLoadFailureNonBlocking = true, iconMotionAmplitude = 0;
    for (const id of SYNERGY_IDENTITY_IDS) {
        const icon = synergyIdentityIcon(id);
        push(`${id}:body`, icon.sx >= 0 && icon.sy >= 0 && icon.sx + icon.sw <= 384 && icon.sy + icon.sh <= 288);
        push(`${id}:hud`, Boolean(icon.label));
        push(`${id}:toast`, Boolean(icon.accent));
        push(`${id}:safety`, !icon.animated && icon.motionAmplitude === 0 && icon.textFallbackPreserved && !icon.loadFailureBlocksGameplay);
        textFallbackPreserved &&= icon.textFallbackPreserved;
        imageLoadFailureNonBlocking &&= !icon.loadFailureBlocksGameplay;
        iconMotionAmplitude = Math.max(iconMotionAmplitude, icon.motionAmplitude);
    }
    for (const id of LEGENDARY_AWAKENING_ITEM_IDS)
        push(`legendary:${id}:reuse`, la.missing.includes(id) === false);
    const sustained = [];
    const arc = new LegendaryEffectController(), arcEq = equip(item('arcane-staff', 'weapon'));
    for (let i = 0; i < 20; i++)
        arc.onKill('grunt', arcEq);
    sustained.push(['arcane-staff', arcEq, arc]);
    const rapid = new LegendaryEffectController(), rapidEq = equip(item('rapid-wand', 'weapon'));
    for (let i = 0; i < 35; i++)
        rapid.onKill('grunt', rapidEq);
    sustained.push(['rapid-wand', rapidEq, rapid]);
    const iron = new LegendaryEffectController(), ironEq = equip(null, item('iron-robe', 'armor'));
    iron.update(.1, ironEq, { heroHpRatio: .35, coreHpRatio: 1, moving: false });
    sustained.push(['iron-robe', ironEq, iron]);
    const gale = new LegendaryEffectController(), galeEq = equip(null, item('gale-cloak', 'armor'));
    gale.update(3, galeEq, { heroHpRatio: 1, coreHpRatio: 1, moving: true });
    sustained.push(['gale-cloak', galeEq, gale]);
    const wall = new LegendaryEffectController(), wallEq = equip(null, item('guardian-plate', 'armor'));
    wall.update(.1, wallEq, { heroHpRatio: 1, coreHpRatio: .49, moving: false });
    sustained.push(['guardian-plate', wallEq, wall]);
    let sustainedOk = 0;
    for (const [id, eq, c] of sustained) {
        const ok = activeLegendaryAwakeningRecall(eq, c.modifiers).some(v => v.itemId === id);
        push(`legendary:${id}:active`, ok);
        if (ok)
            sustainedOk++;
    }
    const procCases = [
        [{ type: 'nova', radius: 170 }, equip(item('blast-rod', 'weapon')), 'blast-rod'],
        [{ type: 'bonusGold', amount: 280 }, equip(item('golden-wand', 'weapon')), 'golden-wand'],
        [{ type: 'magnet', duration: 3 }, equip(null, item('magnet-cloak', 'armor')), 'magnet-cloak'],
        [{ type: 'coreHeal', fraction: .1 }, equip(null, item('guardian-plate', 'armor')), 'guardian-plate'],
    ];
    let procOk = 0;
    for (const [proc, eq, id] of procCases) {
        const ok = legendaryProcIdentity(proc, eq)?.itemId === id;
        push(`legendary:${id}:proc`, ok);
        if (ok)
            procOk++;
    }
    const synergyOk = synergyContractOk(), legendaryOk = legendaryContractOk();
    push('contract:synergy', synergyOk);
    push('contract:legendary', legendaryOk);
    push('contract:safety-actions', textFallbackPreserved && imageLoadFailureNonBlocking && ACTION_BUTTONS.length === 9);
    const issues = [];
    if (samples.length !== 60)
        issues.push(`samples:${samples.length}`);
    if (!sa.passed)
        issues.push('synergy-atlas');
    if (!la.passed)
        issues.push('legendary-reuse');
    if (samples.some(s => !s.passed))
        issues.push('sample-failure');
    if (ACTION_BUTTONS.length !== 9)
        issues.push(`actions:${ACTION_BUTTONS.length}`);
    return { samples, synergyCount: SYNERGY_IDENTITY_IDS.length, synergyCoverage: sa.coverage, synergyUniqueCellCount: sa.uniqueCellCount, legendaryItemCount: LEGENDARY_AWAKENING_ITEM_IDS.length, legendaryReuseCoverage: la.coverage, sustainedRecallCoverage: sustainedOk / sustained.length, procToastCoverage: procOk / procCases.length, maxSynergyRecallIcons: 2, maxLegendaryRecallIcons: 2, textFallbackPreserved, imageLoadFailureNonBlocking, iconMotionAmplitude, synergyContractMutation: !synergyOk, legendaryContractMutation: !legendaryOk, actionCount: ACTION_BUTTONS.length, snapshotSchemaMutation: false, issues, passed: issues.length === 0 };
}
