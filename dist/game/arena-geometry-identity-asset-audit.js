import { ACTION_BUTTONS } from './config.js';
import { BossArenaSystem } from './boss-arena.js';
import { BOSS_ARENA_HAZARD_IDENTITY_IDS, auditBossArenaHazardIdentityAtlas, bossArenaHazardIdentityIcon } from './boss-arena-hazard-identity-assets.js';
import { MYTHIC_ARENA_GEOMETRY_IDENTITY_IDS, auditMythicArenaGeometryIdentityAtlas, mythicArenaGeometryIdentityIcon } from './endless/mythic-arena-geometry-identity-assets.js';
import { mythicArenaGeometryProfile } from './endless/mythic-arena-geometry.js';
const ARCHETYPES = ['inferno', 'summoner', 'juggernaut', 'abyssWitch', 'twinMaw', 'timeEater'];
const HAZARD = { inferno: 'firePool', summoner: 'summonSigil', juggernaut: 'shockLane', abyssWitch: 'cursePool', twinMaw: 'twinCross', timeEater: 'timeZone' };
const GEOMETRY = { inferno: 'solar-ring', summoner: 'brood-pockets', juggernaut: 'iron-corridor', abyssWitch: 'void-orbit', twinMaw: 'twin-cross', timeEater: 'broken-clock' };
function close(a, b) { return Math.abs(a - b) < 1e-9; }
export function auditArenaGeometryIdentityAssets() {
    const hazardAtlas = auditBossArenaHazardIdentityAtlas(), geometryAtlas = auditMythicArenaGeometryIdentityAtlas();
    const samples = [];
    const push = (caseId, archetype, passed) => samples.push({ caseId, archetype, passed });
    let primary = 0, safeLane = 0, gameplayContractMutation = false;
    for (const archetype of ARCHETYPES) {
        const kind = HAZARD[archetype], hazardIcon = bossArenaHazardIdentityIcon(kind), geometry0 = mythicArenaGeometryProfile(archetype, 0), geometry1 = mythicArenaGeometryProfile(archetype, 1), geometryIcon = mythicArenaGeometryIdentityIcon(GEOMETRY[archetype]);
        const arena = new BossArenaSystem(() => .25);
        arena.update(2.7, { bossPos: { x: 600, y: 400 }, heroPos: { x: 820, y: 450 }, archetype, phase: 1, variantTier: 0 });
        const spawned = arena.hazards[0];
        const mapping = spawned?.kind === kind, baseTiming = Boolean(spawned && close(spawned.telegraph, 1.05) && close(spawned.ttl, 5.4));
        const geometryMap = geometry0.id === GEOMETRY[archetype], reliefStable = geometry1.id === geometry0.id && geometry1.safeGapRadians >= geometry0.safeGapRadians && geometry1.pressure <= geometry0.pressure;
        push(`${archetype}:hazard-body`, archetype, hazardIcon.sx + 96 <= 288 && hazardIcon.sy + 96 <= 192);
        push(`${archetype}:primary-telegraph`, archetype, hazardIcon.primaryTelegraphIdentitySupported && hazardIcon.maxVisibleIcons === 1);
        if (hazardIcon.primaryTelegraphIdentitySupported)
            primary++;
        push(`${archetype}:active-suppressed`, archetype, hazardIcon.activeHazardIdentitySuppressed);
        push(`${archetype}:hazard-map`, archetype, mapping);
        push(`${archetype}:hazard-timing`, archetype, baseTiming);
        push(`${archetype}:geometry-body`, archetype, geometryIcon.sx + 96 <= 288 && geometryIcon.sy + 96 <= 192);
        push(`${archetype}:safe-lane`, archetype, geometryIcon.safeLaneIdentitySupported && geometryIcon.maxVisibleIcons === 1);
        if (geometryIcon.safeLaneIdentitySupported)
            safeLane++;
        push(`${archetype}:geometry-map`, archetype, geometryMap);
        push(`${archetype}:relief-stable`, archetype, reliefStable && geometryIcon.weakpointReliefIdentityStable);
        push(`${archetype}:actions`, archetype, ACTION_BUTTONS.length === 9);
        if (!mapping || !baseTiming || !geometryMap || !reliefStable)
            gameplayContractMutation = true;
    }
    const issues = [];
    if (samples.length !== 60)
        issues.push(`samples:${samples.length}`);
    if (!hazardAtlas.passed)
        issues.push('hazard-atlas');
    if (!geometryAtlas.passed)
        issues.push('geometry-atlas');
    if (samples.some(s => !s.passed))
        issues.push('sample');
    if (gameplayContractMutation)
        issues.push('gameplay-contract');
    const audit = { samples, hazardIdentityCount: BOSS_ARENA_HAZARD_IDENTITY_IDS.length, geometryIdentityCount: MYTHIC_ARENA_GEOMETRY_IDENTITY_IDS.length, hazardCoverage: hazardAtlas.coverage, geometryCoverage: geometryAtlas.coverage, hazardUniqueCellCount: hazardAtlas.uniqueCellCount, geometryUniqueCellCount: geometryAtlas.uniqueCellCount, primaryTelegraphCoverage: primary / 6, safeLaneGeometryCoverage: safeLane / 6, gameplayContractMutation, actionCount: ACTION_BUTTONS.length, snapshotSchemaMutation: false, issues, passed: false };
    audit.passed = issues.length === 0 && audit.primaryTelegraphCoverage === 1 && audit.safeLaneGeometryCoverage === 1 && audit.actionCount === 9;
    return audit;
}
