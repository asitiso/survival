import { defaultRasterCiDiffSummary } from '../dist/game/render-raster-ci-summary.js';
const summary=defaultRasterCiDiffSummary();
console.log(summary.text);
process.exitCode=summary.exitCode;
