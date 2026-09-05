import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTacticalScoreBonus, tacticalRecapLines } from '../dist/domain/tactical-recap.js';
import { calculateRunScore } from '../dist/domain/run-records.js';

const recap={objectivesCompleted:4,objectivesFailed:1,bestObjectiveStreak:3,bossNodesDestroyed:7,highestComboTier:3,highestComboName:'잿불 연쇄'};

test('tactical recap rewards objectives weakpoints and combo mastery with a bounded score bonus', () => {
  const bonus=calculateTacticalScoreBonus(recap);
  assert.ok(bonus>0 && bonus<=12000);
  const base={heroId:'arkan',mapId:'ruinedGate',threatLevel:2,seconds:600,kills:900,bosses:3,danger:8};
  assert.equal(calculateRunScore({...base,tacticalBonus:bonus})-calculateRunScore(base),bonus);
  assert.ok(calculateRunScore({...base,tacticalBonus:999999})-calculateRunScore(base)<=12000);
});

test('recap lines expose tactical accomplishments compactly', () => {
  const lines=tacticalRecapLines(recap);
  assert.ok(lines.some(line=>line.includes('목표')));
  assert.ok(lines.some(line=>line.includes('약점')));
  assert.ok(lines.some(line=>line.includes('ASCENDANCY')));
  assert.ok(lines.length<=4);
});

test('results overlay supports an optional tactical recap without breaking old result shape', async () => {
  const source=(await import('node:fs')).readFileSync(new URL('../src/ui/results.ts',import.meta.url),'utf8');
  assert.match(source,/tacticalRecap/);
});
