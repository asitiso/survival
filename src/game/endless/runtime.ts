import type { Effect, GameplayEvent, LegacyRunView } from './types.js';
import { advanceAscension } from './ascension.js';
import {
  advanceContract,
  createContractOffer,
  shouldOfferContract,
  type ContractRuntimeState,
} from './contracts.js';
import { recordBossEncounter } from './nemesis.js';
import { createDefaultExtensionState, type ExtensionSnapshotV2 } from './snapshot.js';
import { recordContractTelemetry, recordTelemetryEvent } from './telemetry.js';
import { evolveWorld, pruneExpiredNodes, shouldEvolveWorld } from './world-evolution.js';
import { advanceHeroAscension } from './hero-ascension.js';
import { advanceChronicle } from './chronicle.js';
import type { HeroId } from '../hero-profiles.js';
import { advanceBuildOverdrive } from './build-overdrive.js';
import { advanceFinalFormSignature, finalFormSignatureProfile } from './final-form-signature.js';
import { deriveHeroFinalForm } from './final-form.js';
import { advanceLongRunOaths } from './long-run-oaths.js';
import { advanceRunCheckpoints } from './run-checkpoints.js';
import { advanceRunMilestoneRecap } from './run-milestone-recap.js';

export interface AdvanceInput {
  legacy: LegacyRunView;
  state: ExtensionSnapshotV2;
  deltaMs: number;
  events: readonly GameplayEvent[];
}

export interface AdvanceOutput {
  state: ExtensionSnapshotV2;
  effects: Effect[];
}

function contractOutcomeTelemetry(
  before: ContractRuntimeState,
  after: ContractRuntimeState,
  telemetry: ExtensionSnapshotV2['telemetry'],
): ExtensionSnapshotV2['telemetry'] {
  let next = telemetry;
  if (after.completedCount > before.completedCount) next = recordContractTelemetry(next, 'completed');
  if (after.failedCount > before.failedCount) next = recordContractTelemetry(next, 'failed');
  return next;
}

function worldCatchUp(
  legacy: LegacyRunView,
  world: ExtensionSnapshotV2['world'],
  rng: ExtensionSnapshotV2['rng'],
): { world: ExtensionSnapshotV2['world']; rng: ExtensionSnapshotV2['rng']; effects: Effect[] } {
  let nextWorld = pruneExpiredNodes(world, legacy.elapsedMs);
  let nextRng = rng;
  const effects: Effect[] = [];
  let safety = 0;

  while (shouldEvolveWorld(nextWorld, legacy.elapsedMs) && safety < 16) {
    const thresholdMs = (nextWorld.evolutionCount + 1) * 8 * 60_000;
    const evolved = evolveWorld({ ...legacy, elapsedMs: thresholdMs }, nextWorld, nextRng);
    nextWorld = evolved.state;
    nextRng = evolved.rng;
    // Nodes from evolution checkpoints that have already expired do not need to be spawned on resume.
    for (const effect of evolved.effects) {
      if (effect.type !== 'spawn_field_node' || effect.expiresAtMs > legacy.elapsedMs) effects.push(effect);
    }
    safety += 1;
  }

  nextWorld = pruneExpiredNodes(nextWorld, legacy.elapsedMs);
  return { world: nextWorld, rng: nextRng, effects };
}


function heroIdForSignature(value: string): HeroId {
  return value === 'seria' || value === 'kain' || value === 'edric' ? value : 'arkan';
}

