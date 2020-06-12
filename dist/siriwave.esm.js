/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};

function __rest(s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
}

var Curve = /** @class */ (function () {
    function Curve(ctrl, definition) {
        this.ATT_FACTOR = 4;
        this.GRAPH_X = 2;
        this.AMPLITUDE_FACTOR = 0.6;
        this.ctrl = ctrl;
        this.definition = definition;
    }
    Curve.prototype.globalAttFn = function (x) {
        return Math.pow(this.ATT_FACTOR / (this.ATT_FACTOR + Math.pow(x, this.ATT_FACTOR)), this.ATT_FACTOR);
    };
    Curve.prototype._xpos = function (i) {
        return this.ctrl.width * ((i + this.GRAPH_X) / (this.GRAPH_X * 2));
    };
    Curve.prototype._ypos = function (i) {
        return (this.AMPLITUDE_FACTOR *
            (this.globalAttFn(i) *
                (this.ctrl.heightMax * this.ctrl.amplitude) *
                (1 / this.definition.attenuation) *
                Math.sin(this.ctrl.opt.frequency * i - this.ctrl.phase)));
    };
    Curve.prototype.draw = function () {
        var ctx = this.ctrl.ctx;
        ctx.moveTo(0, 0);
        ctx.beginPath();
        var color = this.ctrl.color.replace(/rgb\(/g, "").replace(/\)/g, "");
        ctx.strokeStyle = "rgba(" + color + "," + this.definition.opacity + ")";
        ctx.lineWidth = this.definition.lineWidth;
        // Cycle the graph from -X to +X every PX_DEPTH and draw the line
        for (var i = -this.GRAPH_X; i <= this.GRAPH_X; i += this.ctrl.opt.pixelDepth) {
            ctx.lineTo(this._xpos(i), this.ctrl.heightMax + this._ypos(i));
        }
        ctx.stroke();
    };
    Curve.getDefinition = function () {
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
    };
    return Curve;
}());

