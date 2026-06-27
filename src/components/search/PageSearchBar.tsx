"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import SearchBar from "@/components/search/SearchBar";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";

export default function PageSearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const hasConsumedFocusParam = useRef(false);

  const query = searchParams.get("q") ?? "";

  // Locally editable, but resynced from the URL when it changes externally
  // (a suggestion chip, browser back/forward). Adjusted during render
  // rather than in an effect, per React's guidance for syncing state with
  // a changing prop.
  const [lastSyncedQuery, setLastSyncedQuery] = useState(query);
  const [inputValue, setInputValue] = useState(query);
  if (query !== lastSyncedQuery) {
    setLastSyncedQuery(query);
    setInputValue(query);
  }

  const debouncedInput = useDebouncedValue(inputValue, 400);

  useEffect(() => {
    if (debouncedInput === query) return;

    // Replace (not push) so every settled keystroke doesn't pile up in
    // browser history -- only real navigations (opening a song/album/
    // artist) should be back-button stops.
    const params = new URLSearchParams(searchParams.toString());
    if (debouncedInput) params.set("q", debouncedInput);
    else params.delete("q");
    params.delete("songId");
    params.delete("albumId");
    params.delete("artistId");
    params.delete("playlistId");
    params.delete("index");
    params.delete("versionId");
    const queryString = params.toString();
    router.replace(queryString ? `/search?${queryString}` : "/search");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedInput]);

  // The sidebar/menu's "Search" link navigates to "/search?focus=search" so
  // the input gets focused on arrival, the way Apple Music's search tab does.
  useEffect(() => {
    if (hasConsumedFocusParam.current) return;
    if (searchParams.get("focus") !== "search") return;

    hasConsumedFocusParam.current = true;
    inputRef.current?.focus();

    const params = new URLSearchParams(searchParams.toString());
    params.delete("focus");
    const queryString = params.toString();
    router.replace(queryString ? `/search?${queryString}` : "/search");
  }, [searchParams, router]);

  return (
    <SearchBar
      ref={inputRef}
      value={inputValue}
      onChange={setInputValue}
      placeholder="Search songs, albums, or artists..."
    />
  );
}
