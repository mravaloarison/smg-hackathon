import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { Playlist, PlaylistSong } from "./types";

const PLAYLISTS_COLLECTION = "playlists";

export function subscribeToUserPlaylists(
  ownerId: string,
  onChange: (playlists: Playlist[]) => void
): () => void {
  // Sorted client-side (rather than via orderBy) so this doesn't require
  // a composite Firestore index on (ownerId, createdAt).
  const q = query(collection(db, PLAYLISTS_COLLECTION), where("ownerId", "==", ownerId));
  return onSnapshot(q, (snap) => {
    const playlists = snap.docs.map((d) => d.data() as Playlist);
    playlists.sort((a, b) => b.createdAt - a.createdAt);
    onChange(playlists);
  });
}

export function subscribeToCollaboratorPlaylists(
  uid: string,
  onChange: (playlists: Playlist[]) => void
): () => void {
  const q = query(
    collection(db, PLAYLISTS_COLLECTION),
    where("collaboratorIds", "array-contains", uid)
  );
  return onSnapshot(q, (snap) => {
    const playlists = snap.docs.map((d) => d.data() as Playlist);
    playlists.sort((a, b) => b.createdAt - a.createdAt);
    onChange(playlists);
  });
}

export function subscribeToPlaylist(
  playlistId: string,
  onChange: (playlist: Playlist | null) => void
): () => void {
  return onSnapshot(doc(db, PLAYLISTS_COLLECTION, playlistId), (snap) => {
    onChange(snap.exists() ? (snap.data() as Playlist) : null);
  });
}

export async function createPlaylist(
  ownerId: string,
  ownerUsername: string,
  name: string
): Promise<string> {
  const ref = doc(collection(db, PLAYLISTS_COLLECTION));
  const playlist: Playlist = {
    id: ref.id,
    ownerId,
    ownerUsername,
    name,
    createdAt: Date.now(),
    songs: [],
  };
  await setDoc(ref, playlist);
  return ref.id;
}

export async function deletePlaylist(playlistId: string): Promise<void> {
  await deleteDoc(doc(db, PLAYLISTS_COLLECTION, playlistId));
}

export async function renamePlaylist(playlistId: string, name: string): Promise<void> {
  await updateDoc(doc(db, PLAYLISTS_COLLECTION, playlistId), { name });
}

export async function removeCollaborator(playlistId: string, uid: string): Promise<void> {
  await updateDoc(doc(db, PLAYLISTS_COLLECTION, playlistId), {
    collaboratorIds: arrayRemove(uid),
  });
}

export async function addSongToPlaylist(
  playlistId: string,
  song: Omit<PlaylistSong, "addedAt">
): Promise<void> {
  const raw = { ...song, addedAt: Date.now() };
  // Firestore rejects undefined values inside arrayUnion — strip optional fields that are absent
  const playlistSong = Object.fromEntries(
    Object.entries(raw).filter(([, v]) => v !== undefined)
  ) as unknown as PlaylistSong;
  await setDoc(
    doc(db, PLAYLISTS_COLLECTION, playlistId),
    { songs: arrayUnion(playlistSong) },
    { merge: true }
  );
}

export async function removeSongFromPlaylist(
  playlistId: string,
  song: PlaylistSong
): Promise<void> {
  await setDoc(
    doc(db, PLAYLISTS_COLLECTION, playlistId),
    { songs: arrayRemove(song) },
    { merge: true }
  );
}
