import { searchItunes } from "./fetchItunes";
import { Album, Artist, Song, upscaleArtwork } from "./types";

const CHARTS_BASE_URL = "https://rss.marketingtools.apple.com/api/v2/us/music/most-played";

const POPULAR_ARTIST_NAMES = [
  "The Weeknd",
  "Taylor Swift",
  "Drake",
  "Billie Eilish",
  "Bad Bunny",
  "Olivia Rodrigo",
];

interface AppleChartItem {
  id: string;
  name: string;
  artistName: string;
  artistId?: string;
  artworkUrl100?: string;
  releaseDate?: string;
  genres?: { name: string }[];
}

interface AppleChartResponse {
  feed: { results: AppleChartItem[] };
}

async function fetchChart(kind: "songs" | "albums", limit: number): Promise<AppleChartItem[]> {
  const res = await fetch(`${CHARTS_BASE_URL}/${limit}/${kind}.json`);
  if (!res.ok) {
    throw new Error(`Apple charts request failed with status ${res.status}`);
  }
  const data: AppleChartResponse = await res.json();
  return data.feed.results;
}

function toSong(item: AppleChartItem): Song {
  return {
    type: "song",
    id: Number(item.id),
    title: item.name,
    artistId: item.artistId ? Number(item.artistId) : undefined,
    artistName: item.artistName,
    artworkUrl: upscaleArtwork(item.artworkUrl100),
    genre: item.genres?.[0]?.name,
  };
}

function toAlbum(item: AppleChartItem): Album {
  return {
    type: "album",
    id: Number(item.id),
    title: item.name,
    artistId: item.artistId ? Number(item.artistId) : undefined,
    artistName: item.artistName,
    artworkUrl: upscaleArtwork(item.artworkUrl100),
    genre: item.genres?.[0]?.name,
    releaseDate: item.releaseDate,
  };
}

export async function fetchTopSongs(limit = 10): Promise<Song[]> {
  const items = await fetchChart("songs", limit);
  return items.map(toSong);
}

export async function fetchTopAlbums(limit = 10): Promise<Album[]> {
  const items = await fetchChart("albums", limit);
  return items.map(toAlbum);
}

export async function fetchPopularArtists(): Promise<Artist[]> {
  const results = await Promise.all(
    POPULAR_ARTIST_NAMES.map(async (name) => {
      try {
        const { artists } = await searchItunes(name, "artist");
        return artists[0];
      } catch {
        return undefined;
      }
    })
  );
  return results.filter((artist): artist is Artist => Boolean(artist));
}
