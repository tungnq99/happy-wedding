"use client";

import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ConfirmDialog } from "@/app/components/confirm-dialog";

type MediaItem = {
  id: string;
  url: string;
  caption: string | null;
  sortOrder: number;
};

type Props = {
  weddingId: string;
  weddingSlug: string;
  media: MediaItem[];
};

type UploadUrlResponse =
  | {
    ok: true;
    provider: "r2";
    signedUrl: string;
    publicUrl: string;
  }
  | {
    ok: true;
    provider: "cloudinary";
    uploadUrl: string;
    params: Record<string, string | number>;
    error?: string;
  }
  | {
    ok: false;
    error?: string;
  };

type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: {
    message?: string;
  };
};

type XhrResult = {
  status: number;
  responseText: string;
};

const INITIAL_VISIBLE_COUNT = 12;
const LOAD_MORE_COUNT = 12;

function xhrUpload(
  url: string,
  options: {
    method: "PUT" | "POST";
    body: File | FormData;
    headers?: Record<string, string>;
    onProgress?: (percent: number) => void;
  },
) {
  return new Promise<XhrResult>((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(options.method, url);

    if (options.headers) {
      for (const [key, value] of Object.entries(options.headers)) {
        xhr.setRequestHeader(key, value);
      }
    }

    xhr.upload.onprogress = (event) => {
      if (!event.lengthComputable || !options.onProgress) {
        return;
      }
      const percent = Math.round((event.loaded / event.total) * 100);
      options.onProgress(percent);
    };

    xhr.onload = () => {
      resolve({
        status: xhr.status,
        responseText: xhr.responseText,
      });
    };

    xhr.onerror = () => reject(new Error("Network error while uploading."));
    xhr.send(options.body);
  });
}

