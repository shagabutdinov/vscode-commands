import * as vscode from "vscode";
import { create as createDocument } from "./extension/document";
import * as commands from "./extension/commands";

const document = createDocument();
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("commands.run", async (args: any) =>
      commands.runAsync(await document, args)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("commands.execute", async (args: any) =>
      commands.executeAsync(await document, args)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("commands.runSync", async (args: any) =>
      commands.runSync(await document, args)
    )
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("commands.executeSync", async (args: any) =>
      commands.executeSync(await document, args)
    )
  );

  return {
    // runSync: commands.runAsync(document, args),
  };
}

export function deactivate() {}
