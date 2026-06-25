"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import SearchTypeTabs from "@/components/search/SearchTypeTabs";
import PageSearchBar from "@/components/search/PageSearchBar";
import ResultsList from "@/components/results/ResultsList";
import SongDetailView from "@/components/song-detail/SongDetailView";
import AlbumDetailView from "@/components/album-detail/AlbumDetailView";
import ArtistDetailView from "@/components/artist-detail/ArtistDetailView";
import TrendingSongsSection from "@/components/home/TrendingSongsSection";
import AlbumsSection from "@/components/results/AlbumsSection";
import ArtistsSection from "@/components/results/ArtistsSection";
import ChordsSection from "@/components/lyrics/ChordsSection";
import AddToPlaylistModal from "@/components/playlists/AddToPlaylistModal";
import SignInPromptModal from "@/components/auth/SignInPromptModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import EmptyState from "@/components/ui/EmptyState";
import {
  fetchAlbumById,
  fetchArtistById,
  fetchSearchResults,
  fetchSongById,
} from "@/lib/itunes/client";
import { subscribeToPlaylist } from "@/lib/firestore/playlists";
import { subscribeToUserProfile } from "@/lib/firestore/users";
import { PlaylistSong } from "@/lib/firestore/types";
import {
  Album,
  AlbumDetail,
  Artist,
  ArtistDetail,
  SearchResults,
  SearchType,
  Song,
} from "@/lib/itunes/types";
import { useAuth } from "@/contexts/AuthContext";
import DeleteConfirmModal from "@/components/playlists/DeleteConfirmModal";

const EMPTY_RESULTS: SearchResults = { songs: [], albums: [], artists: [] };

function PlaylistNav({ onPrev, onNext }: { onPrev?: () => void; onNext?: () => void }) {
  return (
    <div className="flex items-center justify-between py-4">
      <button
        type="button"
        onClick={onPrev}
        disabled={!onPrev}
        className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 0 1 0 1.06L9.06 10l3.73 3.71a.75.75 0 1 1-1.06 1.06l-4.25-4.25a.75.75 0 0 1 0-1.06l4.25-4.25a.75.75 0 0 1 1.06 0Z" clipRule="evenodd" />
        </svg>
        Previous
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!onNext}
        className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 shadow-sm transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-200 dark:hover:bg-neutral-800"
      >
        Next
        <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
          <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 0-1.06L10.94 10 7.21 6.29a.75.75 0 0 1 1.06-1.06l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" />
        </svg>
      </button>
    </div>
  );
}

interface UrlUpdate {
  type?: SearchType;
  songId?: string | null;
  albumId?: string | null;
  artistId?: string | null;
}

