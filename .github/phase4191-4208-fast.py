from pathlib import Path
import re
import subprocess

BRANCH='work/phase4191-4208-fast'

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
    key=text.split('=')[0].replace('const ','').strip()
    if key and any(key in line for line in lines): return
    hits=[i for i,line in enumerate(lines) if needle in line and not line.lstrip().startswith('import ')]
    if len(hits)!=1: raise SystemExit(f'{path}: needle {needle!r} hits={len(hits)}')
    lines[hits[0]+1:hits[0]+1]=text.splitlines()
    p.write_text('\n'.join(lines)+'\n')

def append_factor(path, anchor, addition, minimum=1):
    p=Path(path); t=p.read_text()
    if addition.strip('*') in t: return
    pattern=re.compile(r'(\*\s*'+re.escape(anchor)+r')')
    hits=len(pattern.findall(t))
    if hits<minimum: raise SystemExit(f'{path}: anchor {anchor!r} hits={hits}')
    p.write_text(pattern.sub(lambda m:m.group(1)+addition,t))

def red(test_file, module_fragment):
    run('npm run build')
    p=run(f'node --test {test_file}', check=False)
    if p.returncode==0: raise SystemExit(f'RED unexpectedly passed: {test_file}')
    if module_fragment not in p.stdout and 'ERR_MODULE_NOT_FOUND' not in p.stdout and 'Cannot find module' not in p.stdout:
        raise SystemExit(f'RED failed for unexpected reason: {test_file}')
    print(f'RED confirmed: {test_file}')

def commit(msg, module, test_file, related):
    run('npm run build')
    run('node --test '+' '.join(related+[test_file]))
    run('git diff --check')
    run(f'git add src/game/enemies.ts src/game/spells.ts src/game/game.ts {module} {test_file}')
    dist=module.replace('src/','dist/').replace('.ts','.js')
    run(f'git add -f dist/game/enemies.js dist/game/spells.js dist/game/game.js {dist}')
    run(f'git commit -m {msg!r}')
    run(f'git push origin HEAD:{BRANCH}')

run("git config user.name 'github-actions[bot]'")
run("git config user.email '41898282+github-actions[bot]@users.noreply.github.com'")
baseline=[
 'tests/phase4137-4142-canonical-reacquisition.test.mjs',
 'tests/phase4143-4148-direction-reacquisition.test.mjs',
 'tests/phase4149-4154-critical-reengagement.test.mjs',
 'tests/phase4155-4160-effective-alpha-floor.test.mjs',
 'tests/phase4161-4166-secondary-ceiling.test.mjs',
 'tests/phase4167-4172-readability-contrast.test.mjs',
 'tests/phase4173-4178-final-readability-settle.test.mjs',
 'tests/phase4179-4184-secondary-recovery-gate.test.mjs',
 'tests/phase4185-4190-focus-transfer-coherence.test.mjs',
]
run('npm run build')
run('node --test '+' '.join(baseline))

