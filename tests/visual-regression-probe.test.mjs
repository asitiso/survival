import test from 'node:test';
import assert from 'node:assert/strict';
import { visualRegressionProbe, visualProbeSignature } from '../dist/game/visual-regression-probe.js';

test('visual probe is deterministic and covers key landscape combat states',()=>{
  const a=visualRegressionProbe(2400,1080);
  const b=visualRegressionProbe(2400,1080);
  assert.deepEqual(a,b);
  assert.equal(a.actionCount,9);
  assert.deepEqual(a.states.map((x)=>x.id),['opening','boss','mythic','final-flow','long-run']);
  assert.equal(visualProbeSignature(a),visualProbeSignature(b));
});
