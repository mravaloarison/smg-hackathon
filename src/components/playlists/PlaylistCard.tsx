import Link from "next/link";
import { Playlist } from "@/lib/firestore/types";

interface PlaylistCardProps {
  playlist: Playlist;
}

export default function PlaylistCard({ playlist }: PlaylistCardProps) {
  return (
    <Link
      href={`/playlists/${playlist.id}`}
      className="flex flex-col gap-1 rounded-lg p-3 transition hover:bg-neutral-100 dark:hover:bg-neutral-800"
    >
      <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
        {playlist.name}
      </p>
      <p className="text-xs text-neutral-500 dark:text-neutral-400">
        {playlist.songs.length} {playlist.songs.length === 1 ? "song" : "songs"}
      </p>
    </Link>
  );
}
