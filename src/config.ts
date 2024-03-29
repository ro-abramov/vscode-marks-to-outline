import * as vscode from "vscode";

const DEFAULT_CONFIG = {
  mark: "MARK: -",
  darkColor: "hsla(0, 100%, 100%, 0.07)",
  lightColor: "hsla(0, 0%, 0%, 0.07)",
  highlightMarks: true,
  availableLanguages: "*",
};

type ConfigOptions = typeof DEFAULT_CONFIG;
type ConfigKey = keyof ConfigOptions;

export class Config {
  workspaceConfiguration: vscode.WorkspaceConfiguration;
  constructor() {
    this.workspaceConfiguration = vscode.workspace.getConfiguration("marksToOutline");
  }

  get<T extends ConfigKey>(key: T): ConfigOptions[T] {
    return this.workspaceConfiguration.get(key) ?? DEFAULT_CONFIG[key];
  }

  async getListOfActiveLanguages(): Promise<vscode.DocumentSelector> {
    const langs: string = this.get("availableLanguages");
    if (langs === "*") {
      return await vscode.languages.getLanguages();
    }
    return langs.split(",").map((l) => l.trim());
  }
}
