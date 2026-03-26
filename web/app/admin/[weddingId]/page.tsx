import { Suspense } from "react";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { notFound, redirect } from "next/navigation";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { prisma } from "@/lib/prisma";
import {
  createStoryAction,
  deleteEventAction,
  deleteStoryAction,
  updateEventAction,
  upsertBothFixedEventsAction,
  updateStoryAction,
  updateWeddingAction,
} from "../actions";
import { DeleteButton } from "@/app/components/delete-button";
import { MediaSection } from "./media-section";
import { UploadImageField } from "./upload-image-field";
import { ActionForm } from "@/app/components/action-form";
import { SubmitButton } from "@/app/components/submit-button";

type Props = {
  params: Promise<{ weddingId: string }>;
};

function toDatetimeLocal(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const mins = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${mins}`;
}

function MediaSectionFallback() {
  return (
    <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="h-7 w-40 animate-pulse rounded bg-zinc-200" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded bg-zinc-100" />
        </div>
        <div className="h-10 w-28 animate-pulse rounded-full bg-zinc-100" />
      </div>
      <div className="mt-5 rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-5 text-sm text-zinc-500">
        Đang tải album ảnh...
      </div>
    </section>
  );
}

export default async function WeddingDetailPage({ params }: Props) {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in?redirect_url=/admin");
  }

  const { weddingId } = await params;
  let wedding: any;

  try {
    wedding = await prisma.wedding.findFirst({
      where: {
        id: weddingId,
        ownerClerkId: userId,
      },
      include: {
        events: {
          orderBy: { sortOrder: "asc" },
        },
        stories: {
          orderBy: { sortOrder: "asc" },
        },
        rsvps: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        wishes: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },

        _count: {
          select: {
            rsvps: true,
            wishes: true,
            stories: true,
          },
        },
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const isMissingNewColumns =
      message.includes("does not exist") &&
      (message.includes("groomBankQrImageUrl") || message.includes("brideBankQrImageUrl"));

    if (!isMissingNewColumns) {
      throw error;
    }

    wedding = await prisma.wedding.findFirst({
      where: {
        id: weddingId,
        ownerClerkId: userId,
      },
      select: {
        id: true,
        ownerClerkId: true,
        slug: true,
        title: true,
        groomName: true,
        brideName: true,
        eventDate: true,
        heroSubtitle: true,
        story: true,
        coverImageUrl: true,
        bankQrImageUrl: true,
        bankName: true,
        bankAccountNumber: true,
        bankAccountName: true,
        events: {
          orderBy: { sortOrder: "asc" },
        },
        stories: {
          orderBy: { sortOrder: "asc" },
        },
        rsvps: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },
        wishes: {
          orderBy: { createdAt: "desc" },
          take: 20,
        },

        _count: {
          select: {
            rsvps: true,
            wishes: true,
            stories: true,
          },
        },
      },
    });

    if (wedding) {
      wedding = {
        ...wedding,
        groomBankQrImageUrl: wedding.bankQrImageUrl,
        groomBankName: wedding.bankName,
        groomBankAccountNumber: wedding.bankAccountNumber,
        groomBankAccountName: wedding.bankAccountName,
        brideBankQrImageUrl: null,
        brideBankName: null,
        brideBankAccountNumber: null,
        brideBankAccountName: null,
      };
    }
  }

  if (!wedding) {
    notFound();
  }

  const defaultEventTemplates = [
    { key: "vu-quy", name: "Lá»… vu quy", type: "CEREMONY" as const },
    { key: "le-cuoi", name: "Lá»… cÆ°á»›i", type: "RECEPTION" as const },
  ];

  type PrimaryEventTemplate = (typeof defaultEventTemplates)[number];
  type WeddingEventLike = {
    id: string;
    name: string;
    type?: "CEREMONY" | "RECEPTION" | "OTHER" | null;
    startsAt: Date;
    venueName: string;
    address: string;
    mapsUrl?: string | null;
    sortOrder?: number | null;
  };

  type WeddingWishLike = {
    id: string;
    guestName: string;
    content: string;
  };

  type WeddingStoryLike = {
    id: string;
    dateText: string;
    title: string;
    content: string;
    imageUrl?: string | null;
    sortOrder?: number | null;
  };

  type WeddingRsvpLike = {
    id: string;
    guestName: string;
    attending: boolean;
    seats: number;
    message?: string | null;
  };

  const weddingEvents = wedding.events as WeddingEventLike[];
  const weddingWishes = wedding.wishes as WeddingWishLike[];
  const weddingStories = wedding.stories as WeddingStoryLike[];
  const weddingRsvps = wedding.rsvps as WeddingRsvpLike[];

  const primaryEventCards = defaultEventTemplates.map((template) => {
    const matched =
      weddingEvents.find((event) => event.type === template.type) ??
      weddingEvents.find((event) => event.name.toLowerCase() === template.name.toLowerCase()) ??
      null;

    return { template: template as PrimaryEventTemplate, event: matched as WeddingEventLike | null };
  }) as Array<{ template: PrimaryEventTemplate; event: WeddingEventLike | null }>;

  const primaryEventIds = new Set(primaryEventCards.filter((card) => card.event).map((card) => card.event!.id));
  const extraEvents: WeddingEventLike[] = weddingEvents.filter((event) => !primaryEventIds.has(event.id));

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Link href="/admin" className="text-sm text-zinc-500">
          Quay láº¡i trang quáº£n trá»‹
        </Link>
        <a href={`/${wedding.slug}`} target="_blank" className="rounded-full border border-zinc-300 px-4 py-2 text-sm">
          Má»Ÿ landing cÃ´ng khai
        </a>
      </div>

      <h1 className="mt-3 text-3xl font-semibold">{wedding.title}</h1>
      <p className="mt-1 text-zinc-600">
        {wedding.groomName} & {wedding.brideName}
      </p>

      <div className="mt-4 flex gap-5 text-sm text-zinc-500">
        <span>{wedding._count.rsvps} RSVP</span>
        <span>{wedding._count.wishes} lá»i chÃºc</span>
        <span>{wedding._count.stories} timeline</span>
        <span>Slug: /{wedding.slug}</span>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-zinc-200 bg-white p-5 lg:col-span-2">
          <h2 className="text-xl font-semibold">ThÃ´ng tin landing</h2>
          <ActionForm action={updateWeddingAction} successMessage="ÄÃ£ lÆ°u thÃ´ng tin chung thÃ nh cÃ´ng" className="mt-4 grid gap-4">
            <input type="hidden" name="weddingId" value={wedding.id} />

            <label className="grid gap-2">
              <span className="text-sm font-medium">TiÃªu Ä‘á»</span>
              <input name="title" defaultValue={wedding.title} className="rounded-xl border border-zinc-300 px-4 py-2.5" />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-medium">DÃ²ng phá»¥ Ä‘á» hero</span>
              <input name="heroSubtitle" defaultValue={wedding.heroSubtitle ?? ""} className="rounded-xl border border-zinc-300 px-4 py-2.5" />
            </label>

            <UploadImageField
              label="Cover image"
              fieldName="coverImageUrl"
              weddingSlug={wedding.slug}
              initialUrl={wedding.coverImageUrl ?? ""}
              note="If empty, hero will use the first image from album."
            />

            <label className="grid gap-2">
              <span className="text-sm font-medium">CÃ¢u chuyá»‡n</span>
              <textarea name="story" rows={5} defaultValue={wedding.story ?? ""} className="rounded-xl border border-zinc-300 px-4 py-2.5" />
            </label>

            <div className="mt-2 border-t border-zinc-100 pt-4">
              <p className="mb-3 text-sm font-semibold text-zinc-700">{"Má»«ng cÆ°á»›i / QR chuyá»ƒn khoáº£n"}</p>
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-xl border border-zinc-200 p-4">
                  <p className="mb-3 text-sm font-semibold text-zinc-700">{"QR ChÃº Rá»ƒ"}</p>
                  <div className="grid gap-3">
                    <UploadImageField label="QR image" fieldName="groomBankQrImageUrl" weddingSlug={wedding.slug} initialUrl={wedding.groomBankQrImageUrl ?? wedding.bankQrImageUrl ?? ""} />
                    <div className="flex flex-col gap-3">
                      <label className="grid gap-1.5">
                        <span className="text-xs font-medium text-zinc-500">{"TÃªn ngÃ¢n hÃ ng"}</span>
                        <input name="groomBankName" defaultValue={wedding.groomBankName ?? wedding.bankName ?? ""} placeholder="VCB, TCB, MB..." className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm" />
                      </label>
                      <label className="grid gap-1.5">
                        <span className="text-xs font-medium text-zinc-500">{"Sá»‘ tÃ i khoáº£n"}</span>
                        <input name="groomBankAccountNumber" defaultValue={wedding.groomBankAccountNumber ?? wedding.bankAccountNumber ?? ""} placeholder="1234567890" className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-mono" />
                      </label>
                      <label className="grid gap-1.5">
                        <span className="text-xs font-medium text-zinc-500">{"Chá»§ tÃ i khoáº£n"}</span>
                        <input name="groomBankAccountName" defaultValue={wedding.groomBankAccountName ?? wedding.bankAccountName ?? ""} placeholder="NGUYEN VAN A" className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm uppercase" />
                      </label>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 p-4">
                  <p className="mb-3 text-sm font-semibold text-zinc-700">{"QR CÃ´ DÃ¢u"}</p>
                  <div className="grid gap-3">
                    <UploadImageField label="QR image" fieldName="brideBankQrImageUrl" weddingSlug={wedding.slug} initialUrl={wedding.brideBankQrImageUrl ?? ""} />
                    <div className="flex flex-col gap-3">
                      <label className="grid gap-1.5">
                        <span className="text-xs font-medium text-zinc-500">{"TÃªn ngÃ¢n hÃ ng"}</span>
                        <input name="brideBankName" defaultValue={wedding.brideBankName ?? ""} placeholder="VCB, TCB, MB..." className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm" />
                      </label>
                      <label className="grid gap-1.5">
                        <span className="text-xs font-medium text-zinc-500">{"Sá»‘ tÃ i khoáº£n"}</span>
                        <input name="brideBankAccountNumber" defaultValue={wedding.brideBankAccountNumber ?? ""} placeholder="1234567890" className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm font-mono" />
                      </label>
                      <label className="grid gap-1.5">
                        <span className="text-xs font-medium text-zinc-500">{"Chá»§ tÃ i khoáº£n"}</span>
                        <input name="brideBankAccountName" defaultValue={wedding.brideBankAccountName ?? ""} placeholder="NGUYEN VAN A" className="rounded-xl border border-zinc-300 px-4 py-2.5 text-sm uppercase" />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <SubmitButton className="w-fit rounded-full px-5 py-2.5" loadingText="Äang lÆ°u...">LÆ°u ná»™i dung</SubmitButton>
          </ActionForm>
        </section>

        <aside className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="text-xl font-semibold">Lá»i chÃºc gáº§n Ä‘Ã¢y</h2>
          <div className="mt-4 grid gap-3">
            {weddingWishes.map((wish) => (
              <div key={wish.id} className="rounded-xl border border-zinc-200 p-3 text-sm">
                <p className="font-medium">{wish.guestName}</p>
                <p className="text-zinc-600">{wish.content}</p>
              </div>
            ))}
            {weddingWishes.length === 0 && <p className="text-zinc-500">ChÆ°a cÃ³ lá»i chÃºc nÃ o.</p>}
          </div>
        </aside>
      </div>

      <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="text-xl font-semibold">Quáº£n lÃ½ sá»± kiá»‡n</h2>
        <p className="mt-1 text-sm text-zinc-500">Lá»… vu quy vÃ  Lá»… cÆ°á»›i.</p>
        
        <ActionForm action={upsertBothFixedEventsAction} successMessage="ÄÃ£ cáº­p nháº­t Lá»… vu quy vÃ  Tiá»‡c cÆ°á»›i">
          <input type="hidden" name="weddingId" value={wedding.id} />
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {primaryEventCards.map(({ template, event }) => (
              <div key={template.key} className="relative rounded-xl border border-zinc-200 p-4">
                <p className="mb-3 text-sm font-semibold text-zinc-700">{template.name}</p>

                <div className="grid gap-3">
                  <label className="grid gap-1">
                    <span className="text-xs text-zinc-500">TÃªn sá»± kiá»‡n</span>
                    <input name={`${template.type}_name`} defaultValue={event?.name ?? template.name} className="rounded-lg border border-zinc-300 px-3 py-2" />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs text-zinc-500">Thá»i gian</span>
                    <input type="datetime-local" name={`${template.type}_startsAt`} defaultValue={toDatetimeLocal(event?.startsAt ?? wedding.eventDate)} className="rounded-lg border border-zinc-300 px-3 py-2" />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs text-zinc-500">Äá»‹a Ä‘iá»ƒm</span>
                    <input required name={`${template.type}_venueName`} defaultValue={event?.venueName ?? ""} placeholder="TÃªn Ä‘á»‹a Ä‘iá»ƒm" className="rounded-lg border border-zinc-300 px-3 py-2" />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs text-zinc-500">Äá»‹a chá»‰</span>
                    <input required name={`${template.type}_address`} defaultValue={event?.address ?? ""} placeholder="Äá»‹a chá»‰" className="rounded-lg border border-zinc-300 px-3 py-2" />
                  </label>
                  <label className="grid gap-1">
                    <span className="text-xs text-zinc-500">Google Maps URL</span>
                    <input name={`${template.type}_mapsUrl`} defaultValue={event?.mapsUrl ?? ""} placeholder="Google Maps URL" className="rounded-lg border border-zinc-300 px-3 py-2" />
                  </label>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-5 text-right">
            <SubmitButton className="w-full lg:w-fit rounded-lg px-8 py-2.5" loadingText="Äang lÆ°u...">
              LÆ°u toÃ n bá»™ sá»± kiá»‡n chÃ­nh
            </SubmitButton>
          </div>
        </ActionForm>
        {extraEvents.length > 0 && (
          <div className="mt-6">
            <p className="mb-3 text-sm font-semibold text-zinc-700">Sá»± kiá»‡n khÃ¡c</p>
            <div className="grid gap-4">
              {extraEvents.map((event) => (
                <div key={event.id} className="rounded-xl border border-zinc-200 p-4">
                  <ActionForm action={updateEventAction} successMessage="ÄÃ£ lÆ°u sá»± kiá»‡n" className="grid gap-3 md:grid-cols-2">
                    <input type="hidden" name="weddingId" value={wedding.id} />
                    <input type="hidden" name="eventId" value={event.id} />

                    <label className="grid gap-1">
                      <span className="text-xs text-zinc-500">TÃªn sá»± kiá»‡n</span>
                      <input name="name" defaultValue={event.name} className="rounded-lg border border-zinc-300 px-3 py-2" />
                    </label>
                    <label className="grid gap-1">
                      <span className="text-xs text-zinc-500">Thá»i gian</span>
                      <input type="datetime-local" name="startsAt" defaultValue={toDatetimeLocal(event.startsAt)} className="rounded-lg border border-zinc-300 px-3 py-2" />
                    </label>
                    <label className="grid gap-1">
                      <span className="text-xs text-zinc-500">Äá»‹a Ä‘iá»ƒm</span>
                      <input name="venueName" defaultValue={event.venueName} className="rounded-lg border border-zinc-300 px-3 py-2" />
                    </label>
                    <label className="grid gap-1">
                      <span className="text-xs text-zinc-500">Äá»‹a chá»‰</span>
                      <input name="address" defaultValue={event.address} className="rounded-lg border border-zinc-300 px-3 py-2" />
                    </label>
                    <label className="grid gap-1 md:col-span-2">
                      <span className="text-xs text-zinc-500">Google Maps URL</span>
                      <input name="mapsUrl" defaultValue={event.mapsUrl ?? ""} className="rounded-lg border border-zinc-300 px-3 py-2" />
                    </label>

                    <SubmitButton className="md:col-span-2 rounded-full w-fit">LÆ°u sá»± kiá»‡n</SubmitButton>
                  </ActionForm>

                  <ActionForm action={deleteEventAction} successMessage="ÄÃ£ xÃ³a sá»± kiá»‡n" className="mt-2 text-right">
                    <input type="hidden" name="weddingId" value={wedding.id} />
                    <input type="hidden" name="eventId" value={event.id} />
                    <SubmitButton variant="danger" className="rounded-full px-4 py-2.5 text-sm">XÃ³a sá»± kiá»‡n nÃ y</SubmitButton>
                  </ActionForm>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      <section className="mt-8 rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="text-xl font-semibold">Quáº£n lÃ½ timeline</h2>

        <ActionForm action={createStoryAction} resetOnSuccess={true} successMessage="ÄÃ£ thÃªm má»‘c Timeline má»›i" className="mt-4 grid gap-3 rounded-xl border border-zinc-200 p-4 md:grid-cols-2">
          <input type="hidden" name="weddingId" value={wedding.id} />
          <label className="grid gap-1">
            <span className="text-xs text-zinc-500">Má»‘c thá»i gian</span>
            <input required name="dateText" placeholder="ThÃ¡ng 05/2019" className="rounded-lg border border-zinc-300 px-3 py-2" />
          </label>
          <label className="grid gap-1">
            <span className="text-xs text-zinc-500">TiÃªu Ä‘á»</span>
            <input required name="title" placeholder="NgÃ y Ä‘áº§u gáº·p gá»¡" className="rounded-lg border border-zinc-300 px-3 py-2" />
          </label>
          <label className="grid gap-1 md:col-span-2">
            <span className="text-xs text-zinc-500">Ná»™i dung</span>
            <textarea required name="content" rows={3} className="rounded-lg border border-zinc-300 px-3 py-2" />
          </label>
          <label className="grid gap-1 md:col-span-2">
            <span className="text-xs text-zinc-500">áº¢nh timeline (URL, tÃ¹y chá»n)</span>
            <input name="imageUrl" placeholder="https://..." className="rounded-lg border border-zinc-300 px-3 py-2" />
          </label>
          <div className="md:col-span-2">
            <SubmitButton className="rounded-full px-5 py-2.5" loadingText="Äang thÃªm...">ThÃªm má»‘c timeline</SubmitButton>
          </div>
        </ActionForm>

        <div className="mt-4 grid gap-4">
          {weddingStories.map((story) => (
            <div key={story.id} className="rounded-xl border border-zinc-200 p-4">
              <ActionForm action={updateStoryAction} successMessage="ÄÃ£ lÆ°u thÃ´ng tin Timeline" className="grid gap-3 md:grid-cols-2">
                <input type="hidden" name="weddingId" value={wedding.id} />
                <input type="hidden" name="storyId" value={story.id} />

                <label className="grid gap-1">
                  <span className="text-xs text-zinc-500">Má»‘c thá»i gian</span>
                  <input name="dateText" defaultValue={story.dateText} className="rounded-lg border border-zinc-300 px-3 py-2" />
                </label>
                <label className="grid gap-1">
                  <span className="text-xs text-zinc-500">TiÃªu Ä‘á»</span>
                  <input name="title" defaultValue={story.title} className="rounded-lg border border-zinc-300 px-3 py-2" />
                </label>
                <label className="grid gap-1 md:col-span-2">
                  <span className="text-xs text-zinc-500">Ná»™i dung</span>
                  <textarea name="content" rows={3} defaultValue={story.content} className="rounded-lg border border-zinc-300 px-3 py-2" />
                </label>
                <label className="grid gap-1 md:col-span-2">
                  <span className="text-xs text-zinc-500">áº¢nh timeline (URL)</span>
                  <input name="imageUrl" defaultValue={story.imageUrl ?? ""} className="rounded-lg border border-zinc-300 px-3 py-2" />
                </label>

                <div className="flex gap-2 md:col-span-2">
                  <SubmitButton className="rounded-full w-fit">LÆ°u sá»­a Ä‘á»•i</SubmitButton>
                </div>
              </ActionForm>

              <ActionForm action={deleteStoryAction} successMessage="Má»‘c timeline Ä‘Ã£ bá»‹ xÃ³a" className="mt-2 pt-2 border-t border-zinc-100 text-right">
                <input type="hidden" name="weddingId" value={wedding.id} />
                <input type="hidden" name="storyId" value={story.id} />
                <DeleteButton
                  confirmMessage="XÃ³a má»‘c timeline nÃ y?"
                  label="XÃ³a timeline"
                  className="rounded-full border border-red-300 px-4 py-2 text-sm text-red-700"
                />
              </ActionForm>
            </div>
          ))}

          {weddingStories.length === 0 && <p className="text-zinc-500">ChÆ°a cÃ³ má»‘c timeline nÃ o.</p>}
        </div>
      </section>

      <Suspense fallback={<MediaSectionFallback />}>
        <MediaSection weddingId={wedding.id} weddingSlug={wedding.slug} />
      </Suspense>

      <section className="mt-8 grid gap-6 lg:grid-cols-2">
        <article className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="text-xl font-semibold">RSVP gáº§n Ä‘Ã¢y</h2>
          <div className="mt-4 grid gap-3">
            {weddingRsvps.map((rsvp) => (
              <div key={rsvp.id} className="rounded-xl border border-zinc-200 p-3 text-sm">
                <p className="font-medium">{rsvp.guestName}</p>
                <p className="text-zinc-600">
                  {rsvp.attending ? "Sáº½ tham dá»±" : "KhÃ´ng tham dá»±"} â€¢ {rsvp.seats} ngÆ°á»i
                </p>
                {rsvp.message && <p className="text-zinc-500">{rsvp.message}</p>}
              </div>
            ))}
            {weddingRsvps.length === 0 && <p className="text-zinc-500">ChÆ°a cÃ³ RSVP nÃ o.</p>}
          </div>
        </article>

        <article className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="text-xl font-semibold">Lá»i chÃºc gáº§n Ä‘Ã¢y</h2>
          <div className="mt-4 grid gap-3">
            {weddingWishes.map((wish) => (
              <div key={wish.id} className="rounded-xl border border-zinc-200 p-3 text-sm">
                <p className="font-medium">{wish.guestName}</p>
                <p className="text-zinc-600">{wish.content}</p>
              </div>
            ))}
            {weddingWishes.length === 0 && <p className="text-zinc-500">ChÆ°a cÃ³ lá»i chÃºc nÃ o.</p>}
          </div>
        </article>
      </section>
    </main>
  );
}





