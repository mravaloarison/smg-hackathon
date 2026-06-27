# Prompt for Claude — Add Chord Sheet Viewer to Existing App

Copy everything below this line and paste it as your first message to Claude in VSCode.

---

## Context

I want to add a chord sheet **viewer** to the song detail page: parse the stored chord-over-words text, render inline guitar/piano diagrams above each chord, support transposing, and let users click a diagram to see all voicings in a modal.

## Libraries to install (use these exact packages — do not substitute)

```bash
npm install chordsheetjs @tombatossals/chords-db @tombatossals/react-chords @tonaljs/tonal
```

## Feature spec

On the song detail page, below the existing lyrics/chords text, add a **rendered chord sheet** section that includes:

1. **Chord-over-words parser** — reads text where chords sit on lines above the matching words (standard "chords over words" format).
2. **Inline chord diagrams** — a small diagram appears directly above each chord name in the rendered output.
3. **Instrument toggle** — Guitar or Piano. Guitar shows a fretboard fingering; Piano highlights the chord's notes on a small SVG keyboard.
4. **Show/hide toggle** — an eye icon button labelled "Chord pics" shows or hides all diagrams without losing the text view.
5. **Transpose** — two buttons (− ♭ and ♯ +) shift all chords up or down by semitone. A "Reset to original" link appears when transposed.
6. **Click-to-expand modal** — clicking any diagram opens a modal with a large version. For guitar, ‹ › arrows let the user scroll through all available voicings from the database. Escape or clicking the backdrop closes the modal.

## Critical implementation notes (read before writing any code)

### chordsheetjs
- Import: `import ChordSheetJS, { ChordLyricsPair, Song } from "chordsheetjs"` — the pair class is `ChordLyricsPair` (with the **s**), not `ChordLyricPair`.
- Parse: `new ChordSheetJS.ChordsOverWordsParser().parse(text)` returns a `Song`.
- Transpose: use `song.transpose(n)` (integer semitones). Do **not** use `song.changeKey()` — it requires `setKey()` first and is error-prone.
- Iterate: `song.lines` → each line has `.items` which are `ChordLyricsPair`. Each pair has `.chords` (string) and `.lyrics` (string).

### @tombatossals/chords-db
- There is **no index.js**. Import directly: `import guitarDb from "@tombatossals/chords-db/lib/guitar.json"`.
- DB key naming: sharps use `Csharp` / `Fsharp`; flats use their own name (`Eb`, `Ab`, `Bb`). Map note + accidental to the right DB key.
- Chord suffix for plain major is `"major"`, plain minor is `"minor"` (not `""` or `"m"`).
- Each entry in `guitarDb.chords[key]` is `{ suffix: string, positions: ChordPosition[] }`. Use `positions[0]` for the default voicing, or expose all positions for voicing navigation.

### @tombatossals/react-chords
- The package ships **no TypeScript types**. Create `types/react-chords.d.ts`:

```ts
declare module "@tombatossals/react-chords/lib/Chord" {
  import { FC } from "react";
  interface ChordProps {
    chord: { frets: number[]; fingers: number[]; baseFret: number; barres: number[]; capo?: boolean };
    instrument: { strings: number; fretsOnChord: number; name: string; keys: string[]; tunings: { standard: string[] } };
    lite?: boolean;
  }
  const Chord: FC<ChordProps>;
  export default Chord;
}
```

- Import: `import Chord from "@tombatossals/react-chords/lib/Chord"`.
- The SVG viewBox is 80 × 70 (width × height). Set container `height = Math.round(width * 70/80)`.
- The instrument config object:

```ts
const GUITAR_INSTRUMENT = {
  strings: guitarDb.main.strings,
  fretsOnChord: guitarDb.main.fretsOnChord,
  name: "Guitar",
  keys: guitarDb.keys,
  tunings: { standard: guitarDb.tunings.standard },
};
```

### @tonaljs/tonal
- `Chord.get("Am").notes` returns `["A", "C", "E"]` (no octave numbers).
- Normalize enharmonics before Set lookups (e.g. `Db → C#`, `Bb → A#`).

### Piano SVG keyboard
Build a simple SVG (`viewBox="0 0 56 38"`) with 7 white keys and 5 black keys. Highlight the keys that match the chord's notes in indigo. Black key x positions (left edge): C#=5.5, D#=13.5, F#=29.5, G#=37.5, A#=45.5. White keys are 8 units wide, 37 units tall. Black keys are 5 units wide, 24 units tall.

## Files to create

Create all of these new files (do not modify existing app files until the section on integration):

### `lib/parseChordSheet.ts`

```ts
import ChordSheetJS, { ChordLyricsPair, Song } from "chordsheetjs";

export type ParsedPair  = { chord: string; lyrics: string };
export type ParsedLine  = { pairs: ParsedPair[] };
export type ParsedSong  = { title?: string; lines: ParsedLine[] };

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
```

