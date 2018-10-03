export default class Curve {
	constructor(opt) {
		this.controller = opt.controller;
		this.definition = opt.definition;
	}

	_globAttenuationEquation(x) {
		return Math.pow(4 / (4 + Math.pow(x, 4)), 4);
	}

	_xpos(i) {
		return (this.controller.$.width / 2) + i * (this.controller.$.width / 4);
	}

	_ypos(i) {
		const att = (this.controller.$.heightMax * this.controller.amplitude) / this.definition.attenuation;
		return (this.controller.$.height / 2) + this._globAttenuationEquation(i) * att * Math.sin(this.controller.frequency * i - this.controller.phase);
	}

	draw() {
		const ctx = this.controller.ctx;

		ctx.moveTo(0, 0);
		ctx.beginPath();
		ctx.strokeStyle = 'rgba(' + this.controller.color + ',' + this.definition.opacity + ')';
		ctx.lineWidth = this.definition.lineWidth;

		for (let i = -2; i <= 2; i += 0.01) {
			let y = this._ypos(i);
			if (Math.abs(i) >= 1.90) y = (this.controller.$.height / 2);
			ctx.lineTo(this._xpos(i), y);
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