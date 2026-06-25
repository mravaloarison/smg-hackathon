"use client";

import { useEffect, useRef, useState } from "react";
import { ChordVersion, SongLyricsDoc, SongLyricsSection } from "@/lib/firestore/types";
import { subscribeSongLyrics, saveSongLyrics } from "@/lib/firestore/songLyrics";
import { subscribeChordVersions, saveChordVersion, toggleLike } from "@/lib/firestore/chordVersions";
import { fetchLyrics } from "@/lib/gemini/client";
import LyricsEditor from "./ChordsView";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { Song } from "@/lib/itunes/types";

interface ChordsSectionProps {
  songId: string;
  song: Song;
  userUid: string | null;
  username: string | null;
  onChordsStatusChange?: (hasChords: boolean) => void;
}

function buildDisplay(doc: SongLyricsDoc, version: ChordVersion | null): SongLyricsSection[] {
  return doc.sections.map((s, si) => ({
    name: s.name,
    lines: s.lines.map((l, li) => ({
      lyrics: l.lyrics,
      chords: version?.chords[`${si}_${li}`] ?? "",
    })),
  }));
}

function extractChords(sections: SongLyricsSection[]): Record<string, string> {
  const result: Record<string, string> = {};
  sections.forEach((s, si) =>
    s.lines.forEach((l, li) => {
      if (l.chords.trim()) result[`${si}_${li}`] = l.chords;
    })
  );
  return result;
}

