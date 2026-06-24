import { Suspense } from "react";
import Link from "next/link";
import ThemeToggle from "@/components/theme/ThemeToggle";
import SidebarContent from "@/components/layout/SidebarContent";

export default function Sidebar() {
  return (
    <aside className="sticky top-3 m-3 hidden h-[calc(100vh-1.5rem)] w-72 flex-shrink-0 flex-col gap-6 overflow-y-auto rounded-2xl border border-neutral-200 bg-neutral-50 px-3 py-5 dark:border-neutral-800 dark:bg-neutral-900 md:flex">
      <div className="flex items-center justify-between px-2">
        <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-neutral-900 dark:text-neutral-100">
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-7 w-7 text-violet-500" aria-hidden="true">
            <path d="M19.952 1.651a.75.75 0 0 1 .298.599V16.303a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.403-4.909l2.311-.66a1.5 1.5 0 0 0 1.088-1.442V6.994l-9 2.572v9.737a3 3 0 0 1-2.176 2.884l-1.32.377a2.553 2.553 0 1 1-1.402-4.909l2.31-.66a1.5 1.5 0 0 0 1.088-1.442V5.25a.75.75 0 0 1 .544-.721l10.5-3a.75.75 0 0 1 .658.122Z" />
          </svg>
          Aria
        </Link>
        <ThemeToggle inline />
      </div>
      <Suspense>
        <SidebarContent />
      </Suspense>
    </aside>
  );
}
