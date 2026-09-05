import { composeFusionSpellModifiers } from './fusion-integration.js';
import { fusionDefinition } from './spell-fusions.js';
const PROPERTY_BY_ID = {
    damage: 'damageMultiplier', area: 'areaMultiplier', cooldown: 'cooldownMultiplier', chain: 'jumpBonus', pierce: 'pierceBonus', 'slow-duration': 'slowDurationMultiplier', 'tick-power': 'tickMultiplier',
};
const LABEL = { damage: '피해', area: '범위', cooldown: '쿨타임', chain: '연쇄', pierce: '관통', 'slow-duration': '둔화 지속', 'tick-power': '틱 위력' };
const DIRECT_IDS = new Set(['chain', 'pierce']);
const REDUCTION_IDS = new Set(['cooldown']);
const round = (value, places = 4) => Number(value.toFixed(places));
const changed = (a, b) => Math.abs(a - b) > 1e-9;
const percentDelta = (id, before, after) => REDUCTION_IDS.has(id) ? (1 - after / before) * 100 : (after / before - 1) * 100;
const componentSet = (equipped) => new Set(equipped.flatMap(id => fusionDefinition(id).components));
export function projectFusionSelection(equipped, fusionId, heroId) {
    const clean = [...new Set(equipped)].filter(id => id !== fusionId);
    const components = fusionDefinition(fusionId).components;
    const existing = componentSet(clean);
    const sharedComponents = components.filter(component => existing.has(component));
    const relationId = sharedComponents.length > 0 ? 'linked' : 'fresh';
    const beforeBySpell = {};
    const afterBySpell = {};
    for (const spellId of components) {
        beforeBySpell[spellId] = composeFusionSpellModifiers(clean, heroId, spellId);
        afterBySpell[spellId] = composeFusionSpellModifiers([...clean, fusionId], heroId, spellId);
    }
    const effects = Object.entries(PROPERTY_BY_ID).flatMap(([id, key]) => {
        const spellDeltas = components.flatMap(spellId => {
            const before = beforeBySpell[spellId][key], after = afterBySpell[spellId][key];
            if (!changed(before, after))
                return [];
            const direct = DIRECT_IDS.has(id), deltaValue = after - before, deltaPercent = direct ? 0 : percentDelta(id, before, after);
            return [{ spellId, before: round(before), after: round(after), deltaPercent: round(deltaPercent, 2), deltaValue: round(deltaValue, 2) }];
        });
        if (spellDeltas.length === 0)
            return [];
        const direct = DIRECT_IDS.has(id);
        const displayDelta = direct ? Math.max(...spellDeltas.map(delta => delta.deltaValue)) : Math.max(...spellDeltas.map(delta => delta.deltaPercent));
        const salience = direct ? Math.abs(displayDelta) * 10 : Math.abs(displayDelta);
        return [{ id, spellDeltas, displayDelta: round(displayDelta, 2), direct, salience: round(salience, 2) }];
    }).sort((a, b) => b.salience - a.salience || Object.keys(PROPERTY_BY_ID).indexOf(a.id) - Object.keys(PROPERTY_BY_ID).indexOf(b.id));
    return { fusionId, heroId, components, sharedComponents, relationId, beforeBySpell, afterBySpell, effects, modifierIds: effects.slice(0, 2).map(effect => effect.id) };
}
const fmt = (value) => { const rounded = Math.round(value * 10) / 10; return Number.isInteger(rounded) ? String(Math.trunc(rounded)) : rounded.toFixed(1); };
export function fusionProjectionHint(projection) {
    const selected = new Set(projection.modifierIds);
    const parts = projection.effects.filter(effect => selected.has(effect.id)).slice(0, 2).map(effect => effect.direct ? `${LABEL[effect.id]} +${fmt(Math.abs(effect.displayDelta))}` : `${LABEL[effect.id]} ${REDUCTION_IDS.has(effect.id) ? '-' : '+'}${fmt(Math.abs(effect.displayDelta))}%`);
    return parts.length ? `실효 · ${parts.join(' · ')}` : '실효 · 변화 없음';
}
