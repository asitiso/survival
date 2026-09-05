import test from 'node:test';
import assert from 'node:assert/strict';
import { safeTelegraphTimeline } from '../dist/game/endless/safe-telegraph-timeline.js';
import fs from 'node:fs';

const forecast={label:'SAFE FORECAST',phase:'collapse',currentTarget:{x:500,y:450},nextTarget:{x:650,y:450},urgency:.72,transitionMs:900,autoMove:false};
const hazard=(telegraph,pos={x:500,y:450},shape=undefined)=>({id:1,kind:'firePool',pos,radius:80,telegraph,ttl:5,damage:20,...(shape?{geometryShape:shape,angle:0,length:240}:{})});

test('timeline chooses the earlier of safe transition and threatening hazard activation',()=>{
  const t=safeTelegraphTimeline(forecast,[hazard(.42)],18);
  assert.equal(t?.hazardActivationMs,420);
  assert.equal(t?.decisionWindowMs,420);
  assert.equal(t?.stage,'move');
  assert.equal(t?.autoMove,false);
});

test('timeline ignores telegraphs that cannot threaten current or next safe target',()=>{
  const t=safeTelegraphTimeline(forecast,[hazard(.25,{x:1200,y:700})],18);
  assert.equal(t?.hazardActivationMs,null);
  assert.equal(t?.decisionWindowMs,900);
});

test('timeline escalates to critical under a very short decision window',()=>{
  const t=safeTelegraphTimeline({...forecast,transitionMs:180},[hazard(.12)],18);
  assert.equal(t?.stage,'critical');
  assert.ok((t?.urgency??0)>=.9);
});

test('game renders SAFE timeline at the existing safe lane seam',()=>{
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  assert.ok(source.includes('safeTelegraphTimeline'));
  assert.ok(source.includes('decisionWindowMs'));
  assert.ok(source.includes('hazardActivationMs'));
});
