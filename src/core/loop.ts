export class FixedGameLoop {
  private running = false;
  private last = 0;
  private accumulator = 0;
  private frameId = 0;
  private readonly step = 1 / 60;

  constructor(
    private readonly update: (dt: number) => void,
    private readonly render: (alpha: number) => void,
  ) {}

  start(): void {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.frameId = requestAnimationFrame(this.frame);
  }

  stop(): void {
    this.running = false;
    cancelAnimationFrame(this.frameId);
  }

  private readonly frame = (now: number): void => {
    if (!this.running) return;
    const elapsed = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    this.accumulator += elapsed;
    while (this.accumulator >= this.step) {
      this.update(this.step);
      this.accumulator -= this.step;
    }
    this.render(this.accumulator / this.step);
    this.frameId = requestAnimationFrame(this.frame);
  };
}
