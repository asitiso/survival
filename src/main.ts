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

const presentationControls = shell.querySelector<HTMLDivElement>('.presentation-controls');
let syncPresentationSettingsLayout = (): void => {};
if (presentationControls?.parentElement) {
  const settingsParent = presentationControls.parentElement;
  const settingsPanel = document.createElement('div');
  settingsPanel.className = 'presentation-settings-panel';
  settingsPanel.style.position = 'absolute';
  settingsPanel.style.zIndex = '9';
  settingsPanel.style.display = 'flex';
  settingsPanel.style.flexDirection = 'row-reverse';
  settingsPanel.style.alignItems = 'flex-start';
  settingsPanel.style.gap = '6px';
  settingsPanel.style.maxWidth = 'calc(100% - 28px)';

  const settingsToggle = document.createElement('button');
  settingsToggle.type = 'button';
  settingsToggle.className = 'presentation-settings-toggle';
  settingsToggle.style.minHeight = '44px';
  settingsToggle.style.padding = '0 12px';
  settingsToggle.style.borderRadius = '11px';
  settingsToggle.style.border = '1px solid rgba(160,214,255,.22)';
  settingsToggle.style.background = 'rgba(9,20,32,.90)';
  settingsToggle.style.color = '#d9edf9';
  settingsToggle.style.font = '800 11px system-ui';
  settingsToggle.style.whiteSpace = 'nowrap';

  const settingsBody = document.createElement('div');
  settingsBody.id = 'presentation-settings-body';
  settingsBody.className = 'presentation-settings-body';

  presentationControls.style.position = 'static';
  presentationControls.style.top = 'auto';
  presentationControls.style.right = 'auto';
  presentationControls.style.flexWrap = 'wrap';
  presentationControls.style.justifyContent = 'flex-end';
  presentationControls.style.maxWidth = 'min(620px, calc(100vw - 96px))';

  settingsParent.append(settingsPanel);
  settingsPanel.append(settingsToggle, settingsBody);
  settingsBody.append(presentationControls);

  const isPhoneLandscapeSettings = (): boolean => window.matchMedia('(orientation: landscape) and (max-height: 520px) and (max-width: 1024px)').matches;
  let expanded = !isPhoneLandscapeSettings();
  let userExpandedOverride: boolean | null = null;

  const syncExpandedState = (): void => {
    settingsBody.hidden = !expanded;
    settingsToggle.textContent = expanded ? '⚙ 설정 ▲' : '⚙ 설정 ▼';
    settingsToggle.setAttribute('aria-label', expanded ? '설정 닫기' : '설정 열기');
    settingsToggle.setAttribute('aria-expanded', String(expanded));
    settingsToggle.setAttribute('aria-controls', settingsBody.id);
  };

  syncPresentationSettingsLayout = () => {
    const compact = window.innerWidth <= 1000;
    settingsPanel.style.top = compact ? '84px' : '88px';
    settingsPanel.style.right = compact ? '14px' : '22px';
    if (userExpandedOverride === null) expanded = !isPhoneLandscapeSettings();
    syncExpandedState();
  };

  settingsToggle.addEventListener('click', () => {
    expanded = !expanded;
    userExpandedOverride = expanded;
    syncExpandedState();
  });

  syncPresentationSettingsLayout();
}

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
window.addEventListener('resize', () => { syncHudViewport(); syncPresentationSettingsLayout(); game.resetTransientDecisionInput(); });
window.addEventListener('orientationchange', () => { syncHudViewport(); syncPresentationSettingsLayout(); game.resetTransientDecisionInput(); });

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
