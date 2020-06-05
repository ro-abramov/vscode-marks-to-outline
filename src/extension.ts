import * as vscode from "vscode";

function findMarks(text: string): [string, number] | null {
  const match = text.match(/MARK: -(.+)/);
  if (match) {
    const [, name] = match;
    return [name, (match.index ?? 0) + 6];
  }
  return null;
}

interface MarkTokens {
  text: string;
  line: number;
  column: number;
}

interface MakeSymbolFn extends MarkTokens {
  document: vscode.TextDocument;
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

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.languages.registerDocumentSymbolProvider(["typescript", "javascript"], symbolProvider, {
    label: "MARKS",
  });
  context.subscriptions.push(disposable);
}
