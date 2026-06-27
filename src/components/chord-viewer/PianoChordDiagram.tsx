"use client";

const WHITE_KEYS = ["C", "D", "E", "F", "G", "A", "B"];
const BLACK_KEYS = [
  { note: "C#", x: 5.5 }, { note: "D#", x: 13.5 },
  { note: "F#", x: 29.5 }, { note: "G#", x: 37.5 }, { note: "A#", x: 45.5 },
];

interface Props { notes: string[]; width: number }

export default function PianoChordDiagram({ notes, width }: Props) {
  const height = Math.round(width * (38 / 56));
  const lit = new Set(notes);
  return (
    <div className="bg-white rounded-sm overflow-hidden flex-shrink-0" style={{ width, height }}>
      <svg viewBox="0 0 56 38" width="100%" xmlns="http://www.w3.org/2000/svg">
        {WHITE_KEYS.map((note, i) => (
          <rect key={note} x={i * 8 + 0.5} y={0.5} width={7} height={37}
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
