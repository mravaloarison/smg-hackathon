import { Suspense } from "react";
import SearchClient from "@/components/search/SearchClient";

export default function SearchPage() {
  return (
    <Suspense>
      <SearchClient />
    </Suspense>
  );
}