export function advanceEndlessRuntime(input: AdvanceInput): AdvanceOutput {
  const { legacy, events } = input;
  const effects: Effect[] = [];
  let extension: ExtensionSnapshotV2 = {
    ...input.state,
    schemaVersion: 2,
    contracts: { ...input.state.contracts },
    world: { ...input.state.world, nodes: [...input.state.world.nodes] },
    nemesis: { profiles: { ...input.state.nemesis.profiles } },
    ascension: { ...input.state.ascension, mutators: [...input.state.ascension.mutators] },
    telemetry: { ...input.state.telemetry, framePressureSamples: [...input.state.telemetry.framePressureSamples] },
    heroAscension: { ...input.state.heroAscension, selected: [...input.state.heroAscension.selected], ...(input.state.heroAscension.pendingOffer ? { pendingOffer: { ...input.state.heroAscension.pendingOffer, options: [...input.state.heroAscension.pendingOffer.options] } } : {}) },
    chronicle: { milestones: [...input.state.chronicle.milestones] },
    overdrive: { ...input.state.overdrive },
    signature: { ...input.state.signature },
    oaths: { ...input.state.oaths, completedMilestones:[...input.state.oaths.completedMilestones], failedMilestones:[...input.state.oaths.failedMilestones], expiredMilestones:[...input.state.oaths.expiredMilestones], history:[...input.state.oaths.history], active:input.state.oaths.active ? {...input.state.oaths.active} : null, boon:input.state.oaths.boon ? {...input.state.oaths.boon} : null },
    frameGovernor: { ...input.state.frameGovernor },
    checkpoints: { reachedMilestones:[...input.state.checkpoints.reachedMilestones] },
    recaps: { reachedMilestones:[...input.state.recaps.reachedMilestones], lastKills:input.state.recaps.lastKills, lastBosses:input.state.recaps.lastBosses },
    rng: { ...input.state.rng },
  };

  // 1) Telemetry is aggregate-only and can safely consume every host event first.
  for (const event of events) extension.telemetry = recordTelemetryEvent(extension.telemetry, event);

  // 2) Existing combat events charge the automatic overdrive meter.
  extension.overdrive = advanceBuildOverdrive(extension.overdrive, events, legacy.elapsedMs);

  // 3) Final Form signature is automatic and consumes only existing combat events.
  const signatureForm = deriveHeroFinalForm(heroIdForSignature(legacy.heroId), extension.heroAscension.selected, legacy.elapsedMs);
  const signatureResult = advanceFinalFormSignature(extension.signature, signatureForm, events, legacy.elapsedMs);
  extension.signature = signatureResult.state;
  if (signatureResult.activated && signatureForm) {
    const profile = finalFormSignatureProfile(signatureForm);
    effects.push({ type:'final_form_signature', formId:signatureForm.id, name:profile.name, color:profile.color });
  }

  // 3) Existing contract progression, then a new offer only if the slot is free.
  const beforeContract = extension.contracts;
  const progressed = advanceContract(extension.contracts, legacy, events, Math.max(0, input.deltaMs));
  extension.contracts = progressed.state;
  effects.push(...progressed.effects);
  extension.telemetry = contractOutcomeTelemetry(beforeContract, extension.contracts, extension.telemetry);

  if (shouldOfferContract(extension.contracts, legacy.elapsedMs)) {
    const offerResult = createContractOffer(legacy, extension.contracts, extension.rng);
    extension.contracts = offerResult.state;
    extension.rng = offerResult.rng;
    effects.push({
      type: 'show_contract_offer',
      offerId: offerResult.offer.offerId,
      options: offerResult.offer.options.map((option) => ({ ...option })),
    });
  }

  // 4) World evolution catches up by deterministic 8-minute checkpoints after a long pause/resume.
  const worldResult = worldCatchUp(legacy, extension.world, extension.rng);
  extension.world = worldResult.world;
  extension.rng = worldResult.rng;
  effects.push(...worldResult.effects);

  // 5) Boss encounter summaries update persistent nemesis memory.
  for (const event of events) {
    if (event.type !== 'boss_defeated' && event.type !== 'boss_encounter_end') continue;
    const nemesisResult = recordBossEncounter(extension.nemesis, {
      bossId: event.bossId,
      durationMs: event.durationMs,
      coreDamage: event.coreDamage,
      heroDefeated: event.type === 'boss_encounter_end' ? event.heroDefeated : Boolean(event.heroDefeated),
      ...(event.affinityDamage ? { affinityDamage: event.affinityDamage } : {}),
    });
    extension.nemesis = nemesisResult.state;
    effects.push(...nemesisResult.effects);
  }

  // 6) Hero ascension reuses the existing three-card modal at long-run milestones.
  const heroId: HeroId = heroIdForSignature(legacy.heroId);
  const heroAscensionResult = advanceHeroAscension(heroId, legacy.elapsedMs, extension.heroAscension);
  extension.heroAscension = heroAscensionResult.state;
  if (heroAscensionResult.offered && extension.heroAscension.pendingOffer) effects.push({ type: 'show_hero_ascension_offer', milestone: extension.heroAscension.pendingOffer.milestone });

  // 7) Chronicle recognition is catch-up safe and gives each long-run milestone once.
  const chronicleResult = advanceChronicle(legacy.elapsedMs, extension.chronicle);
  extension.chronicle = chronicleResult.state;
  for (const milestone of chronicleResult.unlocked) effects.push({ type: 'chronicle_milestone', minute: milestone.minute, title: milestone.title, rewardGold: milestone.rewardGold, coreHealPercent: milestone.coreHealPercent });

  // 8) Long-run Oaths add one automatic objective slot after two hours.
  const oathResult = advanceLongRunOaths(extension.oaths, legacy, events, Math.max(0,input.deltaMs), extension.rng.seed);
  extension.oaths = oathResult.state;
  effects.push(...oathResult.effects);

  // 9) Long-run checkpoint receipts are catch-up safe and never pause the run.
  const checkpointResult = advanceRunCheckpoints(extension.checkpoints, legacy.elapsedMs);
  extension.checkpoints = checkpointResult.state;
  if (checkpointResult.reached) effects.push({ type:'run_checkpoint', minute:checkpointResult.reached.minute, title:checkpointResult.reached.title });

  // 10) Long-run recap uses aggregate counters only and collapses catch-up into one receipt.
  const recapResult = advanceRunMilestoneRecap(extension.recaps, legacy);
  extension.recaps = recapResult.state;
  if (recapResult.reached) effects.push({ type:'run_milestone_recap', ...recapResult.reached });

  // 11) Endless ascension runs last so all systems observe the pre-tier event state for this frame.
  const ascensionResult = advanceAscension(legacy.elapsedMs, extension.ascension, extension.rng);
  extension.ascension = ascensionResult.state;
  extension.rng = ascensionResult.rng;
  effects.push(...ascensionResult.effects);

  return { state: extension, effects };
}

export const createDefaultEndlessState = createDefaultExtensionState;
