export class FixedGameLoop {
    update;
    render;
    running = false;
    last = 0;
    accumulator = 0;
    frameId = 0;
    step = 1 / 60;
    constructor(update, render) {
        this.update = update;
        this.render = render;
    }
    start() {
        if (this.running)
            return;
        this.running = true;
        this.last = performance.now();
        this.frameId = requestAnimationFrame(this.frame);
    }
    stop() {
        this.running = false;
        cancelAnimationFrame(this.frameId);
    }
    frame = (now) => {
        if (!this.running)
            return;
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
