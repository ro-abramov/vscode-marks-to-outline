import * as vscode from "vscode";
import { Highlighter } from "./Highlighter";
import { Config } from "./config";

//#region MARK: -Interfaces
interface MarkTokens {
  text: string;
  range: vscode.Range;
}

interface MakeSymbolFn extends MarkTokens {
  document: vscode.TextDocument;
}
//#endregion

let MARK_KEYWORD = Config.get("mark");

async function getListOfActiveLanguages(): Promise<vscode.DocumentSelector> {
  const langs: string = Config.get("availableLanguages");
  if (langs === "*") {
    return await vscode.languages.getLanguages();
  }
  return langs.split(",").map((l) => l.trim());
}

function findMarks(text: string): [string, number, number] | null {
  const r = new RegExp(`${MARK_KEYWORD}(.+)`);
  const match = text.match(r);
  if (match) {
    const [, name] = match;
    return [name.trim(), (match.index ?? 0) + MARK_KEYWORD.length, text.length];
  }
  return null;
}

function makeSymbol(cfg: MakeSymbolFn): vscode.SymbolInformation {
  const locationUri = new vscode.Location(cfg.document.uri, cfg.range);
  return new vscode.SymbolInformation(cfg.text, vscode.SymbolKind.Key, "", locationUri);
}

export function checkLineForMarkTokens(document: vscode.TextDocument, line: number): MarkTokens | undefined {
  const { text } = document.lineAt(line);
  const match = findMarks(text);
  if (match && match[0] !== "") {
    return {
      text: match[0],
      range: new vscode.Range(new vscode.Position(line, match[1]), new vscode.Position(line, match[2])),
    };
  }
}

const symbolProvider = {
  provideDocumentSymbols(
    document: vscode.TextDocument
  ): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {
    if (document.lineCount > 5000) {
      return [];
    }
    const lineCount = document.lineCount;
    let result: MarkTokens[] = [];
    for (let line = 0; line < lineCount; line++) {
      const symbol = checkLineForMarkTokens(document, line);
      if (symbol) {
        result.push(symbol);
      }
    }
    const ranges = result.map(({ range }) => range);
    Config.get("highlightMarks") && Highlighter.highlight(ranges);
    return result.map((result) => makeSymbol({ ...result, document }));
  },
};

const registerExtension = async (oldDisposable?: vscode.Disposable): Promise<vscode.Disposable> => {
  if (oldDisposable) {
    oldDisposable.dispose();
  }
  Config.init();
  Highlighter.init();
  MARK_KEYWORD = Config.get("mark");
  const SUPPORTED_LANGUAGES = await getListOfActiveLanguages();
  const disposable = vscode.languages.registerDocumentSymbolProvider(SUPPORTED_LANGUAGES, symbolProvider, {
    label: "MARKS",
  });
  return disposable;
};

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
