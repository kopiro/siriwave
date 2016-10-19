(function() {

////////////////////
// SiriWave9Curve //
////////////////////

function SiriWave9Curve(opt) {
	opt = opt || {};
	this.controller = opt.controller;
	this.color = opt.color;
	this.tick = 0;

	this.respawn();
}

SiriWave9Curve.prototype.respawn = function() {
	this.amplitude = 0.3 + Math.random() * 0.7;
	this.seed = Math.random();
	this.open_class = 2+(Math.random()*3)|0;
};

SiriWave9Curve.prototype.equation = function(i) {
	var p = this.tick;
	var y = -1 * Math.abs(Math.sin(p)) * this.controller.amplitude * this.amplitude * this.controller.MAX * Math.pow(1/(1+Math.pow(this.open_class*i,2)),2);
	if (Math.abs(y) < 0.001) {
		this.respawn();
	}
	return y;
};

SiriWave9Curve.prototype._draw = function(m) {
	this.tick += this.controller.speed * (1-0.5*Math.sin(this.seed*Math.PI));

	var ctx = this.controller.ctx;
	ctx.beginPath();

	var x_base = this.controller.width/2 + (-this.controller.width/4 + this.seed*(this.controller.width/2) );
	var y_base = this.controller.height/2;

	var x, y, x_init;

	var i = -3;
	while (i <= 3) {
		x = x_base + i * this.controller.width/4;
		y = y_base + (m * this.equation(i));
		x_init = x_init || x;
		ctx.lineTo(x, y);
		i += 0.01;
	}

	var h = Math.abs(this.equation(0));
	var gradient = ctx.createRadialGradient(x_base, y_base, h*1.15, x_base, y_base, h * 0.3 );
	gradient.addColorStop(0, 'rgba(' + this.color.join(',') + ',0.4)');
	gradient.addColorStop(1, 'rgba(' + this.color.join(',') + ',0.2)');

	ctx.fillStyle = gradient;

	ctx.lineTo(x_init, y_base);
	ctx.closePath();

	ctx.fill();
};

SiriWave9Curve.prototype.draw = function() {
	this._draw(-1);
	this._draw(1);
};


//////////////
// SiriWave //
//////////////

function SiriWave9(opt) {
	opt = opt || {};

	this.tick = 0;
	this.run = false;

	// UI vars

	this.ratio = opt.ratio || window.devicePixelRatio || 1;

	this.width = this.ratio * (opt.width || 320);
	this.height = this.ratio * (opt.height || 100);
	this.MAX = this.height/2;

	this.speed = 0.1;
	this.amplitude = opt.amplitude || 1;

	// Interpolation

	this.speedInterpolationSpeed = opt.speedInterpolationSpeed || 0.005;
	this.amplitudeInterpolationSpeed = opt.amplitudeInterpolationSpeed || 0.05;

	this._interpolation = {
		speed: this.speed,
		amplitude: this.amplitude
	};

	// Canvas

	this.canvas = document.createElement('canvas');
	this.canvas.width = this.width;
	this.canvas.height = this.height;

	if (opt.cover) {
		this.canvas.style.width = this.canvas.style.height = '100%';
	} else {
		this.canvas.style.width = (this.width / this.ratio) + 'px';
		this.canvas.style.height = (this.height / this.ratio) + 'px';
	}

	this.container = opt.container || document.body;
	this.container.appendChild(this.canvas);

	this.ctx = this.canvas.getContext('2d');

	// Create curves

	this.curves = [];
	for (var i = 0; i < SiriWave9.prototype.COLORS.length; i++) {
		var color = SiriWave9.prototype.COLORS[i];
		for (var j = 0; j < (3 * Math.random())|0; j++) {
			this.curves.push(new SiriWave9Curve({
				controller: this,
				color: color
			}));
		}
	}

	if (opt.autostart) {
		this.start();
	}
}

SiriWave9.prototype._interpolate = function(propertyStr) {
	increment = this[ propertyStr + 'InterpolationSpeed' ];

	if (Math.abs(this._interpolation[propertyStr] - this[propertyStr]) <= increment) {
		this[propertyStr] = this._interpolation[propertyStr];
	} else {
		if (this._interpolation[propertyStr] > this[propertyStr]) {
			this[propertyStr] += increment;
		} else {
			this[propertyStr] -= increment;
		}
	}
};

SiriWave9.prototype._clear = function() {
	this.ctx.globalCompositeOperation = 'destination-out';
	this.ctx.fillRect(0, 0, this.width, this.height);
	this.ctx.globalCompositeOperation = 'lighter';
};

SiriWave9.prototype._draw = function() {
	for (var i = 0, len = this.curves.length; i < len; i++) {
		this.curves[i].draw();
	}
};

SiriWave9.prototype._startDrawCycle = function() {
	if (this.run === false) return;
	this._clear();

	// Interpolate values
	this._interpolate('amplitude');
	this._interpolate('speed');

	this._draw();
	this.phase = (this.phase + Math.PI*this.speed) % (2*Math.PI);

	if (window.requestAnimationFrame) {
		window.requestAnimationFrame(this._startDrawCycle.bind(this));
	} else {
		setTimeout(this._startDrawCycle.bind(this), 20);
	}
};

SiriWave9.prototype.start = function() {
	this.tick = 0;
	this.run = true;
	this._startDrawCycle();
};

SiriWave9.prototype.stop = function() {
	this.tick = 0;
	this.run = false;
};

SiriWave9.prototype.setSpeed = function(v, increment) {
	this._interpolation.speed = v;
};

SiriWave9.prototype.setNoise = SiriWave9.prototype.setAmplitude = function(v) {
	this._interpolation.amplitude = Math.max(Math.min(v, 1), 0);
};

SiriWave9.prototype.COLORS = [
[32,133,252],
[94,252,169],
[253,71,103]
];

if (typeof define === 'function' && define.amd) {
	define(function(){ return SiriWave9; });
} else {
	window.SiriWave9 = SiriWave9;
}

})();
