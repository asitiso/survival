import { consumeRenderedAttackOutcome, consumeRenderedAttackOutcomeNear, type AttackOutcomeMetadata, type AttackOutcomeOrigin, type AttackOutcomeSource } from './attack-outcome-linkage.js';

export interface CoreAttackAttribution {
  attackIntent: AttackOutcomeMetadata;
  label: string;
}

function coreAttackerLabel(intent: AttackOutcomeMetadata): string | null {
  if (intent.enemyType === 'boss') return '보스 → 핵';
  if (intent.enemyType === 'bomber') return '폭탄병 → 핵';
  return null;
}

export function consumeCoreAttackAttribution(source: AttackOutcomeSource, origin?: AttackOutcomeOrigin): CoreAttackAttribution | null {
  const attackIntent = origin
    ? consumeRenderedAttackOutcomeNear('core', source, origin)
    : consumeRenderedAttackOutcome('core', source);
  if (!attackIntent) return null;
  const label = coreAttackerLabel(attackIntent);
  return label ? { attackIntent, label } : null;
}
