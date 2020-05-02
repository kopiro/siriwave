import { Curve } from "./curve";
import { iOS9Curve } from "./ios9curve";
import { Options, ICurve, CurveStyle, ICurveDefinition } from "./types";

export default class SiriWaveController {
  opt: Options;

  // Phase of the wave (passed to Math.sin function)
  phase: number = 0;
  // Boolean value indicating the the animation is running
  run: boolean = false;
  // Curves objects to animate
  curves: ICurve[] = [];

  speed: number;
  amplitude: number;
  width: number;
  height: number;
  heightMax: number;
  color: string;
  interpolation: {
    speed: number;
    amplitude: number;
  };

  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;

  constructor({ container, ...rest }: Options) {
    const csStyle = window.getComputedStyle(container);

    this.opt = {
      container,
      style: CurveStyle.ios,
      ratio: window.devicePixelRatio || 1,
      speed: 0.2,
      amplitude: 1,
      frequency: 6,
      color: "#fff",
      cover: false,
      width: parseInt(csStyle.width.replace("px", ""), 10),
      height: parseInt(csStyle.height.replace("px", ""), 10),
      autostart: true,
      pixelDepth: 0.02,
      lerpSpeed: 0.1,
      ...rest,
    };

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
    this.ctx = this.canvas.getContext("2d");

    // Set dimensions
    this.canvas.width = this.width;
    this.canvas.height = this.height;

    // By covering, we ensure the canvas is in the same size of the parent
    if (this.opt.cover === true) {
      this.canvas.style.width = this.canvas.style.height = "100%";
    } else {
      this.canvas.style.width = `${this.width / this.opt.ratio}px`;
      this.canvas.style.height = `${this.height / this.opt.ratio}px`;
    }

    // Instantiate all curves based on the style
    switch (this.opt.style) {
      case CurveStyle.ios:
      default:
        this.curves = (this.opt.curveDefinition || iOS9Curve.getDefinition()).map((def) => new iOS9Curve(this, def));
        break;

      case CurveStyle.ios9:
        this.curves = (this.opt.curveDefinition || Curve.getDefinition()).map((def) => new Curve(this, def));
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
  hex2rgb(hex: string): string | null {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b);
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? `${parseInt(result[1], 16).toString()},${parseInt(result[2], 16).toString()},${parseInt(
          result[3],
          16,
        ).toString()}`
      : null;
  }

  intLerp(v0: number, v1: number, t: number): number {
    return v0 * (1 - t) + v1 * t;
  }

  /**
   * Interpolate a property to the value found in this.interpolation
   */
  lerp(propertyStr: "amplitude" | "speed"): number {
    this[propertyStr] = this.intLerp(this[propertyStr], this.interpolation[propertyStr], this.opt.lerpSpeed);
    if (this[propertyStr] - this.interpolation[propertyStr] === 0) {
      this.interpolation[propertyStr] = null;
    }
    return this[propertyStr];
  }

  /**
   * Clear the canvas
   */
  _clear() {
    this.ctx.globalCompositeOperation = "destination-out";
    this.ctx.fillRect(0, 0, this.width, this.height);
    this.ctx.globalCompositeOperation = "source-over";
  }

  /**
   * Draw all curves
   */
  _draw() {
    this.curves.forEach((curve) => curve.draw());
  }

  /**
   * Clear the space, interpolate values, calculate new steps and draws
   * @returns
   */
  startDrawCycle() {
    if (!this.run) return;

    this._clear();

    // Interpolate values
    if (this.interpolation.amplitude !== null) this.lerp("amplitude");
    if (this.interpolation.speed !== null) this.lerp("speed");

    this._draw();
    this.phase = (this.phase + (Math.PI / 2) * this.speed) % (2 * Math.PI);

    if (window.requestAnimationFrame) {
      window.requestAnimationFrame(this.startDrawCycle.bind(this));
    } else {
      setTimeout(this.startDrawCycle.bind(this), 20);
    }
  }

  /* API */

  /**
   * Start the animation
   */
  start() {
    this.phase = 0;
    this.run = true;
    this.startDrawCycle();
  }

  /**
   * Stop the animation
   */
  stop() {
    this.phase = 0;
    this.run = false;
  }

  /**
   * Set a new value for a property (interpolated)
   */
  set(propertyStr: "amplitude" | "speed", value: number) {
    this.interpolation[propertyStr] = value;
  }

  /**
   * Set a new value for the speed property (interpolated)
   */
  setSpeed(value: number) {
    this.set("speed", value);
  }

  /**
   * Set a new value for the amplitude property (interpolated)
   */
  setAmplitude(value: number) {
    this.set("amplitude", value);
  }
}
