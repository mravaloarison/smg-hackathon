"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import SearchBar from "@/components/search/SearchBar";
import SearchTypeTabs from "@/components/search/SearchTypeTabs";
import ResultsList from "@/components/results/ResultsList";
import SongDetailView from "@/components/song-detail/SongDetailView";
import AlbumDetailView from "@/components/album-detail/AlbumDetailView";
import ArtistDetailView from "@/components/artist-detail/ArtistDetailView";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import EmptyState from "@/components/ui/EmptyState";
import {
  fetchAlbumById,
  fetchArtistById,
  fetchSearchResults,
  fetchSongById,
} from "@/lib/itunes/client";
import {
  Album,
  AlbumDetail,
  Artist,
  ArtistDetail,
  SearchResults,
  SearchType,
  Song,
} from "@/lib/itunes/types";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

const EMPTY_RESULTS: SearchResults = { songs: [], albums: [], artists: [] };

interface UrlUpdate {
  q?: string;
  type?: SearchType;
  songId?: string | null;
  albumId?: string | null;
  artistId?: string | null;
}

export default function HomeClient() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const query = searchParams.get("q") ?? "";
  const type = (searchParams.get("type") as SearchType) ?? "all";
  const songId = searchParams.get("songId");
  const albumId = searchParams.get("albumId");
  const artistId = searchParams.get("artistId");

  const [inputValue, setInputValue] = useState(query);
  const debouncedInput = useDebouncedValue(inputValue, 400);

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

  const songFromResults = songId
    ? results.songs.find((s) => String(s.id) === songId) ?? null
    : null;
  const selectedSong = songFromResults ?? fetchedSong;

  const albumMatchesId = albumDetail && String(albumDetail.album.id) === albumId;
  const artistMatchesId = artistDetail && String(artistDetail.artist.id) === artistId;

  function updateUrl(next: UrlUpdate) {
    const params = new URLSearchParams(searchParams.toString());

    if (next.q !== undefined) {
      if (next.q) params.set("q", next.q);
      else params.delete("q");
    }
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
    router.push(queryString ? `/?${queryString}` : "/");
  }

  useEffect(() => {
    if (debouncedInput !== query) {
      updateUrl({ q: debouncedInput });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput]);

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

  function handleSongClick(song: Song) {
    setFetchedSong(song);
    updateUrl({ songId: String(song.id) });
  }

  function handleAlbumClick(album: Album) {
    updateUrl({ albumId: String(album.id) });
  }

  function navigateToArtist(artistId: number) {
    updateUrl({ songId: null, albumId: null, artistId: String(artistId) });
  }

  function handleArtistClick(artist: Artist) {
    navigateToArtist(artist.id);
  }

  function handleBackFromSong() {
    updateUrl({ songId: null });
  }

  function handleBackFromAlbum() {
    updateUrl({ albumId: null });
  }

  function handleBackFromArtist() {
    updateUrl({ artistId: null });
  }

  function handleTypeChange(nextType: SearchType) {
    updateUrl({ type: nextType });
  }

  if (songId) {
    return (
      <main className="mx-auto flex max-w-3xl w-full flex-col px-4 py-10">
        {isLoadingSong && <LoadingSpinner />}
        {!isLoadingSong && songError && <ErrorMessage message="Could not load this song." />}
        {!isLoadingSong && !songError && selectedSong && (
          <SongDetailView
            song={selectedSong}
            onBack={handleBackFromSong}
            onArtistClick={navigateToArtist}
          />
        )}
      </main>
    );
  }

  if (albumId) {
    return (
      <main className="mx-auto flex max-w-3xl w-full flex-col px-4 py-10">
        {isLoadingAlbum && <LoadingSpinner />}
        {!isLoadingAlbum && albumError && <ErrorMessage message="Could not load this album." />}
        {!isLoadingAlbum && !albumError && albumDetail && albumMatchesId && (
          <AlbumDetailView
            albumDetail={albumDetail}
            onBack={handleBackFromAlbum}
            onSongClick={handleSongClick}
            onArtistClick={navigateToArtist}
          />
        )}
      </main>
    );
  }

  if (artistId) {
    return (
      <main className="mx-auto flex max-w-3xl w-full flex-col px-4 py-10">
        {isLoadingArtist && <LoadingSpinner />}
        {!isLoadingArtist && artistError && (
          <ErrorMessage message="Could not load this artist." />
        )}
        {!isLoadingArtist && !artistError && artistDetail && artistMatchesId && (
          <ArtistDetailView
            artistDetail={artistDetail}
            onBack={handleBackFromArtist}
            onAlbumClick={handleAlbumClick}
            onArtistClick={navigateToArtist}
          />
        )}
      </main>
    );
  }

  return (
    <main className="mx-auto flex max-w-3xl w-full flex-col gap-6 px-4 py-10">
      <h1 className="text-center text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        Nadia
      </h1>
      <SearchBar value={inputValue} onChange={setInputValue} />
      <SearchTypeTabs value={type} onChange={handleTypeChange} />

      {isLoadingResults && <LoadingSpinner />}
      {!isLoadingResults && resultsError && (
        <ErrorMessage message="Could not fetch results. Please try again." />
      )}
      {!isLoadingResults && !resultsError && !query.trim() && (
        <EmptyState
          title="Start typing to search"
          description="Find songs, albums, and artists from the iTunes catalog."
        />
      )}
      {!isLoadingResults && !resultsError && query.trim() && (
        <ResultsList
          results={results}
          onSongClick={handleSongClick}
          onAlbumClick={handleAlbumClick}
          onArtistClick={handleArtistClick}
          onArtistIdClick={navigateToArtist}
        />
      )}
    </main>
  );
}
