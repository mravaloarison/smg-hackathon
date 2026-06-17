import { NextRequest, NextResponse } from "next/server";
import { lookupArtistById } from "@/lib/itunes/fetchItunes";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const detail = await lookupArtistById(id);
    if (!detail) {
      return NextResponse.json({ error: "Artist not found" }, { status: 404 });
    }
    return NextResponse.json(detail);
  } catch (error) {
    console.error("iTunes artist lookup error:", error);
    return NextResponse.json(
      { error: "Failed to fetch artist" },
      { status: 502 }
    );
  }
}
