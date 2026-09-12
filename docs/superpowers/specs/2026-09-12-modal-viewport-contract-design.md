# Modal viewport contract

## Goal

Every game overlay must keep its primary action visible inside the game viewport at desktop and mobile sizes. Browser zoom must not be required to reach 전투 준비, 재도전, or 로비로 돌아가기.

## Shared layout

Each modal panel uses three explicit regions:

1. A non-scrolling heading region.
2. A flexible, internally scrolling body region.
3. A non-scrolling action footer.

Panels are constrained to the game shell height with safe-area padding. The body, rather than the whole page or panel, receives vertical scrolling. Footer actions retain a 44px minimum touch target.

## Scope

- Results: move result statistics, build code, recap, comparison, and final-build details into the scroll body; keep retry and lobby actions visible.
- Lobby: move upgrades, mastery, threat, history, and resume information into the scroll body; keep 전투 준비 visible.
- Hero select, level-up, trait, and fate: use the same viewport ceiling and scroll only their option grid when needed.
- Shop: retain its existing scroll-body/footer behavior and align it with the same viewport ceiling.

## Responsive behavior

- Desktop and tablet: constrain every panel to its game shell, including short desktop windows.
- Mobile landscape: retain current compact spacing and the agreed font floors (body 12px, choice title 15px, short status 11px).
- No transform scaling or browser zoom assumptions. Decorative space and images compact before text or touch targets.

## Error handling and accessibility

- Scroll bodies use overscroll containment and touch-action pan-y.
- Keyboard focus remains on existing interactive controls; no action is hidden by clipping.
- If body content is longer than the available height, it scrolls without displacing the footer.

## Verification

- Static regression tests assert results and lobby have separate scroll body and persistent action footer.
- Tests cover short desktop and mobile-landscape viewport ceilings, 44px actions, and existing typography floors.
- TypeScript compilation must pass.
