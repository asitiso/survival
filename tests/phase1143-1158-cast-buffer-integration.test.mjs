import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const block=(start,end)=>{const a=game.indexOf(start);const b=game.indexOf(end,a+start.length);return a>=0?game.slice(a,b>=0?b:undefined):'';};

test('phase 1149 game owns one cast intent buffer for the frozen six combat actions',()=>{
  assert.match(game,/CastIntentBuffer/);
  assert.match(game,/COMBAT_CAST_ACTIONS/);
  assert.match(game,/castIntentBuffer\s*=\s*new CastIntentBuffer/);
});

test('phase 1150-1152 discrete manual presses are routed through one near-ready helper',()=>{
  const update=block('private update(dt: number)','private updateLongRunRewardRate');
  assert.match(update,/for \(const action of COMBAT_CAST_ACTIONS\)/);
  assert.match(update,/input\.consumePressed\(action\)/);
  assert.match(update,/handleManualCastPress\(action, spellWorld\)/);
  const helper=block('private handleManualCastPress','private flushBufferedManualCasts');
  assert.match(helper,/spells\.cooldownRemaining\(action\)/);
  assert.match(helper,/castIntentBuffer\.request\(action/);
  assert.match(helper,/autoAim:\s*false/);
});

test('phase 1153 queued manual intent flushes before normal hold or AUTO casting',()=>{
  const update=block('private update(dt: number)','private updateLongRunRewardRate');
  const flush=update.indexOf('this.flushBufferedManualCasts(spellWorld)');
  const pressed=update.indexOf('this.handleManualCastPress(action, spellWorld)');
  const auto=update.indexOf('openingAutoCastIntent(this.autoCastNormal, held)');
  assert.ok(flush>=0,'buffer flush should exist');
  assert.ok(pressed>flush,'fresh manual press should run after old queued manual intents');
  assert.ok(auto>pressed,'AUTO/hold loop must run after manual intents');
});

test('phase 1154-1156 buffered flush is exactly-once per action and casts manually',()=>{
  const helper=block('private flushBufferedManualCasts','private handleSuccessfulCast');
  assert.match(helper,/for \(const action of COMBAT_CAST_ACTIONS\)/);
  assert.match(helper,/castIntentBuffer\.consumeIfReady\(action, this\.spells\.cooldownRemaining\(action\)\)/);
  assert.match(helper,/spells\.tryCast\(action, \{ \.\.\.spellWorld, autoAim:false \}\)/);
  assert.match(helper,/handleSuccessfulCast\(action, ['"]manual['"]\)/);
});

test('phase 1157-1158 cooldown advancement order stays after cast arbitration',()=>{
  const update=block('private update(dt: number)','private updateLongRunRewardRate');
  const arbitration=update.indexOf('this.flushBufferedManualCasts(spellWorld)');
  const cooldownAdvance=update.indexOf('this.spells.update(dt, spellWorld)');
  assert.ok(arbitration>=0 && cooldownAdvance>arbitration);
  assert.equal((update.match(/this\.spells\.update\(dt, spellWorld\)/g)??[]).length,1);
});
