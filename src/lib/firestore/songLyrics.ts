import { doc, onSnapshot, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { SongLyricsDoc } from "./types";

const SONG_LYRICS_COLLECTION = "song_lyrics";

export function subscribeSongLyrics(
  songId: string,
  onChange: (data: SongLyricsDoc | null) => void
): () => void {
  const ref = doc(db, SONG_LYRICS_COLLECTION, songId);
  return onSnapshot(ref, (snap) => {
    onChange(snap.exists() ? (snap.data() as SongLyricsDoc) : null);
  });
}

export async function saveSongLyrics(data: SongLyricsDoc): Promise<void> {
  const ref = doc(db, SONG_LYRICS_COLLECTION, data.songId);
  await setDoc(ref, data);
}
