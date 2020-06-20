import * as vscode from "vscode";
import { Config } from "./config";

let decoration: vscode.TextEditorDecorationType | undefined;

function highlight(ranges: vscode.Range[]): void {
  if (decoration) {
    const { activeTextEditor } = vscode.window;
    activeTextEditor?.setDecorations(decoration, ranges);
  }
}

function init(): void {
  decoration = vscode.window.createTextEditorDecorationType({
    dark: {
      backgroundColor: Config.get("darkColor"),
    },
    light: {
      backgroundColor: Config.get("lightColor"),
    },
    isWholeLine: true,
  });
}

export const Highlighter = {
  highlight,
  init,
};
