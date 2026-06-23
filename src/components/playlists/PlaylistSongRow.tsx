import Link from "next/link";
import Artwork from "@/components/ui/Artwork";
import { PlaylistSong } from "@/lib/firestore/types";

interface PlaylistSongRowProps {
  song: PlaylistSong;
  onRemove?: (song: PlaylistSong) => void;
}

export default function PlaylistSongRow({ song, onRemove }: PlaylistSongRowProps) {
  return (
    <div className="flex items-center gap-3 rounded-lg p-2 transition hover:bg-neutral-100 dark:hover:bg-neutral-800">
      <Link href={`/?songId=${song.id}`} className="flex min-w-0 flex-1 items-center gap-3">
        <Artwork src={song.artworkUrl} alt={song.title} size={56} />
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {song.title}
          </p>
          <p className="truncate text-xs text-neutral-500 dark:text-neutral-400">
            {song.artistName}
            {song.albumName ? ` — ${song.albumName}` : ""}
          </p>
        </div>
      </Link>
      {onRemove && (
        <button
          type="button"
          onClick={() => onRemove(song)}
          aria-label={`Remove ${song.title} from playlist`}
          className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-700 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4" aria-hidden="true">
            <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
          </svg>
        </button>
      )}
    </div>
  );
}
