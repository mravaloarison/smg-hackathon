import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  getDoc,
  increment,
  onSnapshot,
  orderBy,
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
  const q = query(
    collection(db, COLLECTION),
    where("songId", "==", songId),
    orderBy("likes", "desc")
  );
  return onSnapshot(q, (snap) => {
    const versions = snap.docs.map((d) => d.data() as ChordVersion);
    // secondary sort: alphabetical by username
    versions.sort((a, b) => b.likes - a.likes || a.username.localeCompare(b.username));
    onChange(versions);
  });
}

export async function saveChordVersion(
  songId: string,
  userId: string,
  username: string,
  chords: Record<string, string>
): Promise<void> {
  const id = `${songId}_${userId}`;
  const ref = doc(db, COLLECTION, id);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    await updateDoc(ref, { chords, username, updatedAt: Date.now() });
  } else {
    await setDoc(ref, {
      id,
      songId,
      userId,
      username,
      chords,
      likes: 0,
      likedBy: [],
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
}

export async function toggleLike(versionId: string, userId: string, currentlyLiked: boolean): Promise<void> {
  const ref = doc(db, COLLECTION, versionId);
  await updateDoc(ref, {
    likedBy: currentlyLiked ? arrayRemove(userId) : arrayUnion(userId),
    likes: increment(currentlyLiked ? -1 : 1),
  });
}
