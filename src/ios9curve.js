import lerp from 'lerp';

export default class iOS9Curve {
	constructor(opt = {}) {
		this.ctrl = opt.ctrl;
		this.definition = opt.definition;

		this.GRAPH_X = 6;
		this.AMPLITUDE_FACTOR = 0.5;
		this.SPEED_FACTOR = 1;
		this.DEAD_PX = 2;
		this.ATT_FACTOR = 4;

		this.DESPAWN_FACTOR = 0.02;

		this.NOOFCURVES_RANGES = [5, 10];
		this.AMPLITUDE_RANGES = [0.6, 1];
		this.OFFSET_RANGES = [-this.GRAPH_X / 4, this.GRAPH_X / 4];
		this.WIDTH_RANGES = [0.5, 1];
		this.SPEED_RANGES = [1, 1];
		this.DESPAWN_TIMEOUT_RANGES = [500, 2000];

		// The padding (left and right) to use when drawing waves
		this.PADDING_PX = 0.1 * this.ctrl.width;
		this.MAX_WIDTH_PX = this.ctrl.width - this.PADDING_PX * 2;
		this.MAX_WIDTH_EACH_CURVE_PX = this.MAX_WIDTH_PX * 0.7;

		this.xBasePoint = (this.ctrl.width / 2) + this._getRandomRange([-this.PADDING_PX, this.PADDING_PX]);

		this._respawn();
	}

	_getRandomRange(e) {
		return e[0] + (Math.random() * (e[1] - e[0]));
	}

	_respawnSingle(ci) {
		this.phases[ci] = 0;
		this.amplitudes[ci] = 0;

		this.despawnTimeouts[ci] = this._getRandomRange(this.DESPAWN_TIMEOUT_RANGES);
		this.offsets[ci] = this._getRandomRange(this.OFFSET_RANGES);
		this.speeds[ci] = this._getRandomRange(this.SPEED_RANGES);
		this.finalAmplitudes[ci] = this._getRandomRange(this.AMPLITUDE_RANGES);
		this.widths[ci] = this._getRandomRange(this.WIDTH_RANGES);
	}

	_respawn() {
		this.spawnAt = Date.now();

		this.noOfCurves = this.NOOFCURVES_RANGES[
			(Math.random() * this.NOOFCURVES_RANGES) | 0
		];

		this.phases = new Array(this.noOfCurves);
		this.offsets = new Array(this.noOfCurves);
		this.speeds = new Array(this.noOfCurves);
		this.finalAmplitudes = new Array(this.noOfCurves);
		this.widths = new Array(this.noOfCurves);
		this.amplitudes = new Array(this.noOfCurves);
		this.despawnTimeouts = new Array(this.noOfCurves);

		for (let ci = 0; ci < this.noOfCurves; ci++) {
			this._respawnSingle(ci);
		}
	}

	_globalAttFn(x) {
		return Math.pow(
			(this.ATT_FACTOR) / (this.ATT_FACTOR + Math.pow(x, 2)),
			this.ATT_FACTOR
		);
	}

	_sin(x, phase) {
		return Math.sin(x - phase);
	}

	_grad(x, a, b) {
		if (x > a && x < b) return 1;
		return 1;
	}

	_yRelativePos(i) {
		let y = 0;

		for (let ci = 0; ci < this.noOfCurves; ci++) {
			const t = this.offsets[ci];
			const k = 1 / this.widths[ci];
			const x = (i * k) - t;

			y += Math.abs(
				this.amplitudes[ci] *
				this._sin(x, this.phases[ci]) *
				this._globalAttFn(x)
			);
		}

		// Divide for NoOfCurves so that y <= 1
		return y / this.noOfCurves;
	}

	_ypos(i) {
		return (
			this.AMPLITUDE_FACTOR *
			this.ctrl.heightMax *
			this.ctrl.amplitude *
			this._yRelativePos(i)
		);
	}

	_xpos(i) {
		return this.xBasePoint + (i / this.GRAPH_X) * this.MAX_WIDTH_EACH_CURVE_PX;
	}

	_drawSupportLine(ctx) {
		const coo = [0, this.ctrl.heightMax, this.ctrl.width, 1];
		var gradient = ctx.createLinearGradient.apply(ctx, coo);
		gradient.addColorStop(0, 'transparent');
		gradient.addColorStop(0.1, 'rgba(255,255,255,.5)');
		gradient.addColorStop(1 - 0.1 - 0.1, 'rgba(255,255,255,.5)');
		gradient.addColorStop(1, 'transparent');

		ctx.fillStyle = gradient;
		ctx.fillRect.apply(ctx, coo);
	}

	draw() {
		const ctx = this.ctrl.ctx;

		ctx.globalAlpha = 0.75;
		ctx.globalCompositeOperation = 'lighter';

		if (this.definition.supportLine) {
			return this._drawSupportLine(ctx);
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

		let maxY = 0;

		// Write two opposite waves
		for (let sign of [1, -1]) {
			ctx.beginPath();

			// Cycle the graph from -X to +X every PX_DEPTH and draw the line
			for (
				let i = -this.GRAPH_X; i <= this.GRAPH_X; i += this.ctrl.opt.pixelDepth
			) {
				const x = this._xpos(i);
				const y = sign * this._ypos(i);
				maxY = Math.max(maxY, y);
				ctx.lineTo(x, this.ctrl.heightMax + y);
			}

			ctx.closePath();
			ctx.fillStyle = 'rgba(' + this.definition.color + ', 1)';

			ctx.fill();
		}

		if (maxY < this.DEAD_PX && this.prevMaxY > maxY) {
			console.log('respawn');
			this._respawn();
		}

		this.prevMaxY = maxY;
	}

	static getDefinition() {
		return [{
				color: "255,255,255",
				supportLine: true
			},
			{
				// blue
				color: "15, 82, 169"
			},
			{
				// red
				color: "173, 57, 76"
			},
			{
				// green
				color: "48, 220, 155"
			}

		];
	}
}