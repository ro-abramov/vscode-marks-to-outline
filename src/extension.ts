import * as vscode from "vscode";
import { Config } from "./Config";
import { Highlighter } from "./Highlighter";
import { Marker } from "./marker";
import { makeSymbolProvider } from "./symbol-provider";

async function registerExtension(oldDisposable?: vscode.Disposable): Promise<vscode.Disposable> {
  if (oldDisposable) {
    oldDisposable.dispose();
  }

  // MARK: - Init helper classes
  const config = new Config();
  const highlighter = new Highlighter(config);
  // Setup symbol provider
  const SUPPORTED_LANGUAGES = await config.getListOfActiveLanguages();
  const symbolProvider = makeSymbolProvider(new Marker(config), config, highlighter);
  return vscode.languages.registerDocumentSymbolProvider(SUPPORTED_LANGUAGES, symbolProvider, {
    label: "MARKS",
  });
}

/**
 * Initialize and activate the extension.
 *
 * @param {vscode.ExtensionContext} context - The extension context
 * @return {Promise<void>} A promise that resolves when the activation is complete
 */
export async function activate(context: vscode.ExtensionContext) {
  let disposable = await registerExtension();
  context.subscriptions.push(disposable);
  context.subscriptions.push(
    vscode.workspace.onDidChangeConfiguration(async () => {
      disposable = await registerExtension(disposable);
      context.subscriptions.push(disposable);
    })
  );
}
