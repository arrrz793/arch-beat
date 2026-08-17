import type { LyricsResponse, LyricsLine } from "@/types";

/**
 * Fetches lyrics straight from YouTube Music's internal `/youtubei/v1`
 * endpoints — the same private API `ytmusic-api` itself is built on.
 * We talk to it directly here because timed/synced lyrics (the
 * line-by-line, karaoke-style highlight seen in the reference app) are
 * exposed via `timedLyricsRenderer`, which most lyric wrappers ignore in
 * favour of the plain-text `musicDescriptionShelfRenderer`.
 *
 * No API key is required — YT Music's web client ships a public,
 * unauthenticated "innertube" key that Google itself uses client-side.
 */

const INNERTUBE_KEY = "AIzaSyC9XL3ZjWddXya6X74dJoCTL-WEYFDNX30";
const INNERTUBE_CLIENT_VERSION = "1.20241014.01.00";
const BASE = "https://music.youtube.com/youtubei/v1";

const context = {
  client: {
    clientName: "WEB_REMIX",
    clientVersion: INNERTUBE_CLIENT_VERSION,
    hl: "id",
    gl: "ID",
  },
};

async function innertube(endpoint: string, body: Record<string, unknown>) {
  const res = await fetch(`${BASE}/${endpoint}?key=${INNERTUBE_KEY}&prettyPrint=false`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Origin: "https://music.youtube.com",
      Referer: "https://music.youtube.com/",
    },
    body: JSON.stringify({ context, ...body }),
    // Lyrics don't change per-request; cache briefly at the edge/server.
    next: { revalidate: 60 * 60 },
  });
  if (!res.ok) throw new Error(`innertube ${endpoint} failed: ${res.status}`);
  return res.json();
}

function findBrowseId(nextResponse: any): { browseId: string; params?: string } | null {
  try {
    const tabs =
      nextResponse?.contents?.singleColumnMusicWatchNextResultsRenderer
        ?.tabbedRenderer?.watchNextTabbedResultsRenderer?.tabs ?? [];
    for (const tab of tabs) {
      const renderer = tab?.tabRenderer;
      if (renderer?.title === "Lyrics" || renderer?.icon?.iconType === "LYRICS") {
        const endpoint = renderer?.endpoint?.browseEndpoint;
        if (endpoint?.browseId) {
          return { browseId: endpoint.browseId, params: endpoint.params };
        }
      }
    }
  } catch {
    /* fall through */
  }
  return null;
}

function parseTimedLyrics(browseResponse: any): LyricsLine[] | null {
  try {
    const renderer =
      browseResponse?.contents?.elementRenderer?.newElement?.type?.componentType
        ?.model?.timedLyricsModel?.lyricsData ??
      browseResponse?.contents?.sectionListRenderer?.contents?.[0]
        ?.musicTimedLyricsRenderer;

    // Newer responses nest cues under `timedLyricsData`.
    const cues =
      renderer?.timedLyricsData ??
      browseResponse?.contents?.elementRenderer?.newElement?.type?.componentType
        ?.model?.timedLyricsModel?.lyricsData?.timedLyricsData;

    if (!Array.isArray(cues) || cues.length === 0) return null;

    return cues
      .map((cue: any): LyricsLine | null => {
        const text = cue?.lyricLine ?? cue?.cueRange?.text ?? cue?.text;
        const startMs =
          cue?.cueRange?.startTimeMilliseconds ?? cue?.startTimeMilliseconds;
        if (!text) return null;
        return {
          text: String(text).trim(),
          time: startMs != null ? Number(startMs) / 1000 : null,
        };
      })
      .filter((l): l is LyricsLine => !!l && l.text.length > 0);
  } catch {
    return null;
  }
}

function parsePlainLyrics(browseResponse: any): LyricsLine[] | null {
  try {
    const shelf =
      browseResponse?.contents?.sectionListRenderer?.contents?.[0]
        ?.musicDescriptionShelfRenderer;
    const runs = shelf?.description?.runs;
    if (!Array.isArray(runs)) return null;
    const text = runs.map((r: any) => r.text).join("");
    return text
      .split("\n")
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .map((line: string) => ({ text: line, time: null as number | null }));
  } catch {
    return null;
  }
}

/** In-memory cache: lyrics rarely change, video restarts clear it (fine). */
const cache = new Map<string, LyricsResponse>();

export async function getLyrics(videoId: string): Promise<LyricsResponse> {
  const cached = cache.get(videoId);
  if (cached) return cached;

  try {
    const next = await innertube("next", {
      videoId,
      isAudioOnly: true,
    });

    const lyricsTab = findBrowseId(next);
    if (!lyricsTab) {
      const empty: LyricsResponse = { synced: false, lines: [] };
      return empty;
    }

    const browse = await innertube("browse", {
      browseId: lyricsTab.browseId,
      params: lyricsTab.params,
    });

    const timed = parseTimedLyrics(browse);
    if (timed && timed.some((l) => l.time != null)) {
      const result: LyricsResponse = { synced: true, lines: timed, source: "YouTube Music" };
      cache.set(videoId, result);
      return result;
    }

    const plain = parsePlainLyrics(browse) ?? timed;
    const result: LyricsResponse = {
      synced: false,
      lines: plain ?? [],
      source: "YouTube Music",
    };
    cache.set(videoId, result);
    return result;
  } catch (err) {
    console.error("getLyrics failed", err);
    return { synced: false, lines: [] };
  }
}
