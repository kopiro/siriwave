import ISiriWave from './ISiriWave';
import ICurve9Definition from './ICurve9Definition';

export default class Curve9 {
  ctrl: ISiriWave;
  definition: ICurve9Definition;

  phases: number[];
  amplitudes: number[];
  despawnTimeouts: number[];
  offsets: number[];
  speeds: number[];
  finalAmplitudes: number[];
  widths: number[];
  verses: number[];

  spawnAt: number;
  noOfCurves: number;
  prevMaxY: number;

  GRAPH_X = 25;
  AMPLITUDE_FACTOR = 0.8;
  SPEED_FACTOR = 1;
  DEAD_PX = 2;
  ATT_FACTOR = 4;
  DESPAWN_FACTOR = 0.02;
  FCURVES_RANGES = [2, 5];
  AMPLITUDE_RANGES = [0.3, 1];
  OFFSET_RANGES = [-3, 3];
  WIDTH_RANGES = [1, 3];
  SPEED_RANGES = [0.5, 1];
  DESPAWN_TIMEOUT_RANGES = [500, 2000];
  NOOFCURVES_RANGES: [2, 4];

  constructor(ctrl: ISiriWave, definition: ICurve9Definition) {
    this.ctrl = ctrl;
    this.definition = definition;

    this.respawn();
  }

  getRandomRange(e: number[]) {
    return e[0] + Math.random() * (e[1] - e[0]);
  }

  respawnSingle(ci: number) {
    this.phases[ci] = 0;
    this.amplitudes[ci] = 0;

    this.despawnTimeouts[ci] = this.getRandomRange(this.DESPAWN_TIMEOUT_RANGES);
    this.offsets[ci] = this.getRandomRange(this.OFFSET_RANGES);
    this.speeds[ci] = this.getRandomRange(this.SPEED_RANGES);
    this.finalAmplitudes[ci] = this.getRandomRange(this.AMPLITUDE_RANGES);
    this.widths[ci] = this.getRandomRange(this.WIDTH_RANGES);
    this.verses[ci] = this.getRandomRange([-1, 1]);
  }

  respawn() {
    this.spawnAt = Date.now();

    this.noOfCurves = Math.floor(this.getRandomRange(this.NOOFCURVES_RANGES));

    this.phases = new Array(this.noOfCurves);
    this.offsets = new Array(this.noOfCurves);
    this.speeds = new Array(this.noOfCurves);
    this.finalAmplitudes = new Array(this.noOfCurves);
    this.widths = new Array(this.noOfCurves);
    this.amplitudes = new Array(this.noOfCurves);
    this.despawnTimeouts = new Array(this.noOfCurves);
    this.verses = new Array(this.noOfCurves);

    for (let ci = 0; ci < this.noOfCurves; ci++) {
      this.respawnSingle(ci);
    }
  }

  globalAttFn(x: number) {
    return Math.pow(
      this.ATT_FACTOR / (this.ATT_FACTOR + Math.pow(x, 2)),
      this.ATT_FACTOR
    );
  }

  sin(x: number, phase: number) {
    return Math.sin(x - phase);
  }

  _grad(x: number, a: number, b: number) {
    if (x > a && x < b) return 1;
    return 1;
  }

  yRelativePos(i: number) {
    let y = 0;

    for (let ci = 0; ci < this.noOfCurves; ci++) {
      // Generate a static T so that each curve is distant from each oterh
      let t = 4 * (-1 + (ci / (this.noOfCurves - 1)) * 2);
      // but add a dynamic offset
      t += this.offsets[ci];

      const k = 1 / this.widths[ci];
      const x = i * k - t;

      y += Math.abs(
        this.amplitudes[ci] *
          this.sin(this.verses[ci] * x, this.phases[ci]) *
          this.globalAttFn(x)
      );
    }

    // Divide for NoOfCurves so that y <= 1
    return y / this.noOfCurves;
  }

  _ypos(i: number) {
    return (
      this.AMPLITUDE_FACTOR *
      this.ctrl.heightMax *
      this.ctrl.amplitude *
      this.yRelativePos(i) *
      this.globalAttFn((i / this.GRAPH_X) * 2)
    );
  }

  _xpos(i: number) {
    return this.ctrl.width * ((i + this.GRAPH_X) / (this.GRAPH_X * 2));
  }

  drawSupportLine(ctx: any) {
    const coo = [0, this.ctrl.heightMax, this.ctrl.width, 1];
    const gradient = ctx.createLinearGradient.apply(ctx, coo);
    gradient.addColorStop(0, 'transparent');
    gradient.addColorStop(0.1, 'rgba(255,255,255,.5)');
    gradient.addColorStop(1 - 0.1 - 0.1, 'rgba(255,255,255,.5)');
    gradient.addColorStop(1, 'transparent');

    ctx.fillStyle = gradient;
    ctx.fillRect.apply(ctx, coo);
  }

  draw() {
    const { ctx } = this.ctrl;

    ctx.globalAlpha = 0.7;
    ctx.globalCompositeOperation = 'lighter';

    if (this.definition.supportLine) {
      // Draw the support line
      return this.drawSupportLine(ctx);
    }

    for (let ci = 0; ci < this.noOfCurves; ci++) {
      if (this.spawnAt + this.despawnTimeouts[ci] <= Date.now()) {
        this.amplitudes[ci] -= this.DESPAWN_FACTOR;
      } else {
        this.amplitudes[ci] += this.DESPAWN_FACTOR;
      }

      this.amplitudes[ci] = Math.min(
        Math.max(this.amplitudes[ci], 0),
        this.finalAmplitudes[ci]
      );
      this.phases[ci] =
        (this.phases[ci] +
          this.ctrl.speed * this.speeds[ci] * this.SPEED_FACTOR) %
        (2 * Math.PI);
    }

    let maxY = -Infinity;
    let minX = +Infinity;

    // Write two opposite waves
    for (const sign of [1, -1]) {
      ctx.beginPath();

      for (
        let i = -this.GRAPH_X;
        i <= this.GRAPH_X;
        i += this.ctrl.opt.pixelDepth
      ) {
        const x = this._xpos(i);
        const y = this._ypos(i);
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
      this.respawn();
    }

    this.prevMaxY = maxY;

    return null;
  }

  static getDefinition(waveColors: ICurve9Definition[]): ICurve9Definition[] {
    return Object.assign(
      [
        {
          color: '255,255,255',
          supportLine: true
        },
        {
          // blue
          color: '15, 82, 169'
        },
        {
          // red
          color: '173, 57, 76'
        },
        {
          // green
          color: '48, 220, 155'
        }
      ],
      waveColors
    );
  }
}
