"use client";

import { useEffect, useRef } from "react";
import { usePlayerStore } from "@/store/player";
import { useLibraryStore } from "@/store/library";
import type { Track } from "@/types";

/**
 * ArchBeat's playback core.
 *
 * This component is mounted once in the root layout (never unmounted while
 * the app is open), so the underlying <audio> element survives client-side
 * route changes. That — combined with the Media Session API wiring below —
 * is what keeps music playing when the user backgrounds the app, locks the
 * screen, or switches to another app:
 *
 *  - A real HTMLMediaElement keeps its audio focus/playback going in the
 *    background as long as JS doesn't pause it and the tab/WebView isn't
 *    killed. Chrome (and Chrome-based TWA wrappers used to build the APK)
 *    explicitly keep media playback alive in backgrounded tabs for this
 *    reason.
 *  - `navigator.mediaSession` gives the OS a lock-screen / notification
 *    "now playing" card with working prev/next/play/pause/seek controls,
 *    which is also what signals to Android that this is an active media
 *    session it should not suspend when the screen turns off.
 */
export default function AudioEngine() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const {
    queue,
    currentIndex,
    isPlaying,
    volume,
    muted,
    progress,
    setPlaying,
    setProgress,
    setDuration,
    setLoading,
    next,
    previous,
    seek,
  } = usePlayerStore();

  const track: Track | null = queue[currentIndex] ?? null;
  const addRecent = useLibraryStore((s) => s.addRecent);
  const enqueueRelated = usePlayerStore((s) => s.enqueueRelated);
  const repeat = usePlayerStore((s) => s.repeat);

  // --- Track recently played (for the Pustaka/Library tab) --------------
  useEffect(() => {
    if (track) addRecent(track);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track?.videoId]);

  // --- Auto-extend the queue with related tracks (endless "radio") ------
  useEffect(() => {
    if (!track || repeat !== "off") return;
    const remaining = queue.length - 1 - currentIndex;
    if (remaining > 1) return;
    fetch(`/api/related/${track.videoId}`)
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.tracks) && data.tracks.length > 0) {
          enqueueRelated(data.tracks);
        }
      })
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, track?.videoId]);

  // --- Load new source whenever the current track changes ---------------
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !track) return;

    const src = `/api/stream/${track.videoId}`;
    if (audio.dataset.videoId === track.videoId) return;

    audio.dataset.videoId = track.videoId;
    audio.src = src;
    audio.load();
    setLoading(true);

    if (isPlaying) {
      audio.play().catch(() => {
        /* Autoplay might be blocked until a user gesture; ignored. */
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [track?.videoId]);

  // --- Play / pause sync ---------------------------------------------------
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, [isPlaying]);

  // --- Volume / mute sync ---------------------------------------------------
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
  }, [volume, muted]);

  // --- External seek (from the progress bar) ---------------------------
  const seekRequest = useRef(progress);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (Math.abs(audio.currentTime - progress) > 1 && seekRequest.current !== progress) {
      audio.currentTime = progress;
    }
    seekRequest.current = progress;
  }, [progress]);

  // --- Media Session (lock screen + background playback signal) --------
  // Note: we deliberately do NOT use the Screen Wake Lock API here. Audio
  // playback via a real <audio> element + Media Session does not require
  // the screen to stay on — it keeps playing when the screen turns off,
  // which is exactly the behavior requested. Requesting a wake lock would
  // instead force the screen to stay on, which is the opposite of that.
  useEffect(() => {
    if (!("mediaSession" in navigator) || !track) return;

    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.name,
      artist: track.artist,
      album: track.album ?? "ArchBeat",
      artwork: [
        { src: track.thumbnail, sizes: "96x96", type: "image/jpeg" },
        { src: track.thumbnail, sizes: "256x256", type: "image/jpeg" },
        { src: track.thumbnail, sizes: "512x512", type: "image/jpeg" },
      ],
    });

    navigator.mediaSession.setActionHandler("play", () => setPlaying(true));
    navigator.mediaSession.setActionHandler("pause", () => setPlaying(false));
    navigator.mediaSession.setActionHandler("previoustrack", () => previous());
    navigator.mediaSession.setActionHandler("nexttrack", () => next());
    navigator.mediaSession.setActionHandler("seekto", (details) => {
      if (details.seekTime != null) seek(details.seekTime);
    });
    navigator.mediaSession.setActionHandler("seekbackward", (details) => {
      const audio = audioRef.current;
      if (!audio) return;
      seek(Math.max(0, audio.currentTime - (details.seekOffset ?? 10)));
    });
    navigator.mediaSession.setActionHandler("seekforward", (details) => {
      const audio = audioRef.current;
      if (!audio) return;
      seek(Math.min(audio.duration || Infinity, audio.currentTime + (details.seekOffset ?? 10)));
    });

    return () => {
      navigator.mediaSession.setActionHandler("play", null);
      navigator.mediaSession.setActionHandler("pause", null);
      navigator.mediaSession.setActionHandler("previoustrack", null);
      navigator.mediaSession.setActionHandler("nexttrack", null);
      navigator.mediaSession.setActionHandler("seekto", null);
      navigator.mediaSession.setActionHandler("seekbackward", null);
      navigator.mediaSession.setActionHandler("seekforward", null);
    };
  }, [track?.videoId, next, previous, seek, setPlaying]);

  useEffect(() => {
    if ("mediaSession" in navigator) {
      navigator.mediaSession.playbackState = isPlaying ? "playing" : "paused";
    }
  }, [isPlaying]);

  return (
    <audio
      ref={audioRef}
      preload="auto"
      // Keeping the element permanently in the DOM (rather than
      // mount/unmount per page) is what lets playback survive navigation.
      onTimeUpdate={(e) => setProgress(e.currentTarget.currentTime)}
      onLoadedMetadata={(e) => {
        setDuration(e.currentTarget.duration);
        setLoading(false);
      }}
      onWaiting={() => setLoading(true)}
      onPlaying={() => setLoading(false)}
      onEnded={() => next()}
      className="hidden"
    />
  );
}
