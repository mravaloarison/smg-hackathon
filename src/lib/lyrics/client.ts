import { LyricsQuery, LyricsResult } from "./types";

export async function fetchLyrics(query: LyricsQuery): Promise<LyricsResult | null> {
  const url = new URL("/api/lyrics", window.location.origin);
  url.searchParams.set("artist", query.artistName);
  url.searchParams.set("track", query.trackName);
  if (query.albumName) url.searchParams.set("album", query.albumName);
  if (query.durationSeconds !== undefined) {
    url.searchParams.set("duration", String(query.durationSeconds));
  }

  const res = await fetch(url.toString());
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("Failed to fetch lyrics");
  return res.json();
}
