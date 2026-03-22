"use client";

import { useState } from "react";
import { MessageCircle, Gift, CircleDollarSign, X, Menu } from "lucide-react";

export function FloatingMenu({ primaryColor }: { primaryColor: string }) {
  const [isOpen, setIsOpen] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const scrollTo = (id: string, label: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
      setIsOpen(false);
      return;
    }

    setNotice(`Chưa tìm thấy mục "${label}" trên trang.`);
    window.setTimeout(() => setNotice(null), 1800);
  };

  const items = [
    {
      targetId: "guestbook",
      icon: <MessageCircle size={20} />,
      label: "Gửi lời chúc",
    },
    {
      targetId: "rsvp",
      icon: <Gift size={20} />,
      label: "Đồng ý đi hay không?",
    },
    {
      targetId: "gift",
      icon: <CircleDollarSign size={20} />,
      label: "Mừng cưới",
    },
  ];

  return (
    <div className="fixed bottom-6 right-4 z-50 flex flex-col items-end gap-3">
      {isOpen && (
        <div className="mb-2 flex flex-col gap-3 animate-in slide-in-from-bottom-5 fade-in duration-300">
          {items.map((item) => (
            <button
              key={item.targetId}
              onClick={() => scrollTo(item.targetId, item.label)}
              className="group relative flex h-12 w-12 items-center justify-center rounded-full text-white shadow-xl transition-transform duration-300 hover:scale-110"
              style={{ background: primaryColor }}
              aria-label={item.label}
            >
              {item.icon}
              <span className="pointer-events-none absolute right-14 whitespace-nowrap rounded-md bg-white px-3 py-1.5 text-xs font-bold text-gray-700 opacity-0 shadow-md transition-opacity group-hover:opacity-100">
                {item.label}
              </span>
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl transition-transform duration-300 hover:scale-105"
        style={{ background: primaryColor }}
        aria-label="Menu"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {notice && (
        <p className="max-w-[220px] rounded-md bg-black/80 px-3 py-2 text-xs text-white shadow-md">
          {notice}
        </p>
      )}
    </div>
  );
}
