import { NextRequest, NextResponse } from "next/server";
import { getLyrics } from "@/lib/lyrics";

export async function GET(
  _req: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const lyrics = await getLyrics(params.videoId);
    return NextResponse.json(lyrics);
  } catch (err) {
    console.error("lyrics error", err);
    return NextResponse.json({ synced: false, lines: [] }, { status: 200 });
  }
}
