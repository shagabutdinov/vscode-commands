import * as vsc from "./lib/vsc";

// Executes command from the recursive "command" structure which hasn't scope or
// the scope chec has passed. If the scope check did not pass, tries to check
// and run the next command.
export async function run(
  document: Document,
  command: Command,
): Promise<unknown> {
  const [, result] = await runCommand(document, command);
  return result;
}

async function runCommand(
  document: Document,
  command: Command,
): Promise<[boolean, unknown]> {
  if (command.scope && !(await document.checkScope(command.scope))) {
    return [false, undefined];
  }

  const callback = async (): Promise<[boolean, unknown]> => {
    if ("commands" in command) {
      if (command.commands instanceof Array) {
        for (const sub of command.commands) {
          const [executed, result] = await runCommand(document, sub);

          if (executed) {
            return [true, result];
          }
        }

        return [false, undefined];
      }

      return await runCommand(document, command.commands);
    }

    return [true, await document.execute(command.command, command.args)];
  };

  if (
    "forEachSelection" in command &&
    command.forEachSelection &&
    document.getSelections().length !== 1
  ) {
    const result = await withEachSelection(document, callback);
    return [result.some(([executed]) => executed), result];
  }

  return await callback();
}

// Executes all commands in the recursive "command" structure. If the scope
// check did not pass, returns undefined for the corresponding call.
export async function execute(
  document: Document,
  command: Command,
): Promise<unknown> {
  const callback = async () => {
    if (command.scope && !(await document.checkScope(command.scope))) {
      return undefined;
    }

    if ("commands" in command) {
      if (command.commands instanceof Array) {
        return Promise.all(
          command.commands.map(
            async (subcommand) => await execute(document, subcommand),
          ),
        );
      }

      return await execute(document, command.commands);
    }

    return await document.execute(command.command, command.args);
  };

  if (
    "forEachSelection" in command &&
    command.forEachSelection &&
    document.getSelections().length !== 1
  ) {
    return await withEachSelection(document, callback);
  }

  return await callback();
}

async function withEachSelection<Type>(
  document: Document,
  callback: () => Promise<Type>,
): Promise<Type[]> {
  const resultValue: Type[] = [];
  const resultSelections: vsc.Selection[] = [];
  const selections = document.getSelections();

  for (const index in selections) {
    document.setSelections([selections[index]]);
    resultValue[index] = await callback();
    resultSelections[index] = document.getSelections()[0];
  }

  document.setSelections(resultSelections);
  return resultValue;
}

export type Document = {
  execute: vsc.ExecuteCommand<unknown>;
  checkScope: (scope: any) => Thenable<boolean | undefined>;
  getSelections: () => vsc.Selection[];
  setSelections: (selections: vsc.Selection[]) => void;
};

export type Command = Single | Multiple;

export type Single = {
  command: string;
  args?: any;
  scope?: any;
};

export type Multiple = {
  commands: Single[] | Multiple;
  scope?: any;
  forEachSelection?: boolean;
};
