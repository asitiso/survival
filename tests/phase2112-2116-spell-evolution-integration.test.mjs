import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';
const game=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');
const levelup=fs.readFileSync(new URL('../src/ui/levelup.ts',import.meta.url),'utf8');
const css=fs.readFileSync(new URL('../src/styles.css',import.meta.url),'utf8');
test('phase 2112-2116 Game previews evolution milestones and recalls acquired tiers on toast and action buttons without a new action',()=>{
  assert.match(game,/SPELL_EVOLUTION_CREST_ATLAS/);assert.match(game,/initializeSpellEvolutionCrestAtlas/);assert.match(game,/spellEvolutionPreviewCrestStyle/);
  assert.match(game,/showSpellEvolutionEventToast/);assert.match(game,/drawSpellEvolutionToastIcon/);assert.match(game,/drawSpellEvolutionActionCrest/);
  assert.match(game,/1차 진화/);assert.match(game,/최종 진화/);assert.match(game,/spellEvolution\(this\.hero\.profileId/);
  assert.match(levelup,/evolutionCrestStyle/);assert.match(levelup,/spell-evolution-crest-preview/);assert.match(css,/\.spell-evolution-crest-preview/);
});