# Train 1 — Phase 4191-4196 Threat Rhythm Stagger
m1='src/game/threat-impact-rhythm-stagger-rendering.ts'
t1='tests/phase4191-4196-threat-rhythm-stagger.test.mjs'
write(t1, r"""
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const moduleUrl=new URL('../dist/game/threat-impact-rhythm-stagger-rendering.js',import.meta.url);
async function load(){return import(moduleUrl.href+'?v='+Date.now()+Math.random());}
test('Phase 4191 projectile secondary peaks separate by deterministic rhythm slot',async()=>{const {projectileThreatRhythmPresentation}=await load();const a=projectileThreatRhythmPresentation({phase:.5,stress:.8,critical:false,slot:0}),b=projectileThreatRhythmPresentation({phase:.5,stress:.8,critical:false,slot:1});assert.equal(a.primaryScale,1);assert.ok(a.secondaryScale>b.secondaryScale+.08);});
test('Phase 4192 impact rhythm keeps critical ownership while fill cadence yields',async()=>{const {impactThreatRhythmPresentation}=await load();const p=impactThreatRhythmPresentation({phase:.75,stress:1,critical:true,slot:2});assert.equal(p.primaryScale,1);assert.ok(p.secondaryScale>=.5&&p.secondaryScale<=1);});
test('Phase 4193 hazard rhythm is bounded under high crowd stress',async()=>{const {hazardThreatRhythmPresentation}=await load();const p=hazardThreatRhythmPresentation({phase:.25,stress:1,critical:false,slot:3},false,true);assert.equal(p.primaryScale,1);assert.ok(p.secondaryScale>=0&&p.secondaryScale<=1);});
test('Phase 4194 safe lane rhythm never attenuates canonical path ownership',async()=>{const {safeLaneThreatRhythmPresentation}=await load();const p=safeLaneThreatRhythmPresentation({phase:.5,stress:1,critical:true,slot:0},false,true);assert.equal(p.primaryScale,1);assert.equal(p.safeLaneScale,1);assert.ok(p.secondaryScale<=1);});
test('Phase 4195 specialist rhythm assignment is deterministic',async()=>{const {specialistThreatRhythmPresentation}=await load();const a=specialistThreatRhythmPresentation({phase:.37,stress:.7,critical:false,slot:13}),b=specialistThreatRhythmPresentation({phase:.37,stress:.7,critical:false,slot:13});assert.deepEqual(a,b);assert.equal(a.primaryScale,1);});
test('Phase 4196 dense rhythm budget caps simultaneous secondary peaks',async()=>{const {threatRhythmBudgetPresentation}=await load();const p=threatRhythmBudgetPresentation({activeCount:12,criticalCount:2,stress:1,safeLaneVisible:true});assert.equal(p.maxConcurrentPeaks,1);assert.equal(p.primaryScale,1);assert.equal(p.safeLaneScale,1);assert.ok(p.secondaryScale<1);});
test('Phase 4191-4196 live renderers consume threat rhythm stagger helpers',()=>{const e=fs.readFileSync(new URL('../src/game/enemies.ts',import.meta.url),'utf8'),s=fs.readFileSync(new URL('../src/game/spells.ts',import.meta.url),'utf8'),g=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');assert.match(e,/projectileThreatRhythmPresentation/);assert.match(e,/specialistThreatRhythmPresentation/);assert.match(s,/impactThreatRhythmPresentation/);assert.match(g,/hazardThreatRhythmPresentation/);assert.match(g,/safeLaneThreatRhythmPresentation/);assert.match(e,/projectileRhythm\.secondaryScale/);assert.match(s,/impactRhythm\.secondaryScale/);});
""")
red(t1,'threat-impact-rhythm-stagger-rendering')
write(m1, r"""
const clamp01=(value:number)=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));
const smooth01=(value:number)=>{const x=clamp01(value);return x*x*(3-2*x);};
const slot4=(value:number)=>((Math.floor(Number.isFinite(value)?value:0)%4)+4)%4;
function rhythm(phase:number,stress:number,critical:boolean,slot:number,normalMin:number,criticalMin:number,reducedMotion=false,reducedFlash=false){const s=slot4(slot),shifted=(clamp01(phase)+s*.25)%1,triangle=1-Math.min(1,Math.abs(shifted-.5)*2),peak=smooth01(triangle),load=clamp01(stress),base=reducedMotion?.72:.54,amplitude=reducedMotion?.14:.42,flash=reducedFlash?.94:1,minimum=critical?criticalMin:normalMin,secondaryScale=clamp01(Math.max(minimum,base+peak*amplitude-load*(critical?.08:.16))*flash);return{slot:s,phase:shifted,peak,primaryScale:1,secondaryScale,presentationOnly:true as const};}
export function projectileThreatRhythmPresentation(input:{phase:number;stress:number;critical:boolean;slot:number},reducedMotion=false,reducedFlash=false){return rhythm(input.phase,input.stress,input.critical,input.slot,.4,.58,reducedMotion,reducedFlash);}
export function impactThreatRhythmPresentation(input:{phase:number;stress:number;critical:boolean;slot:number},reducedMotion=false,reducedFlash=false){return rhythm(input.phase,input.stress,input.critical,input.slot,.36,.54,reducedMotion,reducedFlash);}
export function hazardThreatRhythmPresentation(input:{phase:number;stress:number;critical:boolean;slot:number},reducedMotion=false,reducedFlash=false){return rhythm(input.phase,input.stress,input.critical,input.slot,.38,.56,reducedMotion,reducedFlash);}
export function safeLaneThreatRhythmPresentation(input:{phase:number;stress:number;critical:boolean;slot:number},reducedMotion=false,reducedFlash=false){return{...rhythm(input.phase,input.stress,input.critical,input.slot,.46,.64,reducedMotion,reducedFlash),safeLaneScale:1,presentationOnly:true as const};}
export function specialistThreatRhythmPresentation(input:{phase:number;stress:number;critical:boolean;slot:number},reducedMotion=false,reducedFlash=false){return rhythm(input.phase,input.stress,input.critical,input.slot,.38,.58,reducedMotion,reducedFlash);}
export function threatRhythmBudgetPresentation(input:{activeCount:number;criticalCount:number;stress:number;safeLaneVisible:boolean},reducedMotion=false,reducedFlash=false){const active=Math.max(0,Math.floor(input.activeCount)),load=clamp01(input.stress),critical=clamp01(Math.max(0,input.criticalCount)/3),maxConcurrentPeaks=active>=10?1:active>=5?2:3,secondaryScale=Math.max(.54,1-load*.28-critical*.04)*(reducedMotion?.98:1)*(reducedFlash?.96:1);return{maxConcurrentPeaks,primaryScale:1,secondaryScale:clamp01(secondaryScale),safeLaneScale:1,presentationOnly:true as const};}
""")
insert_import('src/game/enemies.ts',"import { focusTransferCoherenceBudgetPresentation, projectileFocusTransferCoherencePresentation, specialistFocusTransferCoherencePresentation } from './threat-impact-focus-transfer-coherence-rendering.js';","import { projectileThreatRhythmPresentation, specialistThreatRhythmPresentation, threatRhythmBudgetPresentation } from './threat-impact-rhythm-stagger-rendering.js';")
insert_import('src/game/spells.ts',"import { focusTransferCoherenceBudgetPresentation, impactFocusTransferCoherencePresentation } from './threat-impact-focus-transfer-coherence-rendering.js';","import { impactThreatRhythmPresentation, threatRhythmBudgetPresentation } from './threat-impact-rhythm-stagger-rendering.js';")
insert_import('src/game/game.ts',"import { focusTransferCoherenceBudgetPresentation, hazardFocusTransferCoherencePresentation, safeLaneFocusTransferCoherencePresentation } from './threat-impact-focus-transfer-coherence-rendering.js';","import { hazardThreatRhythmPresentation, safeLaneThreatRhythmPresentation, threatRhythmBudgetPresentation } from './threat-impact-rhythm-stagger-rendering.js';")
insert_after('src/game/enemies.ts','const projectileFocusTransfer=',"      const projectileRhythm=projectileThreatRhythmPresentation({phase:Math.max(launchLife,travelLife),stress:projectileFinalSettleBudget.stress,critical:Boolean(projectile.bossArchetype),slot:projectileResolutionRank.get(projectile)??0},reducedMotion,reducedFlash),projectileRhythmBudget=threatRhythmBudgetPresentation({activeCount:this.projectiles.length,criticalCount:projectile.bossArchetype?1:0,stress:projectileFinalSettleBudget.stress,safeLaneVisible:projectileLaneProximity>0},reducedMotion,reducedFlash);")
insert_after('src/game/enemies.ts','const specialistFocusTransfer=',"      const specialistRhythm=specialistThreatRhythmPresentation({phase:specialistFocusTransfer.transfer,stress:specialistFinalSettleBudget.stress,critical:silhouetteDirection.owner==='special',slot:enemy.id},reducedMotion,reducedFlash),specialistRhythmBudget=threatRhythmBudgetPresentation({activeCount:activeSpecialistCount,criticalCount:silhouetteDirection.owner==='special'?1:0,stress:specialistFinalSettleBudget.stress,safeLaneVisible:false},reducedMotion,reducedFlash);")
insert_after('src/game/spells.ts','const impactFocusTransfer=',"        const impactRhythm=impactThreatRhythmPresentation({phase:impactLife,stress:impactFinalSettleBudget.stress,critical:impactCritical,slot:impactResolutionRank.get(impact)??0},reducedMotion,reducedFlash),impactRhythmBudget=threatRhythmBudgetPresentation({activeCount:this.projectileImpactVisuals.length,criticalCount:impactCritical?1:0,stress:impactFinalSettleBudget.stress,safeLaneVisible:false},reducedMotion,reducedFlash);")
insert_after('src/game/game.ts','const safeLaneFocusTransfer=',"      const safeLaneRhythm=safeLaneThreatRhythmPresentation({phase:safeLaneFocusTransfer.transfer,stress:safeLaneFinalSettleBudget.stress,critical:this.dangerState.coreCritical||this.dangerState.heroCritical,slot:0},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash),safeLaneRhythmBudget=threatRhythmBudgetPresentation({activeCount:this.bossArena.hazards.length+this.enemies.activeProjectileCount+1,criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0),stress:safeLaneFinalSettleBudget.stress,safeLaneVisible:true},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);")
insert_after('src/game/game.ts','const hazardFocusTransfer=',"      const hazardRhythm=hazardThreatRhythmPresentation({phase:hazardFocusTransfer.transfer,stress:hazardFinalSettleBudget.stress,critical:hazard.id===primaryTelegraphHazardId,slot:Math.max(0,this.bossArena.hazards.length-1-this.bossArena.hazards.indexOf(hazard))},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash),hazardRhythmBudget=threatRhythmBudgetPresentation({activeCount:this.bossArena.hazards.length,criticalCount:hazard.id===primaryTelegraphHazardId?1:0,stress:hazardFinalSettleBudget.stress,safeLaneVisible:Boolean(safeLane)},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);")
append_factor('src/game/enemies.ts','projectileFocusTransferBudget.secondaryScale','*projectileRhythm.secondaryScale*projectileRhythmBudget.secondaryScale')
append_factor('src/game/enemies.ts','specialistFocusTransferBudget.secondaryScale','*specialistRhythm.secondaryScale*specialistRhythmBudget.secondaryScale')
append_factor('src/game/spells.ts','impactFocusTransferBudget.secondaryScale','*impactRhythm.secondaryScale*impactRhythmBudget.secondaryScale')
append_factor('src/game/game.ts','hazardFocusTransferBudget.secondaryScale','*hazardRhythm.secondaryScale*hazardRhythmBudget.secondaryScale')
append_factor('src/game/game.ts','safeLaneFocusTransferBudget.secondaryScale','*safeLaneRhythm.secondaryScale*safeLaneRhythmBudget.secondaryScale')
commit('feat: add Phase 4191-4196 threat rhythm stagger',m1,t1,baseline)