export function MediaManager({ weddingId, weddingSlug, media }: Props) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<string>("");
  const [manualUrl, setManualUrl] = useState("");
  const [progress, setProgress] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);
  const [mediaIdToDelete, setMediaIdToDelete] = useState<string | null>(null);

  const visibleMedia = isExpanded ? media.slice(0, visibleCount) : [];
  const hasMoreMedia = visibleCount < media.length;

  async function uploadOneFile(file: File, onProgress: (percent: number) => void) {
    const uploadRes = await fetch("/api/upload-url", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weddingSlug,
        filename: file.name,
        contentType: file.type || "application/octet-stream",
      }),
    });

    const uploadJson = (await uploadRes.json()) as UploadUrlResponse;
    if (!uploadRes.ok) {
      throw new Error("Cannot create upload URL.");
    }

    if (!uploadJson.ok) {
      throw new Error(uploadJson.error || "Cannot create upload URL.");
    }

    let uploadedUrl: string;

    if (uploadJson.provider === "r2") {
      const result = await xhrUpload(uploadJson.signedUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type || "application/octet-stream",
        },
        onProgress,
      });

      if (result.status < 200 || result.status >= 300) {
        throw new Error("Upload to R2 failed.");
      }

      uploadedUrl = uploadJson.publicUrl;
    } else {
      const formData = new FormData();
      for (const [key, value] of Object.entries(uploadJson.params)) {
        formData.append(key, String(value));
      }
      formData.append("file", file);

      const result = await xhrUpload(uploadJson.uploadUrl, {
        method: "POST",
        body: formData,
        onProgress,
      });

      let cloudinaryJson: CloudinaryUploadResponse = {};
      try {
        cloudinaryJson = JSON.parse(result.responseText) as CloudinaryUploadResponse;
      } catch {
        cloudinaryJson = {};
      }

      if (result.status < 200 || result.status >= 300 || !cloudinaryJson.secure_url) {
        throw new Error(cloudinaryJson.error?.message || "Upload to Cloudinary failed.");
      }

      uploadedUrl = cloudinaryJson.secure_url;
    }

    const createRes = await fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weddingId,
        url: uploadedUrl,
      }),
    });

    if (!createRes.ok) {
      throw new Error("Save image to database failed.");
    }
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []);
    if (files.length === 0) {
      return;
    }

    setIsUploading(true);
    setIsExpanded(true);
    setVisibleCount((current) => Math.max(current, INITIAL_VISIBLE_COUNT));
    setProgress(0);
    setStatus("Uploading images...");

    try {
      for (let i = 0; i < files.length; i += 1) {
        setStatus(`Uploading ${i + 1}/${files.length}: ${files[i].name}`);

        await uploadOneFile(files[i], (filePercent) => {
          const overall = Math.round(((i + filePercent / 100) / files.length) * 100);
          setProgress(overall);
        });
      }

      setProgress(100);
      setStatus("Upload completed.");
      startTransition(() => router.refresh());
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed.";
      setStatus(message);
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  async function confirmDelete() {
    if (!mediaIdToDelete) {
      return;
    }

    setStatus("Deleting image...");
    const res = await fetch("/api/admin/media", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weddingId, mediaId: mediaIdToDelete }),
    });

    if (!res.ok) {
      setStatus("Delete failed.");
      return;
    }

    setMediaIdToDelete(null);
    setStatus("Image deleted.");
    startTransition(() => router.refresh());
  }

  async function handleAddManualUrl(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = manualUrl.trim();
    if (!trimmed) {
      return;
    }

    setStatus("Adding image from URL...");
    setIsExpanded(true);
    const res = await fetch("/api/admin/media", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        weddingId,
        url: trimmed,
      }),
    });

    if (!res.ok) {
      setStatus("Add image failed.");
      return;
    }

    setManualUrl("");
    setStatus("Image added.");
    startTransition(() => router.refresh());
  }

  return (
    <>
      <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Wedding album</h2>
            <p className="mt-2 text-sm text-zinc-500">Uploaded photos will appear on the public gallery.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setIsExpanded((open) => !open)}
              className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              {isExpanded ? "Ẩn album" : `Xem album (${media.length})`}
            </button>

            <label className="cursor-pointer rounded-full bg-zinc-900 px-4 py-2 text-sm text-white">
              {isUploading ? "Uploading..." : "Upload images"}
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileChange}
                disabled={isUploading || isPending}
              />
            </label>
          </div>
        </div>

        <form onSubmit={handleAddManualUrl} className="mt-4 flex flex-col gap-3 sm:flex-row">
          <input
            value={manualUrl}
            onChange={(event) => setManualUrl(event.target.value)}
            placeholder="Thêm ảnh bằng URL https://..."
            className="w-full rounded-xl border border-zinc-300 px-4 py-2.5 text-sm"
            disabled={isUploading || isPending}
          />
          <button
            type="submit"
            className="rounded-full border border-zinc-300 px-4 py-2.5 text-sm text-zinc-700 hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!manualUrl.trim() || isUploading || isPending}
          >
            Add URL
          </button>
        </form>

        {isUploading && (
          <div className="mt-3">
            <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
              <div className="h-full rounded-full bg-zinc-900 transition-all duration-200" style={{ width: `${progress}%` }} />
            </div>
            <p className="mt-1 text-xs text-zinc-500">{progress}%</p>
          </div>
        )}

        {status && <p className="mt-3 text-sm text-zinc-600">{status}</p>}

        {!isExpanded && media.length > 0 && (
          <div className="mt-5 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-5 text-sm text-zinc-500">
            Album đang được thu gọn để trang chỉnh sửa mở nhanh hơn. Bấm "Xem album" khi bạn cần kiểm tra ảnh.
          </div>
        )}

        {isExpanded && (
          <div className="mt-5">
            <div className="max-h-[720px] overflow-y-auto pr-1">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {visibleMedia.map((item) => (
                  <article key={item.id} className="overflow-hidden rounded-xl border border-zinc-200">
                    <div className="relative aspect-[4/3] w-full bg-zinc-100">
                      <Image
                        src={item.url}
                        alt={item.caption ?? "Wedding photo"}
                        fill
                        className="object-cover"
                        sizes="(min-width: 1024px) 20rem, (min-width: 640px) 45vw, 100vw"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 p-3 text-sm">
                      <span className="truncate text-zinc-600">{item.caption || `Image #${item.sortOrder + 1}`}</span>
                      <button
                        type="button"
                        onClick={() => setMediaIdToDelete(item.id)}
                        className="rounded-full border border-red-300 px-3 py-1 text-xs text-red-700"
                        disabled={isUploading || isPending}
                      >
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </div>

            {hasMoreMedia && (
              <div className="mt-4 flex justify-center">
                <button
                  type="button"
                  onClick={() => setVisibleCount((current) => Math.min(current + LOAD_MORE_COUNT, media.length))}
                  className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
                >
                  Xem thêm ảnh
                </button>
              </div>
            )}
          </div>
        )}

        {media.length === 0 && <p className="mt-4 text-zinc-500">No images yet.</p>}
      </section>

      <ConfirmDialog
        open={mediaIdToDelete !== null}
        title="Xác nhận xóa ảnh"
        message="Bạn có muốn xóa ảnh khỏi album?"
        confirmText="Xác nhận"
        cancelText="Hủy"
        destructive={true}
        loading={isPending}
        onCancel={() => setMediaIdToDelete(null)}
        onConfirm={() => void confirmDelete()}
      />
    </>
  );
}