### `lib/chordDiagram.ts`

```ts
import guitarDb from "@tombatossals/chords-db/lib/guitar.json";

export type ChordPosition = {
  frets: number[]; fingers: number[]; baseFret: number; barres: number[]; capo?: boolean;
};

export const GUITAR_INSTRUMENT = {
  strings: guitarDb.main.strings,
  fretsOnChord: guitarDb.main.fretsOnChord,
  name: "Guitar",
  keys: guitarDb.keys,
  tunings: { standard: guitarDb.tunings.standard },
};

const NOTE_TO_DB_KEY: Record<string, string> = {
  C:"C", "C#":"Csharp", Db:"Csharp", D:"D", "D#":"Eb", Eb:"Eb",
  E:"E", Fb:"E", F:"F", "F#":"Fsharp", Gb:"Fsharp",
  G:"G", "G#":"Ab", Ab:"Ab", A:"A", "A#":"Bb", Bb:"Bb", B:"B", Cb:"B",
};

const SUFFIX_MAP: Record<string, string> = {
  "":"major", m:"minor", min:"minor", maj:"major",
  dim:"dim", dim7:"dim7", aug:"aug",
  sus2:"sus2", sus4:"sus4",
  "7":"7", m7:"m7", maj7:"maj7",
  "9":"9", m9:"m9", maj9:"maj9",
  "11":"11", "13":"13", "6":"6", m6:"m6", add9:"add9", mmaj7:"mmaj7",
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
```

### `lib/pianoNotes.ts`

```ts
import { Chord } from "@tonaljs/tonal";

const ENHARMONIC: Record<string, string> = {
  Db:"C#", Eb:"D#", Gb:"F#", Ab:"G#", Bb:"A#",
  "B#":"C", Cb:"B", "E#":"F", Fb:"E",
};

export function normalizeNote(n: string): string {
  return ENHARMONIC[n] ?? n;
}

export function getChordNotes(chordName: string): string[] {
  return Chord.get(chordName).notes.map(normalizeNote);
}
```

### `components/GuitarChordDiagram.tsx`

```tsx
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
```

### `components/PianoChordDiagram.tsx`

```tsx
"use client";

const WHITE_KEYS = ["C","D","E","F","G","A","B"];
const BLACK_KEYS = [
  { note:"C#", x:5.5 }, { note:"D#", x:13.5 },
  { note:"F#", x:29.5 }, { note:"G#", x:37.5 }, { note:"A#", x:45.5 },
];

interface Props { notes: string[]; width: number }

export default function PianoChordDiagram({ notes, width }: Props) {
  const height = Math.round(width * (38 / 56));
  const lit = new Set(notes);
  return (
    <div className="bg-white rounded-sm overflow-hidden flex-shrink-0" style={{ width, height }}>
      <svg viewBox="0 0 56 38" width="100%" xmlns="http://www.w3.org/2000/svg">
        {WHITE_KEYS.map((note, i) => (
          <rect key={note} x={i*8+0.5} y={0.5} width={7} height={37}
            fill={lit.has(note) ? "#6366f1" : "white"} stroke="#bbb" strokeWidth={0.5} />
        ))}
        {BLACK_KEYS.map(({ note, x }) => (
          <rect key={note} x={x} y={0} width={5} height={24}
            fill={lit.has(note) ? "#4f46e5" : "#222"} />
        ))}
      </svg>
    </div>
  );
}
```

### `components/InstrumentDiagram.tsx`

```tsx
"use client";
import GuitarChordDiagram from "@/components/GuitarChordDiagram";
import PianoChordDiagram from "@/components/PianoChordDiagram";
import { getChordNotes } from "@/lib/pianoNotes";

export type Instrument = "guitar" | "piano";

interface Props { chordName: string; width: number; instrument: Instrument }

export default function InstrumentDiagram({ chordName, width, instrument }: Props) {
  if (instrument === "guitar") return <GuitarChordDiagram chordName={chordName} width={width} />;
  return <PianoChordDiagram notes={getChordNotes(chordName)} width={width} />;
}
```

### `components/ChordModal.tsx`

