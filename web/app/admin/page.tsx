import Link from "next/link";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { deleteWeddingAction } from "./actions";
import { DeleteButton } from "@/app/components/delete-button";

export default async function AdminPage() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in?redirect_url=/admin");
  }

  const weddings = await prisma.wedding.findMany({
    where: { ownerClerkId: userId },
    select: {
      id: true,
      slug: true,
      title: true,
      groomName: true,
      brideName: true,
      createdAt: true,
      _count: {
        select: {
          rsvps: true,
          wishes: true,
          events: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-zinc-500">Quản trị Happy Wedding</p>
          <h1 className="text-3xl font-semibold">Danh sách wedding site</h1>
        </div>
        <UserButton />
      </div>

      <div className="mt-6 flex gap-3">
        <Link href="/admin/new" className="rounded-full bg-zinc-900 px-5 py-2.5 text-white">
          Tạo wedding mới
        </Link>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        {weddings.map((wedding) => (
          <article key={wedding.id} className="relative rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <Link
              href={`/${wedding.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-full border border-zinc-200 text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-900"
              aria-label={`Mo trang cuoi ${wedding.title}`}
              title="Mo landing page"
            >
              {"\u2197"}
            </Link>

            <Link href={`/admin/${wedding.id}`} className="block">
              <h2 className="mt-2 text-2xl font-semibold">Lễ cưới {wedding.title}</h2>
              <p className="mt-1 text-zinc-600">
                Chú rể: {wedding.groomName} - Cô dâu: {wedding.brideName}
              </p>
            </Link>

            <div className="mt-4 flex flex-wrap gap-4 text-sm text-zinc-500">
              <span>{wedding._count.events} sự kiện</span>
              <span>{wedding._count.rsvps} RSVP</span>
              <span>{wedding._count.wishes} lời chúc</span>
            </div>

            <div className="mt-5 flex items-center justify-between gap-3">
              <Link href={`/admin/${wedding.id}`} className="rounded-full border border-zinc-300 px-4 py-2 text-sm">
                Chỉnh sửa
              </Link>
              <form action={deleteWeddingAction}>
                <input type="hidden" name="weddingId" value={wedding.id} />
                <DeleteButton
                  confirmMessage="Xóa wedding này và toàn bộ dữ liệu liên quan?"
                  label="Xóa"
                  className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-700"
                />
              </form>
            </div>
          </article>
        ))}
      </div>

      {weddings.length === 0 && (
        <div className="mt-10 rounded-2xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500">
          Chưa có wedding site nào. Hãy tạo site đầu tiên.
        </div>
      )}
    </main>
  );
}
