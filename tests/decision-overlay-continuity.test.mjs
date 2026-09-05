import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const level=fs.readFileSync(new URL('../src/ui/levelup.ts',import.meta.url),'utf8');
const fate=fs.readFileSync(new URL('../src/ui/fate-select.ts',import.meta.url),'utf8');

test('phase 1114 level-up card pick leaves overlay ownership to decision session',()=>{
  const listener=level.match(/button\.addEventListener\('click',[\s\S]*?\);/)?.[0]??'';
  assert.match(listener,/onPick\(choice\)/);
  assert.doesNotMatch(listener,/this\.close\(\)/);
});

test('phase 1115 fate card pick leaves overlay ownership to decision session',()=>{
  const listener=fate.match(/button\.addEventListener\('click',[\s\S]*?\);/)?.[0]??'';
  assert.match(listener,/onSelect\(path\.id\)/);
  assert.doesNotMatch(listener,/this\.hide\(\)/);
});

test('phase 1116 repeated rendering replaces card content in the existing roots',()=>{
  assert.match(level,/this\.cards\.replaceChildren\(\)/);
  assert.match(fate,/this\.root\.replaceChildren\(\)/);
  assert.equal((level.match(/parent\.append\(this\.root\)/g)??[]).length,1);
  assert.equal((fate.match(/parent\.append\(this\.root\)/g)??[]).length,1);
});
