function AdminCardSkeleton() {
  return (
    <article className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="h-5 w-32 animate-pulse rounded bg-zinc-200" />
      <div className="mt-4 h-8 w-2/3 animate-pulse rounded bg-zinc-200" />
      <div className="mt-3 h-4 w-5/6 animate-pulse rounded bg-zinc-100" />
      <div className="mt-6 flex gap-3">
        <div className="h-4 w-20 animate-pulse rounded bg-zinc-100" />
        <div className="h-4 w-16 animate-pulse rounded bg-zinc-100" />
        <div className="h-4 w-20 animate-pulse rounded bg-zinc-100" />
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div className="h-10 w-24 animate-pulse rounded-full bg-zinc-200" />
        <div className="h-10 w-16 animate-pulse rounded-full bg-zinc-100" />
      </div>
    </article>
  );
}

export default function AdminLoading() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-4 w-40 animate-pulse rounded bg-zinc-100" />
          <div className="mt-3 h-9 w-72 animate-pulse rounded bg-zinc-200" />
        </div>
        <div className="h-10 w-10 animate-pulse rounded-full bg-zinc-200" />
      </div>

      <div className="mt-6 h-10 w-36 animate-pulse rounded-full bg-zinc-900/10" />

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <AdminCardSkeleton key={index} />
        ))}
      </div>
    </main>
  );
}
