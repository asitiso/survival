import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { ACTION_BUTTONS } from '../dist/game/config.js';
import { auditReleaseSurfaceFreeze } from '../dist/game/release-surface-freeze-audit.js';
import { createResilientStorage } from '../dist/domain/resilient-storage.js';
import { loadRunSnapshot, saveRunSnapshot, clearRunSnapshot } from '../dist/domain/run-snapshot.js';
import { loadRunSnapshotWithJournal, appendRecoveryCheckpoint } from '../dist/domain/recovery-journal.js';
import { loadPresentationSettings } from '../dist/game/presentation-settings.js';
import { auditReleaseStabilization } from '../dist/game/release-stabilization-audit.js';
import { auditReleaseFreeze } from '../dist/game/release-freeze-audit.js';
import { collectReleaseCandidateEvidence, releaseCandidateAudit } from '../dist/game/release-candidate-audit.js';

const snapshot=(savedAt=100,elapsed=60)=>({version:1,savedAt,heroId:'arkan',traitId:'destruction',threatLevel:3,elapsed,hero:{level:10,xp:10,xpNext:20,hp:100,maxHp:100,coins:20,kills:30},coreHp:100,spellLevels:{fireBolt:1,chainLightning:1,frostNova:1,flameField:1,meteorStorm:1,blackHole:1},equipment:{coins:20,weapon:null,armor:null,healingPotions:1},relic:null,fusions:[],fateChoices:[],map:{id:'ruinedGate',evolutionStage:0},progression:{bossesKilled:1,goldEarned:20,shopTokens:0}});
const mapStorage=()=>{const m=new Map();return{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k),map:m};};

test('phase 743 release surface freezes exactly nine combat actions',()=>{const a=auditReleaseSurfaceFreeze();assert.equal(ACTION_BUTTONS.length,9);assert.equal(a.actionCount,9);assert.equal(a.passed,true);});
test('phase 744 release surface freezes exactly four heroes',()=>{const a=auditReleaseSurfaceFreeze();assert.equal(a.heroCount,4);assert.deepEqual(a.heroIds,['arkan','seria','kain','edric']);});
test('phase 745 release surface freezes six spells and three maps',()=>{const a=auditReleaseSurfaceFreeze();assert.equal(a.spellCount,6);assert.equal(a.mapCount,3);assert.equal(a.passed,true);});
test('phase 746 release surface keeps snapshot schema at version one',()=>{const a=auditReleaseSurfaceFreeze();assert.equal(a.snapshotSchemaVersion,1);assert.equal(a.snapshotSchemaMutation,false);assert.equal(a.passed,true);});

test('phase 747 blocked browser storage getter falls back to session memory',()=>{const s=createResilientStorage(()=>{throw new Error('SecurityError');});s.setItem('x','1');assert.equal(s.getItem('x'),'1');});
test('phase 748 quota failure still preserves the latest session value',()=>{const p={getItem:()=>null,setItem:()=>{throw new Error('QuotaExceededError');},removeItem:()=>{}};const s=createResilientStorage(()=>p);s.setItem('x','latest');assert.equal(s.getItem('x'),'latest');});
test('phase 749 failed persistent removal cannot resurrect a stale value',()=>{const p={getItem:()=> 'stale',setItem:()=>{},removeItem:()=>{throw new Error('blocked');}};const s=createResilientStorage(()=>p);s.removeItem('x');assert.equal(s.getItem('x'),null);});
test('phase 750 healthy browser storage remains the primary durable path',()=>{const p=mapStorage();const s=createResilientStorage(()=>p);s.setItem('x','durable');assert.equal(p.getItem('x'),'durable');assert.equal(s.getItem('x'),'durable');});

test('phase 751 primary read exception still allows backup snapshot recovery',()=>{const good=JSON.stringify(snapshot(80));const s={getItem:k=>{if(k==='arcane-last-stand.run-snapshot')throw new Error('read');return k.endsWith('.backup')?good:null;},setItem(){},removeItem(){}};assert.equal(loadRunSnapshot(s)?.savedAt,80);});
test('phase 752 corrupt primary still falls back to valid backup',()=>{const good=JSON.stringify(snapshot(81));const s={getItem:k=>k.endsWith('.backup')?good:'{broken',setItem(){},removeItem(){}};assert.equal(loadRunSnapshot(s)?.savedAt,81);});
test('phase 753 failed primary removal does not skip backup removal',()=>{const calls=[];const s={getItem(){return null;},setItem(){},removeItem:k=>{calls.push(k);if(k==='arcane-last-stand.run-snapshot')throw new Error('blocked');}};clearRunSnapshot(s);assert.ok(calls.includes('arcane-last-stand.run-snapshot.backup'));});
test('phase 754 journal recovery remains independent from snapshot read failures',()=>{const j=snapshot(120);const raw=JSON.stringify([j]);const s={getItem:k=>{if(k==='arcane-last-stand.recovery-journal.v1')return raw;throw new Error('slot blocked');},setItem(){},removeItem(){}};assert.equal(loadRunSnapshotWithJournal(s)?.savedAt,120);});

test('phase 755 presentation settings cold-start survives storage exceptions',()=>{const s={getItem(){throw new Error('SecurityError');}};assert.equal(loadPresentationSettings(s).quality,'high');});
test('phase 756 Game persistence uses one resilient storage path instead of direct window.localStorage',()=>{const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');assert.doesNotMatch(source,/window\.localStorage/);assert.match(source,/createBrowserSessionStorage/);});
test('phase 757 pageshow resets transient input before visibility resume',()=>{const source=fs.readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');const block=source.match(/addEventListener\('pageshow'[\s\S]*?\}\);/)?.[0]??'';assert.match(block,/resetTransient/);assert.ok(block.indexOf('resetTransient')<block.indexOf('setVisibilityPaused'));});
test('phase 758 resize and orientation storms reset input without lifecycle checkpoint writes',()=>{const source=fs.readFileSync(new URL('../src/main.ts',import.meta.url),'utf8');for(const event of ['resize','orientationchange']){const block=source.match(new RegExp(`addEventListener\\('${event}'[\\s\\S]*?\\}\\);`))?.[0]??'';assert.match(block,/resetTransient/);assert.doesNotMatch(block,/checkpointForLifecycle/);}});

test('phase 759 release stabilization records session-storage fallback evidence',()=>{const a=auditReleaseStabilization();assert.equal(a.sessionStorageFallbackPassed,true);assert.equal(a.passed,true);});
test('phase 760 release stabilization records independent snapshot recovery evidence',()=>{const a=auditReleaseStabilization();assert.equal(a.snapshotRecoveryPassed,true);assert.equal(a.passed,true);});
test('phase 761 release freeze requires viewport lifecycle and combined stabilization evidence',()=>{const a=auditReleaseFreeze();assert.equal(a.viewportLifecyclePassed,true);assert.equal(a.stabilizationPassed,true);assert.equal(a.passed,true);});
test('phase 762 release candidate fails closed when stabilization evidence regresses',()=>{const e=collectReleaseCandidateEvidence();const broken={...e,releaseFreeze:{...e.releaseFreeze,stabilizationPassed:false,passed:false}};const a=releaseCandidateAudit(broken);assert.equal(a.ok,false);assert.ok(a.issues.includes('release-freeze'));});
