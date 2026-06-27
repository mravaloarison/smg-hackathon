"use client";

import { useState } from "react";
import { collection, getDocs, writeBatch } from "firebase/firestore";
import { db } from "@/lib/firebase/config";

const TARGETS = [
  { name: "Chord versions", id: "song_chord_versions" },
  { name: "Song lyrics", id: "song_lyrics" },
  { name: "Playlists", id: "playlists" },
  { name: "Collab invites", id: "collab_invites" },
  { name: "Playlist notifications", id: "playlist_notifications" },
];

async function deleteCollection(colId: string): Promise<number> {
  const snap = await getDocs(collection(db, colId));
  if (snap.empty) return 0;
  // Firestore writeBatch limit = 500
  let deleted = 0;
  const chunks: typeof snap.docs[] = [];
  for (let i = 0; i < snap.docs.length; i += 500) {
    chunks.push(snap.docs.slice(i, i + 500));
  }
  for (const chunk of chunks) {
    const batch = writeBatch(db);
    chunk.forEach((d) => batch.delete(d.ref));
    await batch.commit();
    deleted += chunk.length;
  }
  return deleted;
}

export default function DevClearPage() {
  const [log, setLog] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);

  async function handleClear() {
    setRunning(true);
    setLog([]);
    setDone(false);
    for (const t of TARGETS) {
      setLog((p) => [...p, `Deleting ${t.name}…`]);
      try {
        const n = await deleteCollection(t.id);
        setLog((p) => [...p.slice(0, -1), `✓ ${t.name}: ${n} doc${n === 1 ? "" : "s"} deleted`]);
      } catch (e: unknown) {
        const msg = e instanceof Error ? e.message : String(e);
        setLog((p) => [...p.slice(0, -1), `✗ ${t.name}: ${msg}`]);
      }
    }
    setRunning(false);
    setDone(true);
  }

  return (
    <main className="mx-auto flex max-w-md flex-col gap-6 px-4 py-16">
      <div>
        <h1 className="text-xl font-bold text-neutral-900 dark:text-neutral-100">Dev — Clear Firestore</h1>
        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
          Wipes: playlists, chord versions, song lyrics, invites, and notifications. You must be signed in for the writes to succeed.
        </p>
      </div>

      {!done && (
        <button
          onClick={handleClear}
          disabled={running}
          className="rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-50 transition"
        >
          {running ? "Clearing…" : "Clear all test data"}
        </button>
      )}

      {log.length > 0 && (
        <ul className="flex flex-col gap-1.5 rounded-xl border border-neutral-200 bg-neutral-50 px-4 py-3 dark:border-neutral-800 dark:bg-neutral-900">
          {log.map((line, i) => (
            <li key={i} className="font-mono text-sm text-neutral-700 dark:text-neutral-300">{line}</li>
          ))}
        </ul>
      )}

      {done && (
        <p className="text-sm font-medium text-green-600 dark:text-green-400">
          Done. You can close this tab — delete this page from the repo when you no longer need it.
        </p>
      )}
    </main>
  );
}
