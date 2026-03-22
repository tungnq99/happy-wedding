"use client";

import { useState } from "react";

type Props = {
  weddingId: string;
  disabled?: boolean;
};

export function RSVPForm({ weddingId, disabled = false }: Props) {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function onSubmit(formData: FormData) {
    if (disabled) {
      setFeedback("Đây là trang demo — biểu mẫu chưa gửi dữ liệu thật.");
      return;
    }

    setLoading(true);
    setFeedback(null);

    try {
      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weddingId,
          guestName: formData.get("guestName"),
          phone: formData.get("phone"),
          attending: formData.get("attending") === "yes",
          seats: Number(formData.get("seats")),
          message: formData.get("message"),
        }),
      });

      if (!response.ok) throw new Error();
      setSuccess(true);
      setFeedback("Đã xác nhận thành công. Cảm ơn bạn! 🎉");
    } catch {
      setFeedback("Gửi thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  const inputCls =
    "w-full rounded-xl border border-rose-100 bg-rose-50/40 px-4 py-3 text-sm text-zinc-800 placeholder-zinc-400 transition focus:border-rose-300 focus:bg-white";

  return (
    <form
      action={onSubmit}
      className="grid gap-4 rounded-3xl border border-rose-100 bg-white p-7 shadow-lg shadow-rose-50"
    >
      {/* Header */}
      <div className="mb-1 flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-rose-700">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M9 11l3 3L22 4M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <div>
          <h3 className="font-heading text-xl font-semibold text-rose-950">Xác nhận tham dự</h3>
          <p className="text-xs text-zinc-400">Vui lòng xác nhận trước ngày cưới</p>
        </div>
      </div>

      <input required name="guestName" placeholder="Họ và tên *" className={inputCls} />
      <input name="phone" placeholder="Số điện thoại" className={inputCls} />

      <div className="grid grid-cols-2 gap-2">
        {[
          { value: "yes", label: "✓ Tôi sẽ tham dự", defaultChecked: true },
          { value: "no", label: "✕ Tôi không tham dự", defaultChecked: false },
        ].map((opt) => (
          <label
            key={opt.value}
            className="flex cursor-pointer items-center gap-2 rounded-xl border border-rose-100 bg-rose-50/50 px-3 py-2.5 text-sm text-zinc-700 transition hover:border-rose-300 hover:bg-rose-50"
          >
            <input
              type="radio"
              name="attending"
              value={opt.value}
              defaultChecked={opt.defaultChecked}
              className="accent-rose-700"
            />
            {opt.label}
          </label>
        ))}
      </div>

      <div className="relative">
        <input
          type="number"
          min={1}
          max={10}
          name="seats"
          defaultValue={1}
          className={inputCls}
          placeholder="Số người tham dự"
        />
      </div>

      <textarea
        name="message"
        rows={3}
        placeholder="Lời nhắn (tuỳ chọn)"
        className={inputCls + " resize-none"}
      />

      <button
        disabled={loading || success}
        className="rounded-full py-3 text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-60"
        style={{ background: "linear-gradient(135deg,#c2434e,#9d2835)" }}
      >
        {loading ? "Đang gửi..." : success ? "Đã xác nhận ✓" : "Gửi xác nhận"}
      </button>

      {feedback && (
        <p className={`rounded-xl px-4 py-2.5 text-sm ${success ? "bg-rose-50 text-rose-700" : "bg-zinc-50 text-zinc-500"}`}>
          {feedback}
        </p>
      )}
    </form>
  );
}