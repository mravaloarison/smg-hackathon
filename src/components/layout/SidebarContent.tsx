"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { signOutUser } from "@/lib/firebase/auth";
import { deletePlaylist, renamePlaylist, subscribeToCollaboratorPlaylists, subscribeToUserPlaylists } from "@/lib/firestore/playlists";
import { subscribeToReceivedInvites } from "@/lib/firestore/invites";
import { CollabInvite, Playlist } from "@/lib/firestore/types";
import PlaylistArtwork from "@/components/playlists/PlaylistArtwork";
import InviteCollaboratorModal from "@/components/playlists/InviteCollaboratorModal";

interface SidebarContentProps {
  onNavigate?: () => void;
}

function NavLink({
  href,
  isActive,
  onNavigate,
  icon,
  children,
}: {
  href: string;
  isActive: boolean;
  onNavigate?: () => void;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition hover:bg-neutral-200/60 dark:hover:bg-neutral-800 ${
        isActive
          ? "text-neutral-900 dark:text-neutral-100"
          : "text-neutral-600 dark:text-neutral-300"
      }`}
    >
      {icon}
      {children}
    </Link>
  );
}

export default function SidebarContent({ onNavigate }: SidebarContentProps) {
  const { user, profile, isLoading } = useAuth();
  const pathname = usePathname();
  const [ownedPlaylists, setOwnedPlaylists] = useState<Playlist[]>([]);
  const [collabPlaylists, setCollabPlaylists] = useState<Playlist[]>([]);
  const [invites, setInvites] = useState<CollabInvite[]>([]);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [invitingPlaylist, setInvitingPlaylist] = useState<Playlist | null>(null);

  useEffect(() => {
    if (!user) return;
    const unsubOwned = subscribeToUserPlaylists(user.uid, setOwnedPlaylists);
    const unsubCollab = subscribeToCollaboratorPlaylists(user.uid, setCollabPlaylists);
    return () => { unsubOwned(); unsubCollab(); };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    return subscribeToReceivedInvites(user.uid, setInvites);
  }, [user]);

  const pendingCount = invites.length;

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOutUser();
    } finally {
      setIsSigningOut(false);
    }
  }

  function startRename(playlist: Playlist) {
    setRenamingId(playlist.id);
    setRenameValue(playlist.name);
  }

  async function saveRename(e: FormEvent, playlistId: string) {
    e.preventDefault();
    const trimmed = renameValue.trim();
    if (!trimmed) return;
    await renamePlaylist(playlistId, trimmed);
    setRenamingId(null);
  }

  async function handleDelete(playlist: Playlist) {
    const ok = window.confirm(`Delete "${playlist.name}"? This can't be undone.`);
    if (!ok) return;
    await deletePlaylist(playlist.id);
  }

  return (
    <div className="flex flex-1 flex-col gap-8">
      <nav className="flex flex-col gap-1">
        <NavLink
          href="/"
          isActive={pathname === "/"}
          onNavigate={onNavigate}
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6" aria-hidden="true">
              <path d="M9.293 2.293a1 1 0 0 1 1.414 0l7 7A1 1 0 0 1 17 11h-1v6a1 1 0 0 1-1 1h-3a1 1 0 0 1-1-1v-3H9v3a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1v-6H3a1 1 0 0 1-.707-1.707l7-7Z" />
            </svg>
          }
        >
          Home
        </NavLink>
        <NavLink
          href="/search?focus=search"
          isActive={pathname === "/search"}
          onNavigate={onNavigate}
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M9 3.5a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11ZM2 9a7 7 0 1 1 12.452 4.391l3.328 3.329a.75.75 0 1 1-1.06 1.06l-3.329-3.328A7 7 0 0 1 2 9Z"
                clipRule="evenodd"
              />
            </svg>
          }
        >
          Search
        </NavLink>
        <NavLink
          href="/people"
          isActive={pathname === "/people"}
          onNavigate={onNavigate}
          icon={
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6" aria-hidden="true">
              <path d="M8 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM8 11a6 6 0 0 0-6 6 1 1 0 0 0 1 1h10a1 1 0 0 0 1-1 6 6 0 0 0-6-6ZM15 7a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM16.5 18a1 1 0 0 0 .976-1.218A6.97 6.97 0 0 0 13.453 11a4.97 4.97 0 0 1 2.487 3.275A6.954 6.954 0 0 1 16.5 18Z" />
            </svg>
          }
        >
          People
        </NavLink>
        {user && (
          <NavLink
            href="/profile"
            isActive={pathname === "/profile"}
            onNavigate={onNavigate}
            icon={
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6" aria-hidden="true">
                <path fillRule="evenodd" d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-5.5-2.5a2.5 2.5 0 1 1-5 0 2.5 2.5 0 0 1 5 0ZM10 12a5.99 5.99 0 0 0-4.793 2.39A6.483 6.483 0 0 0 10 16.5a6.483 6.483 0 0 0 4.793-2.11A5.99 5.99 0 0 0 10 12Z" clipRule="evenodd" />
              </svg>
            }
          >
            Profile
          </NavLink>
        )}
        {user && (
          <Link
            href="/notifications"
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-base font-medium transition hover:bg-neutral-200/60 dark:hover:bg-neutral-800 ${
              pathname === "/notifications"
                ? "text-neutral-900 dark:text-neutral-100"
                : "text-neutral-600 dark:text-neutral-300"
            }`}
          >
            <span className="relative flex h-6 w-6 flex-shrink-0 items-center justify-center">
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-6 w-6" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M4 8a6 6 0 1 1 12 0v1.833a4.5 4.5 0 0 0 1.09 2.956l.424.53A1 1 0 0 1 16.75 15H3.25a1 1 0 0 1-.764-1.682l.424-.529A4.5 4.5 0 0 0 4 9.833V8Zm6 12a3.001 3.001 0 0 1-2.83-2h5.66A3.001 3.001 0 0 1 10 20Z"
                  clipRule="evenodd"
                />
              </svg>
              {pendingCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold leading-none text-white">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
            </span>
            Notifications
          </Link>
        )}
      </nav>

      {user && (
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between px-3">
            <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Playlists
            </span>
            <Link
              href="/playlists"
              onClick={onNavigate}
              aria-label="See all playlists"
              className="flex h-7 w-7 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-200/60 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                <path d="M10.75 4.75a.75.75 0 0 0-1.5 0v4.5h-4.5a.75.75 0 0 0 0 1.5h4.5v4.5a.75.75 0 0 0 1.5 0v-4.5h4.5a.75.75 0 0 0 0-1.5h-4.5v-4.5Z" />
              </svg>
            </Link>
          </div>

          <nav className="flex flex-col gap-0.5">
            {ownedPlaylists.length === 0 && collabPlaylists.length === 0 && (
              <p className="px-3 text-sm text-neutral-400 dark:text-neutral-500">
                No playlists yet
              </p>
            )}
            {ownedPlaylists.map((playlist) => {
              const href = `/playlists/${playlist.id}`;

              if (renamingId === playlist.id) {
                return (
                  <form
                    key={playlist.id}
                    onSubmit={(e) => saveRename(e, playlist.id)}
                    className="flex items-center gap-1 px-2 py-1"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      className="flex-1 rounded-md border border-neutral-300 bg-white px-2 py-1 text-sm outline-none focus:ring-1 focus:ring-neutral-400 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
                    />
                    <button type="submit" className="text-xs font-semibold text-neutral-700 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-neutral-100">
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={() => setRenamingId(null)}
                      className="text-xs text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                    >
                      ✕
                    </button>
                  </form>
                );
              }

              return (
                <div
                  key={playlist.id}
                  className="flex items-center gap-2 rounded-lg transition hover:bg-neutral-200/60 dark:hover:bg-neutral-800"
                >
                  <Link
                    href={href}
                    onClick={onNavigate}
                    className={`flex min-w-0 flex-1 items-center gap-2 px-3 py-2 text-sm ${
                      pathname === href
                        ? "text-neutral-900 dark:text-neutral-100"
                        : "text-neutral-600 dark:text-neutral-300"
                    }`}
                  >
                    <PlaylistArtwork playlist={playlist} size={32} />
                    <span className="truncate">{playlist.name}</span>
                  </Link>
                  <div className="flex flex-shrink-0 items-center gap-0.5 pr-1.5">
                    <button
                      type="button"
                      onClick={() => startRename(playlist)}
                      aria-label="Rename"
                      title="Rename"
                      className="flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-300 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                        <path d="M5.433 13.917l1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
                        <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInvitingPlaylist(playlist)}
                      aria-label="Invite collaborator"
                      title="Invite collaborator"
                      className="flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-300 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                        <path d="M9 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM17.555 16.185a1 1 0 0 1-.887 1.312H3.332a1 1 0 0 1-.887-1.312l.347-1.107A4.003 4.003 0 0 1 6.613 12h6.774a4.003 4.003 0 0 1 3.821 2.878l.347 1.307ZM16 8a1 1 0 1 0-2 0v1h-1a1 1 0 1 0 0 2h1v1a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2h-1V8Z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(playlist)}
                      aria-label="Delete"
                      title="Delete"
                      className="flex h-6 w-6 items-center justify-center rounded-full text-neutral-400 transition hover:bg-red-50 hover:text-red-500 dark:text-neutral-500 dark:hover:bg-red-950 dark:hover:text-red-400"
                    >
                      <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5" aria-hidden="true">
                        <path
                          fillRule="evenodd"
                          d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.808a2.75 2.75 0 0 0 2.74-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              );
            })}
          </nav>
        </div>
      )}

      {user && collabPlaylists.length > 0 && (
        <div className="flex flex-col gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-700">
          <div className="px-3">
            <span className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
              Shared with me
            </span>
          </div>
          <nav className="flex flex-col gap-0.5">
            {collabPlaylists.map((playlist) => {
              const href = `/playlists/${playlist.id}`;
              return (
                <Link
                  key={playlist.id}
                  href={href}
                  onClick={onNavigate}
                  className={`flex min-w-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition hover:bg-neutral-200/60 dark:hover:bg-neutral-800 ${
                    pathname === href
                      ? "text-neutral-900 dark:text-neutral-100"
                      : "text-neutral-600 dark:text-neutral-300"
                  }`}
                >
                  <PlaylistArtwork playlist={playlist} size={32} />
                  <div className="min-w-0">
                    <span className="block truncate">{playlist.name}</span>
                    <span className="block truncate text-xs text-neutral-400 dark:text-neutral-500">
                      by {playlist.ownerUsername}
                    </span>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      <div className="mt-auto flex flex-col gap-2 border-t border-neutral-200 pt-4 dark:border-neutral-800">
        {!isLoading && user && (
          <button
            type="button"
            onClick={handleSignOut}
            disabled={isSigningOut}
            className="rounded-full border border-neutral-300 px-4 py-2 text-center text-base font-medium text-neutral-700 transition hover:bg-neutral-200/60 disabled:opacity-50 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            {isSigningOut ? "Signing out..." : "Sign out"}
          </button>
        )}
        {!isLoading && !user && (
          <div className="flex flex-col gap-2 px-1">
            <Link
              href="/login"
              onClick={onNavigate}
              className="rounded-full border border-neutral-300 px-4 py-2 text-center text-base font-medium text-neutral-700 transition hover:bg-neutral-200/60 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
            >
              Sign in
            </Link>
            <Link
              href="/login?mode=signup"
              onClick={onNavigate}
              className="rounded-full bg-neutral-900 px-4 py-2 text-center text-base font-medium text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
            >
              Sign up
            </Link>
          </div>
        )}
      </div>

      {invitingPlaylist && (
        <InviteCollaboratorModal
          playlist={invitingPlaylist}
          onClose={() => setInvitingPlaylist(null)}
        />
      )}
    </div>
  );
}
