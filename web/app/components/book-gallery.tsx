"use client";

import Image from "next/image";
import { useState, useCallback, forwardRef, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";

// Dynamic import for react-pageflip to avoid SSR issues
const HTMLFlipBook = dynamic(() => import("react-pageflip"), { ssr: false });

interface BookGalleryProps {
  images: string[];
  primaryColor?: string;
}

// Decorative SVG corner flourish
function CornerFlourish({ className, color }: { className: string; color: string }) {
  return (
    <svg
      viewBox="0 0 60 60"
      className={`absolute w-14 h-14 opacity-40 pointer-events-none ${className}`}
      fill="none"
    >
      <path d="M4 4 Q4 30 30 56" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <path d="M4 4 Q30 4 56 30" stroke={color} strokeWidth="1" strokeLinecap="round" />
      <circle cx="4" cy="4" r="2.5" fill={color} />
      <path d="M14 4 Q14 18 26 30" stroke={color} strokeWidth="0.7" strokeLinecap="round" opacity="0.6" />
      <path d="M4 14 Q18 14 30 26" stroke={color} strokeWidth="0.7" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

// Photo corner holder
function PhotoCorner({ className, color }: { className: string; color: string }) {
  return (
    <div
      className={`absolute w-5 h-5 pointer-events-none z-10 ${className}`}
      style={{
        background: `linear-gradient(135deg, ${color}80, ${color}20)`,
        clipPath: "polygon(0 0, 100% 0, 100% 30%, 70% 100%, 0 100%)",
      }}
    />
  );
}

// Each Book Page (Single Page)
const Page = forwardRef<HTMLDivElement, {
  images: string[];
  side: "left" | "right";
  color: string;
  pageNumber: number;
  title?: string;
}>(({ images, side, color, pageNumber, title }, ref) => {
  const [img1, img2, img3] = images;
  
  // Check if this is the thank you page
  const isThankYouPage = img1 === "__thank_you__";

  return (
    <div
      ref={ref}
      className="relative w-full h-full overflow-hidden flex flex-col page-content page"
      style={{ background: "linear-gradient(135deg, #fdf6ee 0%, #fef9f4 50%, #fdf0e8 100%)" }}
      data-density="hard"
    >
      {/* Paper texture lines */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: "repeating-linear-gradient(0deg, #8B4513 0px, transparent 1px, transparent 28px)",
          backgroundSize: "100% 28px",
        }}
      />

      {/* Corner flourishes */}
      <CornerFlourish className="top-2 left-2" color={color} />
      <CornerFlourish
        className="bottom-2 right-2 rotate-180"
        color={color}
      />

      {/* Inner border */}
      <div
        className="absolute inset-3 border pointer-events-none"
        style={{ borderColor: `${color}30` }}
      />

      {/* Content area */}
      <div className="relative z-10 h-full flex flex-col p-6 sm:p-8 gap-4">
        {/* Title / eyebrow */}
        {title && (
          <p
            className="text-center font-script text-2xl sm:text-3xl mb-1 leading-none"
            style={{ color }}
          >
            {title}
          </p>
        )}

        {/* Thank You Page */}
        {isThankYouPage ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <p
              className="text-center font-script text-5xl sm:text-6xl leading-none"
              style={{ color }}
            >
              Cảm ơn
            </p>
            <div className="flex items-center gap-3">
              <div className="h-px w-16" style={{ background: `${color}50` }} />
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" className="opacity-60">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <div className="h-px w-16" style={{ background: `${color}50` }} />
            </div>
            <p className="text-center text-sm text-gray-500 italic max-w-xs">
              Cảm ơn bạn đã dành thời gian xem những khoảnh khắc đáng nhớ này
            </p>
          </div>
        ) : (
          /* Images Layout */
          <>
            {img1 && img2 && img3 ? (
          // 3-image layout: 1 big + 2 small stacked
          <div className="flex gap-3 flex-1 min-h-0">
            {side === "left" ? (
              <>
                {/* Large photo */}
                <div className="relative flex-1 min-h-0">
                  <div className="relative h-full w-full shadow-[2px_4px_16px_rgba(0,0,0,0.18)] rotate-[-1.2deg] hover:rotate-0 transition-transform duration-500 bg-white p-1.5 pb-6">
                    <div className="relative w-full h-full overflow-hidden">
                      <Image src={img1} alt="Photo" fill className="object-cover" sizes="200px" />
                    </div>
                    <PhotoCorner className="top-0.5 left-0.5" color={color} />
                    <PhotoCorner className="top-0.5 right-0.5 scale-x-[-1]" color={color} />
                    <PhotoCorner className="bottom-5 left-0.5 scale-y-[-1]" color={color} />
                    <PhotoCorner className="bottom-5 right-0.5 rotate-180" color={color} />
                  </div>
                </div>
                {/* 2 small stacked */}
                <div className="w-[40%] flex flex-col gap-3">
                  <div className="relative flex-1 min-h-0 shadow-[2px_4px_12px_rgba(0,0,0,0.15)] rotate-[1.5deg] hover:rotate-0 transition-transform duration-500 bg-white p-1.5 pb-5">
                    <div className="relative w-full h-full overflow-hidden">
                      <Image src={img2} alt="Photo" fill className="object-cover" sizes="120px" />
                    </div>
                  </div>
                  <div className="relative flex-1 min-h-0 shadow-[2px_4px_12px_rgba(0,0,0,0.15)] rotate-[-0.8deg] hover:rotate-0 transition-transform duration-500 bg-white p-1.5 pb-5">
                    <div className="relative w-full h-full overflow-hidden">
                      <Image src={img3} alt="Photo" fill className="object-cover" sizes="120px" />
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* 2 small stacked */}
                <div className="w-[40%] flex flex-col gap-3">
                  <div className="relative flex-1 min-h-0 shadow-[2px_4px_12px_rgba(0,0,0,0.15)] rotate-[-1.5deg] hover:rotate-0 transition-transform duration-500 bg-white p-1.5 pb-5">
                    <div className="relative w-full h-full overflow-hidden">
                      <Image src={img1} alt="Photo" fill className="object-cover" sizes="120px" />
                    </div>
                  </div>
                  <div className="relative flex-1 min-h-0 shadow-[2px_4px_12px_rgba(0,0,0,0.15)] rotate-[1deg] hover:rotate-0 transition-transform duration-500 bg-white p-1.5 pb-5">
                    <div className="relative w-full h-full overflow-hidden">
                      <Image src={img2} alt="Photo" fill className="object-cover" sizes="120px" />
                    </div>
                  </div>
                </div>
                {/* Large photo */}
                <div className="relative flex-1 min-h-0">
                  <div className="relative h-full w-full shadow-[2px_4px_16px_rgba(0,0,0,0.18)] rotate-[1.2deg] hover:rotate-0 transition-transform duration-500 bg-white p-1.5 pb-6">
                    <div className="relative w-full h-full overflow-hidden">
                      <Image src={img3} alt="Photo" fill className="object-cover" sizes="200px" />
                    </div>
                    <PhotoCorner className="top-0.5 left-0.5" color={color} />
                    <PhotoCorner className="top-0.5 right-0.5 scale-x-[-1]" color={color} />
                    <PhotoCorner className="bottom-5 left-0.5 scale-y-[-1]" color={color} />
                    <PhotoCorner className="bottom-5 right-0.5 rotate-180" color={color} />
                  </div>
                </div>
              </>
            )}
          </div>
        ) : img1 && img2 ? (
          // 2-image layout side-by-side slanted
          <div className="flex gap-4 flex-1 min-h-0">
            <div className="relative flex-1 min-h-0 shadow-[2px_4px_16px_rgba(0,0,0,0.18)] rotate-[-1.5deg] hover:rotate-0 transition-transform duration-500 bg-white p-1.5 pb-6">
              <div className="relative w-full h-full overflow-hidden">
                <Image src={img1} alt="Photo" fill className="object-cover" sizes="180px" />
              </div>
              <PhotoCorner className="top-0.5 left-0.5" color={color} />
              <PhotoCorner className="bottom-5 right-0.5 rotate-180" color={color} />
            </div>
            <div className="relative flex-1 min-h-0 shadow-[2px_4px_16px_rgba(0,0,0,0.18)] rotate-[1.5deg] hover:rotate-0 transition-transform duration-500 bg-white p-1.5 pb-6">
              <div className="relative w-full h-full overflow-hidden">
                <Image src={img2} alt="Photo" fill className="object-cover" sizes="180px" />
              </div>
              <PhotoCorner className="top-0.5 right-0.5 scale-x-[-1]" color={color} />
              <PhotoCorner className="bottom-5 left-0.5 scale-y-[-1]" color={color} />
            </div>
          </div>
        ) : img1 ? (
          // 1 large image centered
          <div className="relative flex-1 min-h-0 mx-4">
            <div className="relative h-full w-full shadow-[4px_8px_24px_rgba(0,0,0,0.18)] bg-white p-2 pb-8">
              <div className="relative w-full h-full overflow-hidden">
                <Image src={img1} alt="Photo" fill className="object-cover" sizes="350px" />
              </div>
              <PhotoCorner className="top-0.5 left-0.5" color={color} />
              <PhotoCorner className="top-0.5 right-0.5 scale-x-[-1]" color={color} />
              <PhotoCorner className="bottom-7 left-0.5 scale-y-[-1]" color={color} />
              <PhotoCorner className="bottom-7 right-0.5 rotate-180" color={color} />
            </div>
          </div>
        ) : null}
          </>
        )}

        {/* Page number */}
        {!isThankYouPage && (
          <div className="flex items-center justify-center gap-2 mt-1">
            <div className="h-px flex-1" style={{ background: `${color}30` }} />
            <span className="text-[9px] uppercase tracking-[0.35em] text-gray-400 font-semibold">
              {pageNumber}
            </span>
            <div className="h-px flex-1" style={{ background: `${color}30` }} />
          </div>
        )}
      </div>
    </div>
  );
});

