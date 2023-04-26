import SiriWave, { ICurve, IiOS9CurveDefinition } from "./index";

export class iOS9Curve implements ICurve {
  ctrl: SiriWave;
  definition: IiOS9CurveDefinition;

  spawnAt: number;
  noOfCurves: number;
  prevMaxY: number;

  phases: number[];
  amplitudes: number[];
  despawnTimeouts: number[];
  offsets: number[];
  speeds: number[];
  finalAmplitudes: number[];
  widths: number[];
  verses: number[];

  GRAPH_X = 25;
  AMPLITUDE_FACTOR = 0.8;
  SPEED_FACTOR = 1;
  DEAD_PX = 2;
  ATT_FACTOR = 4;

  DESPAWN_FACTOR = 0.02;

  DEFAULT_NOOFCURVES_RANGES: [number, number] = [2, 5];
  DEFAULT_AMPLITUDE_RANGES: [number, number] = [0.3, 1];
  DEFAULT_OFFSET_RANGES: [number, number] = [-3, 3];
  DEFAULT_WIDTH_RANGES: [number, number] = [1, 3];
  DEFAULT_SPEED_RANGES: [number, number] = [0.5, 1];
  DEFAULT_DESPAWN_TIMEOUT_RANGES: [number, number] = [500, 2000];

  constructor(ctrl: SiriWave, definition: IiOS9CurveDefinition) {
    this.ctrl = ctrl;
    this.definition = definition;

    this.noOfCurves = 0;
    this.spawnAt = 0;
    this.prevMaxY = 0;

    this.phases = [];
    this.offsets = [];
    this.speeds = [];
    this.finalAmplitudes = [];
    this.widths = [];
    this.amplitudes = [];
    this.despawnTimeouts = [];
    this.verses = [];
  }

  private getRandomRange(e: [number, number]): number {
    return e[0] + Math.random() * (e[1] - e[0]);
  }

  private spawnSingle(ci: number): void {
    this.phases[ci] = 0;
    this.amplitudes[ci] = 0;

    this.despawnTimeouts[ci] = this.getRandomRange(
      this.ctrl.opt.ranges?.despawnTimeout ?? this.DEFAULT_DESPAWN_TIMEOUT_RANGES,
    );
    this.offsets[ci] = this.getRandomRange(this.ctrl.opt.ranges?.offset ?? this.DEFAULT_OFFSET_RANGES);
    this.speeds[ci] = this.getRandomRange(this.ctrl.opt.ranges?.speed ?? this.DEFAULT_SPEED_RANGES);
    this.finalAmplitudes[ci] = this.getRandomRange(this.ctrl.opt.ranges?.amplitude ?? this.DEFAULT_AMPLITUDE_RANGES);
    this.widths[ci] = this.getRandomRange(this.ctrl.opt.ranges?.width ?? this.DEFAULT_WIDTH_RANGES);
    this.verses[ci] = this.getRandomRange([-1, 1]);
  }

  private getEmptyArray(count: number): number[] {
    return new Array(count);
  }

  private spawn(): void {
    this.spawnAt = Date.now();

    this.noOfCurves = Math.floor(
      this.getRandomRange(this.ctrl.opt.ranges?.noOfCurves ?? this.DEFAULT_NOOFCURVES_RANGES),
    );

    this.phases = this.getEmptyArray(this.noOfCurves);
    this.offsets = this.getEmptyArray(this.noOfCurves);
    this.speeds = this.getEmptyArray(this.noOfCurves);
    this.finalAmplitudes = this.getEmptyArray(this.noOfCurves);
    this.widths = this.getEmptyArray(this.noOfCurves);
    this.amplitudes = this.getEmptyArray(this.noOfCurves);
    this.despawnTimeouts = this.getEmptyArray(this.noOfCurves);
    this.verses = this.getEmptyArray(this.noOfCurves);

    for (let ci = 0; ci < this.noOfCurves; ci++) {
      this.spawnSingle(ci);
    }
  }

  private globalAttFn(x: number): number {
    return Math.pow(this.ATT_FACTOR / (this.ATT_FACTOR + Math.pow(x, 2)), this.ATT_FACTOR);
  }

