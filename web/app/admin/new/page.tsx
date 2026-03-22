import Link from "next/link";
import { createWeddingAction } from "../actions";

export default function NewWeddingPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <Link href="/admin" className="text-sm text-zinc-500">
        Quay lại trang quản trị
      </Link>
      <h1 className="mt-3 text-3xl font-semibold">Tạo wedding site mới</h1>

      <form action={createWeddingAction} className="mt-8 grid gap-4 rounded-2xl border border-zinc-200 bg-white p-6">
        <label className="grid gap-2">
          <span className="text-sm font-medium">Tiêu đề sự kiện</span>
          <input
            required
            name="title"
            placeholder="Lễ thành hôn Đức & Trang"
            className="rounded-xl border border-zinc-300 px-4 py-2.5"
          />
        </label>

        <div className="grid gap-4 md:grid-cols-2">
          <label className="grid gap-2">
            <span className="text-sm font-medium">Tên chú rể</span>
            <input required name="groomName" className="rounded-xl border border-zinc-300 px-4 py-2.5" />
          </label>
          <label className="grid gap-2">
            <span className="text-sm font-medium">Tên cô dâu</span>
            <input required name="brideName" className="rounded-xl border border-zinc-300 px-4 py-2.5" />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-sm font-medium">Ngày giờ chính</span>
          <input required type="datetime-local" name="eventDate" className="rounded-xl border border-zinc-300 px-4 py-2.5" />
        </label>

        <button className="mt-2 rounded-full bg-zinc-900 px-5 py-3 text-white">Tạo và vào trang chỉnh sửa</button>
      </form>
    </main>
  );
}
