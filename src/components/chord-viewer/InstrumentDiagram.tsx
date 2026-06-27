"use client";
import GuitarChordDiagram from "@/components/chord-viewer/GuitarChordDiagram";
import PianoChordDiagram from "@/components/chord-viewer/PianoChordDiagram";
import { getChordNotes } from "@/lib/pianoNotes";

export type Instrument = "guitar" | "piano";

interface Props { chordName: string; width: number; instrument: Instrument }

export default function InstrumentDiagram({ chordName, width, instrument }: Props) {
  if (instrument === "guitar") return <GuitarChordDiagram chordName={chordName} width={width} />;
  return <PianoChordDiagram notes={getChordNotes(chordName)} width={width} />;
}
