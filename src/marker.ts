import { Location, Position, Range, SymbolInformation, SymbolKind, TextDocument } from "vscode";
import { Config } from "./Config";
import { MarkTokens } from "./types";

interface MakeSymbolFn extends MarkTokens {
  document: TextDocument;
}

export class Marker {
  constructor(private readonly config: Config) {}

  private match(text: string): [string, number, number] | null {
    const MARK_KEYWORD = this.config.get("mark");
    const r = new RegExp(`${MARK_KEYWORD}(.+)`);
    const match = text.match(r);
    if (match) {
      const [, name] = match;
      return [name.trim(), (match.index ?? 0) + MARK_KEYWORD.length, text.length];
    }
    return null;
  }

  findMarkerInLine(document: TextDocument, line: number) {
    const { text } = document.lineAt(line);
    const match = this.match(text);
    if (match && match[0] !== "") {
      return {
        text: match[0],
        range: new Range(new Position(line, match[1]), new Position(line, match[2])),
      };
    }
  }

  makeSymbol(cfg: MakeSymbolFn): SymbolInformation {
    const locationUri = new Location(cfg.document.uri, cfg.range);
    return new SymbolInformation(cfg.text, SymbolKind.Key, "", locationUri);
  }
}
