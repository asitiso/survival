from pathlib import Path
import subprocess

BRANCH='work/phase4173-4190-fast'

def run(cmd, check=True):
    print(f'\n$ {cmd}', flush=True)
    p=subprocess.run(cmd, shell=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    print(p.stdout, end='')
    if check and p.returncode!=0:
        raise SystemExit(p.returncode)
    return p

def write(path, content):
    p=Path(path); p.parent.mkdir(parents=True, exist_ok=True); p.write_text(content.strip()+"\n")

def insert_import(path, marker, line):
    p=Path(path); t=p.read_text()
    if line in t: return
    if marker not in t: raise SystemExit(f'{path}: missing import marker')
    p.write_text(t.replace(marker, marker+'\n'+line, 1))

def insert_after(path, needle, text):
    p=Path(path); lines=p.read_text().splitlines()
    key=text.split('=')[0].strip()
    if key and any(key in line for line in lines): return
    hits=[i for i,line in enumerate(lines) if needle in line and not line.lstrip().startswith('import ')]
    if len(hits)!=1: raise SystemExit(f'{path}: needle {needle!r} hits={len(hits)}')
    lines[hits[0]+1:hits[0]+1]=text.splitlines()
    p.write_text('\n'.join(lines)+'\n')

def replace_all(path, old, new, minimum=1):
    p=Path(path); t=p.read_text(); n=t.count(old)
    if n<minimum: raise SystemExit(f'{path}: missing fragment {old[:100]!r} count={n}')
    if old==new: return n
    p.write_text(t.replace(old,new)); return n

def replace_once(path, old, new):
    p=Path(path); t=p.read_text(); n=t.count(old)
    if n!=1: raise SystemExit(f'{path}: expected 1 fragment, found {n}: {old[:120]!r}')
    p.write_text(t.replace(old,new,1))

def red(test_file, module_fragment):
    run('npm run build')
    p=run(f'node --test {test_file}', check=False)
    if p.returncode==0: raise SystemExit(f'RED unexpectedly passed: {test_file}')
    if module_fragment not in p.stdout and 'ERR_MODULE_NOT_FOUND' not in p.stdout and 'Cannot find module' not in p.stdout:
        raise SystemExit(f'RED failed for unexpected reason: {test_file}')
    print(f'RED confirmed: {test_file}')

def commit(msg, module, test_file, related):
    run('npm run build')
    run('node --test '+' '.join([test_file]+related))
    run('git diff --check')
    run(f'git add src/game/enemies.ts src/game/spells.ts src/game/game.ts {module} {test_file}')
    dist=module.replace('src/','dist/').replace('.ts','.js')
    run(f'git add -f dist/game/enemies.js dist/game/spells.js dist/game/game.js {dist}')
    run(f'git commit -m {msg!r}')

run("git config user.name 'github-actions[bot]'")
run("git config user.email '41898282+github-actions[bot]@users.noreply.github.com'")
baseline=[
 'tests/phase4137-4142-canonical-reacquisition.test.mjs',
 'tests/phase4143-4148-direction-reacquisition.test.mjs',
 'tests/phase4149-4154-critical-reengagement.test.mjs',
 'tests/phase4155-4160-effective-alpha-floor.test.mjs',
 'tests/phase4161-4166-secondary-ceiling.test.mjs',
 'tests/phase4167-4172-readability-contrast.test.mjs',
]
run('npm run build')
run('node --test '+' '.join(baseline))

# Train 1 — Phase 4173-4178 Final Readability Settle
m1='src/game/threat-impact-final-readability-settle-rendering.ts'
t1='tests/phase4173-4178-final-readability-settle.test.mjs'
write(t1, r"""
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const moduleUrl=new URL('../dist/game/threat-impact-final-readability-settle-rendering.js',import.meta.url);
async function load(){return import(moduleUrl.href+'?v='+Date.now());}
test('Phase 4173 projectile settle keeps canonical floor while unsettled trail yields',async()=>{const {projectileFinalReadabilitySettlePresentation}=await load();const p=projectileFinalReadabilitySettlePresentation({primaryFloor:.38,reacquire:.15,stress:1,critical:false},false,false);assert.ok(p.primaryFloor>=.42);assert.ok(p.secondaryScale<.72);assert.ok(p.secondaryScale<=1);});
test('Phase 4174 impact settle protects edge before interior decoration',async()=>{const {impactFinalReadabilitySettlePresentation}=await load();const p=impactFinalReadabilitySettlePresentation({primaryFloor:.4,reacquire:.2,stress:.9,critical:true},false,false);assert.ok(p.primaryFloor>=.48);assert.ok(p.secondaryScale<.82);});
test('Phase 4175 hazard settle keeps telegraph boundary stable through crowd churn',async()=>{const {hazardFinalReadabilitySettlePresentation}=await load();const p=hazardFinalReadabilitySettlePresentation({primaryFloor:.44,reacquire:.2,stress:1,critical:true},false,false);assert.ok(p.primaryFloor>=.5);assert.ok(p.secondaryScale<.82);});
test('Phase 4176 safe lane settle preserves path while contour decoration yields',async()=>{const {safeLaneFinalReadabilitySettlePresentation}=await load();const p=safeLaneFinalReadabilitySettlePresentation({primaryFloor:.62,reacquire:.2,stress:1,critical:true,confidence:.9},false,false);assert.ok(p.primaryFloor>=.72);assert.ok(p.secondaryScale<.82);});
test('Phase 4177 specialist settle keeps silhouette ownership stable',async()=>{const {specialistFinalReadabilitySettlePresentation}=await load();const p=specialistFinalReadabilitySettlePresentation({primaryFloor:.4,reacquire:.15,stress:1,critical:true},false,false);assert.ok(p.primaryFloor>=.5);assert.ok(p.secondaryScale<.82);});
test('Phase 4178 settle budget never attenuates primary ownership',async()=>{const {finalReadabilitySettleBudgetPresentation}=await load();const p=finalReadabilitySettleBudgetPresentation({criticalCount:2,stress:1,bossActive:true,safeLaneVisible:true},false,false);assert.equal(p.primaryScale,1);assert.ok(p.secondaryScale<1);assert.ok(p.safeLaneScale>=1);});
test('Phase 4173-4178 live renderers consume final readability settle helpers',()=>{const e=fs.readFileSync(new URL('../src/game/enemies.ts',import.meta.url),'utf8'),s=fs.readFileSync(new URL('../src/game/spells.ts',import.meta.url),'utf8'),g=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');assert.match(e,/projectileFinalReadabilitySettlePresentation/);assert.match(e,/specialistFinalReadabilitySettlePresentation/);assert.match(s,/impactFinalReadabilitySettlePresentation/);assert.match(g,/hazardFinalReadabilitySettlePresentation/);assert.match(g,/safeLaneFinalReadabilitySettlePresentation/);assert.match(e,/projectileFinalSettle\.secondaryScale/);});
""")
red(t1,'threat-impact-final-readability-settle-rendering')
write(m1, r"""
const clamp01=(value:number)=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));
const smooth01=(value:number)=>{const x=clamp01(value);return x*x*(3-2*x);};
function settle(primaryFloor:number,reacquire:number,stress:number,critical:boolean,normalFloor:number,criticalFloor:number,normalSecondary:number,criticalSecondary:number,reducedMotion=false,reducedFlash=false){const settled=smooth01(reacquire),load=clamp01(stress),unsettled=clamp01((1-settled)*.68+load*.32),motion=reducedMotion?.97:1,flash=reducedFlash?.97:1;return{settle:settled,primaryFloor:clamp01(Math.max(primaryFloor,(critical?criticalFloor:normalFloor)+unsettled*.035)*flash),secondaryScale:Math.max(critical?criticalSecondary:normalSecondary,1-unsettled*(critical?.26:.42))*motion*flash,presentationOnly:true as const};}
export function projectileFinalReadabilitySettlePresentation(input:{primaryFloor:number;reacquire:number;stress:number;critical:boolean},reducedMotion=false,reducedFlash=false){return settle(input.primaryFloor,input.reacquire,input.stress,input.critical,.42,.6,.5,.68,reducedMotion,reducedFlash);}
export function impactFinalReadabilitySettlePresentation(input:{primaryFloor:number;reacquire:number;stress:number;critical:boolean},reducedMotion=false,reducedFlash=false){return settle(input.primaryFloor,input.reacquire,input.stress,input.critical,.34,.48,.42,.64,reducedMotion,reducedFlash);}
export function hazardFinalReadabilitySettlePresentation(input:{primaryFloor:number;reacquire:number;stress:number;critical:boolean},reducedMotion=false,reducedFlash=false){return settle(input.primaryFloor,input.reacquire,input.stress,input.critical,.36,.5,.4,.62,reducedMotion,reducedFlash);}
export function safeLaneFinalReadabilitySettlePresentation(input:{primaryFloor:number;reacquire:number;stress:number;critical:boolean;confidence:number},reducedMotion=false,reducedFlash=false){const confidence=clamp01(input.confidence),p=settle(input.primaryFloor,input.reacquire,input.stress,input.critical,.6+confidence*.12,.68+confidence*.06,.5,.66,reducedMotion,reducedFlash);return{...p,primaryFloor:clamp01(Math.max(p.primaryFloor,.6+confidence*.14)),presentationOnly:true as const};}
export function specialistFinalReadabilitySettlePresentation(input:{primaryFloor:number;reacquire:number;stress:number;critical:boolean},reducedMotion=false,reducedFlash=false){return settle(input.primaryFloor,input.reacquire,input.stress,input.critical,.4,.5,.46,.64,reducedMotion,reducedFlash);}
export function finalReadabilitySettleBudgetPresentation(input:{criticalCount:number;stress:number;bossActive:boolean;safeLaneVisible:boolean},reducedMotion=false,reducedFlash=false){const critical=clamp01(Math.max(0,input.criticalCount)/3),stress=clamp01(input.stress),load=clamp01(stress*.82+critical*.18+(input.bossActive?.04:0));return{stress:load,primaryScale:1,secondaryScale:Math.max(.5,1-load*.34)*(reducedMotion?.97:1)*(reducedFlash?.97:1),safeLaneScale:input.safeLaneVisible?1+load*.025*(reducedFlash?.9:1):1,presentationOnly:true as const};}
""")
insert_import('src/game/enemies.ts',"import { projectileReadabilityContrastPresentation, readabilityContrastBudgetPresentation, specialistReadabilityContrastPresentation } from './threat-impact-readability-contrast-rendering.js';","import { finalReadabilitySettleBudgetPresentation, projectileFinalReadabilitySettlePresentation, specialistFinalReadabilitySettlePresentation } from './threat-impact-final-readability-settle-rendering.js';")
insert_import('src/game/spells.ts',"import { impactReadabilityContrastPresentation, readabilityContrastBudgetPresentation } from './threat-impact-readability-contrast-rendering.js';","import { finalReadabilitySettleBudgetPresentation, impactFinalReadabilitySettlePresentation } from './threat-impact-final-readability-settle-rendering.js';")
insert_import('src/game/game.ts',"import { hazardReadabilityContrastPresentation, readabilityContrastBudgetPresentation, safeLaneReadabilityContrastPresentation } from './threat-impact-readability-contrast-rendering.js';","import { finalReadabilitySettleBudgetPresentation, hazardFinalReadabilitySettlePresentation, safeLaneFinalReadabilitySettlePresentation } from './threat-impact-final-readability-settle-rendering.js';")
insert_after('src/game/enemies.ts','const projectileReadabilityContrast=',"      const projectileFinalSettle=projectileFinalReadabilitySettlePresentation({primaryFloor:projectileReadabilityContrast.bodyAlphaFloor,reacquire:projectileCanonicalReacquisition.reacquire,stress:projectileReadabilityContrastBudget.stress,critical:Boolean(projectile.bossArchetype)},reducedMotion,reducedFlash),projectileFinalSettleBudget=finalReadabilitySettleBudgetPresentation({criticalCount:projectile.bossArchetype?1:0,stress:projectileReadabilityContrastBudget.stress,bossActive:Boolean(projectile.bossArchetype),safeLaneVisible:projectileLaneProximity>0},reducedMotion,reducedFlash);")
insert_after('src/game/enemies.ts','const specialistReadabilityContrast=',"      const specialistFinalSettle=specialistFinalReadabilitySettlePresentation({primaryFloor:specialistReadabilityContrast.silhouetteAlphaFloor,reacquire:specialistCanonicalReacquisition.reacquire,stress:specialistReadabilityContrastBudget.stress,critical:silhouetteDirection.owner==='special'},reducedMotion,reducedFlash),specialistFinalSettleBudget=finalReadabilitySettleBudgetPresentation({criticalCount:silhouetteDirection.owner==='special'?1:0,stress:specialistReadabilityContrastBudget.stress,bossActive:specialistBossProximity>0,safeLaneVisible:false},reducedMotion,reducedFlash);")
insert_after('src/game/spells.ts','const impactReadabilityContrast=',"        const impactFinalSettle=impactFinalReadabilitySettlePresentation({primaryFloor:impactReadabilityContrast.edgeAlphaFloor,reacquire:impactCanonicalReacquisition.reacquire,stress:impactReadabilityContrastBudget.stress,critical:impactCritical},reducedMotion,reducedFlash),impactFinalSettleBudget=finalReadabilitySettleBudgetPresentation({criticalCount:impactCritical?1:0,stress:impactReadabilityContrastBudget.stress,bossActive:bossTelegraphOverlap,safeLaneVisible:false},reducedMotion,reducedFlash);")
insert_after('src/game/game.ts','const hazardReadabilityContrast=',"      const hazardFinalSettle=hazardFinalReadabilitySettlePresentation({primaryFloor:hazardReadabilityContrast.edgeAlphaFloor,reacquire:hazardCanonicalReacquisition.reacquire,stress:hazardReadabilityContrastBudget.stress,critical:hazard.id===primaryTelegraphHazardId},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash),hazardFinalSettleBudget=finalReadabilitySettleBudgetPresentation({criticalCount:hazard.id===primaryTelegraphHazardId?1:0,stress:hazardReadabilityContrastBudget.stress,bossActive:Boolean(boss),safeLaneVisible:Boolean(safeLane)},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);")
insert_after('src/game/game.ts','const safeLaneReadabilityContrast=',"      const safeLaneFinalSettle=safeLaneFinalReadabilitySettlePresentation({primaryFloor:safeLaneReadabilityContrast.pathAlphaFloor,reacquire:safeLaneReclaim.release,stress:safeLaneReadabilityContrastBudget.stress,critical:this.dangerState.coreCritical||this.dangerState.heroCritical,confidence:safeLane.confidence},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash),safeLaneFinalSettleBudget=finalReadabilitySettleBudgetPresentation({criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0),stress:safeLaneReadabilityContrastBudget.stress,bossActive:Boolean(boss),safeLaneVisible:true},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);")
replace_all('src/game/enemies.ts','*projectileReadabilityContrastBudget.secondaryScale','*projectileReadabilityContrastBudget.secondaryScale*projectileFinalSettle.secondaryScale*projectileFinalSettleBudget.secondaryScale')
replace_once('src/game/enemies.ts','Math.max(projectileEffectiveFloor.bodyAlphaFloor*projectileEffectiveFloorBudget.canonicalFloorScale,projectileReadabilityContrast.bodyAlphaFloor*projectileReadabilityContrastBudget.primaryScale,','Math.max(projectileEffectiveFloor.bodyAlphaFloor*projectileEffectiveFloorBudget.canonicalFloorScale,projectileReadabilityContrast.bodyAlphaFloor*projectileReadabilityContrastBudget.primaryScale,projectileFinalSettle.primaryFloor,')
replace_all('src/game/enemies.ts','*specialistReadabilityContrastBudget.secondaryScale','*specialistReadabilityContrastBudget.secondaryScale*specialistFinalSettle.secondaryScale*specialistFinalSettleBudget.secondaryScale')
replace_once('src/game/enemies.ts','Math.max(specialistEffectiveFloor.silhouetteAlphaFloor*specialistEffectiveFloorBudget.canonicalFloorScale,specialistReadabilityContrast.silhouetteAlphaFloor*specialistReadabilityContrastBudget.primaryScale,','Math.max(specialistEffectiveFloor.silhouetteAlphaFloor*specialistEffectiveFloorBudget.canonicalFloorScale,specialistReadabilityContrast.silhouetteAlphaFloor*specialistReadabilityContrastBudget.primaryScale,specialistFinalSettle.primaryFloor,')
replace_all('src/game/spells.ts','*impactReadabilityContrastBudget.secondaryScale','*impactReadabilityContrastBudget.secondaryScale*impactFinalSettle.secondaryScale*impactFinalSettleBudget.secondaryScale')
replace_once('src/game/spells.ts','Math.max(impactEffectiveFloor.edgeAlphaFloor*impactEffectiveFloorBudget.canonicalFloorScale,impactReadabilityContrast.edgeAlphaFloor*impactReadabilityContrastBudget.primaryScale,','Math.max(impactEffectiveFloor.edgeAlphaFloor*impactEffectiveFloorBudget.canonicalFloorScale,impactReadabilityContrast.edgeAlphaFloor*impactReadabilityContrastBudget.primaryScale,impactFinalSettle.primaryFloor,')
replace_all('src/game/game.ts','*hazardReadabilityContrastBudget.secondaryScale','*hazardReadabilityContrastBudget.secondaryScale*hazardFinalSettle.secondaryScale*hazardFinalSettleBudget.secondaryScale')
replace_once('src/game/game.ts','Math.max(hazardEffectiveFloor.edgeAlphaFloor*hazardEffectiveFloorBudget.canonicalFloorScale,hazardReadabilityContrast.edgeAlphaFloor*hazardReadabilityContrastBudget.primaryScale,','Math.max(hazardEffectiveFloor.edgeAlphaFloor*hazardEffectiveFloorBudget.canonicalFloorScale,hazardReadabilityContrast.edgeAlphaFloor*hazardReadabilityContrastBudget.primaryScale,hazardFinalSettle.primaryFloor,')
replace_once('src/game/game.ts','Math.max(safeLaneEffectiveFloor.pathAlphaFloor*safeLaneEffectiveFloorBudget.safeLaneFloorScale,safeLaneReadabilityContrast.pathAlphaFloor*safeLaneReadabilityContrastBudget.safeLaneScale,','Math.max(safeLaneEffectiveFloor.pathAlphaFloor*safeLaneEffectiveFloorBudget.safeLaneFloorScale,safeLaneReadabilityContrast.pathAlphaFloor*safeLaneReadabilityContrastBudget.safeLaneScale,safeLaneFinalSettle.primaryFloor*safeLaneFinalSettleBudget.safeLaneScale,')
replace_once('src/game/game.ts','safeLaneBaseAlpha*safeLaneHazardRecovery.pathAlphaScale*feather.alphaScale;','safeLaneBaseAlpha*safeLaneHazardRecovery.pathAlphaScale*feather.alphaScale*safeLaneFinalSettle.secondaryScale*safeLaneFinalSettleBudget.secondaryScale;')
replace_once('src/game/game.ts','safeLaneBaseAlpha*safeLaneHazardOcclusion.locatorAlphaScale*safeLaneHazardRecovery.locatorAlphaScale;','safeLaneBaseAlpha*safeLaneHazardOcclusion.locatorAlphaScale*safeLaneHazardRecovery.locatorAlphaScale*safeLaneFinalSettle.secondaryScale*safeLaneFinalSettleBudget.secondaryScale;')
commit('Phase 4173-4178 final battlefield readability settle',m1,t1,baseline)

# Train 2 — Phase 4179-4184 Secondary Recovery Gate
m2='src/game/threat-impact-secondary-recovery-gate-rendering.ts'
t2='tests/phase4179-4184-secondary-recovery-gate.test.mjs'
write(t2, r"""
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const moduleUrl=new URL('../dist/game/threat-impact-secondary-recovery-gate-rendering.js',import.meta.url);
async function load(){return import(moduleUrl.href+'?v='+Date.now());}
test('Phase 4179 projectile secondary recovery opens gradually after settle',async()=>{const {projectileSecondaryRecoveryGatePresentation}=await load();const low=projectileSecondaryRecoveryGatePresentation({release:.1,stress:1,critical:false},false,false),high=projectileSecondaryRecoveryGatePresentation({release:.9,stress:1,critical:false},false,false);assert.ok(low.secondaryScale<high.secondaryScale);assert.equal(low.canonicalScale,1);assert.ok(high.secondaryScale<=1);});
test('Phase 4180 impact fill recovery stays gated while edge remains canonical',async()=>{const {impactSecondaryRecoveryGatePresentation}=await load();const p=impactSecondaryRecoveryGatePresentation({release:.2,stress:.9,critical:true},false,false);assert.ok(p.secondaryScale<.82);assert.equal(p.canonicalScale,1);});
test('Phase 4181 hazard interior recovery cannot outrun danger boundary',async()=>{const {hazardSecondaryRecoveryGatePresentation}=await load();const p=hazardSecondaryRecoveryGatePresentation({release:.15,stress:1,critical:true},false,false);assert.ok(p.secondaryScale<.82);assert.equal(p.canonicalScale,1);});
test('Phase 4182 safe lane decoration returns after path ownership',async()=>{const {safeLaneSecondaryRecoveryGatePresentation}=await load();const p=safeLaneSecondaryRecoveryGatePresentation({release:.15,stress:1,critical:true},false,false);assert.ok(p.secondaryScale<.82);assert.equal(p.canonicalScale,1);});
test('Phase 4183 specialist recovery trail returns after silhouette ownership',async()=>{const {specialistSecondaryRecoveryGatePresentation}=await load();const p=specialistSecondaryRecoveryGatePresentation({release:.2,stress:1,critical:true},false,false);assert.ok(p.secondaryScale<.82);assert.equal(p.canonicalScale,1);});
test('Phase 4184 recovery gate budget never boosts secondary layers',async()=>{const {secondaryRecoveryGateBudgetPresentation}=await load();const p=secondaryRecoveryGateBudgetPresentation({criticalCount:2,stress:1,release:.2},false,false);assert.equal(p.canonicalScale,1);assert.ok(p.secondaryScale<=1);assert.ok(p.secondaryScale<.85);});
test('Phase 4179-4184 live renderers consume secondary recovery gates',()=>{const e=fs.readFileSync(new URL('../src/game/enemies.ts',import.meta.url),'utf8'),s=fs.readFileSync(new URL('../src/game/spells.ts',import.meta.url),'utf8'),g=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');assert.match(e,/projectileSecondaryRecoveryGatePresentation/);assert.match(e,/specialistSecondaryRecoveryGatePresentation/);assert.match(s,/impactSecondaryRecoveryGatePresentation/);assert.match(g,/hazardSecondaryRecoveryGatePresentation/);assert.match(g,/safeLaneSecondaryRecoveryGatePresentation/);assert.match(e,/projectileSecondaryRecoveryGate\.secondaryScale/);});
""")
red(t2,'threat-impact-secondary-recovery-gate-rendering')
write(m2, r"""
const clamp01=(value:number)=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));
const smooth01=(value:number)=>{const x=clamp01(value);return x*x*(3-2*x);};
function gate(release:number,stress:number,critical:boolean,normalMin:number,criticalMin:number,reducedMotion=false,reducedFlash=false){const recovery=smooth01(release),load=clamp01(stress),floor=critical?criticalMin:normalMin,open=clamp01(floor+(1-floor)*recovery-load*(1-recovery)*.12),motion=reducedMotion?.97:1,flash=reducedFlash?.97:1;return{release:recovery,secondaryScale:Math.max(floor*.94,open)*motion*flash,canonicalScale:1,presentationOnly:true as const};}
export function projectileSecondaryRecoveryGatePresentation(input:{release:number;stress:number;critical:boolean},reducedMotion=false,reducedFlash=false){return gate(input.release,input.stress,input.critical,.5,.68,reducedMotion,reducedFlash);}
export function impactSecondaryRecoveryGatePresentation(input:{release:number;stress:number;critical:boolean},reducedMotion=false,reducedFlash=false){return gate(input.release,input.stress,input.critical,.42,.62,reducedMotion,reducedFlash);}
export function hazardSecondaryRecoveryGatePresentation(input:{release:number;stress:number;critical:boolean},reducedMotion=false,reducedFlash=false){return gate(input.release,input.stress,input.critical,.4,.6,reducedMotion,reducedFlash);}
export function safeLaneSecondaryRecoveryGatePresentation(input:{release:number;stress:number;critical:boolean},reducedMotion=false,reducedFlash=false){return gate(input.release,input.stress,input.critical,.5,.66,reducedMotion,reducedFlash);}
export function specialistSecondaryRecoveryGatePresentation(input:{release:number;stress:number;critical:boolean},reducedMotion=false,reducedFlash=false){return gate(input.release,input.stress,input.critical,.46,.64,reducedMotion,reducedFlash);}
export function secondaryRecoveryGateBudgetPresentation(input:{criticalCount:number;stress:number;release:number},reducedMotion=false,reducedFlash=false){const critical=clamp01(Math.max(0,input.criticalCount)/3),stress=clamp01(input.stress),release=smooth01(input.release),hold=clamp01((1-release)*.72+stress*.2+critical*.08);return{hold,canonicalScale:1,secondaryScale:Math.max(.48,1-hold*.42)*(reducedMotion?.97:1)*(reducedFlash?.97:1),presentationOnly:true as const};}
""")
insert_import('src/game/enemies.ts',"import { finalReadabilitySettleBudgetPresentation, projectileFinalReadabilitySettlePresentation, specialistFinalReadabilitySettlePresentation } from './threat-impact-final-readability-settle-rendering.js';","import { projectileSecondaryRecoveryGatePresentation, secondaryRecoveryGateBudgetPresentation, specialistSecondaryRecoveryGatePresentation } from './threat-impact-secondary-recovery-gate-rendering.js';")
insert_import('src/game/spells.ts',"import { finalReadabilitySettleBudgetPresentation, impactFinalReadabilitySettlePresentation } from './threat-impact-final-readability-settle-rendering.js';","import { impactSecondaryRecoveryGatePresentation, secondaryRecoveryGateBudgetPresentation } from './threat-impact-secondary-recovery-gate-rendering.js';")
insert_import('src/game/game.ts',"import { finalReadabilitySettleBudgetPresentation, hazardFinalReadabilitySettlePresentation, safeLaneFinalReadabilitySettlePresentation } from './threat-impact-final-readability-settle-rendering.js';","import { hazardSecondaryRecoveryGatePresentation, safeLaneSecondaryRecoveryGatePresentation, secondaryRecoveryGateBudgetPresentation } from './threat-impact-secondary-recovery-gate-rendering.js';")
insert_after('src/game/enemies.ts','const projectileFinalSettle=',"      const projectileSecondaryRecoveryGate=projectileSecondaryRecoveryGatePresentation({release:projectileFinalSettle.settle,stress:projectileFinalSettleBudget.stress,critical:Boolean(projectile.bossArchetype)},reducedMotion,reducedFlash),projectileSecondaryRecoveryGateBudget=secondaryRecoveryGateBudgetPresentation({criticalCount:projectile.bossArchetype?1:0,stress:projectileFinalSettleBudget.stress,release:projectileFinalSettle.settle},reducedMotion,reducedFlash);")
insert_after('src/game/enemies.ts','const specialistFinalSettle=',"      const specialistSecondaryRecoveryGate=specialistSecondaryRecoveryGatePresentation({release:specialistFinalSettle.settle,stress:specialistFinalSettleBudget.stress,critical:silhouetteDirection.owner==='special'},reducedMotion,reducedFlash),specialistSecondaryRecoveryGateBudget=secondaryRecoveryGateBudgetPresentation({criticalCount:silhouetteDirection.owner==='special'?1:0,stress:specialistFinalSettleBudget.stress,release:specialistFinalSettle.settle},reducedMotion,reducedFlash);")
insert_after('src/game/spells.ts','const impactFinalSettle=',"        const impactSecondaryRecoveryGate=impactSecondaryRecoveryGatePresentation({release:impactFinalSettle.settle,stress:impactFinalSettleBudget.stress,critical:impactCritical},reducedMotion,reducedFlash),impactSecondaryRecoveryGateBudget=secondaryRecoveryGateBudgetPresentation({criticalCount:impactCritical?1:0,stress:impactFinalSettleBudget.stress,release:impactFinalSettle.settle},reducedMotion,reducedFlash);")
insert_after('src/game/game.ts','const hazardFinalSettle=',"      const hazardSecondaryRecoveryGate=hazardSecondaryRecoveryGatePresentation({release:hazardFinalSettle.settle,stress:hazardFinalSettleBudget.stress,critical:hazard.id===primaryTelegraphHazardId},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash),hazardSecondaryRecoveryGateBudget=secondaryRecoveryGateBudgetPresentation({criticalCount:hazard.id===primaryTelegraphHazardId?1:0,stress:hazardFinalSettleBudget.stress,release:hazardFinalSettle.settle},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);")
insert_after('src/game/game.ts','const safeLaneFinalSettle=',"      const safeLaneSecondaryRecoveryGate=safeLaneSecondaryRecoveryGatePresentation({release:safeLaneFinalSettle.settle,stress:safeLaneFinalSettleBudget.stress,critical:this.dangerState.coreCritical||this.dangerState.heroCritical},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash),safeLaneSecondaryRecoveryGateBudget=secondaryRecoveryGateBudgetPresentation({criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0),stress:safeLaneFinalSettleBudget.stress,release:safeLaneFinalSettle.settle},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);")
replace_all('src/game/enemies.ts','*projectileFinalSettleBudget.secondaryScale','*projectileFinalSettleBudget.secondaryScale*projectileSecondaryRecoveryGate.secondaryScale*projectileSecondaryRecoveryGateBudget.secondaryScale')
replace_all('src/game/enemies.ts','*specialistFinalSettleBudget.secondaryScale','*specialistFinalSettleBudget.secondaryScale*specialistSecondaryRecoveryGate.secondaryScale*specialistSecondaryRecoveryGateBudget.secondaryScale')
replace_all('src/game/spells.ts','*impactFinalSettleBudget.secondaryScale','*impactFinalSettleBudget.secondaryScale*impactSecondaryRecoveryGate.secondaryScale*impactSecondaryRecoveryGateBudget.secondaryScale')
replace_all('src/game/game.ts','*hazardFinalSettleBudget.secondaryScale','*hazardFinalSettleBudget.secondaryScale*hazardSecondaryRecoveryGate.secondaryScale*hazardSecondaryRecoveryGateBudget.secondaryScale')
replace_all('src/game/game.ts','*safeLaneFinalSettleBudget.secondaryScale','*safeLaneFinalSettleBudget.secondaryScale*safeLaneSecondaryRecoveryGate.secondaryScale*safeLaneSecondaryRecoveryGateBudget.secondaryScale')
commit('Phase 4179-4184 secondary battlefield recovery gate',m2,t2,baseline+[t1])

# Train 3 — Phase 4185-4190 Focus Transfer Coherence
m3='src/game/threat-impact-focus-transfer-coherence-rendering.ts'
t3='tests/phase4185-4190-focus-transfer-coherence.test.mjs'
write(t3, r"""
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const moduleUrl=new URL('../dist/game/threat-impact-focus-transfer-coherence-rendering.js',import.meta.url);
async function load(){return import(moduleUrl.href+'?v='+Date.now());}
test('Phase 4185 projectile focus transfer prevents simultaneous full primary and trail emphasis',async()=>{const {projectileFocusTransferCoherencePresentation}=await load();const p=projectileFocusTransferCoherencePresentation({incomingFocus:1,outgoingFocus:1,stress:1,critical:true},false,false);assert.equal(p.primaryScale,1);assert.ok(p.incomingScale+p.outgoingScale<1.6);assert.ok(p.secondaryScale<.78);});
test('Phase 4186 impact transfer yields interior when telegraph and edge focus overlap',async()=>{const {impactFocusTransferCoherencePresentation}=await load();const p=impactFocusTransferCoherencePresentation({incomingFocus:1,outgoingFocus:1,stress:1,critical:true},false,false);assert.equal(p.primaryScale,1);assert.ok(p.secondaryScale<.78);});
test('Phase 4187 hazard transfer protects boundary while old interior focus retires',async()=>{const {hazardFocusTransferCoherencePresentation}=await load();const p=hazardFocusTransferCoherencePresentation({incomingFocus:1,outgoingFocus:1,stress:1,critical:true},false,false);assert.equal(p.primaryScale,1);assert.ok(p.outgoingScale<.7);});
test('Phase 4188 safe lane transfer keeps path canonical under boss focus handoff',async()=>{const {safeLaneFocusTransferCoherencePresentation}=await load();const p=safeLaneFocusTransferCoherencePresentation({incomingFocus:1,outgoingFocus:1,stress:1,critical:true},false,false);assert.equal(p.primaryScale,1);assert.ok(p.secondaryScale<.8);});
test('Phase 4189 specialist transfer keeps silhouette ahead of recovery trail',async()=>{const {specialistFocusTransferCoherencePresentation}=await load();const p=specialistFocusTransferCoherencePresentation({incomingFocus:1,outgoingFocus:1,stress:1,critical:true},false,false);assert.equal(p.primaryScale,1);assert.ok(p.incomingScale>p.outgoingScale);});
test('Phase 4190 focus transfer budget keeps canonical priority and only attenuates secondary',async()=>{const {focusTransferCoherenceBudgetPresentation}=await load();const p=focusTransferCoherenceBudgetPresentation({criticalCount:2,stress:1,incomingFocus:1,outgoingFocus:1},false,false);assert.equal(p.primaryScale,1);assert.ok(p.secondaryScale<.75);});
test('Phase 4185-4190 live renderers consume focus transfer coherence',()=>{const e=fs.readFileSync(new URL('../src/game/enemies.ts',import.meta.url),'utf8'),s=fs.readFileSync(new URL('../src/game/spells.ts',import.meta.url),'utf8'),g=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');assert.match(e,/projectileFocusTransferCoherencePresentation/);assert.match(e,/specialistFocusTransferCoherencePresentation/);assert.match(s,/impactFocusTransferCoherencePresentation/);assert.match(g,/hazardFocusTransferCoherencePresentation/);assert.match(g,/safeLaneFocusTransferCoherencePresentation/);assert.match(e,/projectileFocusTransfer\.secondaryScale/);});
""")
red(t3,'threat-impact-focus-transfer-coherence-rendering')
write(m3, r"""
const clamp01=(value:number)=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));
function cohere(incomingFocus:number,outgoingFocus:number,stress:number,critical:boolean,secondaryMin:number,reducedMotion=false,reducedFlash=false){const incoming=clamp01(incomingFocus),outgoing=clamp01(outgoingFocus),load=clamp01(stress),overlap=Math.min(incoming,outgoing),transfer=clamp01(overlap*(.68+.32*Math.max(incoming,outgoing))),motion=reducedMotion?.97:1,flash=reducedFlash?.97:1;const incomingScale=Math.max(.76,1-transfer*.16),outgoingScale=Math.max(.44,1-transfer*(critical?.4:.48)),secondaryScale=Math.max(secondaryMin,1-transfer*(critical?.3:.42)-load*.14)*motion*flash;return{transfer,incomingScale,outgoingScale,secondaryScale,primaryScale:1,presentationOnly:true as const};}
export function projectileFocusTransferCoherencePresentation(input:{incomingFocus:number;outgoingFocus:number;stress:number;critical:boolean},reducedMotion=false,reducedFlash=false){return cohere(input.incomingFocus,input.outgoingFocus,input.stress,input.critical,.54,reducedMotion,reducedFlash);}
export function impactFocusTransferCoherencePresentation(input:{incomingFocus:number;outgoingFocus:number;stress:number;critical:boolean},reducedMotion=false,reducedFlash=false){return cohere(input.incomingFocus,input.outgoingFocus,input.stress,input.critical,.46,reducedMotion,reducedFlash);}
export function hazardFocusTransferCoherencePresentation(input:{incomingFocus:number;outgoingFocus:number;stress:number;critical:boolean},reducedMotion=false,reducedFlash=false){return cohere(input.incomingFocus,input.outgoingFocus,input.stress,input.critical,.44,reducedMotion,reducedFlash);}
export function safeLaneFocusTransferCoherencePresentation(input:{incomingFocus:number;outgoingFocus:number;stress:number;critical:boolean},reducedMotion=false,reducedFlash=false){return cohere(input.incomingFocus,input.outgoingFocus,input.stress,input.critical,.52,reducedMotion,reducedFlash);}
export function specialistFocusTransferCoherencePresentation(input:{incomingFocus:number;outgoingFocus:number;stress:number;critical:boolean},reducedMotion=false,reducedFlash=false){return cohere(input.incomingFocus,input.outgoingFocus,input.stress,input.critical,.48,reducedMotion,reducedFlash);}
export function focusTransferCoherenceBudgetPresentation(input:{criticalCount:number;stress:number;incomingFocus:number;outgoingFocus:number},reducedMotion=false,reducedFlash=false){const critical=clamp01(Math.max(0,input.criticalCount)/3),stress=clamp01(input.stress),overlap=Math.min(clamp01(input.incomingFocus),clamp01(input.outgoingFocus)),load=clamp01(stress*.7+overlap*.22+critical*.08);return{transfer:overlap,primaryScale:1,secondaryScale:Math.max(.46,1-load*.46)*(reducedMotion?.97:1)*(reducedFlash?.97:1),presentationOnly:true as const};}
""")
insert_import('src/game/enemies.ts',"import { projectileSecondaryRecoveryGatePresentation, secondaryRecoveryGateBudgetPresentation, specialistSecondaryRecoveryGatePresentation } from './threat-impact-secondary-recovery-gate-rendering.js';","import { focusTransferCoherenceBudgetPresentation, projectileFocusTransferCoherencePresentation, specialistFocusTransferCoherencePresentation } from './threat-impact-focus-transfer-coherence-rendering.js';")
insert_import('src/game/spells.ts',"import { impactSecondaryRecoveryGatePresentation, secondaryRecoveryGateBudgetPresentation } from './threat-impact-secondary-recovery-gate-rendering.js';","import { focusTransferCoherenceBudgetPresentation, impactFocusTransferCoherencePresentation } from './threat-impact-focus-transfer-coherence-rendering.js';")
insert_import('src/game/game.ts',"import { hazardSecondaryRecoveryGatePresentation, safeLaneSecondaryRecoveryGatePresentation, secondaryRecoveryGateBudgetPresentation } from './threat-impact-secondary-recovery-gate-rendering.js';","import { focusTransferCoherenceBudgetPresentation, hazardFocusTransferCoherencePresentation, safeLaneFocusTransferCoherencePresentation } from './threat-impact-focus-transfer-coherence-rendering.js';")
insert_after('src/game/enemies.ts','const projectileSecondaryRecoveryGate=',"      const projectileFocusTransfer=projectileFocusTransferCoherencePresentation({incomingFocus:projectileFinalSettle.settle,outgoingFocus:Math.max(projectileBossFocus.focus,projectileLaneProximity),stress:projectileSecondaryRecoveryGateBudget.hold,critical:Boolean(projectile.bossArchetype)},reducedMotion,reducedFlash),projectileFocusTransferBudget=focusTransferCoherenceBudgetPresentation({criticalCount:projectile.bossArchetype?1:0,stress:projectileFinalSettleBudget.stress,incomingFocus:projectileFinalSettle.settle,outgoingFocus:Math.max(projectileBossFocus.focus,projectileLaneProximity)},reducedMotion,reducedFlash);")
insert_after('src/game/enemies.ts','const specialistSecondaryRecoveryGate=',"      const specialistFocusTransfer=specialistFocusTransferCoherencePresentation({incomingFocus:specialistFinalSettle.settle,outgoingFocus:specialistBossFocus.focus,stress:specialistSecondaryRecoveryGateBudget.hold,critical:silhouetteDirection.owner==='special'},reducedMotion,reducedFlash),specialistFocusTransferBudget=focusTransferCoherenceBudgetPresentation({criticalCount:silhouetteDirection.owner==='special'?1:0,stress:specialistFinalSettleBudget.stress,incomingFocus:specialistFinalSettle.settle,outgoingFocus:specialistBossFocus.focus},reducedMotion,reducedFlash);")
insert_after('src/game/spells.ts','const impactSecondaryRecoveryGate=',"        const impactFocusTransfer=impactFocusTransferCoherencePresentation({incomingFocus:impactFinalSettle.settle,outgoingFocus:bossTelegraphOverlap?1:Math.min(1,impactNeighborCount/8),stress:impactSecondaryRecoveryGateBudget.hold,critical:impactCritical},reducedMotion,reducedFlash),impactFocusTransferBudget=focusTransferCoherenceBudgetPresentation({criticalCount:impactCritical?1:0,stress:impactFinalSettleBudget.stress,incomingFocus:impactFinalSettle.settle,outgoingFocus:bossTelegraphOverlap?1:Math.min(1,impactNeighborCount/8)},reducedMotion,reducedFlash);")
insert_after('src/game/game.ts','const hazardSecondaryRecoveryGate=',"      const hazardFocusTransfer=hazardFocusTransferCoherencePresentation({incomingFocus:hazardFinalSettle.settle,outgoingFocus:Math.max(hazard.telegraph>0?1:0,hazardLaneProximity),stress:hazardSecondaryRecoveryGateBudget.hold,critical:hazard.id===primaryTelegraphHazardId},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash),hazardFocusTransferBudget=focusTransferCoherenceBudgetPresentation({criticalCount:hazard.id===primaryTelegraphHazardId?1:0,stress:hazardFinalSettleBudget.stress,incomingFocus:hazardFinalSettle.settle,outgoingFocus:Math.max(hazard.telegraph>0?1:0,hazardLaneProximity)},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);")
insert_after('src/game/game.ts','const safeLaneSecondaryRecoveryGate=',"      const safeLaneFocusTransfer=safeLaneFocusTransferCoherencePresentation({incomingFocus:safeLane.confidence,outgoingFocus:Boolean(boss)?safeLaneDenseBattlefield.stress:0,stress:safeLaneSecondaryRecoveryGateBudget.hold,critical:this.dangerState.coreCritical||this.dangerState.heroCritical},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash),safeLaneFocusTransferBudget=focusTransferCoherenceBudgetPresentation({criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0),stress:safeLaneFinalSettleBudget.stress,incomingFocus:safeLane.confidence,outgoingFocus:Boolean(boss)?safeLaneDenseBattlefield.stress:0},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);")
replace_all('src/game/enemies.ts','*projectileSecondaryRecoveryGateBudget.secondaryScale','*projectileSecondaryRecoveryGateBudget.secondaryScale*projectileFocusTransfer.secondaryScale*projectileFocusTransferBudget.secondaryScale')
replace_all('src/game/enemies.ts','*specialistSecondaryRecoveryGateBudget.secondaryScale','*specialistSecondaryRecoveryGateBudget.secondaryScale*specialistFocusTransfer.secondaryScale*specialistFocusTransferBudget.secondaryScale')
replace_all('src/game/spells.ts','*impactSecondaryRecoveryGateBudget.secondaryScale','*impactSecondaryRecoveryGateBudget.secondaryScale*impactFocusTransfer.secondaryScale*impactFocusTransferBudget.secondaryScale')
replace_all('src/game/game.ts','*hazardSecondaryRecoveryGateBudget.secondaryScale','*hazardSecondaryRecoveryGateBudget.secondaryScale*hazardFocusTransfer.secondaryScale*hazardFocusTransferBudget.secondaryScale')
replace_all('src/game/game.ts','*safeLaneSecondaryRecoveryGateBudget.secondaryScale','*safeLaneSecondaryRecoveryGateBudget.secondaryScale*safeLaneFocusTransfer.secondaryScale*safeLaneFocusTransferBudget.secondaryScale')
commit('Phase 4185-4190 battlefield focus transfer coherence',m3,t3,baseline+[t1,t2])

run('npm run build')
run('node --test '+' '.join(baseline+[t1,t2,t3]))
run('git diff --check')
run(f'git push origin HEAD:{BRANCH}')
print('FAST_TRAINS_COMPLETE')
