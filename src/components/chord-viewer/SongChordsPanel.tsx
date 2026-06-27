"use client";

import { useEffect, useRef, useState } from "react";
import { subscribeChordVersions, saveChordVersion, toggleLike } from "@/lib/firestore/chordVersions";
import { subscribeSongLyrics } from "@/lib/firestore/songLyrics";
import { ChordVersion, SongLyricsDoc } from "@/lib/firestore/types";
import { useAuth } from "@/contexts/AuthContext";
import { Song } from "@/lib/itunes/types";
import ChordViewer from "@/components/chord-viewer/ChordViewer";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

interface Props {
  song: Song;
  userUid: string | null;
}

function buildChordsText(lyricsDoc: SongLyricsDoc | null, version: ChordVersion): string {
  if (version.rawText !== undefined) return version.rawText;

  if (lyricsDoc) {
    const lines: string[] = [];
    lyricsDoc.sections.forEach((s, si) => {
      if (s.name) lines.push(`[${s.name}]`);
      s.lines.forEach((l, li) => {
        const chordLine = version.chords[`${si}_${li}`] ?? "";
        if (chordLine.trim()) lines.push(chordLine);
        if (l.lyrics.trim()) lines.push(l.lyrics);
      });
      lines.push("");
    });
    return lines.join("\n").trim();
  }

  const keys = Object.keys(version.chords).sort((a, b) => {
    const [asi, ali] = a.split("_").map(Number);
    const [bsi, bli] = b.split("_").map(Number);
    return asi !== bsi ? asi - bsi : ali - bli;
  });
  return keys.map((k) => version.chords[k]).filter(Boolean).join("\n");
}

