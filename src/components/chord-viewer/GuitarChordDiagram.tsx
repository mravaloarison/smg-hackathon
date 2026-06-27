"use client";
import Chord from "@tombatossals/react-chords/lib/Chord";
import { lookupGuitarChord, GUITAR_INSTRUMENT } from "@/lib/chordDiagram";

interface Props { chordName: string; width: number }

export default function GuitarChordDiagram({ chordName, width }: Props) {
  const position = lookupGuitarChord(chordName);
  const height = Math.round(width * (70 / 80));
  return (
    <div className="bg-white rounded-sm overflow-hidden flex-shrink-0" style={{ width, height }}>
      {position
        ? <Chord chord={position} instrument={GUITAR_INSTRUMENT} />
        : <div className="w-full h-full flex items-center justify-center text-zinc-300 text-[10px]">?</div>}
    </div>
  );
}
