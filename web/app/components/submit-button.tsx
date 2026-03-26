"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

type SubmitButtonProps = {
  children: React.ReactNode;
  className?: string;
  loadingText?: string;
  variant?: "primary" | "danger" | "outline";
};

export function SubmitButton({
  children,
  className = "",
  loadingText = "Đang xử lý...",
  variant = "primary",
}: SubmitButtonProps) {
  const { pending } = useFormStatus();

  let baseClass = "inline-flex h-10 items-center justify-center rounded-xl px-6 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ";

  if (variant === "primary") {
    baseClass += "bg-zinc-900 text-white hover:bg-zinc-800";
  } else if (variant === "danger") {
    baseClass += "bg-red-500 text-white hover:bg-red-600";
  } else if (variant === "outline") {
    baseClass += "border border-zinc-200 bg-transparent hover:bg-zinc-100 text-zinc-900";
  }

  return (
    <button type="submit" disabled={pending} className={`${baseClass} ${className}`}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? loadingText : children}
    </button>
  );
}
