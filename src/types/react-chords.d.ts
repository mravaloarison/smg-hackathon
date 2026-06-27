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
