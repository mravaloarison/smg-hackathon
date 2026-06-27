import { Chord } from "@tonaljs/tonal";

const ENHARMONIC: Record<string, string> = {
  Db: "C#", Eb: "D#", Gb: "F#", Ab: "G#", Bb: "A#",
  "B#": "C", Cb: "B", "E#": "F", Fb: "E",
};

export function normalizeNote(n: string): string {
  return ENHARMONIC[n] ?? n;
}

export function getChordNotes(chordName: string): string[] {
  return Chord.get(chordName).notes.map(normalizeNote);
}
