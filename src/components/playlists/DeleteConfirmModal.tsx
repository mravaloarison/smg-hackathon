"use client";

interface DeleteConfirmModalProps {
  playlistName: string;
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onCancel: () => void;
  title?: string;
  body?: string;
  confirmLabel?: string;
  loadingLabel?: string;
  variant?: "red" | "neutral";
}

export default function DeleteConfirmModal({
  playlistName,
  isLoading = false,
  onConfirm,
  onCancel,
  title = "Delete playlist",
  body,
  confirmLabel = "Delete",
  loadingLabel = "Deleting…",
  variant = "red",
}: DeleteConfirmModalProps) {
  const defaultBody = `Are you sure you want to delete "${playlistName}"? This action cannot be undone.`;
  const confirmBtnClass =
    variant === "red"
      ? "rounded-full bg-red-600 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-red-700 disabled:opacity-50 dark:bg-red-700 dark:hover:bg-red-600"
      : "rounded-full bg-neutral-900 px-4 py-2 text-center text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50 dark:bg-neutral-100 dark:text-neutral-900 dark:hover:bg-neutral-300";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-sm rounded-2xl border border-neutral-200 bg-white p-6 shadow-xl dark:border-neutral-800 dark:bg-neutral-950">
        <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-full bg-red-100 dark:bg-red-950">
          <svg viewBox="0 0 20 20" fill="currentColor" className="h-5 w-5 text-red-600 dark:text-red-400" aria-hidden="true">
            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.808a2.75 2.75 0 0 0 2.74-2.53l.841-10.519.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clipRule="evenodd" />
          </svg>
        </div>
        <h2 className="mb-1 text-base font-semibold text-neutral-900 dark:text-neutral-100">
          {title}
        </h2>
        <p className="mb-6 text-sm text-neutral-500 dark:text-neutral-400">
          {body ?? defaultBody}
        </p>
        <div className="flex flex-col gap-2">
          <button type="button" onClick={onConfirm} disabled={isLoading} className={confirmBtnClass}>
            {isLoading ? loadingLabel : confirmLabel}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-full border border-neutral-200 px-4 py-2 text-center text-sm font-medium text-neutral-700 transition hover:bg-neutral-100 dark:border-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-800"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
