import SiriWave, { IClassicCurveDefinition, ICurve } from "./index";
export class ClassicCurve implements ICurve {
  ctrl: SiriWave;
  definition: IClassicCurveDefinition;
  ATT_FACTOR = 4;
  GRAPH_X = 2;
  AMPLITUDE_FACTOR = 0.6;

  constructor(ctrl: SiriWave, definition: IClassicCurveDefinition) {
    this.ctrl = ctrl;
    this.definition = definition;
  }

  private globalAttFn(x: number): number {
    return Math.pow(this.ATT_FACTOR / (this.ATT_FACTOR + Math.pow(x, this.ATT_FACTOR)), this.ATT_FACTOR);
  }

  private xPos(i: number): number {
    return this.ctrl.width * ((i + this.GRAPH_X) / (this.GRAPH_X * 2));
  }

  private yPos(i: number): number {
    return (
      this.AMPLITUDE_FACTOR *
      (this.globalAttFn(i) *
        (this.ctrl.heightMax * this.ctrl.amplitude) *
        (1 / this.definition.attenuation) *
        Math.sin(this.ctrl.opt.frequency! * i - this.ctrl.phase))
    );
  }

  draw(): void {
    const { ctx } = this.ctrl;

    ctx.moveTo(0, 0);
    ctx.beginPath();

    const finalColor = this.definition.color || this.ctrl.color;
    const colorHex = finalColor.replace(/rgb\(/g, "").replace(/\)/g, "");
    ctx.strokeStyle = `rgba(${colorHex},${this.definition.opacity})`;
    ctx.lineWidth = this.definition.lineWidth;

    // Cycle the graph from -X to +X every PX_DEPTH and draw the line
    for (let i = -this.GRAPH_X; i <= this.GRAPH_X; i += this.ctrl.opt.pixelDepth!) {
      ctx.lineTo(this.xPos(i), this.ctrl.heightMax + this.yPos(i));
    }

    ctx.stroke();
  }

  static getDefinition(): IClassicCurveDefinition[] {
    return [
      {
        attenuation: -2,
        lineWidth: 1,
        opacity: 0.1,
      },
      {
        attenuation: -6,
        lineWidth: 1,
        opacity: 0.2,
      },
      {
        attenuation: 4,
        lineWidth: 1,
        opacity: 0.4,
      },
      {
        attenuation: 2,
        lineWidth: 1,
        opacity: 0.6,
      },
      {
        attenuation: 1,
        lineWidth: 1.5,
        opacity: 1,
      },
    ];
  }
}
