import test from 'node:test';
import assert from 'node:assert/strict';
import { SoundScheduler, defaultAudioSettings, sanitizeAudioSettings, soundDescriptor } from '../dist/game/audio.js';

test('audio settings stay compact and sanitize volume', () => {
  assert.deepEqual(defaultAudioSettings(), { enabled: true, volume: 0.65 });
  assert.deepEqual(sanitizeAudioSettings({ enabled: false, volume: 9 }), { enabled: false, volume: 1 });
});

test('spell spam is throttled per sound family', () => {
  const scheduler = new SoundScheduler();
  assert.equal(scheduler.trySchedule('fire', 1), true);
  assert.equal(scheduler.trySchedule('fire', 1.01), false);
  assert.equal(scheduler.trySchedule('fire', 1.12), true);
});

test('voice count stays bounded while critical boss cues can preempt decorative sounds', () => {
  const scheduler = new SoundScheduler(4);
  for (const kind of ['fire','ice','lightning','holy']) assert.equal(scheduler.trySchedule(kind, 1), true);
  assert.equal(scheduler.activeVoices, 4);
  assert.equal(scheduler.trySchedule('coin', 1.01), false);
  assert.equal(scheduler.trySchedule('bossPhase', 1.01), true);
  assert.ok(scheduler.activeVoices <= 4);
});

test('major events have longer distinct descriptors than rapid spell ticks', () => {
  assert.ok(soundDescriptor('ultimate').duration > soundDescriptor('fire').duration);
  assert.ok(soundDescriptor('bossPhase').priority > soundDescriptor('coin').priority);
  assert.notEqual(soundDescriptor('ice').frequency, soundDescriptor('lightning').frequency);
});
