import { NextRequest, NextResponse } from "next/server";
import { lookupSongById } from "@/lib/itunes/fetchItunes";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const results = await lookupSongById(id);
    const song = results.songs[0];
    if (!song) {
      return NextResponse.json({ error: "Song not found" }, { status: 404 });
    }
    return NextResponse.json(song);
  } catch (error) {
    console.error("iTunes lookup error:", error);
    return NextResponse.json(
      { error: "Failed to fetch song" },
      { status: 502 }
    );
  }
}
