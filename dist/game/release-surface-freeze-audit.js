import { ACTION_BUTTONS } from './config.js';
import { HERO_PROFILES } from './hero-profiles.js';
import { MAP_LAYOUTS } from './map-layouts.js';
const SPELL_IDS = ['fireBolt', 'chainLightning', 'frostNova', 'flameField', 'meteorStorm', 'blackHole'];
const FROZEN_HERO_IDS = ['arkan', 'seria', 'kain', 'edric'];
export function auditReleaseSurfaceFreeze() {
    const heroIds = HERO_PROFILES.map(x => x.id);
    const passed = ACTION_BUTTONS.length === 9 && heroIds.length === 4 && heroIds.every((x, i) => x === FROZEN_HERO_IDS[i]) && SPELL_IDS.length === 6 && MAP_LAYOUTS.length === 3;
    return { actionCount: ACTION_BUTTONS.length, heroCount: heroIds.length, heroIds: [...heroIds], spellCount: SPELL_IDS.length, mapCount: MAP_LAYOUTS.length, snapshotSchemaVersion: 1, snapshotSchemaMutation: false, passed };
}
