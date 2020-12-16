import { ClassicCurve } from "./classic-curve";
import { iOS9Curve } from "./ios9-curve";

enum CurveStyle {
  "ios" = "ios",
  "ios9" = "ios9",
}

export type Options = {
  // The DOM container where the DOM canvas element will be added
  container: HTMLElement;
  // The style of the wave: `ios` or `ios9`
  style?: CurveStyle;
  //  Ratio of the display to use. Calculated by default.
  ratio?: number;
  // The speed of the animation.
  speed?: number;
  // The amplitude of the complete wave.
  amplitude?: number;
  // The frequency for the complete wave (how many waves). - Not available in iOS9 Style
  frequency?: number;
  // The color of the wave, in hexadecimal form (`#336699`, `#FF0`). - Not available in iOS9 Style
  color?: string;
  // The `canvas` covers the entire width or height of the container.
  cover?: boolean;
  // Width of the canvas. Calculated by default.
  width?: number;
  // Height of the canvas. Calculated by default.
  height?: number;
  // Decide wether start the animation on boot.
  autostart?: boolean;
  // Number of step (in pixels) used when drawed on canvas.
  pixelDepth?: number;
  // Lerp speed to interpolate properties.
  lerpSpeed?: number;
  // Curve definition override
  curveDefinition?: ICurveDefinition[];
};

export type IiOS9CurveDefinition = {
  supportLine?: boolean;
  color: string;
};

export type IClassicCurveDefinition = {
  attenuation: number;
  lineWidth: number;
  opacity: number;
};

export type ICurveDefinition = IiOS9CurveDefinition | IClassicCurveDefinition;

export interface ICurve {
  draw: () => void;
}

export default class SiriWave {
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
    speed: number | null;
    amplitude: number | null;
  };

  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D;

  animationFrameId: number | undefined;
  timeoutId: ReturnType<typeof setTimeout> | undefined;

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
    this.width = Number(this.opt.ratio! * this.opt.width!);

    /**
     * Height of the canvas multiplied by pixel ratio
     */
    this.height = Number(this.opt.ratio! * this.opt.height!);

    /**
     * Maximum height for a single wave
     */
    this.heightMax = Number(this.height / 2) - 6;

    /**
     * Color of the wave (used in Classic iOS)
     */
    this.color = `rgb(${this.hex2rgb(this.opt.color!)})`;

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
    } else {
      this.canvas.style.width = `${this.width / this.opt.ratio!}px`;
      this.canvas.style.height = `${this.height / this.opt.ratio!}px`;
    }

    // Instantiate all curves based on the style
    switch (this.opt.style) {
      case CurveStyle.ios9:
        this.curves = ((this.opt.curveDefinition || iOS9Curve.getDefinition()) as IiOS9CurveDefinition[]).map(
          (def) => new iOS9Curve(this, def),
        );
        break;

      case CurveStyle.ios:
      default:
        this.curves = ((this.opt.curveDefinition || ClassicCurve.getDefinition()) as IClassicCurveDefinition[]).map(
          (def) => new ClassicCurve(this, def),
        );
        break;
    }

    // Attach to the container
    this.opt.container.appendChild(this.canvas);

    // Start the animation
    if (this.opt.autostart) {
      this.start();
    }
  }

  dispose() {
    this.stop();
    if (this.canvas) {
      this.canvas.remove();
      this.canvas = null;
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
  lerp(propertyStr: "amplitude" | "speed"): number | null {
    const prop = this.interpolation[propertyStr];
    if (prop !== null) {
      this[propertyStr] = this.intLerp(this[propertyStr], prop, this.opt.lerpSpeed!);
      if (this[propertyStr] - prop === 0) {
        this.interpolation[propertyStr] = null;
      }
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
    this._clear();

    // Interpolate values
    this.lerp("amplitude");
    this.lerp("speed");

    this._draw();
    this.phase = (this.phase + (Math.PI / 2) * this.speed) % (2 * Math.PI);

    if (window.requestAnimationFrame) {
      this.animationFrameId = window.requestAnimationFrame(this.startDrawCycle.bind(this));
    } else {
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
