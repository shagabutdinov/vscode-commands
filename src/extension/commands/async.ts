import * as vsc from "extension/lib/vsc";
import { Document, Command } from "extension/lib/types";

// Executes command from the recursive "command" structure which hasn't context
// or the context check has passed. If the context check did not pass, tries to
// check and run the next command.
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
  if (command.context && !document.checkContext(command.context)) {
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

    if (command.command in document.commands) {
      return [true, document.commands[command.command](command.args)];
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

// Executes all commands in the recursive "command" structure. If the context
// check did not pass, returns undefined for the corresponding call.
export async function execute(
  document: Document,
  command: Command,
): Promise<unknown> {
  const callback = async () => {
    if (command.context && !document.checkContext(command.context)) {
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

    if (command.command in document.commands) {
      return document.commands[command.command](command.args);
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
    resultSelections.push(...document.getSelections());
  }

  document.setSelections(resultSelections);
  return resultValue;
}
