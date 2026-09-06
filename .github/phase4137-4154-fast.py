from pathlib import Path
import subprocess, sys

ROOT=Path(".")
def run(cmd, check=True):
    print(f"\n$ {cmd}", flush=True)
    p=subprocess.run(cmd, shell=True, text=True, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    print(p.stdout, end="")
    if check and p.returncode!=0:
        raise SystemExit(p.returncode)
    return p

def write(path, content):
    p=Path(path); p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(content.strip()+"\n")

def insert_import(path, marker, line):
    p=Path(path); t=p.read_text()
    if line in t: return
    if marker not in t: raise SystemExit(f"missing import marker {path}")
    p.write_text(t.replace(marker, marker+"\n"+line, 1))

def insert_after(path, needle, text):
    p=Path(path); lines=p.read_text().splitlines()
    if any(text.split("=")[0].strip() in line for line in lines):
        return
    hits=[i for i,line in enumerate(lines) if needle in line]
    if len(hits)!=1: raise SystemExit(f"{path}: {needle} hits={len(hits)}")
    lines[hits[0]+1:hits[0]+1]=text.splitlines()
    p.write_text("\n".join(lines)+"\n")

def replace_all(path, old, new, atleast=1):
    p=Path(path); t=p.read_text(); count=t.count(old)
    if count<atleast: raise SystemExit(f"{path}: replacement not found: {old[:90]} count={count}")
    p.write_text(t.replace(old,new))
    return count

def commit(msg, src_module, test_file):
    run("npm run build")
    run(f"node --test {test_file} tests/phase4119-4124-depth-plane-separation.test.mjs tests/phase4125-4130-depth-plane-reentry.test.mjs tests/phase4131-4136-boss-focus-corridor.test.mjs")
    run("git diff --check")
    run(f"git add src/game/enemies.ts src/game/spells.ts src/game/game.ts {src_module} {test_file}")
    dist_module=src_module.replace("src/","dist/").replace(".ts",".js")
    run(f"git add -f dist/game/enemies.js dist/game/spells.js dist/game/game.js {dist_module}")
    run(f"git commit -m {msg!r}")

def red(test_file, module_fragment):
    run("npm run build")
    p=run(f"node --test {test_file}", check=False)
    if p.returncode==0:
        raise SystemExit(f"RED unexpectedly passed: {test_file}")
    if module_fragment not in p.stdout and "ERR_MODULE_NOT_FOUND" not in p.stdout and "Cannot find module" not in p.stdout:
        raise SystemExit(f"RED failed for unexpected reason: {test_file}")

run("npm run build")
run("node --test tests/phase4119-4124-depth-plane-separation.test.mjs tests/phase4125-4130-depth-plane-reentry.test.mjs tests/phase4131-4136-boss-focus-corridor.test.mjs")

# ---------------- Train 1: Phase 4137-4142 canonical reacquisition ----------------
test1="tests/phase4137-4142-canonical-reacquisition.test.mjs"
write(test1, r"""
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const moduleUrl=new URL('../dist/game/threat-impact-canonical-reacquisition-rendering.js',import.meta.url);
async function load(){return import(moduleUrl.href+'?v='+Date.now());}
test('Phase 4137 projectile canonical body reacquires before stale trail',async()=>{const {projectileCanonicalReacquisitionPresentation}=await load();const p=projectileCanonicalReacquisitionPresentation({release:.15,pressure:1,critical:false},false);assert.equal(p.bodyScale,1);assert.ok(p.trailScale<.8);assert.ok(p.directionScale>=.72);});
test('Phase 4138 impact reacquisition restores edge before fill',async()=>{const {impactCanonicalReacquisitionPresentation}=await load();const p=impactCanonicalReacquisitionPresentation({release:.2,pressure:1,critical:false},false);assert.ok(p.edgeAlphaScale>=p.fillAlphaScale);assert.ok(p.edgeAlphaScale>=.78);});
test('Phase 4139 hazard telegraph reacquisition preserves the danger boundary',async()=>{const {hazardCanonicalReacquisitionPresentation}=await load();const p=hazardCanonicalReacquisitionPresentation({telegraph:true,release:.15,pressure:1,critical:true},false);assert.ok(p.edgeAlphaScale>=.95);assert.ok(p.fillScale<1);});
test('Phase 4140 safe lane reacquisition keeps an escape path floor',async()=>{const {safeLaneCanonicalReacquisitionPresentation}=await load();const p=safeLaneCanonicalReacquisitionPresentation({visible:true,confidence:.9,release:.2,pressure:1},false);assert.ok(p.pathAlphaFloor>=.93);assert.ok(p.safeLaneScale>=1);});
test('Phase 4141 specialist reacquisition retires recovery trail before facing',async()=>{const {specialistCanonicalReacquisitionPresentation}=await load();const p=specialistCanonicalReacquisitionPresentation({owner:'attack',release:.2,pressure:1,critical:false},false);assert.equal(p.bodyScale,1);assert.ok(p.recoveryTrailScale<1);assert.ok(p.facingScale>=.86);});
test('Phase 4142 canonical reacquisition budget never dims canonical owners',async()=>{const {canonicalReacquisitionBudgetPresentation}=await load();const p=canonicalReacquisitionBudgetPresentation({criticalCount:2,projectileCount:12,impactCount:8,hazardCount:5,silhouetteCount:4,safeLaneVisible:true},false,false);assert.equal(p.canonicalScale,1);assert.equal(p.criticalEdgeScale,1);assert.ok(p.staleDecorationScale<1);assert.ok(p.safeLaneScale>=1);});
test('Phase 4137-4142 live renderers consume canonical reacquisition helpers',()=>{const e=fs.readFileSync(new URL('../src/game/enemies.ts',import.meta.url),'utf8'),s=fs.readFileSync(new URL('../src/game/spells.ts',import.meta.url),'utf8'),g=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');assert.match(e,/projectileCanonicalReacquisitionPresentation/);assert.match(e,/specialistCanonicalReacquisitionPresentation/);assert.match(s,/impactCanonicalReacquisitionPresentation/);assert.match(g,/hazardCanonicalReacquisitionPresentation/);assert.match(g,/safeLaneCanonicalReacquisitionPresentation/);});
""")
red(test1, "threat-impact-canonical-reacquisition-rendering")

mod1="src/game/threat-impact-canonical-reacquisition-rendering.ts"
write(mod1, r"""
const clamp01=(value:number)=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));
export function projectileCanonicalReacquisitionPresentation(input:{release:number;pressure:number;critical:boolean},reducedMotion=false){const release=clamp01(input.release),pressure=clamp01(input.pressure),reacquire=clamp01(release*(1-pressure*.18)+(input.critical?.12:0));return{reacquire,bodyScale:1,trailScale:Math.max(input.critical?.82:.56,.56+.44*reacquire)*(reducedMotion?.96:1),directionScale:Math.max(input.critical?.9:.72,.72+.28*reacquire),presentationOnly:true as const};}
export function impactCanonicalReacquisitionPresentation(input:{release:number;pressure:number;critical:boolean},reducedFlash=false){const release=clamp01(input.release),pressure=clamp01(input.pressure),reacquire=clamp01(release*(1-pressure*.16)+(input.critical?.1:0)),flash=reducedFlash?.9:1,fillAlphaScale=((input.critical?.58:.34)+(input.critical?.42:.66)*reacquire)*flash,edgeAlphaScale=Math.max(fillAlphaScale,input.critical?.9:.78,.76+.24*reacquire);return{reacquire,fillAlphaScale,edgeAlphaScale,fillScale:(input.critical?.7:.48)+(input.critical?.3:.5)*reacquire,edgeScale:.82+.18*reacquire,presentationOnly:true as const};}
export function hazardCanonicalReacquisitionPresentation(input:{telegraph:boolean;release:number;pressure:number;critical:boolean},reducedFlash=false){const release=clamp01(input.release),pressure=clamp01(input.pressure),reacquire=clamp01(release*(1-pressure*.2)+(input.critical?.08:0)),flash=reducedFlash?.9:1;return{reacquire,fillScale:.48+.46*reacquire,fillAlphaScale:(.28+.62*reacquire)*flash,edgeAlphaScale:input.telegraph?Math.max(input.critical?.95:.93,.99*(reducedFlash?.98:1)):.72+.26*reacquire,presentationOnly:true as const};}
export function safeLaneCanonicalReacquisitionPresentation(input:{visible:boolean;confidence:number;release:number;pressure:number},reducedFlash=false){const confidence=clamp01(input.confidence),release=clamp01(input.release),pressure=clamp01(input.pressure),hold=clamp01(pressure*(1-release));return{pathAlphaFloor:input.visible?Math.max(.93,.91+confidence*.06):0,safeLaneScale:input.visible?1+hold*(.06+.04*confidence)*(reducedFlash?.78:1):1,staleContourScale:input.visible?Math.max(.72,1-hold*.2):1,presentationOnly:true as const};}
export function specialistCanonicalReacquisitionPresentation(input:{owner:'locomotion'|'attack'|'recovery'|'hit'|'special';release:number;pressure:number;critical:boolean},reducedMotion=false){const release=clamp01(input.release),pressure=clamp01(input.pressure),reacquire=clamp01(release*(1-pressure*.16)),action=input.owner==='special'?1:input.owner==='attack'?.9:input.owner==='hit'?.72:input.owner==='recovery'?.5:.2;return{reacquire,bodyScale:1,facingScale:Math.max(input.critical?.9:.76,.8+action*.16-pressure*.08),recoveryTrailScale:Math.max(input.critical?.72:.54,((input.owner==='attack'||input.owner==='special') ? .58 : .7)+reacquire*.3)*(reducedMotion?.95:1),presentationOnly:true as const};}
export function canonicalReacquisitionBudgetPresentation(input:{criticalCount:number;projectileCount:number;impactCount:number;hazardCount:number;silhouetteCount:number;safeLaneVisible:boolean},reducedMotion=false,reducedFlash=false){const critical=clamp01(Math.max(0,input.criticalCount)/3),load=clamp01((input.projectileCount+input.impactCount+input.hazardCount*1.35+input.silhouetteCount)/30),stress=clamp01(load*.84+critical*.18);return{stress,canonicalScale:1,criticalEdgeScale:1,safeLaneScale:input.safeLaneVisible?1+stress*.06*(reducedFlash?.78:1):1,staleDecorationScale:Math.max(.5,1-stress*.42)*(reducedMotion?.96:1)*(reducedFlash?.94:1),presentationOnly:true as const};}
""")

insert_import("src/game/enemies.ts",
"import { bossFocusCorridorBudgetPresentation, bossProjectileFocusCorridorPresentation, bossSpecialistFocusCorridorPresentation } from './threat-impact-boss-focus-corridor-rendering.js';",
"import { canonicalReacquisitionBudgetPresentation, projectileCanonicalReacquisitionPresentation, specialistCanonicalReacquisitionPresentation } from './threat-impact-canonical-reacquisition-rendering.js';")
insert_import("src/game/spells.ts",
"import { bossFocusCorridorBudgetPresentation, bossImpactFocusCorridorPresentation } from './threat-impact-boss-focus-corridor-rendering.js';",
"import { canonicalReacquisitionBudgetPresentation, impactCanonicalReacquisitionPresentation } from './threat-impact-canonical-reacquisition-rendering.js';")
insert_import("src/game/game.ts",
"import { bossFocusCorridorBudgetPresentation, bossSafeLaneFocusCorridorPresentation, bossTelegraphFocusCorridorPresentation } from './threat-impact-boss-focus-corridor-rendering.js';",
"import { canonicalReacquisitionBudgetPresentation, hazardCanonicalReacquisitionPresentation, safeLaneCanonicalReacquisitionPresentation } from './threat-impact-canonical-reacquisition-rendering.js';")

insert_after("src/game/enemies.ts","const projectileBossFocus=",
"      const projectileCanonicalReacquisition=projectileCanonicalReacquisitionPresentation({release:projectileDepthReentry.reclaim,pressure:Math.max(projectileDepthPlane.pressure,projectileBossFocus.focus),critical:Boolean(projectile.bossArchetype)},reducedMotion),projectileCanonicalReacquisitionBudget=canonicalReacquisitionBudgetPresentation({criticalCount:projectile.bossArchetype?1:0,projectileCount:this.projectiles.length,impactCount:0,hazardCount:0,silhouetteCount:0,safeLaneVisible:projectileLaneProximity>0},reducedMotion,reducedFlash);")
insert_after("src/game/enemies.ts","const specialistBossProximity=",
"      const specialistCanonicalReacquisition=specialistCanonicalReacquisitionPresentation({owner:silhouetteDirection.owner,release:specialistDepthReentry.reclaim,pressure:Math.max(specialistDepthPlane.pressure,specialistBossFocus.focus),critical:silhouetteDirection.owner==='special'},reducedMotion),specialistCanonicalReacquisitionBudget=canonicalReacquisitionBudgetPresentation({criticalCount:silhouetteDirection.owner==='special'?1:0,projectileCount:this.projectiles.length,impactCount:0,hazardCount:Math.round(hazardPressure*4),silhouetteCount:activeSpecialistCount,safeLaneVisible:false},reducedMotion,reducedFlash);")
replace_all("src/game/enemies.ts",
"*projectileBossFocus.trailScale*projectileBossFocusBudget.secondaryScale",
"*projectileBossFocus.trailScale*projectileBossFocusBudget.secondaryScale*projectileCanonicalReacquisition.trailScale*projectileCanonicalReacquisitionBudget.staleDecorationScale")
replace_all("src/game/enemies.ts",
"*projectileBossFocus.bodyScale*projectileBossFocusBudget.canonicalScale",
"*projectileBossFocus.bodyScale*projectileBossFocusBudget.canonicalScale*projectileCanonicalReacquisition.bodyScale*projectileCanonicalReacquisitionBudget.canonicalScale")
replace_all("src/game/enemies.ts",
"*specialistBossFocus.directionScale*specialistBossFocusBudget.secondaryScale;",
"*specialistBossFocus.directionScale*specialistBossFocusBudget.secondaryScale*specialistCanonicalReacquisition.facingScale*specialistCanonicalReacquisitionBudget.canonicalScale;")
replace_all("src/game/enemies.ts",
"*specialistBossFocus.secondaryScale*specialistBossFocusBudget.secondaryScale;",
"*specialistBossFocus.secondaryScale*specialistBossFocusBudget.secondaryScale*specialistCanonicalReacquisition.recoveryTrailScale*specialistCanonicalReacquisitionBudget.staleDecorationScale;")

insert_after("src/game/spells.ts","const bossImpactFocus=",
"        const impactCanonicalReacquisition=impactCanonicalReacquisitionPresentation({release:impactDepthReentry.reclaim,pressure:Math.max(impactDepthPlane.pressure,bossImpactFocus.focus),critical:impactCritical},reducedFlash),impactCanonicalReacquisitionBudget=canonicalReacquisitionBudgetPresentation({criticalCount:impactCritical?1:0,projectileCount:this.projectiles.length,impactCount:this.projectileImpactVisuals.length,hazardCount:this.fields.length+this.holes.length,silhouetteCount:0,safeLaneVisible:false},reducedMotion,reducedFlash);")
replace_all("src/game/spells.ts",
"*impactDenseArbitration.fillAlphaScale*impactDenseBattlefield.secondaryAlphaScale;",
"*impactDenseArbitration.fillAlphaScale*impactDenseBattlefield.secondaryAlphaScale*impactCanonicalReacquisition.fillAlphaScale*impactCanonicalReacquisitionBudget.staleDecorationScale;")
replace_all("src/game/spells.ts",
"*bossImpactFocus.edgeAlphaScale;",
"*bossImpactFocus.edgeAlphaScale*impactCanonicalReacquisition.edgeAlphaScale*impactCanonicalReacquisitionBudget.criticalEdgeScale;")

insert_after("src/game/game.ts","const safeLaneBossFocus=",
"      const safeLaneCanonicalReacquisition=safeLaneCanonicalReacquisitionPresentation({visible:true,confidence:safeLane.confidence,release:safeLaneReclaim.release,pressure:safeLaneDenseBattlefield.stress},this.presentationSettings.reducedFlash),safeLaneCanonicalReacquisitionBudget=canonicalReacquisitionBudgetPresentation({criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0),projectileCount:this.enemies.activeProjectileCount,impactCount:0,hazardCount:this.bossArena.hazards.length,silhouetteCount:0,safeLaneVisible:true},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);")
insert_after("src/game/game.ts","const hazardBossFocus=",
"      const hazardCanonicalReacquisition=hazardCanonicalReacquisitionPresentation({telegraph:hazard.telegraph>0,release:hazardDepthReentry.reclaim,pressure:Math.max(hazardDepthPlane.pressure,hazardBossFocus.focus),critical:hazard.id===primaryTelegraphHazardId},this.presentationSettings.reducedFlash),hazardCanonicalReacquisitionBudget=canonicalReacquisitionBudgetPresentation({criticalCount:hazard.id===primaryTelegraphHazardId?1:0,projectileCount:this.enemies.activeProjectileCount,impactCount:0,hazardCount:this.bossArena.hazards.length,silhouetteCount:0,safeLaneVisible:Boolean(safeLane)},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);")
replace_all("src/game/game.ts",
"*safeLaneBossFocus.safeLaneScale*safeLaneBossFocusBudget.safeLaneScale;",
"*safeLaneBossFocus.safeLaneScale*safeLaneBossFocusBudget.safeLaneScale*safeLaneCanonicalReacquisition.safeLaneScale*safeLaneCanonicalReacquisitionBudget.safeLaneScale;")
replace_all("src/game/game.ts",
"Math.max(safeLaneHazardRecovery.pathAlphaScale,safeLaneStackProtection.pathAlphaFloor,safeLaneCorridorProtection.pathAlphaFloor,safeLaneDenseArbitration.pathAlphaFloor)",
"Math.max(safeLaneHazardRecovery.pathAlphaScale,safeLaneStackProtection.pathAlphaFloor,safeLaneCorridorProtection.pathAlphaFloor,safeLaneDenseArbitration.pathAlphaFloor,safeLaneCanonicalReacquisition.pathAlphaFloor)")
replace_all("src/game/game.ts",
"*hazardBossFocus.secondaryScale*hazardBossFocusBudget.secondaryScale",
"*hazardBossFocus.secondaryScale*hazardBossFocusBudget.secondaryScale*hazardCanonicalReacquisition.fillAlphaScale*hazardCanonicalReacquisitionBudget.staleDecorationScale")
replace_all("src/game/game.ts",
"*hazardBossFocus.edgeAlphaScale*hazardBossFocusBudget.telegraphEdgeScale;",
"*hazardBossFocus.edgeAlphaScale*hazardBossFocusBudget.telegraphEdgeScale*hazardCanonicalReacquisition.edgeAlphaScale*hazardCanonicalReacquisitionBudget.criticalEdgeScale;")
commit("Phase 4137-4142 canonical threat reacquisition", mod1, test1)

# ---------------- Train 2: Phase 4143-4148 direction reacquisition ----------------
test2="tests/phase4143-4148-direction-reacquisition.test.mjs"
write(test2, r"""
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const moduleUrl=new URL('../dist/game/threat-impact-direction-reacquisition-rendering.js',import.meta.url);
async function load(){return import(moduleUrl.href+'?v='+Date.now());}
test('Phase 4143 projectile direction reacquires before stale direction tail',async()=>{const {projectileDirectionReacquisitionPresentation}=await load();const p=projectileDirectionReacquisitionPresentation({reacquire:.2,pressure:1,critical:false},false);assert.ok(p.primaryDirectionScale>=.74);assert.ok(p.staleDirectionScale<p.primaryDirectionScale);});
test('Phase 4144 impact response direction remains legible during reacquisition',async()=>{const {impactDirectionReacquisitionPresentation}=await load();const p=impactDirectionReacquisitionPresentation({reacquire:.2,responseStrength:.9,pressure:1,critical:true},false);assert.ok(p.directionAlphaScale>=.82);assert.ok(p.responseScale>=p.staleDirectionScale);});
test('Phase 4145 hazard boundary direction outranks stale interior direction',async()=>{const {hazardBoundaryDirectionReacquisitionPresentation}=await load();const p=hazardBoundaryDirectionReacquisitionPresentation({reacquire:.2,telegraph:true,laneProximity:.8,pressure:1},false);assert.ok(p.edgeDirectionScale>=.9);assert.ok(p.staleFillDirectionScale<1);});
test('Phase 4146 safe lane direction keeps a readable path floor',async()=>{const {safeLaneDirectionReacquisitionPresentation}=await load();const p=safeLaneDirectionReacquisitionPresentation({visible:true,confidence:.9,reacquire:.2,pressure:1},false);assert.ok(p.pathAlphaFloor>=.93);assert.ok(p.pathDirectionScale>=1);});
test('Phase 4147 specialist facing reacquires before recovery trail direction',async()=>{const {specialistFacingReacquisitionPresentation}=await load();const p=specialistFacingReacquisitionPresentation({owner:'attack',reacquire:.2,pressure:1,critical:false},false);assert.ok(p.facingScale>=.82);assert.ok(p.trailDirectionScale<p.facingScale);});
test('Phase 4148 direction reacquisition budget preserves the primary direction owner',async()=>{const {directionReacquisitionBudgetPresentation}=await load();const p=directionReacquisitionBudgetPresentation({criticalCount:2,projectileCount:12,impactCount:8,hazardCount:5,silhouetteCount:4,safeLaneVisible:true},false,false);assert.equal(p.primaryDirectionScale,1);assert.equal(p.canonicalScale,1);assert.ok(p.staleDirectionScale<1);});
test('Phase 4143-4148 live renderers consume direction reacquisition helpers',()=>{const e=fs.readFileSync(new URL('../src/game/enemies.ts',import.meta.url),'utf8'),s=fs.readFileSync(new URL('../src/game/spells.ts',import.meta.url),'utf8'),g=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');assert.match(e,/projectileDirectionReacquisitionPresentation/);assert.match(e,/specialistFacingReacquisitionPresentation/);assert.match(s,/impactDirectionReacquisitionPresentation/);assert.match(g,/hazardBoundaryDirectionReacquisitionPresentation/);assert.match(g,/safeLaneDirectionReacquisitionPresentation/);});
""")
red(test2, "threat-impact-direction-reacquisition-rendering")

mod2="src/game/threat-impact-direction-reacquisition-rendering.ts"
write(mod2, r"""
const clamp01=(value:number)=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));
export function projectileDirectionReacquisitionPresentation(input:{reacquire:number;pressure:number;critical:boolean},reducedMotion=false){const reacquire=clamp01(input.reacquire),pressure=clamp01(input.pressure),primary=Math.max(input.critical?.9:.74,.74+.26*reacquire-pressure*.04),stale=Math.max(.42,primary-(.24+.16*(1-reacquire)));return{primaryDirectionScale:primary,staleDirectionScale:stale,tailLengthScale:Math.max(.68,.72+.28*reacquire)*(reducedMotion?.94:1),presentationOnly:true as const};}
export function impactDirectionReacquisitionPresentation(input:{reacquire:number;responseStrength:number;pressure:number;critical:boolean},reducedFlash=false){const reacquire=clamp01(input.reacquire),response=clamp01(input.responseStrength),pressure=clamp01(input.pressure),direction=Math.max(input.critical?.82:.72,.72+response*.18+reacquire*.1-pressure*.04)*(reducedFlash?.96:1),stale=Math.max(.4,direction-(.22+.16*(1-reacquire)));return{directionAlphaScale:direction,responseScale:Math.max(direction,.76+response*.2),staleDirectionScale:stale,presentationOnly:true as const};}
export function hazardBoundaryDirectionReacquisitionPresentation(input:{reacquire:number;telegraph:boolean;laneProximity:number;pressure:number},reducedFlash=false){const reacquire=clamp01(input.reacquire),lane=clamp01(input.laneProximity),pressure=clamp01(input.pressure);return{edgeDirectionScale:input.telegraph?Math.max(.9,.98*(reducedFlash?.98:1)):.74+.22*reacquire,staleFillDirectionScale:Math.max(.5,1-(1-reacquire)*(.28+.12*lane)-pressure*.08),presentationOnly:true as const};}
export function safeLaneDirectionReacquisitionPresentation(input:{visible:boolean;confidence:number;reacquire:number;pressure:number},reducedFlash=false){const confidence=clamp01(input.confidence),reacquire=clamp01(input.reacquire),pressure=clamp01(input.pressure),hold=clamp01(pressure*(1-reacquire));return{pathAlphaFloor:input.visible?Math.max(.93,.91+confidence*.06):0,pathDirectionScale:input.visible?1+hold*(.05+.03*confidence)*(reducedFlash?.8:1):1,locatorScale:input.visible?1+hold*.04:1,presentationOnly:true as const};}
export function specialistFacingReacquisitionPresentation(input:{owner:'locomotion'|'attack'|'recovery'|'hit'|'special';reacquire:number;pressure:number;critical:boolean},reducedMotion=false){const reacquire=clamp01(input.reacquire),pressure=clamp01(input.pressure),action=input.owner==='special'?1:input.owner==='attack'?.9:input.owner==='hit'?.72:input.owner==='recovery'?.5:.2,facing=Math.max(input.critical?.9:.74,.76+action*.16+reacquire*.08-pressure*.04),trail=Math.max(.46,facing-(.18+.18*(1-reacquire)));return{facingScale:facing,trailDirectionScale:trail*(reducedMotion?.94:1),presentationOnly:true as const};}
export function directionReacquisitionBudgetPresentation(input:{criticalCount:number;projectileCount:number;impactCount:number;hazardCount:number;silhouetteCount:number;safeLaneVisible:boolean},reducedMotion=false,reducedFlash=false){const critical=clamp01(Math.max(0,input.criticalCount)/3),load=clamp01((input.projectileCount+input.impactCount+input.hazardCount*1.35+input.silhouetteCount)/30),stress=clamp01(load*.82+critical*.16);return{stress,canonicalScale:1,primaryDirectionScale:1,safeLaneScale:input.safeLaneVisible?1+stress*.04*(reducedFlash?.8:1):1,staleDirectionScale:Math.max(.52,1-stress*.4)*(reducedMotion?.96:1)*(reducedFlash?.95:1),presentationOnly:true as const};}
""")
insert_import("src/game/enemies.ts",
"import { canonicalReacquisitionBudgetPresentation, projectileCanonicalReacquisitionPresentation, specialistCanonicalReacquisitionPresentation } from './threat-impact-canonical-reacquisition-rendering.js';",
"import { directionReacquisitionBudgetPresentation, projectileDirectionReacquisitionPresentation, specialistFacingReacquisitionPresentation } from './threat-impact-direction-reacquisition-rendering.js';")
insert_import("src/game/spells.ts",
"import { canonicalReacquisitionBudgetPresentation, impactCanonicalReacquisitionPresentation } from './threat-impact-canonical-reacquisition-rendering.js';",
"import { directionReacquisitionBudgetPresentation, impactDirectionReacquisitionPresentation } from './threat-impact-direction-reacquisition-rendering.js';")
insert_import("src/game/game.ts",
"import { canonicalReacquisitionBudgetPresentation, hazardCanonicalReacquisitionPresentation, safeLaneCanonicalReacquisitionPresentation } from './threat-impact-canonical-reacquisition-rendering.js';",
"import { directionReacquisitionBudgetPresentation, hazardBoundaryDirectionReacquisitionPresentation, safeLaneDirectionReacquisitionPresentation } from './threat-impact-direction-reacquisition-rendering.js';")

insert_after("src/game/enemies.ts","const projectileCanonicalReacquisition=",
"      const projectileDirectionReacquisition=projectileDirectionReacquisitionPresentation({reacquire:projectileCanonicalReacquisition.reacquire,pressure:Math.max(projectileDepthPlane.pressure,projectileBossFocus.focus),critical:Boolean(projectile.bossArchetype)},reducedMotion),projectileDirectionReacquisitionBudget=directionReacquisitionBudgetPresentation({criticalCount:projectile.bossArchetype?1:0,projectileCount:this.projectiles.length,impactCount:0,hazardCount:0,silhouetteCount:0,safeLaneVisible:projectileLaneProximity>0},reducedMotion,reducedFlash);")
insert_after("src/game/enemies.ts","const specialistCanonicalReacquisition=",
"      const specialistFacingReacquisition=specialistFacingReacquisitionPresentation({owner:silhouetteDirection.owner,reacquire:specialistCanonicalReacquisition.reacquire,pressure:Math.max(specialistDepthPlane.pressure,specialistBossFocus.focus),critical:silhouetteDirection.owner==='special'},reducedMotion),specialistDirectionReacquisitionBudget=directionReacquisitionBudgetPresentation({criticalCount:silhouetteDirection.owner==='special'?1:0,projectileCount:this.projectiles.length,impactCount:0,hazardCount:Math.round(hazardPressure*4),silhouetteCount:activeSpecialistCount,safeLaneVisible:false},reducedMotion,reducedFlash);")
replace_all("src/game/enemies.ts",
"*projectileCanonicalReacquisition.trailScale*projectileCanonicalReacquisitionBudget.staleDecorationScale",
"*projectileCanonicalReacquisition.trailScale*projectileCanonicalReacquisitionBudget.staleDecorationScale*projectileDirectionReacquisition.primaryDirectionScale*projectileDirectionReacquisitionBudget.staleDirectionScale")
replace_all("src/game/enemies.ts",
"*specialistCanonicalReacquisition.facingScale*specialistCanonicalReacquisitionBudget.canonicalScale;",
"*specialistCanonicalReacquisition.facingScale*specialistCanonicalReacquisitionBudget.canonicalScale*specialistFacingReacquisition.facingScale*specialistDirectionReacquisitionBudget.primaryDirectionScale;")
replace_all("src/game/enemies.ts",
"*specialistCanonicalReacquisition.recoveryTrailScale*specialistCanonicalReacquisitionBudget.staleDecorationScale;",
"*specialistCanonicalReacquisition.recoveryTrailScale*specialistCanonicalReacquisitionBudget.staleDecorationScale*specialistFacingReacquisition.trailDirectionScale*specialistDirectionReacquisitionBudget.staleDirectionScale;")

insert_after("src/game/spells.ts","const impactCanonicalReacquisition=",
"        const impactDirectionReacquisition=impactDirectionReacquisitionPresentation({reacquire:impactCanonicalReacquisition.reacquire,responseStrength:impact.impactResponseStrength??0,pressure:Math.max(impactDepthPlane.pressure,bossImpactFocus.focus),critical:impactCritical},reducedFlash),impactDirectionReacquisitionBudget=directionReacquisitionBudgetPresentation({criticalCount:impactCritical?1:0,projectileCount:this.projectiles.length,impactCount:this.projectileImpactVisuals.length,hazardCount:this.fields.length+this.holes.length,silhouetteCount:0,safeLaneVisible:false},reducedMotion,reducedFlash);")
p=Path("src/game/spells.ts")
lines=[]
hits=0
for line in p.read_text().splitlines():
    if "if(impactDirection?.visible" in line and "ctx.globalAlpha=" in line:
        old="*(reducedFlash?.62:1);"
        if old not in line: raise SystemExit("impact direction alpha suffix missing")
        line=line.replace(old,"*impactDirectionReacquisition.directionAlphaScale*impactDirectionReacquisitionBudget.primaryDirectionScale*(reducedFlash?.62:1);",1)
        hits+=1
    lines.append(line)
if hits!=1: raise SystemExit(f"impact direction line hits={hits}")
p.write_text("\n".join(lines)+"\n")

insert_after("src/game/game.ts","const safeLaneCanonicalReacquisition=",
"      const safeLaneDirectionReacquisition=safeLaneDirectionReacquisitionPresentation({visible:true,confidence:safeLane.confidence,reacquire:safeLaneReclaim.release,pressure:safeLaneDenseBattlefield.stress},this.presentationSettings.reducedFlash),safeLaneDirectionReacquisitionBudget=directionReacquisitionBudgetPresentation({criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0),projectileCount:this.enemies.activeProjectileCount,impactCount:0,hazardCount:this.bossArena.hazards.length,silhouetteCount:0,safeLaneVisible:true},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);")
insert_after("src/game/game.ts","const hazardCanonicalReacquisition=",
"      const hazardDirectionReacquisition=hazardBoundaryDirectionReacquisitionPresentation({reacquire:hazardCanonicalReacquisition.reacquire,telegraph:hazard.telegraph>0,laneProximity:hazardLaneProximity,pressure:Math.max(hazardDepthPlane.pressure,hazardBossFocus.focus)},this.presentationSettings.reducedFlash),hazardDirectionReacquisitionBudget=directionReacquisitionBudgetPresentation({criticalCount:hazard.id===primaryTelegraphHazardId?1:0,projectileCount:this.enemies.activeProjectileCount,impactCount:0,hazardCount:this.bossArena.hazards.length,silhouetteCount:0,safeLaneVisible:Boolean(safeLane)},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);")
replace_all("src/game/game.ts",
"*safeLaneCanonicalReacquisition.safeLaneScale*safeLaneCanonicalReacquisitionBudget.safeLaneScale;",
"*safeLaneCanonicalReacquisition.safeLaneScale*safeLaneCanonicalReacquisitionBudget.safeLaneScale*safeLaneDirectionReacquisition.pathDirectionScale*safeLaneDirectionReacquisitionBudget.safeLaneScale;")
replace_all("src/game/game.ts",
"safeLaneCanonicalReacquisition.pathAlphaFloor)",
"safeLaneCanonicalReacquisition.pathAlphaFloor,safeLaneDirectionReacquisition.pathAlphaFloor)")
replace_all("src/game/game.ts",
"*hazardCanonicalReacquisition.edgeAlphaScale*hazardCanonicalReacquisitionBudget.criticalEdgeScale;",
"*hazardCanonicalReacquisition.edgeAlphaScale*hazardCanonicalReacquisitionBudget.criticalEdgeScale*hazardDirectionReacquisition.edgeDirectionScale*hazardDirectionReacquisitionBudget.primaryDirectionScale;")
commit("Phase 4143-4148 threat direction reacquisition", mod2, test2)

# ---------------- Train 3: Phase 4149-4154 critical re-engagement ----------------
test3="tests/phase4149-4154-critical-reengagement.test.mjs"
write(test3, r"""
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const moduleUrl=new URL('../dist/game/threat-impact-critical-reengagement-rendering.js',import.meta.url);
async function load(){return import(moduleUrl.href+'?v='+Date.now());}
test('Phase 4149 boss telegraph re-engagement locks danger edge authority',async()=>{const {bossTelegraphReengagementLockPresentation}=await load();const p=bossTelegraphReengagementLockPresentation({active:true,critical:true,reacquire:.2,crowd:1},false);assert.ok(p.edgeAlphaScale>=.96);assert.ok(p.staleDecorationScale<1);});
test('Phase 4150 boss projectile re-engagement keeps canonical body visible',async()=>{const {bossProjectileReengagementLockPresentation}=await load();const p=bossProjectileReengagementLockPresentation({active:true,critical:true,reacquire:.2,laneProximity:.9,crowd:1},false,false);assert.equal(p.bodyScale,1);assert.ok(p.trailScale>=.8);});
test('Phase 4151 boss impact re-engagement retires fill before edge',async()=>{const {bossImpactReengagementLockPresentation}=await load();const p=bossImpactReengagementLockPresentation({bossProximity:1,reacquire:.2,crowd:1,critical:false},false);assert.ok(p.edgeAlphaScale>=p.fillAlphaScale);});
test('Phase 4152 safe lane critical re-engagement keeps escape path floor',async()=>{const {safeLaneCriticalReengagementLockPresentation}=await load();const p=safeLaneCriticalReengagementLockPresentation({visible:true,confidence:.9,bossPressure:1,critical:true,reacquire:.2},false);assert.ok(p.pathAlphaFloor>=.95);assert.ok(p.safeLaneScale>=1);});
test('Phase 4153 specialist boss re-engagement preserves body and facing',async()=>{const {specialistBossReengagementLockPresentation}=await load();const p=specialistBossReengagementLockPresentation({bossProximity:1,owner:'attack',reacquire:.2,critical:false},false);assert.equal(p.bodyScale,1);assert.ok(p.directionScale>=.8);assert.ok(p.secondaryScale<1);});
test('Phase 4154 critical re-engagement budget preserves canonical and telegraph owners',async()=>{const {criticalReengagementBudgetPresentation}=await load();const p=criticalReengagementBudgetPresentation({bossActive:true,criticalCount:2,projectileCount:12,impactCount:8,hazardCount:5,silhouetteCount:4,safeLaneVisible:true},false,false);assert.equal(p.canonicalScale,1);assert.equal(p.telegraphEdgeScale,1);assert.ok(p.secondaryScale<1);assert.ok(p.safeLaneScale>=1);});
test('Phase 4149-4154 live renderers consume critical re-engagement helpers',()=>{const e=fs.readFileSync(new URL('../src/game/enemies.ts',import.meta.url),'utf8'),s=fs.readFileSync(new URL('../src/game/spells.ts',import.meta.url),'utf8'),g=fs.readFileSync(new URL('../src/game/game.ts',import.meta.url),'utf8');assert.match(e,/bossProjectileReengagementLockPresentation/);assert.match(e,/specialistBossReengagementLockPresentation/);assert.match(s,/bossImpactReengagementLockPresentation/);assert.match(g,/bossTelegraphReengagementLockPresentation/);assert.match(g,/safeLaneCriticalReengagementLockPresentation/);});
""")
red(test3, "threat-impact-critical-reengagement-rendering")

mod3="src/game/threat-impact-critical-reengagement-rendering.ts"
write(mod3, r"""
const clamp01=(value:number)=>Math.max(0,Math.min(1,Number.isFinite(value)?value:0));
export function bossTelegraphReengagementLockPresentation(input:{active:boolean;critical:boolean;reacquire:number;crowd:number},reducedFlash=false){const reacquire=clamp01(input.reacquire),crowd=clamp01(input.crowd),lock=input.active?clamp01(crowd*.62+(1-reacquire)*.38):0;return{lock,edgeAlphaScale:input.active?Math.max(input.critical?.96:.94,.99*(reducedFlash?.98:1)):1,staleDecorationScale:Math.max(.5,1-lock*.44)*(reducedFlash?.94:1),presentationOnly:true as const};}
export function bossProjectileReengagementLockPresentation(input:{active:boolean;critical:boolean;reacquire:number;laneProximity:number;crowd:number},reducedMotion=false,reducedFlash=false){const reacquire=clamp01(input.reacquire),lane=clamp01(input.laneProximity),crowd=clamp01(input.crowd),lock=input.active?clamp01(lane*.38+crowd*.34+(1-reacquire)*.28):0;return{lock,bodyScale:1,trailScale:Math.max(input.critical?.8:.58,1-lock*(input.critical?.16:.36))*(reducedMotion?.96:1),secondaryScale:Math.max(.54,1-lock*.4)*(reducedFlash?.94:1),presentationOnly:true as const};}
export function bossImpactReengagementLockPresentation(input:{bossProximity:number;reacquire:number;crowd:number;critical:boolean},reducedFlash=false){const boss=clamp01(input.bossProximity),reacquire=clamp01(input.reacquire),crowd=clamp01(input.crowd),lock=clamp01(boss*.54+crowd*.28+(1-reacquire)*.18),flash=reducedFlash?.9:1,fillAlphaScale=Math.max(input.critical?.58:.24,1-lock*(input.critical?.36:.62))*flash,edgeAlphaScale=Math.max(fillAlphaScale,input.critical?.9:.72,.72+(1-lock)*.2);return{lock,fillAlphaScale,edgeAlphaScale,presentationOnly:true as const};}
export function safeLaneCriticalReengagementLockPresentation(input:{visible:boolean;confidence:number;bossPressure:number;critical:boolean;reacquire:number},reducedFlash=false){const confidence=clamp01(input.confidence),pressure=clamp01(input.bossPressure),reacquire=clamp01(input.reacquire),lock=clamp01(pressure*.7+(1-reacquire)*.3);return{lock,pathAlphaFloor:input.visible?Math.max(input.critical?.95:.93,.92+confidence*.06):0,safeLaneScale:input.visible?1+lock*(.07+.03*confidence)*(reducedFlash?.8:1):1,secondaryScale:Math.max(.56,1-lock*.38),presentationOnly:true as const};}
export function specialistBossReengagementLockPresentation(input:{bossProximity:number;owner:'locomotion'|'attack'|'recovery'|'hit'|'special';reacquire:number;critical:boolean},reducedMotion=false){const boss=clamp01(input.bossProximity),reacquire=clamp01(input.reacquire),action=input.owner==='special'?1:input.owner==='attack'?.9:input.owner==='hit'?.72:input.owner==='recovery'?.5:.2,lock=clamp01(boss*(.56+(1-reacquire)*.24));return{lock,bodyScale:1,directionScale:Math.max(input.critical?.9:.8,.8+action*.14-lock*.05),secondaryScale:Math.max(.5,1-lock*.44)*(reducedMotion?.95:1),presentationOnly:true as const};}
export function criticalReengagementBudgetPresentation(input:{bossActive:boolean;criticalCount:number;projectileCount:number;impactCount:number;hazardCount:number;silhouetteCount:number;safeLaneVisible:boolean},reducedMotion=false,reducedFlash=false){const critical=clamp01(Math.max(0,input.criticalCount)/3),load=clamp01((input.projectileCount+input.impactCount+input.hazardCount*1.4+input.silhouetteCount)/30),lock=input.bossActive?clamp01(load*.78+critical*.3):0;return{lock,canonicalScale:1,telegraphEdgeScale:1,safeLaneScale:input.safeLaneVisible?1+lock*.06*(reducedFlash?.8:1):1,secondaryScale:Math.max(.48,1-lock*.46)*(reducedMotion?.95:1)*(reducedFlash?.94:1),presentationOnly:true as const};}
""")
insert_import("src/game/enemies.ts",
"import { directionReacquisitionBudgetPresentation, projectileDirectionReacquisitionPresentation, specialistFacingReacquisitionPresentation } from './threat-impact-direction-reacquisition-rendering.js';",
"import { bossProjectileReengagementLockPresentation, criticalReengagementBudgetPresentation, specialistBossReengagementLockPresentation } from './threat-impact-critical-reengagement-rendering.js';")
insert_import("src/game/spells.ts",
"import { directionReacquisitionBudgetPresentation, impactDirectionReacquisitionPresentation } from './threat-impact-direction-reacquisition-rendering.js';",
"import { bossImpactReengagementLockPresentation, criticalReengagementBudgetPresentation } from './threat-impact-critical-reengagement-rendering.js';")
insert_import("src/game/game.ts",
"import { directionReacquisitionBudgetPresentation, hazardBoundaryDirectionReacquisitionPresentation, safeLaneDirectionReacquisitionPresentation } from './threat-impact-direction-reacquisition-rendering.js';",
"import { bossTelegraphReengagementLockPresentation, criticalReengagementBudgetPresentation, safeLaneCriticalReengagementLockPresentation } from './threat-impact-critical-reengagement-rendering.js';")

insert_after("src/game/enemies.ts","const projectileDirectionReacquisition=",
"      const projectileCriticalReengagement=bossProjectileReengagementLockPresentation({active:Boolean(projectile.bossArchetype),critical:Boolean(projectile.bossArchetype),reacquire:projectileCanonicalReacquisition.reacquire,laneProximity:projectileLaneProximity,crowd:Math.min(1,this.projectiles.length/12)},reducedMotion,reducedFlash),projectileCriticalReengagementBudget=criticalReengagementBudgetPresentation({bossActive:Boolean(projectile.bossArchetype),criticalCount:projectile.bossArchetype?1:0,projectileCount:this.projectiles.length,impactCount:0,hazardCount:0,silhouetteCount:0,safeLaneVisible:projectileLaneProximity>0},reducedMotion,reducedFlash);")
insert_after("src/game/enemies.ts","const specialistFacingReacquisition=",
"      const specialistCriticalReengagement=specialistBossReengagementLockPresentation({bossProximity:specialistBossProximity,owner:silhouetteDirection.owner,reacquire:specialistCanonicalReacquisition.reacquire,critical:silhouetteDirection.owner==='special'},reducedMotion),specialistCriticalReengagementBudget=criticalReengagementBudgetPresentation({bossActive:specialistBossProximity>0,criticalCount:silhouetteDirection.owner==='special'?1:0,projectileCount:this.projectiles.length,impactCount:0,hazardCount:Math.round(hazardPressure*4),silhouetteCount:activeSpecialistCount,safeLaneVisible:false},reducedMotion,reducedFlash);")
replace_all("src/game/enemies.ts",
"*projectileDirectionReacquisition.primaryDirectionScale*projectileDirectionReacquisitionBudget.staleDirectionScale",
"*projectileDirectionReacquisition.primaryDirectionScale*projectileDirectionReacquisitionBudget.staleDirectionScale*projectileCriticalReengagement.trailScale*projectileCriticalReengagementBudget.secondaryScale")
replace_all("src/game/enemies.ts",
"*projectileCanonicalReacquisition.bodyScale*projectileCanonicalReacquisitionBudget.canonicalScale",
"*projectileCanonicalReacquisition.bodyScale*projectileCanonicalReacquisitionBudget.canonicalScale*projectileCriticalReengagement.bodyScale*projectileCriticalReengagementBudget.canonicalScale")
replace_all("src/game/enemies.ts",
"*specialistFacingReacquisition.facingScale*specialistDirectionReacquisitionBudget.primaryDirectionScale;",
"*specialistFacingReacquisition.facingScale*specialistDirectionReacquisitionBudget.primaryDirectionScale*specialistCriticalReengagement.directionScale*specialistCriticalReengagementBudget.canonicalScale;")
replace_all("src/game/enemies.ts",
"*specialistFacingReacquisition.trailDirectionScale*specialistDirectionReacquisitionBudget.staleDirectionScale;",
"*specialistFacingReacquisition.trailDirectionScale*specialistDirectionReacquisitionBudget.staleDirectionScale*specialistCriticalReengagement.secondaryScale*specialistCriticalReengagementBudget.secondaryScale;")

insert_after("src/game/spells.ts","const impactDirectionReacquisition=",
"        const impactCriticalReengagement=bossImpactReengagementLockPresentation({bossProximity:bossTelegraphOverlap?1:0,reacquire:impactCanonicalReacquisition.reacquire,crowd:Math.min(1,impactNeighborCount/8),critical:impactCritical},reducedFlash),impactCriticalReengagementBudget=criticalReengagementBudgetPresentation({bossActive:bossTelegraphOverlap,criticalCount:impactCritical?1:0,projectileCount:this.projectiles.length,impactCount:this.projectileImpactVisuals.length,hazardCount:this.fields.length+this.holes.length,silhouetteCount:0,safeLaneVisible:false},reducedMotion,reducedFlash);")
replace_all("src/game/spells.ts",
"*impactCanonicalReacquisition.fillAlphaScale*impactCanonicalReacquisitionBudget.staleDecorationScale;",
"*impactCanonicalReacquisition.fillAlphaScale*impactCanonicalReacquisitionBudget.staleDecorationScale*impactCriticalReengagement.fillAlphaScale*impactCriticalReengagementBudget.secondaryScale;")
replace_all("src/game/spells.ts",
"*impactCanonicalReacquisition.edgeAlphaScale*impactCanonicalReacquisitionBudget.criticalEdgeScale;",
"*impactCanonicalReacquisition.edgeAlphaScale*impactCanonicalReacquisitionBudget.criticalEdgeScale*impactCriticalReengagement.edgeAlphaScale*impactCriticalReengagementBudget.telegraphEdgeScale;")

insert_after("src/game/game.ts","const safeLaneDirectionReacquisition=",
"      const safeLaneCriticalReengagement=safeLaneCriticalReengagementLockPresentation({visible:true,confidence:safeLane.confidence,bossPressure:safeLaneDenseBattlefield.stress,critical:this.dangerState.coreCritical||this.dangerState.heroCritical,reacquire:safeLaneReclaim.release},this.presentationSettings.reducedFlash),safeLaneCriticalReengagementBudget=criticalReengagementBudgetPresentation({bossActive:Boolean(boss),criticalCount:(this.dangerState.coreCritical?1:0)+(this.dangerState.heroCritical?1:0),projectileCount:this.enemies.activeProjectileCount,impactCount:0,hazardCount:this.bossArena.hazards.length,silhouetteCount:0,safeLaneVisible:true},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);")
insert_after("src/game/game.ts","const hazardDirectionReacquisition=",
"      const hazardCriticalReengagement=bossTelegraphReengagementLockPresentation({active:hazard.telegraph>0,critical:hazard.id===primaryTelegraphHazardId,reacquire:hazardCanonicalReacquisition.reacquire,crowd:Math.min(1,this.bossArena.hazards.length/6)},this.presentationSettings.reducedFlash),hazardCriticalReengagementBudget=criticalReengagementBudgetPresentation({bossActive:Boolean(boss),criticalCount:hazard.id===primaryTelegraphHazardId?1:0,projectileCount:this.enemies.activeProjectileCount,impactCount:0,hazardCount:this.bossArena.hazards.length,silhouetteCount:0,safeLaneVisible:Boolean(safeLane)},this.presentationSettings.reducedMotion,this.presentationSettings.reducedFlash);")
replace_all("src/game/game.ts",
"*safeLaneDirectionReacquisition.pathDirectionScale*safeLaneDirectionReacquisitionBudget.safeLaneScale;",
"*safeLaneDirectionReacquisition.pathDirectionScale*safeLaneDirectionReacquisitionBudget.safeLaneScale*safeLaneCriticalReengagement.safeLaneScale*safeLaneCriticalReengagementBudget.safeLaneScale;")
replace_all("src/game/game.ts",
"safeLaneDirectionReacquisition.pathAlphaFloor)",
"safeLaneDirectionReacquisition.pathAlphaFloor,safeLaneCriticalReengagement.pathAlphaFloor)")
replace_all("src/game/game.ts",
"*hazardCanonicalReacquisition.fillAlphaScale*hazardCanonicalReacquisitionBudget.staleDecorationScale",
"*hazardCanonicalReacquisition.fillAlphaScale*hazardCanonicalReacquisitionBudget.staleDecorationScale*hazardCriticalReengagement.staleDecorationScale*hazardCriticalReengagementBudget.secondaryScale")
replace_all("src/game/game.ts",
"*hazardDirectionReacquisition.edgeDirectionScale*hazardDirectionReacquisitionBudget.primaryDirectionScale;",
"*hazardDirectionReacquisition.edgeDirectionScale*hazardDirectionReacquisitionBudget.primaryDirectionScale*hazardCriticalReengagement.edgeAlphaScale*hazardCriticalReengagementBudget.telegraphEdgeScale;")
commit("Phase 4149-4154 critical threat re-engagement", mod3, test3)

run("npm run build")
run("node --test tests/phase4137-4142-canonical-reacquisition.test.mjs tests/phase4143-4148-direction-reacquisition.test.mjs tests/phase4149-4154-critical-reengagement.test.mjs")
run("git diff --check")
run("git status --short")
run("git push origin HEAD:work/phase4137-4154-fast")
