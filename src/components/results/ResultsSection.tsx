import { ReactNode } from "react";

interface ResultsSectionProps {
  title: string;
  children: ReactNode;
}

export default function ResultsSection({ title, children }: ResultsSectionProps) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        {title}
      </h2>
      {children}
    </section>
  );
}
