export default class iOS9Curve {
	constructor(opt = {}) {
		this.ctrl = opt.ctrl;
		this.definition = opt.definition;

		this.phase = 0;

		this.AMPLITUDE_RANGE = [0.1, 1];
		this.WIDTH_RANGE = [0.1, 0.3];

		this._respawn();
	}

	_respawn() {
		// Generate a random seed
		this.seed = Math.random();

		// Generate random properties for this wave
		this.amplitude = this.AMPLITUDE_RANGE[0] + Math.random() * (this.AMPLITUDE_RANGE[1] - this.AMPLITUDE_RANGE[0]);
		this.width = this.ctrl.width * (this.WIDTH_RANGE[0] + Math.random() * (this.WIDTH_RANGE[1] - this.WIDTH_RANGE[0]));

		// Generate a random number to determine the wave class
		this.openClass = 2 + ((Math.random() * 3) | 0);
	}

	_ypos(i) {
		const y = 1 *
			// Actual real Y in the SIN function
			Math.abs(Math.sin(this.phase)) *
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

	draw() {
		this.phase += this.ctrl.speed * (1 - 0.5 * Math.sin(this.seed * Math.PI));

		// TODO:  we have to ensure that same colors are not near
		let xBase = (2 * this.width) + (-this.width + this.seed * (2 * this.width));
		let yBase = this.ctrl.heightMax;

		let x, y;
		const height = Math.abs(this._ypos(0));
		const xInit = xBase + (-this.ctrl.MAX_X) * this.width;
		const ctx = this.ctrl.ctx;

		// Write two opposite waves
		for (let sign of [-1, 1]) {
			ctx.beginPath();

			// Cycle the graph from -X to +X every PX_DEPTH and draw the line
			for (let i = -this.ctrl.MAX_X; i <= this.ctrl.MAX_X; i += this.ctrl.opt.pixelDepth) {
				x = xBase + (i * this.width);
				y = yBase + (sign * this._ypos(i));
				ctx.lineTo(x, y);
			}

			const gradient = ctx.createRadialGradient(
				xBase, yBase, height * 1.15,
				xBase, yBase, height * 0.3
			);
			gradient.addColorStop(0, 'rgba(' + this.definition.color + ', 0.8)');
			gradient.addColorStop(1, 'rgba(' + this.definition.color + ', 0.2)');
			ctx.fillStyle = gradient;

			ctx.lineTo(xInit, yBase);
			ctx.closePath();

			ctx.fill();
		}
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