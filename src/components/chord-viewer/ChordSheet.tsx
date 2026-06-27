"use client";
import type { ParsedSong } from "@/lib/parseChordSheet";
import InstrumentDiagram, { type Instrument } from "@/components/chord-viewer/InstrumentDiagram";

const DIAG_PX = 60;

interface Props {
  song: ParsedSong;
  showDiagrams: boolean;
  instrument: Instrument;
  onChordClick: (chord: string) => void;
}

export default function ChordSheet({ song, showDiagrams, instrument, onChordClick }: Props) {
  return (
    <div className="font-mono text-base leading-none">
      {song.lines.map((line, li) => {
        if (line.pairs.length === 0) return <div key={li} className="h-3" />;
        const hasAnyChord = line.pairs.some((p) => p.chord.trim() !== "");
        return (
          <div key={li} className="flex flex-nowrap">
            {line.pairs.map((pair, pi) => {
              const hasChord = pair.chord.trim() !== "";
              const colChars = Math.max(
                pair.chord.length > 0 ? pair.chord.length + 1 : 0,
                pair.lyrics.length,
              );
              return (
                <span
                  key={pi}
                  className="inline-flex flex-col items-start"
                  style={{ whiteSpace: "pre", minWidth: showDiagrams && hasChord ? DIAG_PX : undefined }}
                >
                  {showDiagrams && hasAnyChord && (
                    <span
                      className="flex-shrink-0 block"
                      style={{ height: DIAG_PX, width: hasChord ? DIAG_PX : 0, marginTop: 20, marginBottom: 4 }}
                    >
                      {hasChord && (
                        <button
                          onClick={() => onChordClick(pair.chord.trim())}
                          className="block w-full h-full cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-150 rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          title={`View ${pair.chord.trim()} voicings`}
                        >
                          <InstrumentDiagram chordName={pair.chord.trim()} width={DIAG_PX} instrument={instrument} />
                        </button>
                      )}
                    </span>
                  )}
                  <span className={hasAnyChord
                    ? "text-indigo-600 dark:text-indigo-400 font-semibold leading-5 min-h-[1.25rem]"
                    : "leading-5 min-h-[1.25rem]"}>
                    {pair.chord.padEnd(colChars)}
                  </span>
                  <span className="leading-7 text-zinc-800 dark:text-zinc-200">
                    {pair.lyrics.padEnd(colChars)}
                  </span>
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}
