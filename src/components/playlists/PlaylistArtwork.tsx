import { Playlist } from "@/lib/firestore/types";

interface PlaylistArtworkProps {
  playlist: Playlist;
  size?: number;
}

export default function PlaylistArtwork({ playlist, size = 56 }: PlaylistArtworkProps) {
  const artworks = [
    ...new Map(
      playlist.songs
        .filter((s) => s.artworkUrl)
        .map((s) => [s.artworkUrl, s.artworkUrl])
    ).values(),
  ].slice(0, 4) as string[];

  const count = artworks.length;
  const sizeClass = `h-[${size}px] w-[${size}px]`;

  if (count === 0) {
    return (
      <div
        className="flex flex-shrink-0 items-center justify-center rounded-lg bg-neutral-200 dark:bg-neutral-700"
        style={{ height: size, width: size }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-neutral-400 dark:text-neutral-500"
          style={{ height: size * 0.5, width: size * 0.5 }}
          aria-hidden="true"
        >
          <path d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" />
        </svg>
      </div>
    );
  }

  if (count === 1) {
    return (
      <img
        src={artworks[0]}
        alt=""
        className="flex-shrink-0 rounded-lg object-cover"
        style={{ height: size, width: size }}
      />
    );
  }

  const cells = [artworks[0], artworks[1], artworks[2] ?? null, artworks[3] ?? null];

  return (
    <div
      className="flex-shrink-0 grid grid-cols-2 gap-px overflow-hidden rounded-lg"
      style={{ height: size, width: size }}
    >
      {cells.map((url, i) =>
        url ? (
          <img key={i} src={url} alt="" className="h-full w-full object-cover" />
        ) : (
          <div key={i} className="bg-neutral-200 dark:bg-neutral-700" />
        )
      )}
    </div>
  );
}
