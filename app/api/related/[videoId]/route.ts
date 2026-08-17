import { NextRequest, NextResponse } from "next/server";
import { getRelated } from "@/lib/ytmusic";

export async function GET(
  _req: NextRequest,
  { params }: { params: { videoId: string } }
) {
  try {
    const tracks = await getRelated(params.videoId);
    return NextResponse.json({ tracks });
  } catch (err) {
    console.error("related error", err);
    return NextResponse.json({ tracks: [] }, { status: 200 });
  }
}
