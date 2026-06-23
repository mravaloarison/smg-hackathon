export interface UserProfile {
  uid: string;
  email: string;
  username: string;
  usernameLower: string;
  photoURL: string | null;
  createdAt: number;
}

export interface PlaylistSong {
  id: number;
  title: string;
  artistName: string;
  albumName?: string;
  artworkUrl?: string;
  addedAt: number;
}

export interface Playlist {
  id: string;
  ownerId: string;
  ownerUsername: string;
  name: string;
  createdAt: number;
  songs: PlaylistSong[];
}
