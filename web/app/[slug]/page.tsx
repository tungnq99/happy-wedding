import { notFound } from "next/navigation";
import { InvitationPage } from "@/app/components/invitation-page";
import { prisma } from "@/lib/prisma";

type Props = {
  params: Promise<{ slug: string }>;
};

export default async function LandingPage({ params }: Props) {
  const { slug } = await params;

  let wedding: any;

  try {
    wedding = await prisma.wedding.findUnique({
      where: { slug },
      include: {
        events: {
          orderBy: { sortOrder: "asc" },
        },
        stories: {
          orderBy: { sortOrder: "asc" },
        },
        wishes: {
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
          take: 8,
        },
        media: {
          where: { type: "IMAGE" },
          orderBy: { sortOrder: "asc" },
          take: 12,
        },
        theme: true,
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

    wedding = await prisma.wedding.findUnique({
      where: { slug },
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
        wishes: {
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
          take: 8,
        },
        media: {
          where: { type: "IMAGE" },
          orderBy: { sortOrder: "asc" },
          take: 12,
        },
        theme: true,
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

  return <InvitationPage data={wedding} />;
}

