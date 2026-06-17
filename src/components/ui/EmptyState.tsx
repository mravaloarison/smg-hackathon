interface EmptyStateProps {
  title: string;
  description?: string;
}

export default function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-1 py-16 text-center">
      <p className="text-base font-medium text-neutral-700 dark:text-neutral-200">
        {title}
      </p>
      {description && (
        <p className="text-sm text-neutral-500 dark:text-neutral-400">
          {description}
        </p>
      )}
    </div>
  );
}
