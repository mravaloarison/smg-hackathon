import { NextRequest, NextResponse } from "next/server";
import { lookupAlbumById } from "@/lib/itunes/fetchItunes";

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const detail = await lookupAlbumById(id);
    if (!detail) {
      return NextResponse.json({ error: "Album not found" }, { status: 404 });
    }
    return NextResponse.json(detail);
  } catch (error) {
    console.error("iTunes album lookup error:", error);
    return NextResponse.json(
      { error: "Failed to fetch album" },
      { status: 502 }
    );
  }
}
