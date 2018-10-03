class Curve {
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

class iOS9Curve {
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

class SiriWave {

	constructor(opt = {}) {
		this.phase = 0;
		this.run = false;
		this.$ = {};

		if (opt.container == null) {
			console.warn("No container defined, using body");
			opt.container = document.body;
		}

		this.style = opt.style || 'ios';

		this.container = opt.container;

		this.width = opt.width || window.getComputedStyle(this.container).width.replace('px', '');
		this.height = opt.height || window.getComputedStyle(this.container).height.replace('px', '');
		this.ratio = opt.ratio || window.devicePixelRatio || 1;

		this.$.width = this.ratio * this.width;
		this.$.height = this.ratio * this.height;
		this.$.heightMax = (this.$.height / 2) - 4;

		// Constructor opt

		this.amplitude = (opt.amplitude == undefined) ? 1 : opt.amplitude;
		this.speed = (opt.speed == undefined) ? 0.2 : opt.speed;
		this.frequency = (opt.frequency == undefined) ? 6 : opt.frequency;
		this.color = this._hex2rgb(opt.color || '#fff');

		// Interpolation

		this.speedInterpolationSpeed = opt.speedInterpolationSpeed || 0.005;
		this.amplitudeInterpolationSpeed = opt.amplitudeInterpolationSpeed || 0.05;

		this.$.interpolation = {
			speed: this.speed,
			amplitude: this.amplitude
		};

		// Canvas

		this.canvas = document.createElement('canvas');
		this.ctx = this.canvas.getContext('2d');
		this.canvas.width = this.$.width;
		this.canvas.height = this.$.height;

		if (opt.cover) {
			this.canvas.style.width = this.canvas.style.height = '100%';
		} else {
			this.canvas.style.width = (this.$.width / this.ratio) + 'px';
			this.canvas.style.height = (this.$.height / this.ratio) + 'px';
		}

		this.curves = [];

		if (this.style === 'ios9') {
			for (let def of iOS9Curve.getDefinition()) {
				for (let j = 0; j < (3 * Math.random()) | 0; j++) {
					this.curves.push(new iOS9Curve({
						controller: this,
						definition: def
					}));
				}
			}
		} else {
			for (let def of Curve.getDefinition()) {
				this.curves.push(new Curve({
					controller: this,
					definition: def
				}));
			}
		}

		// Start
		this.container.appendChild(this.canvas);
		if (opt.autostart) {
			this.start();
		}
	}

	_hex2rgb(hex) {
		let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
		hex = hex.replace(shorthandRegex, function (m, r, g, b) {
			return r + r + g + g + b + b;
		});
		let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
		return result ?
			parseInt(result[1], 16).toString() + ',' + parseInt(result[2], 16).toString() + ',' + parseInt(result[3], 16).toString() :
			null;
	}

	_interpolate(propertyStr) {
		let increment = this[propertyStr + 'InterpolationSpeed'];

		if (Math.abs(this.$.interpolation[propertyStr] - this[propertyStr]) <= increment) {
			this[propertyStr] = this.$.interpolation[propertyStr];
		} else {
			if (this.$.interpolation[propertyStr] > this[propertyStr]) {
				this[propertyStr] += increment;
			} else {
				this[propertyStr] -= increment;
			}
		}
	}

	_clear() {
		this.ctx.globalCompositeOperation = 'destination-out';
		this.ctx.fillRect(0, 0, this.$.width, this.$.height);
		this.ctx.globalCompositeOperation = 'source-over';
	}

	_draw() {
		for (let i = 0, len = this.curves.length; i < len; i++) {
			this.curves[i].draw();
		}
	}

	_startDrawCycle() {
		if (this.run === false) return;
		this._clear();

		// Interpolate values
		this._interpolate('amplitude');
		this._interpolate('speed');

		this._draw();
		this.phase = (this.phase + Math.PI * this.speed) % (2 * Math.PI);

		if (window.requestAnimationFrame) {
			window.requestAnimationFrame(this._startDrawCycle.bind(this));
		} else {
			setTimeout(this._startDrawCycle.bind(this), 20);
		}
	}

	/* API */

	start() {
		this.phase = 0;
		this.run = true;
		this._startDrawCycle();
	}

	stop() {
		this.phase = 0;
		this.run = false;
	}

	setSpeed(v) {
		this.$.interpolation.speed = v;
	}

	setAmplitude(v) {
		this.$.interpolation.amplitude = Math.max(Math.min(v, 1), 0);
	}
}

export default SiriWave;
