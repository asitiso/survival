import { clamp } from '../../core/math.js';
import { createDefaultContractState, } from './contracts.js';
import { createDefaultWorldState } from './world-evolution.js';
import { createDefaultNemesisState, } from './nemesis.js';
import { createDefaultAscensionState } from './ascension.js';
import { createDefaultTelemetryState } from './telemetry.js';
import { createDefaultHeroAscensionState, sanitizeHeroAscensionState } from './hero-ascension.js';
import { createDefaultChronicleState, sanitizeChronicleState } from './chronicle.js';
import { createDefaultOverdriveState } from './build-overdrive.js';
import { createDefaultFinalFormSignatureState, FINAL_FORM_SIGNATURE_IDS } from './final-form-signature.js';
import { createDefaultLongRunOathState } from './long-run-oaths.js';
import { createDefaultMobileFrameGovernorState } from './mobile-frame-governor.js';
import { createDefaultRunCheckpointState, sanitizeRunCheckpointState } from './run-checkpoints.js';
import { createDefaultRunMilestoneRecapState, sanitizeRunMilestoneRecapState } from './run-milestone-recap.js';
const CONTRACT_FAMILIES = new Set(['slayer', 'warden', 'arcane', 'hunter', 'survivor']);
const WORLDS = new Set(['calm', 'stormfront', 'ruins', 'mana_bloom', 'blood_moon', 'sanctuary']);
const NODE_KINDS = new Set(['safe_corridor', 'barricade', 'mana_well', 'volatile_zone', 'sanctuary_zone']);
const MUTATORS = new Set(['accelerated_projectiles', 'reinforced_elites', 'volatile_death', 'scarce_shop']);
const MARK_KINDS = ['spell_guard', 'blink_hunt', 'core_siege', 'enrage_clock', 'mirror_affinity'];
function object(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {};
}
function finite(value, fallback = 0) {
    return typeof value === 'number' && Number.isFinite(value) ? value : fallback;
}
function int(value, min, max, fallback = 0) {
    return Math.round(clamp(finite(value, fallback), min, max));
}
function nonnegative(value) {
    return clamp(finite(value, 0), 0, Number.MAX_SAFE_INTEGER);
}
function sanitizeRng(value, fallbackSeed) {
    const raw = object(value);
    return {
        seed: int(raw.seed, 0, 0xffff_ffff, fallbackSeed) >>> 0,
        cursor: int(raw.cursor, 0, Number.MAX_SAFE_INTEGER, 0),
    };
}
function sanitizeContractOption(value) {
    const raw = object(value);
    if (typeof raw.optionId !== 'string' || !CONTRACT_FAMILIES.has(raw.family))
        return undefined;
    return {
        optionId: raw.optionId,
        family: raw.family,
        title: typeof raw.title === 'string' ? raw.title : raw.family,
        description: typeof raw.description === 'string' ? raw.description : '',
        target: int(raw.target, 1, 1_000_000, 1),
        durationMs: int(raw.durationMs, 1_000, 600_000, 30_000),
    };
}
function sanitizeOffer(value) {
    const raw = object(value);
    const optionsRaw = Array.isArray(raw.options) ? raw.options.map(sanitizeContractOption).filter(Boolean) : [];
    if (typeof raw.offerId !== 'string' || optionsRaw.length !== 3)
        return undefined;
    return {
        offerId: raw.offerId,
        generatedAtMs: int(raw.generatedAtMs, 0, Number.MAX_SAFE_INTEGER, 0),
        options: optionsRaw,
    };
}
function sanitizeActive(value) {
    const raw = object(value);
    if (typeof raw.contractId !== 'string' || !CONTRACT_FAMILIES.has(raw.family))
        return undefined;
    return {
        contractId: raw.contractId,
        family: raw.family,
        startedAtMs: int(raw.startedAtMs, 0, Number.MAX_SAFE_INTEGER, 0),
        deadlineMs: int(raw.deadlineMs, 0, Number.MAX_SAFE_INTEGER, 0),
        target: int(raw.target, 1, 1_000_000, 1),
        progress: int(raw.progress, 0, 1_000_000, 0),
        baselineCoreHp: int(raw.baselineCoreHp, 0, 1_000_000_000, 0),
    };
}
function sanitizeContracts(value) {
    const base = createDefaultContractState();
    const raw = object(value);
    const history = Array.isArray(raw.offerHistory)
        ? raw.offerHistory.filter((entry) => CONTRACT_FAMILIES.has(entry)).slice(-12)
        : [];
    const boons = Array.isArray(raw.boons)
        ? raw.boons.map((entry) => {
            const boon = object(entry);
            return CONTRACT_FAMILIES.has(boon.family)
                ? { family: boon.family, expiresAtMs: int(boon.expiresAtMs, 0, Number.MAX_SAFE_INTEGER, 0) }
                : undefined;
        }).filter((entry) => Boolean(entry)).slice(-4)
        : [];
    return {
        nextOfferIndex: int(raw.nextOfferIndex, 0, 10_000, base.nextOfferIndex),
        offerHistory: history,
        pendingOffer: sanitizeOffer(raw.pendingOffer),
        active: sanitizeActive(raw.active),
        completedCount: int(raw.completedCount, 0, 1_000_000, 0),
        failedCount: int(raw.failedCount, 0, 1_000_000, 0),
        boons,
    };
}
function sanitizeNode(value) {
    const raw = object(value);
    if (typeof raw.nodeId !== 'string' || typeof raw.kind !== 'string' || !NODE_KINDS.has(raw.kind))
        return undefined;
    return {
        nodeId: raw.nodeId,
        kind: raw.kind,
        x: clamp(finite(raw.x, 0.5), 0, 1),
        y: clamp(finite(raw.y, 0.5), 0, 1),
        radius: clamp(finite(raw.radius, 0.1), 0.05, 0.35),
        expiresAtMs: int(raw.expiresAtMs, 0, Number.MAX_SAFE_INTEGER, 0),
    };
}
function sanitizeWorld(value) {
    const base = createDefaultWorldState();
    const raw = object(value);
    const current = typeof raw.current === 'string' && WORLDS.has(raw.current) ? raw.current : base.current;
    const nodes = Array.isArray(raw.nodes) ? raw.nodes.map(sanitizeNode).filter((node) => Boolean(node)).slice(0, 12) : [];
    return {
        current,
        evolutionCount: int(raw.evolutionCount, 0, 1000, 0),
        lastEvolutionAtMs: int(raw.lastEvolutionAtMs, 0, Number.MAX_SAFE_INTEGER, 0),
        nodes,
    };
}
function sanitizeMarks(value) {
    const raw = object(value);
    return {
        spell_guard: int(raw.spell_guard, 0, 9, 0),
        blink_hunt: int(raw.blink_hunt, 0, 9, 0),
        core_siege: int(raw.core_siege, 0, 9, 0),
        enrage_clock: int(raw.enrage_clock, 0, 9, 0),
        mirror_affinity: int(raw.mirror_affinity, 0, 9, 0),
    };
}
function sanitizeProfile(bossId, value) {
    const raw = object(value);
    const affinityRaw = object(raw.affinityTotals);
    const affinityTotals = {};
    for (const [key, amount] of Object.entries(affinityRaw).slice(0, 12))
        affinityTotals[key] = nonnegative(amount);
    const mirrorAffinity = typeof raw.mirrorAffinity === 'string' && raw.mirrorAffinity.length > 0 ? raw.mirrorAffinity : undefined;
    return {
        bossId,
        encounters: int(raw.encounters, 0, 10_000, 0),
        marks: sanitizeMarks(raw.marks),
        affinityTotals,
        mirrorAffinity,
        longestEncounterMs: int(raw.longestEncounterMs, 0, 3_600_000, 0),
        totalCoreDamage: nonnegative(raw.totalCoreDamage),
        defeats: int(raw.defeats, 0, 10_000, 0),
    };
}
function sanitizeNemesis(value) {
    const raw = object(value);
    const profilesRaw = object(raw.profiles);
    const profiles = {};
    for (const [bossId, profile] of Object.entries(profilesRaw).slice(0, 24))
        profiles[bossId] = sanitizeProfile(bossId, profile);
    return Object.keys(profiles).length === 0 ? createDefaultNemesisState() : { profiles };
}
function sanitizeAscension(value) {
    const base = createDefaultAscensionState();
    const raw = object(value);
    const mutators = [];
    if (Array.isArray(raw.mutators)) {
        for (const item of raw.mutators) {
            if (MUTATORS.has(item) && !mutators.includes(item))
                mutators.push(item);
            if (mutators.length >= 3)
                break;
        }
    }
    return { tier: int(raw.tier, 0, 10, base.tier), mutators };
}
function sanitizeTelemetry(value) {
    const raw = object(value);
    const base = createDefaultTelemetryState();
    const samples = Array.isArray(raw.framePressureSamples)
        ? raw.framePressureSamples.map((entry) => clamp(finite(entry, 0), 0, 250)).slice(-12)
        : [];
    return {
        spellCasts: int(raw.spellCasts, 0, Number.MAX_SAFE_INTEGER, base.spellCasts),
        fusionCasts: int(raw.fusionCasts, 0, Number.MAX_SAFE_INTEGER, base.fusionCasts),
        heroDamage: nonnegative(raw.heroDamage),
        coreDamage: nonnegative(raw.coreDamage),
        bossEncounters: int(raw.bossEncounters, 0, Number.MAX_SAFE_INTEGER, 0),
        bossDurationMs: nonnegative(raw.bossDurationMs),
        contractCompleted: int(raw.contractCompleted, 0, Number.MAX_SAFE_INTEGER, 0),
        contractFailed: int(raw.contractFailed, 0, Number.MAX_SAFE_INTEGER, 0),
        pauseCount: int(raw.pauseCount, 0, Number.MAX_SAFE_INTEGER, 0),
        resumeCount: int(raw.resumeCount, 0, Number.MAX_SAFE_INTEGER, 0),
        framePressureSamples: samples,
    };
}
function sanitizeOverdrive(value) {
    const raw = object(value);
    return {
        charge: clamp(finite(raw.charge, 0), 0, 100),
        activeUntilMs: int(raw.activeUntilMs, 0, Number.MAX_SAFE_INTEGER, 0),
        activations: int(raw.activations, 0, Number.MAX_SAFE_INTEGER, 0),
    };
}
const OATH_KINDS = new Set(['slayer', 'elite_hunt', 'boss_hunt', 'arcane_flow', 'core_guard', 'endure']);
const OATH_BOONS = new Set(['prosperity', 'power', 'guard', 'boss']);
const OATH_MILESTONES = new Set([120, 150, 180, 240, 300, 360]);
function sanitizeOathActive(value) {
    const raw = object(value);
    if (typeof raw.id !== 'string' || !OATH_KINDS.has(raw.kind))
        return null;
    const milestone = int(raw.milestone, 0, 1000, 0);
    if (!OATH_MILESTONES.has(milestone))
        return null;
    return {
        id: raw.id, milestone, kind: raw.kind, title: typeof raw.title === 'string' ? raw.title.slice(0, 40) : '서약',
        startedAtMs: int(raw.startedAtMs, 0, Number.MAX_SAFE_INTEGER, 0), deadlineMs: int(raw.deadlineMs, 0, Number.MAX_SAFE_INTEGER, 0),
        target: int(raw.target, 1, 10_000_000, 1), progress: clamp(finite(raw.progress, 0), 0, 10_000_000), baselineCoreHp: clamp(finite(raw.baselineCoreHp, 1), 1, 1_000_000_000), coreDamage: nonnegative(raw.coreDamage),
    };
}
function sanitizeOathBoon(value) {
    const raw = object(value);
    if (!OATH_BOONS.has(raw.kind))
        return null;
    return { kind: raw.kind, expiresAtMs: int(raw.expiresAtMs, 0, Number.MAX_SAFE_INTEGER, 0) };
}
function sanitizeMilestones(value) {
    if (!Array.isArray(value))
        return [];
    const out = [];
    for (const raw of value) {
        const n = int(raw, 0, 1000, -1);
        if (OATH_MILESTONES.has(n) && !out.includes(n))
            out.push(n);
    }
    return out.slice(0, 6);
}
function sanitizeOaths(value) {
    const raw = object(value);
    const history = Array.isArray(raw.history) ? raw.history.filter((kind) => OATH_KINDS.has(kind)).slice(-6) : [];
    return { completedMilestones: sanitizeMilestones(raw.completedMilestones), failedMilestones: sanitizeMilestones(raw.failedMilestones), expiredMilestones: sanitizeMilestones(raw.expiredMilestones), history, active: sanitizeOathActive(raw.active), boon: sanitizeOathBoon(raw.boon) };
}
const FRAME_GOVERNOR_TIERS = new Set(['full', 'reduced', 'minimal']);
function sanitizeFrameGovernor(value) {
    const raw = object(value);
    const tier = typeof raw.tier === 'string' && FRAME_GOVERNOR_TIERS.has(raw.tier) ? raw.tier : 'full';
    return { tier, stressFrames: int(raw.stressFrames, 0, 90, 0), recoveryFrames: int(raw.recoveryFrames, 0, 240, 0), transitions: int(raw.transitions, 0, Number.MAX_SAFE_INTEGER, 0) };
}
function sanitizeSignature(value) {
    const raw = object(value);
    const formId = typeof raw.formId === 'string' && FINAL_FORM_SIGNATURE_IDS.has(raw.formId) ? raw.formId : null;
    return {
        charge: clamp(finite(raw.charge, 0), 0, 100),
        activeUntilMs: int(raw.activeUntilMs, 0, Number.MAX_SAFE_INTEGER, 0),
        cooldownUntilMs: int(raw.cooldownUntilMs, 0, Number.MAX_SAFE_INTEGER, 0),
        activations: int(raw.activations, 0, Number.MAX_SAFE_INTEGER, 0),
        formId,
    };
}
export function createDefaultExtensionState(seed = 0x4d595df4) {
    return {
        schemaVersion: 2,
        rng: { seed: seed >>> 0, cursor: 0 },
        contracts: createDefaultContractState(),
        world: createDefaultWorldState(),
        nemesis: createDefaultNemesisState(),
        ascension: createDefaultAscensionState(),
        telemetry: createDefaultTelemetryState(),
        heroAscension: createDefaultHeroAscensionState(),
        chronicle: createDefaultChronicleState(),
        overdrive: createDefaultOverdriveState(),
        signature: createDefaultFinalFormSignatureState(),
        oaths: createDefaultLongRunOathState(),
        frameGovernor: createDefaultMobileFrameGovernorState(),
        checkpoints: createDefaultRunCheckpointState(),
        recaps: createDefaultRunMilestoneRecapState(),
    };
}
function checksumPayload(input) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < input.length; i += 1) {
        hash ^= input.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193) >>> 0;
    }
    return hash.toString(36).toUpperCase().padStart(7, '0');
}
export function serializeExtension(state) {
    const payloadText = JSON.stringify(state);
    return JSON.stringify({ envelopeVersion: 1, checksum: checksumPayload(payloadText), payload: state });
}
export function restoreExtension(input, fallbackSeed = 0x4d595df4) {
    let parsed = input;
    if (typeof input === 'string') {
        try {
            parsed = JSON.parse(input);
        }
        catch {
            return createDefaultExtensionState(fallbackSeed);
        }
    }
    const envelope = object(parsed);
    if (envelope.envelopeVersion === 1) {
        const payload = envelope.payload;
        const checksum = typeof envelope.checksum === 'string' ? envelope.checksum : '';
        if (!payload || checksumPayload(JSON.stringify(payload)) !== checksum)
            return createDefaultExtensionState(fallbackSeed);
        parsed = payload;
    }
    const raw = object(parsed);
    return {
        schemaVersion: 2,
        rng: sanitizeRng(raw.rng, fallbackSeed),
        contracts: sanitizeContracts(raw.contracts),
        world: sanitizeWorld(raw.world),
        nemesis: sanitizeNemesis(raw.nemesis),
        ascension: sanitizeAscension(raw.ascension),
        telemetry: sanitizeTelemetry(raw.telemetry),
        heroAscension: sanitizeHeroAscensionState(raw.heroAscension),
        chronicle: sanitizeChronicleState(raw.chronicle),
        overdrive: sanitizeOverdrive(raw.overdrive),
        signature: sanitizeSignature(raw.signature),
        oaths: sanitizeOaths(raw.oaths),
        frameGovernor: sanitizeFrameGovernor(raw.frameGovernor),
        checkpoints: sanitizeRunCheckpointState(raw.checkpoints),
        recaps: sanitizeRunMilestoneRecapState(raw.recaps),
    };
}
