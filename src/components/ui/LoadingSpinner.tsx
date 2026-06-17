export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12" role="status" aria-label="Loading">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-neutral-300 border-t-neutral-900 dark:border-neutral-700 dark:border-t-neutral-100" />
    </div>
  );
}
