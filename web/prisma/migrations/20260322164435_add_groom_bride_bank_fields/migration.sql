-- AlterTable
ALTER TABLE "Wedding" ADD COLUMN     "brideBankAccountName" TEXT,
ADD COLUMN     "brideBankAccountNumber" TEXT,
ADD COLUMN     "brideBankName" TEXT,
ADD COLUMN     "brideBankQrImageUrl" TEXT,
ADD COLUMN     "groomBankAccountName" TEXT,
ADD COLUMN     "groomBankAccountNumber" TEXT,
ADD COLUMN     "groomBankName" TEXT,
ADD COLUMN     "groomBankQrImageUrl" TEXT;

-- CreateTable
CREATE TABLE "Story" (
    "id" TEXT NOT NULL,
    "weddingId" TEXT NOT NULL,
    "dateText" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "imageUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "Story_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Story_weddingId_sortOrder_idx" ON "Story"("weddingId", "sortOrder");

-- AddForeignKey
ALTER TABLE "Story" ADD CONSTRAINT "Story_weddingId_fkey" FOREIGN KEY ("weddingId") REFERENCES "Wedding"("id") ON DELETE CASCADE ON UPDATE CASCADE;
