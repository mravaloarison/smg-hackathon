"use client";

import { FormEvent, useState } from "react";

interface CreatePlaylistFormProps {
  onCreate: (name: string) => void | Promise<void>;
  isSubmitting?: boolean;
}

export default function CreatePlaylistForm({
  onCreate,
  isSubmitting = false,
}: CreatePlaylistFormProps) {
  const [name, setName] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate(name.trim());
    setName("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <input
        type="text"
        required
        placeholder="New playlist name..."
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="flex-1 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm text-neutral-900 outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-700"
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
      >
        Create
      </button>
    </form>
  );
}
