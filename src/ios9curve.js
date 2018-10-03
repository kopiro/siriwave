export default class iOS9Curve {
	constructor(opt) {
		this.controller = opt.controller;
		this.definition = opt.definition;
		this.tick = 0;

		this._respawn();
	}

	_respawn() {
		this.amplitude = 0.3 + Math.random() * 0.7;
		this.seed = Math.random();
		this.openClass = 2 + (Math.random() * 3) | 0;
	}

	_ypos(i) {
		const y = -1 * Math.abs(Math.sin(this.tick)) * this.controller.amplitude * this.amplitude * this.controller.$.heightMax * Math.pow(1 / (1 + Math.pow(this.openClass * i, 2)), 2);

		if (Math.abs(y) < 0.001) {
			this._respawn();
		}

		return y;
	}

	_draw(sign) {
		const ctx = this.controller.ctx;

		this.tick += this.controller.speed * (1 - 0.5 * Math.sin(this.seed * Math.PI));

		ctx.beginPath();

		let xBase = (this.controller.$.width / 2) + (-(this.controller.$.width / 4) + this.seed * (this.controller.$.width / 2));
		let yBase = (this.controller.$.height / 2);

		let x, y;
		let xInit = null;

		for (let i = -3; i <= 3; i += 0.01) {
			x = xBase + i * (this.controller.$.width / 4);
			y = yBase + ((sign || 1) * this._ypos(i));
			if (xInit == null) xInit = x;
			ctx.lineTo(x, y);
		}

		const height = Math.abs(this._ypos(0));

		const gradient = ctx.createRadialGradient(xBase, yBase, height * 1.15, xBase, yBase, height * 0.3);
		gradient.addColorStop(0, 'rgba(' + this.definition.color + ', 0.4)');
		gradient.addColorStop(1, 'rgba(' + this.definition.color + ', 0.2)');
		ctx.fillStyle = gradient;

		ctx.lineTo(xInit, yBase);
		ctx.closePath();

		ctx.fill();
	}

	draw() {
		this._draw(-1);
		this._draw(1);
	}

	static getDefinition() {
		return [{
				color: '32,133,252'
			},
			{
				color: '94,252,169'
			},
			{
				color: '253,71,103'
			}
		];
	}
}