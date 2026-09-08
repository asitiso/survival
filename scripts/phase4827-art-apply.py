from pathlib import Path

path = Path('src/game/game.ts')
text = path.read_text()

old = "import { BATTLEFIELD_ENVIRONMENT_ATLAS, battlefieldEnvironmentSprite } from './battlefield-environment-assets.js';"
new = old + "\nimport { BATTLEFIELD_GAMEPLAY_ART, BATTLEFIELD_DECORATION_ANCHORS, battlefieldGameplayArtProfile, battlefieldGameplayPropSprite } from './battlefield-gameplay-art.js';"
if new not in text:
    if text.count(old) != 1:
        raise SystemExit('battlefield environment import anchor mismatch')
    text = text.replace(old, new, 1)

old = "  private battlefieldEnvironmentAtlasReady = false;"
new = old + "\n  private battlefieldGameplayBackdropImage: HTMLImageElement | null = null;\n  private battlefieldGameplayBackdropReady = false;\n  private battlefieldGameplayPropsImage: HTMLImageElement | null = null;\n  private battlefieldGameplayPropsReady = false;"
if new not in text:
    if text.count(old) != 1:
        raise SystemExit('battlefield field anchor mismatch')
    text = text.replace(old, new, 1)

old = "    this.initializeBattlefieldEnvironmentAtlas();"
new = old + "\n    this.initializeBattlefieldGameplayArt();"
if new not in text:
    if text.count(old) != 1:
        raise SystemExit('battlefield init call anchor mismatch')
    text = text.replace(old, new, 1)

marker = "  private initializeBattlefieldEnvironmentAtlas(): void {"
method = """  private initializeBattlefieldGameplayArt(): void {
    if (typeof Image === 'undefined') return;
    const backdrop = new Image();
    backdrop.decoding = 'async';
    backdrop.onload = () => { this.battlefieldGameplayBackdropReady = true; };
    backdrop.onerror = () => { this.battlefieldGameplayBackdropReady = false; };
    backdrop.src = BATTLEFIELD_GAMEPLAY_ART.backdrop.src;
    this.battlefieldGameplayBackdropImage = backdrop;
    const props = new Image();
    props.decoding = 'async';
    props.onload = () => { this.battlefieldGameplayPropsReady = true; };
    props.onerror = () => { this.battlefieldGameplayPropsReady = false; };
    props.src = BATTLEFIELD_GAMEPLAY_ART.props.src;
    this.battlefieldGameplayPropsImage = props;
  }

"""
if method not in text:
    if text.count(marker) != 1:
        raise SystemExit('battlefield initializer anchor mismatch')
    text = text.replace(marker, method + marker, 1)

old = "    ctx.fillStyle = grad;\n    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);\n\n    if (this.battlefieldEnvironmentAtlasReady && this.battlefieldEnvironmentAtlasImage) {"
new = """    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

    const gameplayArtCritical = this.hero.hp <= this.hero.maxHp * .30 || this.core.hp <= this.core.maxHp * .30;
    const gameplayArtProfile = battlefieldGameplayArtProfile(this.presentationSettings.reducedFlash, gameplayArtCritical);
    if (this.battlefieldGameplayBackdropReady && this.battlefieldGameplayBackdropImage) {
      ctx.save();
      ctx.globalAlpha = gameplayArtProfile.backdropAlpha;
      ctx.filter = `saturate(${gameplayArtProfile.backdropSaturation})`;
      ctx.drawImage(this.battlefieldGameplayBackdropImage, 0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      ctx.filter = 'none';
      const vignette = ctx.createRadialGradient(LOGICAL_WIDTH * .5, LOGICAL_HEIGHT * .5, LOGICAL_HEIGHT * .18, LOGICAL_WIDTH * .5, LOGICAL_HEIGHT * .5, LOGICAL_WIDTH * .62);
      vignette.addColorStop(0, 'rgba(5,12,18,0)');
      vignette.addColorStop(1, `rgba(5,12,18,${gameplayArtProfile.vignetteAlpha})`);
      ctx.globalAlpha = 1;
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
      ctx.restore();
    }

    if (this.battlefieldEnvironmentAtlasReady && this.battlefieldEnvironmentAtlasImage) {"""
if new not in text:
    if text.count(old) != 1:
        raise SystemExit('drawArena backdrop anchor mismatch')
    text = text.replace(old, new, 1)

marker = "  private drawBattlefieldAtmosphereVfx(ctx:CanvasRenderingContext2D):void {"
method = """  private drawBattlefieldGameplayProps(ctx: CanvasRenderingContext2D): void {
    if (!this.battlefieldGameplayPropsReady || !this.battlefieldGameplayPropsImage) return;
    const criticalThreat = this.hero.hp <= this.hero.maxHp * .30 || this.core.hp <= this.core.maxHp * .30;
    const profile = battlefieldGameplayArtProfile(this.presentationSettings.reducedFlash, criticalThreat);
    if (profile.propAlpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = profile.propAlpha;
    for (const anchor of BATTLEFIELD_DECORATION_ANCHORS) {
      const sprite = battlefieldGameplayPropSprite(anchor.kind);
      const x = anchor.x * LOGICAL_WIDTH;
      const y = anchor.y * LOGICAL_HEIGHT;
      const size = anchor.size;
      if (anchor.mirror) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(-1, 1);
        ctx.drawImage(this.battlefieldGameplayPropsImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, -size / 2, -size / 2, size, size);
        ctx.restore();
      } else {
        ctx.drawImage(this.battlefieldGameplayPropsImage, sprite.sx, sprite.sy, sprite.sw, sprite.sh, x - size / 2, y - size / 2, size, size);
      }
    }
    ctx.restore();
  }

"""
if method not in text:
    if text.count(marker) != 1:
        raise SystemExit('prop render method anchor mismatch')
    text = text.replace(marker, method + marker, 1)

old = "    this.terrain.render(ctx, residualMotion);\n    this.drawTerrainSpriteOverlays(ctx, residualMotion);\n    this.drawMapCombatBoundaryWarnings(ctx);"
new = "    this.terrain.render(ctx, residualMotion);\n    this.drawTerrainSpriteOverlays(ctx, residualMotion);\n    this.drawBattlefieldGameplayProps(ctx);\n    this.drawMapCombatBoundaryWarnings(ctx);"
if new not in text:
    if text.count(old) != 1:
        raise SystemExit('prop render order anchor mismatch')
    text = text.replace(old, new, 1)

path.write_text(text)
