"use client";

import { useFormStatus } from "react-dom";

type Props = {
  confirmMessage: string;
  label: string;
  className?: string;
};

export function DeleteButton({ confirmMessage, label, className }: Props) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className={className}
      onClick={(e) => {
        if (!confirm(confirmMessage)) {
          e.preventDefault();
        }
      }}
    >
      {pending ? "Đang xóa..." : label}
    </button>
  );
}
