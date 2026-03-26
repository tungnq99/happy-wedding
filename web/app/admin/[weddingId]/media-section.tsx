import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/prisma";
import { MediaManager } from "./media-manager";

type Props = {
  weddingId: string;
  weddingSlug: string;
};

export async function MediaSection({ weddingId, weddingSlug }: Props) {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const wedding = await prisma.wedding.findFirst({
    where: {
      id: weddingId,
      ownerClerkId: userId,
    },
    select: {
      media: {
        where: { type: "IMAGE" },
        orderBy: { sortOrder: "asc" },
        select: {
          id: true,
          url: true,
          caption: true,
          sortOrder: true,
        },
      },
    },
  });

  if (!wedding) {
    return null;
  }

  return <MediaManager weddingId={weddingId} weddingSlug={weddingSlug} media={wedding.media} />;
}
