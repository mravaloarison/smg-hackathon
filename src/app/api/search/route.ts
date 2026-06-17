import { NextRequest, NextResponse } from "next/server";
import { searchItunes } from "@/lib/itunes/fetchItunes";
import { SearchType } from "@/lib/itunes/types";

const VALID_TYPES: SearchType[] = ["all", "song", "album", "artist"];

export async function GET(request: NextRequest) {
  const term = request.nextUrl.searchParams.get("term") ?? "";
  const typeParam = request.nextUrl.searchParams.get("type") ?? "all";
  const type = VALID_TYPES.includes(typeParam as SearchType)
    ? (typeParam as SearchType)
    : "all";

  try {
    const results = await searchItunes(term, type);
    return NextResponse.json(results);
  } catch (error) {
    console.error("iTunes search error:", error);
    return NextResponse.json(
      { error: "Failed to fetch search results" },
      { status: 502 }
    );
  }
}
