export default class iOS9Curve {
	constructor(opt = {}) {
		this.ctrl = opt.ctrl;
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
		const y = -1 *
			// Actual real Y in the SIN function
			Math.abs(Math.sin(this.tick)) *
			// Amplitude of the original controller
			this.ctrl.amplitude *
			// Amplitude of current wave
			this.amplitude *
			// Maximum height for the complete wave
			this.ctrl.heightMax *
			// Class of the wave (small to big)
			Math.pow(1 / (1 + Math.pow(this.openClass * i, 2)), 2);

		// If we reach a minimum threshold to consider this wave "dead", 
		// respawn with other properties
		if (Math.abs(y) < this.ctrl.DEAD_THRESHOLD) {
			this._respawn();
		}

		return y;
	}

	_draw(sign) {
		const ctx = this.ctrl.ctx;

		this.tick += this.ctrl.speed * (1 - 0.5 * Math.sin(this.seed * Math.PI));

		ctx.beginPath();

		let xBase = (this.ctrl.width / 2) + (-(this.ctrl.width / 4) + this.seed * (this.ctrl.width / 2));
		let yBase = (this.ctrl.height / 2);

		let x, y, xInit;

		for (let i = -this.ctrl.MAX_X; i <= this.ctrl.MAX_X; i += this.ctrl.opt.pixelDepth) {
			x = xBase + i * (this.ctrl.width / 4);
			y = yBase + (sign * this._ypos(i));
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