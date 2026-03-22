"use client";

import { useState } from "react";

type Props = {
  weddingId: string;
  disabled?: boolean;
};

export function WishForm({ weddingId, disabled = false }: Props) {
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
      const response = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          weddingId,
          guestName: formData.get("guestName"),
          content: formData.get("content"),
        }),
      });

      if (!response.ok) throw new Error();
      setSuccess(true);
      setFeedback("Lời chúc đã được gửi thành công. Cảm ơn bạn! 💌");
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
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        </div>
        <div>
          <h3 className="font-heading text-xl font-semibold text-rose-950">Gửi lời chúc</h3>
          <p className="text-xs text-zinc-400">Một lời chúc ý nghĩa từ trái tim</p>
        </div>
      </div>

      <input required name="guestName" placeholder="Họ và tên *" className={inputCls} />
      <textarea
        required
        name="content"
        rows={5}
        placeholder="Viết lời chúc của bạn tới cô dâu và chú rể..."
        className={inputCls + " resize-none leading-relaxed"}
      />

      <button
        disabled={loading || success}
        className="rounded-full py-3 text-sm font-semibold text-white transition-all hover:opacity-90 hover:-translate-y-0.5 disabled:opacity-60"
        style={{ background: "linear-gradient(135deg,#c2434e,#9d2835)" }}
      >
        {loading ? "Đang gửi..." : success ? "Đã gửi lời chúc ✓" : "Gửi lời chúc 💌"}
      </button>

      {feedback && (
        <p className={`rounded-xl px-4 py-2.5 text-sm ${success ? "bg-rose-50 text-rose-700" : "bg-zinc-50 text-zinc-500"}`}>
          {feedback}
        </p>
      )}
    </form>
  );
}