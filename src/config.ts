import * as vscode from "vscode";

const DEFAULT_CONFIG = {
  mark: "MARK: -",
  darkColor: "hsla(0, 100%, 100%, 0.07)",
  lightColor: "hsla(0, 0%, 0%, 0.07)",
  highlightMarks: true,
};

type Config = typeof DEFAULT_CONFIG;

let workspaceConfiguration: vscode.WorkspaceConfiguration | undefined;

function get<T extends keyof Config>(key: T): Config[T] {
  return workspaceConfiguration?.get(key) ?? DEFAULT_CONFIG[key];
}

function init() {
  workspaceConfiguration = vscode.workspace.getConfiguration("marksToOutline");
}

export const Config = {
  get,
  init,
};
