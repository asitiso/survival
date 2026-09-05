import test from 'node:test';
import assert from 'node:assert/strict';

const mod=await import('../dist/game/cast-intent-buffer.js').catch(()=>({}));
const { CAST_INTENT_BUFFER_WINDOW_SECONDS, COMBAT_CAST_ACTIONS, CastIntentBuffer }=mod;

test('phase 1143 early tap buffer window is exactly 0.20 seconds for six cast actions',()=>{
  assert.equal(CAST_INTENT_BUFFER_WINDOW_SECONDS,0.20);
  assert.deepEqual(COMBAT_CAST_ACTIONS,['spell1','spell2','spell3','spell4','ultimate1','ultimate2']);
});

test('phase 1144 near-ready manual tap queues but farther tap is rejected',()=>{
  assert.equal(typeof CastIntentBuffer,'function');
  if(typeof CastIntentBuffer!=='function') return;
  const buffer=new CastIntentBuffer();
  assert.equal(buffer.request('spell1',0.20),'queued');
  assert.equal(buffer.isQueued('spell1'),true);
  assert.equal(buffer.request('spell2',0.200001),'rejected');
  assert.equal(buffer.isQueued('spell2'),false);
});

test('phase 1145 ready tap stays immediate and never creates a queue entry',()=>{
  const buffer=new CastIntentBuffer();
  assert.equal(buffer.request('ultimate1',0),'ready');
  assert.equal(buffer.isQueued('ultimate1'),false);
});

test('phase 1146 duplicate early taps coalesce to one queued intent',()=>{
  const buffer=new CastIntentBuffer();
  assert.equal(buffer.request('spell3',0.15),'queued');
  assert.equal(buffer.request('spell3',0.10),'queued');
  assert.equal(buffer.size,1);
});

test('phase 1147 queued intent consumes exactly once when ready',()=>{
  const buffer=new CastIntentBuffer();
  buffer.request('ultimate2',0.12);
  assert.equal(buffer.consumeIfReady('ultimate2',0.01),false);
  assert.equal(buffer.isQueued('ultimate2'),true);
  assert.equal(buffer.consumeIfReady('ultimate2',0),true);
  assert.equal(buffer.consumeIfReady('ultimate2',0),false);
  assert.equal(buffer.isQueued('ultimate2'),false);
});

test('phase 1148 transient clear removes all queued cast intents',()=>{
  const buffer=new CastIntentBuffer();
  buffer.request('spell1',0.1);
  buffer.request('ultimate1',0.1);
  buffer.clear();
  assert.equal(buffer.size,0);
  assert.equal(buffer.isQueued('spell1'),false);
  assert.equal(buffer.isQueued('ultimate1'),false);
});
