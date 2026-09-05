const BOON_BY_OATH = { slayer: 'power', elite_hunt: 'prosperity', boss_hunt: 'boss', arcane_flow: 'power', core_guard: 'guard', endure: 'guard' };
export function oathRequirementBoonIdentity(kind) { return { requirementId: kind, boonId: BOON_BY_OATH[kind] }; }
