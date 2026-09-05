import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('../src/game/game.ts', import.meta.url), 'utf8');
const block = (start, end) => source.slice(source.indexOf(start), source.indexOf(end, source.indexOf(start) + start.length));

test('phase 1607-1614 game queues critical and boss haptic intents and flushes one frame decision', () => {
  assert.match(source, /CombatHapticArbiter/);
  const critical = block('private updateCriticalFeedback(): void', 'private flushCombatHaptics');
  assert.match(critical, /hapticArbiter\.queue\('heroCritical'\)/);
  assert.match(critical, /hapticArbiter\.queue\('coreCritical'\)/);
  assert.match(critical, /hapticArbiter\.queue\('bossCountdown'\)/);
  assert.doesNotMatch(critical, /this\.vibrate\(/);

  const boss = block('private updateBossPresentation(): void', 'private updateMapEnvironmentVfx');
  assert.match(boss, /hapticArbiter\.queue\(cue\.phase === 3 \? 'bossPhase3' : 'bossPhase'\)/);
  assert.doesNotMatch(boss, /this\.vibrate\(/);

  assert.match(source, /private flushCombatHaptics\(\): void/);
  const update = block('private update(dt: number): void', 'private updateLongRunRewardRate');
  assert.match(update, /this\.flushCombatHaptics\(\);/);
});

test('phase 1607-1614 lifecycle and new-run boundaries discard pending haptic intents', () => {
  const resetTransient = block('resetTransientDecisionInput(): void', 'setVisibilityPaused');
  assert.match(resetTransient, /hapticArbiter\.clear\(\)/);
  const resetRun = block('private resetRun(', 'private update(dt: number): void');
  assert.match(resetRun, /hapticArbiter\.clear\(\)/);
  const pause = block('toggleManualPause(): boolean', 'get manuallyPaused');
  assert.match(pause, /hapticArbiter\.clear\(\)/);
});
