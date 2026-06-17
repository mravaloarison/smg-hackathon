import { AlbumDetail, ArtistDetail, SearchResults, SearchType, Song } from "./types";

async function getJson<T>(path: string, params: Record<string, string>): Promise<T> {
  const url = new URL(path, window.location.origin);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`Request to ${path} failed`);
  }
  return res.json();
}

export function fetchSearchResults(term: string, type: SearchType): Promise<SearchResults> {
  return getJson("/api/search", { term, type });
}

export function fetchSongById(id: string): Promise<Song> {
  return getJson("/api/song", { id });
}

export function fetchAlbumById(id: string): Promise<AlbumDetail> {
  return getJson("/api/album", { id });
}

export function fetchArtistById(id: string): Promise<ArtistDetail> {
  return getJson("/api/artist", { id });
}
