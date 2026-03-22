import { createHash } from "crypto";
import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { createUploadUrl, r2PublicUrl } from "@/lib/r2";

const schema = z.object({
  weddingSlug: z.string().min(1),
  filename: z.string().min(1),
  contentType: z.string().min(1),
});

function toSafeName(filename: string) {
  return filename
    .replace(/\.[^/.]+$/, "")
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60) || "image";
}

function getCloudinaryConfig() {
  const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    return null;
  }

  return { cloudName, apiKey, apiSecret };
}

function createCloudinarySignature(params: Record<string, string | number>, apiSecret: string) {
  const toSign = Object.keys(params)
    .sort()
    .map((key) => `${key}=${params[key]}`)
    .join("&");

  return createHash("sha1").update(`${toSign}${apiSecret}`).digest("hex");
}

export async function POST(request: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const payload = schema.parse(await request.json());

    const cloudinary = getCloudinaryConfig();
    if (cloudinary) {
      const timestamp = Math.floor(Date.now() / 1000);
      const publicId = `${Date.now()}-${toSafeName(payload.filename)}`;
      const folder = `weddings/${payload.weddingSlug}`;
      const paramsToSign = {
        folder,
        public_id: publicId,
        timestamp,
      };
      const signature = createCloudinarySignature(paramsToSign, cloudinary.apiSecret);

      return NextResponse.json({
        ok: true,
        provider: "cloudinary",
        uploadUrl: `https://api.cloudinary.com/v1_1/${cloudinary.cloudName}/image/upload`,
        params: {
          ...paramsToSign,
          api_key: cloudinary.apiKey,
          signature,
        },
      });
    }

    const hasR2Config = Boolean(
      process.env.R2_ACCOUNT_ID &&
        process.env.R2_ACCESS_KEY_ID &&
        process.env.R2_SECRET_ACCESS_KEY &&
        process.env.R2_BUCKET &&
        r2PublicUrl,
    );

    if (hasR2Config) {
      const ext = payload.filename.split(".").pop();
      const safeExt = ext ? `.${ext}` : "";
      const key = `weddings/${payload.weddingSlug}/${Date.now()}${safeExt}`;
      const { signedUrl } = await createUploadUrl(key, payload.contentType);

      return NextResponse.json({
        ok: true,
        provider: "r2",
        signedUrl,
        key,
        publicUrl: `${r2PublicUrl}/${key}`,
      });
    }

    return NextResponse.json(
      {
        ok: false,
        error: "Upload provider is not configured. Set Cloudinary env vars or R2 env vars.",
      },
      { status: 400 },
    );
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid upload request" }, { status: 400 });
  }
}