var iOS9Curve = /** @class */ (function () {
    function iOS9Curve(ctrl, definition) {
        this.GRAPH_X = 25;
        this.AMPLITUDE_FACTOR = 0.8;
        this.SPEED_FACTOR = 1;
        this.DEAD_PX = 2;
        this.ATT_FACTOR = 4;
        this.DESPAWN_FACTOR = 0.02;
        this.NOOFCURVES_RANGES = [2, 5];
        this.AMPLITUDE_RANGES = [0.3, 1];
        this.OFFSET_RANGES = [-3, 3];
        this.WIDTH_RANGES = [1, 3];
        this.SPEED_RANGES = [0.5, 1];
        this.DESPAWN_TIMEOUT_RANGES = [500, 2000];
        this.ctrl = ctrl;
        this.definition = definition;
        this.respawn();
    }
    iOS9Curve.prototype.getRandomRange = function (e) {
        return e[0] + Math.random() * (e[1] - e[0]);
    };
    iOS9Curve.prototype.respawnSingle = function (ci) {
        this.phases[ci] = 0;
        this.amplitudes[ci] = 0;
        this.despawnTimeouts[ci] = this.getRandomRange(this.DESPAWN_TIMEOUT_RANGES);
        this.offsets[ci] = this.getRandomRange(this.OFFSET_RANGES);
        this.speeds[ci] = this.getRandomRange(this.SPEED_RANGES);
        this.finalAmplitudes[ci] = this.getRandomRange(this.AMPLITUDE_RANGES);
        this.widths[ci] = this.getRandomRange(this.WIDTH_RANGES);
        this.verses[ci] = this.getRandomRange([-1, 1]);
    };
    iOS9Curve.prototype.getEmptyArray = function (count) {
        return new Array(count);
    };
    iOS9Curve.prototype.respawn = function () {
        this.spawnAt = Date.now();
        this.noOfCurves = Math.floor(this.getRandomRange(this.NOOFCURVES_RANGES));
        this.phases = this.getEmptyArray(this.noOfCurves);
        this.offsets = this.getEmptyArray(this.noOfCurves);
        this.speeds = this.getEmptyArray(this.noOfCurves);
        this.finalAmplitudes = this.getEmptyArray(this.noOfCurves);
        this.widths = this.getEmptyArray(this.noOfCurves);
        this.amplitudes = this.getEmptyArray(this.noOfCurves);
        this.despawnTimeouts = this.getEmptyArray(this.noOfCurves);
        this.verses = this.getEmptyArray(this.noOfCurves);
        for (var ci = 0; ci < this.noOfCurves; ci++) {
            this.respawnSingle(ci);
        }
    };
    iOS9Curve.prototype.globalAttFn = function (x) {
        return Math.pow(this.ATT_FACTOR / (this.ATT_FACTOR + Math.pow(x, 2)), this.ATT_FACTOR);
    };
    iOS9Curve.prototype.sin = function (x, phase) {
        return Math.sin(x - phase);
    };
    iOS9Curve.prototype._grad = function (x, a, b) {
        if (x > a && x < b)
            return 1;
        return 1;
    };
    iOS9Curve.prototype.yRelativePos = function (i) {
        var y = 0;
        for (var ci = 0; ci < this.noOfCurves; ci++) {
            // Generate a static T so that each curve is distant from each oterh
            var t = 4 * (-1 + (ci / (this.noOfCurves - 1)) * 2);
            // but add a dynamic offset
            t += this.offsets[ci];
            var k = 1 / this.widths[ci];
            var x = i * k - t;
            y += Math.abs(this.amplitudes[ci] * this.sin(this.verses[ci] * x, this.phases[ci]) * this.globalAttFn(x));
        }
        // Divide for NoOfCurves so that y <= 1
        return y / this.noOfCurves;
    };
    iOS9Curve.prototype._ypos = function (i) {
        return (this.AMPLITUDE_FACTOR *
            this.ctrl.heightMax *
            this.ctrl.amplitude *
            this.yRelativePos(i) *
            this.globalAttFn((i / this.GRAPH_X) * 2));
    };
    iOS9Curve.prototype._xpos = function (i) {
        return this.ctrl.width * ((i + this.GRAPH_X) / (this.GRAPH_X * 2));
    };
    iOS9Curve.prototype.drawSupportLine = function () {
        var ctx = this.ctrl.ctx;
        var coo = [0, this.ctrl.heightMax, this.ctrl.width, 1];
        var gradient = ctx.createLinearGradient.apply(ctx, coo);
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(0.1, "rgba(255,255,255,.5)");
        gradient.addColorStop(1 - 0.1 - 0.1, "rgba(255,255,255,.5)");
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect.apply(ctx, coo);
    };
    iOS9Curve.prototype.draw = function () {
        var ctx = this.ctrl.ctx;
        ctx.globalAlpha = 0.7;
        ctx.globalCompositeOperation = "lighter";
        if (this.definition.supportLine) {
            // Draw the support line
            return this.drawSupportLine();
        }
        for (var ci = 0; ci < this.noOfCurves; ci++) {
            if (this.spawnAt + this.despawnTimeouts[ci] <= Date.now()) {
                this.amplitudes[ci] -= this.DESPAWN_FACTOR;
            }
            else {
                this.amplitudes[ci] += this.DESPAWN_FACTOR;
            }
            this.amplitudes[ci] = Math.min(Math.max(this.amplitudes[ci], 0), this.finalAmplitudes[ci]);
            this.phases[ci] = (this.phases[ci] + this.ctrl.speed * this.speeds[ci] * this.SPEED_FACTOR) % (2 * Math.PI);
        }
        var maxY = -Infinity;
        // Write two opposite waves
        for (var _i = 0, _a = [1, -1]; _i < _a.length; _i++) {
            var sign = _a[_i];
            ctx.beginPath();
            for (var i = -this.GRAPH_X; i <= this.GRAPH_X; i += this.ctrl.opt.pixelDepth) {
                var x = this._xpos(i);
                var y = this._ypos(i);
                ctx.lineTo(x, this.ctrl.heightMax - sign * y);
                maxY = Math.max(maxY, y);
            }
            ctx.closePath();
            ctx.fillStyle = "rgba(" + this.definition.color + ", 1)";
            ctx.strokeStyle = "rgba(" + this.definition.color + ", 1)";
            ctx.fill();
        }
        if (maxY < this.DEAD_PX && this.prevMaxY > maxY) {
            this.respawn();
        }
        this.prevMaxY = maxY;
        return null;
    };
    iOS9Curve.getDefinition = function () {
        return [
            {
                color: "255,255,255",
                supportLine: true,
            },
            {
                // blue
                color: "15, 82, 169",
            },
            {
                // red
                color: "173, 57, 76",
            },
            {
                // green
                color: "48, 220, 155",
            },
        ];
    };
    return iOS9Curve;
}());

var CurveStyle;
(function (CurveStyle) {
    CurveStyle["ios"] = "ios";
    CurveStyle["ios9"] = "ios9";
})(CurveStyle || (CurveStyle = {}));

