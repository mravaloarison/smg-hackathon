import {
  arrayRemove,
  arrayUnion,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  setDoc,
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

export async function addSongToPlaylist(
  playlistId: string,
  song: Omit<PlaylistSong, "addedAt">
): Promise<void> {
  const playlistSong: PlaylistSong = { ...song, addedAt: Date.now() };
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
