import { LyricsResult } from "./types";

export const mockLyrics: LyricsResult = {
  plainLyrics:
    "[Placeholder line one]\n[Placeholder line two]\n[Placeholder line three]\n\n[Placeholder chorus line]\n[Placeholder chorus line]",
  syncedLyrics: null,
  instrumental: false,
};

export const mockInstrumentalLyrics: LyricsResult = {
  plainLyrics: null,
  syncedLyrics: null,
  instrumental: true,
};
