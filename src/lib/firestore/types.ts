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
  collaboratorIds?: string[];
}

export interface CollabInvite {
  id: string;
  playlistId: string;
  playlistName: string;
  fromUid: string;
  fromUsername: string;
  toUid: string;
  toUsername: string;
  createdAt: number;
  status: 'pending' | 'accepted' | 'declined';
}

export interface CollaboratorLeftNotification {
  id: string;
  type: 'collaborator_left';
  toUid: string;
  fromUid: string;
  fromUsername: string;
  playlistId: string;
  playlistName: string;
  createdAt: number;
}
