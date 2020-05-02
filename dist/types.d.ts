export declare enum CurveStyle {
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
    curveDefinition: ICurveDefinition[];
};
export declare type ICurveDefinition = {
    attenuation?: number;
    lineWidth?: number;
    opacity?: number;
    supportLine?: boolean;
    color?: string;
};
export interface ICurve {
    draw: () => void;
}
