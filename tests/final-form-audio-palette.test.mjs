import test from 'node:test';
import assert from 'node:assert/strict';
import { finalFormAudioPalette } from '../dist/game/endless/final-form-audio-palette.js';
import { soundDescriptor, soundDescriptorWithVariation, ArcaneAudio } from '../dist/game/audio.js';

const forms=['solar-sovereign','phoenix-lord','volcanic-archon','absolute-empress','winter-warden','crystal-oracle','thunder-tyrant','tempest-runner','storm-oracle','radiant-king','oath-guardian','light-pilgrim'];

test('all twelve final forms have deterministic unique palette identities',()=>{
  const profiles=forms.map((id)=>finalFormAudioPalette(id));
  assert.equal(new Set(profiles.map((p)=>p.paletteId)).size,12);
  assert.equal(new Set(profiles.map((p)=>`${p.primary}:${p.secondary}`)).size,12);
  assert.deepEqual(profiles,forms.map((id)=>finalFormAudioPalette(id)));
});

test('final form sound variation stays inside presentation-only bounds',()=>{
  for(const id of forms){
    const v=finalFormAudioPalette(id).audio;
    assert.ok(v.frequencyMultiplier>=.88&&v.frequencyMultiplier<=1.16);
    assert.ok(v.durationMultiplier>=.9&&v.durationMultiplier<=1.18);
    assert.ok(v.gainMultiplier>=.9&&v.gainMultiplier<=1.12);
  }
});

test('audio descriptor variation is bounded without mutating the base descriptor',()=>{
  const base=soundDescriptor('finisherExecution');
  const varied=soundDescriptorWithVariation('finisherExecution',{frequencyMultiplier:99,durationMultiplier:.01,gainMultiplier:5});
  assert.equal(soundDescriptor('finisherExecution'),base);
  assert.ok(varied.frequency<=base.frequency*1.2);
  assert.ok(varied.duration>=base.duration*.85);
  assert.ok(varied.gain<=base.gain*1.15);
});

test('existing ArcaneAudio two-argument play calls remain source compatible',()=>{
  const audio=new ArcaneAudio({enabled:true,volume:.5});
  assert.equal(audio.play('fire',0),true);
});
