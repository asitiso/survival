# Three-slot equipment and survival progression

Goal: weapon, armor and accessory slots; four readable sets; time-based equipment requirements with bounded combat pressure.
Architecture: pure domain progression rules and pure set calculations; existing shop and combat build consume them. Optional accessory field preserves older snapshots and callers. Existing two-slot items remain valid.
Tech stack: TypeScript, Canvas, DOM shop, node:test.

- [ ] Add accessory purchase/save behavior with regression tests.
- [ ] Add four accessories and four sets, 2 high-quality pieces / 3 rare pieces thresholds; apply once to combat and purchase comparison.
- [ ] Keep six shop cards: two weapons, two armors, one accessory, one potion; guarantee equipped upgrades and accessory matching the equipped weapon. Price and time gates enforced on click, with explicit disabled reasons.
- [ ] Separate time-gated quality milestones and continuous enemy HP/damage curve. Preserve enemy counts/speeds and telegraphs. Forecast cost and incoming damage with reproducible script, avoid implying full playtest results.
- [ ] Add accessory artwork, show three slots and set activation/loss inline in shop, no added global HUD row.
- [ ] Validate storage, replacement safety, set transitions, every enemy spawn path, thresholds, budget trajectories, browser shop and full existing suite.
