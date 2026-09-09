from pathlib import Path

path = Path('src/game/enemies.ts')
text = path.read_text()

old = """      const spritePresentation = enemySpritePresentation(enemy.type, enemy.radius, spriteAtlasReady);
      const bossArchetype = enemy.type === 'boss' ? (enemy.bossArchetype ?? bossArchetypeForOrdinal(enemy.bossOrdinal ?? 0)) : null;
      const bossPresentation = bossArchetype ? bossSpritePresentation(bossArchetype, enemy.radius, bossSpriteAtlasReady) : null;
      const shadowBaseWidth=enemy.radius*1.12,shadowBaseHeight=enemy.radius*.48;
      const ownedShadowWidth=(shadowBaseWidth+(motionPresentation.shadowWidth-shadowBaseWidth)*shadowMotionScale)*spawnGroundMaterialize.shadowWidthScale;
      const ownedShadowHeight=shadowBaseHeight+(motionPresentation.shadowHeight-shadowBaseHeight)*shadowMotionScale;"""
new = """      const spritePresentation = enemySpritePresentation(enemy.type, enemy.radius, spriteAtlasReady);
      const bossArchetype = enemy.type === 'boss' ? (enemy.bossArchetype ?? bossArchetypeForOrdinal(enemy.bossOrdinal ?? 0)) : null;
      const bossPresentation = bossArchetype ? bossSpritePresentation(bossArchetype, enemy.radius, bossSpriteAtlasReady) : null;
      const imagePresenceShadowScale=bossPresentation?.visible?bossPresentation.groundShadowScale:spritePresentation.groundShadowScale;
      const imagePresenceShadowAlphaBoost=bossPresentation?.visible?bossPresentation.groundShadowAlphaBoost:spritePresentation.groundShadowAlphaBoost;
      const shadowBaseWidth=enemy.radius*1.12,shadowBaseHeight=enemy.radius*.48;
      const ownedShadowWidth=(shadowBaseWidth+(motionPresentation.shadowWidth-shadowBaseWidth)*shadowMotionScale)*spawnGroundMaterialize.shadowWidthScale*imagePresenceShadowScale;
      const ownedShadowHeight=(shadowBaseHeight+(motionPresentation.shadowHeight-shadowBaseHeight)*shadowMotionScale)*imagePresenceShadowScale;"""
if new not in text:
    if text.count(old) != 1:
        raise SystemExit('sprite presentation shadow anchor mismatch')
    text = text.replace(old, new, 1)

old = "ctx.fillStyle = `rgba(8,12,18,${Math.min(0.42, (groundContact.alpha + locomotionShadowBoost + recoveryShadowBoost)*bossSpecialOriginHandoff.shadowAlphaScale*spawnGroundMaterialize.shadowAlphaScale)})`;"
new = "ctx.fillStyle = `rgba(8,12,18,${Math.min(0.46, (groundContact.alpha + locomotionShadowBoost + recoveryShadowBoost + imagePresenceShadowAlphaBoost)*bossSpecialOriginHandoff.shadowAlphaScale*spawnGroundMaterialize.shadowAlphaScale)})`;"
if new not in text:
    if text.count(old) != 1:
        raise SystemExit('ground shadow alpha anchor mismatch')
    text = text.replace(old, new, 1)

old = "ctx.globalAlpha = spritePresentation.visible || bossPresentation?.visible ? 0.22 : 1;"
new = "ctx.globalAlpha = bossPresentation?.visible ? bossPresentation.bodyAlpha : spritePresentation.bodyAlpha;"
if new not in text:
    if text.count(old) != 1:
        raise SystemExit('fallback body alpha anchor mismatch')
    text = text.replace(old, new, 1)

old = """        const sprite = enemySpriteRect(enemy.type);
        const size = spritePresentation.drawSize;
        ctx.drawImage(spriteAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, -size / 2, -size / 2, size, size);
        if (enemy.hitFlash > 0) {"""
new = """        const sprite = enemySpriteRect(enemy.type);
        const size = spritePresentation.drawSize;
        ctx.save();
        ctx.shadowColor='rgba(6,10,16,.72)';
        ctx.shadowBlur=spritePresentation.imageShadowBlur;
        ctx.drawImage(spriteAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, -size / 2, -size / 2, size, size);
        ctx.restore();
        if (enemy.hitFlash > 0) {"""
if new not in text:
    if text.count(old) != 1:
        raise SystemExit('enemy sprite draw anchor mismatch')
    text = text.replace(old, new, 1)

old = """        const sprite = bossSpriteRect(bossArchetype);
        const size = bossPresentation.drawSize;
        ctx.drawImage(bossSpriteAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, -size / 2, -size / 2, size, size);
        if (enemy.hitFlash > 0) {"""
new = """        const sprite = bossSpriteRect(bossArchetype);
        const size = bossPresentation.drawSize;
        ctx.save();
        ctx.shadowColor='rgba(20,8,18,.78)';
        ctx.shadowBlur=bossPresentation.imageShadowBlur;
        ctx.drawImage(bossSpriteAtlasImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, -size / 2, -size / 2, size, size);
        ctx.restore();
        if (enemy.hitFlash > 0) {"""
if new not in text:
    if text.count(old) != 1:
        raise SystemExit('boss sprite draw anchor mismatch')
    text = text.replace(old, new, 1)

path.write_text(text)
