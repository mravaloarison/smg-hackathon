export interface LyricsResult {
  plainLyrics: string | null;
  syncedLyrics: string | null;
  instrumental: boolean;
}

export interface LyricsQuery {
  artistName: string;
  trackName: string;
  albumName?: string;
  durationSeconds?: number;
}
