import { Config } from "./Config";
import * as vscode from "vscode";

export class Highlighter {
  private decoration: vscode.TextEditorDecorationType | undefined;

  constructor(private readonly config: Config) {
    this.decoration = vscode.window.createTextEditorDecorationType({
      dark: {
        backgroundColor: this.config.get("darkColor"),
      },
      light: {
        backgroundColor: this.config.get("lightColor"),
      },
      isWholeLine: true,
    });
  }

  highlight(ranges: vscode.Range[]): void {
    if (!this.decoration) {
      return;
    }
    const { activeTextEditor } = vscode.window;
    activeTextEditor?.setDecorations(this.decoration, ranges);
  }
}
