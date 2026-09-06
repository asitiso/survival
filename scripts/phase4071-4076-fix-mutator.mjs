import fs from 'node:fs';
const path='scripts/phase4071-4076-integrate.mjs';
let text=fs.readFileSync(path,'utf8');
const from='"*.38*arrivalContinuity.edgeAlphaScale*reactionCarry.aftermathAlphaScale*arrivalSettleRecovery.footprintAlphaScale*impactRetirement.footprintAlphaScale*impactResolutionBudget.effectStrength"';
const to='".38*arrivalContinuity.edgeAlphaScale*reactionCarry.aftermathAlphaScale*arrivalSettleRecovery.footprintAlphaScale*impactRetirement.footprintAlphaScale*impactResolutionBudget.effectStrength"';
if(!text.includes(from))throw new Error('mutator correction target missing');
text=text.replace(from,to);
fs.writeFileSync(path,text);
