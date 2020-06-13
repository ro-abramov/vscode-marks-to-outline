import * as vscode from "vscode";

//#region MARK: -Interfaces
interface MarkTokens {
  text: string;
  line: number;
  column: number;
}

interface MakeSymbolFn extends MarkTokens {
  document: vscode.TextDocument;
}
//#endregion

const getMarkKeyWord = (): string =>
  (vscode.workspace.getConfiguration("marksToOutline").get("mark") as string) ?? "MARK: -";

let MARK_KEYWORD = getMarkKeyWord();

function findMarks(text: string): [string, number] | null {
  const r = new RegExp(`${MARK_KEYWORD}(.+)`);
  const match = text.match(r);
  if (match) {
    const [, name] = match;
    return [name.trim(), (match.index ?? 0) + 6];
  }
  return null;
}

function makeSymbol(cfg: MakeSymbolFn): vscode.SymbolInformation {
  const locationUri = new vscode.Location(cfg.document.uri, new vscode.Position(cfg.line, cfg.column));
  return new vscode.SymbolInformation(cfg.text, vscode.SymbolKind.Key, "", locationUri);
}

export function checkLineForMarkTokens(document: vscode.TextDocument, line: number): MarkTokens | undefined {
  const { text } = document.lineAt(line);
  const match = findMarks(text);
  if (match && match[0] !== "") {
    return {
      text: match[0],
      line,
      column: match[1],
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

    return result.map((result) => makeSymbol({ ...result, document }));
  },
};

const registerExtension = (oldDisposable?: vscode.Disposable): vscode.Disposable => {
  if (oldDisposable) {
    oldDisposable.dispose();
  }
  MARK_KEYWORD = getMarkKeyWord();
  const disposable = vscode.languages.registerDocumentSymbolProvider(SUPPORTED_LANGUAGES, symbolProvider, {
    label: "MARKS",
  });
  return disposable;
};

const SUPPORTED_LANGUAGES = ["typescript", "javascript", "typescriptreact", "javascriptreact"];
export function activate(context: vscode.ExtensionContext) {
  let disposable = registerExtension();
  context.subscriptions.push(disposable);
  vscode.workspace.onDidChangeConfiguration(() => {
    disposable = registerExtension(disposable);
    context.subscriptions.push(disposable);
  });
}