```tsx
"use client";
import { useEffect, useState } from "react";
import Chord from "@tombatossals/react-chords/lib/Chord";
import { getAllGuitarVoicings, GUITAR_INSTRUMENT } from "@/lib/chordDiagram";
import { getChordNotes } from "@/lib/pianoNotes";
import PianoChordDiagram from "@/components/PianoChordDiagram";
import type { Instrument } from "@/components/InstrumentDiagram";

interface Props { chordName: string; instrument: Instrument; onClose: () => void }

export default function ChordModal({ chordName, instrument, onClose }: Props) {
  const [idx, setIdx] = useState(0);
  const voicings = instrument === "guitar" ? getAllGuitarVoicings(chordName) : [];
  const notes    = instrument === "piano"  ? getChordNotes(chordName) : [];
  const total = voicings.length;

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIdx((i) => Math.min(i+1, total-1));
      if (e.key === "ArrowLeft")  setIdx((i) => Math.max(i-1, 0));
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose, total]);

  useEffect(() => setIdx(0), [chordName]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
         onClick={onClose}>
      <div className="bg-zinc-900 border border-zinc-700 rounded-2xl p-8 flex flex-col items-center gap-5 shadow-2xl"
           onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between w-full">
          <h2 className="text-2xl font-bold text-indigo-400 font-mono">{chordName}</h2>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-200 transition-colors text-xl ml-10">✕</button>
        </div>

        {instrument === "guitar" && voicings.length > 0 && (
          <div className="bg-white rounded-lg overflow-hidden"
               style={{ width: 180, height: Math.round(180 * 70/80) }}>
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
            <button onClick={() => setIdx((i) => i-1)} disabled={idx===0}
              className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-300 text-xl hover:border-indigo-500 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors">‹</button>
            <span className="text-zinc-500 text-sm tabular-nums min-w-[4rem] text-center">{idx+1} / {total}</span>
            <button onClick={() => setIdx((i) => i+1)} disabled={idx===total-1}
              className="w-10 h-10 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-300 text-xl hover:border-indigo-500 hover:text-white disabled:opacity-25 disabled:cursor-not-allowed transition-colors">›</button>
          </div>
        )}
      </div>
    </div>
  );
}
```

### `components/ChordSheet.tsx`

```tsx
"use client";
import type { ParsedSong } from "@/lib/parseChordSheet";
import InstrumentDiagram, { type Instrument } from "@/components/InstrumentDiagram";

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
                <span key={pi} className="inline-flex flex-col items-start"
                      style={{ whiteSpace:"pre", minWidth: showDiagrams && hasChord ? DIAG_PX : undefined }}>
                  {showDiagrams && hasAnyChord && (
                    <span className="flex-shrink-0 block"
                          style={{ height:DIAG_PX, width:hasChord ? DIAG_PX : 0, marginTop:20, marginBottom:4 }}>
                      {hasChord && (
                        <button onClick={() => onChordClick(pair.chord.trim())}
                          className="block w-full h-full cursor-pointer hover:opacity-80 hover:scale-105 transition-all duration-150 rounded-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          title={`View ${pair.chord.trim()} voicings`}>
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
```

## Integration — plug into the existing song detail page

On the page where users view or add lyrics/chords, read the stored chord text and render the viewer below it. The component needs this state:

```tsx
const [semitoneOffset, setSemitoneOffset] = useState(0);
const [showDiagrams, setShowDiagrams]     = useState(true);
const [instrument, setInstrument]         = useState<Instrument>("guitar");
const [modalChord, setModalChord]         = useState<string | null>(null);

// Parse once; transpose on the fly
const originalSong = useMemo(() => {
  try { return parseSong(chordsText); } catch { return null; }
}, [chordsText]);

const displaySong = originalSong && semitoneOffset !== 0
  ? originalSong.transpose(semitoneOffset)
  : originalSong;

const parsed = displaySong ? songToDisplay(displaySong) : null;
```

Controls to add above the rendered sheet:

```tsx
{/* Chord pics toggle */}
<button onClick={() => setShowDiagrams((v) => !v)}
  className={showDiagrams ? "... active style ..." : "... inactive style ..."}>
  {/* open/closed eye SVG + "Chord pics" label */}
</button>

{/* Guitar / Piano */}
{showDiagrams && (["guitar","piano"] as Instrument[]).map((inst) => (
  <button key={inst} onClick={() => setInstrument(inst)}>{inst}</button>
))}

{/* Transpose */}
<button onClick={() => setSemitoneOffset((o) => (o+11) % 12)}>− ♭</button>
<button onClick={() => setSemitoneOffset((o) => (o+1)  % 12)}>♯ +</button>
{semitoneOffset !== 0 && (
  <button onClick={() => setSemitoneOffset(0)}>Reset to original</button>
)}
```

Render at the bottom:

```tsx
{parsed && (
  <>
    <ChordSheet
      song={parsed}
      showDiagrams={showDiagrams}
      instrument={instrument}
      onChordClick={setModalChord}
    />
    {modalChord && (
      <ChordModal
        chordName={modalChord}
        instrument={instrument}
        onClose={() => setModalChord(null)}
      />
    )}
  </>
)}
```

## Notes for Claude

- The `types/react-chords.d.ts` file must be created for TypeScript to accept the `@tombatossals/react-chords/lib/Chord` import.
- Do not use `any` in TypeScript — the `guitarDb.chords` cast to `Record<string, { suffix: string; positions: ChordPosition[] }[]>` is the only cast needed.
- All diagram components must be `"use client"` if the app uses Next.js App Router.
- Verify with `tsc --noEmit` after creating all files before integrating.
