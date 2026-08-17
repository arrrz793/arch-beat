export interface Thumbnail {
  url: string;
  width: number;
  height: number;
}

export interface Track {
  videoId: string;
  name: string;
  artist: string;
  artistId?: string | null;
  album?: string | null;
  duration?: number | null; // seconds
  thumbnail: string;
}

export interface AlbumSummary {
  albumId: string;
  name: string;
  artist: string;
  thumbnail: string;
}

export interface PlaylistSummary {
  playlistId: string;
  name: string;
  subtitle?: string;
  thumbnail: string;
}

export interface ArtistSummary {
  artistId: string;
  name: string;
  thumbnail: string;
}

export type SearchCategory = "song" | "video" | "album" | "playlist" | "artist";

export interface SearchResults {
  songs: Track[];
  albums: AlbumSummary[];
  playlists: PlaylistSummary[];
  artists: ArtistSummary[];
}

export interface HomeSection {
  title: string;
  items: (Track | AlbumSummary | PlaylistSummary)[];
  kind: "track" | "album" | "playlist";
}

export interface LyricsLine {
  time: number | null; // seconds, null when unsynced
  text: string;
}

export interface LyricsResponse {
  synced: boolean;
  lines: LyricsLine[];
  source?: string;
}

export type RepeatMode = "off" | "all" | "one";
