import * as vscode from "vscode";
import { Marker } from "./marker";
import { Config } from "./Config";
import { Highlighter } from "./Highlighter";

export function makeSymbolProvider(marker: Marker, config: Config, highlighter: Highlighter) {
  return {
    provideDocumentSymbols(
      document: vscode.TextDocument
    ): vscode.ProviderResult<vscode.SymbolInformation[] | vscode.DocumentSymbol[]> {
      const lineCount = document.lineCount;
      const isSymbolHighlightEnabled = config.get("highlightMarks");
      const ranges: vscode.Range[] = [];
      const symbols: Map<string, vscode.DocumentSymbol[]> = new Map();

      for (let line = 0; line < lineCount; line++) {
        const token = marker.findMarkerInLine(document, line);
        if (!token) {
          continue;
        }
        if (isSymbolHighlightEnabled) {
          ranges.push(token.range);
        }
        const symbol = marker.makeSymbol({ ...token, document });
        symbols.set(token.groupKey, [...(symbols.get(token.groupKey) ?? []), symbol]);
      }
      if (isSymbolHighlightEnabled) {
        highlighter.highlight(ranges);
      }
      return marker.convertSymbolsToTree(symbols);
    },
  };
}
