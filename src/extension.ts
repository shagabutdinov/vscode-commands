import * as vscode from "vscode";
import * as vsc from "./extension/lib/vsc";
import * as convert from "./extension/lib/convert";
import * as commands from "./extension/commands";

export function activate(context: vscode.ExtensionContext) {
  const checkScope = (scope: any) =>
    vscode.commands.executeCommand<boolean>("scope.check", scope);

  context.subscriptions.push(
    vscode.commands.registerCommand("commands.run", (args: any) =>
      commands.execute(
        {
          execute: vscode.commands.executeCommand,
          checkScope,
          getSelections: () => vscode.window.activeTextEditor?.selections || [],
          setSelections: (selections: vsc.Selection[]) => {
            if (vscode.window.activeTextEditor) {
              vscode.window.activeTextEditor.selections = convert.selections(
                selections,
              );
            }
          },
        },
        args,
      ),
    ),
  );
}

export function deactivate() {}
