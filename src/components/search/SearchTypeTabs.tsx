"use client";

import { SearchType } from "@/lib/itunes/types";

interface SearchTypeTabsProps {
  value: SearchType;
  onChange: (type: SearchType) => void;
}

const TABS: { value: SearchType; label: string }[] = [
  { value: "all", label: "All" },
  { value: "song", label: "Songs" },
  { value: "album", label: "Albums" },
  { value: "artist", label: "Artists" },
];

export default function SearchTypeTabs({ value, onChange }: SearchTypeTabsProps) {
  return (
    <div className="flex gap-2 justify-center">
      {TABS.map((tab) => {
        const isActive = tab.value === value;
        return (
          <button
            key={tab.value}
            type="button"
            onClick={() => onChange(tab.value)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              isActive
                ? "bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900"
                : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