var SiriWaveController = /** @class */ (function () {
    function SiriWaveController(_a) {
        var _this = this;
        var container = _a.container, rest = __rest(_a, ["container"]);
        // Phase of the wave (passed to Math.sin function)
        this.phase = 0;
        // Boolean value indicating the the animation is running
        this.run = false;
        // Curves objects to animate
        this.curves = [];
        var csStyle = window.getComputedStyle(container);
        this.opt = __assign({ container: container, style: CurveStyle.ios, ratio: window.devicePixelRatio || 1, speed: 0.2, amplitude: 1, frequency: 6, color: "#fff", cover: false, width: parseInt(csStyle.width.replace("px", ""), 10), height: parseInt(csStyle.height.replace("px", ""), 10), autostart: true, pixelDepth: 0.02, lerpSpeed: 0.1 }, rest);
        /**
         * Actual speed of the animation. Is not safe to change this value directly, use `setSpeed` instead.
         */
        this.speed = Number(this.opt.speed);
        /**
         * Actual amplitude of the animation. Is not safe to change this value directly, use `setAmplitude` instead.
         */
        this.amplitude = Number(this.opt.amplitude);
        /**
         * Width of the canvas multiplied by pixel ratio
         */
        this.width = Number(this.opt.ratio * this.opt.width);
        /**
         * Height of the canvas multiplied by pixel ratio
         */
        this.height = Number(this.opt.ratio * this.opt.height);
        /**
         * Maximum height for a single wave
         */
        this.heightMax = Number(this.height / 2) - 6;
        /**
         * Color of the wave (used in Classic iOS)
         */
        this.color = "rgb(" + this.hex2rgb(this.opt.color) + ")";
        /**
         * An object containing controller variables that need to be interpolated
         * to an another value before to be actually changed
         */
        this.interpolation = {
            speed: this.speed,
            amplitude: this.amplitude,
        };
        /**
         * Canvas DOM Element where curves will be drawn
         */
        this.canvas = document.createElement("canvas");
        /**
         * 2D Context from Canvas
         */
        this.ctx = this.canvas.getContext("2d");
        // Set dimensions
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        // By covering, we ensure the canvas is in the same size of the parent
        if (this.opt.cover === true) {
            this.canvas.style.width = this.canvas.style.height = "100%";
        }
        else {
            this.canvas.style.width = this.width / this.opt.ratio + "px";
            this.canvas.style.height = this.height / this.opt.ratio + "px";
        }
        // Instantiate all curves based on the style
        switch (this.opt.style) {
            case CurveStyle.ios:
            default:
                this.curves = (this.opt.curveDefinition || iOS9Curve.getDefinition()).map(function (def) { return new iOS9Curve(_this, def); });
                break;
            case CurveStyle.ios9:
                this.curves = (this.opt.curveDefinition || Curve.getDefinition()).map(function (def) { return new Curve(_this, def); });
                break;
        }
        // Attach to the container
        this.opt.container.appendChild(this.canvas);
        // Start the animation
        if (this.opt.autostart) {
            this.start();
        }
    }
    /**
     * Convert an HEX color to RGB
     */
    SiriWaveController.prototype.hex2rgb = function (hex) {
        var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, function (m, r, g, b) { return r + r + g + g + b + b; });
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? parseInt(result[1], 16).toString() + "," + parseInt(result[2], 16).toString() + "," + parseInt(result[3], 16).toString()
            : null;
    };
    SiriWaveController.prototype.intLerp = function (v0, v1, t) {
        return v0 * (1 - t) + v1 * t;
    };
    /**
     * Interpolate a property to the value found in this.interpolation
     */
    SiriWaveController.prototype.lerp = function (propertyStr) {
        this[propertyStr] = this.intLerp(this[propertyStr], this.interpolation[propertyStr], this.opt.lerpSpeed);
        if (this[propertyStr] - this.interpolation[propertyStr] === 0) {
            this.interpolation[propertyStr] = null;
        }
        return this[propertyStr];
    };
    /**
     * Clear the canvas
     */
    SiriWaveController.prototype._clear = function () {
        this.ctx.globalCompositeOperation = "destination-out";
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.globalCompositeOperation = "source-over";
    };
    /**
     * Draw all curves
     */
    SiriWaveController.prototype._draw = function () {
        this.curves.forEach(function (curve) { return curve.draw(); });
    };
    /**
     * Clear the space, interpolate values, calculate new steps and draws
     * @returns
     */
    SiriWaveController.prototype.startDrawCycle = function () {
        this._clear();
        // Interpolate values
        if (this.interpolation.amplitude !== null)
            this.lerp("amplitude");
        if (this.interpolation.speed !== null)
            this.lerp("speed");
        this._draw();
        this.phase = (this.phase + (Math.PI / 2) * this.speed) % (2 * Math.PI);
        if (window.requestAnimationFrame) {
            this.animationFrameId = window.requestAnimationFrame(this.startDrawCycle.bind(this));
        }
        else {
            this.timeoutId = setTimeout(this.startDrawCycle.bind(this), 20);
        }
    };
    /* API */
    /**
     * Start the animation
     */
    SiriWaveController.prototype.start = function () {
        this.phase = 0;
        // Ensure we don't re-launch the draw cycle
        if (!this.run) {
            this.run = true;
            this.startDrawCycle();
        }
    };
    /**
     * Stop the animation
     */
    SiriWaveController.prototype.stop = function () {
        this.phase = 0;
        this.run = false;
        // Clear old draw cycle on stop
        this.animationFrameId && window.cancelAnimationFrame(this.animationFrameId);
        this.timeoutId && clearTimeout(this.timeoutId);
    };
    /**
     * Set a new value for a property (interpolated)
     */
    SiriWaveController.prototype.set = function (propertyStr, value) {
        this.interpolation[propertyStr] = value;
    };
    /**
     * Set a new value for the speed property (interpolated)
     */
    SiriWaveController.prototype.setSpeed = function (value) {
        this.set("speed", value);
    };
    /**
     * Set a new value for the amplitude property (interpolated)
     */
    SiriWaveController.prototype.setAmplitude = function (value) {
        this.set("amplitude", value);
    };
    return SiriWaveController;
}());

export default SiriWaveController;
