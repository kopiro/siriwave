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

class ClassicCurve {
    constructor(ctrl, definition) {
        this.ATT_FACTOR = 4;
        this.GRAPH_X = 2;
        this.AMPLITUDE_FACTOR = 0.6;
        this.ctrl = ctrl;
        this.definition = definition;
    }
    globalAttFn(x) {
        return Math.pow(this.ATT_FACTOR / (this.ATT_FACTOR + Math.pow(x, this.ATT_FACTOR)), this.ATT_FACTOR);
    }
    xPos(i) {
        return this.ctrl.width * ((i + this.GRAPH_X) / (this.GRAPH_X * 2));
    }
    yPos(i) {
        return (this.AMPLITUDE_FACTOR *
            (this.globalAttFn(i) *
                (this.ctrl.heightMax * this.ctrl.amplitude) *
                (1 / this.definition.attenuation) *
                Math.sin(this.ctrl.opt.frequency * i - this.ctrl.phase)));
    }
    draw() {
        const { ctx } = this.ctrl;
        ctx.moveTo(0, 0);
        ctx.beginPath();
        const color = this.ctrl.color.replace(/rgb\(/g, "").replace(/\)/g, "");
        ctx.strokeStyle = `rgba(${color},${this.definition.opacity})`;
        ctx.lineWidth = this.definition.lineWidth;
        // Cycle the graph from -X to +X every PX_DEPTH and draw the line
        for (let i = -this.GRAPH_X; i <= this.GRAPH_X; i += this.ctrl.opt.pixelDepth) {
            ctx.lineTo(this.xPos(i), this.ctrl.heightMax + this.yPos(i));
        }
        ctx.stroke();
    }
    static getDefinition() {
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
    }
}

class iOS9Curve {
    constructor(ctrl, definition) {
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
        this.noOfCurves = 0;
        this.spawnAt = 0;
        this.prevMaxY = 0;
        this.phases = [];
        this.offsets = [];
        this.speeds = [];
        this.finalAmplitudes = [];
        this.widths = [];
        this.amplitudes = [];
        this.despawnTimeouts = [];
        this.verses = [];
    }
    getRandomRange(e) {
        return e[0] + Math.random() * (e[1] - e[0]);
    }
    spawnSingle(ci) {
        this.phases[ci] = 0;
        this.amplitudes[ci] = 0;
        this.despawnTimeouts[ci] = this.getRandomRange(this.DESPAWN_TIMEOUT_RANGES);
        this.offsets[ci] = this.getRandomRange(this.OFFSET_RANGES);
        this.speeds[ci] = this.getRandomRange(this.SPEED_RANGES);
        this.finalAmplitudes[ci] = this.getRandomRange(this.AMPLITUDE_RANGES);
        this.widths[ci] = this.getRandomRange(this.WIDTH_RANGES);
        this.verses[ci] = this.getRandomRange([-1, 1]);
    }
    getEmptyArray(count) {
        return new Array(count);
    }
    spawn() {
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
        for (let ci = 0; ci < this.noOfCurves; ci++) {
            this.spawnSingle(ci);
        }
    }
    globalAttFn(x) {
        return Math.pow(this.ATT_FACTOR / (this.ATT_FACTOR + Math.pow(x, 2)), this.ATT_FACTOR);
    }
    sin(x, phase) {
        return Math.sin(x - phase);
    }
    yRelativePos(i) {
        let y = 0;
        for (let ci = 0; ci < this.noOfCurves; ci++) {
            // Generate a static T so that each curve is distant from each oterh
            let t = 4 * (-1 + (ci / (this.noOfCurves - 1)) * 2);
            // but add a dynamic offset
            t += this.offsets[ci];
            const k = 1 / this.widths[ci];
            const x = i * k - t;
            y += Math.abs(this.amplitudes[ci] * this.sin(this.verses[ci] * x, this.phases[ci]) * this.globalAttFn(x));
        }
        // Divide for NoOfCurves so that y <= 1
        return y / this.noOfCurves;
    }
    yPos(i) {
        return (this.AMPLITUDE_FACTOR *
            this.ctrl.heightMax *
            this.ctrl.amplitude *
            this.yRelativePos(i) *
            this.globalAttFn((i / this.GRAPH_X) * 2));
    }
    xPos(i) {
        return this.ctrl.width * ((i + this.GRAPH_X) / (this.GRAPH_X * 2));
    }
    drawSupportLine() {
        const { ctx } = this.ctrl;
        const coo = [0, this.ctrl.heightMax, this.ctrl.width, 1];
        const gradient = ctx.createLinearGradient.apply(ctx, coo);
        gradient.addColorStop(0, "transparent");
        gradient.addColorStop(0.1, "rgba(255,255,255,.5)");
        gradient.addColorStop(1 - 0.1 - 0.1, "rgba(255,255,255,.5)");
        gradient.addColorStop(1, "transparent");
        ctx.fillStyle = gradient;
        ctx.fillRect.apply(ctx, coo);
    }
    draw() {
        const { ctx } = this.ctrl;
        ctx.globalAlpha = 0.7;
        ctx.globalCompositeOperation = "lighter";
        if (this.spawnAt === 0) {
            this.spawn();
        }
        if (this.definition.supportLine) {
            // Draw the support line
            return this.drawSupportLine();
        }
        for (let ci = 0; ci < this.noOfCurves; ci++) {
            if (this.spawnAt + this.despawnTimeouts[ci] <= Date.now()) {
                this.amplitudes[ci] -= this.DESPAWN_FACTOR;
            }
            else {
                this.amplitudes[ci] += this.DESPAWN_FACTOR;
            }
            this.amplitudes[ci] = Math.min(Math.max(this.amplitudes[ci], 0), this.finalAmplitudes[ci]);
            this.phases[ci] = (this.phases[ci] + this.ctrl.speed * this.speeds[ci] * this.SPEED_FACTOR) % (2 * Math.PI);
        }
        let maxY = -Infinity;
        // Write two opposite waves
        for (const sign of [1, -1]) {
            ctx.beginPath();
            for (let i = -this.GRAPH_X; i <= this.GRAPH_X; i += this.ctrl.opt.pixelDepth) {
                const x = this.xPos(i);
                const y = this.yPos(i);
                ctx.lineTo(x, this.ctrl.heightMax - sign * y);
                maxY = Math.max(maxY, y);
            }
            ctx.closePath();
            ctx.fillStyle = `rgba(${this.definition.color}, 1)`;
            ctx.strokeStyle = `rgba(${this.definition.color}, 1)`;
            ctx.fill();
        }
        if (maxY < this.DEAD_PX && this.prevMaxY > maxY) {
            this.spawnAt = 0;
        }
        this.prevMaxY = maxY;
        return null;
    }
    static getDefinition() {
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
    }
}

