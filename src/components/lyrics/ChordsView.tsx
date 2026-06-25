"use client";

import { useRef } from "react";
import { SongLyricsSection } from "@/lib/firestore/types";

interface LyricsEditorProps {
  sections: SongLyricsSection[];
  isEditing: boolean;
  onChange: (sections: SongLyricsSection[]) => void;
  song_info?: { key?: string; tempo?: string; capo?: number | null; instruments?: string[] };
}

type Segment = { text: string; pos: number; isWord: boolean };

function parseSegments(lyrics: string): Segment[] {
  const segs: Segment[] = [];
  let i = 0;
  while (i < lyrics.length) {
    const start = i;
    if (/\S/.test(lyrics[i])) {
      while (i < lyrics.length && /\S/.test(lyrics[i])) i++;
      segs.push({ text: lyrics.slice(start, i), pos: start, isWord: true });
    } else {
      while (i < lyrics.length && /\s/.test(lyrics[i])) i++;
      segs.push({ text: lyrics.slice(start, i), pos: start, isWord: false });
    }
  }
  return segs;
}

function autoCapitalize(value: string): string {
  // Uppercase the first character of each chord token (after whitespace or at start)
  return value.replace(/(^|\s)([a-z])/g, (_, space, letter) => space + letter.toUpperCase());
}

function updateChords(
  sections: SongLyricsSection[],
  si: number,
  li: number,
  chords: string
): SongLyricsSection[] {
  return sections.map((s, i) =>
    i !== si ? s : { ...s, lines: s.lines.map((l, j) => (j !== li ? l : { ...l, chords })) }
  );
}

export default function LyricsEditor({ sections, isEditing, onChange, song_info }: LyricsEditorProps) {
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  const meta = [
    song_info?.key && `Key: ${song_info.key}`,
    song_info?.capo != null && `Capo: ${song_info.capo}`,
    song_info?.tempo && `Tempo: ${song_info.tempo}`,
    song_info?.instruments?.length && `Instruments: ${song_info.instruments.join(", ")}`,
  ].filter(Boolean) as string[];

  function handleWordClick(si: number, li: number, charPos: number) {
    const key = `${si}-${li}`;
    const input = inputRefs.current.get(key);
    if (!input) return;

    const current = sections[si].lines[li].chords;
    // Pad with spaces so the cursor can reach charPos
    const padded = current.length < charPos ? current + " ".repeat(charPos - current.length) : current;
    if (padded !== current) {
      onChange(updateChords(sections, si, li, padded));
    }
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(charPos, charPos);
    });
  }

  function handleChordChange(si: number, li: number, value: string) {
    onChange(updateChords(sections, si, li, autoCapitalize(value)));
  }

  return (
    <div className="flex flex-col gap-6">
      {meta.length > 0 && (
        <div className="flex flex-wrap gap-x-5 gap-y-1 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-2.5 text-lg dark:border-neutral-800 dark:bg-neutral-900">
          {meta.map((item) => {
            const [label, ...rest] = item.split(": ");
            return (
              <span key={item} className="text-neutral-600 dark:text-neutral-300">
                <span className="font-semibold text-neutral-800 dark:text-neutral-200">{label}:</span>{" "}
                {rest.join(": ")}
              </span>
            );
          })}
        </div>
      )}

      {sections.map((section, si) => (
        <div key={si} className="flex flex-col">
          <h3 className="mb-2 text-xs font-semibold uppercase tracking-widest text-neutral-400 dark:text-neutral-500">
            {section.name}
          </h3>
          {section.lines.map((line, li) => (
            <div key={li} className="py-0.5">
              {/* Chord row */}
              {isEditing ? (
                <input
                  ref={(el) => {
                    const key = `${si}-${li}`;
                    if (el) inputRefs.current.set(key, el);
                    else inputRefs.current.delete(key);
                  }}
                  type="text"
                  value={line.chords}
                  placeholder="click a word below, or type here…"
                  onChange={(e) => handleChordChange(si, li, e.target.value)}
                  className="w-full border-b border-dashed border-indigo-300 bg-transparent font-mono text-lg font-bold text-indigo-600 outline-none placeholder:font-normal placeholder:text-base placeholder:text-neutral-300 dark:border-indigo-700 dark:text-indigo-400 dark:placeholder:text-neutral-600"
                />
              ) : (
                line.chords && (
                  <div className="whitespace-pre font-mono text-lg font-bold leading-snug text-indigo-600 dark:text-indigo-400">
                    {line.chords}
                  </div>
                )
              )}

              {/* Lyrics row */}
              {line.lyrics ? (
                isEditing ? (
                  <div
                    className="select-none font-mono text-lg leading-relaxed text-neutral-900 dark:text-neutral-100"
                    title="Click a word to position the chord above it"
                  >
                    {parseSegments(line.lyrics).map((seg, idx) =>
                      seg.isWord ? (
                        <span
                          key={idx}
                          onClick={() => handleWordClick(si, li, seg.pos)}
                          className="cursor-pointer rounded-sm transition-colors hover:bg-indigo-100 hover:text-indigo-800 dark:hover:bg-indigo-900/40 dark:hover:text-indigo-300"
                        >
                          {seg.text}
                        </span>
                      ) : (
                        <span key={idx}>{seg.text}</span>
                      )
                    )}
                  </div>
                ) : (
                  <div className="font-mono text-lg leading-relaxed text-neutral-900 dark:text-neutral-100">
                    {line.lyrics}
                  </div>
                )
              ) : (
                <div className="h-3" />
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
