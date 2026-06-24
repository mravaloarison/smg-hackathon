"use client";

import { FormEvent, useState } from "react";
import Artwork from "@/components/ui/Artwork";

interface Collaborator {
  uid: string;
  username: string;
  photoURL?: string | null;
}

interface PlaylistHeaderProps {
  name: string;
  createdAt?: number;
  ownerUsername?: string;
  collaborators?: Collaborator[];
  onRename: (newName: string) => void | Promise<void>;
  onDelete: () => void | Promise<void>;
  onInvite?: () => void;
  onRemoveCollaborator?: (uid: string) => void;
  isRenaming?: boolean;
  isDeleting?: boolean;
}

export default function PlaylistHeader({
  name,
  createdAt,
  ownerUsername,
  collaborators,
  onRename,
  onDelete,
  onInvite,
  onRemoveCollaborator,
  isRenaming = false,
  isDeleting = false,
}: PlaylistHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);

  function startEditing() {
    setDraftName(name);
    setIsEditing(true);
  }

  function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!draftName.trim()) return;
    onRename(draftName.trim());
    setIsEditing(false);
  }

  if (isEditing) {
    return (
      <form onSubmit={handleSave} className="mb-4 flex items-center gap-2">
        <input
          type="text"
          required
          autoFocus
          value={draftName}
          onChange={(e) => setDraftName(e.target.value)}
          className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xl font-bold text-neutral-900 outline-none focus:border-neutral-500 focus:ring-2 focus:ring-neutral-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:ring-neutral-700"
        />
        <button
          type="submit"
          disabled={isRenaming}
          className="rounded-full bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300"
        >
          Save
        </button>
        <button
          type="button"
          onClick={() => setIsEditing(false)}
          className="rounded-full border border-neutral-300 px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-700 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
          Cancel
        </button>
      </form>
    );
  }

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="mb-4 flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold text-neutral-900 dark:text-neutral-100">
            {name}
          </h1>
          {(formattedDate || ownerUsername) && (
            <p className="mt-0.5 text-sm text-neutral-500 dark:text-neutral-400">
              {ownerUsername && <span>by {ownerUsername} · </span>}
              {formattedDate && <span>Created {formattedDate}</span>}
            </p>
          )}
        </div>
        <div className="flex flex-shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={startEditing}
            aria-label="Rename playlist"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-neutral-400 dark:hover:bg-neutral-800 dark:hover:text-neutral-100"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path d="M5.433 13.917l1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 0 1-.65-.65Z" />
              <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
            </svg>
          </button>
          {onInvite && (
            <button
              type="button"
              onClick={onInvite}
              aria-label="Invite collaborator"
              title="Invite collaborator"
              className="flex h-9 w-9 items-center justify-center rounded-full text-violet-500 transition hover:bg-violet-50 hover:text-violet-600 dark:text-violet-400 dark:hover:bg-violet-950 dark:hover:text-violet-300"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
                <path d="M9 6a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM17.555 16.185a1 1 0 0 1-.887 1.312H3.332a1 1 0 0 1-.887-1.312l.347-1.107A4.003 4.003 0 0 1 6.613 12h6.774a4.003 4.003 0 0 1 3.821 2.878l.347 1.307ZM16 8a1 1 0 1 0-2 0v1h-1a1 1 0 1 0 0 2h1v1a1 1 0 1 0 2 0v-1h1a1 1 0 1 0 0-2h-1V8Z" />
              </svg>
            </button>
          )}
          <button
            type="button"
            onClick={() => setIsConfirmingDelete(true)}
            aria-label="Delete playlist"
            className="flex h-9 w-9 items-center justify-center rounded-full text-neutral-500 transition hover:bg-red-50 hover:text-red-600 dark:text-neutral-400 dark:hover:bg-red-950 dark:hover:text-red-400"
          >
            <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.808a2.75 2.75 0 0 0 2.74-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>

      {collaborators && collaborators.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
            Collaborators
          </span>
          <div className="flex flex-wrap gap-2">
            {collaborators.map((c) => (
              <div
                key={c.uid}
                className="flex items-center gap-2 rounded-full border border-neutral-200 bg-neutral-50 py-1 pl-1 pr-2.5 dark:border-neutral-700 dark:bg-neutral-800"
              >
                {c.photoURL ? (
                  <img
                    src={c.photoURL}
                    alt={c.username}
                    className="h-6 w-6 flex-shrink-0 rounded-full object-cover"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
                  />
                ) : (
                  <Artwork src={undefined} alt={c.username} size={24} rounded="full" />
                )}
                <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
                  {c.username}
                </span>
                {onRemoveCollaborator && (
                  <button
                    type="button"
                    onClick={() => onRemoveCollaborator(c.uid)}
                    aria-label={`Remove ${c.username}`}
                    className="ml-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-700 dark:text-neutral-500 dark:hover:bg-neutral-700 dark:hover:text-neutral-200"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-3 w-3" aria-hidden="true">
                      <path d="M6.28 5.22a.75.75 0 0 0-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 1 0 1.06 1.06L10 11.06l3.72 3.72a.75.75 0 1 0 1.06-1.06L11.06 10l3.72-3.72a.75.75 0 0 0-1.06-1.06L10 8.94 6.28 5.22Z" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {isConfirmingDelete && (
        <div className="flex items-center gap-3 rounded-lg bg-red-50 p-3 dark:bg-red-950">
          <p className="flex-1 text-sm text-red-700 dark:text-red-300">
            Delete this playlist? This can&apos;t be undone.
          </p>
          <button
            type="button"
            onClick={onDelete}
            disabled={isDeleting}
            className="rounded-full bg-red-600 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </button>
          <button
            type="button"
            onClick={() => setIsConfirmingDelete(false)}
            className="text-xs font-medium text-neutral-500 hover:underline dark:text-neutral-400"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
