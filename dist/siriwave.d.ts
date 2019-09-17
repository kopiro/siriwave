export default class SiriWave {
    container: Element;
    opt: any;
    phase: number;
    run: boolean;
    speed: number;
    amplitude: number;
    width: number;
    height: number;
    heightMax: number;
    color: string;
    interpolation: any;
    canvas: any;
    ctx: any;
    curves: any[];
    /**
     * Build the SiriWave
     * @param {Object} opt
     * @param {DOMElement} [opt.container=document.body] The DOM container where the DOM canvas element will be added
     * @param {String} [opt.style='ios'] The style of the wave: `ios` or `ios9`
     * @param {Number} [opt.ratio=null] Ratio of the display to use. Calculated by default.
     * @param {Number} [opt.speed=0.2] The speed of the animation.
     * @param {Number} [opt.amplitude=1] The amplitude of the complete wave.
     * @param {Number} [opt.frequency=6] The frequency for the complete wave (how many waves). - Not available in iOS9 Style
     * @param {String} [opt.color='#fff'] The color of the wave, in hexadecimal form (`#336699`, `#FF0`). - Not available in iOS9 Style
     * @param {Boolean} [opt.cover=false] The `canvas` covers the entire width or height of the container.
     * @param {Number} [opt.width=null] Width of the canvas. Calculated by default.
     * @param {Number} [opt.height=null] Height of the canvas. Calculated by default.
     * @param {Boolean} [opt.autostart=false] Decide wether start the animation on boot.
     * @param {Number} [opt.pixelDepth=0.02] Number of step (in pixels) used when drawed on canvas.
     * @param {Number} [opt.lerpSpeed=0.1] Lerp speed to interpolate properties.
     */
    constructor(opt: any);
    /**
     * Convert an HEX color to RGB
     * @param {String} hex
     * @returns RGB value that could be used
     * @memberof SiriWave
     */
    hex2rgb(hex: any): string;
    /**
     * Interpolate a property to the value found in $.interpolation
     * @param {String} propertyStr
     * @returns
     * @memberof SiriWave
     */
    lerp(propertyStr: any): any;
    /**
     * Clear the canvas
     * @memberof SiriWave
     */
    _clear(): void;
    /**
     * Draw all curves
     * @memberof SiriWave
     */
    _draw(): void;
    /**
     * Clear the space, interpolate values, calculate new steps and draws
     * @returns
     * @memberof SiriWave
     */
    startDrawCycle(): void;
    /**
     * Start the animation
     * @memberof SiriWave
     */
    start(): void;
    /**
     * Stop the animation
     * @memberof SiriWave
     */
    stop(): void;
    /**
     * Set a new value for a property (interpolated)
     * @param {String} propertyStr
     * @param {Number} v
     * @memberof SiriWave
     */
    set(propertyStr: any, v: any): void;
    /**
     * Set a new value for the speed property (interpolated)
     * @param {Number} v
     * @memberof SiriWave
     */
    setSpeed(v: any): void;
    /**
     * Set a new value for the amplitude property (interpolated)
     * @param {Number} v
     * @memberof SiriWave
     */
    setAmplitude(v: any): void;
}
