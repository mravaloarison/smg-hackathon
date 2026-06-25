import { LyricsResult } from "./types";

export async function fetchLyrics(
  title: string,
  artist: string,
  albumName?: string
): Promise<LyricsResult> {
  const res = await fetch("/api/chords", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, artist, albumName }),
  });
  if (res.status === 404) throw new Error("not_found");
  if (!res.ok) throw new Error("api_error");
  return res.json() as Promise<LyricsResult>;
}
