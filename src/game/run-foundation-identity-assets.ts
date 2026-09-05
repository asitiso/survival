import { DECISION_PATH_ICON_ATLAS, decisionPathIconSprite } from './decision-path-icon-assets.js';
import { BUILD_IDENTITY_ATLAS, buildIdentityIcon } from './build-identity-assets.js';
import { DEEP_RUN_ASCENSION_IDS, DEEP_RUN_DECISION_ATLAS, deepRunDecisionIdentityIcon } from './deep-run-decision-identity-assets.js';
import type { RunTraitId } from './run-traits.js';
import type { RelicId } from './relics.js';
import type { HeroAscensionId } from './endless/hero-ascension.js';

export const RUN_FOUNDATION_TRAIT_IDS: readonly RunTraitId[]=['destruction','rapidCasting','goldSense','guardianOath','infernalPact','glacialFocus','stormPursuit','bastionVow'] as const;
export const RUN_FOUNDATION_RELIC_IDS: readonly RelicId[]=['abyss-eye','chrono-shard','guardian-heart','ember-crown','winter-heart','storm-core','oath-seal','inferno-heart','summoner-sigil','juggernaut-core','phoenix-brand','zero-crystal','storm-crown','citadel-sigil'] as const;
export const RUN_FOUNDATION_ASCENSION_IDS: readonly HeroAscensionId[]=[...DEEP_RUN_ASCENSION_IDS];

export interface RunFoundationIdentity {
  id:string; atlasSrc:string; sx:number; sy:number; sw:number; sh:number;
  animated:false; motionAmplitude:0; textFallbackPreserved:true; loadFailureBlocksGameplay:false;
  persistentRecallSupported?:true; acquisitionToastSupported?:true; selectionToastSupported?:true;
}

export function runTraitIdentity(id:RunTraitId):RunFoundationIdentity{
  const sprite=decisionPathIconSprite(id); if(!sprite) throw new Error(`Unknown run trait identity: ${id}`);
  return {id,atlasSrc:DECISION_PATH_ICON_ATLAS.src,...sprite,animated:false,motionAmplitude:0,textFallbackPreserved:true,loadFailureBlocksGameplay:false,persistentRecallSupported:true};
}
export function relicAcquisitionIdentity(id:RelicId):RunFoundationIdentity{
  const icon=buildIdentityIcon(id);
  return {id,atlasSrc:BUILD_IDENTITY_ATLAS.src,sx:icon.sx,sy:icon.sy,sw:icon.sw,sh:icon.sh,animated:false,motionAmplitude:0,textFallbackPreserved:true,loadFailureBlocksGameplay:false,acquisitionToastSupported:true};
}
export function ascensionSelectionIdentity(id:HeroAscensionId):RunFoundationIdentity{
  const icon=deepRunDecisionIdentityIcon({kind:'ascension',id});
  return {id,atlasSrc:DEEP_RUN_DECISION_ATLAS.src,sx:icon.sx,sy:icon.sy,sw:icon.sw,sh:icon.sh,animated:false,motionAmplitude:0,textFallbackPreserved:true,loadFailureBlocksGameplay:false,selectionToastSupported:true};
}
