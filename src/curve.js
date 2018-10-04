export default class Curve {
	constructor(opt) {
		this.ctrl = opt.ctrl;
		this.definition = opt.definition;
	}

	_globAttenuationEquation(x) {
		return Math.pow(4 / (4 + Math.pow(x, 4)), 4);
	}

	_xpos(i) {
		return (this.ctrl.width / 2) + i * (this.ctrl.width / 4);
	}

	_ypos(i) {
		const att = (this.ctrl.heightMax * this.ctrl.amplitude) / this.definition.attenuation;
		return (this.ctrl.heightMax) +
			this._globAttenuationEquation(i) *
			att *
			Math.sin(this.ctrl.opt.frequency * i - this.ctrl.phase);
	}

	draw() {
		const ctx = this.ctrl.ctx;

		ctx.moveTo(0, 0);
		ctx.beginPath();
		ctx.strokeStyle = 'rgba(' + this.ctrl.color + ',' + this.definition.opacity + ')';
		ctx.lineWidth = this.definition.lineWidth;

		// Cycle the graph from -X to +X every PX_DEPTH and draw the line
		for (let i = -this.ctrl.MAX_X; i <= this.ctrl.MAX_X; i += this.ctrl.opt.pixelDepth) {
			ctx.lineTo(this._xpos(i), this._ypos(i));
		}

		ctx.stroke();
	}

	static getDefinition() {
		return [{
				attenuation: -2,
				lineWidth: 1,
				opacity: 0.1
			},
			{
				attenuation: -6,
				lineWidth: 1,
				opacity: 0.2
			},
			{
				attenuation: 4,
				lineWidth: 1,
				opacity: 0.4
			},
			{
				attenuation: 2,
				lineWidth: 1,
				opacity: 0.6
			},
			{
				attenuation: 1,
				lineWidth: 1.5,
				opacity: 1
			},
		];
	}
}