from pathlib import Path

runner=Path('.github/phase4137-4154-fast-v2.py').read_text()
old="hits=[i for i,l in enumerate(lines) if line_needle in l]"
new="hits=[i for i,l in enumerate(lines) if line_needle in l and (not (path=='src/game/spells.ts' and line_needle.startswith('ctx.save(); ctx.globalAlpha')) or 'impactDenseArbitration.fillAlphaScale' in l)]"
count=runner.count(old)
if count!=2:
    raise SystemExit(f'expected 2 assignment/token helper match lines, got {count}')
# Only append_assignment_factor needs the extra impact-fill discriminator; the first occurrence is its hits line.
runner=runner.replace(old,new,1)
exec(compile(runner,'.github/phase4137-4154-fast-v2.py','exec'),{'__name__':'__main__'})
