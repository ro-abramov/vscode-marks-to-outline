import * as vscode from "vscode";
import { Marker } from "./marker";
import { Config } from "./Config";
import { Highlighter } from "./Highlighter";

export function makeSymbolProvider(marker: Marker, config: Config, highlighter: Highlighter) {
  return {
    provideDocumentSymbols(
      document: vscode.TextDocument
    ): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {
      if (document.lineCount > 5000) {
        return [];
      }
      const lineCount = document.lineCount;
      const isSymbolHighlightEnabled = config.get("highlightMarks");
      const ranges: vscode.Range[] = [];
      const symbols = [];

      for (let line = 0; line < lineCount; line++) {
        const token = marker.findMarkerInLine(document, line);
        if (!token) {
          continue;
        }
        if (isSymbolHighlightEnabled) {
          ranges.push(token.range);
        }
        symbols.push(marker.makeSymbol({ ...token, document }));
      }
      if (isSymbolHighlightEnabled) {
        highlighter.highlight(ranges);
      }
      return symbols;
    },
  };
}