  private sin(x: number, phase: number): number {
    return Math.sin(x - phase);
  }

  private yRelativePos(i: number): number {
    let y = 0;

    for (let ci = 0; ci < this.noOfCurves; ci++) {
      // Generate a static T so that each curve is distant from each oterh
      let t = 4 * (-1 + (ci / (this.noOfCurves - 1)) * 2);
      // but add a dynamic offset
      t += this.offsets![ci];

      const k = 1 / this.widths![ci];
      const x = i * k - t;

      y += Math.abs(this.amplitudes[ci] * this.sin(this.verses[ci] * x, this.phases[ci]) * this.globalAttFn(x));
    }

    // Divide for NoOfCurves so that y <= 1
    return y / this.noOfCurves;
  }

  private yPos(i: number): number {
    return (
      this.AMPLITUDE_FACTOR *
      this.ctrl.heightMax *
      this.ctrl.amplitude *
      this.yRelativePos(i) *
      this.globalAttFn((i / this.GRAPH_X) * 2)
    );
  }

  private xPos(i: number): number {
    return this.ctrl.width * ((i + this.GRAPH_X) / (this.GRAPH_X * 2));
  }

  private drawSupportLine() {
    const { ctx } = this.ctrl;

    const coo: [number, number, number, number] = [0, this.ctrl.heightMax, this.ctrl.width, 1];
    const gradient = ctx.createLinearGradient.apply(ctx, coo);
    gradient.addColorStop(0, "transparent");
    gradient.addColorStop(0.1, "rgba(255,255,255,.5)");
    gradient.addColorStop(1 - 0.1 - 0.1, "rgba(255,255,255,.5)");
    gradient.addColorStop(1, "transparent");

    ctx.fillStyle = gradient;
    ctx.fillRect.apply(ctx, coo);
  }

  draw() {
    const { ctx } = this.ctrl;

    ctx.globalAlpha = 0.7;
    ctx.globalCompositeOperation = this.ctrl.opt.globalCompositeOperation!;

    if (this.spawnAt === 0) {
      this.spawn();
    }

    if (this.definition.supportLine) {
      // Draw the support line
      return this.drawSupportLine();
    }

    for (let ci = 0; ci < this.noOfCurves; ci++) {
      if (this.spawnAt + this.despawnTimeouts[ci] <= Date.now()) {
        this.amplitudes[ci] -= this.DESPAWN_FACTOR;
      } else {
        this.amplitudes[ci] += this.DESPAWN_FACTOR;
      }

      this.amplitudes[ci] = Math.min(Math.max(this.amplitudes[ci], 0), this.finalAmplitudes[ci]);
      this.phases[ci] = (this.phases[ci] + this.ctrl.speed * this.speeds[ci] * this.SPEED_FACTOR) % (2 * Math.PI);
    }

    let maxY = -Infinity;
    let minX = +Infinity;

    // Write two opposite waves
    for (const sign of [1, -1]) {
      ctx.beginPath();

      for (let i = -this.GRAPH_X; i <= this.GRAPH_X; i += this.ctrl.opt.pixelDepth!) {
        const x = this.xPos(i);
        const y = this.yPos(i);
        ctx.lineTo(x, this.ctrl.heightMax - sign * y);

        minX = Math.min(minX, x);
        maxY = Math.max(maxY, y);
      }

      ctx.closePath();

      ctx.fillStyle = `rgba(${this.definition.color}, 1)`;
      ctx.strokeStyle = `rgba(${this.definition.color}, 1)`;
      ctx.fill();
    }

    if (maxY < this.DEAD_PX && this.prevMaxY > maxY) {
      this.spawnAt = 0;
    }

    this.prevMaxY = maxY;

    return null;
  }

  static getDefinition(): IiOS9CurveDefinition[] {
    return [
      {
        color: "255,255,255",
        supportLine: true,
      },
      {
        // blue
        color: "15, 82, 169",
      },
      {
        // red
        color: "173, 57, 76",
      },
      {
        // green
        color: "48, 220, 155",
      },
    ];
  }
}
