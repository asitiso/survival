import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { PRESENTATION_LAYER_ORDER } from '../dist/game/presentation-integration.js';

test('phase 847-850 screen effects render below enemy projectiles and danger telegraphs',()=>{
  const screen=PRESENTATION_LAYER_ORDER.indexOf('screen-effects');
  const projectiles=PRESENTATION_LAYER_ORDER.indexOf('enemy-projectiles');
  const danger=PRESENTATION_LAYER_ORDER.indexOf('danger-telegraphs');
  const hero=PRESENTATION_LAYER_ORDER.indexOf('hero');
  assert.ok(screen>=0);
  assert.ok(screen<projectiles);
  assert.ok(projectiles<danger);
  assert.ok(danger<hero);
});

test('phase 851-852 game render invokes screen effects before danger telegraphs',()=>{
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  const renderStart=source.indexOf('private render(): void');
  const block=source.slice(renderStart,source.indexOf('private updatePresentationQuality',renderStart));
  assert.ok(block.includes('this.presentation.renderScreenEffects'));
  assert.ok(block.indexOf('this.presentation.renderScreenEffects')<block.indexOf('this.drawDangerTelegraphs'));
});

test('phase 853-854 spell cast path emits screen effects without reusing danger telegraphs',()=>{
  const source=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
  const start=source.indexOf('private emitSpellCastVfx');
  const block=source.slice(start,source.indexOf('private emitDeathPresentation',start));
  assert.ok(block.includes('emitScreenEffect'));
  assert.ok(!block.includes('emitTelegraph'));
});
