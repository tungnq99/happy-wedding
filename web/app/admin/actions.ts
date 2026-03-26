"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { buildWeddingSlug } from "@/lib/slug";
import { EventType } from "@prisma/client";

async function requireUser() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/admin");
  }
  return userId;
}

async function assertWeddingOwner(weddingId: string, userId: string) {
  const wedding = await prisma.wedding.findUnique({
    where: { id: weddingId },
    select: { id: true, ownerClerkId: true },
  });

  if (!wedding || wedding.ownerClerkId !== userId) {
    throw new Error("Không có quyền thao tác wedding này");
  }

  return wedding;
}

export async function createWeddingAction(formData: FormData) {
  const userId = await requireUser();

  const title = String(formData.get("title") || "").trim();
  const groomName = String(formData.get("groomName") || "").trim();
  const brideName = String(formData.get("brideName") || "").trim();
  const eventDateRaw = String(formData.get("eventDate") || "").trim();

  if (!title || !groomName || !brideName || !eventDateRaw) {
    throw new Error("Thiếu dữ liệu bắt buộc");
  }

  const wedding = await prisma.wedding.create({
    data: {
      ownerClerkId: userId,
      slug: buildWeddingSlug(title),
      title,
      groomName,
      brideName,
      eventDate: new Date(eventDateRaw),
      heroSubtitle: "Trân trọng kính mời",
      theme: {
        create: {},
      },
    },
  });
  await prisma.event.createMany({
    data: [
      {
        weddingId: wedding.id,
        name: "Lễ vu quy",
        type: "CEREMONY",
        startsAt: wedding.eventDate,
        venueName: "Nhà riêng",
        address: "Vui lòng cập nhật địa chỉ",
        sortOrder: 1,
      },
      {
        weddingId: wedding.id,
        name: "Lễ cưới",
        type: "RECEPTION",
        startsAt: wedding.eventDate,
        venueName: "Nhà hàng tiệc cưới",
        address: "Vui lòng cập nhật địa chỉ",
        sortOrder: 2,
      },
    ],
  });

  revalidatePath("/admin");
  redirect(`/admin/${wedding.id}`);
}

export async function updateWeddingAction(formData: FormData) {
  const userId = await requireUser();

  const weddingId = String(formData.get("weddingId") || "");
  const title = String(formData.get("title") || "").trim();
  const heroSubtitle = String(formData.get("heroSubtitle") || "").trim();
  const story = String(formData.get("story") || "").trim();
  const coverImageUrl = String(formData.get("coverImageUrl") || "").trim();
  const bankQrImageUrl = String(formData.get("bankQrImageUrl") || "").trim();
  const bankName = String(formData.get("bankName") || "").trim();
  const bankAccountNumber = String(formData.get("bankAccountNumber") || "").trim();
  const bankAccountName = String(formData.get("bankAccountName") || "").trim();

  const groomBankQrImageUrl = String(formData.get("groomBankQrImageUrl") || "").trim();
  const groomBankName = String(formData.get("groomBankName") || "").trim();
  const groomBankAccountNumber = String(formData.get("groomBankAccountNumber") || "").trim();
  const groomBankAccountName = String(formData.get("groomBankAccountName") || "").trim();

  const brideBankQrImageUrl = String(formData.get("brideBankQrImageUrl") || "").trim();
  const brideBankName = String(formData.get("brideBankName") || "").trim();
  const brideBankAccountNumber = String(formData.get("brideBankAccountNumber") || "").trim();
  const brideBankAccountName = String(formData.get("brideBankAccountName") || "").trim();

  await assertWeddingOwner(weddingId, userId);

  const coreData = {
    title,
    heroSubtitle,
    story,
    coverImageUrl: coverImageUrl || null,
  };

  const legacyBankData = {
    bankQrImageUrl: bankQrImageUrl || groomBankQrImageUrl || null,
    bankName: bankName || groomBankName || null,
    bankAccountNumber: bankAccountNumber || groomBankAccountNumber || null,
    bankAccountName: bankAccountName || groomBankAccountName || null,
  };

  // Layer 1: always save core content first.
  await prisma.wedding.update({
    where: { id: weddingId },
    data: coreData,
    select: { id: true },
  });

  // Layer 2: best-effort update for legacy single-bank fields.
  try {
    await prisma.wedding.update({
      where: { id: weddingId },
      data: legacyBankData,
      select: { id: true },
    });
  } catch {
    // no-op
  }

  // Layer 3: best-effort update for new groom/bride fields.
  try {
    await prisma.wedding.update({
      where: { id: weddingId },
      data: {
        groomBankQrImageUrl: groomBankQrImageUrl || null,
        groomBankName: groomBankName || null,
        groomBankAccountNumber: groomBankAccountNumber || null,
        groomBankAccountName: groomBankAccountName || null,
        brideBankQrImageUrl: brideBankQrImageUrl || null,
        brideBankName: brideBankName || null,
        brideBankAccountNumber: brideBankAccountNumber || null,
        brideBankAccountName: brideBankAccountName || null,
      },
      select: { id: true },
    });
  } catch {
    // no-op
  }

  revalidatePath(`/admin/${weddingId}`);
}

