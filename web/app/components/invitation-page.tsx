"use client";

import Image from "next/image";
import { format, differenceInSeconds } from "date-fns";
import { vi } from "date-fns/locale";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from "framer-motion";
import { WishForm } from "@/app/components/wish-form";
import { MusicPlayer } from "./music-player";
import { FallingPetals } from "@/app/components/falling-petals";
import { InvitationGate } from "./invitation-gate";
import { GiftQrSection } from "@/app/components/gift-qr-section";
import { BookGallery } from "@/app/components/book-gallery";
import { FloatingMenu } from "./floating-menu";

// ─── Types ───────────────────────────────────────────────────────
type EventItem = {
  id: string; name: string; startsAt: Date;
  type?: "CEREMONY" | "RECEPTION" | "OTHER";
  venueName: string; address: string; mapsUrl?: string | null;
};
type WishItem = { id: string; guestName: string; content: string };
type MediaItem = { id: string; url: string; caption?: string | null };
type StoryItem = { id: string; dateText: string; title: string; content: string; imageUrl?: string | null };
type InvitationData = {
  id: string; title: string; groomName: string; brideName: string;
  eventDate: Date; heroSubtitle?: string | null; story?: string | null;
  coverImageUrl?: string | null;
  bankQrImageUrl?: string | null; bankName?: string | null;
  bankAccountNumber?: string | null; bankAccountName?: string | null;
  groomBankQrImageUrl?: string | null; groomBankName?: string | null;
  groomBankAccountNumber?: string | null; groomBankAccountName?: string | null;
  brideBankQrImageUrl?: string | null; brideBankName?: string | null;
  brideBankAccountNumber?: string | null; brideBankAccountName?: string | null;
  events: EventItem[]; wishes: WishItem[]; media: MediaItem[]; stories?: StoryItem[];
  theme?: { primaryColor?: string; headingFont?: string; bodyFont?: string } | null;
};
type Props = { data: InvitationData; isDemo?: boolean };

// ─── Shared UI Helpers ───────────────────────────────────────────
function SectionTitle({ eyebrow, title, color, script = false }: { eyebrow?: string; title: string; color: string; script?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="mb-16 flex flex-col items-center text-center relative z-10"
    >
      {eyebrow && (
        <div className="flex items-center gap-4 mb-4">
          <div className="h-[1px] w-8 bg-[#f1a4a4]/40" />
          <p className="text-[10px] uppercase tracking-[0.4em] text-[#f1a4a4] font-semibold">{eyebrow}</p>
          <div className="h-[1px] w-8 bg-[#f1a4a4]/40" />
        </div>
      )}
      <h2 className={`${script ? "font-script text-6xl" : "font-heading text-4xl uppercase tracking-widest"} text-gray-800`}>
        {title}
      </h2>
    </motion.div>
  );
}

function FloralWatermark({ side = "left", color }: { side?: "left" | "right"; color: string }) {
  return (
    <div className={`pointer-events-none absolute inset-y-0 ${side === "left" ? "left-0" : "right-0"} w-32 opacity-[0.05] md:w-48`}>
      <svg viewBox="0 0 160 700" className={`h-full w-full ${side === "right" ? "-scale-x-100" : ""}`} fill="none">
        <path d="M80 0 C55 80 15 160 35 280 55 400 95 450 75 560 55 670 22 690 32 710" stroke={color} strokeWidth="2" />
      </svg>
    </div>
  );
}

function FlipUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1 sm:gap-2">
      <div className="relative flex h-10 w-11 min-[400px]:h-12 min-[400px]:w-14 items-center justify-center sm:h-20 sm:w-24">
        <span className="text-3xl min-[400px]:text-4xl font-light tracking-widest text-white drop-shadow-[0_4px_8px_rgba(0,0,0,0.6)] sm:text-6xl">{String(value).padStart(2, "0")}</span>
      </div>
      <span className="text-[9px] min-[400px]:text-[10px] sm:text-[11px] uppercase tracking-[0.4em] text-white/90 font-bold drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{label}</span>
    </div>
  );
}

