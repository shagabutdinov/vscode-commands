import * as vsc from "./lib/vsc";

export async function run(
  executor: vsc.ExecuteCommand<unknown>,
  checkContext: (context: any) => Thenable<boolean | undefined>,
  command: Command,
): Promise<unknown> {
  if (command.context && !(await checkContext(command.context))) {
    return;
  }

  if (commandIsMultiple(command)) {
    if (command.commands instanceof Array) {
      return Promise.all(
        command.commands.map(
          async subcommand => await run(executor, checkContext, subcommand),
        ),
      );
    }

    return await run(executor, checkContext, command.commands);
  }

  return await executor(command.command, command.args);
}

export type Command = Single | Multiple;

export type Single = {
  command: string;
  args?: any;
  context?: any;
};

export type Multiple = {
  commands: Single[] | Multiple;
  context?: any;
};

function commandIsMultiple(object: Single | Multiple): object is Multiple {
  return "commands" in object;
}
