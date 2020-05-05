import * as vsc from "./vsc";

export type Document = {
  execute: vsc.ExecuteCommand<unknown>;
  commands: Record<string, (...args: any[]) => any>;
  checkContext: (context: any) => boolean | undefined;
  getSelections: () => vsc.Selection[];
  setSelections: (selections: vsc.Selection[]) => void;
};

export type Command = Single | Multiple;

export type Single = {
  command: string;
  args?: any;
  context?: any;
};

export type Multiple = {
  commands: Single[] | Multiple;
  context?: any;
  forEachSelection?: boolean;
};
