import * as vsc from "extension/lib/vsc";
import { Document, Command } from "extension/lib/types";

// Executes command from the recursive "command" structure which hasn't context
// or the context check has passed. If the context check did not pass, tries to
// check and run the next command.
export function run(document: Document, command: Command): unknown {
  const [, result] = runCommand(document, command);
  return result;
}

function runCommand(document: Document, command: Command): [boolean, unknown] {
  if (command.context && !document.checkContext(command.context)) {
    return [false, undefined];
  }

  const callback = (): [boolean, unknown] => {
    if ("commands" in command) {
      if (command.commands instanceof Array) {
        for (const sub of command.commands) {
          const [executed, result] = runCommand(document, sub);

          if (executed) {
            return [true, result];
          }
        }

        return [false, undefined];
      }

      return runCommand(document, command.commands);
    }

    if (!(command.command in document.commands)) {
      throw new Error(
        "Command not found: " +
          command.command +
          " (probably, you want to run command in async mode?)",
      );
    }

    return [true, document.commands[command.command](command.args)];
  };

  if (
    "forEachSelection" in command &&
    command.forEachSelection &&
    document.getSelections().length !== 1
  ) {
    const result = withEachSelection(document, callback);
    return [result.some(([executed]) => executed), result];
  }

  return callback();
}

// Executes all commands in the recursive "command" structure. If the context
// check did not pass, returns undefined for the corresponding call.
export function execute(document: Document, command: Command): unknown {
  const callback = () => {
    if (command.context && !document.checkContext(command.context)) {
      return undefined;
    }

    if ("commands" in command) {
      if (command.commands instanceof Array) {
        return command.commands.map((subcommand) =>
          execute(document, subcommand),
        );
      }

      return execute(document, command.commands);
    }

    if (!(command.command in document.commands)) {
      throw new Error(
        "Command not found: " +
          command.command +
          " (probably, you want to run command in async mode?)",
      );
    }

    return document.commands[command.command](command.args);
  };

  if (
    "forEachSelection" in command &&
    command.forEachSelection &&
    document.getSelections().length !== 1
  ) {
    return withEachSelection(document, callback);
  }

  return callback();
}

function withEachSelection<Type>(
  document: Document,
  callback: () => Type,
): Type[] {
  const resultValue: Type[] = [];
  const resultSelections: vsc.Selection[] = [];
  const selections = document.getSelections();

  for (const index in selections) {
    document.setSelections([selections[index]]);
    resultValue[index] = callback();
    resultSelections.push(...document.getSelections());
  }

  document.setSelections(resultSelections);
  return resultValue;
}
