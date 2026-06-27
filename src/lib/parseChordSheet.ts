import ChordSheetJS, { ChordLyricsPair, Song } from "chordsheetjs";

export type ParsedPair = { chord: string; lyrics: string };
export type ParsedLine = { pairs: ParsedPair[] };
export type ParsedSong = { title?: string; lines: ParsedLine[] };

export function parseSong(input: string): Song {
  return new ChordSheetJS.ChordsOverWordsParser().parse(input);
}

export function songToDisplay(song: Song): ParsedSong {
  return {
    lines: song.lines.map((line) => ({
      pairs: line.items
        .filter((item): item is ChordLyricsPair => item instanceof ChordLyricsPair)
        .map((pair) => ({ chord: pair.chords ?? "", lyrics: pair.lyrics ?? "" })),
    })),
  };
}