export async function deleteWeddingAction(formData: FormData) {
  const userId = await requireUser();

  const weddingId = String(formData.get("weddingId") || "");
  await assertWeddingOwner(weddingId, userId);

  await prisma.wedding.delete({
    where: { id: weddingId },
  });

  revalidatePath("/admin");
}

export async function createEventAction(formData: FormData) {
  const userId = await requireUser();

  const weddingId = String(formData.get("weddingId") || "");
  const eventTypeRaw = String(formData.get("type") || "OTHER").trim().toUpperCase();
  const name = String(formData.get("name") || "").trim();
  const startsAt = String(formData.get("startsAt") || "").trim();
  const venueName = String(formData.get("venueName") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const mapsUrl = String(formData.get("mapsUrl") || "").trim();

  await assertWeddingOwner(weddingId, userId);

  const count = await prisma.event.count({ where: { weddingId } });
  const type = eventTypeRaw === "CEREMONY" || eventTypeRaw === "RECEPTION" ? eventTypeRaw : "OTHER";

  await prisma.event.create({
    data: {
      weddingId,
      name,
      type,
      startsAt: new Date(startsAt),
      venueName,
      address,
      mapsUrl: mapsUrl || null,
      sortOrder: count + 1,
    },
  });

  revalidatePath(`/admin/${weddingId}`);
}

export async function updateEventAction(formData: FormData) {
  const userId = await requireUser();

  const weddingId = String(formData.get("weddingId") || "");
  const eventId = String(formData.get("eventId") || "");
  const name = String(formData.get("name") || "").trim();
  const startsAt = String(formData.get("startsAt") || "").trim();
  const venueName = String(formData.get("venueName") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const mapsUrl = String(formData.get("mapsUrl") || "").trim();

  await assertWeddingOwner(weddingId, userId);

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { weddingId: true },
  });

  if (!event || event.weddingId !== weddingId) {
    throw new Error("Sự kiện không hợp lệ");
  }

  await prisma.event.update({
    where: { id: eventId },
    data: {
      name,
      startsAt: new Date(startsAt),
      venueName,
      address,
      mapsUrl: mapsUrl || null,
    },
  });

  revalidatePath(`/admin/${weddingId}`);
}

export async function updatePrimaryEventsAction(formData: FormData) {
  const userId = await requireUser();

  const weddingId = String(formData.get("weddingId") || "").trim();
  await assertWeddingOwner(weddingId, userId);

  const primaryTemplates = [
    { type: "CEREMONY" as const, defaultName: "L\u1EC5 vu quy", sortOrder: 1 },
    { type: "RECEPTION" as const, defaultName: "L\u1EC5 c\u01B0\u1EDBi", sortOrder: 2 },
  ];

  for (const template of primaryTemplates) {
    const suffix = template.type;
    const eventId = String(formData.get("eventId_" + suffix) || "").trim();
    const name = String(formData.get("name_" + suffix) || "").trim() || template.defaultName;
    const startsAtRaw = String(formData.get("startsAt_" + suffix) || "").trim();
    const venueName = String(formData.get("venueName_" + suffix) || "").trim();
    const address = String(formData.get("address_" + suffix) || "").trim();
    const mapsUrl = String(formData.get("mapsUrl_" + suffix) || "").trim();

    if (!startsAtRaw || !venueName || !address) {
      continue;
    }

    if (eventId) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        select: { weddingId: true },
      });

      if (!event || event.weddingId !== weddingId) {
        continue;
      }

      await prisma.event.update({
        where: { id: eventId },
        data: {
          name,
          type: template.type,
          startsAt: new Date(startsAtRaw),
          venueName,
          address,
          mapsUrl: mapsUrl || null,
        },
      });
    } else {
      await prisma.event.create({
        data: {
          weddingId,
          name,
          type: template.type,
          startsAt: new Date(startsAtRaw),
          venueName,
          address,
          mapsUrl: mapsUrl || null,
          sortOrder: template.sortOrder,
        },
      });
    }
  }

  revalidatePath("/admin/" + weddingId);
}

