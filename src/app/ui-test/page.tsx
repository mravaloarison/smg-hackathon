"use client";

import { useState } from "react";
import SearchBar from "@/components/search/SearchBar";
import SearchTypeTabs from "@/components/search/SearchTypeTabs";
import SongCard from "@/components/results/SongCard";
import AlbumCard from "@/components/results/AlbumCard";
import ArtistCard from "@/components/results/ArtistCard";
import ArtistsSection from "@/components/results/ArtistsSection";
import AlbumsSection from "@/components/results/AlbumsSection";
import SongsSection from "@/components/results/SongsSection";
import ResultsList from "@/components/results/ResultsList";
import SongDetailView from "@/components/song-detail/SongDetailView";
import AlbumDetailView from "@/components/album-detail/AlbumDetailView";
import ArtistDetailView from "@/components/artist-detail/ArtistDetailView";
import LyricsSection from "@/components/lyrics/LyricsSection";
import LyricsView from "@/components/lyrics/LyricsView";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import GoogleSignInButton from "@/components/auth/GoogleSignInButton";
import ProfileView from "@/components/profile/ProfileView";
import ProfileEditForm from "@/components/profile/ProfileEditForm";
import UserCard from "@/components/people/UserCard";
import PlaylistCard from "@/components/playlists/PlaylistCard";
import PlaylistSongRow from "@/components/playlists/PlaylistSongRow";
import CreatePlaylistForm from "@/components/playlists/CreatePlaylistForm";
import Artwork from "@/components/ui/Artwork";
import BackButton from "@/components/ui/BackButton";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import ErrorMessage from "@/components/ui/ErrorMessage";
import { SearchType } from "@/lib/itunes/types";
import {
  mockAlbum,
  mockAlbumDetail,
  mockArtist,
  mockArtistDetail,
  mockSearchResults,
  mockSong,
  mockSongNoArtwork,
} from "@/lib/itunes/mockData";
import { mockInstrumentalLyrics, mockLyrics } from "@/lib/lyrics/mockData";
import {
  mockEmptyPlaylist,
  mockOtherUserProfile,
  mockPlaylist,
  mockPlaylistSong,
  mockUserProfile,
} from "@/lib/firestore/mockData";

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 border-b border-neutral-200 pb-8 dark:border-neutral-800">
      <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">
        {title}
      </h2>
      <div className="rounded-lg border border-dashed border-neutral-300 p-4 dark:border-neutral-700">
        {children}
      </div>
    </section>
  );
}

