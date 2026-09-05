import { SHOP_ITEM_ATLAS, shopItemIconSprite } from './shop-item-assets.js';
export const LEGENDARY_AWAKENING_ITEM_IDS = ['arcane-staff', 'rapid-wand', 'blast-rod', 'golden-wand', 'iron-robe', 'gale-cloak', 'magnet-cloak', 'guardian-plate'];
export { SHOP_ITEM_ATLAS as LEGENDARY_AWAKENING_ATLAS };
function legendaryEquipped(equipment, id) { return (equipment.weapon?.id === id && equipment.weapon.legendary) || (equipment.armor?.id === id && equipment.armor.legendary) || false; }
function identity(itemId) { const icon = shopItemIconSprite(itemId); return icon ? { itemId, icon, animated: false, motionAmplitude: 0, textFallbackPreserved: true, loadFailureBlocksGameplay: false } : null; }
export function activeLegendaryAwakeningRecall(equipment, mods) {
    const ids = [];
    const galeActive = legendaryEquipped(equipment, 'gale-cloak') && mods.moveSpeedMultiplier > 1.000001;
    if (legendaryEquipped(equipment, 'arcane-staff') && mods.spellPowerMultiplier > 1.000001)
        ids.push('arcane-staff');
    const chronoBaseline = galeActive ? .88 : 1;
    if (legendaryEquipped(equipment, 'rapid-wand') && mods.cooldownMultiplier < chronoBaseline - 1e-6)
        ids.push('rapid-wand');
    if (legendaryEquipped(equipment, 'iron-robe') && mods.heroDamageTakenMultiplier < .999999)
        ids.push('iron-robe');
    if (galeActive)
        ids.push('gale-cloak');
    if (legendaryEquipped(equipment, 'guardian-plate') && mods.coreDamageTakenMultiplier < .999999)
        ids.push('guardian-plate');
    return ids.map(identity).filter((v) => Boolean(v)).slice(0, 2);
}
export function legendaryProcIdentity(proc, equipment) {
    const id = proc.type === 'nova' ? 'blast-rod' : proc.type === 'bonusGold' ? 'golden-wand' : proc.type === 'magnet' ? 'magnet-cloak' : proc.type === 'coreHeal' ? 'guardian-plate' : null;
    return id && legendaryEquipped(equipment, id) ? identity(id) : null;
}
export function auditLegendaryAwakeningReuse() {
    const missing = [];
    const cells = new Set();
    for (const id of LEGENDARY_AWAKENING_ITEM_IDS) {
        const icon = shopItemIconSprite(id);
        if (!icon)
            missing.push(id);
        else
            cells.add(`${icon.sx}:${icon.sy}`);
    }
    return { itemCount: LEGENDARY_AWAKENING_ITEM_IDS.length, coverage: (LEGENDARY_AWAKENING_ITEM_IDS.length - missing.length) / LEGENDARY_AWAKENING_ITEM_IDS.length, uniqueCellCount: cells.size, missing, passed: missing.length === 0 };
}
