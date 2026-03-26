function SectionSkeleton({ height = "h-64" }: { height?: string }) {
  return (
    <section className="rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="h-7 w-48 animate-pulse rounded bg-zinc-200" />
      <div className={`mt-5 w-full animate-pulse rounded-xl bg-zinc-100 ${height}`} />
    </section>
  );
}

export default function WeddingDetailLoading() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="h-4 w-40 animate-pulse rounded bg-zinc-100" />
        <div className="h-10 w-40 animate-pulse rounded-full bg-zinc-100" />
      </div>

      <div className="mt-4 h-9 w-64 animate-pulse rounded bg-zinc-200" />
      <div className="mt-3 h-5 w-48 animate-pulse rounded bg-zinc-100" />

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <SectionSkeleton height="h-[540px]" />
        <SectionSkeleton height="h-[540px]" />
      </div>

      <div className="mt-8 grid gap-8">
        <SectionSkeleton height="h-[420px]" />
        <SectionSkeleton height="h-[360px]" />
        <SectionSkeleton height="h-[420px]" />
      </div>
    </main>
  );
}