# Train 2 — Phase 4197-4202 Threat Rhythm Recovery
m2='src/game/threat-impact-rhythm-recovery-rendering.ts'
t2='tests/phase4197-4202-threat-rhythm-recovery.test.mjs'
write(t2, r"""
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const moduleUrl=new URL('../dist/game/threat-impact-rhythm-recovery-rendering.js',import.meta.url);
async function load(){return import(moduleUrl.href+'?v='+Date.now()+Math.random());}
test('Phase 4197 projectile recovery staggers slot return instead of synchronized snapback',async()=>{const {projectileThreatRhythmRecoveryPresentation}=await load();const a=projectileThreatRhythmRecoveryPresentation({release:.55,stress:.8,critical:false,slot:0}),b=projectileThreatRhythmRecoveryPresentation({release:.55,stress:.8,critical:false,slot:3});assert.equal(a.primaryScale,1);assert.ok(a.secondaryScale>b.secondaryScale+.05);});
test('Phase 4198 impact recovery remains bounded during high stress',async()=>{const {impactThreatRhythmRecoveryPresentation}=await load();const p=impactThreatRhythmRecoveryPresentation({release:.35,stress:1,critical:false,slot:2});assert.equal(p.primaryScale,1);assert.ok(p.secondaryScale>=0&&p.secondaryScale<1);});
test('Phase 4199 hazard recovery respects reduced presentation settings',async()=>{const {hazardThreatRhythmRecoveryPresentation}=await load();const p=hazardThreatRhythmRecoveryPresentation({release:.7,stress:.9,critical:true,slot:1},true,true);assert.equal(p.primaryScale,1);assert.ok(p.secondaryScale<=1);});
test('Phase 4200 safe lane recovery never attenuates canonical lane ownership',async()=>{const {safeLaneThreatRhythmRecoveryPresentation}=await load();const p=safeLaneThreatRhythmRecoveryPresentation({release:.5,stress:1,critical:true,slot:0});assert.equal(p.primaryScale,1);assert.equal(p.safeLaneScale,1);});
test('Phase 4201 specialist recovery increases gradually with release',async()=>{const {specialistThreatRhythmRecoveryPresentation}=await load();const early=specialistThreatRhythmRecoveryPresentation({release:.2,stress:.7,critical:false,slot:1}),late=specialistThreatRhythmRecoveryPresentation({release:.9,stress:.7,critical:false,slot:1});assert.ok(late.secondaryScale>early.secondaryScale);});
test('Phase 4202 recovery budget caps simultaneous secondary rebound',async()=>{const {threatRhythmRecoveryBudgetPresentation}=await load();const p=threatRhythmRecoveryBudgetPresentation({activeCount:12,criticalCount:2,stress:1,release:.7,safeLaneVisible:true});assert.equal(p.maxConcurrentRecoveries,1);assert.equal(p.primaryScale,1);assert.equal(p.safeLaneScale,1);assert.ok(p.secondaryScale<1);});
test('Phase 4197-4202 live renderers consume threat rhythm recovery helpers',()=>{const e=fs.readFileSync(new URL('../src/game/enemies.ts',import.meta.url),'utf8'),s=fs.readFileSync(new URL('../src/game/spells.ts',import.meta.url),'utf8'),g=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');assert.match(e,/projectileThreatRhythmRecoveryPresentation/);assert.match(e,/specialistThreatRhythmRecoveryPresentation/);assert.match(s,/impactThreatRhythmRecoveryPresentation/);assert.match(g,/hazardThreatRhythmRecoveryPresentation/);assert.match(g,/safeLaneThreatRhythmRecoveryPresentation/);assert.match(e,/projectileRhythmRecovery\.secondaryScale/);});
""")
red(t2,'threat-impact-rhythm-recovery-rendering')
write(m2, r"""
const clamp01=(value:number)=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));
const smooth01=(value:number)=>{const x=clamp01(value);return x*x*(3-2*x);};
const slot4=(value:number)=>((Math.floor(Number.isFinite(value)?value:0)%4)+4)%4;
function recover(release:number,stress:number,critical:boolean,slot:number,normalMin:number,criticalMin:number,reducedMotion=false,reducedFlash=false){const s=slot4(slot),load=clamp01(stress),delay=Math.min(.38,s*.08+load*.04),normalized=clamp01((clamp01(release)-delay)/Math.max(.001,1-delay)),recovery=smooth01(normalized),minimum=critical?criticalMin:normalMin,motion=reducedMotion?.86:1,flash=reducedFlash?.96:1,secondaryScale=clamp01(Math.max(minimum,minimum+(1-minimum)*recovery*motion-load*(critical?.025:.06))*flash);return{slot:s,delay,recovery,primaryScale:1,secondaryScale,presentationOnly:true as const};}
export function projectileThreatRhythmRecoveryPresentation(input:{release:number;stress:number;critical:boolean;slot:number},reducedMotion=false,reducedFlash=false){return recover(input.release,input.stress,input.critical,input.slot,.42,.6,reducedMotion,reducedFlash);}
export function impactThreatRhythmRecoveryPresentation(input:{release:number;stress:number;critical:boolean;slot:number},reducedMotion=false,reducedFlash=false){return recover(input.release,input.stress,input.critical,input.slot,.38,.56,reducedMotion,reducedFlash);}
export function hazardThreatRhythmRecoveryPresentation(input:{release:number;stress:number;critical:boolean;slot:number},reducedMotion=false,reducedFlash=false){return recover(input.release,input.stress,input.critical,input.slot,.4,.58,reducedMotion,reducedFlash);}
export function safeLaneThreatRhythmRecoveryPresentation(input:{release:number;stress:number;critical:boolean;slot:number},reducedMotion=false,reducedFlash=false){return{...recover(input.release,input.stress,input.critical,input.slot,.48,.66,reducedMotion,reducedFlash),safeLaneScale:1,presentationOnly:true as const};}
export function specialistThreatRhythmRecoveryPresentation(input:{release:number;stress:number;critical:boolean;slot:number},reducedMotion=false,reducedFlash=false){return recover(input.release,input.stress,input.critical,input.slot,.4,.6,reducedMotion,reducedFlash);}
export function threatRhythmRecoveryBudgetPresentation(input:{activeCount:number;criticalCount:number;stress:number;release:number;safeLaneVisible:boolean},reducedMotion=false,reducedFlash=false){const active=Math.max(0,Math.floor(input.activeCount)),load=clamp01(input.stress),release=clamp01(input.release),critical=clamp01(Math.max(0,input.criticalCount)/3),maxConcurrentRecoveries=active>=10?1:active>=5?2:3,secondaryScale=Math.max(.5,.58+release*.34-load*.18-critical*.03)*(reducedMotion?.97:1)*(reducedFlash?.96:1);return{maxConcurrentRecoveries,primaryScale:1,secondaryScale:clamp01(secondaryScale),safeLaneScale:1,presentationOnly:true as const};}
""")
insert_import('src/game/enemies.ts',"import { projectileThreatRhythmPresentation, specialistThreatRhythmPresentation, threatRhythmBudgetPresentation } from './threat-impact-rhythm-stagger-rendering.js';","import { projectileThreatRhythmRecoveryPresentation, specialistThreatRhythmRecoveryPresentation, threatRhythmRecoveryBudgetPresentation } from './threat-impact-rhythm-recovery-rendering.js';")
insert_import('src/game/spells.ts',"import { impactThreatRhythmPresentation, threatRhythmBudgetPresentation } from './threat-impact-rhythm-stagger-rendering.js';","import { impactThreatRhythmRecoveryPresentation, threatRhythmRecoveryBudgetPresentation } from './threat-impact-rhythm-recovery-rendering.js';")
insert_import('src/game/game.ts',"import { hazardThreatRhythmPresentation, safeLaneThreatRhythmPresentation, threatRhythmBudgetPresentation } from './threat-impact-rhythm-stagger-rendering.js';","import { hazardThreatRhythmRecoveryPresentation, safeLaneThreatRhythmRecoveryPresentation, threatRhythmRecoveryBudgetPresentation } from './threat-impact-rhythm-recovery-rendering.js';")
insert_after('src/game/enemies.ts','const projectileRhythm=',"      const projectileRhythmRecovery=projectileThreatRhythmRecoveryPresentation({release:projectileFinalSettle.settle,stress:projectileFinalSettleBudget.stress,critical:Boolean(projectile.bossArchetype),slot:projectileRhythm.slot},reducedMotion,reducedFlash),projectileRhythmRecoveryBudget=threatRhythmRecoveryBudgetPresentation({activeCount:this.projectiles.length,criticalCount:projectile.bossArchetype?1:0,stress:projectileFinalSettleBudget.stress,release:projectileFinalSettle.settle,safeLaneVisible:projectileLaneProximity>0},reducedMotion,reducedFlash);")
insert_after('src/game/enemies.ts','const specialistRhythm=',"      const specialistRhythmRecovery=specialistThreatRhythmRecoveryPresentation({release:specialistFinalSettle.settle,stress:specialistFinalSettleBudget.stress,critical:silhouetteDirection.owner==='special',slot:specialistRhythm.slot},reducedMotion,reducedFlash),specialistRhythmRecoveryBudget=threatRhythmRecoveryBudgetPresentation({activeCount:activeSpecialistCount,criticalCount:silhouetteDirection.owner==='special'?1:0,stress:specialistFinalSettleBudget.stress,release:specialistFinalSettle.settle,safeLaneVisible:false},reducedMotion,reducedFlash);")
insert_after('src/game/spells.ts','const impactRhythm=',"        const impactRhythmRecovery=impactThreatRhythmRecoveryPresentation({release:impactFinalSettle.settle,stress:impactFinalSettleBudget.stress,critical:impactCritical,slot:impactRhythm.slot},reducedMotion,reducedFlash),impactRhythmRecoveryBudget=threatRhythmRecoveryBudgetPresentation({activeCount:this.projectileImpactVisuals.length,criticalCount:impactCritical?1:0,stress:impactFinalSettleBudget.stress,release:impactFinalSettle.settle,safeLaneVisible:false},reducedMotion,reducedFlash);")
insert_after('src/game/game.ts','const safeLaneRhythm=',"      const safeLaneRhythmRecovery=safeLaneThreatRhythmRecoveryPresentation({release:safeLaneFinalSettle.settle,stress:safeLaneFinalSettleBudget.stress,critical:this.dangerState.coreCritical||this.dangerState.heroCritical,slot:safeLaneRhythm.slot},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash),safeLaneRhythmRecoveryBudget=threatRhythmRecoveryBudgetPresentation({activeCount:this.bossArena.hazards.length+this.enemies.activeProjectileCount+1,criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0),stress:safeLaneFinalSettleBudget.stress,release:safeLaneFinalSettle.settle,safeLaneVisible:true},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);")
insert_after('src/game/game.ts','const hazardRhythm=',"      const hazardRhythmRecovery=hazardThreatRhythmRecoveryPresentation({release:hazardFinalSettle.settle,stress:hazardFinalSettleBudget.stress,critical:hazard.id===primaryTelegraphHazardId,slot:hazardRhythm.slot},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash),hazardRhythmRecoveryBudget=threatRhythmRecoveryBudgetPresentation({activeCount:this.bossArena.hazards.length,criticalCount:hazard.id===primaryTelegraphHazardId?1:0,stress:hazardFinalSettleBudget.stress,release:hazardFinalSettle.settle,safeLaneVisible:Boolean(safeLane)},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);")
append_factor('src/game/enemies.ts','projectileRhythmBudget.secondaryScale','*projectileRhythmRecovery.secondaryScale*projectileRhythmRecoveryBudget.secondaryScale')
append_factor('src/game/enemies.ts','specialistRhythmBudget.secondaryScale','*specialistRhythmRecovery.secondaryScale*specialistRhythmRecoveryBudget.secondaryScale')
append_factor('src/game/spells.ts','impactRhythmBudget.secondaryScale','*impactRhythmRecovery.secondaryScale*impactRhythmRecoveryBudget.secondaryScale')
append_factor('src/game/game.ts','hazardRhythmBudget.secondaryScale','*hazardRhythmRecovery.secondaryScale*hazardRhythmRecoveryBudget.secondaryScale')
append_factor('src/game/game.ts','safeLaneRhythmBudget.secondaryScale','*safeLaneRhythmRecovery.secondaryScale*safeLaneRhythmRecoveryBudget.secondaryScale')
commit('feat: add Phase 4197-4202 threat rhythm recovery',m2,t2,baseline+[t1])

