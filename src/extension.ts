import * as vscode from "vscode";
import * as vsc from "./extension/lib/vsc";
import * as convert from "./extension/lib/convert";
import * as commands from "./extension/commands";

export function activate(context: vscode.ExtensionContext) {
  const document = {
    execute: vscode.commands.executeCommand,
    checkScope: (scope: any) =>
      vscode.commands.executeCommand<boolean>("scope.check", scope),
    getSelections: () => vscode.window.activeTextEditor?.selections || [],
    setSelections: (selections: vsc.Selection[]) => {
      if (vscode.window.activeTextEditor) {
        vscode.window.activeTextEditor.selections = convert.selections(
          selections,
        );
      }
    },
  };

  context.subscriptions.push(
    vscode.commands.registerCommand("commands.run", (args: any) =>
      commands.run(document, args),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("commands.execute", (args: any) =>
      commands.execute(document, args),
    ),
  );
}

export function deactivate() {}
