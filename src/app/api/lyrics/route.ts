import { NextRequest, NextResponse } from "next/server";
import { lookupLyrics } from "@/lib/lyrics/fetchLyrics";

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const artistName = params.get("artist");
  const trackName = params.get("track");
  const albumName = params.get("album") ?? undefined;
  const durationParam = params.get("duration");
  const durationSeconds = durationParam ? Number(durationParam) : undefined;

  if (!artistName || !trackName) {
    return NextResponse.json({ error: "Missing artist or track" }, { status: 400 });
  }

  try {
    const lyrics = await lookupLyrics({ artistName, trackName, albumName, durationSeconds });
    if (!lyrics) {
      return NextResponse.json({ error: "Lyrics not found" }, { status: 404 });
    }
    return NextResponse.json(lyrics);
  } catch (error) {
    console.error("lrclib lookup error:", error);
    return NextResponse.json({ error: "Failed to fetch lyrics" }, { status: 502 });
  }
}