export async function deleteEventAction(formData: FormData) {
  const userId = await requireUser();

  const weddingId = String(formData.get("weddingId") || "");
  const eventId = String(formData.get("eventId") || "");

  await assertWeddingOwner(weddingId, userId);

  const event = await prisma.event.findUnique({
    where: { id: eventId },
    select: { weddingId: true },
  });

  if (!event || event.weddingId !== weddingId) {
    throw new Error("Sự kiện không hợp lệ");
  }

  await prisma.event.delete({ where: { id: eventId } });

  revalidatePath(`/admin/${weddingId}`);
}

export async function createStoryAction(formData: FormData) {
  const userId = await requireUser();

  const weddingId = String(formData.get("weddingId") || "");
  const dateText = String(formData.get("dateText") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();

  await assertWeddingOwner(weddingId, userId);

  if (!dateText || !title || !content) {
    throw new Error("Missing required story fields");
  }

  const count = await prisma.story.count({ where: { weddingId } });

  await prisma.story.create({
    data: {
      weddingId,
      dateText,
      title,
      content,
      imageUrl: imageUrl || null,
      sortOrder: count + 1,
    },
  });

  revalidatePath(`/admin/${weddingId}`);
}

export async function updateStoryAction(formData: FormData) {
  const userId = await requireUser();

  const weddingId = String(formData.get("weddingId") || "");
  const storyId = String(formData.get("storyId") || "");
  const dateText = String(formData.get("dateText") || "").trim();
  const title = String(formData.get("title") || "").trim();
  const content = String(formData.get("content") || "").trim();
  const imageUrl = String(formData.get("imageUrl") || "").trim();

  await assertWeddingOwner(weddingId, userId);

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: { weddingId: true },
  });

  if (!story || story.weddingId !== weddingId) {
    throw new Error("Story not found");
  }

  await prisma.story.update({
    where: { id: storyId },
    data: {
      dateText,
      title,
      content,
      imageUrl: imageUrl || null,
    },
  });

  revalidatePath(`/admin/${weddingId}`);
}

export async function deleteStoryAction(formData: FormData) {
  const userId = await requireUser();

  const weddingId = String(formData.get("weddingId") || "");
  const storyId = String(formData.get("storyId") || "");

  await assertWeddingOwner(weddingId, userId);

  const story = await prisma.story.findUnique({
    where: { id: storyId },
    select: { weddingId: true },
  });

  if (!story || story.weddingId !== weddingId) {
    throw new Error("Story not found");
  }

  await prisma.story.delete({
    where: { id: storyId },
  });

  revalidatePath(`/admin/${weddingId}`);
}

export async function upsertBothFixedEventsAction(formData: FormData) {
  const userId = await requireUser();
  const weddingId = String(formData.get("weddingId") || "");
  await assertWeddingOwner(weddingId, userId);

  const types: EventType[] = ["CEREMONY", "RECEPTION"];

  for (const typeStr of types) {
    const name = String(formData.get(`${typeStr}_name`) || "").trim();
    const startsAt = String(formData.get(`${typeStr}_startsAt`) || "").trim();
    const venueName = String(formData.get(`${typeStr}_venueName`) || "").trim();
    const address = String(formData.get(`${typeStr}_address`) || "").trim();
    const mapsUrl = String(formData.get(`${typeStr}_mapsUrl`) || "").trim();

    const existing = await prisma.event.findFirst({
      where: { weddingId, type: typeStr },
    });

    if (existing) {
      await prisma.event.update({
        where: { id: existing.id },
        data: {
          name,
          startsAt: startsAt ? new Date(startsAt) : existing.startsAt,
          venueName,
          address,
          mapsUrl: mapsUrl || null,
        },
      });
    } else {
      await prisma.event.create({
        data: {
          weddingId,
          type: typeStr,
          name: name || (typeStr === "CEREMONY" ? "Lễ vu quy" : "Tiệc cưới"),
          startsAt: startsAt ? new Date(startsAt) : new Date(),
          venueName,
          address,
          mapsUrl: mapsUrl || null,
          sortOrder: typeStr === "RECEPTION" ? 2 : 1,
        },
      });
    }
  }

  revalidatePath(`/admin/${weddingId}`);
}
