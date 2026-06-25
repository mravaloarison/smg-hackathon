import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";

// ── LRCLib ────────────────────────────────────────────────────────────────────

interface LrcLibTrack {
  instrumental: boolean;
  plainLyrics: string | null;
  syncedLyrics: string | null;
}

function extractPlainText(track: LrcLibTrack): string | null {
  if (track.instrumental) return "";
  const plain = track.plainLyrics?.trim();
  if (plain) return plain;
  const synced = track.syncedLyrics?.trim();
  if (synced) {
    const stripped = synced
      .split("\n")
      .map((l) => l.replace(/^\[\d+:\d+\.\d+\]\s*/, "").trim())
      .join("\n")
      .trim();
    return stripped || null;
  }
  return null;
}

async function fetchFromLrcLib(
  title: string,
  artist: string,
  albumName?: string
): Promise<string | null> {
  const headers = { "Lrclib-Client": "smg-hackathon" };

  // Exact match first
  const getParams = new URLSearchParams({ track_name: title, artist_name: artist });
  if (albumName) getParams.set("album_name", albumName);
  try {
    const res = await fetch(`https://lrclib.net/api/get?${getParams}`, { headers });
    if (res.ok) {
      const lyrics = extractPlainText(await res.json() as LrcLibTrack);
      if (lyrics !== null) return lyrics;
    }
  } catch { /* fall through */ }

  // Fuzzy search fallback
  try {
    const searchParams = new URLSearchParams({ track_name: title, artist_name: artist });
    const res = await fetch(`https://lrclib.net/api/search?${searchParams}`, { headers });
    if (res.ok) {
      const results = await res.json() as LrcLibTrack[];
      for (const track of results) {
        const lyrics = extractPlainText(track);
        if (lyrics !== null) return lyrics;
      }
    }
  } catch { /* fall through */ }

  return null;
}

function parsePlainLyrics(plain: string) {
  if (!plain) return [{ name: "Lyrics", lines: [{ lyrics: "" }] }];
  const paragraphs = plain.split(/\n\n+/).filter((p) => p.trim());
  if (paragraphs.length <= 1) {
    return [{ name: "Lyrics", lines: plain.split("\n").map((l) => ({ lyrics: l })) }];
  }
  return paragraphs.map((para, i) => ({
    name: `Part ${i + 1}`,
    lines: para.split("\n").map((l) => ({ lyrics: l })),
  }));
}

// ── Gemini ────────────────────────────────────────────────────────────────────

const lyricsJsonSchema = {
  type: "object",
  properties: {
    song_info: {
      type: "object",
      properties: {
        title: { type: "string" },
        artist: { type: "string" },
        key: { type: "string" },
        tempo: { type: "string" },
        capo: { type: "integer" },
        instruments: { type: "array", items: { type: "string" } },
      },
      required: ["title", "artist"],
    },
    sections: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          lines: {
            type: "array",
            items: {
              type: "object",
              properties: { lyrics: { type: "string" } },
              required: ["lyrics"],
            },
          },
        },
        required: ["name", "lines"],
      },
    },
  },
  required: ["song_info", "sections"],
};

function buildGeminiPrompt(title: string, artist: string, albumName?: string): string {
  return `You are a music expert. Provide the complete lyrics for the song "${title}" by "${artist}"${albumName ? ` from the album "${albumName}"` : ""}.

Include every section in order: Intro, Verse 1, Pre-Chorus, Chorus, Verse 2, Bridge, Outro, etc.
For instrumental sections set "lyrics" to "".
Return only the JSON.`;
}

// ── Route ─────────────────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  const apiKey = process.env.GEMINI_API_KEY;
  const body = await req.json() as { title?: string; artist?: string; albumName?: string };
  const { title, artist, albumName } = body;

  if (!title || !artist) {
    return NextResponse.json({ error: "title and artist are required" }, { status: 400 });
  }

  // 1. Try LRCLib
  const plain = await fetchFromLrcLib(title, artist, albumName);
  if (plain !== null) {
    return NextResponse.json({
      source: "lrclib",
      song_info: { title, artist },
      sections: parsePlainLyrics(plain),
    });
  }

  // 2. Fall back to Gemini
  if (!apiKey) {
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }

  try {
    const client = new GoogleGenAI({ apiKey });
    const interaction = await client.models.generateContent({
      model: "gemini-2.5-flash",
      contents: buildGeminiPrompt(title, artist, albumName),
      config: { responseMimeType: "application/json", responseSchema: lyricsJsonSchema },
    });
    const text = interaction.text;
    if (!text) return NextResponse.json({ error: "not_found" }, { status: 404 });

    return NextResponse.json({ source: "gemini", ...JSON.parse(text) });
  } catch (err) {
    console.error("[Gemini] Error:", err);
    return NextResponse.json({ error: "not_found" }, { status: 404 });
  }
}
