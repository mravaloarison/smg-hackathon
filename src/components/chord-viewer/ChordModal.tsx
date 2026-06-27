"use client";
import { useEffect, useState } from "react";
import Chord from "@tombatossals/react-chords/lib/Chord";
import { getAllGuitarVoicings, GUITAR_INSTRUMENT } from "@/lib/chordDiagram";
import { getChordNotes } from "@/lib/pianoNotes";
import PianoChordDiagram from "@/components/chord-viewer/PianoChordDiagram";
import type { Instrument } from "@/components/chord-viewer/InstrumentDiagram";

interface Props { chordName: string; instrument: Instrument; onClose: () => void }

export default function ChordModal({ chordName, instrument, onClose }: Props) {
  const [idx, setIdx] = useState(0);
  const voicings = instrument === "guitar" ? getAllGuitarVoicings(chordName) : [];
  const notes = instrument === "piano" ? getChordNotes(chordName) : [];
  const total = voicings.length;

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx((i) => Math.min(i + 1, total - 1));
      if (e.key === "ArrowLeft") setIdx((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, total]);

  useEffect(() => setIdx(0), [chordName]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 flex flex-col items-center gap-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between w-full">
          <h2 className="text-2xl font-bold text-indigo-400 font-mono">{chordName}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors text-xl ml-10">✕</button>
        </div>

        {instrument === "guitar" && voicings.length > 0 && (
          <div className="bg-white rounded-lg overflow-hidden" style={{ width: 180, height: Math.round(180 * 70 / 80) }}>
            <Chord chord={voicings[idx]} instrument={GUITAR_INSTRUMENT} />
          </div>
        )}
        {instrument === "guitar" && voicings.length === 0 && (
          <p className="text-zinc-500 text-sm">No voicing found</p>
        )}
        {instrument === "piano" && (
          <>
            <PianoChordDiagram notes={notes} width={280} />
            {notes.length > 0 && (
              <p className="text-zinc-400 text-sm font-mono tracking-widest">{notes.join(" – ")}</p>
            )}
          </>
        )}

        {instrument === "guitar" && total > 1 && (
          <div className="flex items-center gap-5">
            <button
              onClick={() => setIdx((i) => i - 1)}
              disabled={idx === 0}
              className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-300 text-xl hover:border-indigo-500 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            >‹</button>
            <span className="text-zinc-500 text-sm tabular-nums min-w-[4rem] text-center">{idx + 1} / {total}</span>
            <button
              onClick={() => setIdx((i) => i + 1)}
              disabled={idx === total - 1}
              className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-300 text-xl hover:border-indigo-500 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors"
            >›</button>
          </div>
        )}
      </div>
    </div>
  );
}