class SiriWave {
    constructor(_a) {
        var { container } = _a, rest = __rest(_a, ["container"]);
        // Phase of the wave (passed to Math.sin function)
        this.phase = 0;
        // Boolean value indicating the the animation is running
        this.run = false;
        // Curves objects to animate
        this.curves = [];
        const csStyle = window.getComputedStyle(container);
        this.opt = Object.assign({ container, style: "ios", ratio: window.devicePixelRatio || 1, speed: 0.2, amplitude: 1, frequency: 6, color: "#fff", cover: false, width: parseInt(csStyle.width.replace("px", ""), 10), height: parseInt(csStyle.height.replace("px", ""), 10), autostart: true, pixelDepth: 0.02, lerpSpeed: 0.1 }, rest);
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
        this.color = `rgb(${this.hex2rgb(this.opt.color)})`;
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
        const ctx = this.canvas.getContext("2d");
        if (ctx === null) {
            throw new Error("Unable to create 2D Context");
        }
        this.ctx = ctx;
        // Set dimensions
        this.canvas.width = this.width;
        this.canvas.height = this.height;
        // By covering, we ensure the canvas is in the same size of the parent
        if (this.opt.cover === true) {
            this.canvas.style.width = this.canvas.style.height = "100%";
        }
        else {
            this.canvas.style.width = `${this.width / this.opt.ratio}px`;
            this.canvas.style.height = `${this.height / this.opt.ratio}px`;
        }
        // Instantiate all curves based on the style
        switch (this.opt.style) {
            case "ios9":
                this.curves = (this.opt.curveDefinition || iOS9Curve.getDefinition()).map((def) => new iOS9Curve(this, def));
                break;
            case "ios":
            default:
                this.curves = (this.opt.curveDefinition || ClassicCurve.getDefinition()).map((def) => new ClassicCurve(this, def));
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
    hex2rgb(hex) {
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result
            ? `${parseInt(result[1], 16).toString()},${parseInt(result[2], 16).toString()},${parseInt(result[3], 16).toString()}`
            : null;
    }
    intLerp(v0, v1, t) {
        return v0 * (1 - t) + v1 * t;
    }
    /**
     * Interpolate a property to the value found in this.interpolation
     */
    lerp(propertyStr) {
        const prop = this.interpolation[propertyStr];
        if (prop !== null) {
            this[propertyStr] = this.intLerp(this[propertyStr], prop, this.opt.lerpSpeed);
            if (this[propertyStr] - prop === 0) {
                this.interpolation[propertyStr] = null;
            }
        }
        return this[propertyStr];
    }
    /**
     * Clear the canvas
     */
    clear() {
        this.ctx.globalCompositeOperation = "destination-out";
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.globalCompositeOperation = "source-over";
    }
    /**
     * Draw all curves
     */
    draw() {
        this.curves.forEach((curve) => curve.draw());
    }
    /**
     * Clear the space, interpolate values, calculate new steps and draws
     * @returns
     */
    startDrawCycle() {
        this.clear();
        // Interpolate values
        this.lerp("amplitude");
        this.lerp("speed");
        this.draw();
        this.phase = (this.phase + (Math.PI / 2) * this.speed) % (2 * Math.PI);
        if (window.requestAnimationFrame) {
            this.animationFrameId = window.requestAnimationFrame(this.startDrawCycle.bind(this));
        }
        else {
            this.timeoutId = setTimeout(this.startDrawCycle.bind(this), 20);
        }
    }
    /* API */
    /**
     * Start the animation
     */
    start() {
        if (!this.canvas) {
            throw new Error("This instance of SiriWave has been disposed, please create a new instance");
        }
        this.phase = 0;
        // Ensure we don't re-launch the draw cycle
        if (!this.run) {
            this.run = true;
            this.startDrawCycle();
        }
    }
    /**
     * Stop the animation
     */
    stop() {
        this.phase = 0;
        this.run = false;
        // Clear old draw cycle on stop
        if (this.animationFrameId) {
            window.cancelAnimationFrame(this.animationFrameId);
        }
        if (this.timeoutId) {
            clearTimeout(this.timeoutId);
        }
    }
    /**
     * Dispose
     */
    dispose() {
        this.stop();
        if (this.canvas) {
            this.canvas.remove();
            this.canvas = null;
        }
    }
    /**
     * Set a new value for a property (interpolated)
     */
    set(propertyStr, value) {
        this.interpolation[propertyStr] = value;
    }
    /**
     * Set a new value for the speed property (interpolated)
     */
    setSpeed(value) {
        this.set("speed", value);
    }
    /**
     * Set a new value for the amplitude property (interpolated)
     */
    setAmplitude(value) {
        this.set("amplitude", value);
    }
}

export default SiriWave;
