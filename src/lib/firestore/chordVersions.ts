import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  getDoc,
  increment,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { ChordVersion } from "./types";

const COLLECTION = "song_chord_versions";

export function subscribeChordVersions(
  songId: string,
  onChange: (versions: ChordVersion[]) => void
): () => void {
  // Single-field where query — no composite index required.
  // Sorting is done client-side.
  const q = query(
    collection(db, COLLECTION),
    where("songId", "==", songId),
  );
  return onSnapshot(
    q,
    (snap) => {
      const versions = snap.docs.map((d) => d.data() as ChordVersion);
      versions.sort((a, b) => b.likes - a.likes || a.username.localeCompare(b.username));
      onChange(versions);
    },
    () => onChange([])
  );
}

export async function saveChordVersion(
  songId: string,
  userId: string,
  username: string,
  chords: Record<string, string>,
  rawText?: string,
  songMeta?: { title: string; artist: string; artwork?: string },
): Promise<void> {
  const id = `${songId}_${userId}`;
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  const extras = {
    ...(rawText !== undefined ? { rawText } : {}),
    ...(songMeta ? { songTitle: songMeta.title, songArtist: songMeta.artist, songArtwork: songMeta.artwork } : {}),
  };
  if (snap.exists()) {
    await updateDoc(ref, { chords, username, updatedAt: Date.now(), ...extras });
  } else {
    await setDoc(ref, {
      id, songId, userId, username, chords,
      likes: 0, likedBy: [],
      createdAt: Date.now(), updatedAt: Date.now(),
      ...extras,
    });
  }
}

export function subscribeUserChordVersions(
  userId: string,
  onChange: (versions: ChordVersion[]) => void,
): () => void {
  const q = query(collection(db, COLLECTION), where("userId", "==", userId));
  return onSnapshot(
    q,
    (snap) => {
      const versions = snap.docs.map((d) => d.data() as ChordVersion);
      versions.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
      onChange(versions);
    },
    () => onChange([]),
  );
}

export async function deleteChordVersion(versionId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, versionId));
}

export async function toggleLike(versionId: string, userId: string, currentlyLiked: boolean): Promise<void> {
  const ref = doc(db, COLLECTION, versionId);
  await updateDoc(ref, {
    likedBy: currentlyLiked ? arrayRemove(userId) : arrayUnion(userId),
    likes: increment(currentlyLiked ? -1 : 1),
  });
}
