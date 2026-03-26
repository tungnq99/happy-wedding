"use client";

import { useRef } from "react";
import toast from "react-hot-toast";

type ActionFormProps = {
  action: (formData: FormData) => Promise<any>;
  children: React.ReactNode;
  successMessage?: string;
  className?: string;
  resetOnSuccess?: boolean;
};

export function ActionForm({
  action,
  children,
  successMessage = "Thao tác thành công!",
  className = "",
  resetOnSuccess = false,
}: ActionFormProps) {
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (formData: FormData) => {
    try {
      await action(formData);
      toast.success(successMessage);
      if (resetOnSuccess) {
        formRef.current?.reset();
      }
    } catch (error: any) {
      toast.error(error.message || "Đã xảy ra lỗi, vui lòng thử lại.");
    }
  };

  return (
    <form ref={formRef} action={handleSubmit} className={className}>
      {children}
    </form>
  );
}
