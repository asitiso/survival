import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const input=fs.readFileSync(new URL('../src/core/input.ts',import.meta.url),'utf8');
test('foldable input uses dead-space resolver only inside foldable branch',()=>{
  assert.match(input,/resolveFoldableDeadSpace\(/);
  assert.match(input,/deadSpace\.actionId/);
  assert.match(input,/deadSpace\?\.joystickOrigin/);
  assert.match(input,/safeArea\.aspectClass === 'foldable'/);
});
