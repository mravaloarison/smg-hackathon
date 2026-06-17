interface ErrorMessageProps {
  message?: string;
}

export default function ErrorMessage({
  message = "Something went wrong. Please try again.",
}: ErrorMessageProps) {
  return (
    <div className="flex items-center justify-center py-16">
      <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
        {message}
      </p>
    </div>
  );
}
