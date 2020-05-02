export enum CurveStyle {
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
  curveDefinition: ICurveDefinition[];
};

export type ICurveDefinition = {
  attenuation?: number;
  lineWidth?: number;
  opacity?: number;
  supportLine?: boolean;
  color?: string;
};

export interface ICurve {
  draw: () => void;
}
