from pathlib import Path

path = Path('src/game/enemies.ts')
text = path.read_text()

old = "import { enemyAttackMotionPresentation } from './enemy-attack-motion-rendering.js';"
new = old + "\nimport { enemySpriteActionPresentation } from './enemy-sprite-action-readability.js';"
if new not in text:
    if text.count(old) != 1:
        raise SystemExit('import anchor mismatch')
    text = text.replace(old, new, 1)

old = "const enemyHitStagger=enemy.type!=='boss'?enemyHitStaggerPresentation(enemy.type,enemy.hitFlash,enemy.hitImpactTier??'normal',enemy.hitDirectionX??-renderFacingX,enemy.hitDirectionY??-renderFacingY,enemy.renderMotion,reducedMotion):null;"
new = old + "\n      const spriteActionPresentation=enemySpriteActionPresentation(enemy.type,{motionBlend:enemy.renderMotion?.motionBlend??0,stride:enemy.renderMotion?.stride??0,facingX:renderFacingX,facingY:renderFacingY,turn:enemy.renderMotion?.turn??0,pullback:attackMotion.pullback,lunge:attackMotion.lunge,hitStagger:enemy.type==='boss'?(bossHeavyHitStagger?.stagger??0):(enemyHitStagger?.stagger??0),hitOffsetX:enemy.type==='boss'?(bossHeavyHitStagger?.offsetX??0):(enemyHitStagger?.offsetX??0),hitOffsetY:enemy.type==='boss'?(bossHeavyHitStagger?.offsetY??0):(enemyHitStagger?.offsetY??0)},reducedMotion);"
if new not in text:
    if text.count(old) != 1:
        raise SystemExit('presentation anchor mismatch')
    text = text.replace(old, new, 1)

old = """        ctx.save();
        ctx.shadowColor='rgba(6,10,16,.72)';
        ctx.shadowBlur=spritePresentation.imageShadowBlur;"""
new = """        ctx.save();
        ctx.translate(spriteActionPresentation.offsetX,spriteActionPresentation.offsetY);
        ctx.rotate(spriteActionPresentation.rotation);
        ctx.scale(spriteActionPresentation.scaleX,spriteActionPresentation.scaleY);
        ctx.shadowColor='rgba(6,10,16,.72)';
        ctx.shadowBlur=spritePresentation.imageShadowBlur;"""
if new not in text:
    if text.count(old) != 1:
        raise SystemExit('regular sprite draw anchor mismatch')
    text = text.replace(old, new, 1)

old = """        ctx.save();
        ctx.shadowColor='rgba(20,8,18,.78)';
        ctx.shadowBlur=bossPresentation.imageShadowBlur;"""
new = """        ctx.save();
        ctx.translate(spriteActionPresentation.offsetX,spriteActionPresentation.offsetY);
        ctx.rotate(spriteActionPresentation.rotation);
        ctx.scale(spriteActionPresentation.scaleX,spriteActionPresentation.scaleY);
        ctx.shadowColor='rgba(20,8,18,.78)';
        ctx.shadowBlur=bossPresentation.imageShadowBlur;"""
if new not in text:
    if text.count(old) != 1:
        raise SystemExit('boss sprite draw anchor mismatch')
    text = text.replace(old, new, 1)

path.write_text(text)
