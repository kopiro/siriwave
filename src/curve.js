export default class Curve {
  constructor(opt) {
    this.ctrl = opt.ctrl;
    this.definition = opt.definition;

    this.ATT_FACTOR = 4;
    this.GRAPH_X = 2;
    this.AMPLITUDE_FACTOR = 0.6;
  }

  globalAttFn(x) {
    return Math.pow(
      this.ATT_FACTOR / (this.ATT_FACTOR + Math.pow(x, this.ATT_FACTOR)),
      this.ATT_FACTOR,
    );
  }

  _xpos(i) {
    return this.ctrl.width * ((i + this.GRAPH_X) / (this.GRAPH_X * 2));
  }

  _ypos(i) {
    return (
      this.AMPLITUDE_FACTOR
      * (this.globalAttFn(i)
        * (this.ctrl.heightMax * this.ctrl.amplitude)
        * (1 / this.definition.attenuation)
        * Math.sin(this.ctrl.opt.frequency * i - this.ctrl.phase))
    );
  }

  draw() {
    const { ctx } = this.ctrl;

    ctx.moveTo(0, 0);
    ctx.beginPath();

    const color = this.ctrl.color.replace(/rgb\(/g, '').replace(/\)/g, '');
    ctx.strokeStyle = `rgba(${color},${this.definition.opacity})`;
    ctx.lineWidth = this.definition.lineWidth;

    // Cycle the graph from -X to +X every PX_DEPTH and draw the line
    for (
      let i = -this.GRAPH_X;
      i <= this.GRAPH_X;
      i += this.ctrl.opt.pixelDepth
    ) {
      ctx.lineTo(this._xpos(i), this.ctrl.heightMax + this._ypos(i));
    }

    ctx.stroke();
  }

  static getDefinition() {
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
