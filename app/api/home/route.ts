import { NextResponse } from "next/server";
import { getHomeFeed } from "@/lib/ytmusic";

export const revalidate = 1800; // 30 minutes

export async function GET() {
  try {
    const sections = await getHomeFeed();
    return NextResponse.json({ sections });
  } catch (err) {
    console.error("home feed error", err);
    return NextResponse.json({ sections: [] }, { status: 200 });
  }
}
