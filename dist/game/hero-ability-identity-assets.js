export const HERO_ABILITY_IDENTITY_ATLAS = {
    src: './assets/ui/hero-ability-icons.png',
    columns: 6,
    rows: 4,
    cellSize: 96,
    width: 576,
    height: 384,
};
export const HERO_ABILITY_HERO_IDS = ['arkan', 'seria', 'kain', 'edric'];
export const HERO_ABILITY_ACTIONS = ['spell1', 'spell2', 'spell3', 'spell4', 'ultimate1', 'ultimate2'];
const SPELL_TO_ACTION = {
    fireBolt: 'spell1',
    chainLightning: 'spell2',
    frostNova: 'spell3',
    flameField: 'spell4',
    meteorStorm: 'ultimate1',
    blackHole: 'ultimate2',
};
const heroRow = (heroId) => {
    const row = HERO_ABILITY_HERO_IDS.indexOf(heroId);
    if (row < 0)
        throw new Error(`Unknown hero ability hero: ${heroId}`);
    return row;
};
const actionColumn = (actionId) => {
    const column = HERO_ABILITY_ACTIONS.indexOf(actionId);
    if (column < 0)
        throw new Error(`Unknown hero ability action: ${actionId}`);
    return column;
};
const pct = (value, total) => total <= 1 ? 0 : (value / (total - 1)) * 100;
export function heroAbilityIdentityIcon(heroId, actionId) {
    const column = actionColumn(actionId);
    const row = heroRow(heroId);
    const size = HERO_ABILITY_IDENTITY_ATLAS.cellSize;
    return {
        key: `${heroId}:${actionId}`,
        heroId,
        actionId,
        atlasSrc: HERO_ABILITY_IDENTITY_ATLAS.src,
        backgroundSize: '600% 400%',
        backgroundPosition: `${pct(column, HERO_ABILITY_IDENTITY_ATLAS.columns)}% ${pct(row, HERO_ABILITY_IDENTITY_ATLAS.rows)}%`,
        sx: column * size,
        sy: row * size,
        sw: size,
        sh: size,
        legacyFallbackActionId: actionId,
        animated: false,
        motionAmplitude: 0,
        textFallbackPreserved: true,
        legacyFallbackPreserved: true,
        loadFailureBlocksGameplay: false,
    };
}
export function heroAbilitySpellIdentityIcon(heroId, spellId) {
    return heroAbilityIdentityIcon(heroId, SPELL_TO_ACTION[spellId]);
}
export function heroAbilityIdentityStyle(heroId, spellId) {
    const icon = heroAbilitySpellIdentityIcon(heroId, spellId);
    return `--growth-icon-image:url('${icon.atlasSrc}');--growth-icon-bg-size:${icon.backgroundSize};--growth-icon-bg-position:${icon.backgroundPosition}`;
}
export function heroAbilitySecondaryIdentityStyle(heroId, spellId) {
    const icon = heroAbilitySpellIdentityIcon(heroId, spellId);
    return `--secondary-icon-image:url('${icon.atlasSrc}');--secondary-icon-bg-size:${icon.backgroundSize};--secondary-icon-bg-position:${icon.backgroundPosition}`;
}
export function isHeroAbilityActionId(actionId) {
    return HERO_ABILITY_ACTIONS.includes(actionId);
}
export function auditHeroAbilityIdentityAtlas() {
    const cells = new Set();
    const outOfBounds = [];
    let itemCount = 0;
    for (const heroId of HERO_ABILITY_HERO_IDS) {
        for (const actionId of HERO_ABILITY_ACTIONS) {
            itemCount += 1;
            const icon = heroAbilityIdentityIcon(heroId, actionId);
            cells.add(`${icon.sx}:${icon.sy}`);
            if (icon.sx < 0 || icon.sy < 0 || icon.sx + icon.sw > HERO_ABILITY_IDENTITY_ATLAS.width || icon.sy + icon.sh > HERO_ABILITY_IDENTITY_ATLAS.height) {
                outOfBounds.push(icon.key);
            }
        }
    }
    const coverage = itemCount === 24 ? 1 : itemCount / 24;
    return {
        itemCount,
        coverage,
        uniqueCellCount: cells.size,
        outOfBounds,
        passed: itemCount === 24 && cells.size === 24 && outOfBounds.length === 0,
    };
}
