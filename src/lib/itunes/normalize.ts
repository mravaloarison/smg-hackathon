import {
  Album,
  Artist,
  ItunesRawResult,
  SearchResults,
  Song,
  upscaleArtwork,
} from "./types";

export function normalizeResults(raw: ItunesRawResult[]): SearchResults {
  const songs: Song[] = [];
  const albums: Album[] = [];
  const artists: Artist[] = [];

  for (const item of raw) {
    if (item.wrapperType === "track" && item.trackId) {
      songs.push({
        type: "song",
        id: item.trackId,
        title: item.trackName ?? "Unknown title",
        artistId: item.artistId,
        artistName: item.artistName ?? "Unknown artist",
        albumName: item.collectionName,
        artworkUrl: upscaleArtwork(item.artworkUrl100),
        previewUrl: item.previewUrl,
        genre: item.primaryGenreName,
        durationMs: item.trackTimeMillis,
      });
    } else if (item.wrapperType === "collection" && item.collectionId) {
      albums.push({
        type: "album",
        id: item.collectionId,
        title: item.collectionName ?? "Unknown album",
        artistId: item.artistId,
        artistName: item.artistName ?? "Unknown artist",
        artworkUrl: upscaleArtwork(item.artworkUrl100),
        genre: item.primaryGenreName,
        releaseDate: item.releaseDate,
      });
    } else if (item.wrapperType === "artist" && item.artistId) {
      artists.push({
        type: "artist",
        id: item.artistId,
        name: item.artistName ?? "Unknown artist",
        genre: item.primaryGenreName,
      });
    }
  }

  return { songs, albums, artists };
}
