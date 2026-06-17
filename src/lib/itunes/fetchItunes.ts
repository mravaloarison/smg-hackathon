import { normalizeResults } from "./normalize";
import {
  AlbumDetail,
  Artist,
  ArtistDetail,
  ItunesSearchResponse,
  SearchResults,
  SearchType,
} from "./types";

const ITUNES_SEARCH_URL = "https://itunes.apple.com/search";
const ITUNES_LOOKUP_URL = "https://itunes.apple.com/lookup";
const MAX_ARTIST_ARTWORK_LOOKUPS = 12;

const ENTITY_BY_TYPE: Record<Exclude<SearchType, "all">, string> = {
  song: "song",
  album: "album",
  artist: "musicArtist",
};

async function fetchEntity(term: string, entity: string): Promise<ItunesSearchResponse> {
  const url = new URL(ITUNES_SEARCH_URL);
  url.searchParams.set("term", term);
  url.searchParams.set("media", "music");
  url.searchParams.set("entity", entity);
  url.searchParams.set("limit", "25");

  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`iTunes search failed with status ${res.status}`);
  }
  return res.json();
}

async function lookup(params: Record<string, string>): Promise<ItunesSearchResponse> {
  const url = new URL(ITUNES_LOOKUP_URL);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`iTunes lookup failed with status ${res.status}`);
  }
  return res.json();
}

async function enrichArtistsWithArtwork(artists: Artist[]): Promise<Artist[]> {
  if (artists.length === 0) return artists;

  const toEnrich = artists.slice(0, MAX_ARTIST_ARTWORK_LOOKUPS);
  const enriched = await Promise.all(
    toEnrich.map(async (artist) => {
      try {
        const data = await lookup({
          id: String(artist.id),
          entity: "album",
          limit: "1",
        });
        const { albums } = normalizeResults(data.results);
        return { ...artist, artworkUrl: albums[0]?.artworkUrl };
      } catch {
        return artist;
      }
    })
  );

  return [...enriched, ...artists.slice(MAX_ARTIST_ARTWORK_LOOKUPS)];
}

export async function searchItunes(term: string, type: SearchType): Promise<SearchResults> {
  if (!term.trim()) {
    return { songs: [], albums: [], artists: [] };
  }

  let combined: SearchResults;

  if (type === "all") {
    const [songRes, albumRes, artistRes] = await Promise.all([
      fetchEntity(term, ENTITY_BY_TYPE.song),
      fetchEntity(term, ENTITY_BY_TYPE.album),
      fetchEntity(term, ENTITY_BY_TYPE.artist),
    ]);
    combined = normalizeResults([
      ...songRes.results,
      ...albumRes.results,
      ...artistRes.results,
    ]);
  } else {
    const res = await fetchEntity(term, ENTITY_BY_TYPE[type]);
    combined = normalizeResults(res.results);
  }

  combined.artists = await enrichArtistsWithArtwork(combined.artists);
  return combined;
}

export async function lookupSongById(id: string): Promise<SearchResults> {
  const data = await lookup({ id });
  return normalizeResults(data.results);
}

export async function lookupAlbumById(id: string): Promise<AlbumDetail | null> {
  const data = await lookup({ id, entity: "song" });
  const normalized = normalizeResults(data.results);
  const album = normalized.albums.find((a) => String(a.id) === id);
  if (!album) return null;
  return { album, tracks: normalized.songs };
}

export async function lookupArtistById(id: string): Promise<ArtistDetail | null> {
  const data = await lookup({ id, entity: "album" });
  const normalized = normalizeResults(data.results);
  const artist = normalized.artists.find((a) => String(a.id) === id);
  if (!artist) return null;
  return {
    artist: { ...artist, artworkUrl: normalized.albums[0]?.artworkUrl },
    albums: normalized.albums,
  };
}