export default function SongChordsPanel({ song, userUid }: Props) {
  const songId = String(song.id);
  const { profile } = useAuth();

  const [isOpen, setIsOpen] = useState(false);
  const [lyricsDoc, setLyricsDoc] = useState<SongLyricsDoc | null>(null);
  const [versions, setVersions] = useState<ChordVersion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const readyRef = useRef(0);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    readyRef.current = 0;
    const finish = () => { readyRef.current += 1; if (readyRef.current >= 2) setIsLoading(false); };
    const unsub1 = subscribeSongLyrics(songId, (doc) => { setLyricsDoc(doc); finish(); });
    const unsub2 = subscribeChordVersions(songId, (v) => { setVersions(v); finish(); });
    return () => { unsub1(); unsub2(); };
  }, [isOpen, songId]);

  useEffect(() => {
    setIsOpen(false);
    setLyricsDoc(null);
    setVersions([]);
    setIsLoading(false);
    setSelectedVersionId(null);
    setIsEditing(false);
    setDraftText("");
  }, [songId]);

  const myVersionId = userUid ? `${songId}_${userUid}` : null;
  const myVersion = versions.find((v) => v.id === myVersionId) ?? null;
  const selectedVersion = versions.find((v) => v.id === selectedVersionId) ?? null;
  const isViewingMine = selectedVersionId === myVersionId && myVersion !== null;
  const chordsText = selectedVersion ? buildChordsText(lyricsDoc, selectedVersion) : "";

  function startEditing() {
    setDraftText(myVersion ? (myVersion.rawText ?? buildChordsText(lyricsDoc, myVersion)) : "");
    setIsEditing(true);
  }

  function cancelEditing() { setIsEditing(false); setDraftText(""); }

  async function handleSave() {
    if (!userUid || !profile?.username || !myVersionId) return;
    setIsSaving(true);
    try {
      await saveChordVersion(
        songId, userUid, profile.username, {}, draftText,
        { title: song.title, artist: song.artistName },
      );
      const optimistic: ChordVersion = {
        id: myVersionId, songId,
        songTitle: song.title, songArtist: song.artistName,
        userId: userUid, username: profile.username,
        chords: {}, rawText: draftText,
        likes: myVersion?.likes ?? 0,
        likedBy: myVersion?.likedBy ?? [],
        createdAt: myVersion?.createdAt ?? Date.now(),
        updatedAt: Date.now(),
      };
      setVersions((prev) => {
        const exists = prev.some((v) => v.id === myVersionId);
        const next = exists ? prev.map((v) => v.id === myVersionId ? optimistic : v) : [...prev, optimistic];
        return next.sort((a, b) => b.likes - a.likes || a.username.localeCompare(b.username));
      });
      setSelectedVersionId(myVersionId);
      setIsEditing(false);
      setDraftText("");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleLike(version: ChordVersion) {
    if (!userUid) return;
    await toggleLike(version.id, userUid, version.likedBy.includes(userUid));
  }

  return (
    <div className="mt-8">
      {/* Collapsible header */}
      <button
        type="button"
        onClick={() => setIsOpen((v) => !v)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 text-left transition hover:bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:bg-neutral-800"
      >
        <span className="flex items-center gap-2">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0 text-indigo-500">
            <path fillRule="evenodd" d="M4.5 2A1.5 1.5 0 0 0 3 3.5v13A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V7.621a1.5 1.5 0 0 0-.44-1.06l-4.12-4.122A1.5 1.5 0 0 0 11.378 2H4.5Zm2.25 8.5a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Zm0 3a.75.75 0 0 0 0 1.5h6.5a.75.75 0 0 0 0-1.5h-6.5Z" clipRule="evenodd" />
          </svg>
          <span className="font-semibold text-neutral-900 dark:text-neutral-100">Chords</span>
          {!isLoading && versions.length > 0 && (
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
              {versions.length} version{versions.length !== 1 ? "s" : ""}
            </span>
          )}
        </span>
        <svg viewBox="0 0 20 20" fill="currentColor"
          className={`h-4 w-4 flex-shrink-0 text-neutral-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}>
          <path fillRule="evenodd" d="M5.22 8.22a.75.75 0 0 1 1.06 0L10 11.94l3.72-3.72a.75.75 0 1 1 1.06 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0L5.22 9.28a.75.75 0 0 1 0-1.06Z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="mt-4 px-1">
          {isLoading && (
            <div className="flex items-center gap-2 py-4">
              <LoadingSpinner />
              <p className="text-sm text-neutral-400">Loading chords…</p>
            </div>
          )}

          {/* Version list */}
          {!isLoading && !isEditing && (
            <div className="flex flex-col gap-5">
              <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
                {/* No chords row */}
                <button
                  onClick={() => setSelectedVersionId(null)}
                  className={`flex w-full items-center gap-3 px-4 py-3 text-left text-sm transition ${
                    selectedVersionId === null
                      ? "bg-neutral-100 dark:bg-neutral-800"
                      : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                  }`}
                >
                  <span className={`h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 transition ${
                    selectedVersionId === null
                      ? "border-neutral-700 bg-neutral-700 dark:border-neutral-200 dark:bg-neutral-200"
                      : "border-neutral-300 dark:border-neutral-600"
                  }`} />
                  <span className="text-neutral-600 dark:text-neutral-400">No chords</span>
                </button>

                {/* One row per version */}
                {versions.map((v) => {
                  const isSelected = selectedVersionId === v.id;
                  const isMine = v.userId === userUid;
                  const liked = userUid ? v.likedBy.includes(userUid) : false;
                  return (
                    <div
                      key={v.id}
                      className={`flex items-center border-t border-neutral-200 dark:border-neutral-800 ${
                        isSelected ? "bg-indigo-50 dark:bg-indigo-950/40" : "hover:bg-neutral-50 dark:hover:bg-neutral-800/50"
                      }`}
                    >
                      <button
                        onClick={() => setSelectedVersionId(v.id)}
                        className="flex flex-1 items-center gap-3 px-4 py-3 text-left text-sm"
                      >
                        <span className={`h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 transition ${
                          isSelected
                            ? "border-indigo-600 bg-indigo-600 dark:border-indigo-400 dark:bg-indigo-400"
                            : "border-neutral-300 dark:border-neutral-600"
                        }`} />
                        <span className={`font-medium ${isSelected ? "text-indigo-700 dark:text-indigo-300" : "text-neutral-700 dark:text-neutral-300"}`}>
                          {isMine ? "You" : v.username}
                        </span>
                        {v.likes > 0 && (
                          <span className="text-xs text-neutral-400 dark:text-neutral-500">♥ {v.likes}</span>
                        )}
                      </button>

                      {/* Actions */}
                      <div className="flex items-center gap-1 pr-3">
                        {isMine && isSelected && (
                          <button
                            onClick={startEditing}
                            className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-500 hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                          >
                            Edit
                          </button>
                        )}
                        {!isMine && userUid && (
                          <button
                            onClick={() => handleLike(v)}
                            className={`rounded-full border px-3 py-1 text-xs transition ${
                              liked
                                ? "border-rose-200 bg-rose-50 text-rose-500 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-400"
                                : "border-neutral-200 text-neutral-400 hover:border-rose-200 hover:text-rose-400 dark:border-neutral-700 dark:text-neutral-500"
                            }`}
                          >
                            {liked ? "♥" : "♡"} {v.likes > 0 ? v.likes : ""}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}

                {/* Add yours row */}
                {userUid && !myVersion && (
                  <button
                    onClick={startEditing}
                    className="flex w-full items-center gap-3 border-t border-dashed border-neutral-200 px-4 py-3 text-left text-sm text-indigo-500 transition hover:bg-indigo-50 dark:border-neutral-700 dark:text-indigo-400 dark:hover:bg-indigo-950/30"
                  >
                    <span className="h-3.5 w-3.5 flex-shrink-0 rounded-full border-2 border-dashed border-indigo-400" />
                    + Add your version
                  </button>
                )}

                {versions.length === 0 && !userUid && (
                  <p className="px-4 py-3 text-sm text-neutral-400 dark:text-neutral-500 border-t border-neutral-200 dark:border-neutral-800">
                    Sign in to add chords.
                  </p>
                )}
              </div>

              {/* Viewer */}
              {selectedVersion && chordsText ? (
                <ChordViewer chordsText={chordsText} />
              ) : selectedVersionId === null && versions.length > 0 ? (
                <p className="text-sm text-neutral-400 dark:text-neutral-500">
                  Select a version above to view chords.
                </p>
              ) : versions.length === 0 && userUid ? (
                <p className="text-sm text-neutral-400 dark:text-neutral-500">
                  No chords yet — be the first to add some.
                </p>
              ) : null}
            </div>
          )}

          {/* Edit form */}
          {!isLoading && isEditing && (
            <div className="flex flex-col gap-4">
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                Chords go on one line, lyrics directly below (chords-over-words format).
              </p>
              <textarea
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                placeholder={`Am         F          C          G\nIs this the real life? Is this just fantasy?\nAm              E\nCaught in a landslide...`}
                rows={14}
                className="w-full resize-y rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 font-mono text-sm text-neutral-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-indigo-600 dark:focus:ring-indigo-950"
                spellCheck={false}
                autoComplete="off"
              />
              {draftText.trim() && (
                <div className="rounded-xl border border-neutral-100 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-950">
                  <p className="mb-3 text-xs font-medium uppercase tracking-widest text-neutral-400">Preview</p>
                  <ChordViewer chordsText={draftText} />
                </div>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={handleSave}
                  disabled={isSaving || !draftText.trim()}
                  className="rounded-full bg-indigo-600 px-5 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  {isSaving ? "Saving…" : myVersion ? "Update chords" : "Save chords"}
                </button>
                <button
                  onClick={cancelEditing}
                  className="rounded-full px-4 py-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
