import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  weddingId: z.string().min(1),
  guestName: z.string().min(1).max(120),
  content: z.string().min(1).max(500),
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());

    await prisma.wish.create({
      data: {
        weddingId: payload.weddingId,
        guestName: payload.guestName,
        content: payload.content,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}