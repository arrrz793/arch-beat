import YTMusic from "ytmusic-api";
import type {
  Track,
  AlbumSummary,
  PlaylistSummary,
  ArtistSummary,
  SearchResults,
  HomeSection,
} from "@/types";

/**
 * Singleton wrapper around the unofficial `ytmusic-api` client.
 *
 * `ytmusic-api` talks directly to the internal YouTube Music `/youtubei/v1`
 * endpoints (the same ones the official web client uses), so no API key is
 * required. We keep a single initialized instance per server process/edge
 * region and reuse it across requests.
 */

let clientPromise: Promise<YTMusic> | null = null;

function getClient(): Promise<YTMusic> {
  if (!clientPromise) {
    const ytm = new YTMusic();
    clientPromise = ytm.initialize().then(() => ytm);
  }
  return clientPromise;
}

function safeThumb(thumbnails?: { url: string }[] | null, fallback = ""): string {
  if (!thumbnails || thumbnails.length === 0) return fallback;
  // Prefer the largest thumbnail (last in the array from ytmusic-api).
  return thumbnails[thumbnails.length - 1].url;
}

function mapSong(raw: any): Track {
  return {
    videoId: raw.videoId,
    name: raw.name,
    artist: raw.artist?.name ?? raw.artists?.[0]?.name ?? "Unknown",
    artistId: raw.artist?.artistId ?? raw.artists?.[0]?.artistId ?? null,
    album: raw.album?.name ?? null,
    duration: raw.duration ?? null,
    thumbnail: safeThumb(raw.thumbnails),
  };
}

function mapAlbum(raw: any): AlbumSummary {
  return {
    albumId: raw.albumId,
    name: raw.name,
    artist: raw.artist?.name ?? raw.artists?.[0]?.name ?? "Unknown",
    thumbnail: safeThumb(raw.thumbnails),
  };
}

function mapPlaylist(raw: any): PlaylistSummary {
  return {
    playlistId: raw.playlistId,
    name: raw.name,
    subtitle: raw.artist?.name ?? raw.author?.name ?? undefined,
    thumbnail: safeThumb(raw.thumbnails),
  };
}

function mapArtist(raw: any): ArtistSummary {
  return {
    artistId: raw.artistId,
    name: raw.name,
    thumbnail: safeThumb(raw.thumbnails),
  };
}

export async function searchAll(query: string): Promise<SearchResults> {
  const ytm = await getClient();
  const [songs, albums, playlists, artists] = await Promise.all([
    ytm.searchSongs(query).catch(() => []),
    ytm.searchAlbums(query).catch(() => []),
    ytm.searchPlaylists(query).catch(() => []),
    ytm.searchArtists(query).catch(() => []),
  ]);

  return {
    songs: songs.map(mapSong),
    albums: albums.map(mapAlbum),
    playlists: playlists.map(mapPlaylist),
    artists: artists.map(mapArtist),
  };
}

export async function searchSongsOnly(query: string, limit = 25): Promise<Track[]> {
  const ytm = await getClient();
  const songs = await ytm.searchSongs(query).catch(() => []);
  return songs.slice(0, limit).map(mapSong);
}

/**
 * Builds the ArchBeat home feed. `ytmusic-api` doesn't expose YT Music's
 * personalized home shelves directly, so we compose a curated feed out of
 * mood/genre searches (mirrors the "Playlist trending komunitas" / genre
 * grid layout from the reference app) plus a couple of playlist searches.
 */
export async function getHomeFeed(): Promise<HomeSection[]> {
  const moodQueries: { title: string; query: string }[] = [
    { title: "Playlist trending komunitas", query: "playlist pop indonesia hits" },
    { title: "Lagu Indonesia Populer", query: "lagu indonesia populer 2026" },
    { title: "Santai & Chill", query: "lagu santai chill indonesia" },
    { title: "Sedih", query: "lagu galau sedih indonesia" },
  ];

  const sections = await Promise.all(
    moodQueries.map(async ({ title, query }) => {
      const ytm = await getClient();
      const songs = await ytm.searchSongs(query).catch(() => []);
      return {
        title,
        kind: "track" as const,
        items: songs.slice(0, 10).map(mapSong),
      };
    })
  );

  return sections.filter((s) => s.items.length > 0);
}

export async function getRelated(videoId: string, limit = 20): Promise<Track[]> {
  const ytm = await getClient();
  // ytmusic-api doesn't expose a direct "related" endpoint, so we fall back
  // to searching by the song's own title/artist for a similar-radio effect.
  const song = await ytm.getSong(videoId).catch(() => null);
  if (!song) return [];
  const query = `${song.name} ${song.artist?.name ?? ""}`.trim();
  const results = await ytm.searchSongs(query).catch(() => []);
  return results.filter((r) => r.videoId !== videoId).slice(0, limit).map(mapSong);
}

export async function getSongById(videoId: string): Promise<Track | null> {
  const ytm = await getClient();
  const song = await ytm.getSong(videoId).catch(() => null);
  if (!song) return null;
  return mapSong(song);
}
