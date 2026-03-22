"use client";

import Image from "next/image";
import { useRef, useState } from "react";

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
    }
  | {
      ok: false;
      error?: string;
    };

type CloudinaryUploadResponse = {
  secure_url?: string;
  error?: { message?: string };
};

type Props = {
  label: string;
  fieldName: string;
  weddingSlug: string;
  initialUrl?: string;
  note?: string;
};

type XhrResult = {
  status: number;
  responseText: string;
};

function xhrUpload(
  url: string,
  options: {
    method: "PUT" | "POST";
    body: FormData | File;
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

export function UploadImageField({ label, fieldName, weddingSlug, initialUrl = "", note }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState(initialUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState("");

  async function handlePickFile(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setIsUploading(true);
    setProgress(0);
    setStatus(`Uploading ${file.name}...`);

    try {
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
      if (!uploadRes.ok || !uploadJson.ok) {
        throw new Error(uploadJson.error || "Cannot create upload URL.");
      }

      let uploadedUrl = "";

      if (uploadJson.provider === "r2") {
        const result = await xhrUpload(uploadJson.signedUrl, {
          method: "PUT",
          body: file,
          headers: {
            "Content-Type": file.type || "application/octet-stream",
          },
          onProgress: setProgress,
        });

        if (result.status < 200 || result.status >= 300) {
          throw new Error("Upload to R2 failed.");
        }
        uploadedUrl = uploadJson.publicUrl;
      } else {
        const formData = new FormData();
        for (const [key, val] of Object.entries(uploadJson.params)) {
          formData.append(key, String(val));
        }
        formData.append("file", file);

        const result = await xhrUpload(uploadJson.uploadUrl, {
          method: "POST",
          body: formData,
          onProgress: setProgress,
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

      setValue(uploadedUrl);
      setProgress(100);
      setStatus("Upload done.");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : "Upload failed.");
    } finally {
      setIsUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="grid gap-2">
      <span className="text-sm font-medium">{label}</span>
      <input type="hidden" name={fieldName} value={value} />

      <div className="flex flex-wrap items-center gap-3">
        <label className="cursor-pointer rounded-full border border-zinc-300 px-4 py-2 text-sm hover:bg-zinc-50">
          {isUploading ? "Uploading..." : "Upload image"}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handlePickFile}
            disabled={isUploading}
          />
        </label>
        {value && (
          <button
            type="button"
            className="rounded-full border border-zinc-300 px-4 py-2 text-sm text-zinc-600 hover:bg-zinc-50"
            onClick={() => setValue("")}
          >
            Clear
          </button>
        )}
      </div>

      {isUploading && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-zinc-200">
          <div className="h-full rounded-full bg-zinc-900 transition-all duration-200" style={{ width: `${progress}%` }} />
        </div>
      )}

      {value && (
        <div className="relative mt-1 aspect-[16/9] w-full max-w-md overflow-hidden rounded-lg border border-zinc-200">
          <Image src={value} alt={label} fill className="object-cover" />
        </div>
      )}

      {status && <p className="text-xs text-zinc-500">{status}</p>}
      {note && <p className="text-xs text-zinc-500">{note}</p>}
    </div>
  );
}
