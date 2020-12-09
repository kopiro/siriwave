declare enum CurveStyle {
    "ios" = "ios",
    "ios9" = "ios9"
}
export declare type Options = {
    container: HTMLElement;
    style?: CurveStyle;
    ratio?: number;
    speed?: number;
    amplitude?: number;
    frequency?: number;
    color?: string;
    cover?: boolean;
    width?: number;
    height?: number;
    autostart?: boolean;
    pixelDepth?: number;
    lerpSpeed?: number;
    curveDefinition?: ICurveDefinition[];
};
export declare type IiOS9CurveDefinition = {
    supportLine?: boolean;
    color: string;
};
export declare type IClassicCurveDefinition = {
    attenuation: number;
    lineWidth: number;
    opacity: number;
};
export declare type ICurveDefinition = IiOS9CurveDefinition | IClassicCurveDefinition;
export interface ICurve {
    draw: () => void;
}
export default class SiriWave {
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
        speed: number | null;
        amplitude: number | null;
    };
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    animationFrameId: number | undefined;
    timeoutId: ReturnType<typeof setTimeout> | undefined;
    constructor({ container, ...rest }: Options);
    /**
     * Convert an HEX color to RGB
     */
    hex2rgb(hex: string): string | null;
    intLerp(v0: number, v1: number, t: number): number;
    /**
     * Interpolate a property to the value found in this.interpolation
     */
    lerp(propertyStr: "amplitude" | "speed"): number | null;
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
export {};
