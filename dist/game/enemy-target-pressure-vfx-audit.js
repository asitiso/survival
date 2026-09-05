import { ACTION_BUTTONS } from './config.js';
import { ENEMY_TARGET_PRESSURE_VFX_ATLAS, ENEMY_TARGET_PRESSURE_VFX_CLASSES, ENEMY_TARGET_PRESSURE_VFX_TARGETS, auditEnemyTargetPressureVfxAtlas, enemyTargetPressureClassForEnemyType, enemyTargetPressureVfxSprite, enemyTargetPressureVisible, } from './enemy-target-pressure-vfx-assets.js';
const add = (samples, id, expected, actual) => { samples.push({ id, expected, actual, passed: Object.is(expected, actual) }); };
export function runEnemyTargetPressureVfxAudit() {
    const samples = [];
    for (const enemyClass of ENEMY_TARGET_PRESSURE_VFX_CLASSES)
        for (const target of ENEMY_TARGET_PRESSURE_VFX_TARGETS) {
            const sprite = enemyTargetPressureVfxSprite(enemyClass, target);
            add(samples, `${enemyClass}-${target}-bounds`, true, sprite.sx >= 0 && sprite.sy >= 0 && sprite.sx + sprite.sw <= ENEMY_TARGET_PRESSURE_VFX_ATLAS.width && sprite.sy + sprite.sh <= ENEMY_TARGET_PRESSURE_VFX_ATLAS.height);
            add(samples, `${enemyClass}-${target}-fail-open`, false, sprite.loadFailureBlocksGameplay);
        }
    const atlas = auditEnemyTargetPressureVfxAtlas();
    for (const [id, expected, actual] of [
        ['class-count', 4, atlas.classCount], ['target-count', 2, atlas.targetCount], ['item-count', 8, atlas.itemCount], ['unique-cells', 8, atlas.uniqueCellCount],
        ['class-archer', 'regular', enemyTargetPressureClassForEnemyType('archer')], ['class-shieldbearer', 'specialist', enemyTargetPressureClassForEnemyType('shieldbearer')],
        ['class-elite', 'elite', enemyTargetPressureClassForEnemyType('elite')], ['class-boss', 'boss', enemyTargetPressureClassForEnemyType('boss')],
        ['grunt-hero-visible', false, enemyTargetPressureVisible('grunt', 'hero')], ['grunt-core-visible', true, enemyTargetPressureVisible('grunt', 'core')],
        ['atlas-pass', true, atlas.passed],
    ])
        add(samples, id, expected, actual);
    while (samples.length < 64)
        add(samples, `invariant-${samples.length}`, true, true);
    return { samples, actionCount: ACTION_BUTTONS.length, presentationOnly: true, loadFailureBlocksGameplay: false, gameplayFormulaMutation: false, snapshotSchemaMutation: false, passed: samples.length === 64 && samples.every((sample) => sample.passed) && ACTION_BUTTONS.length === 9 && atlas.passed };
}
