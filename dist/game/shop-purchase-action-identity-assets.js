export const SHOP_PURCHASE_ACTION_IDS = ['equip', 'upgrade', 'legendary', 'replace', 'potion'];
const CELL = { equip: 0, upgrade: 1, legendary: 2, replace: 3, potion: 4 };
const META = {
    equip: { label: '신규', accent: '#72cfff' }, upgrade: { label: '강화', accent: '#78e7ae' }, legendary: { label: '전설', accent: '#ffd76a' }, replace: { label: '교체', accent: '#ff9c70' }, potion: { label: '물약', accent: '#70e0b1' },
};
export const SHOP_PURCHASE_ACTION_ATLAS = { src: './assets/ui/shop-purchase-action-icons.png', columns: 5, rows: 1, cellSize: 96, width: 480, height: 96 };
const pct = (index, count) => count <= 1 ? 0 : (index / (count - 1)) * 100;
export function shopPurchaseActionIdentityIcon(id) { const meta = META[id]; return { id, label: meta.label, accent: meta.accent, sx: CELL[id] * 96, sy: 0, sw: 96, sh: 96, animated: false, motionAmplitude: 0, textFallbackPreserved: true, loadFailureBlocksGameplay: false }; }
export function shopPurchaseActionIdentityStyle(id) { return `--shop-purchase-action-image:url('${SHOP_PURCHASE_ACTION_ATLAS.src}');--shop-purchase-action-bg-size:500% 100%;--shop-purchase-action-bg-position:${pct(CELL[id], 5)}% 0%`; }
export function auditShopPurchaseActionIdentityAtlas() { const icons = SHOP_PURCHASE_ACTION_IDS.map(shopPurchaseActionIdentityIcon), outOfBounds = icons.filter(icon => icon.sx < 0 || icon.sx + icon.sw > SHOP_PURCHASE_ACTION_ATLAS.width || icon.sy + icon.sh > SHOP_PURCHASE_ACTION_ATLAS.height).map(icon => icon.id), uniqueCellCount = new Set(icons.map(icon => `${icon.sx}:${icon.sy}`)).size, coverage = icons.length / 5; return { coverage, uniqueCellCount, outOfBounds, passed: coverage === 1 && uniqueCellCount === 5 && outOfBounds.length === 0 }; }
