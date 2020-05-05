import * as vscode from "vscode";
import { create as createDocument } from "./extension/document";
import * as commands from "./extension/commands";

export async function activate(context: vscode.ExtensionContext) {
  const document = await createDocument();

  context.subscriptions.push(
    vscode.commands.registerCommand("commands.run", async (args: any) =>
      commands.runAsync(document, args),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("commands.execute", async (args: any) =>
      commands.executeAsync(document, args),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("commands.runSync", (args: any) =>
      commands.runSync(document, args),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("commands.executeSync", (args: any) =>
      commands.executeSync(document, args),
    ),
  );
}

export function deactivate() {}
