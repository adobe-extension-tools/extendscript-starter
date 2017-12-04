declare function require(x: string): any;
declare var globalThis: any;

interface Global {
  state: any;
  extendScriptPanel: Window | Panel | undefined
  isValid: any
}