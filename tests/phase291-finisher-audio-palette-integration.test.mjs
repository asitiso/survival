import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const audio=fs.readFileSync(new URL('../src/game/audio.ts',import.meta.url),'utf8');

test('game layers twelve-form palette and sound variation over existing finisher combat family',()=>{
  assert.match(game,/finalFormAudioPalette/);
  assert.match(game,/const finisherPalette = finalFormId \? finalFormAudioPalette\(finalFormId\) : null/);
  assert.match(game,/primaryAccent = finisherPalette\?\.primary \?\? finisher\.accent/);
  assert.match(game,/this\.audio\.play\(finisherFeedback\.soundKind, undefined, finisherPalette\?\.audio\)/);
});

test('audio variation changes oscillator descriptor only and leaves scheduler call on the base sound kind',()=>{
  assert.match(audio,/soundDescriptorWithVariation/);
  assert.match(audio,/this\.scheduler\.trySchedule\(kind, now\)/);
  assert.match(audio,/soundDescriptorWithVariation\(kind, variation\)/);
});
