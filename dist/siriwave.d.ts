import { Options, ICurve } from "./types";
export default class SiriWaveController {
    opt: Options;
    phase: number;
    run: boolean;
    curves: ICurve[];
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
    constructor({ container, ...rest }: Options);
    /**
     * Convert an HEX color to RGB
     */
    hex2rgb(hex: string): string | null;
    intLerp(v0: number, v1: number, t: number): number;
    /**
     * Interpolate a property to the value found in this.interpolation
     */
    lerp(propertyStr: "amplitude" | "speed"): number;
    /**
     * Clear the canvas
     */
    _clear(): void;
    /**
     * Draw all curves
     */
    _draw(): void;
    /**
     * Clear the space, interpolate values, calculate new steps and draws
     * @returns
     */
    startDrawCycle(): void;
    /**
     * Start the animation
     */
    start(): void;
    /**
     * Stop the animation
     */
    stop(): void;
    /**
     * Set a new value for a property (interpolated)
     */
    set(propertyStr: "amplitude" | "speed", value: number): void;
    /**
     * Set a new value for the speed property (interpolated)
     */
    setSpeed(value: number): void;
    /**
     * Set a new value for the amplitude property (interpolated)
     */
    setAmplitude(value: number): void;
}
