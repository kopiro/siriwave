import SiriWave, { ICurveDefinition, ICurve } from "./index";
export declare class Curve implements ICurve {
    ctrl: SiriWave;
    definition: ICurveDefinition;
    ATT_FACTOR: number;
    GRAPH_X: number;
    AMPLITUDE_FACTOR: number;
    constructor(ctrl: SiriWave, definition: ICurveDefinition);
    globalAttFn(x: number): number;
    _xpos(i: number): number;
    _ypos(i: number): number;
    draw(): void;
    static getDefinition(): ICurveDefinition[];
}
