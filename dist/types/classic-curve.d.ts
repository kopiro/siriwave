import SiriWave, { IClassicCurveDefinition, ICurve } from "./index";
export declare class ClassicCurve implements ICurve {
    ctrl: SiriWave;
    definition: IClassicCurveDefinition;
    ATT_FACTOR: number;
    GRAPH_X: number;
    AMPLITUDE_FACTOR: number;
    constructor(ctrl: SiriWave, definition: IClassicCurveDefinition);
    private globalAttFn;
    private xPos;
    private yPos;
    draw(): void;
    static getDefinition(): IClassicCurveDefinition[];
}
