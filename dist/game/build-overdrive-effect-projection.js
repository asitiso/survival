import { overdriveModifiers } from './endless/build-overdrive.js';
const ORDER = {
    burst: ['spellPower', 'bossDamage', 'fusionPower'], cycle: ['cooldown', 'fusionPower'], domain: ['area', 'spellPower'], fortress: ['coreGuard', 'heroGuard', 'spellPower'],
};
function label(id) { return id === 'spellPower' ? '마법 화력' : id === 'cooldown' ? '재사용시간' : id === 'area' ? '영역' : id === 'heroGuard' ? '영웅 피해' : id === 'coreGuard' ? '수호핵 피해' : id === 'bossDamage' ? '보스 피해' : '융합 위력'; }
function valueFor(id, mods) { return id === 'spellPower' ? mods.spellPowerMultiplier : id === 'cooldown' ? mods.cooldownMultiplier : id === 'area' ? mods.areaMultiplier : id === 'heroGuard' ? mods.heroDamageTakenMultiplier : id === 'coreGuard' ? mods.coreDamageTakenMultiplier : id === 'bossDamage' ? mods.bossDamageMultiplier : mods.fusionPowerMultiplier; }
function percentFor(id, value) { return id === 'cooldown' || id === 'heroGuard' || id === 'coreGuard' ? Math.max(0, (1 - value) * 100) : Math.max(0, (value - 1) * 100); }
export function projectBuildOverdriveEffects(state, archetype, elapsedMs) { const mods = overdriveModifiers(state, archetype, elapsedMs); if (!mods.active)
    return { active: false, archetype, effects: [] }; const effects = ORDER[archetype].map(id => { const value = valueFor(id, mods); return { id, label: label(id), value, percent: percentFor(id, value) }; }).filter(entry => entry.percent > 0); return { active: true, archetype, effects }; }
export function buildOverdriveEffectProjectionHint(projection, maxEffects = projection.effects.length) { return projection.effects.slice(0, Math.max(0, maxEffects)).map(effect => `${effect.label} ${effect.id === 'cooldown' || effect.id === 'heroGuard' || effect.id === 'coreGuard' ? '-' : '+'}${Math.round(effect.percent)}%`).join(' · '); }
function compactLabel(id) { return id === 'spellPower' ? '화력' : id === 'cooldown' ? '쿨' : id === 'area' ? '영역' : id === 'heroGuard' ? '영웅' : id === 'coreGuard' ? '수호핵' : id === 'bossDamage' ? '보스' : '융합'; }
export function buildOverdriveActivationToastLabel(archetypeName, projection) { const effects = projection.effects.slice(0, 2).map(effect => `${compactLabel(effect.id)}${effect.id === 'cooldown' || effect.id === 'heroGuard' || effect.id === 'coreGuard' ? '-' : '+'}${Math.round(effect.percent)}%`).join(' · '); return `OD · ${archetypeName}${effects ? ` · ${effects}` : ''}`; }
