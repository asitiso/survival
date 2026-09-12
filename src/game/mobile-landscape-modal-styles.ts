const STYLE_ID = 'mobile-landscape-modal-sizing-v2';

export const MOBILE_LANDSCAPE_MODAL_CSS = `
@media (orientation: landscape) and (min-height: 431px) and (max-height: 600px) and (max-width: 1024px) {
  .results-overlay .results-panel {
    width: min(68%, 820px);
    max-height: calc(100dvh - 16px);
    padding: 10px 16px;
  }

  .levelup-overlay .levelup-panel,
  .trait-select-overlay .trait-panel,
  .fate-select-overlay .trait-panel {
    width: min(74%, 920px);
    max-height: calc(100dvh - 16px);
  }

  .lobby-overlay .lobby-panel {
    width: min(84%, 1080px);
    max-height: calc(100dvh - 16px);
  }
}

@media (orientation: landscape) and (max-height: 430px) and (max-width: 1024px) {
  .results-overlay .results-panel {
    width: min(66%, 760px);
    max-height: calc(100dvh - 8px);
    padding: 8px 14px;
  }

  .results-overlay .results-emblem {
    margin: 4px auto;
  }

  .results-overlay .results-record {
    margin: 2px auto;
  }

  .results-overlay .results-time {
    margin: 4px 0 6px;
  }

  .results-overlay .results-grid {
    gap: 6px;
    margin: 4px 0;
  }

  .results-overlay .result-card {
    padding: 6px 8px;
  }

  .results-overlay .results-actions {
    margin-top: 6px;
  }

  .results-overlay .results-actions button {
    min-height: 44px;
  }

  .levelup-overlay .levelup-panel,
  .trait-select-overlay .trait-panel,
  .fate-select-overlay .trait-panel {
    width: min(72%, 900px);
    max-height: calc(100dvh - 8px);
  }

  .lobby-overlay .lobby-panel {
    width: min(82%, 1040px);
    max-height: calc(100dvh - 8px);
  }
}
`;

export function installMobileLandscapeModalStyles(doc?: Document): void {
  const target = doc ?? (typeof document === 'undefined' ? undefined : document);
  if (!target || target.getElementById(STYLE_ID)) return;
  const style = target.createElement('style');
  style.id = STYLE_ID;
  style.textContent = MOBILE_LANDSCAPE_MODAL_CSS;
  target.head.append(style);
}
