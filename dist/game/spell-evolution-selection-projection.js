import { spellEvolution } from './spell-evolutions.js';
const changed = (a, b) => Math.abs(a - b) > 1e-9;
const pctUp = (a, b) => a === 0 ? 0 : (b / a - 1) * 100;
const pctDown = (a, b) => a === 0 ? 0 : (1 - b / a) * 100;
const fmt = (value) => { const rounded = Math.round(value * 10) / 10; return Number.isInteger(rounded) ? String(Math.trunc(rounded)) : rounded.toFixed(1); };
const effect = (id, summary, score) => ({ id, summary, score });
function projectedEffects(before, after) {
    const effects = [];
    if (changed(before.damageMultiplier, after.damageMultiplier) || changed(before.tickMultiplier, after.tickMultiplier) || changed(before.splashDamageBonus, after.splashDamageBonus)) {
        const delta = changed(before.damageMultiplier, after.damageMultiplier) ? pctUp(before.damageMultiplier, after.damageMultiplier) : changed(before.tickMultiplier, after.tickMultiplier) ? pctUp(before.tickMultiplier, after.tickMultiplier) : (after.splashDamageBonus - before.splashDamageBonus) * 100;
        const score = Math.max(Math.abs(delta) * 1.2, Math.abs((after.splashDamageBonus - before.splashDamageBonus) * 100));
        effects.push(effect('damage', `피해 +${fmt(Math.abs(delta))}%`, score));
    }
    if (changed(before.areaMultiplier, after.areaMultiplier) || changed(before.splashRadiusBonus, after.splashRadiusBonus)) {
        const multDelta = changed(before.areaMultiplier, after.areaMultiplier) ? pctUp(before.areaMultiplier, after.areaMultiplier) : 0;
        const radiusDelta = after.splashRadiusBonus - before.splashRadiusBonus;
        const summary = changed(before.areaMultiplier, after.areaMultiplier) ? `범위 +${fmt(Math.abs(multDelta))}%` : `폭발 범위 +${fmt(radiusDelta)}`;
        effects.push(effect('area', summary, Math.max(Math.abs(multDelta), Math.abs(radiusDelta) * .5)));
    }
    if (changed(before.projectileBonus, after.projectileBonus)) {
        const delta = after.projectileBonus - before.projectileBonus;
        effects.push(effect('projectile', `투사체 +${fmt(delta)}`, Math.abs(delta) * 15));
    }
    if (changed(before.jumpBonus, after.jumpBonus)) {
        const delta = after.jumpBonus - before.jumpBonus;
        effects.push(effect('chain', `연쇄 +${fmt(delta)}`, Math.abs(delta) * 13));
    }
    if (changed(before.cooldownMultiplier, after.cooldownMultiplier) || changed(before.delayMultiplier, after.delayMultiplier)) {
        const cooldown = changed(before.cooldownMultiplier, after.cooldownMultiplier) ? pctDown(before.cooldownMultiplier, after.cooldownMultiplier) : 0;
        const delay = changed(before.delayMultiplier, after.delayMultiplier) ? pctDown(before.delayMultiplier, after.delayMultiplier) : 0;
        const value = Math.max(cooldown, delay), label = cooldown >= delay ? '쿨타임' : '발동 지연';
        effects.push(effect('cadence', `${label} -${fmt(Math.abs(value))}%`, Math.abs(value) * 1.15));
    }
    if (changed(before.durationMultiplier, after.durationMultiplier) || changed(before.slowDurationMultiplier, after.slowDurationMultiplier)) {
        const duration = changed(before.durationMultiplier, after.durationMultiplier) ? pctUp(before.durationMultiplier, after.durationMultiplier) : 0;
        const slow = changed(before.slowDurationMultiplier, after.slowDurationMultiplier) ? pctUp(before.slowDurationMultiplier, after.slowDurationMultiplier) : 0;
        const value = Math.max(duration, slow), label = slow > duration ? '둔화 지속' : '지속시간';
        effects.push(effect('duration', `${label} +${fmt(Math.abs(value))}%`, Math.abs(value)));
    }
    if (changed(before.knockbackMultiplier, after.knockbackMultiplier) || changed(before.pullMultiplier, after.pullMultiplier) || changed(before.slowFactorMultiplier, after.slowFactorMultiplier)) {
        const knock = changed(before.knockbackMultiplier, after.knockbackMultiplier) ? pctUp(before.knockbackMultiplier, after.knockbackMultiplier) : 0;
        const pull = changed(before.pullMultiplier, after.pullMultiplier) ? pctUp(before.pullMultiplier, after.pullMultiplier) : 0;
        const slow = changed(before.slowFactorMultiplier, after.slowFactorMultiplier) ? pctDown(before.slowFactorMultiplier, after.slowFactorMultiplier) : 0;
        const value = Math.max(knock, pull, slow), label = value === slow ? '둔화' : value === pull ? '흡인' : '넉백';
        effects.push(effect('control', `${label} +${fmt(Math.abs(value))}%`, Math.abs(value) * .9));
    }
    if (changed(before.pierceBonus, after.pierceBonus)) {
        const delta = after.pierceBonus - before.pierceBonus;
        effects.push(effect('pierce', `관통 +${fmt(delta)}`, Math.abs(delta) * 14));
    }
    return effects.sort((a, b) => b.score - a.score || a.id.localeCompare(b.id)).slice(0, 2);
}
export function projectSpellEvolutionSelection(heroId, spellId, currentLevel) {
    const level = Math.max(1, Math.floor(currentLevel)), nextLevel = level + 1, before = spellEvolution(heroId, spellId, level), after = spellEvolution(heroId, spellId, nextLevel);
    if (after.tier <= before.tier || after.tier === 0)
        return null;
    const tierDeltaId = after.tier === 1 ? 'awaken' : 'final';
    const effects = projectedEffects(before, after);
    return { heroId, spellId, currentLevel: level, nextLevel, tierDeltaId, before, after, effects, modifierIds: effects.map(item => item.id) };
}
export function spellEvolutionProjectionHint(projection) { const tier = projection.tierDeltaId === 'awaken' ? '1차 진화' : '최종 진화'; return `${tier} 실효${projection.effects.length ? ` · ${projection.effects.map(item => item.summary).join(' · ')}` : ''}`; }
