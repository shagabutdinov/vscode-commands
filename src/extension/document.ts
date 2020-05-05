import * as vscode from "vscode";
import * as vsc from "./lib/vsc";
import * as convert from "./lib/convert";
import { Document } from "./lib/types";

export async function create(): Promise<Document> {
  const contextChecker = vscode.extensions.getExtension(
    "shagabutdinov.context",
  );

  if (!contextChecker) {
    throw new Error("Extension not installed: shagabutdinov.context");
  }

  await contextChecker.activate();

  return {
    execute: vscode.commands.executeCommand,
    commands: await createCommands(),
    checkContext: (await contextChecker.exports.init()).check,
    getSelections: () => vscode.window.activeTextEditor?.selections || [],
    setSelections: (selections: vsc.Selection[]) => {
      if (vscode.window.activeTextEditor) {
        vscode.window.activeTextEditor.selections = convert.selections(
          selections,
        );
      }
    },
  };
}

async function createCommands() {
  const config = vscode.workspace.getConfiguration();

  const extensions = Object.entries(
    config.get<Record<string, boolean>>("commands.extensions") || {},
  );

  let commands: Record<string, (...args: any) => any> = {};

  for (const [extensionName, isActive] of extensions) {
    if (!isActive) {
      continue;
    }

    const extensionObject = vscode.extensions.getExtension(extensionName);
    if (!extensionObject) {
      throw new Error(
        "Commands extension declared but not found: " + extensionName,
      );
    }

    await extensionObject.activate();

    if (!extensionObject.exports?.commands) {
      throw new Error(
        "Commands extension does not have method: " +
          extensionName +
          ".commands",
      );
    }

    commands = { ...commands, ...(await extensionObject.exports.commands()) };
  }

  return commands;
}
