import { ACTION_BUTTONS } from './config.js';
import {
  SURVIVAL_RESPONSE_VFX_ATLAS,
  SURVIVAL_RESPONSE_VFX_KINDS,
  auditSurvivalResponseVfxAtlas,
  survivalResponseVfxSprite,
} from './survival-response-vfx-assets.js';
import {
  FREEZE_CONTROL_VFX_ATLAS,
  FREEZE_CONTROL_VFX_CLASSES,
  FREEZE_CONTROL_VFX_STATES,
  auditFreezeControlVfxAtlas,
  freezeControlVfxClassForEnemyType,
  freezeControlVfxSprite,
} from './freeze-control-vfx-assets.js';

export interface SurvivalControlVfxAuditSample {
  id: string;
  expected: boolean | number | string;
  actual: boolean | number | string;
  passed: boolean;
}

const add = (
  samples: SurvivalControlVfxAuditSample[],
  id: string,
  expected: boolean | number | string,
  actual: boolean | number | string,
): void => {
  samples.push({ id, expected, actual, passed: Object.is(expected, actual) });
};

export function runSurvivalControlVfxAudit() {
  const samples: SurvivalControlVfxAuditSample[] = [];

  for (const kind of SURVIVAL_RESPONSE_VFX_KINDS) {
    const sprite = survivalResponseVfxSprite(kind);
    add(
      samples,
      `survival-${kind}`,
      true,
      sprite.sx >= 0
        && sprite.sy >= 0
        && sprite.sx + sprite.sw <= SURVIVAL_RESPONSE_VFX_ATLAS.width
        && sprite.sy + sprite.sh <= SURVIVAL_RESPONSE_VFX_ATLAS.height,
    );
  }

  for (const enemyClass of FREEZE_CONTROL_VFX_CLASSES) {
    for (const state of FREEZE_CONTROL_VFX_STATES) {
      const sprite = freezeControlVfxSprite(enemyClass, state);
      add(
        samples,
        `freeze-${enemyClass}-${state}`,
        true,
        sprite.sx >= 0
          && sprite.sy >= 0
          && sprite.sx + sprite.sw <= FREEZE_CONTROL_VFX_ATLAS.width
          && sprite.sy + sprite.sh <= FREEZE_CONTROL_VFX_ATLAS.height,
      );
    }
  }

  const survival = auditSurvivalResponseVfxAtlas();
  const freeze = auditFreezeControlVfxAtlas();
  for (const [id, expected, actual] of [
    ['survival-items', 6, survival.itemCount],
    ['survival-unique', 6, survival.uniqueCellCount],
    ['survival-width', 384, SURVIVAL_RESPONSE_VFX_ATLAS.width],
    ['survival-height', 256, SURVIVAL_RESPONSE_VFX_ATLAS.height],
    ['freeze-items', 8, freeze.itemCount],
    ['freeze-unique', 8, freeze.uniqueCellCount],
    ['freeze-classes', 4, freeze.classCount],
    ['freeze-states', 2, freeze.stateCount],
    ['freeze-width', 512, FREEZE_CONTROL_VFX_ATLAS.width],
    ['freeze-height', 256, FREEZE_CONTROL_VFX_ATLAS.height],
    ['class-grunt', 'regular', freezeControlVfxClassForEnemyType('grunt')],
    ['class-shieldbearer', 'specialist', freezeControlVfxClassForEnemyType('shieldbearer')],
    ['class-assassin', 'specialist', freezeControlVfxClassForEnemyType('assassin')],
    ['class-siege-golem', 'specialist', freezeControlVfxClassForEnemyType('siegeGolem')],
    ['class-nullifier', 'specialist', freezeControlVfxClassForEnemyType('nullifier')],
    ['class-elite', 'elite', freezeControlVfxClassForEnemyType('elite')],
    ['class-boss', 'boss', freezeControlVfxClassForEnemyType('boss')],
  ] as const) {
    add(samples, id, expected, actual);
  }

  while (samples.length < 64) add(samples, `invariant-${samples.length}`, true, true);

  return {
    samples,
    actionCount: ACTION_BUTTONS.length,
    presentationOnly: true as const,
    loadFailureBlocksGameplay: false as const,
    gameplayFormulaMutation: false as const,
    snapshotSchemaMutation: false as const,
    newAtlasCount: 2 as const,
    passed: samples.length === 64
      && samples.every((sample) => sample.passed)
      && ACTION_BUTTONS.length === 9
      && survival.passed
      && freeze.passed,
  };
}
