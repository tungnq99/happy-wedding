import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative isolate flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute -right-32 -top-32 h-[600px] w-[600px] rounded-full bg-rose-100/60 blur-3xl" />
        <div className="absolute -bottom-32 -left-32 h-[500px] w-[500px] rounded-full bg-amber-100/50 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-rose-50/80 blur-2xl" />
      </div>

      <p className="animate-fade-up inline-flex items-center gap-2 rounded-full border border-rose-200/70 bg-white/60 px-4 py-1.5 text-xs font-medium uppercase tracking-[0.25em] text-rose-700 backdrop-blur-sm">
        <span className="inline-block h-1.5 w-1.5 rounded-full bg-rose-400" style={{ boxShadow: "0 0 6px 2px #fb7185" }} />
        Happy Wedding · MVP
      </p>

      <h1 className="animate-fade-up font-heading mt-6 max-w-2xl text-5xl font-semibold leading-[1.15] text-zinc-900 md:text-7xl" style={{ animationDelay: "100ms" }}>
        Thiệp cưới <span className="italic text-rose-700">trực tuyến</span> có trang <span className="italic text-rose-700">quản trị</span>
      </h1>

      <p className="animate-fade-up mt-6 max-w-xl text-lg leading-8 text-zinc-500" style={{ animationDelay: "200ms" }}>
        Landing page đẹp theo slug, xác nhận tham dự RSVP, gửi lời chúc và quản trị sự kiện trong một nền tảng.
      </p>

      <div className="animate-fade-up mt-10 flex flex-wrap justify-center gap-3" style={{ animationDelay: "300ms" }}>
        <Link
          href="/demo"
          className="group relative overflow-hidden rounded-full px-7 py-3.5 text-sm font-semibold text-white shadow-lg shadow-rose-300/40 transition-all hover:-translate-y-0.5 hover:shadow-rose-400/50"
          style={{ background: "linear-gradient(135deg,#c2434e 0%,#9d2835 100%)" }}
        >
          <span className="relative z-10">Xem thiệp demo</span>
          <div className="absolute inset-0 bg-white/0 transition-colors group-hover:bg-white/10" />
        </Link>
        <Link
          href="/admin"
          className="rounded-full border border-zinc-200 bg-white px-7 py-3.5 text-sm font-semibold text-zinc-800 shadow-sm transition-all hover:-translate-y-0.5 hover:border-rose-200 hover:bg-rose-50"
        >
          Trang quản trị
        </Link>
      </div>
    </main>
  );
}