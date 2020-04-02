import * as vsc from "./lib/vsc";

export async function run(
  executor: vsc.ExecuteCommand<any>,
  checkContext: (context: Context) => Thenable<boolean>,
  commands: Command[],
): Promise<any> {
  commands.forEach(async ({ context, ...command }) => {
    if (!context || (await checkContext(context))) {
      return await execute(executor, checkContext, command);
    }
  });
}

export async function execute(
  executor: vsc.ExecuteCommand<any>,
  checkContext: (context: Context) => Thenable<boolean>,
  command: Command,
): Promise<any> {
  if (command.context && !(await checkContext(command.context))) {
    return;
  }

  if (commandIsMultiple(command)) {
    if (command.commands instanceof Array) {
      return command.commands.map(
        async subcommand => await execute(executor, checkContext, subcommand),
      );
    }

    return await execute(executor, checkContext, command.commands);
  }

  return await executor(command.command, command.args);
}

export type Command = Single | Multiple;

export type Single = {
  command: string;
  args?: any;
  context?: Context;
};

// function commandIsSingle(object: Single | Multiple): object is Single {
//   return "command" in object;
// }

export type Multiple = {
  commands: Single[] | Multiple;
  context?: Context;
};

function commandIsMultiple(object: Single | Multiple): object is Multiple {
  return "commands" in object;
}

type Context = Array<string | Context>;