# Train 3 — Phase 4203-4208 Dense Threat Rhythm Arbitration
m3='src/game/threat-impact-dense-rhythm-rendering.ts'
t3='tests/phase4203-4208-dense-threat-rhythm.test.mjs'
write(t3, r"""
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const moduleUrl=new URL('../dist/game/threat-impact-dense-rhythm-rendering.js',import.meta.url);
async function load(){return import(moduleUrl.href+'?v='+Date.now()+Math.random());}
test('Phase 4203 dense projectile rhythm admits fewer old secondary peaks',async()=>{const {denseProjectileThreatRhythmPresentation}=await load();const newest=denseProjectileThreatRhythmPresentation({activeCount:12,indexFromNewest:0,phase:.5,stress:1,critical:false}),old=denseProjectileThreatRhythmPresentation({activeCount:12,indexFromNewest:3,phase:.5,stress:1,critical:false});assert.equal(newest.primaryScale,1);assert.ok(newest.secondaryScale>old.secondaryScale);});
test('Phase 4204 dense impact rhythm preserves critical response ownership',async()=>{const {denseImpactThreatRhythmPresentation}=await load();const p=denseImpactThreatRhythmPresentation({activeCount:14,indexFromNewest:3,phase:.5,stress:1,critical:true});assert.equal(p.primaryScale,1);assert.ok(p.secondaryScale>=.48&&p.secondaryScale<=1);});
test('Phase 4205 dense hazard rhythm bounds secondary material under pressure',async()=>{const {denseHazardThreatRhythmPresentation}=await load();const p=denseHazardThreatRhythmPresentation({activeCount:16,indexFromNewest:5,phase:.3,stress:1,critical:false},false,true);assert.equal(p.primaryScale,1);assert.ok(p.secondaryScale<1);});
test('Phase 4206 dense safe lane rhythm preserves canonical path scale',async()=>{const {denseSafeLaneThreatRhythmPresentation}=await load();const p=denseSafeLaneThreatRhythmPresentation({activeCount:15,indexFromNewest:0,phase:.5,stress:1,critical:true});assert.equal(p.primaryScale,1);assert.equal(p.safeLaneScale,1);});
test('Phase 4207 dense specialist rhythm is deterministic for a stable rank',async()=>{const {denseSpecialistThreatRhythmPresentation}=await load();const a=denseSpecialistThreatRhythmPresentation({activeCount:11,indexFromNewest:7,phase:.4,stress:.8,critical:false}),b=denseSpecialistThreatRhythmPresentation({activeCount:11,indexFromNewest:7,phase:.4,stress:.8,critical:false});assert.deepEqual(a,b);});
test('Phase 4208 unified dense cadence budget exposes one peak at extreme density',async()=>{const {denseThreatRhythmBudgetPresentation}=await load();const p=denseThreatRhythmBudgetPresentation({activeCount:16,criticalCount:2,stress:1,safeLaneVisible:true});assert.equal(p.maxConcurrentPeaks,1);assert.equal(p.primaryScale,1);assert.equal(p.safeLaneScale,1);assert.ok(p.secondaryScale<1);});
test('Phase 4203-4208 live renderers consume dense threat rhythm helpers',()=>{const e=fs.readFileSync(new URL('../src/game/enemies.ts',import.meta.url),'utf8'),s=fs.readFileSync(new URL('../src/game/spells.ts',import.meta.url),'utf8'),g=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');assert.match(e,/denseProjectileThreatRhythmPresentation/);assert.match(e,/denseSpecialistThreatRhythmPresentation/);assert.match(s,/denseImpactThreatRhythmPresentation/);assert.match(g,/denseHazardThreatRhythmPresentation/);assert.match(g,/denseSafeLaneThreatRhythmPresentation/);assert.match(e,/projectileDenseRhythm\.secondaryScale/);});
""")
red(t3,'threat-impact-dense-rhythm-rendering')
write(m3, r"""
const clamp01=(value:number)=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));
const slot4=(value:number)=>((Math.floor(Number.isFinite(value)?value:0)%4)+4)%4;
function dense(input:{activeCount:number;indexFromNewest:number;phase:number;stress:number;critical:boolean},normalMin:number,criticalMin:number,reducedMotion=false,reducedFlash=false){const active=Math.max(1,Math.floor(input.activeCount)),rank=Math.max(0,Math.floor(input.indexFromNewest)),slot=slot4(rank),openSlots=active>=10?1:active>=5?2:3,admitted=slot<openSlots,load=clamp01(input.stress),phase=clamp01(input.phase),ageScale=Math.max(.68,1-Math.min(1,rank/Math.max(1,active-1))*.28),base=admitted?.9-load*.1:(input.critical?.66:.46)-load*.08,phaseScale=.9+.1*(1-Math.abs(phase-.5)*2),motion=reducedMotion?.97:1,flash=reducedFlash?.95:1,minimum=input.critical?criticalMin:normalMin,secondaryScale=clamp01(Math.max(minimum,base*ageScale*phaseScale)*motion*flash);return{slot,openSlots,admitted,primaryScale:1,secondaryScale,presentationOnly:true as const};}
export function denseProjectileThreatRhythmPresentation(input:{activeCount:number;indexFromNewest:number;phase:number;stress:number;critical:boolean},reducedMotion=false,reducedFlash=false){return dense(input,.34,.5,reducedMotion,reducedFlash);}
export function denseImpactThreatRhythmPresentation(input:{activeCount:number;indexFromNewest:number;phase:number;stress:number;critical:boolean},reducedMotion=false,reducedFlash=false){return dense(input,.32,.5,reducedMotion,reducedFlash);}
export function denseHazardThreatRhythmPresentation(input:{activeCount:number;indexFromNewest:number;phase:number;stress:number;critical:boolean},reducedMotion=false,reducedFlash=false){return dense(input,.34,.52,reducedMotion,reducedFlash);}
export function denseSafeLaneThreatRhythmPresentation(input:{activeCount:number;indexFromNewest:number;phase:number;stress:number;critical:boolean},reducedMotion=false,reducedFlash=false){return{...dense(input,.42,.62,reducedMotion,reducedFlash),safeLaneScale:1,presentationOnly:true as const};}
export function denseSpecialistThreatRhythmPresentation(input:{activeCount:number;indexFromNewest:number;phase:number;stress:number;critical:boolean},reducedMotion=false,reducedFlash=false){return dense(input,.34,.54,reducedMotion,reducedFlash);}
export function denseThreatRhythmBudgetPresentation(input:{activeCount:number;criticalCount:number;stress:number;safeLaneVisible:boolean},reducedMotion=false,reducedFlash=false){const active=Math.max(0,Math.floor(input.activeCount)),load=clamp01(input.stress),critical=clamp01(Math.max(0,input.criticalCount)/3),maxConcurrentPeaks=active>=10?1:active>=5?2:3,secondaryScale=Math.max(.46,1-load*.34-critical*.04)*(reducedMotion?.97:1)*(reducedFlash?.95:1);return{maxConcurrentPeaks,primaryScale:1,secondaryScale:clamp01(secondaryScale),safeLaneScale:1,presentationOnly:true as const};}
""")
insert_import('src/game/enemies.ts',"import { projectileThreatRhythmRecoveryPresentation, specialistThreatRhythmRecoveryPresentation, threatRhythmRecoveryBudgetPresentation } from './threat-impact-rhythm-recovery-rendering.js';","import { denseProjectileThreatRhythmPresentation, denseSpecialistThreatRhythmPresentation, denseThreatRhythmBudgetPresentation } from './threat-impact-dense-rhythm-rendering.js';")
insert_import('src/game/spells.ts',"import { impactThreatRhythmRecoveryPresentation, threatRhythmRecoveryBudgetPresentation } from './threat-impact-rhythm-recovery-rendering.js';","import { denseImpactThreatRhythmPresentation, denseThreatRhythmBudgetPresentation } from './threat-impact-dense-rhythm-rendering.js';")
insert_import('src/game/game.ts',"import { hazardThreatRhythmRecoveryPresentation, safeLaneThreatRhythmRecoveryPresentation, threatRhythmRecoveryBudgetPresentation } from './threat-impact-rhythm-recovery-rendering.js';","import { denseHazardThreatRhythmPresentation, denseSafeLaneThreatRhythmPresentation, denseThreatRhythmBudgetPresentation } from './threat-impact-dense-rhythm-rendering.js';")
insert_after('src/game/enemies.ts','const projectileRhythmRecovery=',"      const projectileDenseRhythm=denseProjectileThreatRhythmPresentation({activeCount:this.projectiles.length,indexFromNewest:projectileResolutionRank.get(projectile)??0,phase:Math.max(launchLife,travelLife),stress:projectileFinalSettleBudget.stress,critical:Boolean(projectile.bossArchetype)},reducedMotion,reducedFlash),projectileDenseRhythmBudget=denseThreatRhythmBudgetPresentation({activeCount:this.projectiles.length,criticalCount:projectile.bossArchetype?1:0,stress:projectileFinalSettleBudget.stress,safeLaneVisible:projectileLaneProximity>0},reducedMotion,reducedFlash);")
insert_after('src/game/enemies.ts','const specialistRhythmRecovery=',"      const specialistDenseRhythm=denseSpecialistThreatRhythmPresentation({activeCount:activeSpecialistCount,indexFromNewest:enemy.id,phase:specialistFocusTransfer.transfer,stress:specialistFinalSettleBudget.stress,critical:silhouetteDirection.owner==='special'},reducedMotion,reducedFlash),specialistDenseRhythmBudget=denseThreatRhythmBudgetPresentation({activeCount:activeSpecialistCount,criticalCount:silhouetteDirection.owner==='special'?1:0,stress:specialistFinalSettleBudget.stress,safeLaneVisible:false},reducedMotion,reducedFlash);")
insert_after('src/game/spells.ts','const impactRhythmRecovery=',"        const impactDenseRhythm=denseImpactThreatRhythmPresentation({activeCount:this.projectileImpactVisuals.length,indexFromNewest:impactResolutionRank.get(impact)??0,phase:impactLife,stress:impactFinalSettleBudget.stress,critical:impactCritical},reducedMotion,reducedFlash),impactDenseRhythmBudget=denseThreatRhythmBudgetPresentation({activeCount:this.projectileImpactVisuals.length,criticalCount:impactCritical?1:0,stress:impactFinalSettleBudget.stress,safeLaneVisible:false},reducedMotion,reducedFlash);")
insert_after('src/game/game.ts','const safeLaneRhythmRecovery=',"      const safeLaneDenseRhythm=denseSafeLaneThreatRhythmPresentation({activeCount:this.bossArena.hazards.length+this.enemies.activeProjectileCount+1,indexFromNewest:0,phase:safeLaneFocusTransfer.transfer,stress:safeLaneFinalSettleBudget.stress,critical:this.dangerState.coreCritical||this.dangerState.heroCritical},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash),safeLaneDenseRhythmBudget=denseThreatRhythmBudgetPresentation({activeCount:this.bossArena.hazards.length+this.enemies.activeProjectileCount+1,criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0),stress:safeLaneFinalSettleBudget.stress,safeLaneVisible:true},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);")
insert_after('src/game/game.ts','const hazardRhythmRecovery=',"      const hazardDenseRhythm=denseHazardThreatRhythmPresentation({activeCount:this.bossArena.hazards.length,indexFromNewest:Math.max(0,this.bossArena.hazards.length-1-this.bossArena.hazards.indexOf(hazard)),phase:hazardFocusTransfer.transfer,stress:hazardFinalSettleBudget.stress,critical:hazard.id===primaryTelegraphHazardId},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash),hazardDenseRhythmBudget=denseThreatRhythmBudgetPresentation({activeCount:this.bossArena.hazards.length,criticalCount:hazard.id===primaryTelegraphHazardId?1:0,stress:hazardFinalSettleBudget.stress,safeLaneVisible:Boolean(safeLane)},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);")
append_factor('src/game/enemies.ts','projectileRhythmRecoveryBudget.secondaryScale','*projectileDenseRhythm.secondaryScale*projectileDenseRhythmBudget.secondaryScale')
append_factor('src/game/enemies.ts','specialistRhythmRecoveryBudget.secondaryScale','*specialistDenseRhythm.secondaryScale*specialistDenseRhythmBudget.secondaryScale')
append_factor('src/game/spells.ts','impactRhythmRecoveryBudget.secondaryScale','*impactDenseRhythm.secondaryScale*impactDenseRhythmBudget.secondaryScale')
append_factor('src/game/game.ts','hazardRhythmRecoveryBudget.secondaryScale','*hazardDenseRhythm.secondaryScale*hazardDenseRhythmBudget.secondaryScale')
append_factor('src/game/game.ts','safeLaneRhythmRecoveryBudget.secondaryScale','*safeLaneDenseRhythm.secondaryScale*safeLaneDenseRhythmBudget.secondaryScale')
commit('feat: add Phase 4203-4208 dense threat rhythm arbitration',m3,t3,baseline+[t1,t2])

print('\nFAST_TRAINS_COMPLETE', flush=True)
