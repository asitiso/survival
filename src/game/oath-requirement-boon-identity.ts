import type { LongRunOathBoonKind, LongRunOathKind } from './endless/long-run-oaths.js';
import type { OathRequirementIdentityId } from './oath-requirement-identity-assets.js';
import type { OathBoonOutcomeIdentityId } from './oath-boon-outcome-identity-assets.js';

export interface OathRequirementBoonIdentity{requirementId:OathRequirementIdentityId;boonId:OathBoonOutcomeIdentityId;}
const BOON_BY_OATH:Readonly<Record<LongRunOathKind,LongRunOathBoonKind>>={slayer:'power',elite_hunt:'prosperity',boss_hunt:'boss',arcane_flow:'power',core_guard:'guard',endure:'guard'};
export function oathRequirementBoonIdentity(kind:LongRunOathKind):OathRequirementBoonIdentity{return{requirementId:kind,boonId:BOON_BY_OATH[kind]};}
