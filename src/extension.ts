import * as vscode from "vscode";
import * as commands from "./extension/commands";

export function activate(context: vscode.ExtensionContext) {
  const checkContext = (context: any) =>
    vscode.commands.executeCommand<boolean>("context.check", context);

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      "commands.run",
      (editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any) =>
        commands.run(vscode.commands.executeCommand, checkContext, args),
    ),
  );

  context.subscriptions.push(
    vscode.commands.registerTextEditorCommand(
      "commands.execute",
      (editor: vscode.TextEditor, edit: vscode.TextEditorEdit, args: any) =>
        commands.execute(vscode.commands.executeCommand, checkContext, args),
    ),
  );
}

export function deactivate() {}
