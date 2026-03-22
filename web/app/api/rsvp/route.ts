import { z } from "zod";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  weddingId: z.string().min(1),
  guestName: z.string().min(1).max(120),
  phone: z.string().max(30).optional().or(z.literal("")),
  attending: z.boolean(),
  seats: z.number().int().min(1).max(10),
  message: z.string().max(500).optional().or(z.literal("")),
});

export async function POST(request: Request) {
  try {
    const payload = schema.parse(await request.json());

    await prisma.rSVP.create({
      data: {
        weddingId: payload.weddingId,
        guestName: payload.guestName,
        phone: payload.phone || null,
        attending: payload.attending,
        seats: payload.seats,
        message: payload.message || null,
      },
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}