export default function ChordsSection({
  songId,
  song,
  userUid,
  username,
  onChordsStatusChange,
}: ChordsSectionProps) {
  const [lyricsDoc, setLyricsDoc] = useState<SongLyricsDoc | null>(null);
  const [versions, setVersions] = useState<ChordVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<"not_found" | "api_error" | null>(null);

  const [selectedVersionId, setSelectedVersionId] = useState<string | null>(null); // null = no-chords view
  const [isEditing, setIsEditing] = useState(false);
  const [editSections, setEditSections] = useState<SongLyricsSection[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const fetchingRef = useRef(false);

  // Subscribe to canonical lyrics
  useEffect(() => {
    setIsLoading(true);
    setError(null);
    setLyricsDoc(null);
    setSelectedVersionId(null);
    setIsEditing(false);
    fetchingRef.current = false;

    const unsub = subscribeSongLyrics(songId, async (data) => {
      if (data) {
        setLyricsDoc(data);
        setIsLoading(false);
        return;
      }
      if (fetchingRef.current) return;
      fetchingRef.current = true;

      try {
        const result = await fetchLyrics(song.title, song.artistName, song.albumName);
        const newDoc: SongLyricsDoc = {
          songId,
          source: result.source,
          sections: result.sections.map((s) => ({
            name: s.name,
            lines: s.lines.map((l) => ({ lyrics: l.lyrics, chords: "" })),
          })),
          updatedAt: Date.now(),
          updatedByUid: userUid,
          song_info: result.song_info,
        };
        await saveSongLyrics(newDoc);
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        setError(msg === "not_found" ? "not_found" : "api_error");
        setIsLoading(false);
      }
    });
    return unsub;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songId]);

  // Subscribe to chord versions
  useEffect(() => {
    return subscribeChordVersions(songId, (v) => {
      setVersions(v);
      const hasChords = v.length > 0;
      onChordsStatusChange?.(hasChords);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [songId]);

  const selectedVersion = versions.find((v) => v.id === selectedVersionId) ?? null;
  const myVersionId = userUid ? `${songId}_${userUid}` : null;
  const myVersion = versions.find((v) => v.id === myVersionId) ?? null;
  const isViewingMine = selectedVersionId === myVersionId && myVersion !== null;

  function startEditing() {
    if (!lyricsDoc) return;
    const base = buildDisplay(lyricsDoc, isViewingMine ? myVersion : null);
    setEditSections(base.map((s) => ({ ...s, lines: s.lines.map((l) => ({ ...l })) })));
    setIsEditing(true);
  }

  async function handleSave() {
    if (!lyricsDoc || !userUid || !username) return;
    setIsSaving(true);
    try {
      const chords = extractChords(editSections);
      await saveChordVersion(songId, userUid, username, chords);
      const newId = `${songId}_${userUid}`;
      setSelectedVersionId(newId);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  function cancelEditing() {
    setIsEditing(false);
    setEditSections([]);
  }

  async function handleLike(version: ChordVersion) {
    if (!userUid) return;
    const liked = version.likedBy.includes(userUid);
    await toggleLike(version.id, userUid, liked);
  }

  const displaySections = lyricsDoc
    ? isEditing
      ? editSections
      : buildDisplay(lyricsDoc, selectedVersion)
    : null;

  return (
    <div className="mt-8">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <h2 className="shrink-0 text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            Lyrics &amp; Chords
          </h2>
          {lyricsDoc?.source === "gemini" && (
            <span className="shrink-0 text-xs text-neutral-400 dark:text-neutral-500">
              ✦ AI generated
            </span>
          )}
        </div>

        {/* Edit / Save / Cancel controls */}
        {!isLoading && !error && lyricsDoc && userUid && (
          <div className="flex shrink-0 items-center gap-2">
            {isEditing ? (
              <>
                <button
                  onClick={cancelEditing}
                  className="rounded-full px-3 py-1 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="rounded-full bg-indigo-600 px-4 py-1 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  {isSaving ? "Saving…" : "Save chords"}
                </button>
              </>
            ) : (
              <>
                {/* Like button for other people's versions */}
                {selectedVersion && selectedVersion.userId !== userUid && (
                  <button
                    onClick={() => handleLike(selectedVersion)}
                    className={`flex items-center gap-1 rounded-full border px-3 py-1 text-sm transition ${
                      selectedVersion.likedBy.includes(userUid)
                        ? "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-400"
                        : "border-neutral-200 text-neutral-500 hover:border-rose-200 hover:text-rose-500 dark:border-neutral-700 dark:text-neutral-400"
                    }`}
                  >
                    {selectedVersion.likedBy.includes(userUid) ? "♥" : "♡"}
                    <span>{selectedVersion.likes}</span>
                  </button>
                )}
                {/* Edit button when viewing own version or adding new */}
                {(isViewingMine || !myVersion) && (
                  <button
                    onClick={startEditing}
                    className="rounded-full border border-neutral-200 px-3 py-1 text-sm text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                  >
                    {myVersion ? "Edit my chords" : "Add your chords"}
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Version picker */}
      {!isLoading && !error && lyricsDoc && !isEditing && (
        <div className="mb-4 flex flex-wrap gap-2">
          {/* No chords (default) */}
          <button
            onClick={() => setSelectedVersionId(null)}
            className={`rounded-full border px-3 py-1 text-sm transition ${
              selectedVersionId === null
                ? "border-neutral-800 bg-neutral-800 text-white dark:border-neutral-200 dark:bg-neutral-200 dark:text-neutral-900"
                : "border-neutral-200 text-neutral-500 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-600"
            }`}
          >
            No chords
          </button>

          {versions.map((v) => {
            const isSelected = selectedVersionId === v.id;
            const isMine = v.userId === userUid;
            return (
              <button
                key={v.id}
                onClick={() => setSelectedVersionId(v.id)}
                className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm transition ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-600 text-white dark:border-indigo-400 dark:bg-indigo-500"
                    : "border-neutral-200 text-neutral-600 hover:border-neutral-300 dark:border-neutral-700 dark:text-neutral-300 dark:hover:border-neutral-600"
                }`}
              >
                <span>{isMine ? "You" : v.username}</span>
                {v.likes > 0 && (
                  <span className={`text-xs ${isSelected ? "opacity-80" : "text-neutral-400 dark:text-neutral-500"}`}>
                    ♥{v.likes}
                  </span>
                )}
              </button>
            );
          })}

          {/* "Be the first" prompt */}
          {versions.length === 0 && userUid && !isEditing && (
            <span className="self-center text-xs text-neutral-400 dark:text-neutral-500">
              No chords yet —{" "}
              <button
                onClick={startEditing}
                className="underline underline-offset-2 hover:text-neutral-600 dark:hover:text-neutral-300"
              >
                be the first to add some
              </button>
            </span>
          )}
        </div>
      )}

      {/* Body */}
      {isLoading && (
        <div className="flex items-center gap-2 py-6">
          <LoadingSpinner />
          <p className="text-sm text-neutral-400 dark:text-neutral-500">Fetching lyrics…</p>
        </div>
      )}

      {!isLoading && error === "not_found" && (
        <p className="text-sm text-neutral-400 dark:text-neutral-500">
          Lyrics not found for this song.
        </p>
      )}

      {!isLoading && error === "api_error" && (
        <p className="text-sm text-neutral-400 dark:text-neutral-500">
          Could not load lyrics right now.
        </p>
      )}

      {!isLoading && !error && displaySections && (
        <LyricsEditor
          sections={displaySections}
          isEditing={isEditing}
          onChange={setEditSections}
          song_info={lyricsDoc?.song_info}
        />
      )}
    </div>
  );
}
