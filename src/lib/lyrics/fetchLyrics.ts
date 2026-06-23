import { LyricsQuery, LyricsResult } from "./types";

const LRCLIB_GET_URL = "https://lrclib.net/api/get";
const LRCLIB_SEARCH_URL = "https://lrclib.net/api/search";
const REQUEST_HEADERS = {
  "User-Agent": "NadiaMusicSearch/1.0 (+https://lrclib.net)",
};

interface LrclibRawResult {
  duration?: number;
  plainLyrics?: string | null;
  syncedLyrics?: string | null;
  instrumental?: boolean;
}

function toLyricsResult(raw: LrclibRawResult): LyricsResult {
  return {
    plainLyrics: raw.plainLyrics ?? null,
    syncedLyrics: raw.syncedLyrics ?? null,
    instrumental: Boolean(raw.instrumental),
  };
}

async function fetchExactMatch(query: LyricsQuery): Promise<LyricsResult | null> {
  const url = new URL(LRCLIB_GET_URL);
  url.searchParams.set("artist_name", query.artistName);
  url.searchParams.set("track_name", query.trackName);
  if (query.albumName) url.searchParams.set("album_name", query.albumName);
  if (query.durationSeconds) url.searchParams.set("duration", String(query.durationSeconds));

  const res = await fetch(url.toString(), { headers: REQUEST_HEADERS });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`lrclib get failed with status ${res.status}`);
  return toLyricsResult(await res.json());
}

async function searchClosestMatch(query: LyricsQuery): Promise<LyricsResult | null> {
  const url = new URL(LRCLIB_SEARCH_URL);
  url.searchParams.set("track_name", query.trackName);
  url.searchParams.set("artist_name", query.artistName);

  const res = await fetch(url.toString(), { headers: REQUEST_HEADERS });
  if (!res.ok) return null;

  const results: LrclibRawResult[] = await res.json();
  if (results.length === 0) return null;

  const best =
    query.durationSeconds !== undefined
      ? [...results].sort(
          (a, b) =>
            Math.abs((a.duration ?? 0) - query.durationSeconds!) -
            Math.abs((b.duration ?? 0) - query.durationSeconds!)
        )[0]
      : results[0];

  return toLyricsResult(best);
}

export async function lookupLyrics(query: LyricsQuery): Promise<LyricsResult | null> {
  const exact = await fetchExactMatch(query);
  if (exact) return exact;
  return searchClosestMatch(query);
}
