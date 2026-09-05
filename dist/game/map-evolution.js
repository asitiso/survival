export function mapEvolutionStage(seconds) {
    const t = Math.max(0, Number.isFinite(seconds) ? seconds : 0);
    if (t >= 960)
        return 2;
    if (t >= 480)
        return 1;
    return 0;
}
function copyWalls(items) { return items.map((item) => ({ ...item })); }
function copyPools(items) { return items.map((item) => ({ ...item })); }
function copyCrystals(items) { return items.map((item) => ({ ...item })); }
export function evolveMapLayout(layout, stage) {
    if (stage === 0)
        return { ...layout, walls: copyWalls(layout.walls), pools: copyPools(layout.pools), crystals: copyCrystals(layout.crystals) };
    let walls = copyWalls(layout.walls);
    let pools = copyPools(layout.pools);
    let crystals = copyCrystals(layout.crystals);
    if (layout.id === 'ruinedGate') {
        if (stage >= 1) {
            walls = walls.filter((_, index) => index !== 1);
            walls.push({ x: 560, y: 585, w: 75, h: 22 });
            pools.push({ x: 575, y: 620, radius: 72, slowFactor: 0.82 });
        }
        if (stage >= 2) {
            walls = walls.filter((_, index) => index !== 0);
            walls.push({ x: 935, y: 275, w: 24, h: 90 });
            crystals.push({ x: 805, y: 690, threshold: 6, blastRadius: 165, blastDamage: 220 });
        }
    }
    else if (layout.id === 'frozenFen') {
        if (stage >= 1) {
            pools = pools.map((pool, index) => ({ ...pool, radius: pool.radius + (index === 1 ? 48 : 28), slowFactor: Math.max(0.48, pool.slowFactor - 0.04) }));
            walls.push({ x: 760, y: 610, w: 130, h: 26 });
        }
        if (stage >= 2) {
            pools = pools.map((pool, index) => ({ ...pool, x: pool.x + (index === 0 ? 70 : index === 2 ? -70 : 0), radius: pool.radius + 22 }));
            crystals.push({ x: 770, y: 710, threshold: 7, blastRadius: 195, blastDamage: 235 });
        }
    }
    else {
        if (stage >= 1) {
            crystals.push({ x: 800, y: 210, threshold: 4, blastRadius: 165, blastDamage: 190 }, { x: 800, y: 740, threshold: 4, blastRadius: 165, blastDamage: 190 });
            pools = pools.map((pool) => ({ ...pool, radius: pool.radius + 26 }));
        }
        if (stage >= 2) {
            crystals = crystals.map((crystal) => ({ ...crystal, threshold: Math.max(3, crystal.threshold - 1), blastRadius: crystal.blastRadius + 18 }));
            walls.push({ x: 610, y: 440, w: 95, h: 24 }, { x: 895, y: 440, w: 95, h: 24 });
        }
    }
    return { ...layout, walls, pools, crystals };
}
export function mapEvolutionLabel(mapId, stage) {
    if (mapId === 'ruinedGate')
        return stage === 1 ? '성벽 붕괴 · 서쪽 통로 개방' : '관문 붕괴 · 중앙 전선 개방';
    if (mapId === 'frozenFen')
        return stage === 1 ? '빙결 확산 · 늪지 확대' : '빙하 이동 · 안전지대 재편';
    return stage === 1 ? '수정 공명 · 연쇄망 활성화' : '마력 과포화 · 수정 폭주';
}
export function mapEnvironmentVfxDescriptor(mapId, stage, quality) {
    const base = mapId === 'ruinedGate'
        ? { motif: 'embers', color: '#f2a15c', rate: 4.2, speed: 34, size: 2.6 }
        : mapId === 'frozenFen'
            ? { motif: 'snow', color: '#b8f1ff', rate: 5.0, speed: 24, size: 2.8 }
            : { motif: 'shards', color: '#cbb8ff', rate: 4.5, speed: 30, size: 2.4 };
    const stageScale = 1 + stage * 0.34;
    const qualityScale = quality === 'high' ? 1 : quality === 'medium' ? 0.66 : 0.38;
    return {
        motif: base.motif, color: base.color,
        particlesPerSecond: Number(Math.min(10, base.rate * stageScale * qualityScale).toFixed(3)),
        speed: base.speed * (1 + stage * 0.08), size: base.size + (stage * 0.25),
        evolutionPulseAlpha: stage === 2 ? 0.18 : stage === 1 ? 0.14 : 0.10,
    };
}
export function environmentDestructionVfxDescriptor(mapId, kind, stage, quality) {
    const env = mapEnvironmentVfxDescriptor(mapId, stage, quality);
    const q = quality === 'high' ? 1 : quality === 'medium' ? .68 : .4;
    const crystal = kind === 'crystalBlast';
    return { motif: env.motif, color: env.color, motion: crystal ? 'burst' : 'collapse', debrisCount: Math.max(3, Math.min(18, Math.round((crystal ? 14 : 11) * (1 + stage * .12) * q))), rayCount: crystal ? 10 : 6, waveCount: crystal ? 2 : 3, glowAlpha: crystal ? .28 : .22, debrisSpeed: (crystal ? 150 : 95) * (1 + stage * .08) };
}
export function resolveMapEvolutionMaterial(mapId, stage) {
    if (mapId === 'ruinedGate') {
        return stage === 2
            ? {
                poolOuter: 'rgba(24,76,92,.42)', poolInner: 'rgba(49,153,182,.28)', poolGlow: 'rgba(103,239,255,.22)', poolRim: 'rgba(125,235,255,.34)', poolSpark: 'rgba(180,248,255,.24)',
                wallFill: '#243c46', wallHighlight: 'rgba(162,228,240,.18)', wallShadow: '#17272f', wallInset: 'rgba(0,0,0,.16)', wallStroke: 'rgba(121,199,214,.34)',
                crystalGlow: 'rgba(117,244,255,.18)', crystalAura: 'rgba(93,210,222,.10)', crystalBase: 'rgba(140,238,247,.14)', crystalRing: 'rgba(156,244,255,.38)',
            }
            : stage === 1
                ? {
                    poolOuter: 'rgba(19,69,83,.38)', poolInner: 'rgba(42,133,160,.24)', poolGlow: 'rgba(91,224,244,.18)', poolRim: 'rgba(115,219,236,.30)', poolSpark: 'rgba(172,240,248,.20)',
                    wallFill: '#223741', wallHighlight: 'rgba(147,216,228,.16)', wallShadow: '#16252d', wallInset: 'rgba(0,0,0,.14)', wallStroke: 'rgba(110,187,204,.32)',
                    crystalGlow: 'rgba(92,224,236,.14)', crystalAura: 'rgba(80,185,201,.08)', crystalBase: 'rgba(132,226,238,.11)', crystalRing: 'rgba(139,232,241,.32)',
                }
                : {
                    poolOuter: 'rgba(16,56,67,.34)', poolInner: 'rgba(34,111,132,.22)', poolGlow: 'rgba(83,196,216,.14)', poolRim: 'rgba(102,190,204,.24)', poolSpark: 'rgba(154,225,234,.18)',
                    wallFill: '#21343d', wallHighlight: 'rgba(136,197,209,.14)', wallShadow: '#15222a', wallInset: 'rgba(0,0,0,.12)', wallStroke: 'rgba(98,167,181,.28)',
                    crystalGlow: 'rgba(82,197,214,.10)', crystalAura: 'rgba(70,160,176,.06)', crystalBase: 'rgba(118,202,214,.09)', crystalRing: 'rgba(125,210,222,.26)',
                };
    }
    if (mapId === 'frozenFen') {
        return stage === 2
            ? {
                poolOuter: 'rgba(121,194,224,.28)', poolInner: 'rgba(175,233,252,.18)', poolGlow: 'rgba(222,249,255,.20)', poolRim: 'rgba(214,247,255,.36)', poolSpark: 'rgba(240,252,255,.28)',
                wallFill: '#bdd6df', wallHighlight: 'rgba(255,255,255,.22)', wallShadow: '#8fb3c0', wallInset: 'rgba(74,118,136,.12)', wallStroke: 'rgba(225,247,255,.34)',
                crystalGlow: 'rgba(186,241,255,.20)', crystalAura: 'rgba(137,211,228,.12)', crystalBase: 'rgba(227,248,255,.14)', crystalRing: 'rgba(225,247,255,.42)',
            }
            : stage === 1
                ? {
                    poolOuter: 'rgba(103,171,199,.24)', poolInner: 'rgba(162,221,240,.16)', poolGlow: 'rgba(210,244,255,.16)', poolRim: 'rgba(202,236,247,.30)', poolSpark: 'rgba(233,249,255,.22)',
                    wallFill: '#adc7d1', wallHighlight: 'rgba(255,255,255,.18)', wallShadow: '#88aab8', wallInset: 'rgba(66,105,122,.10)', wallStroke: 'rgba(211,240,249,.30)',
                    crystalGlow: 'rgba(171,233,248,.16)', crystalAura: 'rgba(124,197,214,.10)', crystalBase: 'rgba(216,243,249,.12)', crystalRing: 'rgba(213,240,247,.34)',
                }
                : {
                    poolOuter: 'rgba(89,149,176,.22)', poolInner: 'rgba(145,203,222,.14)', poolGlow: 'rgba(195,233,246,.12)', poolRim: 'rgba(188,223,236,.26)', poolSpark: 'rgba(223,243,249,.18)',
                    wallFill: '#a5bec8', wallHighlight: 'rgba(255,255,255,.15)', wallShadow: '#819fab', wallInset: 'rgba(58,93,108,.09)', wallStroke: 'rgba(197,228,237,.26)',
                    crystalGlow: 'rgba(152,218,234,.12)', crystalAura: 'rgba(111,179,195,.08)', crystalBase: 'rgba(208,236,244,.10)', crystalRing: 'rgba(200,232,241,.28)',
                };
    }
    return stage === 2
        ? {
            poolOuter: 'rgba(111,90,184,.34)', poolInner: 'rgba(172,148,247,.22)', poolGlow: 'rgba(220,195,255,.20)', poolRim: 'rgba(213,183,255,.34)', poolSpark: 'rgba(235,218,255,.24)',
            wallFill: '#58497c', wallHighlight: 'rgba(223,203,255,.18)', wallShadow: '#3b3254', wallInset: 'rgba(18,12,32,.16)', wallStroke: 'rgba(203,171,255,.32)',
            crystalGlow: 'rgba(204,156,255,.22)', crystalAura: 'rgba(170,120,237,.14)', crystalBase: 'rgba(224,201,255,.14)', crystalRing: 'rgba(217,189,255,.40)',
        }
        : stage === 1
            ? {
                poolOuter: 'rgba(98,79,165,.30)', poolInner: 'rgba(156,134,231,.20)', poolGlow: 'rgba(208,181,247,.16)', poolRim: 'rgba(198,169,239,.30)', poolSpark: 'rgba(228,208,250,.20)',
                wallFill: '#50426f', wallHighlight: 'rgba(213,191,247,.16)', wallShadow: '#372f4f', wallInset: 'rgba(18,12,32,.14)', wallStroke: 'rgba(189,159,235,.28)',
                crystalGlow: 'rgba(190,146,240,.18)', crystalAura: 'rgba(156,111,218,.11)', crystalBase: 'rgba(215,193,248,.12)', crystalRing: 'rgba(209,180,243,.34)',
            }
            : {
                poolOuter: 'rgba(83,69,143,.26)', poolInner: 'rgba(142,122,211,.18)', poolGlow: 'rgba(193,171,235,.12)', poolRim: 'rgba(184,160,222,.26)', poolSpark: 'rgba(221,204,242,.16)',
                wallFill: '#473c64', wallHighlight: 'rgba(202,184,236,.14)', wallShadow: '#332b49', wallInset: 'rgba(18,12,32,.12)', wallStroke: 'rgba(176,150,215,.24)',
                crystalGlow: 'rgba(176,136,226,.14)', crystalAura: 'rgba(147,106,206,.08)', crystalBase: 'rgba(202,184,232,.10)', crystalRing: 'rgba(195,170,229,.28)',
            };
}
