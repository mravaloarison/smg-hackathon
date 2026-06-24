"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import ArtistsSection from "@/components/results/ArtistsSection";
import AlbumsSection from "@/components/results/AlbumsSection";
import TrendingSongsSection from "@/components/home/TrendingSongsSection";
import AddToPlaylistModal from "@/components/playlists/AddToPlaylistModal";
import SignInPromptModal from "@/components/auth/SignInPromptModal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ErrorMessage from "@/components/ui/ErrorMessage";
import EmptyState from "@/components/ui/EmptyState";
import { fetchHomeDiscovery } from "@/lib/itunes/client";
import { Album, Artist, HomeDiscovery, Song } from "@/lib/itunes/types";
import { useAuth } from "@/contexts/AuthContext";

export default function HomeClient() {
  const router = useRouter();
  const { user } = useAuth();

  const [discovery, setDiscovery] = useState<HomeDiscovery | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [isSignInPromptOpen, setIsSignInPromptOpen] = useState(false);
  const [songToAdd, setSongToAdd] = useState<Song | null>(null);

  useEffect(() => {
    if (discovery) return;

    let cancelled = false;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- starting an async fetch, not deriving state
    setIsLoading(true);
    setError(false);

    fetchHomeDiscovery()
      .then((data) => {
        if (!cancelled) setDiscovery(data);
      })
      .catch(() => {
        if (!cancelled) setError(true);
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [discovery]);

  function handleSongClick(song: Song) {
    if (!user) {
      setIsSignInPromptOpen(true);
      return;
    }
    router.push(`/search?songId=${song.id}`);
  }

  function handleAddToPlaylist(song: Song) {
    if (!user) {
      setIsSignInPromptOpen(true);
      return;
    }
    setSongToAdd(song);
  }

  function handleAlbumClick(album: Album) {
    router.push(`/search?albumId=${album.id}`);
  }

  function handleArtistClick(artist: Artist) {
    router.push(`/search?artistId=${artist.id}`);
  }

  return (
    <main className="flex w-full flex-col gap-6 px-6 py-10">
      <h1 className="text-center text-2xl font-bold text-neutral-900 dark:text-neutral-100">Home</h1>

      {isLoading && <LoadingSpinner />}
      {!isLoading && error && (
        <ErrorMessage message="Could not load trending music. Please try again." />
      )}
      {!isLoading && !error && discovery && (
        <div className="flex flex-col gap-8">
          <TrendingSongsSection songs={discovery.trendingSongs} onSongClick={handleSongClick} onAddToPlaylist={handleAddToPlaylist} />
          <ArtistsSection
            artists={discovery.popularArtists}
            onArtistClick={handleArtistClick}
            title="Popular Artists"
          />
          <AlbumsSection
            albums={discovery.trendingAlbums}
            onAlbumClick={handleAlbumClick}
            onArtistClick={(artistId) => router.push(`/search?artistId=${artistId}`)}
            title="Popular Albums"
          />
          {discovery.trendingSongs.length === 0 &&
            discovery.popularArtists.length === 0 &&
            discovery.trendingAlbums.length === 0 && (
              <EmptyState
                title="Nothing to show yet"
                description="Check back later for trending music."
              />
            )}
        </div>
      )}

      {isSignInPromptOpen && (
        <SignInPromptModal onClose={() => setIsSignInPromptOpen(false)} />
      )}
      {songToAdd && (
        <AddToPlaylistModal song={songToAdd} onClose={() => setSongToAdd(null)} />
      )}
    </main>
  );
}
