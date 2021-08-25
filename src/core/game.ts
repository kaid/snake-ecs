interface GameContext {
  lastDt: number;
  loopId: number;
}

export class Game {
  private context: GameContext;

  constructor(
    private frameInterval: number,
    private loop: (dt: number) => unknown,
    private _tearDown: (context: GameContext) => unknown,
  ) {
    this.context = {lastDt: -1, loopId: -1};
  }

  public start = (dt: number = performance.now()): void => {
    if (this.context.loopId < 0 || dt - this.context.lastDt >= this.frameInterval) {
      this.loop(dt);
      this.context.lastDt = dt;
    }

    this.context.loopId = requestAnimationFrame(this.start);
  };

  public tearDown(): void {
    this._tearDown(this.context);
    this.context = {lastDt: -1, loopId: -1};
  }
}
