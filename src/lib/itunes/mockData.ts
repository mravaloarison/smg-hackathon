import { Album, AlbumDetail, Artist, ArtistDetail, SearchResults, Song } from "./types";

const MOCK_ARTWORK_URL =
  "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e2/61/f8/e261f8c1-73db-9a7a-c89e-1068f19970e0/16UMGIM67863.rgb.jpg/300x300bb.jpg";

export const mockSong: Song = {
  type: "song",
  id: 1440857781,
  title: "Blinding Lights",
  artistId: 479756,
  artistName: "The Weeknd",
  albumName: "After Hours",
  artworkUrl: MOCK_ARTWORK_URL,
  previewUrl: undefined,
  genre: "Pop",
};

export const mockSongNoArtwork: Song = {
  type: "song",
  id: 2,
  title: "Untitled Track",
  artistName: "Unknown Artist",
  albumName: undefined,
  artworkUrl: undefined,
};

export const mockAlbum: Album = {
  type: "album",
  id: 1440857782,
  title: "After Hours",
  artistId: 479756,
  artistName: "The Weeknd",
  artworkUrl: MOCK_ARTWORK_URL,
  genre: "Pop",
  releaseDate: "2020-03-20",
};

export const mockArtist: Artist = {
  type: "artist",
  id: 479756,
  name: "The Weeknd",
  genre: "Pop",
  artworkUrl: MOCK_ARTWORK_URL,
};

export const mockSearchResults: SearchResults = {
  songs: [mockSong, mockSongNoArtwork],
  albums: [mockAlbum],
  artists: [mockArtist],
};

export const mockEmptyResults: SearchResults = {
  songs: [],
  albums: [],
  artists: [],
};

export const mockAlbumDetail: AlbumDetail = {
  album: mockAlbum,
  tracks: [mockSong, mockSongNoArtwork],
};

export const mockArtistDetail: ArtistDetail = {
  artist: mockArtist,
  albums: [mockAlbum],
};
