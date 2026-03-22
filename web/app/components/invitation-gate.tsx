"use client";

import Image from "next/image";
import { useState } from "react";

type Props = {
  weddingId: string;
  groomName: string;
  brideName: string;
  coverImageUrl: string;
  primaryColor: string;
  onStartOpen?: () => void;
  onOpen: (guestName: string) => void;
};

export function InvitationGate({ weddingId, groomName, brideName, coverImageUrl, primaryColor, onStartOpen, onOpen }: Props) {
  const [phase, setPhase] = useState<"idle" | "fadeText" | "openDoors">("idle");

  function handleOpen() {
    if (phase !== "idle") return;
    setPhase("fadeText");
    // Đợi chữ mờ đi rồi mở cổng
    setTimeout(() => {
      setPhase("openDoors");
      onStartOpen?.();
      // Mở cổng xong thì unmount
      setTimeout(() => onOpen("Khách"), 1000);
    }, 400);
  }

  // Common background elements
  const bgElements = (
    <>
      <Image src={coverImageUrl} alt="wedding" fill priority className="object-cover" />
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, transparent, rgba(200, 200, 200, 0.4))" }} />
      <div className="absolute inset-0 backdrop-blur-[2px]" />
    </>
  );

  return (
    <div className="fixed inset-0 z-[300] overflow-hidden bg-transparent">
      {/* Left Door */}
      <div
        className={`absolute inset-y-0 left-0 w-1/2 overflow-hidden transition-transform duration-[1200ms] ease-in-out origin-left ${phase === "openDoors" ? "-translate-x-full" : "translate-x-0"
          }`}
      >
        {/* Border line between doors */}
        <div className="absolute right-0 top-0 bottom-0 w-[1px] bg-white/30 z-20" />
        <div className="absolute inset-y-0 left-0 w-[100vw]">
          {bgElements}
        </div>
      </div>

      {/* Right Door */}
      <div
        className={`absolute inset-y-0 right-0 w-1/2 overflow-hidden transition-transform duration-[1200ms] ease-in-out origin-right ${phase === "openDoors" ? "translate-x-full" : "translate-x-0"
          }`}
      >
        <div className="absolute inset-y-0 right-0 w-[100vw]">
          {bgElements}
        </div>
      </div>

      {/* Content Overlay */}
      <div
        className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-700 pointer-events-none ${phase !== "idle" ? "opacity-0 scale-105 blur-sm" : "opacity-100 scale-100"
          }`}
      >
        <div className="mb-4 text-center">
          <p className="font-heading text-lg uppercase tracking-[0.8em] text-[#f1a4a4] drop-shadow-md sm:text-2xl mb-4">Wedding Invitation</p>
          <div className="h-[1px] w-12 bg-white/50 mx-auto" />
        </div>

        <div className="mb-12 space-y-4 text-white drop-shadow-2xl text-center">
          <h2 className="font-heading text-6xl font-light uppercase tracking-[0.2em] sm:text-8xl">{groomName}</h2>
          <div className="flex items-center justify-center gap-6 my-4">
            <div className="h-[1px] w-16 bg-white/30" />
            <p className="font-script text-5xl text-[#f1a4a4] drop-shadow-md sm:text-7xl">&</p>
            <div className="h-[1px] w-16 bg-white/30" />
          </div>
          <h2 className="font-heading text-6xl font-light uppercase tracking-[0.2em] sm:text-8xl">{brideName}</h2>
        </div>

        {/* Action Button */}
        <div className="relative pointer-events-auto mt-8">
          <div className="absolute -inset-4 animate-pulse rounded-full bg-white/20 blur-xl" />
          <button
            onClick={handleOpen}
            className="relative flex h-24 w-24 items-center justify-center rounded-full bg-white text-[#f1a4a4] shadow-2xl transition-all hover:scale-105 active:scale-95 border hover:bg-gray-50 uppercase tracking-widest text-xs font-bold leading-tight"
          >
            Mở thiệp
          </button>
        </div>
      </div>
    </div>
  );
}
