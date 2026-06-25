export interface LyricsLine {
  lyrics: string;
}

export interface LyricsSection {
  name: string;
  lines: LyricsLine[];
}

export interface LyricsResult {
  source: "lrclib" | "gemini";
  song_info: {
    title: string;
    artist: string;
    key?: string;
    tempo?: string;
    capo?: number | null;
    instruments?: string[];
  };
  sections: LyricsSection[];
}
