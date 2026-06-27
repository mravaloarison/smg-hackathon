"use client";

import { useEffect, useRef, useState } from "react";
import { subscribeChordVersions, saveChordVersion, toggleLike, deleteChordVersion } from "@/lib/firestore/chordVersions";
import { subscribeSongLyrics } from "@/lib/firestore/songLyrics";
import { ChordVersion, SongLyricsDoc } from "@/lib/firestore/types";
import { useAuth } from "@/contexts/AuthContext";
import { Song } from "@/lib/itunes/types";
import SongDetailView from "@/components/song-detail/SongDetailView";
import ChordViewer from "@/components/chord-viewer/ChordViewer";
import TrendingSongsSection from "@/components/home/TrendingSongsSection";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import BackButton from "@/components/ui/BackButton";

interface Props {
  song: Song;
  onBack: () => void;
  onArtistClick?: (artistId: number) => void;
  onAddToPlaylist: () => void;
  onPrev?: () => void;
  onNext?: () => void;
  initialVersionId?: string;
  playlistMode?: boolean;
  similarSongs: Song[];
  onSimilarSongClick: (song: Song) => void;
  onSimilarAddToPlaylist: (song: Song) => void;
  userUid: string | null;
}

function buildChordsText(lyricsDoc: SongLyricsDoc | null, version: ChordVersion): string {
  if (version.rawText !== undefined) return version.rawText;
  if (lyricsDoc) {
    const lines: string[] = [];
    lyricsDoc.sections.forEach((s, si) => {
      if (s.name) lines.push(`[${s.name}]`);
      s.lines.forEach((l, li) => {
        const chord = version.chords[`${si}_${li}`] ?? "";
        if (chord.trim()) lines.push(chord);
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

function NavRow({ onPrev, onNext }: { onPrev?: () => void; onNext?: () => void }) {
  if (!onPrev && !onNext) return null;
  return (
    <div className="flex items-center justify-between py-3">
      <button type="button" onClick={onPrev} disabled={!onPrev}
        className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800">
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1 0 1.06L9.06 10l3.73 3.71a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" /></svg>
        Previous
      </button>
      <button type="button" onClick={onNext} disabled={!onNext}
        className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800">
        Next
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4"><path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 0-1.06L10.94 10 7.21 6.29a.75.75 0 0 1 1.06-1.06l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" /></svg>
      </button>
    </div>
  );
}

export default function SongPage({
  song, onBack, onArtistClick, onAddToPlaylist,
  onPrev, onNext, initialVersionId, playlistMode = false,
  similarSongs, onSimilarSongClick, onSimilarAddToPlaylist,
  userUid,
}: Props) {
  const { profile } = useAuth();
  const songId = String(song.id);

  const [versions, setVersions] = useState<ChordVersion[]>([]);
  const [lyricsDoc, setLyricsDoc] = useState<SongLyricsDoc | null>(null);
  const [isLoadingVersions, setIsLoadingVersions] = useState(true);

  // Navigation: null = overview, string = viewing/editing a version
  const [activeVersionId, setActiveVersionId] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draftText, setDraftText] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const readyRef = useRef(0);

  useEffect(() => {
    setIsLoadingVersions(true);
    setActiveVersionId(initialVersionId ?? null);
    setIsEditing(false);
    setVersions([]);
    setLyricsDoc(null);
    readyRef.current = 0;
    const finish = () => { readyRef.current += 1; if (readyRef.current >= 2) setIsLoadingVersions(false); };
    const u1 = subscribeSongLyrics(songId, (doc) => { setLyricsDoc(doc); finish(); });
    const u2 = subscribeChordVersions(songId, (v) => { setVersions(v); finish(); });
    return () => { u1(); u2(); };
  }, [songId, initialVersionId]);

  const myVersionId = userUid ? `${songId}_${userUid}` : null;
  const myVersion = versions.find((v) => v.id === myVersionId) ?? null;
  const activeVersion = activeVersionId ? versions.find((v) => v.id === activeVersionId) ?? null : null;

  function openVersion(id: string) { setActiveVersionId(id); setIsEditing(false); }
  function backToOverview() { setActiveVersionId(null); setIsEditing(false); setDraftText(""); }

  function startEdit() {
    if (myVersion) setDraftText(myVersion.rawText ?? buildChordsText(lyricsDoc, myVersion));
    else setDraftText("");
    setIsEditing(true);
  }

  async function handleSave() {
    if (!userUid || !profile?.username || !myVersionId) return;
    setIsSaving(true);
    try {
      await saveChordVersion(songId, userUid, profile.username, {}, draftText, {
        title: song.title, artist: song.artistName, artwork: song.artworkUrl,
      });
      const optimistic: ChordVersion = {
        id: myVersionId, songId,
        songTitle: song.title, songArtist: song.artistName, songArtwork: song.artworkUrl,
        userId: userUid, username: profile.username,
        chords: {}, rawText: draftText,
        likes: myVersion?.likes ?? 0, likedBy: myVersion?.likedBy ?? [],
        createdAt: myVersion?.createdAt ?? Date.now(), updatedAt: Date.now(),
      };
      setVersions((prev) => {
        const next = prev.some((v) => v.id === myVersionId)
          ? prev.map((v) => v.id === myVersionId ? optimistic : v)
          : [...prev, optimistic];
        return next.sort((a, b) => b.likes - a.likes || a.username.localeCompare(b.username));
      });
      setActiveVersionId(myVersionId);
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

  async function handleDelete(versionId: string) {
    setIsDeleting(true);
    try {
      await deleteChordVersion(versionId);
      setIsConfirmingDelete(false);
      backToOverview();
    } finally {
      setIsDeleting(false);
    }
  }

  // ── Version detail / edit view ────────────────────────────────────────────
  if (activeVersionId !== null || isEditing) {
    const isMine = activeVersion?.userId === userUid;
    const liked = userUid && activeVersion ? activeVersion.likedBy.includes(userUid) : false;
    const chordsText = activeVersion ? buildChordsText(lyricsDoc, activeVersion) : "";

    return (
      <div className="flex flex-col gap-6">
        <BackButton onClick={backToOverview} label={playlistMode ? "Back" : "Back to versions"} />

        {/* Song + version header */}
        <div className="flex flex-col gap-1">
          <p className="text-xs text-neutral-400 dark:text-neutral-500 uppercase tracking-widest">
            {song.title}
          </p>
          {!isEditing && activeVersion && (
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
                  {isMine ? "Your version" : `${activeVersion.username}'s version`}
                </h2>
                {activeVersion.likes > 0 && (
                  <span className="text-sm text-neutral-400">♥ {activeVersion.likes}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {!isMine && userUid && (
                  <button
                    onClick={() => handleLike(activeVersion)}
                    className={`flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition ${
                      liked
                        ? "border-rose-200 bg-rose-50 text-rose-500 dark:border-rose-800 dark:bg-rose-950 dark:text-rose-400"
                        : "border-neutral-200 text-neutral-500 hover:border-rose-200 hover:text-rose-400 dark:border-neutral-700"
                    }`}
                  >
                    {liked ? "♥" : "♡"} Like
                  </button>
                )}
                {isMine && !isConfirmingDelete && (
                  <>
                    <button
                      onClick={startEdit}
                      className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm text-neutral-600 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setIsConfirmingDelete(true)}
                      className="rounded-full border border-neutral-200 px-3 py-1.5 text-sm text-red-500 hover:border-red-200 hover:bg-red-50 dark:border-neutral-700 dark:hover:border-red-800 dark:hover:bg-red-950"
                    >
                      Delete
                    </button>
                  </>
                )}
                {isMine && isConfirmingDelete && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-neutral-500 dark:text-neutral-400">Delete your version?</span>
                    <button
                      onClick={() => handleDelete(activeVersion!.id)}
                      disabled={isDeleting}
                      className="rounded-full bg-red-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {isDeleting ? "Deleting…" : "Yes, delete"}
                    </button>
                    <button
                      onClick={() => setIsConfirmingDelete(false)}
                      className="rounded-full px-3 py-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                    >
                      Cancel
                    </button>
                  </div>
                )}
                <button
                  type="button"
                  onClick={onAddToPlaylist}
                  className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-4 py-1.5 text-sm font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
                >
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                    <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                  </svg>
                  Add to Playlist
                </button>
              </div>
            </div>
          )}
          {isEditing && (
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
              {myVersion ? "Edit your chords" : "Add your chords"}
            </h2>
          )}
        </div>

        {/* Read view */}
        {!isEditing && activeVersion && chordsText && (
          <ChordViewer chordsText={chordsText} />
        )}
        {!isEditing && activeVersion && !chordsText && (
          <p className="text-sm text-neutral-400 dark:text-neutral-500">No chord text saved yet.</p>
        )}

        {/* Edit form */}
        {isEditing && (
          <div className="flex flex-col gap-4">
            {/* Buttons — top */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSave}
                disabled={isSaving || !draftText.trim()}
                className="rounded-full bg-indigo-600 px-5 py-1.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {isSaving ? "Saving…" : myVersion ? "Update" : "Save chords"}
              </button>
              <button
                onClick={() => { setIsEditing(false); setDraftText(""); if (!myVersion) backToOverview(); }}
                className="rounded-full px-4 py-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                Cancel
              </button>
            </div>
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
                {isSaving ? "Saving…" : myVersion ? "Update" : "Save chords"}
              </button>
              <button
                onClick={() => { setIsEditing(false); setDraftText(""); if (!myVersion) backToOverview(); }}
                className="rounded-full px-4 py-1.5 text-sm text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ── Overview ──────────────────────────────────────────────────────────────

  // Playlist mode: show the user's own chord version inline, no version list
  if (playlistMode) {
    const mychordsText = myVersion ? buildChordsText(lyricsDoc, myVersion) : "";
    return (
      <div className="flex flex-col">
        <SongDetailView
          song={song}
          onBack={onBack}
          onArtistClick={onArtistClick}
          onAddToPlaylist={onAddToPlaylist}
        />
        <NavRow onPrev={onPrev} onNext={onNext} />

        <div className="mt-8">
          {isLoadingVersions ? (
            <div className="flex items-center gap-2 py-4">
              <LoadingSpinner />
            </div>
          ) : myVersion && mychordsText ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                  Chords &amp; Lyrics
                </h2>
                {!isConfirmingDelete ? (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={startEdit}
                      className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-500 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-400 dark:hover:bg-neutral-800"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setIsConfirmingDelete(true)}
                      className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-red-500 hover:border-red-200 hover:bg-red-50 dark:border-neutral-700 dark:hover:border-red-800 dark:hover:bg-red-950"
                    >
                      Delete
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-neutral-500 dark:text-neutral-400">Delete?</span>
                    <button
                      onClick={() => handleDelete(myVersion.id)}
                      disabled={isDeleting}
                      className="rounded-full bg-red-600 px-3 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                    >
                      {isDeleting ? "…" : "Yes"}
                    </button>
                    <button
                      onClick={() => setIsConfirmingDelete(false)}
                      className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
              <ChordViewer chordsText={mychordsText} />
            </div>
          ) : userUid ? (
            <button
              type="button"
              onClick={startEdit}
              className="flex items-center gap-2 text-sm text-indigo-500 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
              </svg>
              Add your chords for this song
            </button>
          ) : null}
        </div>
      </div>
    );
  }

  // Standard mode: version list
  return (
    <div className="flex flex-col">
      <SongDetailView
        song={song}
        onBack={onBack}
        onArtistClick={onArtistClick}
        onAddToPlaylist={onAddToPlaylist}
      />
      <NavRow onPrev={onPrev} onNext={onNext} />

      {/* Version list */}
      <div className="mt-8">
        <h2 className="mb-3 text-base font-semibold text-neutral-900 dark:text-neutral-100">
          Chords &amp; Lyrics
        </h2>

        {isLoadingVersions ? (
          <div className="flex items-center gap-2 py-4">
            <LoadingSpinner />
            <p className="text-sm text-neutral-400">Loading versions…</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
            {versions.map((v, i) => {
              const isMine = v.userId === userUid;
              return (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => openVersion(v.id)}
                  className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition hover:bg-neutral-50 dark:hover:bg-neutral-800/50 ${
                    i > 0 ? "border-t border-neutral-200 dark:border-neutral-800" : ""
                  }`}
                >
                  <div className="flex min-w-0 flex-1 flex-col gap-0.5">
                    <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                      {isMine ? "You" : v.username}
                    </span>
                    {v.likes > 0 && (
                      <span className="text-xs text-neutral-400 dark:text-neutral-500">♥ {v.likes}</span>
                    )}
                  </div>
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0 text-neutral-300 dark:text-neutral-600">
                    <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 0-1.06L10.94 10 7.21 6.29a.75.75 0 0 1 1.06-1.06l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" />
                  </svg>
                </button>
              );
            })}

            {/* Add your version */}
            {userUid && !myVersion && (
              <button
                type="button"
                onClick={startEdit}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-left text-sm text-indigo-500 transition hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/30 ${
                  versions.length > 0 ? "border-t border-dashed border-neutral-200 dark:border-neutral-700" : ""
                }`}
              >
                <span className="flex-1">+ Add your version</span>
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 flex-shrink-0">
                  <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
                </svg>
              </button>
            )}

            {versions.length === 0 && !userUid && (
              <p className="px-4 py-3.5 text-sm text-neutral-400 dark:text-neutral-500">
                Sign in to add chords.
              </p>
            )}

            {versions.length === 0 && userUid && !myVersion && null}
          </div>
        )}
      </div>

      {/* More by artist */}
      {similarSongs.length > 0 && (
        <div className="mt-8">
          <TrendingSongsSection
            songs={similarSongs}
            onSongClick={onSimilarSongClick}
            onAddToPlaylist={onSimilarAddToPlaylist}
            title={`More by ${song.artistName}`}
          />
        </div>
      )}
    </div>
  );
}
