import { Game } from './game/game.js';
import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './game/config.js';
import { visualRegressionProbe, visualProbeSignature } from './game/visual-regression-probe.js';
import { auditRenderContract, renderContract, renderContractSignature } from './game/render-contract.js';
const app = document.querySelector('#app');
if (!app)
    throw new Error('#app not found');
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
window.addEventListener('resize', () => { game.resetTransientDecisionInput(); });
window.addEventListener('orientationchange', () => { game.resetTransientDecisionInput(); });
game.start();
const visualProbe = new URLSearchParams(window.location.search).get('visualProbe');
if (visualProbe !== null) {
    const probe = visualRegressionProbe(window.innerWidth || LOGICAL_WIDTH, window.innerHeight || LOGICAL_HEIGHT);
    document.documentElement.dataset.visualProbe = visualProbeSignature(probe);
    const contract = renderContract(window.innerWidth || LOGICAL_WIDTH, window.innerHeight || LOGICAL_HEIGHT);
    document.documentElement.dataset.renderContract = renderContractSignature(contract);
    window.__arcaneVisualProbe = probe;
    window.__arcaneRenderContract = { contract, audit: auditRenderContract(contract) };
}
window.defenseGame = game;
