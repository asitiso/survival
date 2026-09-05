import test from 'node:test';
import assert from 'node:assert/strict';
import { growthChoiceIcon } from '../dist/game/growth-choice-icon-assets.js';

const relics=['abyss-eye','chrono-shard','guardian-heart','ember-crown','winter-heart','storm-core','oath-seal','inferno-heart','summoner-sigil','juggernaut-core','phoenix-brand','zero-crystal','storm-crown','citadel-sigil'];
const fusions=['solar-detonation','storm-crucible','frostfire-cataclysm','thunder-singularity','glacial-conduit','cataclysmic-domain'];

test('phase 1921 relic/fusion boss rewards use 20 unique build identity cells',()=>{
  const icons=[...relics.map(id=>growthChoiceIcon(`relic:${id}`,'relic')),...fusions.map(id=>growthChoiceIcon(`fusion:${id}`,'fusion'))];
  assert.equal(icons.every(Boolean),true);
  assert.equal(new Set(icons.map(x=>`${x.atlasSrc}|${x.backgroundPosition}`)).size,20);
  assert.equal(icons.every(x=>x.atlasSrc.endsWith('/build-identity-icons.png')),true);
});
