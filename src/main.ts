import { Game } from './game/game.js';
import './game/elite-affix-response-lane-runtime.js';
import './game/elite-affix-response-lifecycle-runtime.js';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './game/config.js';
import { mobileLandscapeHudLayout } from './game/mobile-landscape-presentation.js';
import { visualRegressionProbe, visualProbeSignature } from './game/visual-regression-probe.js';
import { auditRenderContract, renderContract, renderContractSignature } from './game/render-contract.js';

const app = document.querySelector<HTMLDivElement>('#app');
if (!app) throw new Error('#app not found');

const shell = document.createElement('div');
shell.className = 'game-shell';
const canvas = document.createElement('canvas');
canvas.id = 'game-canvas';
canvas.width = LOGICAL_WIDTH;
canvas.height = LOGICAL_HEIGHT;
canvas.setAttribute('aria-label', 'Arcane Last Stand 전투 화면');
shell.append(canvas);
app.append(shell);

const game = new Game(canvas);

const hudCanvas = document.createElement('canvas');
hudCanvas.className = 'mobile-landscape-hud-layer';
hudCanvas.setAttribute('aria-hidden', 'true');
hudCanvas.style.position = 'fixed';
hudCanvas.style.pointerEvents = 'none';
hudCanvas.style.zIndex = '12';
hudCanvas.style.display = 'none';
app.append(hudCanvas);
const hudContext = hudCanvas.getContext('2d');
let hudViewportWidth = window.innerWidth || LOGICAL_WIDTH;
let hudViewportHeight = window.innerHeight || LOGICAL_HEIGHT;

const syncHudViewport = (): void => {
  const style = getComputedStyle(app);
  const safeLeft = Number.parseFloat(style.paddingLeft) || 0;
  const safeRight = Number.parseFloat(style.paddingRight) || 0;
  const safeTop = Number.parseFloat(style.paddingTop) || 0;
  const safeBottom = Number.parseFloat(style.paddingBottom) || 0;
  hudViewportWidth = Math.max(1, (window.innerWidth || LOGICAL_WIDTH) - safeLeft - safeRight);
  hudViewportHeight = Math.max(1, (window.innerHeight || LOGICAL_HEIGHT) - safeTop - safeBottom);
  hudCanvas.style.left = `${safeLeft}px`;
  hudCanvas.style.top = `${safeTop}px`;
  hudCanvas.style.width = `${hudViewportWidth}px`;
  hudCanvas.style.height = `${hudViewportHeight}px`;
};

syncHudViewport();
const gameHud = game as unknown as { drawHud: (ctx: CanvasRenderingContext2D) => void };
const originalDrawHud = gameHud.drawHud.bind(game);
gameHud.drawHud = (ctx) => {
  const layout = mobileLandscapeHudLayout(hudViewportWidth, hudViewportHeight);
  if (!hudContext || !layout.active || layout.scale <= 1.001) {
    if (hudCanvas.style.display !== 'none') {
      hudContext?.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
      hudCanvas.style.display = 'none';
    }
    originalDrawHud(ctx);
    return;
  }
  hudCanvas.style.display = 'block';
  if (hudCanvas.width !== layout.logicalWidth) hudCanvas.width = layout.logicalWidth;
  if (hudCanvas.height !== layout.logicalHeight) hudCanvas.height = layout.logicalHeight;
  hudContext.setTransform(1, 0, 0, 1, 0, 0);
  hudContext.clearRect(0, 0, hudCanvas.width, hudCanvas.height);
  hudContext.save();
  hudContext.translate(layout.offsetX, 0);
  hudContext.scale(layout.scale, layout.scale);
  originalDrawHud(hudContext);
  hudContext.restore();
};

const pauseButton = document.createElement('button');
pauseButton.className = 'pause-control';
pauseButton.type = 'button';
pauseButton.textContent = 'Ⅱ';
pauseButton.setAttribute('aria-label', '게임 일시정지');
pauseButton.addEventListener('click', () => {
  const paused = game.toggleManualPause();
  pauseButton.textContent = paused ? '▶' : 'Ⅱ';
  pauseButton.setAttribute('aria-label', paused ? '게임 계속하기' : '게임 일시정지');
});
shell.append(pauseButton);

document.addEventListener('visibilitychange', () => {
  game.setVisibilityPaused(document.hidden);
});
window.addEventListener('pagehide', () => { game.checkpointForLifecycle(); });
window.addEventListener('beforeunload', () => { game.checkpointForLifecycle(); });
window.addEventListener('pageshow', () => { game.resetTransientDecisionInput(); game.setVisibilityPaused(document.hidden); });
window.addEventListener('resize', () => { syncHudViewport(); game.resetTransientDecisionInput(); });
window.addEventListener('orientationchange', () => { syncHudViewport(); game.resetTransientDecisionInput(); });

game.start();
const visualProbe = new URLSearchParams(window.location.search).get('visualProbe');
if (visualProbe !== null) {
  const probe = visualRegressionProbe(window.innerWidth || LOGICAL_WIDTH, window.innerHeight || LOGICAL_HEIGHT);
  document.documentElement.dataset.visualProbe = visualProbeSignature(probe);
  const contract = renderContract(window.innerWidth || LOGICAL_WIDTH, window.innerHeight || LOGICAL_HEIGHT);
  document.documentElement.dataset.renderContract = renderContractSignature(contract);
  (window as unknown as { __arcaneVisualProbe?: typeof probe }).__arcaneVisualProbe = probe;
  (window as unknown as { __arcaneRenderContract?: { contract:typeof contract; audit:ReturnType<typeof auditRenderContract> } }).__arcaneRenderContract = { contract, audit:auditRenderContract(contract) };
}
(window as unknown as { defenseGame?: Game }).defenseGame = game;
