export default interface ISiriwave {
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
  constructor(opt: any);
  hex2rgb(hex: any): string;
  lerp(propertyStr: any): any;
  _clear(): void;
  _draw(): void;
  startDrawCycle(): void;
  start(): void;
  stop(): void;
  set(propertyStr: any, v: any): void;
  setSpeed(v: any): void;
  setAmplitude(v: any): void;
}
