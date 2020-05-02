import SiriWaveController from "./siriwave";
import { ICurveDefinition, ICurve } from "./types";
export declare class Curve implements ICurve {
    ctrl: SiriWaveController;
    definition: ICurveDefinition;
    ATT_FACTOR: number;
    GRAPH_X: number;
    AMPLITUDE_FACTOR: number;
    constructor(ctrl: SiriWaveController, definition: ICurveDefinition);
    globalAttFn(x: number): number;
    _xpos(i: number): number;
    _ypos(i: number): number;
    draw(): void;
    static getDefinition(): ICurveDefinition[];
}
