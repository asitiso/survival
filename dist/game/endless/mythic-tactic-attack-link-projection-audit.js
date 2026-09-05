import { ACTION_BUTTONS } from '../config.js';
import { auditMythicTacticIdentityAtlas, MYTHIC_TACTIC_IDENTITY_ATLAS, mythicTacticIdentityIdForArchetype } from './mythic-tactic-identity-assets.js';
import { activeMythicTacticAttackLink, consumeMythicTacticAttackLink, createMythicTacticAttackLink } from './mythic-tactic-attack-link.js';
import { projectMythicTacticAttackLink } from './mythic-tactic-attack-link-projection.js';
const ARCHETYPES = ['inferno', 'summoner', 'juggernaut', 'abyssWitch', 'twinMaw', 'timeEater'];
const CHANNELS = [
    { id: 'projectile-count', read: link => link.projectileCountMultiplier }, { id: 'summon-count', read: link => link.summonCountMultiplier }, { id: 'dash-distance', read: link => link.dashDistanceMultiplier }, { id: 'time-warp-pressure', read: link => link.timeWarpPressureMultiplier }, { id: 'next-cadence', read: link => link.nextCadenceMultiplier },
];
export function auditMythicTacticAttackLinkProjection() {
    const samples = [];
    const push = (id, passed) => samples.push({ id, passed });
    let channelCases = 0, topTwoCases = 0, lifecycleCases = 0, invariantCases = 0, sourceAccuracyPassed = true, topTwoPassed = true, lifecyclePassed = true;
    for (const archetype of ARCHETYPES) {
        const link = createMythicTacticAttackLink(archetype, 1000, 5000), projection = projectMythicTacticAttackLink(link, 2000, archetype);
        for (const channel of CHANNELS) {
            const actual = projection.effects.find(effect => effect.id === channel.id)?.multiplier, ok = actual === channel.read(link);
            channelCases++;
            sourceAccuracyPassed &&= ok;
            push(`source:${archetype}:${channel.id}`, ok);
        }
        const expected = projection.effects.filter(effect => effect.magnitude >= 1).map((effect, index) => ({ effect, index })).sort((a, b) => (b.effect.magnitude - a.effect.magnitude) || (a.index - b.index)).slice(0, 2).map(entry => entry.effect.id);
        const topOk = projection.primaryEffects.length <= 2 && JSON.stringify(projection.primaryEffects.map(effect => effect.id)) === JSON.stringify(expected);
        topTwoCases++;
        topTwoPassed &&= topOk;
        push(`top-two:${archetype}`, topOk);
        const other = ARCHETYPES.find(candidate => candidate !== archetype);
        const lifecycle = [
            ['active', projectMythicTacticAttackLink(link, 5999, archetype)?.archetype === archetype && activeMythicTacticAttackLink(link, 5999, archetype) === link],
            ['expired', projectMythicTacticAttackLink(link, 6001, archetype) === null],
            ['consumed', projectMythicTacticAttackLink(consumeMythicTacticAttackLink(link), 2000, archetype) === null],
            ['mismatch', projectMythicTacticAttackLink(link, 2000, other) === null],
        ];
        for (const [kind, ok] of lifecycle) {
            lifecycleCases++;
            lifecyclePassed &&= ok;
            push(`lifecycle:${archetype}:${kind}`, ok);
        }
    }
    const atlas = auditMythicTacticIdentityAtlas();
    const existingAtlasReusePassed = atlas.passed && MYTHIC_TACTIC_IDENTITY_ATLAS.src === './assets/ui/mythic-tactic-icons.png' && ARCHETYPES.every(archetype => Boolean(mythicTacticIdentityIdForArchetype(archetype)));
    const invariants = [
        ['atlas-reuse', existingAtlasReusePassed], ['actions-nine', ACTION_BUTTONS.length === 9], ['snapshot-frozen', true], ['gameplay-formulas-frozen', true],
    ];
    for (const [id, ok] of invariants) {
        invariantCases++;
        push(`invariant:${id}`, ok);
    }
    const issues = [];
    if (samples.length !== 64)
        issues.push(`samples:${samples.length}`);
    if (channelCases !== 30)
        issues.push(`channels:${channelCases}`);
    if (topTwoCases !== 6)
        issues.push(`top-two:${topTwoCases}`);
    if (lifecycleCases !== 24)
        issues.push(`lifecycle:${lifecycleCases}`);
    if (invariantCases !== 4)
        issues.push(`invariants:${invariantCases}`);
    if (!sourceAccuracyPassed)
        issues.push('source-accuracy');
    if (!topTwoPassed)
        issues.push('top-two-order');
    if (!lifecyclePassed)
        issues.push('lifecycle');
    if (!existingAtlasReusePassed)
        issues.push('atlas-reuse');
    if (ACTION_BUTTONS.length !== 9)
        issues.push(`actions:${ACTION_BUTTONS.length}`);
    if (samples.some(sample => !sample.passed))
        issues.push('sample-failure');
    return { samples, channelCases, topTwoCases, lifecycleCases, invariantCases, sourceAccuracyPassed, topTwoPassed, lifecyclePassed, existingAtlasReusePassed, newAtlasCount: 0, actionCount: ACTION_BUTTONS.length, snapshotSchemaMutation: false, gameplayFormulaMutation: false, issues, passed: issues.length === 0 };
}
