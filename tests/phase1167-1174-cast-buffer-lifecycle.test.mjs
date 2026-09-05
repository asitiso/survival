import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';

const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const main=fs.readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');
const block=(start,end)=>{const a=game.indexOf(start);const b=game.indexOf(end,a+start.length);return a>=0?game.slice(a,b>=0?b:undefined):'';};

test('phase 1167 one clear helper owns transient buffered cast invalidation',()=>{
  const helper=block('private clearBufferedCastIntents','resetTransientDecisionInput(): void');
  assert.match(helper,/castIntentBuffer\.clear\(\)/);
});

test('phase 1168 lifecycle transient reset clears buffered cast intents alongside raw input',()=>{
  const reset=block('resetTransientDecisionInput(): void','setVisibilityPaused');
  assert.match(reset,/clearBufferedCastIntents\(\)/);
  assert.match(reset,/input\.resetTransient\(\)/);
  for(const event of ['pageshow','resize','orientationchange']){
    const handler=main.match(new RegExp(`addEventListener\\('${event}'[\\s\\S]*?\\}\\);`))?.[0]??'';
    assert.match(handler,/resetTransientDecisionInput/);
  }
});

test('phase 1169 manual pause clears on pause entry and does not restore stale intents on resume',()=>{
  const toggle=block('toggleManualPause(): boolean','get manuallyPaused');
  assert.match(toggle,/if \(paused\)[\s\S]*?clearBufferedCastIntents\(\)/);
  assert.equal((toggle.match(/clearBufferedCastIntents\(\)/g)??[]).length,1);
});

test('phase 1170 decision session clears buffered combat intent only when entering the session',()=>{
  const flow=block('private continueDecisionSession','private finishDecisionPick');
  assert.match(flow,/if \(!this\.decisionSessionActive\)[\s\S]*?clearBufferedCastIntents\(\)/);
  const entryIndex=flow.indexOf('if (!this.decisionSessionActive)');
  const clearIndex=flow.indexOf('clearBufferedCastIntents()',entryIndex);
  const activateIndex=flow.indexOf('this.decisionSessionActive = true');
  assert.ok(entryIndex>=0 && clearIndex>entryIndex && activateIndex>clearIndex);
});

test('phase 1171 shop entry clears any queued combat cast before pausing',()=>{
  const shop=block('private openShop(): void','private refreshShopOverlay');
  assert.match(shop,/clearBufferedCastIntents\(\)/);
  assert.ok(shop.indexOf('clearBufferedCastIntents()')<shop.indexOf('this.paused = true'));
});

test('phase 1172-1174 new run reset clears buffered intent and snapshot remains transient-free',()=>{
  const reset=block('private resetRun','private emitMythicTacticLinkFeedback');
  assert.match(reset,/clearBufferedCastIntents\(\)/);
  const snapshot=fs.readFileSync(new URL('../src/domain/run-snapshot.ts',import.meta.url),'utf8');
  assert.doesNotMatch(snapshot,/castIntent|queuedCast|inputBuffer/i);
});
