"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { subscribeUserChordVersions, deleteChordVersion } from "@/lib/firestore/chordVersions";
import { ChordVersion } from "@/lib/firestore/types";
import { useAuth } from "@/contexts/AuthContext";
import Artwork from "@/components/ui/Artwork";

interface Props {
  uid: string;
}

export default function UserChordsSection({ uid }: Props) {
  const { user } = useAuth();
  const isOwner = user?.uid === uid;

  const [versions, setVersions] = useState<ChordVersion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    return subscribeUserChordVersions(uid, (v) => {
      setVersions(v);
      setIsLoading(false);
    });
  }, [uid]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      await deleteChordVersion(id);
      setConfirmId(null);
    } finally {
      setDeletingId(null);
    }
  }

  if (isLoading || versions.length === 0) return null;

  return (
    <div className="mt-8">
      <h2 className="mb-3 text-base font-semibold text-neutral-900 dark:text-neutral-100">
        Chord Contributions
      </h2>
      <div className="overflow-hidden rounded-xl border border-neutral-200 dark:border-neutral-800">
        {versions.map((v, i) => (
          <div
            key={v.id}
            className={`flex items-center gap-3 px-4 py-3 ${
              i > 0 ? "border-t border-neutral-200 dark:border-neutral-800" : ""
            }`}
          >
            {/* Artwork — tapping navigates to the song */}
            <Link href={`/search?songId=${v.songId}&versionId=${v.id}`} className="flex-shrink-0">
              <Artwork
                src={v.songArtwork}
                alt={v.songTitle ?? ""}
                size={44}
                rounded="md"
              />
            </Link>

            {/* Title + artist — tapping navigates to the song */}
            <Link
              href={`/search?songId=${v.songId}&versionId=${v.id}`}
              className="flex min-w-0 flex-1 flex-col gap-0.5"
            >
              <span className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
                {v.songTitle ?? `Song ${v.songId}`}
              </span>
              {v.songArtist && (
                <span className="truncate text-xs text-neutral-500 dark:text-neutral-400">
                  {v.songArtist}
                </span>
              )}
            </Link>

            {/* Actions */}
            <div className="flex flex-shrink-0 items-center gap-2">
              {v.likes > 0 && (
                <span className="text-xs text-neutral-400 dark:text-neutral-500">♥ {v.likes}</span>
              )}

              {isOwner && confirmId !== v.id && (
                <button
                  onClick={() => setConfirmId(v.id)}
                  className="rounded-full border border-neutral-200 px-2.5 py-1 text-xs text-red-500 transition hover:border-red-200 hover:bg-red-50 dark:border-neutral-700 dark:hover:border-red-800 dark:hover:bg-red-950"
                >
                  Delete
                </button>
              )}
              {isOwner && confirmId === v.id && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-neutral-400">Sure?</span>
                  <button
                    onClick={() => handleDelete(v.id)}
                    disabled={deletingId === v.id}
                    className="rounded-full bg-red-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-50"
                  >
                    {deletingId === v.id ? "…" : "Yes"}
                  </button>
                  <button
                    onClick={() => setConfirmId(null)}
                    className="text-xs text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
                  >
                    No
                  </button>
                </div>
              )}

              <Link href={`/search?songId=${v.songId}&versionId=${v.id}`}>
                <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-neutral-300 dark:text-neutral-600">
                  <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 0 1 0-1.06L10.94 10 7.21 6.29a.75.75 0 0 1 1.06-1.06l4.25 4.25a.75.75 0 0 1 0 1.06l-4.25 4.25a.75.75 0 0 1-1.06 0Z" clipRule="evenodd" />
                </svg>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
