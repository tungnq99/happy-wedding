"use client";

import { useEffect, useRef, useState } from "react";

// Wedding music - royalty-free tracks from Pixabay & bensound
const TRACKS = [
  {
    title: "Beautiful In White",
    url: "/Beautiful_In_White.mp3",
  }
];

export function MusicPlayer({ primaryColor, autoPlayTrigger = false }: { primaryColor: string; autoPlayTrigger?: boolean }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [playing, setPlaying] = useState(false);
  const [showTooltip, setShowTooltip] = useState(true);
  const [trackIdx, setTrackIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const track = TRACKS[trackIdx];

  const hasAutoPlayed = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setShowTooltip(false), 5000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (autoPlayTrigger && !hasAutoPlayed.current) {
      const audio = audioRef.current;
      if (audio) {
        hasAutoPlayed.current = true;
        audio.play().then(() => {
          setPlaying(true);
          setShowTooltip(false);
        }).catch(() => { });
      }
    }
  }, [autoPlayTrigger]);

  const toggle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    setShowTooltip(false);
    if (playing) {
      audio.pause();
      setPlaying(false);
    } else {
      try {
        await audio.play();
        setPlaying(true);
      } catch {
        // autoplay policy
      }
    }
  };

  const next = () => {
    const n = (trackIdx + 1) % TRACKS.length;
    setTrackIdx(n);
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.load();
      if (playing) audio.play().catch(() => { });
    }
  };

  return (
    <div className="fixed bottom-6 left-4 z-50 flex items-end gap-2">
      <audio ref={audioRef} src={track.url} loop preload="auto" />

      {/* Tooltip */}
      {showTooltip && !playing && (
        <div
          className="absolute bottom-14 left-0 whitespace-nowrap rounded-full bg-white/95 px-4 py-1.5 text-xs text-gray-500 shadow-lg"
          style={{ border: `1px solid ${primaryColor}33` }}
        >
          🎵 Click để phát nhạc cưới
        </div>
      )}

      {/* Play/Pause button */}
      <div className="relative">
        {playing && (
          <span
            className="animate-pulse-ring absolute inset-0 rounded-full"
            style={{ background: primaryColor }}
          />
        )}
        <button
          onClick={toggle}
          aria-label={playing ? "Dừng nhạc" : "Phát nhạc"}
          className="relative flex h-12 w-12 items-center justify-center rounded-full text-white shadow-xl transition hover:scale-105"
          style={{ background: primaryColor }}
        >
          {playing ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1.5" />
              <rect x="14" y="4" width="4" height="16" rx="1.5" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}
