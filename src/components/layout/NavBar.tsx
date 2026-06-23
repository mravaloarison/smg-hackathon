"use client";

import Link from "next/link";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { signOutUser } from "@/lib/firebase/auth";
import ThemeToggle from "@/components/theme/ThemeToggle";
import Artwork from "@/components/ui/Artwork";

export default function NavBar() {
  const { user, profile, isLoading } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

  async function handleSignOut() {
    setIsSigningOut(true);
    try {
      await signOutUser();
    } finally {
      setIsSigningOut(false);
    }
  }

  return (
    <header className="sticky top-0 z-20 border-b border-neutral-200 bg-white/90 backdrop-blur dark:border-neutral-800 dark:bg-neutral-950/90">
      <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3">
        <Link href="/" className="text-base font-bold text-neutral-900 dark:text-neutral-100">
          Nadia
        </Link>

        <nav className="flex items-center gap-4 text-sm font-medium text-neutral-600 dark:text-neutral-300">
          {!isLoading && user && (
            <>
              <Link href="/playlists" className="hover:text-neutral-900 dark:hover:text-neutral-100">
                Playlists
              </Link>
              <Link href="/people" className="hover:text-neutral-900 dark:hover:text-neutral-100">
                People
              </Link>
              <Link
                href="/profile"
                className="flex items-center gap-2 hover:text-neutral-900 dark:hover:text-neutral-100"
              >
                <Artwork
                  src={profile?.photoURL ?? undefined}
                  alt={profile?.username ?? "Profile"}
                  size={28}
                  rounded="full"
                />
                <span className="hidden sm:inline">{profile?.username ?? "Profile"}</span>
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                disabled={isSigningOut}
                className="rounded-full px-3 py-1.5 text-neutral-600 transition hover:bg-neutral-100 disabled:opacity-50 dark:text-neutral-300 dark:hover:bg-neutral-800"
              >
                Sign out
              </button>
            </>
          )}
          {!isLoading && !user && (
            <Link
              href="/login"
              className="rounded-full bg-neutral-900 px-4 py-1.5 text-white transition hover:bg-neutral-700 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
            >
              Sign in
            </Link>
          )}
          <ThemeToggle inline />
        </nav>
      </div>
    </header>
  );
}
