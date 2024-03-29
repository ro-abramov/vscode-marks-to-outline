import { DocumentSymbol, Location, Position, Range, SymbolInformation, SymbolKind, TextDocument } from "vscode";
import { Config } from "./Config";
import { MarkTokens } from "./types";

interface MakeSymbolFn extends MarkTokens {
  document: TextDocument;
}

type MarkerSearchMatch = {
  text: string;
  start: number;
  end: number;
  groupKey: string;
};

export class Marker {
  constructor(private readonly config: Config) {}

  private match(text: string): MarkerSearchMatch | null {
    const markKeywords = this.config.getMarkKeywords();
    const r = new RegExp(`(?<markSymbol>${markKeywords.join("|")})(?<text>.+)`);
    const match = text.match(r);
    if (!match?.groups) {
      return null;
    }
    return {
      text: match.groups.text.trim(),
      start: (match.index ?? 0) + match.groups.markSymbol.length,
      end: text.length,
      groupKey: match.groups.markSymbol,
    };
  }

  findMarkerInLine(document: TextDocument, line: number) {
    const { text } = document.lineAt(line);
    const match = this.match(text);
    if (match?.text) {
      return {
        text: match.text,
        groupKey: match.groupKey,
        range: new Range(new Position(line, match.start), new Position(line, match.end)),
      };
    }
  }

  makeSymbol(cfg: MakeSymbolFn): DocumentSymbol {
    return new DocumentSymbol(cfg.text, "", SymbolKind.Constant, cfg.range, cfg.range);
  }

  convertSymbolsToTree(symbols: Map<string, DocumentSymbol[]>): DocumentSymbol[] {
    const mapEntries = Array.from(symbols.entries());
    if (mapEntries.length <= 1) {
      return mapEntries[0][1];
    }
    let symbolsTree: DocumentSymbol[] = [];
    for (let [groupKye, symbols] of mapEntries) {
      const firstSymbol = symbols[0];
      const root = new DocumentSymbol(
        groupKye,
        "",
        SymbolKind.Namespace,
        firstSymbol.range,
        firstSymbol.selectionRange
      );
      root.children = symbols;
      symbolsTree.push(root);
    }
    return symbolsTree;
  }
}
