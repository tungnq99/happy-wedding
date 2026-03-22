import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

const createSchema = z.object({
  weddingId: z.string().min(1),
  url: z.string().url(),
  caption: z.string().trim().optional(),
});

const deleteSchema = z.object({
  weddingId: z.string().min(1),
  mediaId: z.string().min(1),
});

async function ensureOwnership(weddingId: string) {
  const { userId } = await auth();
  if (!userId) {
    return { ok: false as const, status: 401 };
  }

  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
    select: { ownerClerkId: true },
  });

  if (!wedding || wedding.ownerClerkId !== userId) {
    return { ok: false as const, status: 403 };
  }

  return { ok: true as const };
}

export async function POST(request: Request) {
  try {
    const payload = createSchema.parse(await request.json());

    const ownership = await ensureOwnership(payload.weddingId);
    if (!ownership.ok) {
      return NextResponse.json({ ok: false }, { status: ownership.status });
    }

    const count = await prisma.media.count({ where: { weddingId: payload.weddingId } });

    const media = await prisma.media.create({
      data: {
        weddingId: payload.weddingId,
        type: "IMAGE",
        url: payload.url,
        caption: payload.caption || null,
        sortOrder: count,
      },
      select: { id: true },
    });

    return NextResponse.json({ ok: true, id: media.id });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  try {
    const payload = deleteSchema.parse(await request.json());

    const ownership = await ensureOwnership(payload.weddingId);
    if (!ownership.ok) {
      return NextResponse.json({ ok: false }, { status: ownership.status });
    }

    const media = await prisma.media.findUnique({
      where: { id: payload.mediaId },
      select: { weddingId: true },
    });

    if (!media || media.weddingId !== payload.weddingId) {
      return NextResponse.json({ ok: false }, { status: 404 });
    }

    await prisma.media.delete({ where: { id: payload.mediaId } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}

