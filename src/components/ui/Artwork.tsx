"use client";

import { useState } from "react";

interface ArtworkProps {
  src?: string;
  alt: string;
  size?: number;
  fluid?: boolean;
  rounded?: "none" | "md" | "full";
  className?: string;
}

const ROUNDED_CLASS: Record<NonNullable<ArtworkProps["rounded"]>, string> = {
  none: "rounded-none",
  md: "rounded-lg",
  full: "rounded-full",
};

export default function Artwork({
  src,
  alt,
  size = 64,
  fluid = false,
  rounded = "md",
  className = "",
}: ArtworkProps) {
  const [failed, setFailed] = useState(false);
  const showPlaceholder = !src || failed;

  return (
    <div
      style={fluid ? undefined : { width: size, height: size }}
      className={`overflow-hidden bg-neutral-200 dark:bg-neutral-800 ${
        fluid ? "w-full aspect-square" : "flex-shrink-0"
      } ${ROUNDED_CLASS[rounded]} ${className}`}
    >
      {showPlaceholder ? (
        <div className="flex h-full w-full items-center justify-center text-neutral-400 dark:text-neutral-500">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="h-1/2 w-1/2"
            aria-hidden="true"
          >
            <path d="M12 3v10.55A4 4 0 1 0 14 17V7h4V3h-6z" />
          </svg>
        </div>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}