function Countdown({ target }: { target: Date }) {
  const [mounted, setMounted] = useState(false);
  const calc = useCallback(() => {
    const d = differenceInSeconds(target, new Date());
    if (d <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
    return { days: Math.floor(d / 86400), hours: Math.floor((d % 86400) / 3600), minutes: Math.floor((d % 3600) / 60), seconds: d % 60 };
  }, [target]);

  const [t, setT] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    setMounted(true);
    setT(calc());
    const id = setInterval(() => setT(calc()), 1000);
    return () => clearInterval(id);
  }, [calc]);

  if (!mounted) {
    return (
      <div className="flex justify-center gap-3 min-[400px]:gap-5 sm:gap-10">
        {[{ v: 0, l: "Ngày" }, { v: 0, l: "Giờ" }, { v: 0, l: "Phút" }, { v: 0, l: "Giây" }].map(({ v, l }) => (
          <FlipUnit key={l} value={v} label={l} />
        ))}
      </div>
    );
  }

  return (
    <div className="flex justify-center gap-3 min-[400px]:gap-5 sm:gap-10">
      {[{ v: t.days, l: "Ngày" }, { v: t.hours, l: "Giờ" }, { v: t.minutes, l: "Phút" }, { v: t.seconds, l: "Giây" }].map(({ v, l }) => (
        <FlipUnit key={l} value={v} label={l} />
      ))}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
//  MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════
export function InvitationPage({ data, isDemo = false }: Props) {
  const color = data.theme?.primaryColor ?? "#f1a4a4";
  const introHeartBaseId = `intro-heart-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const introHeartClipId = `${introHeartBaseId}-heart`;
  const introHeartLeftClipId = `${introHeartBaseId}-left`;
  const introHeartRightClipId = `${introHeartBaseId}-right`;
  const introHeartRef = useRef<HTMLDivElement>(null);
  const isIntroHeartInView = useInView(introHeartRef, { once: true, margin: "-10% 0px -10% 0px" });
  const cover = data.coverImageUrl || "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=1600&q=80";
  const galleryImages = data.media.length > 0 ? data.media.map((m) => m.url) : [cover];
  const heroImage = data.media.length > 0 ? galleryImages[0] : cover;
  const pickGalleryImage = (index: number) => galleryImages[index % galleryImages.length];
  const eventImages = galleryImages;
  const ceremonyEvent = data.events.find((event) => event.type === "CEREMONY") ?? data.events[0];
  const receptionEvents = data.events.filter((event) => event.id !== ceremonyEvent?.id && event.type === "RECEPTION");
  const fallbackPartyEvents = data.events.filter((event) => event.id !== ceremonyEvent?.id && event.type !== "RECEPTION");
  const partyEvents = receptionEvents.length > 0 ? [...receptionEvents, ...fallbackPartyEvents] : data.events.filter((event) => event.id !== ceremonyEvent?.id);
  const timelineStories = (data.stories && data.stories.length > 0)
    ? data.stories
    : [
      { id: "fallback-1", dateText: "Tháng 05/2019", title: "Ngày đầu gặp gỡ", content: "Những bước chân đầu tiên trên hành trình dài. Mọi thứ bắt đầu bằng một nụ cười...", imageUrl: null },
      { id: "fallback-2", dateText: "Năm 2022", title: "Những chuyến đi", content: "Cùng nhau khám phá những vùng đất mới, gom nhặt vô số kỷ niệm đáng nhớ.", imageUrl: null },
      { id: "fallback-3", dateText: "Ngày chung đôi", title: "Cái kết viên mãn", content: "Ngày mà hai ta chính thức thuộc về nhau, mở ra chương mới rạng rỡ của cuộc đời.", imageUrl: null },
    ];

  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"]
  });

  const scaleProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30, restDelta: 0.001 });

  // Hero Parallax
  const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 1.15]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.1], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.15], [0, -40]);

  const [isGateOpen, setIsGateOpen] = useState(false);
  const [gateMounted, setGateMounted] = useState(true);
  const [guestName, setGuestName] = useState("");
  const [playMusic, setPlayMusic] = useState(false);

  function handleStartOpen() {
    setIsGateOpen(true);
    setPlayMusic(true);
  }

  function handleFinishOpen(name: string) {
    setGuestName(name);
    setGateMounted(false);
    setTimeout(() => window.scrollTo({ top: 0, behavior: "smooth" }), 100);
  }

  const renderEventItem = (event: EventItem, i: number) => (
    <motion.div
      key={event.id}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 1 }}
      className={`flex flex-col md:flex-row items-center gap-12 md:gap-24 ${i % 2 !== 0 ? "md:flex-row-reverse" : ""}`}
    >
      <div className="w-full md:w-1/2 relative">
        <div className="relative aspect-[4/5] w-full max-w-[420px] mx-auto md:mx-0 overflow-hidden border border-zinc-100 shadow-[0_24px_60px_rgba(0,0,0,0.12)]">
          <Image src={eventImages[(i + 4) % eventImages.length]} alt={event.name} fill className="object-cover transition-transform duration-[1600ms] hover:scale-105" />
        </div>

        <div className={`absolute top-12 ${i % 2 === 0 ? "-right-10" : "-left-10"} hidden xl:flex flex-col items-center bg-white p-8 shadow-2xl z-20 border border-gray-100`}>
          <span className="text-7xl font-heading font-light text-gray-900 leading-none" suppressHydrationWarning>{format(event.startsAt, "dd", { locale: vi })}</span>
          <div className="w-full h-px bg-[#f1a4a4]/40 my-3" />
          <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-gray-400" suppressHydrationWarning>Tháng {format(event.startsAt, "MM", { locale: vi })}</span>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex flex-col items-center md:items-start text-center md:text-left md:px-2">
        <div className="xl:hidden flex items-center gap-6 mb-8">
          <span className="text-6xl font-heading font-light text-gray-900 leading-none" suppressHydrationWarning>{format(event.startsAt, "dd", { locale: vi })}</span>
          <div className="h-12 w-px bg-gray-200"></div>
          <div className="flex flex-col items-start text-left">
            <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-gray-400" suppressHydrationWarning>Tháng {format(event.startsAt, "MM", { locale: vi })}</span>
            <span className="text-[11px] uppercase tracking-[0.3em] font-bold text-[#f1a4a4] mt-1" suppressHydrationWarning>Năm {format(event.startsAt, "yyyy", { locale: vi })}</span>
          </div>
        </div>

        <h3 className="text-5xl sm:text-6xl font-script text-gray-800 mb-7">{event.name}</h3>

        <div className="space-y-8 text-gray-600 w-full max-w-sm rounded-sm border border-zinc-200 bg-white/80 px-6 py-7 shadow-sm backdrop-blur">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f1a4a4] mb-2">Thời gian</p>
            <p className="text-base tracking-widest uppercase text-gray-900">
              <span suppressHydrationWarning>{format(event.startsAt, "HH:mm", { locale: vi })}</span>
              <span className="text-gray-300 xl:hidden mx-3">|</span>
              <span className="xl:hidden" suppressHydrationWarning>{format(event.startsAt, "EEEE", { locale: vi })}</span>
            </p>
          </div>

          <div className="h-px w-24 bg-gray-200 mx-auto md:mx-0"></div>

          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f1a4a4] mb-2">Địa điểm</p>
            <p className="text-lg font-bold text-gray-900 uppercase tracking-widest leading-relaxed">{event.venueName}</p>
            <p className="text-sm mt-3 leading-relaxed text-gray-500">{event.address}</p>
          </div>
        </div>

        {event.mapsUrl && (
          <a href={event.mapsUrl} target="_blank" rel="noopener noreferrer"
            className="group mt-12 inline-flex items-center gap-4 bg-transparent border border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] transition-all duration-500">
            <span>Xem Bản Đồ</span>
            <svg className="transition-transform duration-500 group-hover:translate-x-1" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14m-7-7 7 7-7 7" />
            </svg>
          </a>
        )}
      </div>
    </motion.div>
  );

  return (
    <div ref={containerRef} className="relative bg-[#fefcfb]" style={{ position: "relative" }}>
      {/* Scroll Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1.5 z-[150] origin-left"
        style={{ scaleX: scaleProgress, background: color }}
      />

      <AnimatePresence mode="wait">
        {gateMounted && (
          <motion.div
            key="gate"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            transition={{ duration: 0.8 }}
            className="fixed inset-0 z-[200]"
          >
            <InvitationGate
              weddingId={data.id}
              groomName={data.groomName}
              brideName={data.brideName}
              coverImageUrl={heroImage}
              primaryColor={color}
              onStartOpen={handleStartOpen}
              onOpen={handleFinishOpen}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <main
        className={`relative min-h-screen transition-opacity duration-1000 ${isGateOpen ? "opacity-100" : "h-screen overflow-hidden opacity-0"}`}
      >
        <FallingPetals />
        <MusicPlayer primaryColor={color} autoPlayTrigger={playMusic} />
        <FloatingMenu primaryColor={color} />

        {/* Section 1: Hero Banner (Modern Framed) */}
        <section className="sticky top-0 h-screen w-full p-4 sm:p-6 bg-white overflow-hidden">
          <div className="relative w-full h-full overflow-hidden rounded-sm">
            <motion.div
              style={{ scale: heroScale }}
              className="absolute inset-0"
            >
              <Image src={heroImage} alt="Background" fill className="object-cover" priority />
            </motion.div>
            <div className="absolute inset-0 bg-black/30" />
            <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.6))" }} />

            <motion.div
              style={{ opacity: heroOpacity, y: heroY }}
              className="relative z-10 flex h-full flex-col items-center justify-center text-center text-white px-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isGateOpen ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1.2, delay: 0.3 }}
                className="mb-6 sm:mb-12 flex flex-col items-center"
              >
                <p className="font-heading text-base sm:text-xl md:text-2xl uppercase tracking-[0.8em] text-[#f1a4a4] drop-shadow-md mb-2 sm:mb-4">Save the Date</p>
                <div className="h-[1px] w-8 sm:w-12 bg-white/40" />
              </motion.div>

              <div className="mb-6 sm:mb-10 flex flex-col items-center">
                <motion.h1
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={isGateOpen ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 1.5, delay: 0.5 }}
                  className="font-script text-7xl min-[400px]:text-8xl sm:text-9xl drop-shadow-2xl"
                >
                  {data.groomName.toLowerCase().replace(/(^|\s)\S/g, (l) => l.toUpperCase())}
                </motion.h1>

                <motion.div
                  initial={{ opacity: 0, rotate: -45 }}
                  animate={isGateOpen ? { opacity: 1, rotate: 0 } : {}}
                  transition={{ duration: 1, delay: 0.8 }}
                  className="my-3 flex items-center justify-center gap-4 sm:gap-6 w-full"
                >
                  <div className="h-[1px] w-16 sm:w-24 bg-white/30" />
                  <span className="font-heading text-4xl min-[400px]:text-5xl sm:text-6xl text-[#f1a4a4] drop-shadow-sm flex-shrink-0">&</span>
                  <div className="h-[1px] w-16 sm:w-24 bg-white/30" />
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={isGateOpen ? { opacity: 1, scale: 1 } : {}}
                  transition={{ duration: 1.2, delay: 0.7 }}
                  className="font-script text-7xl min-[400px]:text-8xl sm:text-9xl drop-shadow-2xl"
                >
                  {data.brideName.toLowerCase().replace(/(^|\s)\S/g, (l) => l.toUpperCase())}
                </motion.h1>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={isGateOpen ? { opacity: 0.9 } : {}}
                transition={{ duration: 2, delay: 1.2 }}
                className="mb-6 sm:mb-12"
              >
                <p className="border-y border-white/40 py-2 sm:py-3 text-xs uppercase font-bold tracking-[0.5em] text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] sm:text-base px-4 sm:px-6 shadow-[0_4px_12px_rgba(0,0,0,0.1)] backdrop-blur-sm" suppressHydrationWarning>
                  {format(data.eventDate, "dd . MM . yyyy", { locale: vi })}
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={isGateOpen ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1, delay: 1.4 }}
                className="mb-6 sm:mb-12"
              >
                <Countdown target={data.eventDate} />
              </motion.div>

              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={isGateOpen ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 1, delay: 1.7 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  const el = document.getElementById('guestbook');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                }}
                style={{ color: color }}
                className="rounded-sm bg-white/95 px-8 py-3 text-[10px] sm:px-12 sm:py-4 sm:text-[11px] font-bold uppercase tracking-[0.3em] shadow-[0_8px_30px_rgba(0,0,0,0.3)] transition hover:bg-white"
              >
                Gửi lời chúc
              </motion.button>
            </motion.div>
          </div>
        </section>

        {/* Filler to allow sticky hero to scroll away */}
        <div id="formal-intro" className="relative z-20 bg-white">
          {/* Section 2: FORMAL INTRO & PARENTS */}
          <section className="relative px-6 py-24 overflow-hidden">
            <FloralWatermark side="left" color={color} />
            <FloralWatermark side="right" color={color} />

            <div className="mx-auto max-w-4xl text-center relative z-10">
              <div className="mb-24 flex justify-center relative z-10 px-4">
                <motion.div
                  ref={introHeartRef}
                  initial={{ opacity: 0, y: 50, scale: 0.95 }}
                  animate={isIntroHeartInView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 50, scale: 0.95 }}
                  transition={{ duration: 1, ease: "easeOut" }}
                  className="relative h-[370px] w-[360px] sm:h-[440px] sm:w-[430px]"
                >
                  <svg viewBox="0 0 94 91" className="h-full w-full drop-shadow-[0_26px_42px_rgba(0,0,0,0.2)]">
                    <defs>
                      <clipPath id={introHeartClipId}>
                        <path d="M47 89 C44.5 87 7 58.5 7 30 C7 14.5 18.8 4 33 4 C40 4 45.2 7.4 47 12.3 C48.8 7.4 54 4 61 4 C75.2 4 87 14.5 87 30 C87 58.5 49.5 87 47 89 Z" />
                      </clipPath>
                      <clipPath id={introHeartLeftClipId}>
                        <path d="M0 0 H48.5 L44 9 L50 16 L42 23 L49 30 L41 37 L50 45 L40 54 L49 62 L41 71 L47 80 V91 H0 Z" />
                      </clipPath>
                      <clipPath id={introHeartRightClipId}>
                        <path d="M94 0 H48.5 L44 9 L50 16 L42 23 L49 30 L41 37 L50 45 L40 54 L49 62 L41 71 L47 80 V91 H94 Z" />
                      </clipPath>
                    </defs>

                    <motion.g
                      initial={false}
                      animate={isIntroHeartInView ? { x: 0, y: 0, rotate: 0, opacity: 1 } : { x: -34, y: -8, rotate: -8, opacity: 0.9 }}
                      transition={{ duration: 0.85, ease: "easeOut", delay: 0.1 }}
                      clipPath={`url(#${introHeartClipId})`}
                    >
                      <image
                        href={pickGalleryImage(1)}
                        x="0"
                        y="0"
                        width="94"
                        height="91"
                        preserveAspectRatio="xMidYMid slice"
                        clipPath={`url(#${introHeartLeftClipId})`}
                      />
                    </motion.g>

                    <motion.g
                      initial={false}
                      animate={isIntroHeartInView ? { x: 0, y: 0, rotate: 0, opacity: 1 } : { x: 34, y: 8, rotate: 8, opacity: 0.9 }}
                      transition={{ duration: 0.85, ease: "easeOut", delay: 0.1 }}
                      clipPath={`url(#${introHeartClipId})`}
                    >
                      <image
                        href={pickGalleryImage(1)}
                        x="0"
                        y="0"
                        width="94"
                        height="91"
                        preserveAspectRatio="xMidYMid slice"
                        clipPath={`url(#${introHeartRightClipId})`}
                      />
                    </motion.g>

                  </svg>
                </motion.div>
              </div>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="font-script mb-8 text-6xl text-gray-800"
              >
                Và Thế Là...
              </motion.p>

              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
                className="mx-auto max-w-2xl space-y-6 px-4 text-sm leading-relaxed text-gray-500 sm:text-base tracking-wide"
              >
                <p>Thật vui vì được gặp và đón tiếp các bạn trong một dịp đặc biệt - Ngày cưới của chúng mình.</p>
                <p>Hành trình yêu nhau đầy thăng trầm cũng đã tới ngày đơm hoa kết trái. Cảm ơn sự hiện diện và những lời chúc tốt đẹp nhất của mọi người!</p>
              </motion.div>

              <div className="mt-24 w-full flex flex-col md:flex-row justify-center items-center md:items-start gap-16 md:gap-24 border-t border-gray-100 pt-24 px-4 max-w-5xl mx-auto">
                {/* Groom Section */}
                <div className="flex flex-col items-center w-full md:w-1/2">
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ margin: "-50px", once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative h-[450px] w-[300px] sm:h-[550px] sm:w-[380px] overflow-hidden rounded-sm shadow-xl mb-12"
                  >
                    <Image src={pickGalleryImage(3)} alt="Groom" fill className="object-cover transition-transform duration-700 hover:scale-105" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="space-y-4 text-center"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-gray-400">Chú Rể</p>
                    <p className="font-script mt-2 text-[56px] leading-none" style={{ color }}>{data.groomName.toLowerCase().replace(/(^|\s)\S/g, (l) => l.toUpperCase())}</p>
                    <div className="h-[1px] w-12 bg-[#f1a4a4]/40 my-6" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f1a4a4]">Gia Đình Nhà Trai</p>
                    <div className="space-y-1 mt-3">
                      <p className="text-[13px] text-gray-500 uppercase tracking-widest">Ông <span className="font-semibold text-gray-800 ml-1">NGUYỄN VĂN A</span></p>
                      <p className="text-[13px] text-gray-500 uppercase tracking-widest">Bà <span className="font-semibold text-gray-800 ml-1">TRẦN THỊ B</span></p>
                    </div>
                  </motion.div>
                </div>

                {/* Bride Section */}
                <div className="flex flex-col items-center w-full md:w-1/2 md:mt-32">
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ margin: "-50px", once: true }}
                    transition={{ duration: 0.8, delay: 0.1 }}
                    className="relative h-[450px] w-[300px] sm:h-[550px] sm:w-[380px] overflow-hidden rounded-sm shadow-xl mb-12"
                  >
                    <Image src={pickGalleryImage(4)} alt="Bride" fill className="object-cover transition-transform duration-700 hover:scale-105" />
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 }}
                    className="space-y-4 text-center"
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.4em] text-gray-400">Cô Dâu</p>
                    <p className="font-script mt-2 text-[56px] leading-none" style={{ color }}>{data.brideName.toLowerCase().replace(/(^|\s)\S/g, (l) => l.toUpperCase())}</p>
                    <div className="h-[1px] w-12 bg-[#f1a4a4]/40 my-6" />
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#f1a4a4]">Gia Đình Nhà Gái</p>
                    <div className="space-y-1 mt-3">
                      <p className="text-[13px] text-gray-500 uppercase tracking-widest">Ông <span className="font-semibold text-gray-800 ml-1">LÊ VĂN C</span></p>
                      <p className="text-[13px] text-gray-500 uppercase tracking-widest">Bà <span className="font-semibold text-gray-800 ml-1">PHẠM THỊ D</span></p>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: TIMELINE (STORY) */}
          <section className="bg-[#fff9f9] py-24 px-6 relative overflow-hidden">
            <SectionTitle eyebrow="Chuyện chúng mình" title="Timeline Tình Yêu" color={color} />

            <div className="relative mx-auto max-w-4xl pt-10">
              {/* Center Line with Scroll Animation */}
              <motion.div
                className="absolute left-8 sm:left-1/2 top-0 w-px origin-top sm:-translate-x-1/2 z-0"
                style={{ scaleY: scaleProgress, background: color, height: "100%" }}
              />
              <div className="absolute left-8 sm:left-1/2 top-0 h-full w-px sm:-translate-x-1/2 bg-gray-200 z-0" />

              <div className="space-y-24 sm:space-y-32">
                {timelineStories.map((storyEntry, i) => (
                  <motion.div
                    key={storyEntry.id}
                    initial={{ opacity: 0, x: i % 2 === 0 ? 50 : -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ margin: "-100px" }}
                    transition={{ duration: 0.8 }}
                    className={`relative flex flex-col sm:items-center sm:justify-between ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}
                  >
                    {/* Event Dot */}
                    <div className="absolute left-8 sm:left-1/2 top-10 sm:top-1/2 z-10 h-3 w-3 -translate-x-[5.5px] sm:-translate-x-1/2 sm:-translate-y-1/2 rounded-full border-[3px] border-white shadow-sm" style={{ background: color }} />

                    {/* Image Column */}
                    <div className="w-full pl-20 pr-6 sm:p-0 sm:w-[45%]">
                      <motion.div
                        whileHover={{ scale: 1.02 }}
                        className="relative h-[380px] w-full sm:mx-auto sm:h-[450px] sm:w-[320px] overflow-hidden rounded-sm shadow-xl"
                      >
                        <Image src={storyEntry.imageUrl || pickGalleryImage(i + 5)} alt={storyEntry.title} fill className="object-cover" />
                      </motion.div>
                    </div>

                    {/* Text Column */}
                    <div className="w-full pl-20 pr-6 sm:p-0 sm:w-[45%] mt-8 sm:mt-0">
                      <div className="bg-transparent sm:p-8 text-left sm:text-center">
                        <p className="font-script text-4xl sm:text-5xl mb-4 sm:mb-6" style={{ color }}>{storyEntry.dateText}</p>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-400 mb-4">{storyEntry.title}</p>
                        <p className="text-sm leading-relaxed text-gray-500 tracking-wide">
                          {storyEntry.content}
                        </p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 4: Lễ Vu Quy */}
          {ceremonyEvent && (
            <section className="relative bg-white py-24 lg:py-32 overflow-hidden">
              <div className="mx-auto max-w-6xl relative z-10 px-4 sm:px-6">
                <SectionTitle eyebrow="Thời gian & Địa điểm" title={ceremonyEvent.name} color={color} />
                <div className="mt-24 sm:mt-32">
                  {renderEventItem(ceremonyEvent, 0)}
                </div>
              </div>
            </section>
          )}

          {/* SECTION 5: GALLERY */}
          <section className="bg-[#fff9f9] py-24 overflow-hidden">
            <SectionTitle eyebrow="Album Hình Cưới" title="Gallery" color={color} />
            <div className="mx-auto max-w-4xl px-4 sm:px-6">
              <BookGallery
                images={galleryImages}
                primaryColor={color}
              />
            </div>
          </section>

          {/* SECTION 6: Tiec Cuoi */}
          {partyEvents.length > 0 && (
            <section className="relative overflow-hidden bg-[#f7e3e1] py-24 lg:py-32">
              <div className="absolute inset-0">
                <Image
                  src={eventImages[0] || heroImage}
                  alt="Wedding background"
                  fill
                  className="object-cover opacity-20"
                />
              </div>

              <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
                {partyEvents.map((event, i) => (
                  <motion.article
                    key={event.id}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{ duration: 0.8, delay: i * 0.08 }}
                    className="relative overflow-hidden border border-white/70 bg-white/30 shadow-[0_20px_70px_rgba(0,0,0,0.12)] backdrop-blur-[2px]"
                  >
                    <div className="grid md:grid-cols-2">
                      <div className="relative flex min-h-[340px] flex-col items-center justify-center border-b border-white/70 px-8 py-12 text-center md:min-h-[620px] md:border-b-0 md:border-r">
                        <p className="font-heading text-6xl leading-none text-white/90 sm:text-7xl">Save</p>
                        <p className="mt-3 text-sm font-semibold uppercase tracking-[0.35em] text-white/85">The</p>
                        <p className="mt-2 font-heading text-6xl leading-none text-white/90 sm:text-7xl">Date</p>
                        <p className="mt-10 text-xs uppercase tracking-[0.4em] text-white/70">{event.name}</p>
                      </div>

                      <div className="bg-[rgba(228,136,140,0.78)] px-7 py-10 text-center text-white sm:px-10 sm:py-14">
                        <h3 className="font-heading text-4xl sm:text-5xl">{data.groomName}</h3>
                        <p className="my-3 text-xl leading-none">&</p>
                        <h3 className="font-heading text-4xl sm:text-5xl">{data.brideName}</h3>

                        <p className="mx-auto mt-6 max-w-md text-sm leading-relaxed text-white/90 sm:text-base">
                          {"Trân trọng kính mời bạn đến dự buổi tiệc chung vui cùng gia đình chúng tôi. Rất hân hạnh được đón tiếp!"}
                        </p>

                        <div className="mt-8 flex flex-col items-center gap-4">
                          <button
                            onClick={() => document.getElementById("guestbook")?.scrollIntoView({ behavior: "smooth" })}
                            className="w-full max-w-[300px] border border-white/80 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#d07b7f]"
                          >
                            {"Gửi Lời Chúc"}
                          </button>
                          <button
                            onClick={() => (document.getElementById("rsvp") ?? document.getElementById("guestbook"))?.scrollIntoView({ behavior: "smooth" })}
                            className="w-full max-w-[300px] border border-white/80 px-6 py-3 text-sm font-bold uppercase tracking-[0.2em] text-white transition hover:bg-white hover:text-[#d07b7f]"
                          >
                            {"Xác Nhận Tham Dự"}
                          </button>
                        </div>

                        <p className="mt-10 font-heading text-4xl tracking-[0.08em] text-white/95 sm:text-5xl" suppressHydrationWarning>
                          {format(event.startsAt, "dd.MM.yyyy", { locale: vi })}
                        </p>

                        <div className="mt-8 origin-top scale-[0.72] sm:scale-[0.8]">
                          <Countdown target={event.startsAt} />
                        </div>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </section>
          )}

          {/* SECTION 7: GUESTBOOK */}
          <section id="guestbook" className="bg-[#fff9f9] py-24 px-6">
            <div className="mx-auto max-w-2xl text-center">
              <SectionTitle eyebrow="Lời Chúc" title="Sổ Lưu Bút" color={color} />
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="bg-white p-8 sm:p-12 border border-[#f1a4a4]/20 rounded-sm shadow-sm"
              >
                <WishForm weddingId={data.id} disabled={isDemo} />
              </motion.div>

              <div className="mt-12 grid gap-4 overflow-hidden sm:grid-cols-2">
                {data.wishes.slice(0, 4).map((wish, i) => (
                  <motion.div
                    key={wish.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="text-left p-6 bg-white rounded-sm shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
                  >
                    <p className="text-xs font-bold text-[#f1a4a4] mb-2">{wish.guestName}</p>
                    <p className="text-sm italic text-gray-500 leading-relaxed">"{wish.content}"</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </section>


          {/* SECTION 8: GIFT */}
          <GiftQrSection
            groomQrImageUrl={data.groomBankQrImageUrl ?? data.bankQrImageUrl}
            groomBankName={data.groomBankName ?? data.bankName}
            groomBankAccountNumber={data.groomBankAccountNumber ?? data.bankAccountNumber}
            groomBankAccountName={data.groomBankAccountName ?? data.bankAccountName}
            brideQrImageUrl={data.brideBankQrImageUrl}
            brideBankName={data.brideBankName}
            brideBankAccountNumber={data.brideBankAccountNumber}
            brideBankAccountName={data.brideBankAccountName}
            primaryColor={color}
          />

          {/* FOOTER */}
          <footer className="bg-white py-20 text-center border-t border-gray-50">
            <p className="font-script text-4xl mb-4" style={{ color }}>{data.groomName.toLowerCase().replace(/(^|\s)\S/g, (l) => l.toUpperCase())} & {data.brideName.toLowerCase().replace(/(^|\s)\S/g, (l) => l.toUpperCase())}</p>
            <p className="text-xs uppercase tracking-[0.4em] text-gray-300">Thank You For Everything</p>
            <div className="mx-auto mt-10 h-2 w-2 rounded-full bg-[#f1a4a4]/30" />
          </footer>
        </div>
      </main>
    </div>
  );
}













