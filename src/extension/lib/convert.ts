import * as vscode from "vscode";
import * as vsc from "./vsc";

export function selections(selections: vsc.Selection[]) {
  return selections.map(value => selection(value));
}

export function selection(selection: vsc.Selection) {
  return new vscode.Selection(
    position(selection.anchor),
    position(selection.active),
  );
}

export function position(position: vsc.Position) {
  return new vscode.Position(position.line, position.character);
}

export function range(range: vsc.Range) {
  return new vscode.Range(position(range.start), position(range.end));
}

export function edit(edit: vscode.TextEditorEdit, changes: vsc.Change[]) {
  changes.forEach(change => {
    if (vsc.isChangeInsert(change)) {
      edit.insert(position(change.position), change.value);
      return;
    }

    if (vsc.isChangeReplace(change)) {
      edit.replace(range(change.range), change.value);
      return;
    }

    if (vsc.isChangeDelete(change)) {
      edit.delete(range(change.range));
      return;
    }

    throw new Error("Unknown change: " + JSON.stringify(change));
  });
}
