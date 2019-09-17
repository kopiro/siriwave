export default class Curve {
    ctrl: any;
    definition: any;
    ATT_FACTOR: number;
    GRAPH_X: number;
    AMPLITUDE_FACTOR: number;
    constructor(ctrl: any, definition: any);
    globalAttFn(x: number): number;
    _xpos(i: number): number;
    _ypos(i: number): number;
    draw(): void;
    static getDefinition(): {
        attenuation: number;
        lineWidth: number;
        opacity: number;
    }[];
}
