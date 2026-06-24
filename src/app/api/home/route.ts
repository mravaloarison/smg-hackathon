import { NextResponse } from "next/server";
import { fetchPopularArtists, fetchTopAlbums, fetchTopSongs } from "@/lib/itunes/charts";
import { HomeDiscovery } from "@/lib/itunes/types";

export async function GET() {
  try {
    const [trendingSongs, trendingAlbums, popularArtists] = await Promise.all([
      fetchTopSongs(10),
      fetchTopAlbums(10),
      fetchPopularArtists(),
    ]);

    const discovery: HomeDiscovery = { trendingSongs, trendingAlbums, popularArtists };
    return NextResponse.json(discovery);
  } catch (error) {
    console.error("Home discovery fetch error:", error);
    return NextResponse.json(
      { error: "Failed to fetch home discovery content" },
      { status: 502 }
    );
  }
}
