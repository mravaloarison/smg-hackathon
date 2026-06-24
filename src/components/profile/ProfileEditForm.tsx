"use client";

import { FormEvent, useState } from "react";
import Artwork from "@/components/ui/Artwork";
import { UserProfile } from "@/lib/firestore/types";

interface ProfileEditFormProps {
  profile: UserProfile;
  onSave: (updates: { username: string; photoURL: string | null }) => void | Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export default function ProfileEditForm({
  profile,
  onSave,
  onCancel,
  isSubmitting = false,
}: ProfileEditFormProps) {
  const [username, setUsername] = useState(profile.username);
  const [photoURL, setPhotoURL] = useState(profile.photoURL ?? "");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    onSave({ username: username.trim(), photoURL: photoURL.trim() || null });
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto flex w-full max-w-sm flex-col gap-5">
      <div className="flex flex-col items-center gap-4">
        <Artwork src={photoURL || undefined} alt={username} size={100} rounded="full" />
        <input
          type="url"
          placeholder="Photo URL"
          value={photoURL}
          onChange={(e) => setPhotoURL(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-base text-neutral-900 outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-700"
        />
      </div>

      <label className="flex flex-col gap-1.5 text-base font-medium text-neutral-700 dark:text-neutral-300">
        Username
        <input
          type="text"
          required
          minLength={3}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="rounded-lg border border-neutral-300 bg-white px-4 py-2.5 text-base font-normal text-neutral-900 outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-700"
        />
      </label>

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-neutral-900 px-4 py-2.5 text-base font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          {isSubmitting ? "Saving..." : "Save changes"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-full border border-neutral-300 px-4 py-2.5 text-base font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
