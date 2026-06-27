import guitarDb from "@tombatossals/chords-db/lib/guitar.json";

export type ChordPosition = {
  frets: number[];
  fingers: number[];
  baseFret: number;
  barres: number[];
  capo?: boolean;
};

export const GUITAR_INSTRUMENT = {
  strings: guitarDb.main.strings,
  fretsOnChord: guitarDb.main.fretsOnChord,
  name: "Guitar",
  keys: guitarDb.keys,
  tunings: { standard: guitarDb.tunings.standard },
};

const NOTE_TO_DB_KEY: Record<string, string> = {
  C: "C", "C#": "Csharp", Db: "Csharp", D: "D", "D#": "Eb", Eb: "Eb",
  E: "E", Fb: "E", F: "F", "F#": "Fsharp", Gb: "Fsharp",
  G: "G", "G#": "Ab", Ab: "Ab", A: "A", "A#": "Bb", Bb: "Bb", B: "B", Cb: "B",
};

const SUFFIX_MAP: Record<string, string> = {
  "": "major", m: "minor", min: "minor", maj: "major",
  dim: "dim", dim7: "dim7", aug: "aug",
  sus2: "sus2", sus4: "sus4",
  "7": "7", m7: "m7", maj7: "maj7",
  "9": "9", m9: "m9", maj9: "maj9",
  "11": "11", "13": "13", "6": "6", m6: "m6", add9: "add9", mmaj7: "mmaj7",
};

function parseChordName(chordName: string) {
  const name = chordName.split("/")[0];
  const match = name.match(/^([A-G])(#|b)?(.*)/);
  if (!match) return null;
  const [, note, acc = "", rawSuffix = ""] = match;
  const dbKey = NOTE_TO_DB_KEY[note + acc];
  if (!dbKey) return null;
  const dbSuffix = SUFFIX_MAP[rawSuffix] ?? rawSuffix;
  const chords = (guitarDb.chords as Record<string, { suffix: string; positions: ChordPosition[] }[]>)[dbKey];
  return chords?.find((c) => c.suffix === dbSuffix) ?? null;
}

export function lookupGuitarChord(chordName: string): ChordPosition | null {
  return parseChordName(chordName)?.positions[0] ?? null;
}

export function getAllGuitarVoicings(chordName: string): ChordPosition[] {
  return parseChordName(chordName)?.positions ?? [];
}
