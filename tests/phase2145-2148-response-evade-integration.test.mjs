import test from 'node:test'; import assert from 'node:assert/strict'; import fs from 'node:fs';
const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');

test('phase 2145-2146 Game loads response acknowledgement identity and renders it only from the existing manual acknowledgement state',()=>{
  for(const needle of ['BOSS_RESPONSE_ACK_IDENTITY_ATLAS','bossResponseAckIdentityIcon','initializeBossResponseAckIdentityAtlas','bossResponseAckIdentityAtlasImage','drawBossResponseAckIdentity']) assert.match(game,new RegExp(needle));
  assert.match(game,/this\.bossResponseAckAction===button\.id/);
  assert.match(game,/this\.bossResponseAckCycle===\(boss\.bossCycle\?\?0\)/);
  assert.match(game,/BOSS_RESPONSE_ACK_SECONDS/);
});

test('phase 2147-2148 Game connects perfect evade streak identity to the existing event toast and reuses final form identity for x5 finisher',()=>{
  for(const needle of ['PERFECT_EVADE_IDENTITY_ATLAS','perfectEvadeIdentityIcon','initializePerfectEvadeIdentityAtlas','eventToastPerfectEvadeStreak','drawPerfectEvadeToastIcon','showPerfectEvadeEventToast']) assert.match(game,new RegExp(needle));
  assert.match(game,/showPerfectEvadeEventToast\(`\$\{dodgeStep\.reward\.label\} ×\$\{this\.arenaDodgeChain\.count\} · FLOW 유지`,this\.arenaDodgeChain\.count\)/);
  assert.match(game,/if\s*\(finalFormId\)\s*this\.showFinalFormIdentityCue\(finalFormId,1\.2\)/);
});

test('phase 2145-2148 integration does not add actions or persistence schema fields',()=>{
  const snap=fs.readFileSync(new URL('../src/game/endless/snapshot.ts',import.meta.url),'utf8');
  assert.doesNotMatch(snap,/responseAckIdentity|perfectEvadeIdentity|eventToastPerfectEvade/);
});
