export function releaseVerificationPlan(){return[
  {kind:'build',command:'npm',args:['run','build']},
  {kind:'tests',command:'node',args:['scripts/verify-tests-parallel.mjs']},
  {kind:'raster',command:'node',args:['scripts/render-raster-ci.mjs']},
  {kind:'release',command:'node',args:['scripts/render-release-gate.mjs']},
  {kind:'candidate',command:'node',args:['scripts/release-candidate-audit.mjs']},
  {kind:'archive',command:'node',args:['scripts/verify-archive-reproducibility.mjs']},
  {kind:'provenance',command:'node',args:['scripts/verify-archive-provenance.mjs']},
  {kind:'package',command:'node',args:['scripts/verify-package-runtime.mjs']},
  {kind:'runCycle',command:'node',args:['scripts/verify-package-run-cycle.mjs']},
];}
