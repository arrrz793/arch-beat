import { NextRequest, NextResponse } from "next/server";
import { searchAll } from "@/lib/ytmusic";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim();
  if (!q) {
    return NextResponse.json({ songs: [], albums: [], playlists: [], artists: [] });
  }

  try {
    const results = await searchAll(q);
    return NextResponse.json(results);
  } catch (err) {
    console.error("search error", err);
    return NextResponse.json(
      { songs: [], albums: [], playlists: [], artists: [], error: "search_failed" },
      { status: 200 }
    );
  }
}
