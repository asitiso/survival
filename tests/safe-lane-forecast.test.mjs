import test from 'node:test';
import assert from 'node:assert/strict';
import { mythicSafeZoneState } from '../dist/game/endless/mythic-safe-zone.js';
import { safeLaneForecast } from '../dist/game/endless/safe-lane-forecast.js';

const lane={label:'SAFE LANE',target:{x:420,y:520},confidence:.8,score:120};

function zoneAt(ms){return mythicSafeZoneState('inferno',ms,1600,900,.5);}

test('safe lane forecast exposes current and next targets without moving the hero',()=>{
  const forecast=safeLaneForecast(lane,zoneAt(1000),1000);
  assert.equal(forecast?.label,'SAFE FORECAST');
  assert.deepEqual(forecast?.currentTarget,lane.target);
  assert.deepEqual(forecast?.nextTarget,zoneAt(1000).nextCenter);
  assert.equal(forecast?.autoMove,false);
});

test('forecast urgency rises through collapse and peaks while collapsed',()=>{
  const stable=safeLaneForecast(lane,zoneAt(1000),1000);
  const collapse=safeLaneForecast(lane,zoneAt(5200),5200);
  const collapsed=safeLaneForecast(lane,zoneAt(7000),7000);
  const reform=safeLaneForecast(lane,zoneAt(8400),8400);
  assert.ok(stable&&collapse&&collapsed&&reform);
  assert.ok(stable.urgency<collapse.urgency);
  assert.ok(collapse.urgency<collapsed.urgency);
  assert.ok(reform.urgency<collapsed.urgency);
  assert.ok(collapse.transitionMs>0&&collapse.transitionMs<=1400);
});

test('forecast is absent without a real safe lane or safe zone',()=>{
  assert.equal(safeLaneForecast(null,zoneAt(1000),1000),null);
  assert.equal(safeLaneForecast(lane,null,1000),null);
});

import fs from 'node:fs';
const gameSource=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('game renders safe forecast at the existing safe lane seam',()=>{
  assert.ok(gameSource.includes('safeLaneForecast'));
  assert.ok(gameSource.includes('forecast.nextTarget'));
  assert.ok(gameSource.includes('forecast.transitionMs'));
  assert.equal(gameSource.includes('autoMove'),false);
});