export default function SearchClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const query = searchParams.get("q") ?? "";
  const type = (searchParams.get("type") as SearchType) ?? "all";
  const songId = searchParams.get("songId");
  const albumId = searchParams.get("albumId");
  const artistId = searchParams.get("artistId");
  const playlistId = searchParams.get("playlistId");
  const playlistIndex = playlistId ? Number(searchParams.get("index") ?? "0") : null;

  const [results, setResults] = useState<SearchResults>(EMPTY_RESULTS);
  const [isLoadingResults, setIsLoadingResults] = useState(false);
  const [resultsError, setResultsError] = useState(false);

  const [fetchedSong, setFetchedSong] = useState<Song | null>(null);
  const [isLoadingSong, setIsLoadingSong] = useState(false);
  const [songError, setSongError] = useState(false);

  const [albumDetail, setAlbumDetail] = useState<AlbumDetail | null>(null);
  const [isLoadingAlbum, setIsLoadingAlbum] = useState(false);
  const [albumError, setAlbumError] = useState(false);

  const [artistDetail, setArtistDetail] = useState<ArtistDetail | null>(null);
  const [isLoadingArtist, setIsLoadingArtist] = useState(false);
  const [artistError, setArtistError] = useState(false);

  const [songHasChords, setSongHasChords] = useState<boolean | null>(null);
  const [pendingAddSong, setPendingAddSong] = useState<Song | null>(null);
  const [currentUsername, setCurrentUsername] = useState<string | null>(null);

  const [similarSongs, setSimilarSongs] = useState<Song[]>([]);
  const [similarAlbums, setSimilarAlbums] = useState<Album[]>([]);
  const [similarArtists, setSimilarArtists] = useState<Artist[]>([]);

  const [songToAdd, setSongToAdd] = useState<Song | null>(null);
  const [isSignInPromptOpen, setIsSignInPromptOpen] = useState(false);
  const [playlistSongs, setPlaylistSongs] = useState<PlaylistSong[]>([]);

  useEffect(() => {
    if (!playlistId) { setPlaylistSongs([]); return; }
    return subscribeToPlaylist(playlistId, (pl) => setPlaylistSongs(pl?.songs ?? []));
  }, [playlistId]);

  useEffect(() => {
    if (!user) { setCurrentUsername(null); return; }
    return subscribeToUserProfile(user.uid, (profile) => setCurrentUsername(profile?.username ?? null));
  }, [user?.uid]);

  const songFromResults = songId
    ? results.songs.find((s) => String(s.id) === songId) ?? null
    : null;
  const selectedSong = songFromResults ?? fetchedSong;

  const albumMatchesId = albumDetail && String(albumDetail.album.id) === albumId;
  const artistMatchesId = artistDetail && String(artistDetail.artist.id) === artistId;

  function navigate(next: UrlUpdate) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.type !== undefined) {
      if (next.type && next.type !== "all") params.set("type", next.type);
      else params.delete("type");
    }
    if (next.songId !== undefined) {
      if (next.songId) params.set("songId", next.songId);
      else params.delete("songId");
    }
    if (next.albumId !== undefined) {
      if (next.albumId) params.set("albumId", next.albumId);
      else params.delete("albumId");
    }
    if (next.artistId !== undefined) {
      if (next.artistId) params.set("artistId", next.artistId);
      else params.delete("artistId");
    }

    const queryString = params.toString();
    router.push(queryString ? `/search?${queryString}` : "/search");
  }

  function changeType(nextType: SearchType) {
    const params = new URLSearchParams(searchParams.toString());
    if (nextType !== "all") params.set("type", nextType);
    else params.delete("type");
    const queryString = params.toString();
    router.replace(queryString ? `/search?${queryString}` : "/search");
  }

  useEffect(() => {
    if (songId || albumId || artistId || !query.trim()) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- starting an async fetch, not deriving state
    setIsLoadingResults(true);
    setResultsError(false);

    fetchSearchResults(query, type)
      .then((data) => {
        if (!cancelled) setResults(data);
      })
      .catch(() => {
        if (!cancelled) setResultsError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingResults(false);
      });

    return () => {
      cancelled = true;
    };
  }, [query, type, songId, albumId, artistId]);

  useEffect(() => {
    if (!songId || songFromResults) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- starting an async fetch, not deriving state
    setIsLoadingSong(true);
    setSongError(false);

    fetchSongById(songId)
      .then((song) => {
        if (!cancelled) setFetchedSong(song);
      })
      .catch(() => {
        if (!cancelled) setSongError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingSong(false);
      });

    return () => {
      cancelled = true;
    };
  }, [songId, songFromResults]);

  useEffect(() => {
    if (!albumId || albumMatchesId) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- starting an async fetch, not deriving state
    setIsLoadingAlbum(true);
    setAlbumError(false);

    fetchAlbumById(albumId)
      .then((detail) => {
        if (!cancelled) setAlbumDetail(detail);
      })
      .catch(() => {
        if (!cancelled) setAlbumError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingAlbum(false);
      });

    return () => {
      cancelled = true;
    };
  }, [albumId, albumMatchesId]);

  useEffect(() => {
    if (!artistId || artistMatchesId) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- starting an async fetch, not deriving state
    setIsLoadingArtist(true);
    setArtistError(false);

    fetchArtistById(artistId)
      .then((detail) => {
        if (!cancelled) setArtistDetail(detail);
      })
      .catch(() => {
        if (!cancelled) setArtistError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoadingArtist(false);
      });

    return () => {
      cancelled = true;
    };
  }, [artistId, artistMatchesId]);

  useEffect(() => {
    setSongHasChords(null);
  }, [selectedSong?.id]);

  useEffect(() => {
    if (!selectedSong) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- starting an async fetch, not deriving state
    setSimilarSongs([]);

    fetchSearchResults(selectedSong.artistName, "song")
      .then((data) => {
        if (cancelled) return;
        setSimilarSongs(data.songs.filter((s) => s.id !== selectedSong.id).slice(0, 10));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [selectedSong]);

  useEffect(() => {
    if (!albumDetail) return;

    let cancelled = false;
    setSimilarAlbums([]);

    fetchSearchResults(albumDetail.album.artistName, "album")
      .then((data) => {
        if (cancelled) return;
        setSimilarAlbums(data.albums.filter((a) => a.id !== albumDetail.album.id).slice(0, 10));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [albumDetail]);

  useEffect(() => {
    if (!artistDetail) return;

    let cancelled = false;
    setSimilarArtists([]);

    const term = artistDetail.artist.genre || artistDetail.artist.name;
    fetchSearchResults(term, "artist")
      .then((data) => {
        if (cancelled) return;
        setSimilarArtists(data.artists.filter((a) => a.id !== artistDetail.artist.id).slice(0, 10));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [artistDetail]);

  function handleAddToPlaylist(song: Song) {
    if (!user) {
      setIsSignInPromptOpen(true);
      return;
    }
    if (songHasChords === false) {
      setPendingAddSong(song);
      return;
    }
    setSongToAdd(song);
  }

  function handleSongClick(song: Song) {
    if (!user) {
      setIsSignInPromptOpen(true);
      return;
    }
    setFetchedSong(song);
    navigate({ songId: String(song.id) });
  }

  function handleAlbumClick(album: Album) {
    navigate({ albumId: String(album.id) });
  }

  function navigateToArtist(artistId: number) {
    navigate({ songId: null, albumId: null, artistId: String(artistId) });
  }

  function handleArtistClick(artist: Artist) {
    navigateToArtist(artist.id);
  }

  function goBack() {
    if (playlistId) {
      router.push(`/playlists/${playlistId}`);
    } else {
      router.back();
    }
  }

  const addToPlaylistModal = songToAdd && (
    <AddToPlaylistModal song={songToAdd} onClose={() => setSongToAdd(null)} />
  );

  const noChordsConfirmModal = pendingAddSong && (
    <DeleteConfirmModal
      playlistName={pendingAddSong.title}
      title="Save without chords?"
      body={`"${pendingAddSong.title}" doesn't have chords yet. You can edit them later from the song page — collaborators will see your changes too.`}
      confirmLabel="Save anyway"
      loadingLabel="Saving…"
      variant="neutral"
      onConfirm={() => {
        const song = pendingAddSong;
        setPendingAddSong(null);
        setSongToAdd(song);
      }}
      onCancel={() => setPendingAddSong(null)}
    />
  );

  if (songId) {
    return (
      <main className="flex w-full flex-col px-4 py-6">
        {isLoadingSong && <LoadingSpinner />}
        {!isLoadingSong && songError && (
          <ErrorMessage message="Could not load this song." />
        )}
        {!isLoadingSong && !songError && selectedSong && (
          <>
            <SongDetailView
              song={selectedSong}
              onBack={goBack}
              onArtistClick={navigateToArtist}
              onAddToPlaylist={() => handleAddToPlaylist(selectedSong)}
            />
            {playlistId && playlistIndex !== null && playlistSongs.length > 0 && (
              <PlaylistNav
                onPrev={
                  playlistIndex > 0
                    ? () => {
                        const prev = playlistSongs[playlistIndex - 1];
                        if (prev) router.push(`/search?songId=${prev.id}&playlistId=${playlistId}&index=${playlistIndex - 1}`);
                      }
                    : undefined
                }
                onNext={
                  playlistIndex < playlistSongs.length - 1
                    ? () => {
                        const next = playlistSongs[playlistIndex + 1];
                        if (next) router.push(`/search?songId=${next.id}&playlistId=${playlistId}&index=${playlistIndex + 1}`);
                      }
                    : undefined
                }
              />
            )}
            <ChordsSection
              songId={String(selectedSong.id)}
              song={selectedSong}
              userUid={user?.uid ?? null}
              username={currentUsername}
              onChordsStatusChange={setSongHasChords}
            />
            {playlistId && playlistIndex !== null && playlistSongs.length > 0 && (
              <PlaylistNav
                onPrev={
                  playlistIndex > 0
                    ? () => {
                        const prev = playlistSongs[playlistIndex - 1];
                        if (prev) router.push(`/search?songId=${prev.id}&playlistId=${playlistId}&index=${playlistIndex - 1}`);
                      }
                    : undefined
                }
                onNext={
                  playlistIndex < playlistSongs.length - 1
                    ? () => {
                        const next = playlistSongs[playlistIndex + 1];
                        if (next) router.push(`/search?songId=${next.id}&playlistId=${playlistId}&index=${playlistIndex + 1}`);
                      }
                    : undefined
                }
              />
            )}
            <div className="mt-8">
              <TrendingSongsSection
                songs={similarSongs}
                onSongClick={handleSongClick}
                onAddToPlaylist={handleAddToPlaylist}
                title={`More by ${selectedSong.artistName}`}
              />
            </div>
          </>
        )}
        {addToPlaylistModal}
        {noChordsConfirmModal}
      </main>
    );
  }

  if (albumId) {
    return (
      <main className="flex w-full flex-col gap-8 px-4 py-6">
        {isLoadingAlbum && <LoadingSpinner />}
        {!isLoadingAlbum && albumError && <ErrorMessage message="Could not load this album." />}
        {!isLoadingAlbum && !albumError && albumDetail && albumMatchesId && (
          <AlbumDetailView
            albumDetail={albumDetail}
            onBack={goBack}
            onSongClick={handleSongClick}
            onArtistClick={navigateToArtist}
            onAddToPlaylist={handleAddToPlaylist}
          />
        )}
        <AlbumsSection
          albums={similarAlbums}
          onAlbumClick={handleAlbumClick}
          onArtistClick={navigateToArtist}
          title={albumDetail ? `More by ${albumDetail.album.artistName}` : "Similar Albums"}
        />
        {isSignInPromptOpen && (
          <SignInPromptModal onClose={() => setIsSignInPromptOpen(false)} />
        )}
        {addToPlaylistModal}
      </main>
    );
  }

  if (artistId) {
    return (
      <main className="flex w-full flex-col gap-8 px-4 py-6">
        {isLoadingArtist && <LoadingSpinner />}
        {!isLoadingArtist && artistError && (
          <ErrorMessage message="Could not load this artist." />
        )}
        {!isLoadingArtist && !artistError && artistDetail && artistMatchesId && (
          <ArtistDetailView
            artistDetail={artistDetail}
            onBack={goBack}
            onAlbumClick={handleAlbumClick}
            onArtistClick={navigateToArtist}
          />
        )}
        <ArtistsSection
          artists={similarArtists}
          onArtistClick={handleArtistClick}
          title={artistDetail ? `Artists Similar to ${artistDetail.artist.name}` : "Similar Artists"}
        />
      </main>
    );
  }

  return (
    <main className="flex w-full flex-col gap-6 px-4 py-6">
      <h1 className="text-center text-2xl font-bold text-neutral-900 dark:text-neutral-100">Search</h1>

      <div className="mx-auto w-full max-w-xl">
        <PageSearchBar />
      </div>
      {query.trim() && (
        <div className="flex justify-center">
          <SearchTypeTabs value={type} onChange={changeType} />
        </div>
      )}

      {query.trim() && isLoadingResults && <LoadingSpinner />}
      {query.trim() && !isLoadingResults && resultsError && (
        <ErrorMessage message="Could not fetch results. Please try again." />
      )}
      {query.trim() && !isLoadingResults && !resultsError && (
        <ResultsList
          results={results}
          onSongClick={handleSongClick}
          onAlbumClick={handleAlbumClick}
          onArtistClick={handleArtistClick}
          onArtistIdClick={navigateToArtist}
          onAddToPlaylist={handleAddToPlaylist}
        />
      )}

      {!query.trim() && (
        <EmptyState
          title="Start typing to search"
          description="Find songs, albums, and artists from the iTunes catalog."
        />
      )}

      {isSignInPromptOpen && (
        <SignInPromptModal onClose={() => setIsSignInPromptOpen(false)} />
      )}
      {addToPlaylistModal}
    </main>
  );
}
