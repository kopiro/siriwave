import lerp from 'lerp';

export default class iOS9Curve {
	constructor(opt = {}) {
		this.ctrl = opt.ctrl;
		this.definition = opt.definition;

		this.GRAPH_X = 4;
		this.AMPLITUDE_FACTOR = 2;
		this.SPEED_FACTOR = 2;
		this.DEAD_PX = 1;

		this.NOOFCURVES_RANGES = [3, 6];
		this.AMPLITUDE_RANGES = [0.1, 0.6];
		this.SPEED_RANGES = [0.6, 1];
		this.OFFSET_RANGES = [-this.GRAPH_X / 2, this.GRAPH_X / 2];
		this.PARAMS_RANGES = [1, 2];

		// The padding (left and right) to use when drawing waves
		this.PADDING_PX = 0.1 * this.ctrl.width;
		this.MAX_WIDTH_PX = this.ctrl.width - this.PADDING_PX * 2;
		this.MAX_WIDTH_EACH_CURVE_PX = this.MAX_WIDTH_PX * 0.7;

		this.xBasePoint = (this.ctrl.width / 2) + (((Math.random() * 2) | 0) === 1 ? 1 : -1) * (Math.random() * this.PADDING_PX);

		this._respawn();
	}

	_getRandomRange(e) {
		return e[0] + Math.random() * (e[1] - e[0]);
	}

	_respawnSingle(ci) {
		this.phases[ci] = 0;
		this.offsets[ci] = this._getRandomRange(this.OFFSET_RANGES);
		this.speeds[ci] = this._getRandomRange(this.SPEED_RANGES);
		this.amplitudes[ci] = this._getRandomRange(this.AMPLITUDE_RANGES);
		this.params[ci] = this._getRandomRange(this.PARAMS_RANGES);
	}

	_respawn() {
		this.spawnAt = Date.now();

		this.noOfCurves = this.NOOFCURVES_RANGES[
			(Math.random() * this.NOOFCURVES_RANGES) | 0
		];

		this.phases = new Array(this.noOfCurves);
		this.offsets = new Array(this.noOfCurves);
		this.speeds = new Array(this.noOfCurves);
		this.amplitudes = new Array(this.noOfCurves);
		this.params = new Array(this.noOfCurves);

		for (let ci = 0; ci < this.noOfCurves; ci++) {
			this._respawnSingle(ci);
		}
	}

	_ypos(i) {
		let y = 0;

		for (let ci = 0; ci < this.noOfCurves; ci++) {
			const x = i + this.offsets[ci];
			y += Math.abs(
				// Actual real Y in the SIN function
				Math.sin(this.phases[ci]) *
				// Amplitude of current wave
				this.amplitudes[ci] *
				// Class of the wave
				Math.pow(1 / (1 + Math.pow(this.params[ci] * x, 2)), 2)
			);
		}

		// Divide for NoOfCurves so that y <= 1
		y = y / this.noOfCurves;

		return (
			this.AMPLITUDE_FACTOR * this.ctrl.heightMax * this.ctrl.amplitude * y
		);
	}

	_xpos(i) {
		return (i / this.GRAPH_X) *
			this.MAX_WIDTH_EACH_CURVE_PX;
	}

	draw() {
		const ctx = this.ctrl.ctx;

		ctx.globalAlpha = 0.5;
		ctx.globalCompositeOperation = "lighter";

		if (this.definition.supportLine) {
			const coo = [0, this.ctrl.heightMax, this.ctrl.width, 1];
			var gradient = ctx.createLinearGradient.apply(ctx, coo);
			gradient.addColorStop(0, "transparent");
			gradient.addColorStop(0.1, "rgba(255,255,255,.5)");
			gradient.addColorStop(1 - 0.1 - 0.1, "rgba(255,255,255,.5)");
			gradient.addColorStop(1, "transparent");

			ctx.fillStyle = gradient;
			ctx.fillRect.apply(ctx, coo);

			return;
		}

		for (let ci = 0; ci < this.noOfCurves; ci++) {
			this.phases[ci] += this.SPEED_FACTOR * this.ctrl.speed * this.speeds[ci] * Math.random();
		}

		let maxY = this._ypos(0);
		if (maxY < this.DEAD_PX && this.prevMaxY > maxY) {
			this.prevMaxY = maxY;
			this._respawn();
			return;
		}
		this.prevMaxY = maxY;

		// Write two opposite waves
		for (let sign of [1, -1]) {
			ctx.beginPath();

			// Cycle the graph from -X to +X every PX_DEPTH and draw the line
			for (
				let i = -this.GRAPH_X; i <= this.GRAPH_X; i += this.ctrl.opt.pixelDepth
			) {
				const x = this._xpos(i);
				const y = sign * this._ypos(i);
				ctx.lineTo(this.xBasePoint + x, this.ctrl.heightMax + y);
			}

			// Ensure path is fully closed
			ctx.lineTo(
				this.xBasePoint - this.MAX_WIDTH_EACH_CURVE_PX,
				this.ctrl.heightMax + 0
			);

			ctx.closePath();
			const grad = ctx.createLinearGradient(
				this.xBasePoint - this.MAX_WIDTH_EACH_CURVE_PX,
				0,
				this.xBasePoint + this.MAX_WIDTH_EACH_CURVE_PX,
				this.ctrl.heightMax
			);
			ctx.fillStyle = "rgba(" + this.definition.color + ", 1)";

			ctx.fill();
		}
	}

	static getDefinition() {
		return [{
				color: "255,255,255",
				supportLine: true
			},
			{
				// blue
				color: "12, 107, 192"
			},
			{
				// red
				color: "135, 46, 76"
			},
			{
				// green
				color: "73, 226, 158"
			}

		];
	}
}