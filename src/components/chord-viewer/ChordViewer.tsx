"use client";
import { useMemo, useState } from "react";
import { parseSong, songToDisplay } from "@/lib/parseChordSheet";
import ChordSheet from "@/components/chord-viewer/ChordSheet";
import ChordModal from "@/components/chord-viewer/ChordModal";
import type { Instrument } from "@/components/chord-viewer/InstrumentDiagram";

interface Props {
  chordsText: string;
}

export default function ChordViewer({ chordsText }: Props) {
  const [semitoneOffset, setSemitoneOffset] = useState(0);
  const [showDiagrams, setShowDiagrams] = useState(false);
  const [instrument, setInstrument] = useState<Instrument>("guitar");
  const [modalChord, setModalChord] = useState<string | null>(null);

  const originalSong = useMemo(() => {
    try { return parseSong(chordsText); } catch { return null; }
  }, [chordsText]);

  const displaySong = useMemo(() => {
    if (!originalSong) return null;
    return semitoneOffset !== 0 ? originalSong.transpose(semitoneOffset) : originalSong;
  }, [originalSong, semitoneOffset]);

  const parsed = displaySong ? songToDisplay(displaySong) : null;

  if (!parsed) return null;

  return (
    <div className="flex flex-col gap-5">
      {/* Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Show/hide diagrams */}
        <button
          onClick={() => setShowDiagrams((v) => !v)}
          className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-medium transition ${
            showDiagrams
              ? "border-indigo-600 bg-indigo-600 text-white dark:border-indigo-500 dark:bg-indigo-500"
              : "border-neutral-300 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300"
          }`}
        >
          {showDiagrams ? (
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" />
              <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 0 1 0-1.186A10.004 10.004 0 0 1 10 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0 1 10 17c-4.257 0-7.893-2.66-9.336-6.41Z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
              <path fillRule="evenodd" d="M3.28 2.22a.75.75 0 0 0-1.06 1.06l14.5 14.5a.75.75 0 1 0 1.06-1.06l-1.745-1.745a10.029 10.029 0 0 0 3.3-4.38 1.651 1.651 0 0 0 0-1.185A10.004 10.004 0 0 0 9.999 3a9.956 9.956 0 0 0-4.744 1.194L3.28 2.22ZM7.752 6.69l1.092 1.092a2.5 2.5 0 0 1 3.374 3.373l1.091 1.092a4 4 0 0 0-5.557-5.557Z" clipRule="evenodd" />
              <path d="M10.748 13.93l2.523 2.523a10.006 10.006 0 0 1-7.487-1.284l1.44-1.44a2.5 2.5 0 0 0 3.524-.8ZM13.988 11.3l-1.44 1.44a2.5 2.5 0 0 0-3.524.8l-1.44 1.44a4 4 0 0 1 6.404-3.68Z" />
            </svg>
          )}
          Chord pics
        </button>

        {/* Guitar / Piano toggle */}
        {showDiagrams && (["guitar", "piano"] as Instrument[]).map((inst) => (
          <button
            key={inst}
            onClick={() => setInstrument(inst)}
            className={`rounded-full border px-3 py-1.5 text-sm capitalize transition ${
              instrument === inst
                ? "border-neutral-800 bg-neutral-800 text-white dark:border-neutral-200 dark:bg-neutral-200 dark:text-neutral-900"
                : "border-neutral-300 text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300"
            }`}
          >
            {inst}
          </button>
        ))}

        {/* Separator */}
        <div className="mx-1 h-5 w-px bg-neutral-200 dark:bg-neutral-700" />

        {/* Transpose */}
        <button
          onClick={() => setSemitoneOffset((o) => (o + 11) % 12)}
          className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300"
        >
          − ♭
        </button>
        <span className="min-w-[2rem] text-center text-sm font-mono text-neutral-500 dark:text-neutral-400">
          {semitoneOffset > 0 ? `+${semitoneOffset}` : semitoneOffset === 0 ? "0" : semitoneOffset}
        </span>
        <button
          onClick={() => setSemitoneOffset((o) => (o + 1) % 12)}
          className="rounded-full border border-neutral-300 px-3 py-1.5 text-sm text-neutral-600 hover:border-neutral-400 dark:border-neutral-700 dark:text-neutral-300"
        >
          ♯ +
        </button>
        {semitoneOffset !== 0 && (
          <button
            onClick={() => setSemitoneOffset(0)}
            className="text-xs text-indigo-500 underline underline-offset-2 hover:text-indigo-700 dark:text-indigo-400"
          >
            Reset to original
          </button>
        )}
      </div>

      {/* Sheet */}
      <ChordSheet
        song={parsed}
        showDiagrams={showDiagrams}
        instrument={instrument}
        onChordClick={setModalChord}
      />

      {/* Voicings modal */}
      {modalChord && (
        <ChordModal
          chordName={modalChord}
          instrument={instrument}
          onClose={() => setModalChord(null)}
        />
      )}
    </div>
  );
}
