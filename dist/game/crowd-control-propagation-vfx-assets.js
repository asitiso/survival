export const CROWD_CONTROL_PROPAGATION_VFX_HEROES = ['arkan', 'seria', 'kain', 'edric'];
export const CROWD_CONTROL_PROPAGATION_VFX_KINDS = ['chainLightning', 'frostNova', 'blackHole'];
export const CROWD_CONTROL_PROPAGATION_VFX_ATLAS = { src: './assets/heroes/crowd-control-propagation-vfx.png', columns: 4, rows: 3, cellSize: 128, width: 512, height: 384 };
const COL = { arkan: 0, seria: 1, kain: 2, edric: 3 };
const ROW = { chainLightning: 0, frostNova: 1, blackHole: 2 };
export function crowdControlPropagationVfxSprite(heroId, kind) { return { sx: COL[heroId] * 128, sy: ROW[kind] * 128, sw: 128, sh: 128, presentationOnly: true, loadFailureBlocksGameplay: false }; }
export function auditCrowdControlPropagationVfxAtlas() { const cells = new Set(), outOfBounds = []; for (const hero of CROWD_CONTROL_PROPAGATION_VFX_HEROES)
    for (const kind of CROWD_CONTROL_PROPAGATION_VFX_KINDS) {
        const r = crowdControlPropagationVfxSprite(hero, kind);
        cells.add(`${r.sx}:${r.sy}`);
        if (r.sx < 0 || r.sy < 0 || r.sx + r.sw > 512 || r.sy + r.sh > 384)
            outOfBounds.push(`${hero}:${kind}`);
    } return { heroCount: 4, kindCount: 3, itemCount: 12, uniqueCellCount: cells.size, outOfBounds, passed: cells.size === 12 && outOfBounds.length === 0 }; }
