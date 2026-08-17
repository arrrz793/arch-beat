import { NextRequest } from "next/server";
import ytdl from "@distube/ytdl-core";
import { getAudioFormat } from "@/lib/stream";

// ytdl-core needs real Node.js (streams, https), so this route cannot run
// on the Edge runtime.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: { videoId: string } }
) {
  const { videoId } = params;
  if (!videoId || !ytdl.validateID(videoId)) {
    return new Response("Invalid video id", { status: 400 });
  }

  try {
    const { format } = await getAudioFormat(videoId);
    const totalSize = format.contentLength ? parseInt(format.contentLength, 10) : undefined;
    const range = req.headers.get("range");

    let start = 0;
    let end = totalSize ? totalSize - 1 : undefined;
    let status = 200;

    if (range && totalSize) {
      const match = /bytes=(\d+)-(\d*)/.exec(range);
      if (match) {
        start = parseInt(match[1], 10);
        end = match[2] ? parseInt(match[2], 10) : totalSize - 1;
        status = 206;
      }
    }

    const nodeStream = ytdl.downloadFromInfo(
      await ytdl.getInfo(`https://music.youtube.com/watch?v=${videoId}`),
      {
        format,
        range: totalSize ? { start, end: end as number } : undefined,
      }
    );

    const webStream = new ReadableStream({
      start(controller) {
        nodeStream.on("data", (chunk: Buffer) => controller.enqueue(chunk));
        nodeStream.on("end", () => controller.close());
        nodeStream.on("error", (err) => controller.error(err));
      },
      cancel() {
        nodeStream.destroy();
      },
    });

    const headers: Record<string, string> = {
      "Content-Type": format.mimeType?.split(";")[0] ?? "audio/webm",
      "Accept-Ranges": "bytes",
      "Cache-Control": "public, max-age=604800, immutable",
    };

    if (totalSize) {
      headers["Content-Length"] = String((end as number) - start + 1);
      if (status === 206) {
        headers["Content-Range"] = `bytes ${start}-${end}/${totalSize}`;
      }
    }

    return new Response(webStream, { status, headers });
  } catch (err) {
    console.error("stream error", err);
    return new Response("Failed to load audio stream", { status: 502 });
  }
}
