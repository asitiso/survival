import test from 'node:test';
import assert from 'node:assert/strict';
import { decodeBuildCapsule, encodeBuildCapsule, sanitizeBuildCapsulePayload } from '../dist/domain/build-capsule.js';
import { defaultRunRecords, recordRun, loadRunRecords, saveRunRecords } from '../dist/domain/run-records.js';

const payload={
  version:1, heroId:'arkan', traitId:'destruction', threatLevel:5, mapId:'ruinedGate', seed:123456789,
  finalForm:'solar-sovereign', ascensions:['wildfire-doctrine','solar-collapse','cinder-heart'], fateChoices:['frenzy','golden','guardian'],
  relic:'ember-crown', fusions:['solar-detonation','storm-crucible'], archetype:'burst',
  spellLevels:{fireBolt:10,chainLightning:9,frostNova:8,flameField:10,meteorStorm:6,blackHole:5},
};

test('build capsule encodes deterministically and decodes the exact bounded build identity',()=>{
  const a=encodeBuildCapsule(payload), b=encodeBuildCapsule(structuredClone(payload));
  assert.equal(a,b); assert.match(a,/^BLD1\./); assert.ok(a.length<140);
  assert.deepEqual(decodeBuildCapsule(a),sanitizeBuildCapsulePayload(payload));
});

test('build capsule rejects checksum tampering and sanitizes invalid optional build pieces',()=>{
  const code=encodeBuildCapsule(payload);
  const last=code.at(-1); const tampered=code.slice(0,-1)+(last==='A'?'B':'A');
  assert.equal(decodeBuildCapsule(tampered),null);
  const dirty={...payload,threatLevel:99,seed:-4,finalForm:'not-a-form',relic:'not-a-relic',fusions:['solar-detonation','bad','storm-crucible','extra'],spellLevels:{fireBolt:99}};
  const safe=sanitizeBuildCapsulePayload(dirty);
  assert.equal(safe.threatLevel,5); assert.equal(safe.seed,0); assert.equal(safe.finalForm,null); assert.equal(safe.relic,null); assert.equal(safe.fusions.length,2); assert.equal(safe.spellLevels.fireBolt,10); assert.equal(safe.spellLevels.blackHole,1);
});

test('run records retain a valid build capsule while ignoring malformed persisted capsule strings',()=>{
  const code=encodeBuildCapsule(payload);
  const recorded=recordRun(defaultRunRecords(),{heroId:'arkan',mapId:'ruinedGate',threatLevel:5,seconds:5000,kills:2000,bosses:20,danger:9,buildCapsule:code});
  assert.equal(recorded.summary.buildCapsule,code);
  const map=new Map(); const storage={getItem:(k)=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:(k)=>map.delete(k)};
  saveRunRecords(storage,recorded.state);
  const loaded=loadRunRecords(storage);
  assert.equal(loaded.recent[0].buildCapsule,code);
  const raw=JSON.parse(map.get('arcane-last-stand.run-records')); raw.recent[0].buildCapsule='garbage'; map.set('arcane-last-stand.run-records',JSON.stringify(raw));
  assert.equal(loadRunRecords(storage).recent[0].buildCapsule,undefined);
});