export function BookGallery({ images, primaryColor = "#f1a4a4" }: BookGalleryProps) {
  const [hasInteracted, setHasInteracted] = useState(false);
  const bookRef = useRef<any>(null);

  const color = primaryColor;
  const fallback = "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?auto=format&fit=crop&w=800&q=80";
  const imgs = images.length > 0 ? images : Array(12).fill(fallback);

  const IMAGES_PER_PAGE = 3;

  // Split images into pages
  const pagesData = [];
  
  // First page: Cover with 1 large image
  if (imgs.length > 0) {
    pagesData.push([imgs[0]]);
  }
  
  // Remaining pages: 3 images per page
  for (let i = 1; i < imgs.length; i += IMAGES_PER_PAGE) {
    pagesData.push(imgs.slice(i, i + IMAGES_PER_PAGE));
  }

  // Ensure even number of pages for double-side effect
  if (pagesData.length % 2 !== 0) {
    pagesData.push(["__thank_you__"]); // Special marker for thank you page
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* @ts-ignore */}
      <HTMLFlipBook
        width={550}
        height={733}
        size="stretch"
        minWidth={315}
        maxWidth={1000}
        minHeight={400}
        maxHeight={1533}
        maxShadowOpacity={0.5}
        showCover={false}
        mobileScrollSupport={true}
        onFlip={() => setHasInteracted(true)}
        className="demo-book"
        ref={bookRef}
      >
        {pagesData.map((pageImgs, idx) => (
          <Page
            key={idx}
            images={pageImgs}
            side={idx % 2 === 0 ? "left" : "right"}
            color={color}
            pageNumber={idx + 1}
            title={idx === 0 ? "Kỷ Niệm" : idx === 1 ? "Yêu Thương" : undefined}
          />
        ))}
      </HTMLFlipBook>

      {/* Swipe hint */}
      {!hasInteracted && (
        <motion.p
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ delay: 1.5, duration: 0.6 }}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.35em] text-gray-400"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-60">
            <path d="M5 12h14" /><path d="m15 8 4 4-4 4" />
          </svg>
          Vuốt hoặc click để lật trang
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="opacity-60 scale-x-[-1]">
            <path d="M5 12h14" /><path d="m15 8 4 4-4 4" />
          </svg>
        </motion.p>
      )}
    </div>
  );
}
