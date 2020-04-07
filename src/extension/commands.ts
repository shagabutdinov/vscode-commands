import * as vsc from "./lib/vsc";

// Executes command from the recursive "command" structure which hasn't scope or
// the scope chec has passed. If the scope check did not pass, tries to check
// and run the next command.
export async function run(
  executor: vsc.ExecuteCommand<unknown>,
  checkScope: (scope: any) => Thenable<boolean | undefined>,
  command: Command,
): Promise<unknown> {
  const [, result] = await runCommand(executor, checkScope, command);
  return result;
}

async function runCommand(
  executor: vsc.ExecuteCommand<unknown>,
  checkScope: (scope: any) => Thenable<boolean | undefined>,
  command: Command,
): Promise<[boolean, unknown]> {
  if (command.scope && !(await checkScope(command.scope))) {
    return [false, undefined];
  }

  if ("commands" in command) {
    if (command.commands instanceof Array) {
      for (const sub of command.commands) {
        const [executed, result] = await runCommand(executor, checkScope, sub);

        if (executed) {
          return [true, result];
        }
      }

      return [false, undefined];
    }

    return await runCommand(executor, checkScope, command.commands);
  }

  return [true, await executor(command.command, command.args)];
}

// Executes all commands in the recursive "command" structure. If the scope
// check did not pass, returns undefined for the corresponding call.
export async function execute(
  executor: vsc.ExecuteCommand<unknown>,
  checkScope: (scope: any) => Thenable<boolean | undefined>,
  command: Command,
): Promise<unknown> {
  if (command.scope && !(await checkScope(command.scope))) {
    return undefined;
  }

  if ("commands" in command) {
    if (command.commands instanceof Array) {
      return Promise.all(
        command.commands.map(
          async (subcommand) => await execute(executor, checkScope, subcommand),
        ),
      );
    }

    return await execute(executor, checkScope, command.commands);
  }

  return await executor(command.command, command.args);
}

export type Command = Single | Multiple;

export type Single = {
  command: string;
  args?: any;
  scope?: any;
};

export type Multiple = {
  commands: Single[] | Multiple;
  scope?: any;
};
