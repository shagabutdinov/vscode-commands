import * as vscode from "vscode";
import * as commands from "./extension/commands";

export function activate(context: vscode.ExtensionContext) {
  const checkContext = (context: any) =>
    vscode.commands.executeCommand<boolean>("context.check", context);

  context.subscriptions.push(
    vscode.commands.registerCommand("commands.run", (args: any) =>
      commands.execute(vscode.commands.executeCommand, checkContext, args),
    ),
  );
}

export function deactivate() {}
