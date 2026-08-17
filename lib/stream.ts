import ytdl from "@distube/ytdl-core";

/**
 * Resolves the best audio-only format for a given YouTube/YT Music video.
 * We intentionally pick an audio-only itag (no video track) to minimize
 * bandwidth — this is what powers ArchBeat's actual playback.
 */
export async function getAudioFormat(videoId: string) {
  const url = `https://music.youtube.com/watch?v=${videoId}`;
  const info = await ytdl.getInfo(url);

  const format = ytdl.chooseFormat(info.formats, {
    quality: "highestaudio",
    filter: "audioonly",
  });

  if (!format) {
    throw new Error("No audio-only format available for this track");
  }

  return { format, info };
}
