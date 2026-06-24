export type SearchType = "all" | "song" | "album" | "artist";

export interface ItunesRawResult {
  wrapperType: "track" | "collection" | "artist";
  kind?: string;
  trackId?: number;
  trackName?: string;
  collectionId?: number;
  collectionName?: string;
  artistId?: number;
  artistName?: string;
  artworkUrl60?: string;
  artworkUrl100?: string;
  previewUrl?: string;
  primaryGenreName?: string;
  releaseDate?: string;
  trackTimeMillis?: number;
}

export interface ItunesSearchResponse {
  resultCount: number;
  results: ItunesRawResult[];
}

export interface Song {
  type: "song";
  id: number;
  title: string;
  artistId?: number;
  artistName: string;
  albumName?: string;
  artworkUrl?: string;
  previewUrl?: string;
  genre?: string;
  durationMs?: number;
}

export interface Album {
  type: "album";
  id: number;
  title: string;
  artistId?: number;
  artistName: string;
  artworkUrl?: string;
  genre?: string;
  releaseDate?: string;
}

export interface Artist {
  type: "artist";
  id: number;
  name: string;
  genre?: string;
  artworkUrl?: string;
}

export interface SearchResults {
  songs: Song[];
  albums: Album[];
  artists: Artist[];
}

export interface AlbumDetail {
  album: Album;
  tracks: Song[];
}

export interface ArtistDetail {
  artist: Artist;
  albums: Album[];
}

export interface HomeDiscovery {
  trendingSongs: Song[];
  trendingAlbums: Album[];
  popularArtists: Artist[];
}

export function upscaleArtwork(url?: string, size = 300): string | undefined {
  if (!url) return undefined;
  return url.replace(/\/\d+x\d+bb\.(jpg|png)$/, `/${size}x${size}bb.$1`);
}
