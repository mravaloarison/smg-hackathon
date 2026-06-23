import { Playlist, PlaylistSong, UserProfile } from "./types";

export const mockUserProfile: UserProfile = {
  uid: "mock-uid-1",
  email: "weeknd.fan@example.com",
  username: "weeknd_fan",
  usernameLower: "weeknd_fan",
  photoURL:
    "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e2/61/f8/e261f8c1-73db-9a7a-c89e-1068f19970e0/16UMGIM67863.rgb.jpg/300x300bb.jpg",
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 30,
};

export const mockOtherUserProfile: UserProfile = {
  uid: "mock-uid-2",
  email: "other@example.com",
  username: "starboy99",
  usernameLower: "starboy99",
  photoURL: null,
  createdAt: Date.now() - 1000 * 60 * 60 * 24 * 10,
};

export const mockPlaylistSong: PlaylistSong = {
  id: 1440857781,
  title: "Blinding Lights",
  artistName: "The Weeknd",
  albumName: "After Hours",
  artworkUrl:
    "https://is1-ssl.mzstatic.com/image/thumb/Music115/v4/e2/61/f8/e261f8c1-73db-9a7a-c89e-1068f19970e0/16UMGIM67863.rgb.jpg/300x300bb.jpg",
  addedAt: Date.now(),
};

export const mockPlaylist: Playlist = {
  id: "mock-playlist-1",
  ownerId: "mock-uid-1",
  ownerUsername: "weeknd_fan",
  name: "Late Night Drive",
  createdAt: Date.now(),
  songs: [mockPlaylistSong],
};

export const mockEmptyPlaylist: Playlist = {
  id: "mock-playlist-2",
  ownerId: "mock-uid-1",
  ownerUsername: "weeknd_fan",
  name: "New Playlist",
  createdAt: Date.now(),
  songs: [],
};
