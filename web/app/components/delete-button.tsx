"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { ConfirmDialog } from "./confirm-dialog";

type Props = {
  confirmMessage: string;
  label: string;
  className?: string;
};

export function DeleteButton({ confirmMessage, label, className }: Props) {
  const { pending } = useFormStatus();
  const [open, setOpen] = useState(false);
  const [formEl, setFormEl] = useState<HTMLFormElement | null>(null);

  return (
    <>
      <button
        type="button"
        disabled={pending}
        className={className}
        onClick={(event) => {
          setFormEl(event.currentTarget.closest("form"));
          setOpen(true);
        }}
      >
        {pending ? "Đang xóa..." : label}
      </button>

      <ConfirmDialog
        open={open}
        title="Xác nhận xóa"
        message={confirmMessage}
        confirmText="Xóa"
        cancelText="Huỷ"
        destructive={true}
        loading={pending}
        onCancel={() => setOpen(false)}
        onConfirm={() => {
          setOpen(false);
          formEl?.requestSubmit();
        }}
      />
    </>
  );
}