export default function UiTestPage() {
  const [searchValue, setSearchValue] = useState("blinding lights");
  const [searchType, setSearchType] = useState<SearchType>("all");

  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-8 px-4 py-10">
      <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">
        UI Test Page
      </h1>
      <p className="text-sm text-neutral-500 dark:text-neutral-400">
        Each component below is rendered in isolation with mock data. Edit a
        component file and refresh to see changes here, without needing to
        search the live API.
      </p>

      <Block title="SearchBar">
        <SearchBar value={searchValue} onChange={setSearchValue} />
      </Block>

      <Block title="SearchTypeTabs">
        <SearchTypeTabs value={searchType} onChange={setSearchType} />
      </Block>

      <Block title="SongCard">
        <div className="flex flex-col gap-1">
          <SongCard song={mockSong} onClick={() => {}} />
          <SongCard song={mockSongNoArtwork} onClick={() => {}} />
        </div>
      </Block>

      <Block title="AlbumCard">
        <div className="grid grid-cols-3 gap-4">
          <AlbumCard album={mockAlbum} onClick={() => {}} onArtistClick={() => {}} />
        </div>
      </Block>

      <Block title="ArtistCard">
        <div className="flex gap-4">
          <ArtistCard artist={mockArtist} onClick={() => {}} />
        </div>
      </Block>

      <Block title="ArtistsSection">
        <ArtistsSection artists={[mockArtist]} onArtistClick={() => {}} />
      </Block>

      <Block title="AlbumsSection">
        <AlbumsSection albums={[mockAlbum]} onAlbumClick={() => {}} onArtistClick={() => {}} />
      </Block>

      <Block title="SongsSection">
        <SongsSection songs={[mockSong, mockSongNoArtwork]} onSongClick={() => {}} />
      </Block>

      <Block title="ResultsList (full, all sections)">
        <ResultsList
          results={mockSearchResults}
          onSongClick={() => {}}
          onAlbumClick={() => {}}
          onArtistClick={() => {}}
          onArtistIdClick={() => {}}
        />
      </Block>

      <Block title="SongDetailView">
        <SongDetailView
          song={mockSong}
          onBack={() => {}}
          onArtistClick={() => {}}
          onAddToPlaylist={() => {}}
        />
      </Block>

      <Block title="AlbumDetailView">
        <AlbumDetailView
          albumDetail={mockAlbumDetail}
          onBack={() => {}}
          onSongClick={() => {}}
          onArtistClick={() => {}}
        />
      </Block>

      <Block title="ArtistDetailView">
        <ArtistDetailView
          artistDetail={mockArtistDetail}
          onBack={() => {}}
          onAlbumClick={() => {}}
          onArtistClick={() => {}}
        />
      </Block>

      <Block title="LyricsView">
        <div className="flex flex-col gap-4">
          <LyricsView plainLyrics={mockLyrics.plainLyrics} instrumental={false} />
          <LyricsView plainLyrics={null} instrumental />
        </div>
      </Block>

      <Block title="LyricsSection (loading / error / found / instrumental)">
        <div className="flex flex-col gap-6">
          <LyricsSection isLoading lyrics={null} error={false} />
          <LyricsSection isLoading={false} error lyrics={null} />
          <LyricsSection isLoading={false} error={false} lyrics={mockLyrics} />
          <LyricsSection isLoading={false} error={false} lyrics={mockInstrumentalLyrics} />
        </div>
      </Block>

      <Block title="Artwork (sizes + fallback)">
        <div className="flex flex-wrap items-end gap-4">
          <Artwork src={mockSong.artworkUrl} alt="square" size={48} />
          <Artwork src={mockSong.artworkUrl} alt="square" size={96} />
          <Artwork src={mockSong.artworkUrl} alt="square" size={150} />
          <Artwork src={mockSong.artworkUrl} alt="round" size={96} rounded="full" />
          <Artwork src={undefined} alt="placeholder" size={96} />
          <div className="w-32">
            <Artwork src={mockSong.artworkUrl} alt="fluid" fluid />
          </div>
        </div>
      </Block>

      <Block title="BackButton">
        <BackButton onClick={() => {}} />
      </Block>

      <Block title="LoadingSpinner">
        <LoadingSpinner />
      </Block>

      <Block title="EmptyState">
        <EmptyState title="No results found" description="Try a different search term." />
      </Block>

      <Block title="ErrorMessage">
        <ErrorMessage message="Could not fetch search results." />
      </Block>

      <Block title="SignInForm">
        <SignInForm onSubmit={() => {}} />
      </Block>

      <Block title="SignUpForm">
        <SignUpForm onSubmit={() => {}} />
      </Block>

      <Block title="GoogleSignInButton">
        <GoogleSignInButton onClick={() => {}} />
      </Block>

      <Block title="ProfileView (own vs. other)">
        <div className="flex flex-col gap-6 divide-y divide-neutral-200 dark:divide-neutral-800">
          <ProfileView profile={mockUserProfile} isOwnProfile onEdit={() => {}} />
          <ProfileView profile={mockOtherUserProfile} isOwnProfile={false} />
        </div>
      </Block>

      <Block title="ProfileEditForm">
        <ProfileEditForm profile={mockUserProfile} onSave={() => {}} onCancel={() => {}} />
      </Block>

      <Block title="UserCard">
        <div className="flex flex-col gap-1">
          <UserCard user={mockUserProfile} />
          <UserCard user={mockOtherUserProfile} />
        </div>
      </Block>

      <Block title="PlaylistCard">
        <div className="flex flex-col gap-1">
          <PlaylistCard playlist={mockPlaylist} />
          <PlaylistCard playlist={mockEmptyPlaylist} />
        </div>
      </Block>

      <Block title="PlaylistSongRow">
        <PlaylistSongRow song={mockPlaylistSong} onRemove={() => {}} />
      </Block>

      <Block title="CreatePlaylistForm">
        <CreatePlaylistForm onCreate={() => {}} />
      </Block>
    </main>
  );
}
